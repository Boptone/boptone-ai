/**
 * Bops Video Upload Endpoint
 *
 * REST endpoint (not tRPC) to handle large video file uploads via multipart/form-data.
 * Validates video metadata client-side; server re-validates before accepting.
 * Uploads directly to S3 via storagePut, returns the S3 key and URL.
 *
 * POST /api/bops/upload
 * Authorization: session cookie (protectedProcedure equivalent)
 * Content-Type: multipart/form-data
 * Body fields:
 *   - video: File (required) — the video file
 *   - durationMs: string (required) — video duration in milliseconds
 *   - width: string (optional) — video width in pixels
 *   - height: string (optional) — video height in pixels
 *   - caption: string (optional) — max 150 chars
 *   - linkedTrackId: string (optional) — linked BAP track ID
 */
import type { Request, Response } from "express";
import multer from "multer";
import { storagePut, randomSuffix } from "../storage";
import { sdk } from "../_core/sdk";

// ---------------------------------------------------------------------------
// Constants — must match client-side validation
// ---------------------------------------------------------------------------
const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB
const MIN_DURATION_MS = 15_000;
const MAX_DURATION_MS = 30_000;
const ALLOWED_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"];

// ---------------------------------------------------------------------------
// Multer config — memory storage (stream directly to S3)
// ---------------------------------------------------------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported video format: ${file.mimetype}. Use MP4, MOV, or WebM.`));
    }
  },
});

// ---------------------------------------------------------------------------
// Upload handler
// ---------------------------------------------------------------------------
export async function handleBopsUpload(req: Request, res: Response): Promise<void> {
  // 1. Authenticate
  const user = await sdk.authenticateRequest(req).catch(() => null);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  // DEV MODE: Onboarding gate disabled for testing — re-enable before launch
  // try {
  //   const { getDb } = await import("../db");
  //   const { artistProfiles } = await import("../../drizzle/schema");
  //   const { eq } = await import("drizzle-orm");
  //   const db = await getDb();
  //   if (db) {
  //     const profile = await db
  //       .select({ id: artistProfiles.id, onboardingCompleted: artistProfiles.onboardingCompleted })
  //       .from(artistProfiles)
  //       .where(eq(artistProfiles.userId, user.id))
  //       .limit(1);
  //     if (!profile.length || !profile[0].onboardingCompleted) {
  //       res.status(403).json({
  //         error: "Complete your artist profile before posting Bops.",
  //         redirect: "/artist/setup",
  //       });
  //       return;
  //     }
  //   }
  // } catch {
  //   // Non-fatal: allow upload if DB check fails to avoid blocking artists
  // }

  // 3. Parse multipart form
  await new Promise<void>((resolve, reject) => {
    upload.single("video")(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  }).catch((err: Error) => {
    res.status(400).json({ error: err.message });
    return;
  });

  if (res.headersSent) return;

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No video file provided" });
    return;
  }

  // 3. Server-side validation
  const durationMs = parseInt(req.body.durationMs ?? "0", 10);
  if (isNaN(durationMs) || durationMs < MIN_DURATION_MS || durationMs > MAX_DURATION_MS) {
    res.status(400).json({
      error: `Video must be between 15 and 30 seconds. Got ${(durationMs / 1000).toFixed(1)}s.`,
    });
    return;
  }

  const width = parseInt(req.body.width ?? "0", 10);
  const height = parseInt(req.body.height ?? "0", 10);
  const caption = (req.body.caption ?? "").slice(0, 150);
  const linkedTrackId = req.body.linkedTrackId ? parseInt(req.body.linkedTrackId, 10) : null;

  // 4. Build S3 key with random suffix (prevents enumeration)
  const ext = file.mimetype === "video/quicktime" ? "mov" : file.mimetype === "video/webm" ? "webm" : "mp4";
  const suffix = randomSuffix();
  const videoKey = `bops/videos/${user.id}/${Date.now()}-${suffix}.${ext}`;

  // 5. Upload to S3
  let videoUrl: string;
  try {
    const result = await storagePut(videoKey, file.buffer, file.mimetype);
    videoUrl = result.url;
  } catch (err) {
    console.error("[BopsUpload] S3 upload failed:", err);
    res.status(500).json({ error: "Failed to upload video. Please try again." });
    return;
  }

  // 6. Return upload result — client calls trpc.bops.create() next
  res.json({
    videoKey,
    videoUrl,
    durationMs,
    width: width || null,
    height: height || null,
    caption,
    linkedTrackId,
    fileSizeBytes: file.size,
    mimeType: file.mimetype,
  });
}
