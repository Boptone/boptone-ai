/**
 * DISTRO-A3: Audio Transcoder Service
 *
 * Converts lossless/high-quality master audio files into DSP-specific
 * delivery formats using FFmpeg. Each format targets a specific platform's
 * technical requirements for optimal streaming quality.
 *
 * Supported output formats:
 *   aac_256    — AAC 256 kbps, 44.1 kHz stereo  (Apple Music, iTunes)
 *   ogg_vorbis — Ogg Vorbis q9 (~320 kbps)       (Spotify)
 *   flac_16    — FLAC 16-bit / 44.1 kHz stereo   (Tidal, Amazon HD)
 *   mp3_320    — MP3 320 kbps CBR                 (Universal fallback)
 *   wav_24_96  — WAV 24-bit / 96 kHz stereo       (Boptone native premium)
 */

import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as https from "https";
import * as http from "http";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TranscodeFormat =
  | "aac_256"
  | "ogg_vorbis"
  | "flac_16"
  | "mp3_320"
  | "wav_24_96";

export interface TranscodeConfig {
  /** Output file extension */
  ext: string;
  /** FFmpeg output format name */
  format: string;
  /** Audio codec */
  codec: string;
  /** Additional FFmpeg audio options */
  audioOptions: string[];
  /** Human-readable label */
  label: string;
  /** Target DSP(s) */
  dsps: string[];
}

export interface TranscodeResult {
  format: TranscodeFormat;
  outputPath: string;
  fileSizeBytes: number;
  durationMs: number;
}

export interface TranscodeError {
  format: TranscodeFormat;
  error: string;
}

// ─── Format Configs ───────────────────────────────────────────────────────────

export const TRANSCODE_CONFIGS: Record<TranscodeFormat, TranscodeConfig> = {
  aac_256: {
    ext: "m4a",
    format: "ipod",
    codec: "aac",
    audioOptions: ["-b:a", "256k", "-ar", "44100", "-ac", "2"],
    label: "AAC 256 kbps",
    dsps: ["Apple Music", "iTunes"],
  },
  ogg_vorbis: {
    ext: "ogg",
    format: "ogg",
    codec: "libvorbis",
    audioOptions: ["-q:a", "9", "-ar", "44100", "-ac", "2"],
    label: "Ogg Vorbis ~320 kbps",
    dsps: ["Spotify"],
  },
  flac_16: {
    ext: "flac",
    format: "flac",
    codec: "flac",
    audioOptions: ["-sample_fmt", "s16", "-ar", "44100", "-ac", "2"],
    label: "FLAC 16-bit / 44.1 kHz",
    dsps: ["Tidal", "Amazon HD"],
  },
  mp3_320: {
    ext: "mp3",
    format: "mp3",
    codec: "libmp3lame",
    audioOptions: ["-b:a", "320k", "-ar", "44100", "-ac", "2"],
    label: "MP3 320 kbps",
    dsps: ["Universal fallback"],
  },
  wav_24_96: {
    ext: "wav",
    format: "wav",
    codec: "pcm_s24le",
    audioOptions: ["-ar", "96000", "-ac", "2"],
    label: "WAV 24-bit / 96 kHz",
    dsps: ["Boptone Native Premium"],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Download a file from a URL (http or https) to a local temp path.
 */
export async function downloadToTemp(url: string, suffix: string): Promise<string> {
  const tmpPath = path.join(os.tmpdir(), `boptone-src-${Date.now()}-${Math.random().toString(36).slice(2)}${suffix}`);
  const file = createWriteStream(tmpPath);

  await new Promise<void>((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download source: HTTP ${response.statusCode}`));
        return;
      }
      pipeline(response, file).then(resolve).catch(reject);
    }).on("error", reject);
  });

  return tmpPath;
}

/**
 * Probe an audio file and return basic metadata.
 */
export function probeAudio(filePath: string): Promise<{
  durationSec: number;
  codec: string;
  sampleRate: number;
  channels: number;
  bitrate: number;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const stream = metadata.streams.find((s) => s.codec_type === "audio");
      resolve({
        durationSec: parseFloat(String(metadata.format.duration ?? "0")),
        codec: stream?.codec_name ?? "unknown",
        sampleRate: parseInt(String(stream?.sample_rate ?? "44100"), 10),
        channels: stream?.channels ?? 2,
        bitrate: parseInt(String(metadata.format.bit_rate ?? "0"), 10),
      });
    });
  });
}

// ─── Core Transcoder ──────────────────────────────────────────────────────────

/**
 * Transcode a single audio file to the specified DSP format.
 *
 * @param sourceUrl   S3 URL (or local path) of the lossless master
 * @param format      Target DSP format key
 * @param outputDir   Directory to write the output file (defaults to OS temp)
 * @returns           TranscodeResult with output path and metadata
 */
export async function transcodeAudio(
  sourceUrl: string,
  format: TranscodeFormat,
  outputDir?: string
): Promise<TranscodeResult> {
  const config = TRANSCODE_CONFIGS[format];
  const dir = outputDir ?? os.tmpdir();
  const basename = `boptone-${format}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const outputPath = path.join(dir, `${basename}.${config.ext}`);

  // Determine source — download from URL if needed
  let sourcePath: string;
  let isTemp = false;

  if (sourceUrl.startsWith("http://") || sourceUrl.startsWith("https://")) {
    const ext = path.extname(new URL(sourceUrl).pathname) || ".audio";
    sourcePath = await downloadToTemp(sourceUrl, ext);
    isTemp = true;
  } else {
    sourcePath = sourceUrl;
  }

  const startMs = Date.now();

  try {
    await new Promise<void>((resolve, reject) => {
      const cmd = ffmpeg(sourcePath)
        .noVideo()
        .audioCodec(config.codec)
        .outputOptions(config.audioOptions)
        .format(config.format)
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(new Error(`FFmpeg [${format}]: ${err.message}`)));

      cmd.run();
    });

    const stat = fs.statSync(outputPath);
    return {
      format,
      outputPath,
      fileSizeBytes: stat.size,
      durationMs: Date.now() - startMs,
    };
  } finally {
    if (isTemp && fs.existsSync(sourcePath)) {
      fs.unlinkSync(sourcePath);
    }
  }
}

/**
 * Transcode a source file to all 5 DSP formats in parallel.
 * Returns an array of results and errors (never throws).
 */
export async function transcodeAllFormats(
  sourceUrl: string,
  outputDir?: string
): Promise<{
  results: TranscodeResult[];
  errors: TranscodeError[];
}> {
  const formats: TranscodeFormat[] = ["aac_256", "ogg_vorbis", "flac_16", "mp3_320", "wav_24_96"];

  const settled = await Promise.allSettled(
    formats.map((fmt) => transcodeAudio(sourceUrl, fmt, outputDir))
  );

  const results: TranscodeResult[] = [];
  const errors: TranscodeError[] = [];

  settled.forEach((outcome, i) => {
    if (outcome.status === "fulfilled") {
      results.push(outcome.value);
    } else {
      errors.push({
        format: formats[i],
        error: outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason),
      });
    }
  });

  return { results, errors };
}

/**
 * Clean up a local transcode output file.
 */
export function cleanupTranscodeFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // Best-effort cleanup
  }
}
