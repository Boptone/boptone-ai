/**
 * Seed Dummy Artist Data for BOPixel Testing
 * 
 * Creates "Luna Waves" artist profile with realistic tracking data:
 * - 500 page views over 30 days
 * - 18 purchases ($429.82 total revenue)
 * - Traffic from Instagram, TikTok, Google, Direct, YouTube
 * - 7 products with varied performance
 */

import { drizzle } from "drizzle-orm/mysql2";
import { artistProfiles, pixelEvents, pixelSessions, pixelUsers } from "../../drizzle/schema";
import { randomUUID } from "crypto";

const ARTIST_ID = 180001;
const ARTIST_NAME = "Luna Waves";

// Product data
const PRODUCTS = [
  { id: 1, name: "Midnight Dreams EP", price: 19.99 },
  { id: 2, name: "Neon Nights Vinyl", price: 34.99 },
  { id: 3, name: "Tour T-Shirt", price: 29.99 },
  { id: 4, name: "Signed Poster", price: 24.99 },
  { id: 5, name: "Digital Album", price: 9.99 },
  { id: 6, name: "Hoodie", price: 49.99 },
  { id: 7, name: "Limited Edition Box Set", price: 99.99 },
];

// Traffic sources with weights
const TRAFFIC_SOURCES = [
  { referrer: "https://instagram.com", weight: 35 },
  { referrer: "https://tiktok.com", weight: 25 },
  { referrer: "https://google.com", weight: 20 },
  { referrer: null, weight: 15 }, // Direct
  { referrer: "https://youtube.com", weight: 5 },
];

function getRandomReferrer() {
  const random = Math.random() * 100;
  let cumulative = 0;
  for (const source of TRAFFIC_SOURCES) {
    cumulative += source.weight;
    if (random < cumulative) return source.referrer;
  }
  return null;
}

function getRandomProduct() {
  return PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
}

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);

  console.log("🌊 Seeding dummy artist data for Luna Waves...");

  // Check if artist profile exists
  const existingProfile = await db
    .select()
    .from(artistProfiles)
    .where((table) => table.id === ARTIST_ID)
    .limit(1);

  if (existingProfile.length === 0) {
    console.log("❌ Artist profile ID 180001 not found. Please create it first.");
    process.exit(1);
  }

  console.log("✅ Found artist profile:", existingProfile[0].stageName);

  // Generate tracking data for the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Create 50 unique users
  const users: string[] = [];
  for (let i = 0; i < 50; i++) {
    const userId = `user_${randomUUID()}`;
    users.push(userId);

    await db.insert(pixelUsers).values({
      pixelUserId: userId,
      firstSeen: new Date(
        thirtyDaysAgo.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
      ),
      lastSeen: new Date(
        now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ),
      totalPageViews: Math.floor(Math.random() * 20) + 1,
      totalPurchases: Math.random() > 0.7 ? 1 : 0,
      totalRevenue: Math.random() > 0.7 ? Math.random() * 100 : 0,
    });
  }

  console.log(`✅ Created ${users.length} dummy users`);

  // Generate 500 page views
  const sessions: Map<string, string> = new Map();
  let totalPageViews = 0;
  let totalPurchases = 0;
  let totalRevenue = 0;

  for (let i = 0; i < 500; i++) {
    const userId = users[Math.floor(Math.random() * users.length)];
    const referrer = getRandomReferrer();
    const timestamp = new Date(
      thirtyDaysAgo.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
    );

    // Create or reuse session
    let sessionId = sessions.get(userId);
    if (!sessionId || Math.random() > 0.7) {
      // 30% chance to create new session
      sessionId = `session_${randomUUID()}`;
      sessions.set(userId, sessionId);

      await db.insert(pixelSessions).values({
        sessionId,
        pixelUserId: userId,
        artistId: ARTIST_ID,
        referrer,
        startedAt: timestamp,
        lastActivityAt: timestamp,
        pageViews: 1,
      });
    }

    // Create page view event
    await db.insert(pixelEvents).values({
      eventId: `event_${randomUUID()}`,
      pixelUserId: userId,
      sessionId,
      artistId: ARTIST_ID,
      eventType: "page_view",
      eventName: "Page Viewed",
      pageUrl: `https://boptone.com/artist/${ARTIST_NAME.toLowerCase().replace(" ", "-")}`,
      pageTitle: `${ARTIST_NAME} - Boptone`,
      referrer,
      deviceType: Math.random() > 0.5 ? "mobile" : "desktop",
      browser: Math.random() > 0.5 ? "Chrome" : "Safari",
      os: Math.random() > 0.5 ? "iOS" : "Android",
      createdAt: timestamp,
    });

    totalPageViews++;

    // 10% chance to view a product
    if (Math.random() < 0.1) {
      const product = getRandomProduct();
      await db.insert(pixelEvents).values({
        eventId: `event_${randomUUID()}`,
        pixelUserId: userId,
        sessionId,
        artistId: ARTIST_ID,
        eventType: "product_viewed",
        eventName: "Product Viewed",
        pageUrl: `https://boptone.com/product/${product.id}`,
        pageTitle: product.name,
        referrer,
        productId: product.id.toString(),
        productName: product.name,
        customData: JSON.stringify({ productName: product.name }),
        deviceType: Math.random() > 0.5 ? "mobile" : "desktop",
        createdAt: new Date(timestamp.getTime() + 60000), // 1 minute later
      });
    }
  }

  console.log(`✅ Created ${totalPageViews} page views`);

  // Generate 18 purchases with realistic distribution
  const purchaseProducts = [
    { ...PRODUCTS[0], quantity: 3 }, // Midnight Dreams EP x3
    { ...PRODUCTS[1], quantity: 2 }, // Neon Nights Vinyl x2
    { ...PRODUCTS[2], quantity: 4 }, // Tour T-Shirt x4
    { ...PRODUCTS[3], quantity: 2 }, // Signed Poster x2
    { ...PRODUCTS[4], quantity: 5 }, // Digital Album x5
    { ...PRODUCTS[5], quantity: 1 }, // Hoodie x1
    { ...PRODUCTS[6], quantity: 1 }, // Limited Edition Box Set x1
  ];

  for (const item of purchaseProducts) {
    for (let i = 0; i < item.quantity; i++) {
      const userId = users[Math.floor(Math.random() * users.length)];
      const sessionId = sessions.get(userId) || `session_${randomUUID()}`;
      const timestamp = new Date(
        thirtyDaysAgo.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
      );

      await db.insert(pixelEvents).values({
        eventId: `event_${randomUUID()}`,
        pixelUserId: userId,
        sessionId,
        artistId: ARTIST_ID,
        eventType: "purchase",
        eventName: "Purchase",
        pageUrl: "https://boptone.com/checkout/success",
        pageTitle: "Order Confirmation",
        referrer: getRandomReferrer(),
        productId: item.id.toString(),
        productName: item.name,
        revenue: item.price,
        currency: "USD",
        customData: JSON.stringify({
          productName: item.name,
          price: item.price,
        }),
        deviceType: Math.random() > 0.5 ? "mobile" : "desktop",
        createdAt: timestamp,
      });

      totalPurchases++;
      totalRevenue += item.price;
    }
  }

  console.log(`✅ Created ${totalPurchases} purchases`);
  console.log(`💰 Total revenue: $${totalRevenue.toFixed(2)}`);
  console.log(`📊 Conversion rate: ${((totalPurchases / totalPageViews) * 100).toFixed(2)}%`);
  console.log("\n🎉 Dummy data seeded successfully!");
  console.log(`\nView insights at: https://boptone.com/insights`);

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error seeding data:", error);
  process.exit(1);
});
