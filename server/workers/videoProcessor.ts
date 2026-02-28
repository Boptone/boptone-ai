/**
 * Bops Video Processor Worker
 *
 * BullMQ worker that transcodes raw Bop video uploads into adaptive HLS streams.
 * Architecture:
 *   1. Download raw video from S3 to a temp directory
 *   2. Run FFmpeg to produce HLS at 360p, 720p, 1080p with master playlist
 *   3. Run FFmpeg to extract a thumbnail JPEG at the 3-second mark
 *   4. Upload all HLS segments + playlists to S3 under bops/{bopId}/hls/
 *   5. Upload thumbnail to S3 under bops/{bopId}/thumb.jpg
 *   6. Update bopsVideos record: hlsUrl, thumbnailUrl, processingStatus = 'ready'
 *   7. Clean up temp directory
 *
 * On error: sets processingStatus = 'error' with error message.
 *
 * Queue name: "video-processing"
 * Job payload: { bopId: number, videoKey: string, artistId: number }
 */

import { Worker, Queue, type Job } from "bullmq";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";
import { storagePut, randomSuffix } from "../storage";
import { getDb } from "../db";
import { bopsVideos } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// ─── Queue Configuration ─────────────────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const videoProcessingQueue = new Queue("video-processing", {
  connection: {
    host: new URL(REDIS_URL).hostname,
    port: parseInt(new URL(REDIS_URL).port || "6379"),
    password: new URL(REDIS_URL).password || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5s, 10s, 20s
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

// ─── Job Payload Type ─────────────────────────────────────────────────────────
export interface VideoProcessingJob {
  bopId: number;
  videoKey: string;
  artistId: number;
}

// ─── HLS Rendition Config ─────────────────────────────────────────────────────
const HLS_RENDITIONS = [
  { name: "360p",  height: 360,  videoBitrate: "800k",  audioBitrate: "96k"  },
  { name: "720p",  height: 720,  videoBitrate: "2500k", audioBitrate: "128k" },
  { name: "1080p", height: 1080, videoBitrate: "5000k", audioBitrate: "192k" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Download a file from S3 (via public URL) to a local temp path.
 */
async function downloadFromS3(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download video from S3: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(destPath, buffer);
}

/**
 * Transcode a single rendition to HLS using FFmpeg.
 * Returns the path to the .m3u8 playlist for this rendition.
 */
function transcodeRendition(
  inputPath: string,
  outputDir: string,
  rendition: typeof HLS_RENDITIONS[0]
): Promise<string> {
  const playlistPath = path.join(outputDir, `${rendition.name}.m3u8`);
  const segmentPattern = path.join(outputDir, `${rendition.name}_%03d.ts`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .videoBitrate(rendition.videoBitrate)
      .audioBitrate(rendition.audioBitrate)
      .size(`?x${rendition.height}`) // Maintain aspect ratio, set height
      .outputOptions([
        "-hls_time 4",              // 4-second segments
        "-hls_list_size 0",         // Keep all segments in playlist
        "-hls_segment_type mpegts",
        `-hls_segment_filename ${segmentPattern}`,
        "-preset fast",
        "-profile:v main",
        "-level 3.1",
        "-movflags +faststart",
        "-g 48",                    // Keyframe every 48 frames (2s at 24fps)
        "-sc_threshold 0",
      ])
      .output(playlistPath)
      .on("end", () => resolve(playlistPath))
      .on("error", reject)
      .run();
  });
}

/**
 * Extract a thumbnail JPEG at the 3-second mark.
 */
function extractThumbnail(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .seekInput(3)
      .frames(1)
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", reject)
      .run();
  });
}

/**
 * Build the HLS master playlist that references all renditions.
 */
function buildMasterPlaylist(renditions: typeof HLS_RENDITIONS): string {
  const lines = ["#EXTM3U", "#EXT-X-VERSION:3", ""];
  for (const r of renditions) {
    const bandwidth = parseInt(r.videoBitrate) * 1000;
    lines.push(`#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=?x${r.height},NAME="${r.name}"`);
    lines.push(`${r.name}.m3u8`);
    lines.push("");
  }
  return lines.join("\n");
}

/**
 * Upload all files in a directory to S3 under a given prefix.
 * Returns a map of filename → S3 URL.
 */
async function uploadDirectoryToS3(
  localDir: string,
  s3Prefix: string
): Promise<Map<string, string>> {
  const files = await fs.promises.readdir(localDir);
  const urlMap = new Map<string, string>();

  for (const filename of files) {
    const localPath = path.join(localDir, filename);
    const s3Key = `${s3Prefix}/${filename}`;
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === ".m3u8" ? "application/x-mpegURL"
      : ext === ".ts" ? "video/MP2T"
      : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg"
      : "application/octet-stream";

    const buffer = await fs.promises.readFile(localPath);
    const result = await storagePut(s3Key, buffer, contentType);
    urlMap.set(filename, result.url);
  }

  return urlMap;
}

// ─── Worker ───────────────────────────────────────────────────────────────────

