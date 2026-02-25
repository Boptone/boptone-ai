import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { getDb } from "../../db";
import { orders, orderItems, products, shippingLabels } from "../../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Orders Router - Enterprise-grade order history system
 * 
 * Features:
 * - Paginated order list with sorting
 * - Order details with items and tracking
 * - Receipt downloads (Stripe receipts)
 * - Secure user isolation (users can only see their own orders)
 */

export const ordersRouter = router({
  /**
   * List user's orders with pagination
   * Returns orders sorted by creation date (newest first)
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection unavailable",
        });
      }

      try {
        // Fetch orders for current user with pagination
        const userOrders = await db
          .select({
            id: orders.id,
            orderNumber: orders.orderNumber,
            total: orders.total,
            subtotal: orders.subtotal,
            tax: orders.tax,
            shippingCost: orders.shippingCost,
            paymentStatus: orders.paymentStatus,
            fulfillmentStatus: orders.fulfillmentStatus,
            stripeSessionId: orders.stripeSessionId,
            stripeReceiptUrl: orders.stripeReceiptUrl,
            createdAt: orders.createdAt,
            updatedAt: orders.updatedAt,
          })
          .from(orders)
          .where(eq(orders.customerId, ctx.user.id))
          .orderBy(desc(orders.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        // Get total count for pagination
        const [countResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(orders)
          .where(eq(orders.customerId, ctx.user.id));

        const totalCount = Number(countResult?.count || 0);

        return {
          orders: userOrders,
          totalCount,
          hasMore: input.offset + input.limit < totalCount,
        };
      } catch (error) {
        console.error("[Orders] List error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch orders",
        });
      }
    }),

  /**
   * Get order details by ID
   * Includes order items, products, and shipping tracking
   */
  getById: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection unavailable",
        });
      }

      try {
        // Fetch order (with user isolation check)
        const [order] = await db
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.id, input.orderId),
              eq(orders.customerId, ctx.user.id)
            )
          )
          .limit(1);

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // Fetch order items with product details
        const items = await db
          .select({
            id: orderItems.id,
            quantity: orderItems.quantity,
            price: orderItems.price,
            subtotal: orderItems.subtotal,
            productId: orderItems.productId,
            variantId: orderItems.variantId,
            productName: products.name,
            productImages: products.images,
            productType: products.type,
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, input.orderId));

        // Fetch shipping tracking (if available)
        const [tracking] = await db
          .select({
            trackingNumber: shippingLabels.trackingNumber,
            carrier: shippingLabels.carrier,
            trackingUrl: shippingLabels.trackingUrl,
            status: shippingLabels.status,
            estimatedDeliveryDate: shippingLabels.estimatedDeliveryDate,
          })
          .from(shippingLabels)
          .where(eq(shippingLabels.orderId, input.orderId))
          .limit(1);

        return {
          order,
          items,
          tracking: tracking || null,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error("[Orders] GetById error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch order details",
        });
      }
    }),

  /**
   * Get receipt URL for an order
   * Returns Stripe receipt URL if available
   */
  getReceipt: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection unavailable",
        });
      }

      try {
        // Fetch order (with user isolation check)
        const [order] = await db
          .select({
            stripeReceiptUrl: orders.stripeReceiptUrl,
            stripeSessionId: orders.stripeSessionId,
          })
          .from(orders)
          .where(
            and(
              eq(orders.id, input.orderId),
              eq(orders.customerId, ctx.user.id)
            )
          )
          .limit(1);

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        if (!order.stripeReceiptUrl) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Receipt not available for this order",
          });
        }

        return {
          receiptUrl: order.stripeReceiptUrl,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error("[Orders] GetReceipt error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch receipt",
        });
      }
    }),

  /**
   * Get order statistics for user
   * Returns total orders, total spent, etc.
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection unavailable",
      });
    }

    try {
      const [stats] = await db
        .select({
          totalOrders: sql<number>`count(*)`,
          totalSpent: sql<string>`sum(${orders.total})`,
        })
        .from(orders)
        .where(
          and(
            eq(orders.customerId, ctx.user.id),
            eq(orders.paymentStatus, "paid")
          )
        );

      return {
        totalOrders: Number(stats?.totalOrders || 0),
        totalSpent: parseFloat(stats?.totalSpent || "0"),
      };
    } catch (error) {
      console.error("[Orders] GetStats error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch order statistics",
      });
    }
  }),
});
