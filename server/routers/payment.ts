import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { createMultiCurrencyCheckout, calculateFees, POPULAR_CURRENCIES } from '../stripe';
import { getDb } from '../db';
import { products, orders, orderItems, tips, transactions, bapStreamPayments } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Payment Router
 * Handles BopShop, BopAudio, and Kick-in payment flows
 */
export const paymentRouter = router({
  /**
   * Get supported currencies
   */
  getCurrencies: protectedProcedure.query(() => {
    return POPULAR_CURRENCIES;
  }),

  /**
   * Get user's tip velocity limits (daily, weekly, monthly)
   */
  getUserTipLimits: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get user's tips in various time periods (amount is in cents, convert to dollars)
    const dailyTipsResult = await db.execute(
      `SELECT COALESCE(SUM(amount), 0) as total FROM tips WHERE fanId = ${ctx.user.id} AND createdAt >= '${oneDayAgo.toISOString()}'`
    );
    const weeklyTipsResult = await db.execute(
      `SELECT COALESCE(SUM(amount), 0) as total FROM tips WHERE fanId = ${ctx.user.id} AND createdAt >= '${oneWeekAgo.toISOString()}'`
    );
    const monthlyTipsResult = await db.execute(
      `SELECT COALESCE(SUM(amount), 0) as total FROM tips WHERE fanId = ${ctx.user.id} AND createdAt >= '${oneMonthAgo.toISOString()}'`
    );

    const dailyTotal = Number((dailyTipsResult[0] as any)?.total || 0);
    const weeklyTotal = Number((weeklyTipsResult[0] as any)?.total || 0);
    const monthlyTotal = Number((monthlyTipsResult[0] as any)?.total || 0);

    return {
      dailyLimit: 1000,
      dailyUsed: dailyTotal,
      dailyRemaining: Math.max(0, 1000 - dailyTotal),
      weeklyLimit: 2500,
      weeklyUsed: weeklyTotal,
      weeklyRemaining: Math.max(0, 2500 - weeklyTotal),
      monthlyLimit: 10000,
      monthlyUsed: monthlyTotal,
      monthlyRemaining: Math.max(0, 10000 - monthlyTotal),
    };
  }),

  /**
   * BopShop: Create checkout session for merch purchase
   */
  createBopShopCheckout: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        variantId: z.number().optional(),
        quantity: z.number().min(1).default(1),
        currency: z.string().length(3).default('USD'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get product details
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.status !== 'active') {
        throw new Error('Product is not available for purchase');
      }

      // Check inventory
      if (product.trackInventory && product.inventoryQuantity < input.quantity) {
        throw new Error('Insufficient inventory');
      }

      // Calculate fees
      const totalAmount = product.price * input.quantity;
      const fees = calculateFees({
        amount: totalAmount,
        paymentType: 'bopshop',
      });

      // Create Stripe checkout session
      const session = await createMultiCurrencyCheckout({
        lineItems: [
          {
            price_data: {
              currency: input.currency.toLowerCase(),
              product_data: {
                name: product.name,
                description: product.description || undefined,
                images: product.primaryImageUrl ? [product.primaryImageUrl] : undefined,
                metadata: {
                  productId: product.id.toString(),
                  artistId: product.artistId.toString(),
                },
              },
              unit_amount: product.price,
            },
            quantity: input.quantity,
          },
        ],
        mode: 'payment',
        successUrl: `${ctx.req.headers.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${ctx.req.headers.origin}/shop/product/${product.slug}`,
        customerEmail: ctx.user.email || undefined,
        metadata: {
          userId: ctx.user.id.toString(),
          artistId: product.artistId.toString(),
          paymentType: 'bopshop',
          productId: product.id.toString(),
          quantity: input.quantity.toString(),
        },
        currency: input.currency.toLowerCase(),
        allowPromotionCodes: true,
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id || '',
        fees,
      };
    }),

  /**
   * BopAudio: Create checkout session for stream payment
   */
  createBopAudioCheckout: protectedProcedure
    .input(
      z.object({
        trackId: z.number(),
        streamCount: z.number().min(1).default(1),
        pricePerStream: z.number().min(1).max(5).default(1), // $0.01-$0.05 per stream
        currency: z.string().length(3).default('USD'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get track details (assuming bapTracks table exists)
      // For now, we'll use a placeholder
      const trackName = `Track #${input.trackId}`;
      const artistId = 1; // TODO: Get from track

      // Calculate total amount
      const totalAmount = input.pricePerStream * input.streamCount;

      // Calculate fees (90% to artist, 10% to platform)
      const fees = calculateFees({
        amount: totalAmount,
        paymentType: 'bap_stream',
      });

      // Create Stripe checkout session
      const session = await createMultiCurrencyCheckout({
        lineItems: [
          {
            price_data: {
              currency: input.currency.toLowerCase(),
              product_data: {
                name: `${trackName} - ${input.streamCount} Stream${input.streamCount > 1 ? 's' : ''}`,
                description: `Support the artist with ${input.streamCount} stream${input.streamCount > 1 ? 's' : ''} at $${(input.pricePerStream / 100).toFixed(2)} each`,
                metadata: {
                  trackId: input.trackId.toString(),
                  artistId: artistId.toString(),
                },
              },
              unit_amount: input.pricePerStream,
            },
            quantity: input.streamCount,
          },
        ],
        mode: 'payment',
        successUrl: `${ctx.req.headers.origin}/listen/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${ctx.req.headers.origin}/listen/${input.trackId}`,
        customerEmail: ctx.user.email || undefined,
        metadata: {
          userId: ctx.user.id.toString(),
          artistId: artistId.toString(),
          paymentType: 'bap_stream',
          trackId: input.trackId.toString(),
          streamCount: input.streamCount.toString(),
        },
        currency: input.currency.toLowerCase(),
        allowPromotionCodes: false, // No promo codes for streams
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id || '',
        fees,
      };
    }),

  /**
   * Kick-in: Create checkout session for fan tips (0% platform fee)
   */
  createKickinCheckout: protectedProcedure
    .input(
      z.object({
        artistId: z.number(),
        amount: z.number().min(1).max(500), // $1-$500 USD
        message: z.string().max(500).optional(),
        isAnonymous: z.boolean().default(false),
        currency: z.string().length(3).default('USD'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // TODO: Get artist name from database
      const artistName = `Artist #${input.artistId}`;

      // Calculate fees (0% platform fee, only processing fees)
      const fees = calculateFees({
        amount: input.amount,
        paymentType: 'kickin',
      });

      // Create Stripe checkout session
      const session = await createMultiCurrencyCheckout({
        lineItems: [
          {
            price_data: {
              currency: input.currency.toLowerCase(),
              product_data: {
                name: `Kick In to ${artistName}`,
                description: input.message || 'Support this artist with a tip',
                metadata: {
                  artistId: input.artistId.toString(),
                  isAnonymous: input.isAnonymous.toString(),
                },
              },
              unit_amount: input.amount * 100, // Convert dollars to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        successUrl: `${ctx.req.headers.origin}/kickin/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${ctx.req.headers.origin}/artist/${input.artistId}`,
        customerEmail: input.isAnonymous ? undefined : ctx.user.email || undefined,
        metadata: {
          userId: ctx.user.id.toString(),
          artistId: input.artistId.toString(),
          paymentType: 'kickin',
          message: input.message || '',
          isAnonymous: input.isAnonymous.toString(),
        },
        currency: input.currency.toLowerCase(),
        allowPromotionCodes: false, // No promo codes for tips
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id || '',
        fees,
      };
    }),

  /**
   * Get payment history for current user
   */
  getPaymentHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get transactions for current user
      const userTransactions = await db
        .select()
        .from(transactions)
        .where(eq(transactions.fromUserId, ctx.user.id))
        .limit(input.limit)
        .offset(input.offset);

      return userTransactions;
    }),
});
