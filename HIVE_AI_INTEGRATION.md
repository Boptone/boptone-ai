# Hive AI Music Detection Integration Guide

## Overview

Boptone uses **Hive AI's AI-Generated Music Detection API** to automatically detect AI-generated music uploads and enforce TOS Section 9.12 (AI-Generated Content Policy).

This document provides implementation guidance for integrating Hive AI's API into the BopAudio upload flow and content moderation queue.

---

## Why Hive AI?

- **Industry-leading accuracy**: Outperforms competing models in independent research (2024 study)
- **Department of Defense partnership**: Trusted by U.S. government for deepfake detection
- **Dual detection**: Detects both AI-generated music AND AI-generated vocals in same API response
- **Generative engine attribution**: Returns which AI tool (Suno, Udio, etc.) likely created the content
- **Multilingual support**: Language-independent classification
- **Regular updates**: Proactively updated to detect new AI music engines as they gain popularity

---

## API Capabilities

### AI-Generated Music Detection

**Endpoint**: `POST https://api.thehive.ai/v2/task/sync`

**Request**:
```json
{
  "media": [
    {
      "url": "https://storage.boptone.com/tracks/audio-file.mp3"
    }
  ],
  "models": ["ai_generated_music"]
}
```

**Response**:
```json
{
  "status": [
    {
      "response": {
        "output": [
          {
            "classes": [
              {
                "class": "ai_generated",
                "score": 0.92
              },
              {
                "class": "human_created",
                "score": 0.08
              }
            ],
            "music_ai_generated": {
              "score": 0.89,
              "detected_engine": "Suno AI"
            },
            "vocals_ai_generated": {
              "score": 0.95,
              "detected_engine": "Udio AI"
            }
          }
        ]
      }
    }
  ]
}
```

**Key Fields**:
- `classes[0].score`: Overall AI-generated confidence (0.00 to 1.00)
- `music_ai_generated.score`: Music AI confidence
- `music_ai_generated.detected_engine`: Likely AI tool used for music
- `vocals_ai_generated.score`: Vocals AI confidence
- `vocals_ai_generated.detected_engine`: Likely AI tool used for vocals

---

## Database Schema

### `ai_detection_results`

Stores Hive AI detection results for uploaded tracks.

```sql
CREATE TABLE `ai_detection_results` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `trackId` int NOT NULL,
  `isAiGenerated` boolean,
  `confidenceScore` decimal(5, 2), -- 0.00 to 100.00
  `detectedEngine` varchar(100), -- e.g., "Suno AI", "Udio AI"
  `musicIsAi` boolean,
  `musicConfidence` decimal(5, 2),
  `vocalsAreAi` boolean,
  `vocalsConfidence` decimal(5, 2),
  `apiProvider` varchar(50) DEFAULT 'hive',
  `rawResponse` json, -- Full API response for debugging
  `analyzedAt` timestamp DEFAULT (now()),
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`)
);
```

### `content_moderation_queue`

Tracks content flagged for manual admin review.

```sql
CREATE TABLE `content_moderation_queue` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `trackId` int NOT NULL,
  `artistId` int NOT NULL,
  `flagReason` enum(
    'ai_detection_high_confidence', -- AI score > 80%
    'ai_detection_medium_confidence', -- AI score 50-80%
    'prohibited_tool_disclosed', -- Artist disclosed Suno/Udio
    'manual_report',
    'copyright_claim',
    'other'
  ) NOT NULL,
  `flagDetails` text,
  `aiDetectionId` int,
  `status` enum(
    'pending',
    'under_review',
    'approved',
    'removed',
    'appealed',
    'appeal_approved',
    'appeal_rejected'
  ) DEFAULT 'pending',
  `reviewedBy` int,
  `reviewNotes` text,
  `reviewedAt` timestamp,
  `strikeIssued` boolean DEFAULT false,
  `strikeNumber` int, -- 1, 2, or 3
  `flaggedAt` timestamp DEFAULT (now()),
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`),
  FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`),
  FOREIGN KEY (`aiDetectionId`) REFERENCES `ai_detection_results`(`id`),
  FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`)
);
```

### `artist_strike_history`

Records TOS Section 9.12.6 3-strike policy violations.

