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
});
