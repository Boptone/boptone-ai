# Hugging Face AI Music Detection Integration Guide

## Overview

Boptone uses **MelodyMachine/Deepfake-audio-detection-V2**, an open-source AI audio detection model from Hugging Face, to automatically detect AI-generated music uploads and enforce TOS Section 9.12 (AI-Generated Content Policy).

This document provides implementation guidance for integrating the Hugging Face model into the BopAudio upload flow and content moderation queue.

---

## Why This Model?

**MelodyMachine/Deepfake-audio-detection-V2**

- **99.73% accuracy**: Highest-performing open-source deepfake audio detection model
- **Apache 2.0 license**: Fully open-source, no restrictions, no commercial limitations
- **No government partnerships**: Independent open-source project (no DoD ties)
- **Proven architecture**: Based on facebook/wav2vec2-base (industry-standard for audio classification)
- **Active community**: 20+ Spaces using it, 3,000+ downloads/month
- **Efficient**: 94.6M parameters (can run on standard servers without GPU)

---

## Model Capabilities

### AI-Generated Audio Detection

**Model**: `MelodyMachine/Deepfake-audio-detection-V2`
**Task**: Binary classification (real vs. AI-generated)
**Input**: Audio files (mp3, wav, flac, etc.)
**Output**: Confidence scores for "real" and "fake" labels

**Example Output**:
```json
[
  {
    "label": "fake",
    "score": 0.9973
  },
  {
    "label": "real",
    "score": 0.0027
  }
]
```

**Key Fields**:
- `label`: "fake" (AI-generated) or "real" (human-created)
- `score`: Confidence score (0.00 to 1.00)

---

## Database Schema

### `ai_detection_results`

Stores Hugging Face model detection results for uploaded tracks.

```sql
CREATE TABLE `ai_detection_results` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `trackId` int NOT NULL,
  `isAiGenerated` boolean,
  `confidenceScore` decimal(5, 2), -- 0.00 to 100.00
  `detectedEngine` varchar(100), -- e.g., "Suno AI", "Udio AI", "Unknown"
  `musicIsAi` boolean,
  `musicConfidence` decimal(5, 2),
  `vocalsAreAi` boolean,
  `vocalsConfidence` decimal(5, 2),
  `apiProvider` varchar(50) DEFAULT 'huggingface',
  `rawResponse` json, -- Full model response for debugging
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
   - If artist disclosed prohibited tools (Suno, Udio) → Skip model inference, immediately flag for moderation
   - Otherwise → Run Hugging Face model on track's `audioUrl`
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

## Integration Options

### Option 1: Hugging Face Inference API (Recommended for MVP)

**Pros**:
- Zero infrastructure setup
- Automatic scaling
- Free tier available (1,000 requests/month)
- No model hosting required

**Cons**:
- Rate limits on free tier
- Requires internet connection
- Latency depends on Hugging Face servers

**Implementation**:
```typescript
// server/aiDetection.ts
import { ENV } from './_core/env';

export interface HuggingFaceDetectionResult {
  isAiGenerated: boolean;
  confidenceScore: number; // 0-100
  rawResponse: any;
}

export async function detectAIMusic(audioUrl: string): Promise<HuggingFaceDetectionResult> {
  const HF_API_KEY = ENV.huggingFaceApiKey || 'PLACEHOLDER_API_KEY';
  
  const response = await fetch(
    'https://api-inference.huggingface.co/models/MelodyMachine/Deepfake-audio-detection-V2',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: audioUrl,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.statusText}`);
  }

  const data = await response.json();
  // data = [{ label: 'fake', score: 0.9973 }, { label: 'real', score: 0.0027 }]
  
  const fakeScore = data.find((item: any) => item.label === 'fake')?.score || 0;

  return {
    isAiGenerated: fakeScore > 0.5,
    confidenceScore: Math.round(fakeScore * 100),
    rawResponse: data,
  };
}
```

---

### Option 2: Self-Hosted Python Microservice (Recommended for Production)

**Pros**:
- No rate limits
- Better performance (local inference)
- Full control over model and infrastructure
- No external dependencies

**Cons**:
- Requires Python service deployment
- Needs GPU for faster inference (optional, CPU works but slower)
- More infrastructure to manage

**Implementation**:

**Python Service** (`ai-detection-service/main.py`):
```python
from fastapi import FastAPI, HTTPException
from transformers import pipeline
import uvicorn

app = FastAPI()

# Load model on startup
classifier = pipeline(
    "audio-classification",
    model="MelodyMachine/Deepfake-audio-detection-V2"
)

@app.post("/detect")
async def detect_ai_audio(audio_url: str):
    try:
        result = classifier(audio_url)
        # result = [{'label': 'fake', 'score': 0.9973}, {'label': 'real', 'score': 0.0027}]
        
        fake_score = next((item['score'] for item in result if item['label'] == 'fake'), 0)
        
        return {
            "isAiGenerated": fake_score > 0.5,
            "confidenceScore": round(fake_score * 100, 2),
            "rawResponse": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

**Node.js Backend** (`server/aiDetection.ts`):
```typescript
export async function detectAIMusic(audioUrl: string): Promise<HuggingFaceDetectionResult> {
  const response = await fetch('http://localhost:8001/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio_url: audioUrl }),
  });

  if (!response.ok) {
    throw new Error(`AI detection service error: ${response.statusText}`);
  }

  return await response.json();
}
```

---

### Option 3: Transformers.js (Node.js Native)

**Pros**:
- Single codebase (no Python)
- No external services
- Works in Node.js directly

**Cons**:
- Slower inference than Python
- Limited model support (not all Hugging Face models work)
- Experimental (Transformers.js is still in beta)

**Implementation**:
```typescript
import { pipeline } from '@xenova/transformers';

