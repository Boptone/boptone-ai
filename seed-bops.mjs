/**
 * Bops Seed Script
 * Seeds the bops_videos table with test data using the provided video.
 * Run: node seed-bops.mjs
 */
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const VIDEO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/98208888/nTbKjjzazhRpeJn9kKuXdQ/bop_seed_final_1fb215c2.mp4';
const VIDEO_KEY = 'nTbKjjzazhRpeJn9kKuXdQ/bop_seed_final_1fb215c2.mp4';

// Scottie's primary artist profile (id=1, userId=1)
const ARTIST_ID = 1;
const USER_ID = 1;

const SEED_BOPS = [
  {
    caption: '🎵 New track dropping soon — this one hits different',
    likeCount: 247,
    viewCount: 4820,
    tipCount: 12,
    tipTotalCents: 3400,
  },
  {
    caption: 'Studio session vibes 🎧 #boptone #artist',
    likeCount: 189,
    viewCount: 3210,
    tipCount: 8,
    tipTotalCents: 1500,
  },
  {
    caption: 'Behind the beat 🔥 Full song out Friday',
    likeCount: 412,
    viewCount: 7650,
    tipCount: 21,
    tipTotalCents: 6200,
  },
  {
    caption: 'Live from the studio — raw and unfiltered 🎤',
    likeCount: 98,
    viewCount: 1890,
    tipCount: 5,
    tipTotalCents: 900,
  },
  {
    caption: 'This melody has been stuck in my head for weeks 🌊',
    likeCount: 334,
    viewCount: 5540,
    tipCount: 17,
    tipTotalCents: 4800,
  },
  {
    caption: 'Midnight session. No filter. Just music. 🌙',
    likeCount: 156,
    viewCount: 2980,
    tipCount: 9,
    tipTotalCents: 2100,
  },
];

async function seed() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('🌱 Seeding Bops...');

  // First mark Scottie's profile as onboardingCompleted so the upload gate passes
  await conn.execute(
    'UPDATE artist_profiles SET onboardingCompleted = 1 WHERE id = ?',
    [ARTIST_ID]
  );
  console.log('✅ Marked artist profile as onboarding completed');

  for (const bop of SEED_BOPS) {
    await conn.execute(
      `INSERT INTO bops_videos 
        (artistId, userId, caption, videoKey, videoUrl, durationMs, width, height,
         fileSizeBytes, mimeType, processingStatus, moderationStatus,
         isPublished, isArchived, isDeleted, viewCount, likeCount, commentCount,
         tipCount, tipTotalCents, shareCount, trendingScore, publishedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ready', 'approved', 1, 0, 0, ?, ?, 0, ?, ?, 0, ?, NOW(), NOW(), NOW())`,
      [
        ARTIST_ID,
        USER_ID,
        bop.caption,
        VIDEO_KEY,
        VIDEO_URL,
        11433,   // ~11.4 seconds
        1080,    // width (stored as 1080, rotation handled by player)
        1920,    // height
        36394893, // file size bytes
        'video/mp4',
        bop.viewCount,
        bop.likeCount,
        bop.tipCount,
        bop.tipTotalCents,
        Math.floor(bop.likeCount * 0.8 + bop.viewCount * 0.1), // trendingScore
      ]
    );
    console.log(`✅ Seeded: "${bop.caption.slice(0, 40)}..."`);
  }

  const [count] = await conn.execute('SELECT COUNT(*) as cnt FROM bops_videos WHERE isDeleted=0');
  console.log(`\n🎉 Done! Total Bops in DB: ${count[0].cnt}`);
  
  await conn.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
