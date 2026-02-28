# Boptone — Engineering Action Plan
## Three Highest-Priority Actions from the 100-Engineer Audit
**Prepared:** February 28, 2026  
**Owner:** Scottie / Boptone Engineering

---

## Priority 1 — Rate Limiting and CSRF Protection on All tRPC Mutations

**Why it is first:** This is the only item on the list that can be exploited today, by anyone, with no special tooling. An attacker can hammer the tip, follow, upload, and checkout endpoints with automated requests and either exhaust the database, trigger fraudulent Stripe charges, or enumerate user data. This must ship before any public traffic is sent to the platform.

---

### Phase 1A — Rate Limiting (Estimated effort: 1–2 days)

**What to build:** A per-IP and per-user rate limiter applied as Express middleware before the tRPC router. Every endpoint gets a default limit; sensitive endpoints (payment, auth, upload) get a tighter limit.

**Implementation steps:**

1. Install `express-rate-limit` and `rate-limit-redis` (so limits survive server restarts and scale across instances).
   ```
   pnpm add express-rate-limit rate-limit-redis ioredis
   ```

2. Create `server/middleware/rateLimiter.ts` with three tiers:

   | Tier | Endpoints | Limit |
   |---|---|---|
   | Global | All `/api/trpc/*` | 300 requests / 15 min per IP |
   | Authenticated | Mutations requiring login | 60 requests / 15 min per user ID |
   | Sensitive | Tip checkout, upload, auth | 10 requests / 15 min per IP |

3. Apply middleware in `server/_core/index.ts` before the tRPC handler. Sensitive routes get their own limiter instance applied by route pattern.

4. Return `429 Too Many Requests` with a `Retry-After` header. The tRPC client on the frontend should surface this as a toast: "Too many requests — please wait a moment."

5. Add a Redis instance (or use the existing TiDB connection as a fallback store) to persist rate limit counters.

**Test criteria:** Run `ab -n 500 -c 50` against `/api/trpc/bops.createTipCheckout` and confirm requests above the threshold receive 429 responses within the window.

---

### Phase 1B — CSRF Protection (Estimated effort: half a day)

**What to build:** A double-submit cookie pattern or the `csurf` equivalent for all state-mutating tRPC calls. Because tRPC uses `POST` for mutations and the platform uses cookie-based sessions, cross-site request forgery is a real attack vector.

**Implementation steps:**

1. Install `csrf-csrf` (the modern replacement for the deprecated `csurf` package).
   ```
   pnpm add csrf-csrf
   ```

2. In `server/_core/index.ts`, initialize `doubleCsrf` with the JWT secret as the signing key. Expose a `GET /api/csrf-token` endpoint that returns the token in a response header.

3. In `client/src/lib/trpc.ts`, add a custom `fetch` wrapper that reads the CSRF token from the cookie and injects it as `x-csrf-token` on every `POST` request.

4. In the tRPC middleware chain, validate the CSRF token on all `protectedProcedure` mutations. Public read queries (GET-equivalent queries) are exempt.

5. Ensure the CSRF cookie is set with `SameSite=Strict; Secure; HttpOnly`.

**Test criteria:** Send a `POST` to a protected mutation from a different origin without the CSRF token and confirm a `403 Forbidden` response.

---

### Phase 1C — Cookie and Header Hardening (Estimated effort: 2 hours)

These are fast wins that should be done in the same PR:

- Set `SameSite=Strict` and `Secure` on the session cookie in `server/_core/cookies.ts`.
- Add the following HTTP security headers via the `helmet` package:
  - `Content-Security-Policy` — allowlist only Boptone domains, Stripe, and the S3 CDN.
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- Add brute-force protection on the OAuth callback route (max 10 attempts per IP per hour).

```
pnpm add helmet
```

**Delivery gate:** A security headers scan at securityheaders.com must return an A rating before this priority is considered closed.

---

## Priority 2 — Video Transcoding Pipeline with HLS Output and Thumbnail Extraction

**Why it is second:** The Bops pillar is the most visible and differentiated feature of the platform. Every video currently serves as a raw upload — no adaptive bitrate, no codec normalization, no thumbnail. On mobile networks and at scale this is both a poor user experience and an infrastructure liability. This is the single biggest gap between Boptone and any credible video platform.

