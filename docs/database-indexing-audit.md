# Database Indexing Audit & Strategy

**Date:** February 26, 2026  
**Database:** Boptone Production (MySQL/TiDB)  
**Total Tables:** 118  
**Current Indexed Tables:** ~25 (21%)

---

## Executive Summary

The Boptone database schema contains **118 tables** with only **~25 tables (21%)** having explicit indexes defined. This represents a significant performance optimization opportunity as the platform scales to support thousands of artists and millions of tracks/orders/streams.

**Critical Finding:** Most foreign key relationships lack indexes, which will cause severe performance degradation as data volume grows. Query performance for common operations (user dashboards, order history, stream analytics) will degrade exponentially without proper indexing.

---

## Indexing Priority Matrix

### CRITICAL (P0) - Immediate Performance Impact
Tables with high query frequency and missing indexes on foreign keys:

1. **bapTracks** - Missing indexes on `artistId`, `albumId`, `status`, `createdAt`
2. **orders** - Missing indexes on `userId`, `status`, `createdAt`
3. **orderItems** - Missing indexes on `orderId`, `productId`
4. **products** - Missing indexes on `artistId`, `status`, `createdAt`
5. **bapStreams** - Missing indexes on `trackId`, `listenerId`, `createdAt`
6. **payments** - Missing indexes on `userId`, `orderId`, `status`, `createdAt`
7. **subscriptions** - Missing indexes on `userId`, `status`, `currentPeriodEnd`
8. **notifications** - Missing indexes on `userId`, `read`, `createdAt`

### HIGH (P1) - Scale Bottlenecks
Tables that will cause issues at 10K+ users:

9. **productReviews** - Missing composite index on `productId` + `createdAt`
10. **artistProfiles** - Has `userId` index but missing `verifiedStatus`, `subscriptionTier`
11. **releases** - Missing indexes on `artistId`, `releaseDate`, `status`
12. **shippingLabels** - Missing indexes on `orderId`, `status`, `createdAt`
13. **trackingEvents** - Missing indexes on `shippingLabelId`, `status`, `timestamp`
14. **microLoans** - Missing indexes on `artistId`, `status`, `dueDate`
15. **artistLoans** - Missing indexes on `artistId`, `status`, `repaymentStatus`

### MEDIUM (P2) - Analytics & Reporting
Tables used for dashboards and analytics:

16. **streamingMetrics** - Missing indexes on `artistId`, `platform`, `date`
17. **socialMediaMetrics** - Missing indexes on `artistId`, `platform`, `date`
18. **revenueRecords** - Missing indexes on `artistId`, `source`, `date`
19. **analyticsSnapshots** - Missing indexes on `artistId`, `snapshotDate`
20. **aiConversations** - Missing indexes on `userId`, `createdAt`

### LOW (P3) - Admin & Infrequent Operations
Tables with low query frequency:

21. **healthcarePlans** - Missing indexes on `artistId`, `status`
22. **tours** - Missing indexes on `artistId`, `startDate`, `endDate`
23. **infringements** - Missing indexes on `artistId`, `status`, `detectedAt`
24. **opportunities** - Missing indexes on `artistId`, `status`, `createdAt`

---

## Recommended Index Strategy

### 1. Foreign Key Indexes (Automatic Performance Win)
**Rule:** Every foreign key column MUST have an index.

**Rationale:** MySQL does not automatically create indexes on foreign key columns (unlike PostgreSQL). Without indexes, JOIN operations perform full table scans, causing exponential slowdown as data grows.

**Implementation:**
```typescript
// Example: bapTracks table
export const bapTracks = mysqlTable("bap_tracks", {
  // ... fields
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  albumIdIdx: index("album_id_idx").on(table.albumId),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));
```

### 2. Composite Indexes for Common Query Patterns
**Rule:** If two columns are frequently queried together, create a composite index.

**Examples:**
- `(userId, createdAt)` - User activity timelines
- `(artistId, status)` - Artist content filtering
- `(productId, rating)` - Product reviews sorted by rating
- `(orderId, status)` - Order tracking queries

**Implementation:**
```typescript
export const orders = mysqlTable("orders", {
  // ... fields
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
  userStatusIdx: index("user_status_idx").on(table.userId, table.status), // Composite
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));
```

### 3. Timestamp Indexes for Sorting & Filtering
**Rule:** Any `createdAt`, `updatedAt`, `deletedAt` column used in ORDER BY or WHERE clauses needs an index.

**Rationale:** Dashboard queries often sort by date ("Show me my latest orders"). Without an index, MySQL performs a full table scan + filesort.

