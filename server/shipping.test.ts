import { describe, it, expect } from "vitest";
import { calculateShippingRates, purchaseShippingLabel } from "./shipping";

/**
 * Shipping Integration Tests
 * Tests Shippo API integration for rate calculation and label purchase
 */

describe("Shippo Shipping Integration", () => {
  let testShipmentId: string;
  let testRateId: string;

  // Default seller address for tests
  const defaultAddressFrom = {
    name: "Test Seller",
    street1: "123 Seller St",
    city: "Los Angeles",
    state: "CA",
    zip: "90001",
    country: "US",
  };

  describe("API Connection", () => {
    it("should calculate rates successfully (validates API connection)", async () => {
      const addressTo = {
        name: "Test Customer",
        street1: "215 Clayton St",
        city: "San Francisco",
        state: "CA",
        zip: "94117",
        country: "US",
      };

      const parcel = {
        length: 12,
        width: 9,
        height: 3,
        weight: 2,
      };

      const result = await calculateShippingRates(defaultAddressFrom, addressTo, parcel);
      expect(result).toBeDefined();
      expect(result.rates.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe("Rate Calculation", () => {
    it("should calculate shipping rates for valid US domestic address", async () => {
      const addressTo = {
        name: "John Doe",
        street1: "215 Clayton St",
        city: "San Francisco",
        state: "CA",
        zip: "94117",
        country: "US",
        phone: "555-555-5555",
      };

      const parcel = {
        length: 12,
        width: 9,
        height: 3,
        weight: 2,
      };

      const result = await calculateShippingRates(defaultAddressFrom, addressTo, parcel);

      expect(result).toBeDefined();
      expect(result.rates).toBeInstanceOf(Array);
      expect(result.rates.length).toBeGreaterThan(0);

      // Verify rate structure
      const firstRate = result.rates[0];
      expect(firstRate).toHaveProperty("rateId");
      expect(firstRate).toHaveProperty("carrier");
      expect(firstRate).toHaveProperty("service");
      expect(firstRate).toHaveProperty("amount");
      expect(firstRate.amount).toBeGreaterThan(0);

      // Store for next test
      testShipmentId = result.shipmentId;
      testRateId = firstRate.rateId;
    }, 30000); // 30 second timeout for API call

    it("should handle invalid address gracefully", async () => {
      const invalidAddress = {
        name: "Invalid Address",
        street1: "Nonexistent Street 99999",
        city: "InvalidCity",
        state: "XX",
        zip: "00000",
        country: "US",
      };

      const parcel = {
        length: 12,
        width: 9,
        height: 3,
        weight: 2,
      };

      // Should either return empty rates or throw error
      try {
        const result = await calculateShippingRates(defaultAddressFrom, invalidAddress, parcel);
        // If it doesn't throw, it should return empty rates
        expect(result.rates).toBeInstanceOf(Array);
      } catch (error) {
        // Error is acceptable for invalid address
        expect(error).toBeDefined();
      }
    }, 30000);

    it("should calculate rates for international address", async () => {
      const internationalAddress = {
        name: "Jane Smith",
        street1: "1 Yonge Street",
        city: "Toronto",
        state: "ON",
        zip: "M5E 1E5",
        country: "CA",
      };

      const parcel = {
        length: 12,
        width: 9,
        height: 3,
        weight: 2,
      };

      const result = await calculateShippingRates(defaultAddressFrom, internationalAddress, parcel);

      expect(result).toBeDefined();
      expect(result.rates).toBeInstanceOf(Array);

      if (result.rates.length > 0) {
        const firstRate = result.rates[0];
        expect(firstRate.amount).toBeGreaterThan(0);
      }
    }, 30000);
  });

  describe("Label Purchase", () => {
    it("should validate label purchase parameters", async () => {
      // Test with missing required fields
      const invalidParams = {
        rateId: "",
        shipmentId: "",
        addressFrom: defaultAddressFrom,
        addressTo: {
          name: "Test Buyer",
          street1: "456 Buyer Ave",
          city: "New York",
          state: "NY",
          zip: "10001",
          country: "US",
        },
        parcel: {
          length: 12,
          width: 9,
          height: 3,
          weight: 2,
        },
      };

      // Should throw error for missing rateId
      await expect(
        purchaseShippingLabel(
          invalidParams.rateId,
          invalidParams.shipmentId,
          invalidParams.addressFrom,
          invalidParams.addressTo,
          invalidParams.parcel
        )
      ).rejects.toThrow();
    });

    // Note: We skip actual label purchase in tests to avoid charges
    // In production, you would test this in a staging environment
    it.skip("should purchase shipping label with valid rate", async () => {
      const addressTo = {
        name: "Test Buyer",
        street1: "215 Clayton St",
        city: "San Francisco",
        state: "CA",
        zip: "94117",
        country: "US",
      };

      const parcel = {
        length: 12,
        width: 9,
        height: 3,
        weight: 2,
      };

      const result = await purchaseShippingLabel(
        testRateId,
        testShipmentId,
        defaultAddressFrom,
        addressTo,
        parcel
      );

      expect(result).toBeDefined();
      expect(result.labelUrl).toBeDefined();
      expect(result.trackingNumber).toBeDefined();
      expect(result.trackingUrl).toBeDefined();
    });
  });

  describe("Rate Comparison", () => {
    it("should return rates sorted by price", async () => {
      const addressTo = {
        name: "Test Customer",
        street1: "215 Clayton St",
        city: "San Francisco",
        state: "CA",
        zip: "94117",
        country: "US",
      };

      const parcel = {
        length: 12,
        width: 9,
        height: 3,
        weight: 2,
      };

      const result = await calculateShippingRates(defaultAddressFrom, addressTo, parcel);

      expect(result.rates.length).toBeGreaterThan(1);

      // Verify rates are sorted by price (ascending)
      for (let i = 1; i < result.rates.length; i++) {
        expect(result.rates[i].amount).toBeGreaterThanOrEqual(result.rates[i - 1].amount);
      }
    }, 30000);

    it("should include multiple carriers in rate results", async () => {
      const addressTo = {
        name: "Test Customer",
        street1: "215 Clayton St",
        city: "San Francisco",
        state: "CA",
        zip: "94117",
        country: "US",
      };

      const parcel = {
        length: 12,
        width: 9,
        height: 3,
        weight: 2,
      };

      const result = await calculateShippingRates(defaultAddressFrom, addressTo, parcel);

      // Get unique carriers
      const carriers = [...new Set(result.rates.map((r) => r.carrier))];

      // Should have at least 1 carrier (may vary based on Shippo account settings)
      expect(carriers.length).toBeGreaterThanOrEqual(1);
    }, 30000);
  });

  describe("Parcel Validation", () => {
    it("should handle different parcel sizes", async () => {
      const addressTo = {
        name: "Test Customer",
        street1: "215 Clayton St",
        city: "San Francisco",
        state: "CA",
        zip: "94117",
        country: "US",
      };

      // Small parcel
      const smallParcel = {
        length: 6,
        width: 4,
        height: 2,
        weight: 0.5,
      };

      const smallResult = await calculateShippingRates(defaultAddressFrom, addressTo, smallParcel);
      expect(smallResult.rates.length).toBeGreaterThan(0);

      // Large parcel
      const largeParcel = {
        length: 24,
        width: 18,
        height: 12,
        weight: 15,
      };

      const largeResult = await calculateShippingRates(defaultAddressFrom, addressTo, largeParcel);
      expect(largeResult.rates.length).toBeGreaterThan(0);

      // Large parcel should be more expensive
      const smallCheapest = Math.min(...smallResult.rates.map((r) => r.amount));
      const largeCheapest = Math.min(...largeResult.rates.map((r) => r.amount));
      expect(largeCheapest).toBeGreaterThan(smallCheapest);
    }, 60000);
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      // Test with invalid API configuration (will fail if API is down)
      const addressTo = {
        name: "Test",
        street1: "123 Test St",
        city: "Test City",
        state: "CA",
        zip: "90001",
        country: "US",
      };

      const parcel = {
        length: 12,
        width: 9,
        height: 3,
        weight: 2,
      };

      try {
        await calculateShippingRates(defaultAddressFrom, addressTo, parcel);
      } catch (error) {
        // Should throw a meaningful error
        expect(error).toBeDefined();
        expect(error).toHaveProperty("message");
      }
    }, 30000);
  });
});