---

### Phase 2A — Architecture Decision (1 day)

Two viable options:

| Option | Pros | Cons |
|---|---|---|
| **AWS MediaConvert** | Managed, scales to millions of videos, no server maintenance, integrates with S3 natively | Cost at scale, AWS lock-in |
| **FFmpeg on a worker process** | Free, full control, runs on existing infrastructure | Must manage worker scaling, more ops burden |

**Recommendation:** Start with FFmpeg on a dedicated worker process (a separate Node.js service or a background job queue). This keeps costs near zero during the growth phase and can be migrated to MediaConvert later without changing the API contract.

---

### Phase 2B — Job Queue Setup (Estimated effort: 1 day)

1. Install `bullmq` and `ioredis` for a Redis-backed job queue.
   ```
   pnpm add bullmq ioredis
   ```

2. Create `server/workers/videoProcessor.ts` — a BullMQ worker that:
   - Receives a job with `{ bopId, s3RawKey, artistId }`.
   - Downloads the raw video from S3 to a temp directory.
   - Runs FFmpeg to produce:
     - HLS playlist (`.m3u8`) + segmented `.ts` files at 360p, 720p, and 1080p.
     - A thumbnail JPEG extracted from the 3-second mark.
   - Uploads all outputs back to S3 under a structured path: `bops/{bopId}/hls/` and `bops/{bopId}/thumb.jpg`.
   - Updates the `bops` database record with `hlsUrl`, `thumbnailUrl`, and `processingStatus = 'ready'`.

3. Create `server/workers/index.ts` to start the worker process alongside the main server (or as a separate process in production).

---

### Phase 2C — Upload Flow Integration (Estimated effort: half a day)

1. In the Bops upload tRPC procedure (`server/routers/bops.ts`), after the raw video is stored to S3, enqueue a `process-video` job to BullMQ instead of marking the Bop as immediately live.

2. Set `processingStatus = 'processing'` on the new Bop record.

3. In the Bops feed and artist profile grid, show a "Processing..." badge on cards where `processingStatus !== 'ready'`. Do not show the video as playable until processing is complete.

4. When the worker completes, update `processingStatus = 'ready'` and set `thumbnailUrl` and `hlsUrl`. The feed will pick this up on the next query.

---

### Phase 2D — HLS Playback in the Video Player (Estimated effort: 1 day)

1. Install `hls.js` for browser-native HLS playback.
   ```
   pnpm add hls.js
   ```

2. Update `BopsVideoPlayer.tsx` to detect whether `hlsUrl` is present. If yes, use `hls.js` to load the adaptive stream. If no (legacy or still processing), fall back to the raw `videoUrl`.

3. The HLS player automatically selects the best quality tier based on the viewer's available bandwidth — 360p on mobile data, 1080p on WiFi. This is the core UX improvement.

---

### Phase 2E — Thumbnail Display (Estimated effort: 2 hours)

Replace the gradient placeholder cards in `ArtistBopsProfile.tsx` and the Bops feed with the actual `thumbnailUrl` from the database. The placeholder gradient remains as the fallback while `processingStatus === 'processing'`.

**Delivery gate:** Upload a test video, confirm the worker processes it within 60 seconds, confirm HLS playback works at all three quality tiers, and confirm the thumbnail appears in the grid.

---

## Priority 3 — GDPR and PIPL Data Deletion Flow

**Why it is third:** This is a legal requirement, not a feature. Under GDPR (EU), CCPA (California), and PIPL (China), users have the right to request complete deletion of their personal data. Boptone currently has no mechanism to honor this. The moment a user from any of these jurisdictions signs up, the platform is in scope. A single data deletion request that cannot be fulfilled is a regulatory violation.

---

### Phase 3A — Legal Scope Mapping (1 day, non-engineering)

Before writing code, map every table and field that contains personal data:

| Table | Personal Data Fields |
|---|---|
| `users` | `name`, `email`, `openId`, `loginMethod` |
| `artist_profiles` | `stageName`, `bio`, `avatarUrl`, `location`, `email` |
| `bops` | `videoUrl`, `caption` (may contain personal info) |
| `bops_artist_follows` | `fanUserId` (links a real person to an artist) |
| `tips` / `orders` | `userId`, Stripe customer ID, shipping address |
| `sessions` / cookies | Session tokens |
| S3 | Avatar images, video files, audio files |

