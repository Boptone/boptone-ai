import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [cols] = await conn.execute('DESCRIBE artist_profiles');
  const existing = new Set(cols.map(c => c.Field));
  console.log('Existing cols:', [...existing].join(', '));
  
  const toAdd = [];
  if (!existing.has('sellerType')) {
    toAdd.push("ADD COLUMN sellerType ENUM('music_artist','visual_artist','general_creator') NOT NULL DEFAULT 'music_artist'");
  }
  if (!existing.has('platformFeePercentage')) {
    toAdd.push('ADD COLUMN platformFeePercentage DECIMAL(4,2) NOT NULL DEFAULT 0.00');
  }
  if (!existing.has('subscriptionTier')) {
    toAdd.push("ADD COLUMN subscriptionTier ENUM('free','pro','premium') NOT NULL DEFAULT 'free'");
  }
  
  if (toAdd.length === 0) {
    console.log('✅ All columns already exist — no migration needed');
  } else {
    const sql = 'ALTER TABLE artist_profiles ' + toAdd.join(', ');
    console.log('Running:', sql);
    await conn.execute(sql);
    console.log('✅ Migration complete!');
  }
  
  await conn.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
