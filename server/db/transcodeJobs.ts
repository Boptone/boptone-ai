/**
 * DISTRO-A3: Transcode Job DB Helpers
 *
 * All database operations for the transcode_jobs table.
 * Used by the queue worker and the tRPC status endpoint.
 */

import { and, eq, inArray, lte, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  transcodeJobs,
  type InsertTranscodeJob,
  type TranscodeJob,
} from "../../drizzle/schema";
import type { TranscodeFormat } from "../lib/audioTranscoder";

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Create a transcode job for every requested format.
 * Idempotent: if a job for (trackId, format) already exists in a
 * terminal state (done/skipped), it is left untouched.
 */
export async function createTranscodeJobs(
  trackId: number,
  formats: TranscodeFormat[]
): Promise<TranscodeJob[]> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const created: TranscodeJob[] = [];

  for (const format of formats) {
    // Check for existing terminal job to avoid re-queuing completed work
    const existing = await db
      .select()
      .from(transcodeJobs)
      .where(and(eq(transcodeJobs.trackId, trackId), eq(transcodeJobs.format, format)))
      .limit(1);

    if (existing.length > 0 && (existing[0].status === "done" || existing[0].status === "skipped")) {
      created.push(existing[0]);
      continue;
    }

    // Upsert: reset error jobs back to queued for retry
    if (existing.length > 0) {
      await db
        .update(transcodeJobs)
        .set({ status: "queued", attempts: 0, errorMessage: null, updatedAt: new Date() })
        .where(eq(transcodeJobs.id, existing[0].id));
      created.push({ ...existing[0], status: "queued" });
    } else {
      const values: InsertTranscodeJob = {
        trackId,
        format,
        status: "queued",
        attempts: 0,
        maxAttempts: 3,
      };
      const [result] = await db.insert(transcodeJobs).values(values);
      const insertId = (result as any).insertId as number;
      const [row] = await db
        .select()
        .from(transcodeJobs)
        .where(eq(transcodeJobs.id, insertId))
        .limit(1);
      created.push(row);
    }
  }

  return created;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Get all transcode jobs for a given track. */
export async function getTranscodeJobsByTrack(trackId: number): Promise<TranscodeJob[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transcodeJobs).where(eq(transcodeJobs.trackId, trackId));
}

/** Get all jobs for multiple tracks (used by MyMusic list view). */
export async function getTranscodeJobsByTracks(trackIds: number[]): Promise<TranscodeJob[]> {
  if (!trackIds.length) return [];
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transcodeJobs).where(inArray(transcodeJobs.trackId, trackIds));
}

/**
 * Fetch the next batch of queued jobs eligible for processing.
 * Respects maxAttempts and returns oldest-first.
 */
export async function getPendingTranscodeJobs(limit = 10): Promise<TranscodeJob[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(transcodeJobs)
    .where(
      and(
        eq(transcodeJobs.status, "queued"),
        lte(transcodeJobs.attempts, sql`${transcodeJobs.maxAttempts} - 1`)
      )
    )
    .orderBy(transcodeJobs.createdAt)
    .limit(limit);
}

// ─── Update ───────────────────────────────────────────────────────────────────

/** Mark a job as processing (called when the worker picks it up). */
export async function markTranscodeJobProcessing(jobId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(transcodeJobs)
    .set({
      status: "processing",
      startedAt: new Date(),
      attempts: sql`${transcodeJobs.attempts} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(transcodeJobs.id, jobId));
}

/** Mark a job as successfully completed. */
export async function markTranscodeJobDone(
  jobId: number,
  s3Key: string,
  s3Url: string,
  fileSizeBytes: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(transcodeJobs)
    .set({
      status: "done",
      s3Key,
      s3Url,
      fileSizeBytes,
      completedAt: new Date(),
      errorMessage: null,
      updatedAt: new Date(),
    })
    .where(eq(transcodeJobs.id, jobId));
}

/** Mark a job as failed. If attempts < maxAttempts, resets to queued for retry. */
export async function markTranscodeJobError(
  jobId: number,
  errorMessage: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const [job] = await db
    .select()
    .from(transcodeJobs)
    .where(eq(transcodeJobs.id, jobId))
    .limit(1);

  if (!job) return;

  const nextStatus = job.attempts >= job.maxAttempts ? "error" : "queued";

  await db
    .update(transcodeJobs)
    .set({
      status: nextStatus,
      errorMessage,
      updatedAt: new Date(),
    })
    .where(eq(transcodeJobs.id, jobId));
}

/** Mark a job as skipped (e.g., source already in target format). */
export async function markTranscodeJobSkipped(jobId: number, reason: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(transcodeJobs)
    .set({
      status: "skipped",
      errorMessage: reason,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(transcodeJobs.id, jobId));
}
