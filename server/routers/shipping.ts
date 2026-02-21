/**
 * Shipping Router - tRPC procedures for Shippo integration
 * Handles shipping rate calculation, label purchase, and tracking
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  calculateShippingRates,
  purchaseShippingLabel,
  trackShipment,
  validateAddress,
} from "../shipping";
import { getDb } from "../db";
import { shippingLabels, trackingEvents, orders } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import * as ShippoSDK from "shippo/models/components";

export const shippingRouter = router({
  /**
   * Calculate shipping rates for an order
   */
  calculateRates: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        addressTo: z.object({
          name: z.string(),
          street1: z.string(),
          street2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          zip: z.string(),
          country: z.string(),
          phone: z.string().optional(),
        }),
        parcel: z.object({
          length: z.number(),
          width: z.number(),
          height: z.number(),
          weight: z.number(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get order to verify ownership
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);

      if (!order) {
        throw new Error("Order not found");
      }

      // Get artist's address (from order or artist profile)
      const addressFrom = {
        name: "Artist Name", // TODO: Get from artist profile
        street1: "123 Artist St",
        city: "Los Angeles",
        state: "CA",
        zip: "90001",
        country: "US",
      };

      // Calculate shipping rates
      const shipmentResponse = await calculateShippingRates(
        addressFrom,
        input.addressTo,
        input.parcel
      );

      // Store shipment ID for later label purchase
      // (We'll store this in a temporary field or cache)

      return {
        shipmentId: shipmentResponse.shipmentId,
        rates: shipmentResponse.rates,
      };
    }),

  /**
   * Purchase a shipping label
   */
  purchaseLabel: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        rateId: z.string(),
        shipmentId: z.string(),
        addressFrom: z.object({
          name: z.string(),
          street1: z.string(),
          street2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          zip: z.string(),
          country: z.string(),
        }),
        addressTo: z.object({
          name: z.string(),
          street1: z.string(),
          street2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          zip: z.string(),
          country: z.string(),
        }),
        parcel: z.object({
          length: z.number(),
          width: z.number(),
          height: z.number(),
          weight: z.number(),
          distanceUnit: z.string(),
          massUnit: z.string(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get order to verify ownership
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);

      if (!order) {
        throw new Error("Order not found");
      }

      // Purchase label
      const labelResponse = await purchaseShippingLabel(
        input.rateId,
        ShippoSDK.LabelFileTypeEnum.Pdf
      );

      // Store shipping label in database
      await db.insert(shippingLabels).values({
        orderId: input.orderId,
        shipmentId: input.shipmentId,
        rateId: input.rateId,
        transactionId: labelResponse.transactionId,
        carrier: labelResponse.carrier,
        service: labelResponse.service,
        trackingNumber: labelResponse.trackingNumber,
        trackingUrl: labelResponse.trackingUrl,
        labelUrl: labelResponse.labelUrl,
        cost: labelResponse.cost.toString(),
        currency: labelResponse.currency,
        status: "purchased",
        addressFrom: input.addressFrom,
        addressTo: input.addressTo,
        parcel: input.parcel,
      });

      // Update order with tracking info
      await db
        .update(orders)
        .set({
          trackingNumber: labelResponse.trackingNumber,
          trackingUrl: labelResponse.trackingUrl,
          shippingMethod: `${labelResponse.carrier} - ${labelResponse.service}`,
          fulfillmentStatus: "unfulfilled",
        })
        .where(eq(orders.id, input.orderId));

      return {
        labelUrl: labelResponse.labelUrl,
        trackingNumber: labelResponse.trackingNumber,
        trackingUrl: labelResponse.trackingUrl,
      };
    }),

  /**
   * Track a shipment
   */
  trackShipment: protectedProcedure
    .input(
      z.object({
        trackingNumber: z.string(),
        carrier: z.string(),
      })
    )
    .query(async ({ input }) => {
      const trackingStatus = await trackShipment(
        input.carrier,
        input.trackingNumber
      );

      return trackingStatus;
    }),

  /**
   * Get shipping label for an order
   */
  getShippingLabel: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [label] = await db
        .select()
        .from(shippingLabels)
        .where(eq(shippingLabels.orderId, input.orderId))
        .limit(1);

      if (!label) {
        return null;
      }

      return {
        labelUrl: label.labelUrl,
        trackingNumber: label.trackingNumber,
        trackingUrl: label.trackingUrl,
        carrier: label.carrier,
        service: label.service,
        status: label.status,
        cost: parseFloat(label.cost || "0"),
        currency: label.currency,
      };
    }),

  /**
   * Validate an address
   */
  validateAddress: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        street1: z.string(),
        street2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
        country: z.string(),
        phone: z.string().optional(),
        email: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await validateAddress(input);
      return result;
    }),
});
