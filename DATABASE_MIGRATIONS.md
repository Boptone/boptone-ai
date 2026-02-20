# Database Migration Strategy

## Overview

This document outlines the database migration strategy for Boptone to ensure zero-downtime deployments, data safety, and rollback capabilities.

## Migration Workflow

### 1. Schema Changes in Development

**Step 1: Update Schema**
```bash
# Edit drizzle/schema.ts with your changes
vim drizzle/schema.ts
```

**Step 2: Generate Migration**
```bash
# Generate migration SQL from schema changes
pnpm drizzle-kit generate
```

This creates a new migration file in `drizzle/migrations/` with a timestamp.

**Step 3: Review Migration**
```bash
# Review the generated SQL before applying
cat drizzle/migrations/XXXX_migration_name.sql
```

**Step 4: Apply Migration Locally**
```bash
# Apply migration to local database
pnpm drizzle-kit migrate
```

**Step 5: Test Changes**
```bash
# Start dev server and test
pnpm dev
```

### 2. Deploying to Production

**Before Deployment:**
1. ✅ All migrations tested locally
2. ✅ Backup strategy in place
3. ✅ Rollback plan documented
4. ✅ Zero-downtime approach confirmed

**Deployment Steps:**
```bash
# 1. Create database backup
# (Handled automatically by Manus platform)

# 2. Push code with migrations
git push origin main

# 3. Migrations run automatically on deployment
# (Handled by Manus platform)

# 4. Verify deployment
# Check logs and test critical flows
```

## Migration Best Practices

### ✅ DO

- **Always generate migrations** - Never manually edit the database in production
- **Review SQL before applying** - Check for destructive operations
- **Test migrations locally first** - Catch issues before production
- **Use backward-compatible changes** - Add columns as nullable, then backfill
- **Document breaking changes** - Note any manual steps required
- **Version migrations** - Timestamp-based naming (handled by drizzle-kit)

### ❌ DON'T

- **Never skip migrations** - Always go through the generate → review → apply flow
- **Never use `pnpm db:push` in production** - It's for development only
- **Never delete columns without backfilling** - Risk data loss
- **Never rename columns directly** - Use add + copy + delete pattern
- **Never run migrations manually in production** - Let the platform handle it

## Common Migration Patterns

### Adding a Column (Safe)

```typescript
// drizzle/schema.ts
export const products = mysqlTable("products", {
  // ... existing columns
  newColumn: varchar("newColumn", { length: 255 }), // Nullable by default - safe
});
```

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### Adding a NOT NULL Column (Requires Backfill)

```typescript
// Step 1: Add as nullable
export const products = mysqlTable("products", {
  // ... existing columns
  newColumn: varchar("newColumn", { length: 255 }), // Nullable first
});
```

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

```typescript
// Step 2: Backfill data (write a script)
// scripts/backfill-new-column.ts
import { db } from "../server/db";
import { products } from "../drizzle/schema";

async function backfill() {
  await db.update(products).set({ newColumn: "default_value" });
}
```

```typescript
// Step 3: Make NOT NULL in next migration
export const products = mysqlTable("products", {
  // ... existing columns
  newColumn: varchar("newColumn", { length: 255 }).notNull(), // Now NOT NULL
});
```

### Renaming a Column (Multi-Step)

```typescript
// Step 1: Add new column
export const products = mysqlTable("products", {
  oldName: varchar("oldName", { length: 255 }),
  newName: varchar("newName", { length: 255 }), // Add new
});
```

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

```typescript
// Step 2: Copy data (write a script)
// scripts/copy-old-to-new.ts
import { db } from "../server/db";
import { products } from "../drizzle/schema";
import { sql } from "drizzle-orm";

async function copyData() {
  await db.execute(sql`UPDATE products SET newName = oldName`);
}
```

```typescript
// Step 3: Remove old column in next migration
export const products = mysqlTable("products", {
  // oldName removed
  newName: varchar("newName", { length: 255 }).notNull(),
});
```

### Soft Delete Implementation (Already Done)

```typescript
// Add deletedAt column (nullable)
export const products = mysqlTable("products", {
  // ... existing columns
  deletedAt: timestamp("deletedAt"), // Soft delete
}, (table) => ({
  deletedAtIdx: index("deleted_at_idx").on(table.deletedAt), // Index for filtering
}));
```

## Rollback Strategy

### Automatic Rollback (Preferred)

If a deployment fails, Manus platform automatically rolls back to the previous version.

### Manual Rollback (Emergency)

```bash
# 1. Identify the checkpoint to rollback to
# Use Manus UI to view checkpoint history

# 2. Rollback via Manus UI
# Click "Rollback" button on the target checkpoint

# 3. Verify rollback
# Check logs and test critical flows
```

### Database Rollback (Last Resort)

If schema changes cause issues and code rollback isn't enough:

```bash
# 1. Restore database from backup
# Contact Manus support or use database UI

# 2. Rollback code to matching checkpoint
# Use Manus UI to rollback code

# 3. Verify system state
# Check logs and test critical flows
```

## Backup Strategy

### Automatic Backups

- **Frequency**: Daily at 2 AM UTC
- **Retention**: 30 days
- **Location**: Manus platform managed
- **Restoration**: Via Manus UI or support

### Manual Backups

Before major migrations:

```bash
# Create manual backup via Manus UI
# Database → Backups → Create Backup
```

## Migration Checklist

Before applying any migration to production:

- [ ] Schema changes reviewed and approved
- [ ] Migration SQL generated and reviewed
- [ ] Migration tested locally
- [ ] Backward compatibility confirmed
- [ ] Rollback plan documented
- [ ] Backup created (for major changes)
- [ ] Team notified (if applicable)
- [ ] Monitoring in place (Sentry, logs)

## Troubleshooting

### Migration Fails Locally

```bash
# 1. Check error message
pnpm drizzle-kit migrate

# 2. Rollback to previous migration
# Delete the failed migration file
rm drizzle/migrations/XXXX_failed_migration.sql

# 3. Fix schema and regenerate
vim drizzle/schema.ts
pnpm drizzle-kit generate
```

### Migration Fails in Production

```bash
# 1. Check deployment logs
# Manus UI → Logs

# 2. Platform will auto-rollback
# Wait for automatic rollback to complete

# 3. Fix locally and redeploy
vim drizzle/schema.ts
pnpm drizzle-kit generate
git push origin main
```

### Schema Out of Sync

```bash
# 1. Check current schema
pnpm drizzle-kit introspect

# 2. Compare with drizzle/schema.ts
# Identify differences

# 3. Generate migration to sync
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Emergency Contacts

- **Manus Support**: https://help.manus.im
- **Database Issues**: Use Manus UI → Database → Support
- **Critical Failures**: Rollback via Manus UI immediately

## Additional Resources

- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations)
- [Manus Platform Docs](https://docs.manus.im)
- [Zero-Downtime Migrations](https://www.braintreepayments.com/blog/safe-operations-for-high-volume-postgresql/)
