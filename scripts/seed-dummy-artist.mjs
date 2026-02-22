/**
 * Seed Dummy Artist Data for Insights Dashboard
 * 
 * Creates a realistic artist profile with products and BOPixel tracking data
 * Run with: node scripts/seed-dummy-artist.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

// Helper to generate random date within last N days
function randomDate(daysAgo) {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const random = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(random);
}

// Helper to generate random session ID
function generateSessionId() {
  return `sess_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

// Helper to generate random user ID
function generateUserId() {
  return `user_${Math.random().toString(36).substring(2, 15)}`;
}

// Helper to generate random event ID
function generateEventId() {
  return `evt_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

// Traffic source distribution (realistic)
const trafficSources = [
  { referrer: "https://www.instagram.com/", weight: 30 },
  { referrer: "https://www.tiktok.com/", weight: 25 },
  { referrer: "https://www.google.com/", weight: 15 },
  { referrer: "https://www.youtube.com/", weight: 10 },
  { referrer: "https://twitter.com/", weight: 8 },
  { referrer: "https://www.facebook.com/", weight: 7 },
  { referrer: "", weight: 5 }, // Direct traffic
];

function getRandomTrafficSource() {
  const total = trafficSources.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * total;
  
  for (const source of trafficSources) {
    random -= source.weight;
    if (random <= 0) {
      return source.referrer;
    }
  }
  
  return trafficSources[0].referrer;
}

async function seedDummyArtist() {
  console.log("🎨 Seeding dummy artist data...\n");

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    // 0. Clean up existing demo data
    console.log("0. Cleaning up existing demo data...");
    await connection.execute(`DELETE FROM pixel_events WHERE artistId IN (SELECT id FROM artist_profiles WHERE userId IN (SELECT id FROM users WHERE openId = 'demo_artist_001'))`);
    await connection.execute(`DELETE FROM pixel_sessions WHERE artistId IN (SELECT id FROM artist_profiles WHERE userId IN (SELECT id FROM users WHERE openId = 'demo_artist_001'))`);
    await connection.execute(`DELETE FROM pixel_users WHERE pixelUserId LIKE 'user_%'`);
    await connection.execute(`DELETE FROM products WHERE artistId IN (SELECT id FROM artist_profiles WHERE userId IN (SELECT id FROM users WHERE openId = 'demo_artist_001'))`);
    await connection.execute(`DELETE FROM artist_profiles WHERE userId IN (SELECT id FROM users WHERE openId = 'demo_artist_001')`);
    await connection.execute(`DELETE FROM users WHERE openId = 'demo_artist_001'`);
    console.log(`   ✓ Existing demo data cleaned\n`);

    // 1. Create dummy user
    console.log("1. Creating dummy user...");
    const [userResult] = await connection.execute(
      `INSERT INTO users (openId, name, email, role, createdAt, updatedAt, lastSignedIn)
       VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      ["demo_artist_001", "Demo Artist", "demo@boptone.com", "artist"]
    );
    const userId = userResult.insertId;
    console.log(`   ✓ User created (ID: ${userId})\n`);

    // 2. Create artist profile
    console.log("2. Creating artist profile...");
    const [artistResult] = await connection.execute(
      `INSERT INTO artist_profiles (userId, stageName, bio, genres, location, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      [
        userId,
        "Luna Waves",
        "Indie pop artist from LA. Creating vibes for the late-night soul. 🌙✨",
        JSON.stringify(["Indie Pop", "Electronic", "Dream Pop"]),
        "Los Angeles, CA"
      ]
    );
    const artistId = artistResult.insertId;
    console.log(`   ✓ Artist profile created (ID: ${artistId})\n`);

    // 3. Create dummy products
    console.log("3. Creating dummy products...");
    const products = [
      { name: "Luna Waves T-Shirt", price: 2999, description: "Soft cotton tee with Luna Waves logo" },
      { name: "Midnight Hoodie", price: 4999, description: "Cozy hoodie perfect for late nights" },
      { name: "Vinyl - Dreamscape EP", price: 2499, description: "Limited edition vinyl record" },
      { name: "Enamel Pin Set", price: 1499, description: "3-piece collector pin set" },
      { name: "Tote Bag", price: 1999, description: "Eco-friendly canvas tote" },
      { name: "Poster Bundle", price: 2999, description: "3 exclusive art prints" },
      { name: "Sticker Pack", price: 999, description: "10 waterproof stickers" },
    ];

    const productIds = [];
    for (const product of products) {
      // Generate slug from product name
      const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const [productResult] = await connection.execute(
        `INSERT INTO products (artistId, type, name, slug, description, price, currency, inventoryQuantity, trackInventory, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [artistId, "physical", product.name, slug, product.description, product.price, "USD", 100, 1]
      );
      productIds.push({ id: productResult.insertId, ...product });
      console.log(`   ✓ ${product.name} ($${(product.price / 100).toFixed(2)})`);
    }
    console.log(`   ✓ ${products.length} products created\n`);

    // 4. Generate BOPixel tracking data
    console.log("4. Generating BOPixel tracking data...");
    
    // Generate 500 page views over last 30 days
    console.log("   → Generating page views...");
    const sessions = new Map(); // Track sessions for consistency
    const users = new Map(); // Track users for consistency
    
    for (let i = 0; i < 500; i++) {
      const timestamp = randomDate(30);
      const referrer = getRandomTrafficSource();
      
      // Reuse or create new user/session (80% reuse, 20% new)
      let pixelUserId, sessionId;
      
      if (Math.random() < 0.8 && users.size > 0) {
        // Reuse existing user
        const userIds = Array.from(users.keys());
        pixelUserId = userIds[Math.floor(Math.random() * userIds.length)];
        const userSessions = users.get(pixelUserId);
        sessionId = userSessions[Math.floor(Math.random() * userSessions.length)];
      } else {
        // Create new user and session
        pixelUserId = generateUserId();
        sessionId = generateSessionId();
        
        // Insert pixel_users
        await connection.execute(
          `INSERT INTO pixel_users (pixelUserId, firstSeen, lastSeen, consentStatus, privacyTier, country)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [pixelUserId, timestamp, timestamp, "granted", "permissive", "US"]
        );
        
        // Insert pixel_sessions
        await connection.execute(
          `INSERT INTO pixel_sessions (sessionId, pixelUserId, artistId, startedAt, referrer, utmSource, utmMedium, utmCampaign)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [sessionId, pixelUserId, artistId, timestamp, referrer, null, null, null]
        );
        
        if (!users.has(pixelUserId)) {
          users.set(pixelUserId, []);
        }
        users.get(pixelUserId).push(sessionId);
      }
      
      // Insert page view event
      await connection.execute(
        `INSERT INTO pixel_events (eventId, pixelUserId, sessionId, artistId, eventType, eventName, pageUrl, referrer, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generateEventId(),
          pixelUserId,
          sessionId,
          artistId.toString(),
          "page_view",
          "Page Viewed",
          "https://boptone.com/@lunawaves",
          referrer,
          timestamp
        ]
      );
    }
    console.log(`   ✓ 500 page views generated`);

    // Generate product views (100 views across products)
    console.log("   → Generating product views...");
    for (let i = 0; i < 100; i++) {
      const product = productIds[Math.floor(Math.random() * productIds.length)];
      const timestamp = randomDate(30);
      const userIds = Array.from(users.keys());
      const pixelUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const userSessions = users.get(pixelUserId);
      const sessionId = userSessions[Math.floor(Math.random() * userSessions.length)];
      
      await connection.execute(
        `INSERT INTO pixel_events (eventId, pixelUserId, sessionId, artistId, eventType, eventName, productId, customData, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generateEventId(),
          pixelUserId,
          sessionId,
          artistId.toString(),
          "custom",
          "Product Viewed",
          product.id.toString(),
          JSON.stringify({ productName: product.name, price: product.price }),
          timestamp
        ]
      );
    }
    console.log(`   ✓ 100 product views generated`);

    // Generate add-to-cart events (50 carts)
    console.log("   → Generating add-to-cart events...");
    for (let i = 0; i < 50; i++) {
      const product = productIds[Math.floor(Math.random() * productIds.length)];
      const timestamp = randomDate(30);
      const userIds = Array.from(users.keys());
      const pixelUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const userSessions = users.get(pixelUserId);
      const sessionId = userSessions[Math.floor(Math.random() * userSessions.length)];
      
      await connection.execute(
        `INSERT INTO pixel_events (eventId, pixelUserId, sessionId, artistId, eventType, eventName, productId, customData, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generateEventId(),
          pixelUserId,
          sessionId,
          artistId.toString(),
          "custom",
          "Add to Cart",
          product.id.toString(),
          JSON.stringify({ productName: product.name, price: product.price, quantity: 1 }),
          timestamp
        ]
      );
    }
    console.log(`   ✓ 50 add-to-cart events generated`);

    // Generate checkout started events (30 checkouts)
    console.log("   → Generating checkout events...");
    for (let i = 0; i < 30; i++) {
      const timestamp = randomDate(30);
      const userIds = Array.from(users.keys());
      const pixelUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const userSessions = users.get(pixelUserId);
      const sessionId = userSessions[Math.floor(Math.random() * userSessions.length)];
      
      await connection.execute(
        `INSERT INTO pixel_events (eventId, pixelUserId, sessionId, artistId, eventType, eventName, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          generateEventId(),
          pixelUserId,
          sessionId,
          artistId.toString(),
          "custom",
          "Checkout Started",
          timestamp
        ]
      );
    }
    console.log(`   ✓ 30 checkout events generated`);

    // Generate purchase events (18 purchases with revenue)
    console.log("   → Generating purchase events...");
    let totalRevenue = 0;
    for (let i = 0; i < 18; i++) {
      const product = productIds[Math.floor(Math.random() * productIds.length)];
      const timestamp = randomDate(30);
      const userIds = Array.from(users.keys());
      const pixelUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const userSessions = users.get(pixelUserId);
      const sessionId = userSessions[Math.floor(Math.random() * userSessions.length)];
      const revenue = product.price / 100; // Convert cents to dollars
      totalRevenue += revenue;
      
      await connection.execute(
        `INSERT INTO pixel_events (eventId, pixelUserId, sessionId, artistId, eventType, eventName, productId, revenue, customData, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generateEventId(),
          pixelUserId,
          sessionId,
          artistId.toString(),
          "purchase",
          "Purchase",
          product.id.toString(),
          revenue,
          JSON.stringify({ productName: product.name, price: product.price, quantity: 1 }),
          timestamp
        ]
      );
    }
    console.log(`   ✓ 18 purchases generated ($${totalRevenue.toFixed(2)} total revenue)`);

    console.log(`\n✅ Dummy artist data seeded successfully!`);
    console.log(`\n📊 Summary:`);
    console.log(`   • Artist: Luna Waves (ID: ${artistId})`);
    console.log(`   • Products: ${products.length}`);
    console.log(`   • Page Views: 500`);
    console.log(`   • Product Views: 100`);
    console.log(`   • Add to Carts: 50`);
    console.log(`   • Checkouts: 30`);
    console.log(`   • Purchases: 18`);
    console.log(`   • Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`   • Conversion Rate: ${((18 / 500) * 100).toFixed(2)}%`);
    console.log(`\n🔗 View Insights Dashboard: https://boptone.com/insights`);
    console.log(`   (Login as demo@boptone.com to see the data)\n`);

  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the seed script
seedDummyArtist()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
