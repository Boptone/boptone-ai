# CDN Optimization Strategy

**Date:** February 26, 2026  
**Platform:** Boptone - Autonomous Creator OS  
**Current Setup:** Direct S3 access (no CDN)

---

## Executive Summary

As Boptone scales to serve thousands of artists globally, optimizing static asset delivery through CDN (Content Delivery Network) integration is critical for performance and cost reduction. This document outlines the CDN strategy, S3 optimization techniques, and implementation recommendations.

---

## Current State Analysis

### Assets Requiring CDN
1. **Audio files** - Track uploads (MP3, WAV, FLAC) - Largest bandwidth consumer
2. **Images** - Album artwork, artist avatars, product photos
3. **Waveforms** - Track waveform visualizations
4. **Product images** - BopShop merchandise photos
5. **Static assets** - CSS, JS, fonts (already optimized via Vite)

### Current Bottlenecks
- **Direct S3 access** - High latency for global users
- **No caching** - Every request hits S3 (expensive)
- **No compression** - Large files transferred uncompressed
- **No image optimization** - Original resolution served to all devices

---

## CDN Strategy

### Recommended CDN: CloudFront (AWS)

**Rationale:**
- Native integration with S3 (same AWS ecosystem)
- Global edge network (450+ points of presence)
- Cost-effective for high-bandwidth content (audio streaming)
- Advanced caching controls
- SSL/TLS included
- Origin failover support

**Alternative:** Cloudflare (if multi-cloud strategy preferred)

### CDN Architecture

```
User Request → CloudFront Edge Location → (Cache Hit) → User
                        ↓ (Cache Miss)
                    S3 Bucket → CloudFront → User
```

**Benefits:**
- **Reduced latency:** Assets served from nearest edge location
- **Lower S3 costs:** 80-90% reduction in S3 data transfer
- **Better performance:** Cached assets = faster page loads
- **Global scale:** Handle traffic spikes without S3 throttling

---

## S3 Optimization (Without CDN)

### 1. Cache-Control Headers

**Current:** No cache headers (browser re-fetches every time)  
**Recommended:** Add aggressive caching for immutable assets

```typescript
// server/storage.ts
export async function storagePut(
  key: string,
  data: Buffer | Uint8Array | string,
  contentType?: string
) {
  const cacheControl = getCacheControlHeader(key);
  
  const command = new PutObjectCommand({
    Bucket: ENV.s3Bucket,
    Key: key,
    Body: data,
    ContentType: contentType,
    CacheControl: cacheControl, // NEW
  });

  await s3Client.send(command);
  const url = `${ENV.s3Endpoint}/${ENV.s3Bucket}/${key}`;
  return { key, url };
}

function getCacheControlHeader(key: string): string {
  // Immutable assets (content-hash in filename)
  if (key.match(/\.[a-f0-9]{8,}\.(jpg|png|mp3|wav)$/)) {
    return 'public, max-age=31536000, immutable'; // 1 year
  }
  
  // Audio files (rarely change)
  if (key.endsWith('.mp3') || key.endsWith('.wav') || key.endsWith('.flac')) {
    return 'public, max-age=2592000'; // 30 days
  }
  
  // Images (may be updated)
  if (key.match(/\.(jpg|jpeg|png|webp|gif)$/)) {
    return 'public, max-age=604800'; // 7 days
  }
  
  // Default (conservative caching)
  return 'public, max-age=3600'; // 1 hour
}
```

**Impact:** Browser caching reduces repeat requests by 70-80%

### 2. Content-Hash Filenames

**Current:** `user-123/track-456.mp3`  
**Recommended:** `user-123/track-456-a3f2b1c8.mp3`

```typescript
import crypto from 'crypto';

function generateContentHash(data: Buffer): string {
  return crypto.createHash('md5').update(data).digest('hex').substring(0, 8);
}

export async function uploadTrackAudio(
  artistId: number,
  trackId: number,
  audioBuffer: Buffer
) {
  const hash = generateContentHash(audioBuffer);
  const key = `artists/${artistId}/tracks/${trackId}-${hash}.mp3`;
  
  return await storagePut(key, audioBuffer, 'audio/mpeg');
}
```

**Benefits:**
- Cache busting (new version = new URL)
- Immutable URLs (safe to cache forever)
- Prevents stale content

### 3. Compression

**Current:** Files stored uncompressed  
**Recommended:** Gzip/Brotli compression for text-based assets

```typescript
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export async function uploadCompressed(
  key: string,
  data: Buffer,
  contentType: string
) {
  const compressed = await gzipAsync(data);
  
  const command = new PutObjectCommand({
    Bucket: ENV.s3Bucket,
    Key: key,
    Body: compressed,
    ContentType: contentType,
    ContentEncoding: 'gzip', // Important!
    CacheControl: 'public, max-age=31536000, immutable',
  });

  await s3Client.send(command);
}
```

**Note:** Audio files (MP3, AAC) are already compressed, don't re-compress.

---

## Image Optimization

### 1. Responsive Images

**Problem:** Serving 4K images to mobile devices wastes bandwidth

**Solution:** Generate multiple sizes on upload