This map becomes the deletion checklist. Every item on it must be zeroed or anonymized on a deletion request.

---

### Phase 3B — Data Deletion Endpoint (Estimated effort: 2 days)

1. Create a `protectedProcedure` mutation: `trpc.account.requestDeletion`.

2. The mutation does the following in a database transaction:
   - Sets a `deletionRequestedAt` timestamp on the user record.
   - Schedules a background job (via BullMQ, same queue as video processing) to run after a 30-day grace period (GDPR allows this for dispute resolution).
   - Sends the user a confirmation email: "Your deletion request has been received. Your account and all associated data will be permanently deleted on [date]."

3. The background deletion job:
   - Deletes all `bops` records and removes the corresponding S3 objects (video, thumbnail, HLS segments).
   - Deletes all `artist_profiles` records and removes avatar S3 objects.
   - Deletes all `bops_artist_follows` rows where `fanUserId = userId`.
   - Deletes all tip and order records (or anonymizes them for financial audit purposes — check with legal).
   - Calls `stripe.customers.del(stripeCustomerId)` to remove the Stripe customer object.
   - Anonymizes the `users` row: sets `name = 'Deleted User'`, `email = null`, `openId = 'deleted_{id}'`, and `deletedAt = now()`. Does not hard-delete the row to preserve referential integrity.

4. Add a `GET /api/account/my-data` endpoint that returns a JSON export of all personal data the platform holds for the authenticated user. This satisfies the GDPR "right of access" requirement.

---

### Phase 3C — Privacy Policy and In-App UI (Estimated effort: 1 day)

1. Add a "Delete My Account" button in the Profile Settings page (`/settings`). It should require the user to type "DELETE" to confirm, then call `trpc.account.requestDeletion`.

2. Add a "Download My Data" button in the same settings page that calls the data export endpoint and downloads a JSON file.

3. Update the Privacy Policy page to explicitly state:
   - The platform is GDPR compliant (EU users).
   - The platform is CCPA compliant (California users).
   - The platform complies with PIPL (Chinese users).
   - Data deletion requests are honored within 30 days.
   - A contact email for data requests (e.g., `privacy@boptone.com`).

4. Add a cookie consent banner for EU users (detect via IP geolocation or `Accept-Language` header). The banner must offer "Accept All" and "Necessary Only" options and must not pre-tick optional cookies.

---

### Phase 3D — Data Residency Consideration (Ongoing)

For Chinese users under PIPL, personal data of Chinese citizens must not leave China without explicit consent. This is a longer-term infrastructure concern but the immediate action is:

- Add a consent checkbox at signup: "I consent to my data being processed on servers located outside of China." This is legally sufficient for the current phase.
- Document a roadmap item to add a China-region deployment (Alibaba Cloud or Tencent Cloud) when the user base in China reaches a threshold that justifies the cost.

**Delivery gate:** Submit a test deletion request, confirm the confirmation email is sent, confirm the 30-day job is queued, and confirm a manual trigger of the deletion job zeros all personal data across the database and S3.

---

## Sequencing and Timeline

| Week | Action |
|---|---|
| Week 1 | Priority 1A (rate limiting) + 1C (headers/cookies) |
| Week 1 | Priority 1B (CSRF protection) |
| Week 2 | Priority 2A–2C (FFmpeg worker + upload flow) |
| Week 3 | Priority 2D–2E (HLS player + thumbnails) |
| Week 3 | Priority 3A–3B (deletion endpoint + background job) |
| Week 4 | Priority 3C–3D (privacy UI + policy + cookie consent) |
| Week 4 | Full audit pass: securityheaders.com A rating, deletion flow end-to-end test, HLS playback on mobile |

**Total estimated engineering effort:** 3–4 weeks for one full-stack engineer working focused sprints.

---

## What This Unlocks

Completing these three priorities transforms Boptone from a compelling prototype into a platform that can:

- Legally accept users from the EU, US, and China without regulatory exposure.
- Withstand automated abuse and basic adversarial traffic.
- Deliver video at a quality level comparable to established platforms.
- Be presented to investors, labels, or enterprise partners without embarrassment on the technical due diligence checklist.
