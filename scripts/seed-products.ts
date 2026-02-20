import { drizzle } from "drizzle-orm/mysql2";
import { products } from "../drizzle/schema";

/**
 * Seed script to populate database with test products for E2E tests
 * Run with: tsx scripts/seed-products.ts
 */

async function seedProducts() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not found in environment");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  const testProducts = [
    {
      artistId: 1, // Assuming user ID 1 exists
      name: "Test T-Shirt",
      slug: "test-t-shirt",
      description: "A comfortable test t-shirt for E2E testing",
      price: 29.99,
      currency: "USD",
      category: "apparel",
      inventory: 100,
      status: "active",
      images: JSON.stringify([
        {
          url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
          alt: "Test T-Shirt",
          position: 0,
        },
      ]),
      tags: JSON.stringify(["test", "apparel", "t-shirt"]),
    },
    {
      artistId: 1,
      name: "Test Hoodie",
      slug: "test-hoodie",
      description: "A warm test hoodie for E2E testing",
      price: 49.99,
      currency: "USD",
      category: "apparel",
      inventory: 50,
      status: "active",
      images: JSON.stringify([
        {
          url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
          alt: "Test Hoodie",
          position: 0,
        },
      ]),
      tags: JSON.stringify(["test", "apparel", "hoodie"]),
    },
    {
      artistId: 1,
      name: "Test Poster",
      slug: "test-poster",
      description: "A beautiful test poster for E2E testing",
      price: 19.99,
      currency: "USD",
      category: "art",
      inventory: 200,
      status: "active",
      images: JSON.stringify([
        {
          url: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800",
          alt: "Test Poster",
          position: 0,
        },
      ]),
      tags: JSON.stringify(["test", "art", "poster"]),
    },
    {
      artistId: 1,
      name: "Test Vinyl Record",
      slug: "test-vinyl",
      description: "A classic test vinyl record for E2E testing",
      price: 34.99,
      currency: "USD",
      category: "music",
      inventory: 75,
      status: "active",
      images: JSON.stringify([
        {
          url: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800",
          alt: "Test Vinyl Record",
          position: 0,
        },
      ]),
      tags: JSON.stringify(["test", "music", "vinyl"]),
    },
    {
      artistId: 1,
      name: "Test Mug",
      slug: "test-mug",
      description: "A ceramic test mug for E2E testing",
      price: 14.99,
      currency: "USD",
      category: "accessories",
      inventory: 150,
      status: "active",
      images: JSON.stringify([
        {
          url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800",
          alt: "Test Mug",
          position: 0,
        },
      ]),
      tags: JSON.stringify(["test", "accessories", "mug"]),
    },
  ];

  try {
    console.log("Seeding products...");
    
    for (const product of testProducts) {
      await db.insert(products).values(product);
      console.log(`✓ Created product: ${product.name}`);
    }

    console.log("\n✅ Successfully seeded 5 test products!");
    console.log("You can now run E2E tests with: pnpm test:e2e");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
