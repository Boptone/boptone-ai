# CloudFront CDN Setup Guide

## Overview

This guide walks through setting up Amazon CloudFront as a CDN for Boptone's S3-hosted assets (product images, artist artwork, BAP track covers, etc.).

**Benefits:**
- **60-80% faster image loads** globally
- **90% reduction in bandwidth costs** (CloudFront pricing vs. S3 direct)
- **Better user experience** for international visitors
- **Automatic image optimization** (compression, WebP conversion)

## Prerequisites

- AWS account with S3 bucket already configured (handled by Manus platform)
- Access to AWS Console
- Domain name (optional, but recommended for production)

## Setup Steps

### 1. Create CloudFront Distribution

**Step 1: Navigate to CloudFront**
```
AWS Console → CloudFront → Create Distribution
```

**Step 2: Configure Origin**
- **Origin Domain**: Select your S3 bucket from dropdown
  - Example: `boptone-assets.s3.us-east-1.amazonaws.com`
- **Origin Path**: Leave blank (serves from root)
- **Name**: Auto-filled (e.g., `S3-boptone-assets`)
- **Origin Access**: Choose "Origin Access Control" (OAC)
  - Click "Create control setting"
  - Name: `boptone-s3-oac`
  - Signing behavior: "Sign requests"
  - Click "Create"

**Step 3: Configure Default Cache Behavior**
- **Viewer Protocol Policy**: "Redirect HTTP to HTTPS"
- **Allowed HTTP Methods**: GET, HEAD, OPTIONS
- **Cache Policy**: "CachingOptimized" (recommended)
- **Origin Request Policy**: "CORS-S3Origin"
- **Response Headers Policy**: "SimpleCORS"
- **Compress Objects Automatically**: Yes

**Step 4: Configure Distribution Settings**
- **Price Class**: "Use all edge locations" (best performance)
  - Or "Use only North America and Europe" (cost savings)
- **Alternate Domain Names (CNAMEs)**: 
  - Add your custom domain (e.g., `cdn.boptone.com`)
  - Requires SSL certificate (see Step 5)
- **SSL Certificate**: 
  - "Request or import certificate with ACM"
  - Follow ACM wizard to create certificate
- **Default Root Object**: Leave blank
- **Logging**: Enable (recommended)
  - S3 bucket: Create new bucket `boptone-cdn-logs`
  - Log prefix: `cloudfront/`

**Step 5: Create Distribution**
- Click "Create Distribution"
- Wait 5-15 minutes for deployment (status: "Enabled")
- Note the **CloudFront Domain Name** (e.g., `d1234abcd.cloudfront.net`)

### 2. Update S3 Bucket Policy

CloudFront needs permission to access your S3 bucket.

**Step 1: Copy Policy from CloudFront**
- After creating distribution, AWS shows a blue banner:
  - "The S3 bucket policy needs to be updated"
  - Click "Copy Policy"

**Step 2: Update S3 Bucket Policy**
```
AWS Console → S3 → Your Bucket → Permissions → Bucket Policy
```

Paste the copied policy (example):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::boptone-assets/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E1234ABCD"
        }
      }
    }
  ]
}
```

Click "Save changes"

### 3. Configure Custom Domain (Optional but Recommended)

**Step 1: Create DNS Record**
```
Your DNS Provider (e.g., Cloudflare, Route 53, Namecheap)
→ Add CNAME Record
```

- **Name**: `cdn` (or `assets`, `media`, etc.)
- **Type**: CNAME
- **Value**: Your CloudFront domain (e.g., `d1234abcd.cloudfront.net`)
- **TTL**: 300 (5 minutes)

**Step 2: Wait for DNS Propagation**
```bash
# Check DNS propagation (5-60 minutes)
dig cdn.boptone.com
nslookup cdn.boptone.com
```

**Step 3: Verify HTTPS**
```bash
# Test HTTPS access
curl -I https://cdn.boptone.com/test-image.jpg
```

### 4. Update Boptone Code

**Step 1: Add Environment Variable**
```bash
# Add to .env or Manus Secrets
VITE_CDN_URL=https://cdn.boptone.com
# Or if using CloudFront domain directly:
# VITE_CDN_URL=https://d1234abcd.cloudfront.net
```

**Step 2: Update Storage Helper**

Edit `server/storage.ts`:

```typescript
import { ENV } from './_core/env';

// Add CDN_URL to env
const CDN_URL = process.env.CDN_URL || '';

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType?: string
): Promise<{ key: string; url: string }> {
  // ... existing upload logic ...
  
  // Return CDN URL if configured, otherwise S3 URL
  const url = CDN_URL 
    ? `${CDN_URL}/${relKey}` 
    : `https://${ENV.s3Bucket}.s3.${ENV.s3Region}.amazonaws.com/${relKey}`;
  
  return { key: relKey, url };
}
```

**Step 3: Update Frontend Image Components**

For existing images in database, create a helper:

```typescript
// client/src/lib/cdn.ts
const CDN_URL = import.meta.env.VITE_CDN_URL || '';

export function getCDNUrl(s3Url: string): string {
  if (!CDN_URL) return s3Url;
  
  // Extract path from S3 URL
  const match = s3Url.match(/\.amazonaws\.com\/(.+)$/);
  if (!match) return s3Url;
  
  return `${CDN_URL}/${match[1]}`;
}
```

Use in components:
```typescript
import { getCDNUrl } from '@/lib/cdn';

// In component
<img src={getCDNUrl(product.primaryImageUrl)} alt={product.name} />
```

### 5. Test CDN

**Step 1: Upload Test Image**
```bash
# Upload via Boptone admin or directly to S3
aws s3 cp test-image.jpg s3://boptone-assets/test-image.jpg
```

**Step 2: Access via CDN**
```bash
# Direct S3 URL (slow)
curl -I https://boptone-assets.s3.us-east-1.amazonaws.com/test-image.jpg