const classifier = await pipeline(
  'audio-classification',
  'MelodyMachine/Deepfake-audio-detection-V2'
);

const result = await classifier('path/to/audio.mp3');
// result = [{ label: 'fake', score: 0.9973 }, { label: 'real', score: 0.0027 }]
```

---

## Recommended Architecture

### Phase 1: Hugging Face Inference API (Quick Start)
- Use free Inference API for initial implementation
- No infrastructure setup required
- Test accuracy and false positive rate
- Get Hugging Face API key from https://huggingface.co/settings/tokens

### Phase 2: Self-Hosted Python Microservice (Production)
- Deploy Python FastAPI service with model
- Run on same infrastructure as main backend
- Better performance and control
- No rate limits or external dependencies

---

## Getting Started

### Step 1: Get Hugging Face API Key

1. Create account at https://huggingface.co
2. Go to https://huggingface.co/settings/tokens
3. Create new token with "Read" permission
4. Copy token for next step

### Step 2: Add API Key to Environment

Use `webdev_request_secrets` to add the Hugging Face API key:

```typescript
await webdev_request_secrets({
  secrets: [
    {
      key: 'HUGGINGFACE_API_KEY',
      description: 'Hugging Face API key for AI-generated music detection',
      // value: 'hf_xxx' (omit to prompt user for input)
    }
  ]
});
```

### Step 3: Implement Backend Integration

1. Create `server/aiDetection.ts` with `detectAIMusic()` function (see Option 1 code above)
2. Add tRPC mutation to trigger AI detection after track upload
3. Create background job to process detection queue (e.g., every 5 minutes)

### Step 4: Build Admin Moderation UI

Create `/admin/content-moderation` page with:
- Table of pending moderation items
- Audio player for each flagged track
- AI detection results display
- Approve/Remove/Request Proof buttons
- Strike issuance workflow

---

## Testing Without API Key

Until Hugging Face API is integrated, you can test the system with mock data:

```typescript
// server/aiDetection.ts (mock version)
export async function detectAIMusic(audioUrl: string): Promise<HuggingFaceDetectionResult> {
  // Mock response for testing
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  return {
    isAiGenerated: Math.random() > 0.5,
    confidenceScore: Math.floor(Math.random() * 100),
    rawResponse: { mock: true },
  };
}
```

---

## Cost Considerations

**Hugging Face Inference API**:
- **Free tier**: 1,000 requests/month
- **Pro tier**: $9/month for 10,000 requests/month
- **Enterprise**: Custom pricing for unlimited requests

**Self-Hosted**:
- **CPU inference**: ~2-5 seconds per audio file (free, slower)
- **GPU inference**: ~0.5-1 second per audio file (requires GPU server)
- **Recommended**: Start with Inference API, move to self-hosted if volume exceeds 1,000 tracks/month

---

## Next Steps

1. **Get Hugging Face API key** from https://huggingface.co/settings/tokens
2. **Implement backend integration** with `detectAIMusic()` function (Option 1)
3. **Create admin moderation page** at `/admin/content-moderation`
4. **Test with mock data** before enabling live API calls
5. **Monitor false positive rate** and adjust confidence thresholds if needed
6. **Add artist education** linking to `/ai-music-guide` from moderation emails
7. **Consider self-hosted deployment** once volume exceeds free tier limits

---

## Support

For questions about this integration, contact:
- **Hugging Face Support**: https://huggingface.co/support
- **Model Issues**: https://huggingface.co/MelodyMachine/Deepfake-audio-detection-V2/discussions
- **Boptone Development**: [Your team's contact]
