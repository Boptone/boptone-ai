/**
 * TONE REWARDS - tRPC Router
 * API endpoints for the revolutionary membership system
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  MEMBERSHIP_TIERS,
  BACKING_TIERS,
  createFanMembership,
  getFanMembership,
  upgradeMembership,
  createArtistBacking,
  getArtistBackers,
  getFanBackings,
  getArtistBackingStats,
  recordBackingTransaction,
  getFanYearlySpending,
  calculateAnnualCashback,
  calculateArtistDividend,
  getArtistDividends,
} from "../tonerewards";

export const toneRewardsRouter = router({
  // Get membership tier configuration
  getTiers: publicProcedure.query(() => {
    return {
      membership: MEMBERSHIP_TIERS,
      backing: BACKING_TIERS,
    };
  }),

  // Get current user's membership
  getMyMembership: protectedProcedure.query(async ({ ctx }) => {
    const membership = await getFanMembership(ctx.user.id);
    if (!membership) {
      // Create default basic membership
      await createFanMembership({
        userId: ctx.user.id,
        tier: "basic",
      });
      return await getFanMembership(ctx.user.id);
    }
    return membership;
  }),

  // Upgrade membership
  upgradeMembership: protectedProcedure
    .input(z.object({
      tier: z.enum(["member", "executive"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getFanMembership(ctx.user.id);
      if (!existing) {
        await createFanMembership({
          userId: ctx.user.id,
          tier: input.tier,
        });
      } else {
        await upgradeMembership(ctx.user.id, input.tier);
      }
      return { success: true };
    }),

  // Back an artist
  backArtist: protectedProcedure
    .input(z.object({
      artistProfileId: z.number(),
      monthlyAmount: z.number().min(3),
    }))
    .mutation(async ({ ctx, input }) => {
      await createArtistBacking({
        fanUserId: ctx.user.id,
        artistProfileId: input.artistProfileId,
        monthlyAmount: input.monthlyAmount.toFixed(2),
      });

      // Record the first transaction
      const artistShare = input.monthlyAmount * 0.9;
      const platformShare = input.monthlyAmount * 0.1;

      await recordBackingTransaction({
        fanUserId: ctx.user.id,
        artistProfileId: input.artistProfileId,
        type: "backing",
        year: new Date().getFullYear(),
        amount: input.monthlyAmount.toFixed(2),
        artistShare: artistShare.toFixed(2),
        platformShare: platformShare.toFixed(2),
      });

      return { success: true };
    }),

  // Get artists I'm backing
  getMyBackings: protectedProcedure.query(async ({ ctx }) => {
    return await getFanBackings(ctx.user.id);
  }),

  // Get my backers (for artists)
  getMyBackers: protectedProcedure
    .input(z.object({
      artistProfileId: z.number(),
    }))
    .query(async ({ input }) => {
      return await getArtistBackers(input.artistProfileId);
    }),

  // Get artist backing stats
  getArtistStats: protectedProcedure
    .input(z.object({
      artistProfileId: z.number(),
    }))
    .query(async ({ input }) => {
      return await getArtistBackingStats(input.artistProfileId);
    }),

  // Get my yearly spending and cashback
  getMyCashbackStatus: protectedProcedure
    .input(z.object({
      year: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const year = input.year || new Date().getFullYear();
      const membership = await getFanMembership(ctx.user.id);
      const spending = await getFanYearlySpending(ctx.user.id, year);

      return {
        membership,
        year,
        totalSpending: spending.totalSpending,
        cashbackEarned: spending.cashbackEarned,
        isExecutive: membership?.tier === "executive",
        projectedCashback: membership?.tier === "executive" 
          ? spending.totalSpending * 0.02 
          : 0,
      };
    }),

  // Calculate annual cashback (for year-end processing)
  calculateMyCashback: protectedProcedure
    .input(z.object({
      year: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await calculateAnnualCashback(ctx.user.id, input.year);
    }),

  // Get artist dividends
  getArtistDividends: protectedProcedure
    .input(z.object({
      artistProfileId: z.number(),
    }))
    .query(async ({ input }) => {
      return await getArtistDividends(input.artistProfileId);
    }),

  // Calculate artist dividend (for year-end processing)
  calculateArtistDividend: protectedProcedure
    .input(z.object({
      artistProfileId: z.number(),
      year: z.number(),
    }))
    .mutation(async ({ input }) => {
      return await calculateArtistDividend(input.artistProfileId, input.year);
    }),
});
