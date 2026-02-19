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
        sessionId: session.id,
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
        sessionId: session.id,
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
        amount: z.number().min(100), // Minimum $1.00
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
              unit_amount: input.amount,
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
        sessionId: session.id,
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
