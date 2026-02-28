/**
 * Shippo Webhook Signature Verification
 *
 * Shippo supports two webhook security methods. This module implements both:
 *
 * ── Method A: Self-Generated Token (active, registered in Shippo dashboard) ──
 *   The webhook URL includes `?token=<secret>` as a query parameter.
 *   Shippo passes it back verbatim on every POST.
 *   Verification: constant-time comparison of req.query.token vs SHIPPO_WEBHOOK_SECRET.
 *
 * ── Method B: HMAC-SHA256 (enterprise, requires Shippo account manager) ──
 *   Shippo sends an `HTTP_SHIPPO_AUTH_SIGNATURE` header (Express normalises it
 *   to `shippo-auth-signature`) in the format: `t=<unix_ts>,v1=<hex_hmac_sha256>`.
 *   Signed payload: `${timestamp}.${rawBody}`.
 *   Verification: HMAC-SHA256(secret, signedPayload) == v1, with replay guard.
 *
 * The middleware tries Method B first (if the header is present), then falls
 * back to Method A (token query param). If neither passes, it returns 401.
 *
 * Reference: https://docs.goshippo.com/docs/tracking/webhooksecurity/
 */

import { createHmac, timingSafeEqual } from "crypto";
import type { Request, Response, NextFunction } from "express";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum age of a webhook request before it is rejected as a replay (HMAC method). */
export const REPLAY_TOLERANCE_SECONDS = 300; // 5 minutes

/** The Express-normalised name of the Shippo HMAC signature header. */
export const SHIPPO_SIGNATURE_HEADER = "shippo-auth-signature";

// ─── Method B: HMAC helpers (pure, testable) ─────────────────────────────────

export interface ParsedShippoSignature {
  timestamp: number;
  v1: string;
}

/**
 * Parse the Shippo HMAC signature header value.
 * Expected format: `t=1688493073,v1=24036c00f9adad56...`
 * Returns null if the header is missing or malformed.
 */
export function parseShippoSignatureHeader(
  header: string | undefined
): ParsedShippoSignature | null {
  if (!header) return null;

  const parts = header.split(",");
  let timestamp: number | null = null;
  let v1: string | null = null;

  for (const part of parts) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    const value = part.slice(eqIdx + 1).trim();
    if (key === "t") timestamp = parseInt(value, 10);
    if (key === "v1") v1 = value;
  }

  if (timestamp === null || isNaN(timestamp) || !v1) return null;
  return { timestamp, v1 };
}

/**
 * Compute the expected HMAC-SHA256 signature for a Shippo webhook payload.
 */
export function computeShippoHmac(
  timestamp: number,
  rawBody: string,
  secret: string
): string {
  const signedPayload = `${timestamp}.${rawBody}`;
  return createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
}

/**
 * Verify a Shippo webhook using the HMAC header method (Method B).
 */
export function verifyShippoHmac(
  header: string | undefined,
  rawBody: string,
  secret: string,
  nowMs: number = Date.now()
): { valid: boolean; reason?: string } {
  if (!secret) return { valid: false, reason: "SHIPPO_WEBHOOK_SECRET not configured" };

  const parsed = parseShippoSignatureHeader(header);
  if (!parsed) {
    return { valid: false, reason: "Missing or malformed shippo-auth-signature header" };
  }

  // Replay-attack guard
  const ageSeconds = (nowMs - parsed.timestamp * 1000) / 1000;
  if (ageSeconds > REPLAY_TOLERANCE_SECONDS) {
    return {
      valid: false,
      reason: `Webhook timestamp too old (${Math.round(ageSeconds)}s > ${REPLAY_TOLERANCE_SECONDS}s tolerance)`,
    };
  }

  const expected = computeShippoHmac(parsed.timestamp, rawBody, secret);

  try {
    const expectedBuf = Buffer.from(expected, "hex");
    const receivedBuf = Buffer.from(parsed.v1, "hex");
    if (expectedBuf.length !== receivedBuf.length) {
      return { valid: false, reason: "Signature length mismatch" };
    }
    const match = timingSafeEqual(expectedBuf, receivedBuf);
    return match ? { valid: true } : { valid: false, reason: "Signature mismatch" };
  } catch {
    return { valid: false, reason: "Signature comparison failed (invalid hex)" };
  }
}

