/**
 * Direct Bops migration script.
 * Applies only the Bops tables from 0031_shocking_mandroid.sql,
 * using IF NOT EXISTS to be fully idempotent.
 */
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('✅ Connected to database');

// Read the migration file and extract only Bops-related statements
const migrationFile = fs.readFileSync(
  path.join(__dirname, '../drizzle/0031_shocking_mandroid.sql'),
  'utf8'
);

// Split on drizzle's statement-breakpoint marker
const statements = migrationFile
  .split('--> statement-breakpoint')
  .map(s => s.trim())
  .filter(s => s.length > 0);

console.log(`📋 Found ${statements.length} statements in migration file`);

let applied = 0;
let skipped = 0;
let errors = 0;

for (const stmt of statements) {
  // Make CREATE TABLE statements idempotent
  const safeStmt = stmt
    .replace(/^CREATE TABLE (`bops_[^`]+`)/m, 'CREATE TABLE IF NOT EXISTS $1')
    .replace(/^CREATE INDEX (`bops_[^`]+`)/m, 'CREATE INDEX IF NOT EXISTS $1')
    .replace(/^CREATE UNIQUE INDEX (`bops_[^`]+`)/m, 'CREATE UNIQUE INDEX IF NOT EXISTS $1');

  try {
    await connection.execute(safeStmt);
    applied++;
    // Log only table/index creations for clarity
    if (safeStmt.includes('CREATE TABLE') || safeStmt.includes('CREATE INDEX')) {
      const match = safeStmt.match(/`(bops_[^`]+)`/);
      if (match) console.log(`  ✓ ${match[1]}`);
    }
  } catch (err) {
    // Skip "already exists" errors — idempotent
    if (err.code === 'ER_TABLE_EXISTS_ERROR' || 
        err.code === 'ER_DUP_KEYNAME' ||
        err.code === 'ER_FK_DUP_NAME' ||
        err.message?.includes('Duplicate key name') ||
        err.message?.includes('already exists')) {
      skipped++;
    } else {
      console.error(`  ✗ Error: ${err.message}`);
      console.error(`    SQL: ${safeStmt.substring(0, 100)}...`);
      errors++;
    }
  }
}

await connection.end();

console.log(`\n📊 Migration complete:`);
console.log(`   Applied: ${applied}`);
console.log(`   Skipped (already existed): ${skipped}`);
console.log(`   Errors: ${errors}`);

if (errors > 0) {
  console.error('\n❌ Migration had errors — review above');
  process.exit(1);
} else {
  console.log('\n✅ All Bops tables are live in the database!');
}
