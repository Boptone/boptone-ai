#!/bin/bash
# Auto-confirm drizzle-kit push for all new tables

cd /home/ubuntu/boptone

# Count how many tables need confirmation
TABLE_COUNT=$(pnpm drizzle-kit push --force 2>&1 | grep -c "table created or renamed")

# Send Enter key for each table confirmation
for i in $(seq 1 20); do
  echo ""
done | pnpm drizzle-kit push
