import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import * as fanfunnel from "../fanfunnel";

export const fanFunnelRouter = router({
  // Smart Links
  createSmartLink: protectedProcedure
    .input(z.object({
      name: z.string(),
      destinationUrl: z.string().url(),
      campaign: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return fanfunnel.createSmartLink(ctx.user.id, input);
    }),

  getSmartLinks: protectedProcedure.query(async ({ ctx }) => {
    return fanfunnel.getSmartLinks(ctx.user.id);
  }),

  trackClick: publicProcedure
    .input(z.object({
      linkId: z.number(),
      source: z.string().optional(),
      referrer: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return fanfunnel.trackClick(input.linkId, input.source, input.referrer);
    }),

  // Fan Profiles
  getFans: protectedProcedure
    .input(z.object({
      stage: z.enum(["discovered", "follower", "engaged", "purchased", "superfan"]).optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      return fanfunnel.getFans(ctx.user.id, input);
    }),

  getFanStats: protectedProcedure.query(async ({ ctx }) => {
    return fanfunnel.getFanStats(ctx.user.id);
  }),

  getFunnelData: protectedProcedure.query(async ({ ctx }) => {
    return fanfunnel.getFunnelData(ctx.user.id);
  }),

  getTopSources: protectedProcedure.query(async ({ ctx }) => {
    return fanfunnel.getTopSources(ctx.user.id);
  }),

  // Discovery survey
  submitDiscoverySurvey: publicProcedure
    .input(z.object({
      artistId: z.number(),
      source: z.string(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      return fanfunnel.recordDiscoverySource(input.artistId, input.source, input.email);
    }),
});
