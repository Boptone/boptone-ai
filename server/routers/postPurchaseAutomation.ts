/**
 * Post-Purchase Automation Router
 * tRPC API for cart tracking, order confirmation, and email automation
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { cartEvents, emailLogs, scheduledJobs } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { scheduleJob } from '../services/jobScheduler';
import { sendAbandonedCartEmail } from '../services/emailService';

export const postPurchaseAutomationRouter = router({
  /**
   * Track cart event
   */
  trackCartEvent: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      eventType: z.enum(['cart_viewed', 'item_added', 'item_removed', 'checkout_started', 'checkout_abandoned', 'checkout_completed']),
      productId: z.number().optional(),
      variantId: z.number().optional(),
      quantity: z.number().optional(),
      cartSnapshot: z.object({
        items: z.array(z.object({
          productId: z.number(),
          variantId: z.number().optional(),
          name: z.string(),
          imageUrl: z.string().optional(),
          price: z.number(),
          quantity: z.number(),
        })),
        subtotal: z.number(),
        currency: z.string(),
      }).optional(),
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
      referrer: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Insert cart event
      const result = await db.insert(cartEvents).values({
        userId: ctx.user?.id ?? null,
        sessionId: input.sessionId,
        eventType: input.eventType,
        productId: input.productId ?? null,
        variantId: input.variantId ?? null,
        quantity: input.quantity ?? null,
        cartSnapshot: input.cartSnapshot ?? null,
        userAgent: input.userAgent ?? null,
        ipAddress: input.ipAddress ?? null,
        referrer: input.referrer ?? null,
      });

      const eventId = Number((result as any)[0]?.insertId) || 0;

      // If checkout started, schedule abandoned cart email for 24 hours later
      if (input.eventType === 'checkout_started' && input.cartSnapshot) {
        const abandonedCartDate = new Date();
        abandonedCartDate.setHours(abandonedCartDate.getHours() + 24); // 24 hours from now

        await scheduleJob({
          jobType: 'send_abandoned_cart',
          scheduledFor: abandonedCartDate,
          payload: {
            cartEventId: eventId,
            customerEmail: ctx.user?.email || 'guest@example.com',
            customerName: ctx.user?.name,
            userId: ctx.user?.id,
            items: input.cartSnapshot.items,
            subtotal: input.cartSnapshot.subtotal,
            currency: input.cartSnapshot.currency,
            checkoutUrl: `${process.env.VITE_APP_URL || 'https://boptone.com'}/checkout`,
          },
        });

        console.log(`[PostPurchase] Scheduled abandoned cart email for session ${input.sessionId}`);
      }

      return { success: true, eventId };
    }),

  /**
   * Schedule order confirmation email (called after order creation)
   */
  scheduleOrderConfirmation: protectedProcedure
    .input(z.object({
      orderId: z.number(),
    }))
    .mutation(async ({ input }) => {
      // Schedule order confirmation for 1 minute from now
      const confirmationDate = new Date();
      confirmationDate.setMinutes(confirmationDate.getMinutes() + 1);

      const jobId = await scheduleJob({
        jobType: 'send_order_confirmation',
        scheduledFor: confirmationDate,
        payload: {
          orderId: input.orderId,
        },
      });

      console.log(`[PostPurchase] Scheduled order confirmation (job ${jobId}) for order ${input.orderId}`);

      return { success: true, jobId };
    }),

  /**
   * Send test abandoned cart email (for testing/admin)
   */
  sendTestAbandonedCartEmail: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await sendAbandonedCartEmail({
        cartEventId: 0,
        customerEmail: input.email,
        customerName: input.name,
        items: [
          {
            name: 'Test Product',
            artistName: 'Test Artist',
            imageUrl: 'https://via.placeholder.com/150',
            quantity: 1,
            price: 2999, // $29.99
          },
        ],
        subtotal: 2999,
        currency: 'USD',
        checkoutUrl: `${process.env.VITE_APP_URL || 'https://boptone.com'}/checkout`,
      });

      return { success: true };
    }),

  /**
   * Get email logs (for admin monitoring)
   */
  getEmailLogs: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      emailType: z.enum(['order_confirmation', 'abandoned_cart', 'shipping_in_transit', 'shipping_out_for_delivery', 'shipping_delivered', 'review_request']).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let query = db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(input.limit);

      if (input.emailType) {
        query = query.where(eq(emailLogs.emailType, input.emailType)) as any;
      }

      const logs = await query;

      return logs;
    }),

  /**
   * Get scheduled jobs (for admin monitoring)
   */
  getScheduledJobs: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let query = db.select().from(scheduledJobs).orderBy(desc(scheduledJobs.createdAt)).limit(input.limit);

      if (input.status) {
        query = query.where(eq(scheduledJobs.status, input.status)) as any;
      }

      const jobs = await query;

      return jobs;
    }),

  /**
   * Get email template preview (for visual review)
   */
  getEmailPreview: publicProcedure
    .input(z.object({
      templateType: z.enum(['order-confirmation', 'abandoned-cart', 'shipping-in-transit', 'shipping-out-for-delivery', 'shipping-delivered', 'review-request']),
    }))
    .query(async ({ input }) => {
      // Import email service to access templates
      const Handlebars = (await import('handlebars')).default;
      
      // Sample data for each template type
      const sampleData: Record<string, any> = {
        'order-confirmation': {
          order_number: 'BO-2026-001234',
          customer_name: 'Jordan Rivers',
          customer_email: 'artist@example.com',
          items: [
            {
              name: 'Limited Edition Vinyl - Midnight Dreams',
              artistName: 'Luna Eclipse',
              imageUrl: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400',
              quantity: 1,
              formatted_price: '$29.99',
              formatted_total: '$29.99',
            },
            {
              name: 'Tour T-Shirt - Black',
              artistName: 'Luna Eclipse',
              imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
              quantity: 2,
              formatted_price: '$25.00',
              formatted_total: '$50.00',
            },
          ],
          subtotal: '$79.99',
          shipping_amount: '$7.99',
          tax_amount: '$7.20',
          total: '$95.18',
          shipping_address_name: 'Jordan Rivers',
          shipping_address_line1: '123 Music Lane',
          shipping_address_line2: 'Apt 4B',
          shipping_city: 'Nashville',
          shipping_state: 'TN',
          shipping_postal_code: '37201',
          shipping_country: 'United States',
          tracking_url: 'https://boptone.com/orders/BO-2026-001234/track',
        },
        'abandoned-cart': {
          customer_name: 'Jordan Rivers',
          customer_email: 'artist@example.com',
          items: [
            {
              name: 'Limited Edition Vinyl - Midnight Dreams',
              artistName: 'Luna Eclipse',
              imageUrl: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400',
              quantity: 1,
              formatted_price: '$29.99',
            },
          ],
          subtotal: '$29.99',
          checkout_url: 'https://boptone.com/checkout/resume?session=abc123',
        },
        'shipping-in-transit': {
          order_number: 'BO-2026-001234',
          customer_name: 'Jordan Rivers',
          customer_email: 'artist@example.com',
          tracking_number: '1Z999AA10123456784',
          tracking_url: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
          carrier: 'UPS',
          service_level: 'Ground',
          estimated_delivery_date: 'Tuesday, February 25, 2026',
          shipping_name: 'Jordan Rivers',
          shipping_address_line1: '123 Music Lane',
          shipping_address_line2: 'Apt 4B',
          shipping_city: 'Nashville',
          shipping_state: 'TN',
          shipping_postal_code: '37201',
        },
        'shipping-out-for-delivery': {
          order_number: 'BO-2026-001234',
          customer_name: 'Jordan Rivers',
          customer_email: 'artist@example.com',
          tracking_number: '1Z999AA10123456784',
          tracking_url: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
        },
        'shipping-delivered': {
          order_number: 'BO-2026-001234',
          customer_name: 'Jordan Rivers',
          customer_email: 'artist@example.com',
          tracking_number: '1Z999AA10123456784',
        },
        'review-request': {
          order_number: 'BO-2026-001234',
          customer_name: 'Jordan Rivers',
          customer_email: 'artist@example.com',
          items: [
            {
              name: 'Limited Edition Vinyl - Midnight Dreams',
              artistName: 'Luna Eclipse',
              imageUrl: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400',
              review_url: 'https://boptone.com/products/101/review',
            },
            {
              name: 'Tour T-Shirt - Black',
              artistName: 'Luna Eclipse',
              imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
              review_url: 'https://boptone.com/products/102/review',
            },
          ],
        },
      };
      
      // For now, return a simple response indicating preview is available
      // In production, we'd render the actual template here
      return {
        templateType: input.templateType,
        sampleData: sampleData[input.templateType],
        message: 'Email preview endpoint ready. Template rendering requires accessing emailService.',
      };
    }),
});