async function processVideoJob(job: Job<VideoProcessingJob>): Promise<void> {
  const { bopId, videoKey, artistId } = job.data;
  const tempDir = path.join(os.tmpdir(), `bop-${bopId}-${Date.now()}`);

  console.log(`[VideoProcessor] Starting job for Bop ${bopId} (artist ${artistId})`);

  const db = await getDb();
  if (!db) {
    throw new Error("Database unavailable — cannot process video");
  }

  // Mark as processing
  await db.update(bopsVideos)
    .set({ processingStatus: "processing" })
    .where(eq(bopsVideos.id, bopId));

  try {
    // 1. Create temp directory
    await fs.promises.mkdir(tempDir, { recursive: true });
    const rawVideoPath = path.join(tempDir, "raw.mp4");
    const hlsDir = path.join(tempDir, "hls");
    const thumbPath = path.join(tempDir, "thumb.jpg");
    await fs.promises.mkdir(hlsDir, { recursive: true });

    // 2. Get the video URL from the database
    const [bop] = await db.select({ videoUrl: bopsVideos.videoUrl })
      .from(bopsVideos)
      .where(eq(bopsVideos.id, bopId))
      .limit(1);

    if (!bop) {
      throw new Error(`Bop ${bopId} not found in database`);
    }

    // 3. Download raw video from S3
    await job.updateProgress(10);
    console.log(`[VideoProcessor] Downloading raw video for Bop ${bopId}`);
    await downloadFromS3(bop.videoUrl, rawVideoPath);

    // 4. Transcode all renditions
    await job.updateProgress(20);
    console.log(`[VideoProcessor] Transcoding ${HLS_RENDITIONS.length} renditions for Bop ${bopId}`);

    for (let i = 0; i < HLS_RENDITIONS.length; i++) {
      const rendition = HLS_RENDITIONS[i];
      console.log(`[VideoProcessor] Transcoding ${rendition.name} for Bop ${bopId}`);
      await transcodeRendition(rawVideoPath, hlsDir, rendition);
      await job.updateProgress(20 + Math.floor((i + 1) / HLS_RENDITIONS.length * 40));
    }

    // 5. Write master playlist
    const masterPlaylist = buildMasterPlaylist(HLS_RENDITIONS);
    await fs.promises.writeFile(path.join(hlsDir, "master.m3u8"), masterPlaylist);

    // 6. Extract thumbnail
    await job.updateProgress(65);
    console.log(`[VideoProcessor] Extracting thumbnail for Bop ${bopId}`);
    await extractThumbnail(rawVideoPath, thumbPath);

    // 7. Upload HLS output to S3
    await job.updateProgress(70);
    const hlsS3Prefix = `bops/${bopId}/hls`;
    console.log(`[VideoProcessor] Uploading HLS segments to S3 for Bop ${bopId}`);
    const hlsUrlMap = await uploadDirectoryToS3(hlsDir, hlsS3Prefix);

    // 8. Upload thumbnail to S3
    await job.updateProgress(90);
    const thumbS3Key = `bops/${bopId}/thumb-${randomSuffix()}.jpg`;
    const thumbBuffer = await fs.promises.readFile(thumbPath);
    const thumbResult = await storagePut(thumbS3Key, thumbBuffer, "image/jpeg");

    // 9. Get the master playlist URL
    const masterUrl = hlsUrlMap.get("master.m3u8");
    if (!masterUrl) {
      throw new Error("Master playlist was not uploaded to S3");
    }

    // 10. Update database record
    await db.update(bopsVideos)
      .set({
        hlsKey: `${hlsS3Prefix}/master.m3u8`,
        hlsUrl: masterUrl,
        thumbnailKey: thumbS3Key,
        thumbnailUrl: thumbResult.url,
        processingStatus: "ready",
        processedAt: new Date(),
        processingError: null,
      })
      .where(eq(bopsVideos.id, bopId));

    await job.updateProgress(100);
    console.log(`[VideoProcessor] ✓ Bop ${bopId} processed successfully. HLS: ${masterUrl}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[VideoProcessor] ✗ Failed to process Bop ${bopId}:`, errorMessage);

    // Mark as failed in database
    await db.update(bopsVideos)
      .set({
        processingStatus: "failed",
        processingError: errorMessage.slice(0, 1000),
      })
      .where(eq(bopsVideos.id, bopId));

    throw error; // Re-throw so BullMQ can retry
  } finally {
    // Clean up temp directory
    await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {
      console.warn(`[VideoProcessor] Failed to clean up temp dir: ${tempDir}`);
    });
  }
}

// ─── Worker Initialization ────────────────────────────────────────────────────

let workerInstance: Worker | null = null;

export function startVideoProcessorWorker(): Worker {
  if (workerInstance) {
    console.log("[VideoProcessor] Worker already running");
    return workerInstance;
  }

  workerInstance = new Worker<VideoProcessingJob>(
    "video-processing",
    processVideoJob,
    {
      connection: {
        host: new URL(REDIS_URL).hostname,
        port: parseInt(new URL(REDIS_URL).port || "6379"),
        password: new URL(REDIS_URL).password || undefined,
      },
      concurrency: 2,  // Process 2 videos simultaneously
      limiter: {
        max: 5,
        duration: 60_000, // Max 5 jobs per minute (FFmpeg is CPU-intensive)
      },
    }
  );

  workerInstance.on("completed", (job) => {
    console.log(`[VideoProcessor] Job ${job.id} completed for Bop ${job.data.bopId}`);
  });

  workerInstance.on("failed", (job, err) => {
    console.error(`[VideoProcessor] Job ${job?.id} failed for Bop ${job?.data.bopId}:`, err.message);
  });

  workerInstance.on("error", (err) => {
    console.error("[VideoProcessor] Worker error:", err);
  });

  console.log("[VideoProcessor] Worker started (concurrency: 2)");
  return workerInstance;
}

export async function stopVideoProcessorWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.close();
    workerInstance = null;
    console.log("[VideoProcessor] Worker stopped");
  }
}

/**
 * Enqueue a video processing job.
 * Call this immediately after a new Bop is created.
 */
export async function enqueueVideoProcessing(
  bopId: number,
  videoKey: string,
  artistId: number
): Promise<void> {
  await videoProcessingQueue.add(
    "process-video",
    { bopId, videoKey, artistId },
    { jobId: `bop-${bopId}` } // Prevent duplicate jobs for the same Bop
  );
  console.log(`[VideoProcessor] Enqueued processing job for Bop ${bopId}`);
}
