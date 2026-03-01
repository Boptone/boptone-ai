/**
 * DISTRO-A3: Audio Transcoder Tests
 *
 * Tests for:
 *   - TRANSCODE_CONFIGS format definitions (all 5 DSP formats)
 *   - Format codec/extension/option correctness
 *   - transcodeAllFormats result shape
 *   - transcodeQueue worker status API
 *   - cleanupTranscodeFile safety
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  TRANSCODE_CONFIGS,
  transcodeAllFormats,
  cleanupTranscodeFile,
  type TranscodeFormat,
} from "./lib/audioTranscoder";
import {
  startTranscodeWorker,
  stopTranscodeWorker,
  getTranscodeWorkerStatus,
} from "./lib/transcodeQueue";

// ─── Format Config Tests ──────────────────────────────────────────────────────

describe("TRANSCODE_CONFIGS", () => {
  const formats: TranscodeFormat[] = ["aac_256", "ogg_vorbis", "flac_16", "mp3_320", "wav_24_96"];

  it("defines exactly 5 DSP formats", () => {
    expect(Object.keys(TRANSCODE_CONFIGS)).toHaveLength(5);
    formats.forEach((fmt) => {
      expect(TRANSCODE_CONFIGS).toHaveProperty(fmt);
    });
  });

  it("aac_256 targets Apple Music with AAC codec and m4a extension", () => {
    const cfg = TRANSCODE_CONFIGS.aac_256;
    expect(cfg.codec).toBe("aac");
    expect(cfg.ext).toBe("m4a");
    expect(cfg.format).toBe("ipod");
    expect(cfg.dsps).toContain("Apple Music");
    // Must include 256k bitrate flag
    expect(cfg.audioOptions).toContain("256k");
    // Must target 44.1 kHz stereo
    expect(cfg.audioOptions).toContain("44100");
    expect(cfg.audioOptions).toContain("2");
  });

  it("ogg_vorbis targets Spotify with libvorbis codec and ogg extension", () => {
    const cfg = TRANSCODE_CONFIGS.ogg_vorbis;
    expect(cfg.codec).toBe("libvorbis");
    expect(cfg.ext).toBe("ogg");
    expect(cfg.format).toBe("ogg");
    expect(cfg.dsps).toContain("Spotify");
    // Quality 9 = ~320 kbps for libvorbis
    expect(cfg.audioOptions).toContain("9");
  });

  it("flac_16 targets Tidal with FLAC codec, 16-bit depth, and flac extension", () => {
    const cfg = TRANSCODE_CONFIGS.flac_16;
    expect(cfg.codec).toBe("flac");
    expect(cfg.ext).toBe("flac");
    expect(cfg.format).toBe("flac");
    expect(cfg.dsps).toContain("Tidal");
    // 16-bit sample format
    expect(cfg.audioOptions).toContain("s16");
  });

  it("mp3_320 uses libmp3lame at 320 kbps CBR as universal fallback", () => {
    const cfg = TRANSCODE_CONFIGS.mp3_320;
    expect(cfg.codec).toBe("libmp3lame");
    expect(cfg.ext).toBe("mp3");
    expect(cfg.format).toBe("mp3");
    expect(cfg.dsps).toContain("Universal fallback");
    expect(cfg.audioOptions).toContain("320k");
  });

  it("wav_24_96 is the Boptone native premium format at 96 kHz with 24-bit PCM", () => {
    const cfg = TRANSCODE_CONFIGS.wav_24_96;
    expect(cfg.codec).toBe("pcm_s24le");
    expect(cfg.ext).toBe("wav");
    expect(cfg.format).toBe("wav");
    expect(cfg.dsps).toContain("Boptone Native Premium");
    // 96 kHz sample rate
    expect(cfg.audioOptions).toContain("96000");
  });

  it("every format config has required fields: ext, format, codec, audioOptions, label, dsps", () => {
    formats.forEach((fmt) => {
      const cfg = TRANSCODE_CONFIGS[fmt];
      expect(cfg.ext).toBeTruthy();
      expect(cfg.format).toBeTruthy();
      expect(cfg.codec).toBeTruthy();
      expect(Array.isArray(cfg.audioOptions)).toBe(true);
      expect(cfg.label).toBeTruthy();
      expect(Array.isArray(cfg.dsps)).toBe(true);
      expect(cfg.dsps.length).toBeGreaterThan(0);
    });
  });

  it("no two formats share the same file extension", () => {
    const exts = formats.map((fmt) => TRANSCODE_CONFIGS[fmt].ext);
    const unique = new Set(exts);
    expect(unique.size).toBe(formats.length);
  });

  it("all formats target 44.1 kHz or higher sample rate", () => {
    formats.forEach((fmt) => {
      const cfg = TRANSCODE_CONFIGS[fmt];
      const hasHighSampleRate = cfg.audioOptions.some((opt) => {
        const n = parseInt(opt, 10);
        return !isNaN(n) && n >= 44100;
      });
      expect(hasHighSampleRate, `${fmt} should target >= 44.1 kHz`).toBe(true);
    });
  });

  it("all formats target stereo (2 channels) or omit channel constraint for native", () => {
    // wav_24_96 explicitly sets 2 channels; others should too
    const stereoFormats: TranscodeFormat[] = ["aac_256", "ogg_vorbis", "flac_16", "mp3_320", "wav_24_96"];
    stereoFormats.forEach((fmt) => {
      const cfg = TRANSCODE_CONFIGS[fmt];
      expect(cfg.audioOptions).toContain("2");
    });
  });
});

// ─── cleanupTranscodeFile Tests ───────────────────────────────────────────────

describe("cleanupTranscodeFile", () => {
  it("deletes an existing file without throwing", () => {
    const tmpFile = path.join(os.tmpdir(), `boptone-test-cleanup-${Date.now()}.tmp`);
    fs.writeFileSync(tmpFile, "test");
    expect(fs.existsSync(tmpFile)).toBe(true);
    cleanupTranscodeFile(tmpFile);
    expect(fs.existsSync(tmpFile)).toBe(false);
  });

  it("does not throw when the file does not exist", () => {
    expect(() => cleanupTranscodeFile("/nonexistent/path/file.wav")).not.toThrow();
  });

  it("does not throw when given an empty string", () => {
    expect(() => cleanupTranscodeFile("")).not.toThrow();
  });
});

// ─── transcodeAllFormats Result Shape Tests ───────────────────────────────────

describe("transcodeAllFormats result shape", () => {
  it("returns an object with results and errors arrays", async () => {
    // Mock transcodeAudio to avoid real FFmpeg calls in unit tests
    const mockTranscode = vi.fn().mockRejectedValue(new Error("No source file in test env"));

    vi.doMock("./lib/audioTranscoder", async (importOriginal) => {
      const original = await importOriginal<typeof import("./lib/audioTranscoder")>();
      return { ...original, transcodeAudio: mockTranscode };
    });

    // The real transcodeAllFormats uses Promise.allSettled, so errors are collected
    // We test the shape contract here using the actual implementation with a bad URL
    const { results, errors } = await transcodeAllFormats("http://localhost:0/nonexistent.wav");

    expect(Array.isArray(results)).toBe(true);
    expect(Array.isArray(errors)).toBe(true);
    // All 5 formats should fail (no real FFmpeg source) → 5 errors
    expect(results.length + errors.length).toBe(5);
    errors.forEach((e) => {
      expect(e).toHaveProperty("format");
      expect(e).toHaveProperty("error");
      expect(typeof e.error).toBe("string");
    });
  }, 30_000);
});

// ─── TranscodeQueue Worker Status Tests ──────────────────────────────────────

describe("getTranscodeWorkerStatus", () => {
  afterEach(() => {
    stopTranscodeWorker();
  });

  it("reports not running before start", () => {
    const status = getTranscodeWorkerStatus();
    expect(status.running).toBe(false);
    expect(status.activeJobs).toBe(0);
  });

  it("reports running after startTranscodeWorker", () => {
    startTranscodeWorker();
    const status = getTranscodeWorkerStatus();
    expect(status.running).toBe(true);
  });

  it("reports not running after stopTranscodeWorker", () => {
    startTranscodeWorker();
    stopTranscodeWorker();
    const status = getTranscodeWorkerStatus();
    expect(status.running).toBe(false);
  });

  it("is idempotent — calling start twice does not double-register", () => {
    startTranscodeWorker();
    startTranscodeWorker(); // Should be a no-op
    const status = getTranscodeWorkerStatus();
    expect(status.running).toBe(true);
    expect(status.activeJobs).toBe(0);
  });

  it("reports correct maxConcurrent and pollIntervalMs", () => {
    const status = getTranscodeWorkerStatus();
    expect(status.maxConcurrent).toBe(2);
    expect(status.pollIntervalMs).toBe(15_000);
  });
});

// ─── Format Label Uniqueness Tests ───────────────────────────────────────────

describe("TRANSCODE_CONFIGS label uniqueness", () => {
  it("every format has a unique human-readable label", () => {
    const labels = Object.values(TRANSCODE_CONFIGS).map((c) => c.label);
    const unique = new Set(labels);
    expect(unique.size).toBe(labels.length);
  });
});
