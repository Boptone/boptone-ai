import { describe, it, expect } from "vitest";
import { Shippo } from "shippo";

describe("Shippo API Integration", () => {
  it("should validate Shippo API key by creating a test address", async () => {
    const shippo = new Shippo({
      apiKeyHeader: process.env.SHIPPO_API_KEY || "",
    });

    // Create a test address to validate API key
    const address = await shippo.addresses.create({
      name: "Test User",
      street1: "215 Clayton St.",
      city: "San Francisco",
      state: "CA",
      zip: "94117",
      country: "US",
      validate: false,
    });

    expect(address).toBeDefined();
    expect(address.objectId).toBeDefined();
    expect(address.name).toBe("Test User");
    expect(address.city).toBe("San Francisco");
  });
});