```sql
CREATE TABLE `artist_strike_history` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `artistId` int NOT NULL,
  `strikeNumber` int NOT NULL, -- 1, 2, or 3
  `reason` text NOT NULL,
  `trackId` int,
  `moderationQueueId` int,
  `penalty` enum('warning', 'suspension', 'permanent_ban') NOT NULL,
  `suspensionEndsAt` timestamp,
  `issuedBy` int NOT NULL,
  `issuedAt` timestamp DEFAULT (now()),
  `appealStatus` enum('none', 'pending', 'approved', 'rejected') DEFAULT 'none',
  `appealReason` text,
  `appealedAt` timestamp,
  `appealReviewedBy` int,
  `appealReviewedAt` timestamp,
  `appealNotes` text,
  `createdAt` timestamp DEFAULT (now()),
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`),
  FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`),
  FOREIGN KEY (`moderationQueueId`) REFERENCES `content_moderation_queue`(`id`),
  FOREIGN KEY (`issuedBy`) REFERENCES `users`(`id`),
  FOREIGN KEY (`appealReviewedBy`) REFERENCES `users`(`id`)
);
```

---

## Implementation Workflow

### 1. Upload Flow Integration

When an artist uploads a BopAudio track:

1. **Artist certifies** via checkbox: "I certify this music was NOT created using AI tools trained on copyrighted works without permission"
2. **Artist optionally discloses** AI usage type (lyrics, production, mastering, vocals, artwork) and specific tools used
3. **Upload completes** → Track saved to `bap_tracks` table with `aiDisclosure` JSON field
4. **Trigger AI detection** (background job):
   - If artist disclosed prohibited tools (Suno, Udio) → Skip API call, immediately flag for moderation
   - Otherwise → Call Hive AI API with track's `audioUrl`
   - Save results to `ai_detection_results` table
5. **Auto-flag if needed**:
   - If `confidenceScore` > 80% → Add to `content_moderation_queue` with `flagReason: 'ai_detection_high_confidence'`
   - If `confidenceScore` 50-80% → Add to `content_moderation_queue` with `flagReason: 'ai_detection_medium_confidence'`
   - If `detectedEngine` matches prohibited tools (Suno, Udio) → Immediate flag

### 2. Content Moderation Queue

Admins review flagged content at `/admin/content-moderation`:

1. **View pending items** from `content_moderation_queue` where `status = 'pending'`
2. **Review details**:
   - Track metadata (title, artist, audio player)
   - AI detection results (confidence score, detected engine)
   - Artist's AI disclosure (if provided)
   - Flag reason
3. **Admin actions**:
   - **Approve**: Mark `status = 'approved'`, no strike issued
   - **Remove + Issue Strike**: Mark `status = 'removed'`, `strikeIssued = true`, create entry in `artist_strike_history`
   - **Request Proof**: Email artist requesting proof of licensing (14-day deadline)
4. **Strike penalties** (TOS Section 9.12.6):
   - **1st strike**: Warning + immediate content removal + 14-day proof period
   - **2nd strike**: 30-day account suspension + removal of ALL AI-generated content
   - **3rd strike**: Permanent account termination + forfeiture of pending payments + permanent ban

### 3. Artist Appeal Process

Artists can appeal moderation decisions:

1. **Artist submits appeal** with reason (e.g., "False positive, I can provide licensing proof")
2. **Appeal recorded** in `content_moderation_queue`: `status = 'appealed'`, `appealReason` saved
3. **Admin reviews appeal**:
   - If approved: `status = 'appeal_approved'`, strike removed from `artist_strike_history`
   - If rejected: `status = 'appeal_rejected'`, strike remains

---

## API Integration Code (Placeholder)

### Backend: Call Hive AI API

```typescript
// server/aiDetection.ts
import { ENV } from './_core/env';

export interface HiveAIDetectionResult {
  isAiGenerated: boolean;
  confidenceScore: number; // 0-100
  detectedEngine: string | null;
  musicIsAi: boolean;
  musicConfidence: number;
  vocalsAreAi: boolean;
  vocalsConfidence: number;
  rawResponse: any;
}

export async function detectAIMusic(audioUrl: string): Promise<HiveAIDetectionResult> {
  // TODO: Replace with actual Hive API key from ENV
  const HIVE_API_KEY = ENV.hiveApiKey || 'PLACEHOLDER_API_KEY';
  
  const response = await fetch('https://api.thehive.ai/v2/task/sync', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${HIVE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      media: [{ url: audioUrl }],
      models: ['ai_generated_music'],
    }),
  });

  if (!response.ok) {
    throw new Error(`Hive AI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const output = data.status[0].response.output[0];
  
  const aiScore = output.classes.find((c: any) => c.class === 'ai_generated')?.score || 0;
  const musicAI = output.music_ai_generated || {};
  const vocalsAI = output.vocals_ai_generated || {};

  return {
    isAiGenerated: aiScore > 0.5,
    confidenceScore: Math.round(aiScore * 100),
    detectedEngine: musicAI.detected_engine || vocalsAI.detected_engine || null,
    musicIsAi: (musicAI.score || 0) > 0.5,
    musicConfidence: Math.round((musicAI.score || 0) * 100),
    vocalsAreAi: (vocalsAI.score || 0) > 0.5,
    vocalsConfidence: Math.round((vocalsAI.score || 0) * 100),
    rawResponse: data,
  };
}
```

### Backend: Save Detection Results

```typescript
// server/db.ts
import { aiDetectionResults, contentModerationQueue } from "../drizzle/schema";

