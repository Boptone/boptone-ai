# API Versioning Strategy

**Date:** February 26, 2026  
**Platform:** Boptone - Autonomous Creator OS  
**Current API Version:** v1 (implicit)

---

## Executive Summary

As Boptone scales to serve thousands of artists and integrates with third-party platforms, a robust API versioning strategy is critical to prevent breaking changes from disrupting existing integrations. This document outlines the versioning approach, implementation plan, and best practices for maintaining backward compatibility.

---

## Versioning Approach

### URL-Based Versioning
**Format:** `/api/v{version}/{endpoint}`

**Examples:**
```
/api/v1/tracks
/api/v1/orders
/api/v2/tracks (with breaking changes)
```

**Rationale:**
- Clear and explicit version in URL
- Easy to cache at CDN level
- Simple for third-party integrators to understand
- No header parsing required

### Version Lifecycle

**Supported Versions:** Current + Previous (N and N-1)
- **v1 (Current):** Fully supported, actively maintained
- **v2 (Future):** New features, breaking changes allowed
- **v0 (Deprecated):** 6-month sunset period, then removed

**Deprecation Policy:**
1. Announce deprecation 6 months in advance
2. Add `X-API-Deprecation` header to responses
3. Send email notifications to API consumers
4. Provide migration guide with code examples
5. Remove deprecated version after sunset period

---

## Implementation Architecture

### 1. Version Routing Middleware

Create a version router that maps requests to the correct handler:

```typescript
// server/_core/apiVersion.ts
import { Request, Response, NextFunction } from 'express';

export type ApiVersion = 'v1' | 'v2';

export function extractApiVersion(req: Request): ApiVersion {
  const match = req.path.match(/^\/api\/(v\d+)\//);
  return (match?.[1] as ApiVersion) ?? 'v1'; // Default to v1
}

export function versionMiddleware(req: Request, res: Response, next: NextFunction) {
  const version = extractApiVersion(req);
  req.apiVersion = version;
  
  // Add version header to response
  res.setHeader('X-API-Version', version);
  
  next();
}
```

### 2. Version-Specific Routers

Organize routers by version:

```
server/
  routers/
    v1/
      tracks.ts
      orders.ts
      payments.ts
    v2/
      tracks.ts (with breaking changes)
      orders.ts
```

### 3. Shared Business Logic

Keep business logic version-agnostic:

```typescript
// server/services/trackService.ts
export async function getTrackById(id: number) {
  // Business logic stays the same across versions
  return db.query.bapTracks.findFirst({ where: eq(bapTracks.id, id) });
}

// server/routers/v1/tracks.ts
export const tracksV1Router = router({
  getTrack: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const track = await getTrackById(input.id);
      // V1 response format
      return {
        id: track.id,
        title: track.title,
        artist: track.artist,
        // ... v1 fields
      };
    }),
});

// server/routers/v2/tracks.ts
export const tracksV2Router = router({
  getTrack: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const track = await getTrackById(input.id);
      // V2 response format (breaking changes)
      return {
        trackId: track.id, // Renamed field
        metadata: {
          title: track.title,
          artist: track.artist,
        },
        // ... v2 nested structure
      };
    }),
});
```

### 4. Deprecation Headers

Add deprecation warnings to responses:

```typescript
export function deprecationMiddleware(req: Request, res: Response, next: NextFunction) {
  const version = req.apiVersion;
  
  if (version === 'v1' && isDeprecated('v1')) {
    res.setHeader('X-API-Deprecation', 'true');
    res.setHeader('X-API-Sunset-Date', '2027-06-01');
    res.setHeader('X-API-Migration-Guide', 'https://docs.boptone.com/api/v1-to-v2');
  }
  
  next();
}
```

---

## Breaking vs. Non-Breaking Changes

### Non-Breaking Changes (Same Version)
- Adding new optional fields
- Adding new endpoints
- Adding new query parameters (optional)
- Deprecating fields (but still returning them)
- Performance improvements
- Bug fixes

