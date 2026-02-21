# AEO Implementation Guide

This guide explains how to integrate the Quantum-Level AEO stack into your Boptone pages.

## Quick Start

### 1. Import AEO Components

```tsx
import { DirectAnswerLayer } from "@/components/aeo/DirectAnswerLayer";
import { FAQSection, PredictedQueriesSection } from "@/components/aeo/FAQSection";
import { SummaryBlock, CitationSignal } from "@/components/aeo/SummaryBlock";
```

### 2. Fetch AEO Data via tRPC

```tsx
// For artist pages
const { data: aeoData } = trpc.aeo.getArtistAEO.useQuery({ artistId });

// For product pages
const { data: aeoData } = trpc.aeo.getProductAEO.useQuery({ productId });
```

### 3. Add Components to Your Page

```tsx
<DirectAnswerLayer
  question={aeoData.directAnswer.question}
  answer={aeoData.directAnswer.answer}
  confidence={aeoData.directAnswer.confidence}
  lastVerified={new Date(aeoData.directAnswer.lastVerified)}
/>

<PredictedQueriesSection queries={aeoData.predictedQueries} />

<FAQSection faqs={aeoData.faqs} pageUrl={currentPageUrl} />

<SummaryBlock
  oneSentenceSummary={aeoData.summaryBlock.oneSentenceSummary}
  keyTakeaways={aeoData.summaryBlock.keyTakeaways}
  relatedLinks={aeoData.summaryBlock.relatedLinks}
/>
```

### 4. Inject Schemas via Helmet

```tsx
import { Helmet } from "react-helmet-async";

<Helmet>
  <script type="application/ld+json">
    {JSON.stringify(aeoData.schemas.faq)}
  </script>
  <script type="application/ld+json">
    {JSON.stringify(aeoData.schemas.artist)}
  </script>
</Helmet>
```

## Page Structure (AEO-First)

```
┌─────────────────────────────────────────┐
│ 1. Direct Answer Layer (Above-the-fold)│  ← LLMs extract this first
│    - Question as H1                     │
│    - 40-60 word answer                  │
│    - Confidence score                   │
│    - Audio snippet (optional)           │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 2. Predicted Queries                    │  ← Pre-answered follow-ups
│    - 5-7 related questions              │
│    - Quick answers                      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 3. Your Existing Content                │  ← Albums, products, etc.
│    - Albums/Products                    │
│    - Stats/Features                     │
│    - Bio/Description                    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 4. FAQ Section                          │  ← Critical for citations
│    - Question-answer pairs              │
│    - FAQPage schema                     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 5. Summary Block                        │  ← Page-end summary
│    - One-sentence summary               │
│    - 3 key takeaways                    │
│    - 3 related links                    │
└─────────────────────────────────────────┘
```

## Backend Integration

### Connecting to Real Data

The AEO router currently uses mock data. To connect to your real database:

1. **Edit `server/routers/aeo.ts`:**

```typescript
// Replace mock data with real database queries
const artist = await db.getArtistById(input.artistId);
const albums = await db.getArtistAlbums(input.artistId);
const stats = await db.getArtistStats(input.artistId);

const artistAEOData: ArtistAEOData = {
  id: artist.id,
  name: artist.stageName,
  username: artist.username,
  bio: artist.bio,
  genres: artist.genres,
  location: {
    city: artist.city,
    state: artist.state,
    country: artist.country
  },
  stats: {
    totalStreams: stats.totalStreams,
    monthlyListeners: stats.monthlyListeners,
    followers: stats.followers,
    releases: albums.length
  },
  albums: albums.map(album => ({
    id: album.id,
    name: album.name,
    releaseDate: album.releaseDate,
    trackCount: album.trackCount,
    streams: album.streams
  })),
  topGenre: artist.genres?.[0],
  topAlbum: albums[0] ? {
    name: albums[0].name,
    year: new Date(albums[0].releaseDate).getFullYear(),
    streams: albums[0].streams
  } : undefined,
  verified: artist.verified,
  updatedAt: artist.updatedAt
};
```

2. **Add database queries to `server/db.ts`:**

```typescript
export async function getArtistStats(artistId: number) {
  const db = await getDb();
  // Query your stats tables
  return {
    totalStreams: 0,
    monthlyListeners: 0,
    followers: 0
  };
}
```

## Citation Signals

Use `CitationSignal` to mark data sources:

```tsx
import { CitationSignal } from "@/components/aeo/SummaryBlock";

<p>
  {artist.name} has 
  <CitationSignal source="platform-verified" verifiedDate={new Date()}>
    {stats.totalStreams} streams
  </CitationSignal>
</p>
```

**Source Types:**
- `artist-verified` - Data provided by artist (90% confidence)
- `platform-verified` - Data confirmed by Boptone (98% confidence)
- `estimated` - Calculated/inferred (75% confidence)
- `subjective` - Opinion-based (60% confidence)

## Testing Your AEO Implementation

### 1. Google Rich Results Test

Visit: https://search.google.com/test/rich-results

Paste your page URL to verify FAQPage schema is valid.

### 2. Schema.org Validator

Visit: https://validator.schema.org/

Paste your page HTML to verify all structured data.

### 3. ChatGPT Citation Test

Ask ChatGPT: "Who is [Artist Name]?"

If implemented correctly, ChatGPT should cite your Boptone page.

### 4. Confidence Score Check

Ensure confidence scores are >0.85 for best citation rates:
- Update artist data regularly (< 30 days old)
- Fill all critical fields (bio, genres, location, stats)
- Mark artists as verified when possible

## Performance Optimization

### Caching AEO Data

AEO content is relatively static. Cache it:

```typescript
// In your tRPC procedure
const cacheKey = `aeo:artist:${artistId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const aeoData = generateAEOData(artist);
await redis.set(cacheKey, JSON.stringify(aeoData), 'EX', 3600); // 1 hour

return aeoData;
```

### Lazy Loading

Load AEO components after critical content:

```tsx
import { lazy, Suspense } from "react";

const FAQSection = lazy(() => import("@/components/aeo/FAQSection"));
const SummaryBlock = lazy(() => import("@/components/aeo/SummaryBlock"));

<Suspense fallback={<div>Loading...</div>}>
  <FAQSection faqs={faqs} pageUrl={pageUrl} />
</Suspense>
```

## Monitoring & Analytics

### Track Citation Performance

Add citation tracking middleware (already implemented in `server/middleware/citationTracking.ts`):

```typescript
// Detect LLM referrers
const llmSources = {
  "chatgpt.com": "ChatGPT",
  "perplexity.ai": "Perplexity",
  "google.com": "Google AI"
};

// Log citations
await db.insert(citations).values({
  artistId,
  source: llmSource,
  timestamp: new Date()
});
```

### Dashboard Metrics

Show artists their citation stats:

```tsx
const { data: citationStats } = trpc.analytics.getCitationStats.useQuery({ artistId });

<div>
  <h3>AI Citations This Month</h3>
  <p>{citationStats.totalCitations} times</p>
  
  <h4>Top Sources</h4>
  <ul>
    <li>ChatGPT: {citationStats.citationsBySource.ChatGPT}</li>
    <li>Perplexity: {citationStats.citationsBySource.Perplexity}</li>
  </ul>
</div>
```

## Troubleshooting

### "Direct answer too long/short"

Adjust answer generation in `server/aeo.ts`:

```typescript
// Target 40-60 words
const answer = parts.join("").substring(0, 300); // Limit to ~60 words
```

### "Confidence score too low"

Check data freshness and completeness:

```typescript
console.log("Confidence factors:", {
  daysSinceUpdate,
  hasBio: !!artist.bio,
  hasGenres: artist.genres?.length > 0,
  hasLocation: !!artist.location,
  hasStats: !!artist.stats?.totalStreams
});
```

### "FAQPage schema not validating"

Ensure all required fields are present:

```json
{
  "@type": "Question",
  "name": "Required",
  "acceptedAnswer": {
    "@type": "Answer",
    "text": "Required"
  }
}
```

## Next Steps

1. **Integrate into existing artist profile pages** - Replace mock data with real queries
2. **Add to product pages** - Use `getProductAEO` for BopShop products
3. **Enable audio snippets** - Integrate TTS for voice search optimization
4. **Build citation dashboard** - Show artists when they're cited by AI
5. **Expand to other pages** - Genre pages, location pages, platform pages

## Reference Files

- **Strategy:** `docs/AEO_STRATEGY.md`
- **Utilities:** `server/aeo.ts`
- **Schemas:** `server/aeoSchema.ts`
- **Router:** `server/routers/aeo.ts`
- **Components:** `client/src/components/aeo/`
- **Example:** `client/src/pages/ArtistProfileAEO.tsx`

## Support

For questions or issues with AEO implementation, refer to the full strategy document at `docs/AEO_STRATEGY.md`.
