/**
 * DISTRO-A3: Transcode Queue Worker
 *
 * In-process background job queue that:
 *   1. Polls the DB for queued transcode jobs every POLL_INTERVAL_MS
 *   2. Processes up to MAX_CONCURRENT jobs in parallel
 *   3. Downloads the lossless master from S3, transcodes it with FFmpeg
 *   4. Uploads the output variant back to S3
 *   5. Updates the DB job record (done / error / retry)
 *   6. Cleans up all temp files
 *
 * The worker starts automatically when the server boots (via startTranscodeWorker())
 * and can be stopped gracefully via stopTranscodeWorker().
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  transcodeAudio,
  cleanupTranscodeFile,
  TRANSCODE_CONFIGS,
  type TranscodeFormat,
} from "./audioTranscoder";
import {
  getPendingTranscodeJobs,
  markTranscodeJobProcessing,
  markTranscodeJobDone,
  markTranscodeJobError,
  markTranscodeJobSkipped,
  getTranscodeJobsByTrack,
} from "../db/transcodeJobs";
import { getDb } from "../db";
import { bapTracks } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";

// ─── Config ───────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 15_000;   // Check for new jobs every 15 seconds
const MAX_CONCURRENT   = 2;         // Max parallel FFmpeg processes
const BATCH_SIZE       = MAX_CONCURRENT * 2; // Jobs fetched per poll cycle

// ─── Worker State ─────────────────────────────────────────────────────────────

let workerTimer: NodeJS.Timeout | null = null;
let activeJobs = 0;
let isRunning = false;

// ─── S3 Upload Helper ─────────────────────────────────────────────────────────

async function uploadTranscodeToS3(
  localPath: string,
  trackId: number,
  format: TranscodeFormat
): Promise<{ key: string; url: string }> {
  const config = TRANSCODE_CONFIGS[format];
  const buffer = fs.readFileSync(localPath);
  const key = `transcodes/${trackId}/${format}-${Date.now()}.${config.ext}`;

  const mimeMap: Record<string, string> = {
    m4a:  "audio/mp4",
    ogg:  "audio/ogg",
    flac: "audio/flac",
    mp3:  "audio/mpeg",
    wav:  "audio/wav",
  };

  const contentType = mimeMap[config.ext] ?? "audio/octet-stream";
  const result = await storagePut(key, buffer, contentType);
  return { key: result.key, url: result.url };
}

// ─── Single Job Processor ─────────────────────────────────────────────────────

async function processJob(job: {
  id: number;
  trackId: number;
  format: string;
}): Promise<void> {
  const format = job.format as TranscodeFormat;
  let outputPath: string | null = null;

  try {
    // 1. Mark as processing
    await markTranscodeJobProcessing(job.id);

    // 2. Fetch the source audio URL from the track record
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const [track] = await db
      .select({ audioUrl: bapTracks.audioUrl, audioFormat: bapTracks.audioFormat })
      .from(bapTracks)
      .where(eq(bapTracks.id, job.trackId))
      .limit(1);

    if (!track) throw new Error(`Track ${job.trackId} not found`);
    if (!track.audioUrl) throw new Error(`Track ${job.trackId} has no audioUrl`);

    // 3. Skip if source is already in the target format (avoid lossy re-encoding)
    const sourceExt = path.extname(new URL(track.audioUrl).pathname).replace(".", "").toLowerCase();
    const targetExt = TRANSCODE_CONFIGS[format].ext;

    if (sourceExt === targetExt) {
      await markTranscodeJobSkipped(job.id, `Source already in ${format} format`);
      console.log(`[TranscodeQueue] Skipped job ${job.id} — source already ${format}`);
      return;
    }

    // 4. Transcode
    console.log(`[TranscodeQueue] Starting job ${job.id}: track ${job.trackId} → ${format}`);
    const result = await transcodeAudio(track.audioUrl, format, os.tmpdir());
    outputPath = result.outputPath;

    // 5. Upload to S3
    const { key, url } = await uploadTranscodeToS3(outputPath, job.trackId, format);

    // 6. Mark done
    await markTranscodeJobDone(job.id, key, url, result.fileSizeBytes);
    console.log(`[TranscodeQueue] Done job ${job.id}: ${format} → ${url} (${(result.fileSizeBytes / 1024 / 1024).toFixed(1)} MB, ${result.durationMs}ms)`);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[TranscodeQueue] Error job ${job.id} [${format}]: ${message}`);
    await markTranscodeJobError(job.id, message);
  } finally {
    if (outputPath) cleanupTranscodeFile(outputPath);
    activeJobs--;
  }
}

// ─── Poll Cycle ───────────────────────────────────────────────────────────────

async function pollAndProcess(): Promise<void> {
  if (!isRunning) return;

  const available = MAX_CONCURRENT - activeJobs;
  if (available <= 0) return;

  try {
    const jobs = await getPendingTranscodeJobs(Math.min(available, BATCH_SIZE));
    if (jobs.length === 0) return;

    console.log(`[TranscodeQueue] Picked up ${jobs.length} job(s)`);

    for (const job of jobs) {
      if (activeJobs >= MAX_CONCURRENT) break;
      activeJobs++;
      // Fire and forget — errors are caught inside processJob
      processJob(job).catch((e) =>
        console.error("[TranscodeQueue] Unhandled processJob error:", e)
      );
    }
  } catch (err) {
    console.error("[TranscodeQueue] Poll error:", err);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Start the background transcode worker. Safe to call multiple times. */
export function startTranscodeWorker(): void {
  if (isRunning) return;
  isRunning = true;
  activeJobs = 0;

  const tick = () => {
    pollAndProcess().finally(() => {
      if (isRunning) {
        workerTimer = setTimeout(tick, POLL_INTERVAL_MS);
      }
    });
  };

  // First poll after a short delay to let the server fully boot
  workerTimer = setTimeout(tick, 5_000);
  console.log("[TranscodeQueue] Worker started — polling every", POLL_INTERVAL_MS / 1000, "seconds");
}

/** Gracefully stop the background worker. */
export function stopTranscodeWorker(): void {
  isRunning = false;
  if (workerTimer) {
    clearTimeout(workerTimer);
    workerTimer = null;
  }
  console.log("[TranscodeQueue] Worker stopped");
}

/** Current worker status (for health checks). */
export function getTranscodeWorkerStatus(): {
  running: boolean;
  activeJobs: number;
  maxConcurrent: number;
  pollIntervalMs: number;
} {
  return {
    running: isRunning,
    activeJobs,
    maxConcurrent: MAX_CONCURRENT,
    pollIntervalMs: POLL_INTERVAL_MS,
  };
}