// ─── Method A: Token query-param helpers (pure, testable) ────────────────────

/**
 * Verify a Shippo webhook using the self-generated token query parameter (Method A).
 * Performs a constant-time comparison to prevent timing attacks.
 */
export function verifyShippoToken(
  queryToken: string | undefined,
  secret: string
): { valid: boolean; reason?: string } {
  if (!secret) return { valid: false, reason: "SHIPPO_WEBHOOK_SECRET not configured" };
  if (!queryToken) return { valid: false, reason: "Missing ?token query parameter" };

  try {
    const secretBuf = Buffer.from(secret, "utf8");
    const tokenBuf = Buffer.from(queryToken, "utf8");

    // Buffers must be the same length for timingSafeEqual
    if (secretBuf.length !== tokenBuf.length) {
      return { valid: false, reason: "Token length mismatch" };
    }
    const match = timingSafeEqual(secretBuf, tokenBuf);
    return match ? { valid: true } : { valid: false, reason: "Token mismatch" };
  } catch {
    return { valid: false, reason: "Token comparison failed" };
  }
}

// ─── Express middleware ───────────────────────────────────────────────────────

/**
 * Express middleware that verifies Shippo webhook authenticity.
 *
 * Strategy:
 *   1. If the `shippo-auth-signature` HMAC header is present → verify via HMAC (Method B).
 *   2. Otherwise → verify via `?token` query parameter (Method A, currently active).
 *   3. If neither passes → respond 401.
 *
 * IMPORTANT: Must be registered AFTER `express.raw({ type: '*\/*' })` so that
 * `req.body` is still the raw Buffer when HMAC verification is needed.
 *
 * On success: parses `req.body` from Buffer to JSON object for downstream handlers.
 * On failure: responds 401 and logs the reason.
 */
export function shippoSignatureMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = process.env.SHIPPO_WEBHOOK_SECRET ?? "";

  // If no secret is configured, allow through in development but block in production.
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[ShippoWebhook] SHIPPO_WEBHOOK_SECRET not set — rejecting in production");
      res.status(401).json({ error: "Webhook secret not configured" });
      return;
    }
    console.warn("[ShippoWebhook] SHIPPO_WEBHOOK_SECRET not set — skipping verification in development");
    // Still parse the body for the downstream handler
    if (req.body instanceof Buffer) {
      try { req.body = JSON.parse(req.body.toString("utf8")); } catch { /* leave as-is */ }
    }
    next();
    return;
  }

  const hmacHeader = req.headers[SHIPPO_SIGNATURE_HEADER] as string | undefined;
  const rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : JSON.stringify(req.body ?? {});

  let result: { valid: boolean; reason?: string };

  if (hmacHeader) {
    // Method B: HMAC header (enterprise)
    result = verifyShippoHmac(hmacHeader, rawBody, secret);
    if (!result.valid) {
      console.warn(`[ShippoWebhook] HMAC verification failed: ${result.reason}`);
      res.status(401).json({ error: "Invalid webhook signature", reason: result.reason });
      return;
    }
  } else {
    // Method A: token query parameter (active / self-generated)
    const queryToken = req.query?.token as string | undefined;
    result = verifyShippoToken(queryToken, secret);
    if (!result.valid) {
      console.warn(`[ShippoWebhook] Token verification failed: ${result.reason}`);
      res.status(401).json({ error: "Invalid webhook token", reason: result.reason });
      return;
    }
  }

  // Parse body for downstream handler
  if (req.body instanceof Buffer) {
    try { req.body = JSON.parse(rawBody); } catch { /* leave as-is */ }
  }

  next();
}