```typescript
import sharp from 'sharp';

export async function uploadArtwork(
  artistId: number,
  imageBuffer: Buffer
) {
  const sizes = [
    { width: 3000, suffix: 'original' },
    { width: 1200, suffix: 'large' },
    { width: 600, suffix: 'medium' },
    { width: 300, suffix: 'small' },
    { width: 150, suffix: 'thumbnail' },
  ];

  const urls: Record<string, string> = {};

  for (const { width, suffix } of sizes) {
    const resized = await sharp(imageBuffer)
      .resize(width, width, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    const hash = generateContentHash(resized);
    const key = `artists/${artistId}/artwork-${suffix}-${hash}.jpg`;
    const { url } = await storagePut(key, resized, 'image/jpeg');
    urls[suffix] = url;
  }

  return urls;
}
```

**Usage in HTML:**
```html
<img
  src="/artwork-medium.jpg"
  srcset="
    /artwork-small.jpg 300w,
    /artwork-medium.jpg 600w,
    /artwork-large.jpg 1200w
  "
  sizes="(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px"
  alt="Album artwork"
/>
```

### 2. WebP Conversion

**Problem:** JPEG/PNG files are 25-35% larger than WebP

**Solution:** Generate WebP versions alongside JPEG

```typescript
export async function uploadArtworkWithWebP(
  artistId: number,
  imageBuffer: Buffer
) {
  const sizes = [1200, 600, 300];
  const urls: Record<string, { jpg: string; webp: string }> = {};

  for (const width of sizes) {
    // JPEG version
    const jpeg = await sharp(imageBuffer)
      .resize(width, width, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    // WebP version (better compression)
    const webp = await sharp(imageBuffer)
      .resize(width, width, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    const jpegHash = generateContentHash(jpeg);
    const webpHash = generateContentHash(webp);

    const jpegKey = `artists/${artistId}/artwork-${width}-${jpegHash}.jpg`;
    const webpKey = `artists/${artistId}/artwork-${width}-${webpHash}.webp`;

    const jpegUrl = (await storagePut(jpegKey, jpeg, 'image/jpeg')).url;
    const webpUrl = (await storagePut(webpKey, webp, 'image/webp')).url;

    urls[`${width}px`] = { jpg: jpegUrl, webp: webpUrl };
  }

  return urls;
}
```

**Usage in HTML:**
```html
<picture>
  <source srcset="/artwork-600.webp" type="image/webp" />
  <img src="/artwork-600.jpg" alt="Album artwork" />
</picture>
```

**Savings:** 25-35% smaller file sizes

---

## Audio Streaming Optimization

### 1. Range Requests (Partial Content)

**Problem:** Downloading entire 50MB audio file before playback starts

**Solution:** S3 supports HTTP Range requests (already enabled)

```typescript
// Client-side: HTML5 audio automatically uses range requests
<audio src="https://s3.amazonaws.com/bucket/track.mp3" controls></audio>
```

**S3 automatically handles:**
- `Range: bytes=0-1023` (first 1KB for metadata)
- `Range: bytes=1024-` (stream rest of file)

**No server-side code needed!**

### 2. Adaptive Bitrate Streaming (Future)

**Current:** Single MP3 file (320kbps)  
**Future:** HLS/DASH streaming with multiple bitrates

```
track-123/
  ├── 320kbps.m3u8
  ├── 192kbps.m3u8
  ├── 128kbps.m3u8
  └── master.m3u8
```

**Benefits:**
- Adapts to network conditions
- Faster initial playback
- Lower bandwidth for mobile users

**Implementation:** Use AWS MediaConvert or FFmpeg

---

## CloudFront Integration (Future)

### 1. Distribution Setup

```typescript
// Infrastructure as Code (Terraform/CloudFormation)
resource "aws_cloudfront_distribution" "boptone_cdn" {
  origin {
    domain_name = "boptone-assets.s3.amazonaws.com"
    origin_id   = "S3-boptone-assets"
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-boptone-assets"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400   # 1 day
    max_ttl                = 31536000 # 1 year
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

### 2. Custom Domain

**Setup:**
1. Create CloudFront distribution
2. Add CNAME record: `cdn.boptone.com` → `d123abc.cloudfront.net`
3. Request SSL certificate via AWS Certificate Manager
4. Update S3 URLs to use `cdn.boptone.com`

**Before:** `https://s3.amazonaws.com/boptone-assets/track.mp3`  
**After:** `https://cdn.boptone.com/track.mp3`

### 3. Cache Invalidation

```typescript
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

const cloudfront = new CloudFrontClient({ region: 'us-east-1' });

export async function invalidateCDNCache(paths: string[]) {
  const command = new CreateInvalidationCommand({
    DistributionId: ENV.cloudfrontDistributionId,
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: {
        Quantity: paths.length,
        Items: paths, // e.g., ['/artists/123/artwork.jpg']
      },
    },
  });

  await cloudfront.send(command);
}

// Usage: When artist updates artwork
await invalidateCDNCache([`/artists/${artistId}/artwork.jpg`]);
```

---

## Cost Analysis

