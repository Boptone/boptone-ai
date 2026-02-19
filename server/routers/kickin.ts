import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import * as kickin from "../kickin";

export const kickinRouter = router({
  getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    return kickin.getArtistPaymentMethods(ctx.user.id);
  }),

  addPaymentMethod: protectedProcedure
    .input(z.object({
      type: z.enum(["paypal", "venmo", "zelle", "cashapp", "applepay"]),
      handle: z.string().min(1),
      isPrimary: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return kickin.addPaymentMethod(ctx.user.id, input.type, input.handle, input.isPrimary);
    }),

  removePaymentMethod: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return kickin.removePaymentMethod(ctx.user.id, input.id);
    }),

  setPrimaryMethod: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return kickin.setPrimaryPaymentMethod(ctx.user.id, input.id);
    }),

  getPublicPaymentMethods: publicProcedure
    .input(z.object({ artistId: z.number() }))
    .query(async ({ input }) => {
      return kickin.getArtistPaymentMethods(input.artistId);
    }),

  recordTip: publicProcedure
    .input(z.object({
      artistId: z.number(),
      amount: z.number().positive(),
      currency: z.string().default("USD"),
      paymentMethod: z.enum(["paypal", "venmo", "zelle", "cashapp", "applepay"]),
      fanEmail: z.string().email().optional(),
      fanName: z.string().optional(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return kickin.recordTip(input);
    }),

  getTips: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      return kickin.getArtistTips(ctx.user.id, input.limit, input.offset);
    }),

  getTipStats: protectedProcedure.query(async ({ ctx }) => {
    return kickin.getTipStats(ctx.user.id);
  }),

  verifyTip: protectedProcedure
    .input(z.object({ tipId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return kickin.verifyTip(ctx.user.id, input.tipId);
    }),

  // Create Stripe Checkout session for tipping
  createStripeTipCheckout: publicProcedure
    .input(z.object({
      artistId: z.number(),
      artistName: z.string(),
      trackTitle: z.string(),
      amount: z.number().positive().default(5), // Default $5 tip
    }))
    .mutation(async ({ ctx, input }) => {
      const stripe = (await import("stripe")).default;
      const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!);

      // Create Stripe Checkout session
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Tip for ${input.artistName}`,
                description: `Support ${input.artistName} - "${input.trackTitle}"`,
              },
              unit_amount: Math.round(input.amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${ctx.req.headers.origin}/discover?tip=success`,
        cancel_url: `${ctx.req.headers.origin}/discover?tip=cancelled`,
        metadata: {
          type: "kick_in_tip",
          artist_id: input.artistId.toString(),
          artist_name: input.artistName,
          track_title: input.trackTitle,
          amount: input.amount.toString(),
        },
      });

      return { checkoutUrl: session.url };
    }),
});