export async function saveAIDetectionResult(
  trackId: number,
  result: HiveAIDetectionResult
) {
  const db = await getDb();
  if (!db) return;

  const [detectionResult] = await db.insert(aiDetectionResults).values({
    trackId,
    isAiGenerated: result.isAiGenerated,
    confidenceScore: result.confidenceScore.toString(),
    detectedEngine: result.detectedEngine,
    musicIsAi: result.musicIsAi,
    musicConfidence: result.musicConfidence.toString(),
    vocalsAreAi: result.vocalsAreAi,
    vocalsConfidence: result.vocalsConfidence.toString(),
    apiProvider: 'hive',
    rawResponse: result.rawResponse,
  }).$returningId();

  // Auto-flag if high/medium confidence
  if (result.confidenceScore >= 50) {
    const track = await db.select().from(bapTracks).where(eq(bapTracks.id, trackId)).limit(1);
    if (track.length === 0) return;

    await db.insert(contentModerationQueue).values({
      trackId,
      artistId: track[0].artistId,
      flagReason: result.confidenceScore >= 80 
        ? 'ai_detection_high_confidence' 
        : 'ai_detection_medium_confidence',
      flagDetails: `AI detection confidence: ${result.confidenceScore}%. Detected engine: ${result.detectedEngine || 'Unknown'}`,
      aiDetectionId: detectionResult.id,
      status: 'pending',
    });
  }
}
```

---

## Getting Started with Hive AI

### Step 1: Contact Hive Sales

- **Website**: https://thehive.ai/apis/ai-generated-content-classification
- **Email**: sales@thehive.ai
- **Request**: AI-Generated Music Detection API access for Boptone platform

### Step 2: Obtain API Key

After sales onboarding, you'll receive:
- API key (Bearer token)
- API endpoint URL
- Rate limits and pricing information

### Step 3: Add API Key to Environment

Use `webdev_request_secrets` to add the Hive API key:

```typescript
await webdev_request_secrets({
  secrets: [
    {
      key: 'HIVE_API_KEY',
      description: 'Hive AI API key for AI-generated music detection',
      // value: 'your-api-key-here' (omit to prompt user for input)
    }
  ]
});
```

### Step 4: Implement Backend Integration

1. Create `server/aiDetection.ts` with `detectAIMusic()` function (see code above)
2. Add tRPC mutation to trigger AI detection after track upload
3. Create background job to process detection queue (e.g., every 5 minutes)

### Step 5: Build Admin Moderation UI

Create `/admin/content-moderation` page with:
- Table of pending moderation items
- Audio player for each flagged track
- AI detection results display
- Approve/Remove/Request Proof buttons
- Strike issuance workflow

---

## Testing Without Hive API

Until Hive API is integrated, you can test the system with mock data:

```typescript
// server/aiDetection.ts (mock version)
export async function detectAIMusic(audioUrl: string): Promise<HiveAIDetectionResult> {
  // Mock response for testing
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  return {
    isAiGenerated: Math.random() > 0.5,
    confidenceScore: Math.floor(Math.random() * 100),
    detectedEngine: ['Suno AI', 'Udio AI', 'Unknown', null][Math.floor(Math.random() * 4)],
    musicIsAi: Math.random() > 0.5,
    musicConfidence: Math.floor(Math.random() * 100),
    vocalsAreAi: Math.random() > 0.5,
    vocalsConfidence: Math.floor(Math.random() * 100),
    rawResponse: { mock: true },
  };
}
```

---

## Cost Considerations

Hive AI pricing is typically based on:
- **Per-request pricing**: $X per audio file analyzed
- **Volume discounts**: Lower per-request cost at higher volumes
- **Enterprise plans**: Custom pricing for high-volume platforms

**Recommendation**: Contact Hive sales for custom pricing based on Boptone's expected upload volume.

---

## Next Steps

1. **Contact Hive Sales** to obtain API key and pricing
2. **Implement backend integration** with `detectAIMusic()` function
3. **Create admin moderation page** at `/admin/content-moderation`
4. **Test with mock data** before enabling live API calls
5. **Monitor false positive rate** and adjust confidence thresholds if needed
6. **Add artist education** linking to `/ai-music-guide` from moderation emails

---

## Support

For questions about this integration, contact:
- **Hive AI Support**: support@thehive.ai
- **Boptone Development**: [Your team's contact]