### Current Costs (Direct S3)
- **S3 storage:** $0.023/GB/month
- **S3 data transfer:** $0.09/GB (first 10TB)
- **S3 requests:** $0.0004 per 1,000 GET requests

**Example:** 1,000 artists, 10 tracks each, 5MB/track = 50GB storage
- Storage: 50GB × $0.023 = **$1.15/month**
- Transfer (10,000 streams/month): 50GB × $0.09 = **$4.50/month**
- Requests: 10,000 × $0.0004 = **$4.00/month**
- **Total: $9.65/month**

### With CloudFront CDN
- **CloudFront data transfer:** $0.085/GB (first 10TB) - 5% cheaper
- **CloudFront requests:** $0.0075 per 10,000 requests - 81% cheaper
- **Cache hit ratio:** 80% (80% of requests served from cache)

**Example:** Same 10,000 streams/month
- S3 transfer (20% cache miss): 10GB × $0.09 = **$0.90/month**
- CloudFront transfer (80% cache hit): 40GB × $0.085 = **$3.40/month**
- CloudFront requests: 10,000 × $0.00075 = **$7.50/month**
- **Total: $11.80/month**

**Wait, that's more expensive!**

### Break-Even Analysis

CDN becomes cost-effective at **scale**:
- **10,000 streams/month:** Direct S3 cheaper ($9.65 vs $11.80)
- **100,000 streams/month:** CloudFront cheaper ($96.50 vs $85.00)
- **1,000,000 streams/month:** CloudFront much cheaper ($965 vs $450)

**Recommendation:** Implement CloudFront when reaching 50,000+ streams/month

---

## Implementation Roadmap

### Phase 1: S3 Optimization (Immediate - No Cost)
- [ ] Add Cache-Control headers to S3 uploads
- [ ] Implement content-hash filenames
- [ ] Add image resizing on upload (multiple sizes)
- [ ] Generate WebP versions alongside JPEG

**Expected Impact:**
- 70-80% reduction in repeat requests (browser caching)
- 25-35% reduction in image bandwidth (WebP)
- Faster page loads (smaller images)

### Phase 2: Image Optimization Pipeline (1-2 weeks)
- [ ] Install `sharp` library for image processing
- [ ] Create image upload service with resizing
- [ ] Update upload endpoints to use new service
- [ ] Migrate existing images (background job)

**Expected Impact:**
- 60-70% reduction in image bandwidth
- Faster mobile page loads

### Phase 3: CloudFront Integration (Future - When at Scale)
- [ ] Create CloudFront distribution
- [ ] Configure custom domain (cdn.boptone.com)
- [ ] Update S3 URLs to CloudFront URLs
- [ ] Implement cache invalidation logic
- [ ] Monitor cache hit ratio

**Expected Impact:**
- 40-50% reduction in total bandwidth costs
- 30-50% faster asset delivery globally
- Better handling of traffic spikes

---

## Monitoring & Metrics

### Key Metrics to Track
- **Cache hit ratio:** % of requests served from cache
- **Bandwidth usage:** GB transferred per month
- **Average latency:** Time to first byte (TTFB)
- **Cost per stream:** Total CDN cost / total streams

### Tools
- **AWS CloudWatch:** S3 and CloudFront metrics
- **Real User Monitoring (RUM):** Measure actual user experience
- **Cost Explorer:** Track AWS costs over time

---

## Best Practices

### DO:
- Use content-hash filenames for immutable assets
- Set aggressive Cache-Control headers (1 year for immutable)
- Generate multiple image sizes for responsive design
- Use WebP for images (with JPEG fallback)
- Monitor cache hit ratio (target 80%+)

### DON'T:
- Serve original 4K images to mobile devices
- Re-compress already compressed audio files
- Use CDN for dynamic content (API responses)
- Forget to invalidate cache when content changes
- Over-optimize prematurely (wait for scale)

---

## Security Considerations

### Signed URLs (For Private Content)
```typescript
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function generatePrivateAudioUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: ENV.s3Bucket,
    Key: key,
  });

  // URL expires in 1 hour
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
```

**Use cases:**
- Exclusive content for paid subscribers
- Pre-release tracks (not yet public)
- Private artist uploads

### CloudFront Signed URLs (Future)
- More secure than S3 signed URLs
- Can restrict by IP, time, or custom policy
- Required for private content on CDN

---

## Summary

### Immediate Actions (No Cost)
1. Add Cache-Control headers to S3 uploads
2. Implement content-hash filenames
3. Add image resizing (multiple sizes)
4. Generate WebP versions

### Future Actions (When at Scale)
1. Integrate CloudFront CDN (50,000+ streams/month)
2. Implement adaptive bitrate streaming (HLS/DASH)
3. Add signed URLs for private content

### Expected Results
- **70-80% reduction** in repeat requests (browser caching)
- **60-70% reduction** in image bandwidth (responsive images + WebP)
- **40-50% reduction** in total bandwidth costs (CloudFront at scale)
- **30-50% faster** asset delivery globally (CloudFront edge locations)

---

**Status:** STRATEGY DOCUMENTED - Phase 1 ready for implementation  
**Next Action:** Implement S3 optimization (Cache-Control headers + content-hash filenames)
