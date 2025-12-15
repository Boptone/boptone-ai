import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getArtistPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  recordTip,
  getArtistTips,
  verifyTip,
  getTipStats,
  getArtistTaxSettings,
  upsertTaxSettings,
  getTaxComplianceStatus,
  getPublicPaymentMethods,
  getArtistIdByUsername,
  PAYMENT_METHOD_INFO,
} from "../kickin";
import { getArtistProfileByUserId } from "../db";

const paymentMethodEnum = z.enum(["paypal", "venmo", "zelle", "cashapp", "apple_cash"]);

export const kickInRouter = router({
  // ============================================================================
  // PUBLIC ENDPOINTS (for fans)
  // ============================================================================
  
  /**
   * Get public payment methods for an artist (fan-facing)
   */
  getArtistPaymentMethods: publicProcedure
    .input(z.object({
      username: z.string().optional(),
      artistId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      let artistId = input.artistId;
      
      if (!artistId && input.username) {
        artistId = await getArtistIdByUsername(input.username) ?? undefined;
      }
      
      if (!artistId) {
        return { methods: [], artistName: null };
      }
      
      const methods = await getPublicPaymentMethods(artistId);
      
      return {
        methods: methods.map(m => ({
          ...m,
          info: PAYMENT_METHOD_INFO[m.method],
        })),
        artistId,
      };
    }),
  
  /**
   * Record a tip from a fan (public endpoint)
   */
  recordTip: publicProcedure
    .input(z.object({
      artistId: z.number(),
      amount: z.number().min(100), // Minimum $1.00
      paymentMethod: paymentMethodEnum,
      fanName: z.string().optional(),
      fanEmail: z.string().email().optional(),
      message: z.string().max(500).optional(),
    }))
    .mutation(async ({ input }) => {
      const tipId = await recordTip({
        artistId: input.artistId,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        fanName: input.fanName || null,
        fanEmail: input.fanEmail || null,
        message: input.message || null,
      });
      
      return { 
        success: true, 
        tipId,
        message: "Thank you for your support! The artist has been notified.",
      };
    }),
  
  /**
   * Get payment method info (icons, colors, etc.)
   */
  getPaymentMethodInfo: publicProcedure
    .query(() => PAYMENT_METHOD_INFO),
  
  // ============================================================================
  // ARTIST ENDPOINTS (protected)
  // ============================================================================
  
  /**
   * Get artist's configured payment methods
   */
  getMyPaymentMethods: protectedProcedure
    .query(async ({ ctx }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      const methods = await getArtistPaymentMethods(profile.id);
      return methods.map(m => ({
        ...m,
        info: PAYMENT_METHOD_INFO[m.method],
      }));
    }),
  
  /**
   * Add a new payment method
   */
  addPaymentMethod: protectedProcedure
    .input(z.object({
      method: paymentMethodEnum,
      handle: z.string().min(1).max(255),
      displayName: z.string().max(100).optional(),
      isPrimary: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      const id = await addPaymentMethod({
        artistId: profile.id,
        method: input.method,
        handle: input.handle,
        displayName: input.displayName || null,
        isPrimary: input.isPrimary || false,
      });
      
      return { success: true, id };
    }),
  
  /**
   * Update a payment method
   */
  updatePaymentMethod: protectedProcedure
    .input(z.object({
      id: z.number(),
      handle: z.string().min(1).max(255).optional(),
      displayName: z.string().max(100).optional(),
      isPrimary: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      await updatePaymentMethod(input.id, profile.id, {
        handle: input.handle,
        displayName: input.displayName,
        isPrimary: input.isPrimary,
      });
      
      return { success: true };
    }),
  
  /**
   * Delete a payment method
   */
  deletePaymentMethod: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      await deletePaymentMethod(input.id, profile.id);
      return { success: true };
    }),
  
  // ============================================================================
  // TIP MANAGEMENT (protected)
  // ============================================================================
  
  /**
   * Get tips received by the artist
   */
  getMyTips: protectedProcedure
    .input(z.object({
      year: z.number().optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      const tips = await getArtistTips(profile.id, input);
      return tips;
    }),
  
  /**
   * Verify a tip was received
   */
  verifyTip: protectedProcedure
    .input(z.object({ tipId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      await verifyTip(input.tipId, profile.id);
      return { success: true };
    }),
  
  /**
   * Get tip statistics
   */
  getTipStats: protectedProcedure
    .input(z.object({ year: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      const stats = await getTipStats(profile.id, input?.year);
      return stats;
    }),
  
  // ============================================================================
  // TAX SETTINGS (protected)
  // ============================================================================
  
  /**
   * Get artist's tax settings
   */
  getTaxSettings: protectedProcedure
    .query(async ({ ctx }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      return getArtistTaxSettings(profile.id);
    }),
  
  /**
   * Update tax settings
   */
  updateTaxSettings: protectedProcedure
    .input(z.object({
      country: z.string().length(2),
      state: z.string().max(100).optional(),
      taxId: z.string().max(50).optional(),
      taxIdType: z.enum(["ssn", "ein", "vat", "abn", "sin", "other"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      await upsertTaxSettings(profile.id, input);
      return { success: true };
    }),
  
  /**
   * Get tax compliance status
   */
  getTaxComplianceStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      return getTaxComplianceStatus(profile.id);
    }),
  
  /**
   * Submit W-9 confirmation
   */
  submitW9: protectedProcedure
    .mutation(async ({ ctx }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      await upsertTaxSettings(profile.id, {
        w9Submitted: true,
        w9SubmittedAt: new Date(),
      });
      
      return { success: true };
    }),
});