### 4. Status/Enum Indexes for Filtering
**Rule:** Any status/enum column used in WHERE clauses needs an index.

**Examples:**
- `status` (orders, products, loans)
- `role` (users)
- `subscriptionTier` (artistProfiles)
- `verifiedStatus` (artistProfiles)

### 5. Soft Delete Indexes
**Rule:** If using soft deletes (`deletedAt`), create an index on `deletedAt`.

**Rationale:** Most queries filter out soft-deleted records (`WHERE deletedAt IS NULL`). Without an index, this becomes a full table scan.

---

## Implementation Plan

### Phase 1: Critical Tables (P0) - Immediate Impact
**Estimated Time:** 2 hours  
**Impact:** 10-50x query performance improvement

1. Add indexes to `bapTracks` (artistId, albumId, status, createdAt)
2. Add indexes to `orders` (userId, status, createdAt)
3. Add indexes to `orderItems` (orderId, productId)
4. Add indexes to `products` (artistId, status, createdAt)
5. Add indexes to `bapStreams` (trackId, listenerId, createdAt)
6. Add indexes to `payments` (userId, orderId, status, createdAt)
7. Add indexes to `subscriptions` (userId, status, currentPeriodEnd)
8. Add indexes to `notifications` (userId, read, createdAt)

### Phase 2: High Priority Tables (P1) - Scale Preparation
**Estimated Time:** 2 hours  
**Impact:** Prevent bottlenecks at 10K+ users

9-15. Add indexes to remaining high-priority tables

### Phase 3: Analytics Tables (P2) - Dashboard Performance
**Estimated Time:** 1 hour  
**Impact:** Faster analytics queries

16-20. Add indexes to analytics/metrics tables

### Phase 4: Admin Tables (P3) - Nice to Have
**Estimated Time:** 30 minutes  
**Impact:** Faster admin operations

21-24. Add indexes to admin/infrequent tables

---

## Testing Strategy

### Before Adding Indexes
1. Run `EXPLAIN` on critical queries to establish baseline
2. Measure query execution time with `BENCHMARK()` or application logging
3. Document current performance metrics

### After Adding Indexes
1. Run `EXPLAIN` again to verify index usage
2. Measure query execution time improvement
3. Monitor index size growth (should be minimal)
4. Verify no negative impact on INSERT/UPDATE performance

### Example Test Queries
```sql
-- Test 1: User's tracks query (should use artistId index)
EXPLAIN SELECT * FROM bap_tracks WHERE artistId = 123 ORDER BY createdAt DESC LIMIT 20;

-- Test 2: User's orders query (should use userId + status composite index)
EXPLAIN SELECT * FROM orders WHERE userId = 123 AND status = 'completed' ORDER BY createdAt DESC;

-- Test 3: Product reviews query (should use productId + rating composite index)
EXPLAIN SELECT * FROM product_reviews WHERE productId = 456 AND rating >= 4 ORDER BY createdAt DESC;
```

---

## Index Maintenance Guidelines

### DO:
- Add indexes on foreign key columns
- Add indexes on columns used in WHERE clauses
- Add indexes on columns used in ORDER BY clauses
- Add composite indexes for frequently joined columns
- Monitor index usage with `SHOW INDEX FROM table_name`

### DON'T:
- Over-index (every column doesn't need an index)
- Create duplicate indexes (MySQL will warn you)
- Index low-cardinality columns (e.g., boolean fields with 50/50 distribution)
- Forget to test query performance before/after

### Index Size Considerations
- Each index adds storage overhead (~10-20% of table size)
- Indexes slow down INSERT/UPDATE/DELETE operations slightly
- For Boptone's read-heavy workload, this tradeoff is worth it

---

## Expected Performance Improvements

### Query Performance (Estimated)
- **User dashboard queries:** 100ms → 5ms (20x faster)
- **Order history queries:** 500ms → 10ms (50x faster)
- **Product search queries:** 200ms → 8ms (25x faster)
- **Analytics dashboard:** 2s → 100ms (20x faster)

### Database Load Reduction
- **CPU usage:** -40% (fewer full table scans)
- **Disk I/O:** -60% (index seeks vs. table scans)
- **Query throughput:** +300% (more queries per second)

---

## Next Steps

1. **Implement Phase 1 (P0) indexes** - Start with critical tables
2. **Run performance tests** - Measure before/after improvements
3. **Deploy to production** - Monitor query performance
4. **Implement Phase 2-4** - Continue with remaining tables
5. **Document findings** - Update this document with actual performance metrics

---

**Status:** AUDIT COMPLETE - Ready for implementation  
**Next Action:** Begin Phase 1 implementation (Critical tables)