### Breaking Changes (New Version Required)
- Removing fields from responses
- Renaming fields
- Changing field types (string → number)
- Changing response structure (flat → nested)
- Removing endpoints
- Making optional fields required
- Changing authentication method

---

## Migration Strategy

### Phase 1: Establish v1 Baseline (Current State)
1. Document all existing endpoints as "v1"
2. Add version middleware to tRPC router
3. Add `X-API-Version: v1` header to all responses
4. Create API changelog document

### Phase 2: Implement Version Routing
1. Create `server/routers/v1/` directory
2. Move existing routers to v1 folder
3. Update imports in main router
4. Test that all endpoints work with `/api/v1/` prefix

### Phase 3: Add Deprecation Support
1. Create deprecation tracking system
2. Add deprecation headers middleware
3. Create migration guide template
4. Set up email notification system for API consumers

### Phase 4: Prepare for v2 (Future)
1. Identify breaking changes needed
2. Create `server/routers/v2/` directory
3. Implement v2 endpoints with breaking changes
4. Run both v1 and v2 in parallel for 6 months
5. Deprecate v1 after v2 is stable

---

## API Documentation

### Changelog Format

```markdown
# API Changelog

## v2.0.0 (2027-01-01)
### Breaking Changes
- `GET /api/v2/tracks/:id` - Response structure changed from flat to nested
  - Before: `{ id, title, artist, ... }`
  - After: `{ trackId, metadata: { title, artist }, ... }`

### New Features
- `POST /api/v2/tracks/batch` - Batch upload endpoint

### Deprecations
- `GET /api/v1/tracks/:id` - Deprecated, use v2 instead (sunset: 2027-06-01)

## v1.5.0 (2026-09-01)
### New Features
- `GET /api/v1/tracks/:id/analytics` - Track analytics endpoint

### Bug Fixes
- Fixed pagination bug in `GET /api/v1/orders`
```

### Migration Guide Template

```markdown
# Migrating from v1 to v2

## Overview
v2 introduces a more structured response format and improved error handling.

## Breaking Changes

### 1. Track Response Structure
**v1:**
```json
{
  "id": 123,
  "title": "Song Title",
  "artist": "Artist Name"
}
```

**v2:**
```json
{
  "trackId": 123,
  "metadata": {
    "title": "Song Title",
    "artist": "Artist Name"
  }
}
```

**Migration Code:**
```typescript
// Before (v1)
const track = await fetch('/api/v1/tracks/123').then(r => r.json());
console.log(track.title);

// After (v2)
const track = await fetch('/api/v2/tracks/123').then(r => r.json());
console.log(track.metadata.title);
```

## Timeline
- **2026-12-01:** v2 released
- **2027-01-01:** v1 deprecated
- **2027-06-01:** v1 sunset (removed)
```

---

## tRPC-Specific Considerations

### Current Architecture
Boptone uses tRPC, which doesn't expose traditional REST endpoints. The versioning strategy needs to work within tRPC's procedure-based architecture.

### Approach 1: Versioned Routers (Recommended)
```typescript
// server/routers.ts
export const appRouter = router({
  v1: router({
    tracks: tracksV1Router,
    orders: ordersV1Router,
  }),
  v2: router({
    tracks: tracksV2Router,
    orders: ordersV2Router,
  }),
});

// Client usage
const track = await trpc.v1.tracks.getById.query({ id: 123 });
const trackV2 = await trpc.v2.tracks.getById.query({ id: 123 });
```

### Approach 2: Version Context (Alternative)
```typescript
// Add version to tRPC context
export const createContext = ({ req, res }: CreateContextOptions) => {
  const version = extractApiVersion(req);
  return {
    req,
    res,
    apiVersion: version,
    user: null,
  };
};

// Use version in procedures
export const getTrack = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input, ctx }) => {
    const track = await getTrackById(input.id);
    
    if (ctx.apiVersion === 'v1') {
      return formatTrackV1(track);
    } else {
      return formatTrackV2(track);
    }
  });
```

**Recommendation:** Use Approach 1 (Versioned Routers) for clarity and maintainability.

---

## Testing Strategy