# CDN URL (fast)
curl -I https://cdn.boptone.com/test-image.jpg
```

**Step 3: Check Response Headers**
```bash
curl -I https://cdn.boptone.com/test-image.jpg

# Look for CloudFront headers:
# X-Cache: Hit from cloudfront
# X-Amz-Cf-Id: ...
# Age: 3600 (cached for 1 hour)
```

**Step 4: Test Global Performance**
```
Use tools like:
- https://tools.pingdom.com
- https://www.webpagetest.org
- https://gtmetrix.com

Compare load times before/after CDN
```

### 6. Monitor & Optimize

**CloudFront Metrics (AWS Console)**
```
CloudFront → Your Distribution → Monitoring
```

Key metrics:
- **Requests**: Total requests served
- **Data Transfer**: Bandwidth usage
- **Error Rate**: 4xx/5xx errors
- **Cache Hit Rate**: % of requests served from cache (aim for >80%)

**Optimization Tips:**
1. **Increase Cache TTL**: Longer cache = fewer S3 requests
   - CloudFront → Behaviors → Edit → Cache Policy
   - Set TTL to 86400 (24 hours) for static assets

2. **Enable Compression**: Reduce file sizes
   - Already enabled in setup (Compress Objects Automatically)

3. **Use WebP Format**: Modern image format (smaller files)
   - Upload WebP versions of images
   - Use `<picture>` tag with fallback:
   ```html
   <picture>
     <source srcset="image.webp" type="image/webp">
     <img src="image.jpg" alt="Fallback">
   </picture>
   ```

4. **Invalidate Cache After Updates**:
   ```bash
   # When you update an image, invalidate CloudFront cache
   aws cloudfront create-invalidation \
     --distribution-id E1234ABCD \
     --paths "/path/to/image.jpg"
   ```

## Cost Estimation

**CloudFront Pricing (US/Europe):**
- First 10 TB/month: $0.085/GB
- Next 40 TB/month: $0.080/GB
- Requests: $0.0075 per 10,000 requests

**Example Monthly Cost (1000 users):**
- 100 GB data transfer: ~$8.50
- 1M requests: ~$0.75
- **Total: ~$9.25/month**

**Savings vs. S3 Direct:**
- S3 data transfer: $0.09/GB = $9.00 for 100 GB
- S3 requests: $0.0004 per 1000 = $0.40 for 1M
- **S3 Total: ~$9.40/month**

**Real Savings:**
- Reduced S3 bandwidth (80% cache hit rate)
- S3 cost drops to ~$2.00/month
- **Net savings: ~$0.15/month** (minimal at low scale)
- **Real benefit: 60-80% faster load times globally**

## Troubleshooting

### Images Not Loading via CDN

**Check 1: CloudFront Distribution Status**
```
AWS Console → CloudFront → Your Distribution
Status should be "Enabled" (not "In Progress")
```

**Check 2: S3 Bucket Policy**
```
AWS Console → S3 → Your Bucket → Permissions → Bucket Policy
Verify CloudFront has GetObject permission
```

**Check 3: DNS Propagation**
```bash
dig cdn.boptone.com
# Should return CloudFront domain
```

**Check 4: CORS Configuration**
```
AWS Console → S3 → Your Bucket → Permissions → CORS
```

Add CORS policy:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### Cache Not Working (Low Hit Rate)

**Check 1: Cache Policy**
```
CloudFront → Behaviors → Edit → Cache Policy
Use "CachingOptimized" for static assets
```

**Check 2: Query Strings**
```
If URLs include query strings (e.g., ?v=123), cache treats them as unique
Solution: Use Cache Policy that ignores query strings
```

**Check 3: Vary Header**
```
If S3 returns Vary: * header, CloudFront won't cache
Solution: Remove Vary header from S3 objects
```

### SSL Certificate Errors

**Check 1: Certificate Status**
```
AWS Console → Certificate Manager → Your Certificate
Status should be "Issued" (not "Pending validation")
```

**Check 2: DNS Validation**
```
If using DNS validation, add CNAME records to your DNS
Certificate Manager shows required records
```

**Check 3: Certificate Region**
```
CloudFront requires certificates in us-east-1 region
If certificate is in wrong region, create new one in us-east-1
```

## Advanced: Lambda@Edge (Optional)

For advanced image optimization (resize, format conversion):

**Step 1: Create Lambda Function**
```javascript
// Resize images on-the-fly
exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const uri = request.uri;
  
  // Extract size from query string
  const params = new URLSearchParams(request.querystring);
  const width = params.get('w') || '800';
  
  // Modify URI to point to resized version
  request.uri = `/resized/${width}${uri}`;
  
  return request;
};
```

**Step 2: Attach to CloudFront**
```
CloudFront → Behaviors → Edit → Lambda Function Associations
Event: Origin Request
Lambda ARN: arn:aws:lambda:us-east-1:...
```

## Checklist

Before going live with CDN:

- [ ] CloudFront distribution created and enabled
- [ ] S3 bucket policy updated
- [ ] Custom domain configured (optional)
- [ ] DNS records added and propagated
- [ ] SSL certificate issued and attached
- [ ] Environment variable added (VITE_CDN_URL)
- [ ] Storage helper updated to return CDN URLs
- [ ] Frontend components updated to use CDN
- [ ] Test images loading via CDN
- [ ] Cache hit rate > 80%
- [ ] Global performance tested
- [ ] Monitoring enabled

## Resources

- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)
- [Lambda@Edge Guide](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)