### 1. Version Compatibility Tests
```typescript
describe('API Versioning', () => {
  it('should return v1 format for /api/v1/tracks', async () => {
    const response = await fetch('/api/v1/tracks/123');
    const track = await response.json();
    expect(track).toHaveProperty('id');
    expect(track).toHaveProperty('title');
  });

  it('should return v2 format for /api/v2/tracks', async () => {
    const response = await fetch('/api/v2/tracks/123');
    const track = await response.json();
    expect(track).toHaveProperty('trackId');
    expect(track.metadata).toHaveProperty('title');
  });

  it('should include version header in response', async () => {
    const response = await fetch('/api/v1/tracks/123');
    expect(response.headers.get('X-API-Version')).toBe('v1');
  });
});
```

### 2. Deprecation Warning Tests
```typescript
it('should include deprecation headers for deprecated versions', async () => {
  const response = await fetch('/api/v1/tracks/123');
  expect(response.headers.get('X-API-Deprecation')).toBe('true');
  expect(response.headers.get('X-API-Sunset-Date')).toBe('2027-06-01');
});
```

---

## Monitoring & Analytics

### Track API Version Usage
```typescript
// Add analytics to version middleware
export function versionMiddleware(req: Request, res: Response, next: NextFunction) {
  const version = extractApiVersion(req);
  
  // Track version usage
  analytics.track('api_request', {
    version,
    endpoint: req.path,
    method: req.method,
    userId: req.user?.id,
  });
  
  next();
}
```

### Dashboard Metrics
- **Version adoption rate:** % of requests using v2 vs v1
- **Deprecated endpoint usage:** Track calls to deprecated endpoints
- **Migration progress:** Monitor third-party integrators' migration status

---

## Communication Plan

### 1. Deprecation Announcement (6 months before sunset)
**Email to API consumers:**
```
Subject: API v1 Deprecation Notice - Action Required

Dear Boptone API Consumer,

We're writing to inform you that API v1 will be deprecated on 2027-01-01 and sunset on 2027-06-01.

What this means:
- v1 endpoints will continue to work until 2027-06-01
- We recommend migrating to v2 before 2027-01-01
- After 2027-06-01, v1 endpoints will return 410 Gone

Migration resources:
- Migration guide: https://docs.boptone.com/api/v1-to-v2
- v2 documentation: https://docs.boptone.com/api/v2
- Support: api-support@boptone.com

Thank you for being part of the Boptone ecosystem.
```

### 2. Sunset Reminder (1 month before)
- Send final reminder email
- Add banner to API documentation
- Increase deprecation header prominence

### 3. Post-Sunset (After removal)
- Return `410 Gone` for v1 requests
- Redirect to migration guide
- Monitor error rates

---

## Best Practices

### DO:
- Version all public-facing APIs from day one
- Document breaking changes in changelog
- Provide migration guides with code examples
- Support N and N-1 versions simultaneously
- Add deprecation headers 6 months before sunset
- Test version compatibility in CI/CD pipeline

### DON'T:
- Make breaking changes without bumping version
- Remove deprecated versions without warning
- Change authentication methods mid-version
- Forget to update API documentation
- Skip migration guides for breaking changes

---

## Implementation Checklist

- [ ] Create version middleware
- [ ] Organize routers by version (v1/, v2/)
- [ ] Add version headers to responses
- [ ] Create API changelog document
- [ ] Write migration guide template
- [ ] Set up deprecation tracking system
- [ ] Add version compatibility tests
- [ ] Create API documentation site
- [ ] Set up email notification system for API consumers
- [ ] Add version usage analytics

---

## Next Steps

1. **Immediate (Phase 1):** Establish v1 baseline and add version headers
2. **Short-term (Phase 2):** Implement version routing infrastructure
3. **Medium-term (Phase 3):** Add deprecation support and monitoring
4. **Long-term (Phase 4):** Plan v2 breaking changes and migration

---

**Status:** STRATEGY DOCUMENTED - Ready for implementation  
**Next Action:** Begin Phase 1 (Establish v1 baseline)
