import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createWriterProfile,
  getWriterProfileById,
  getWriterProfileByEmail,
  getWriterProfileByUserId,
  updateWriterProfile,
  createWriterPaymentMethod,
  getWriterPaymentMethods,
  getDefaultPaymentMethod,
  setDefaultPaymentMethod,
  updateWriterPaymentMethod,
  deleteWriterPaymentMethod,
  createWriterInvitation,
  getWriterInvitationByToken,
  getWriterInvitationsByTrack,
  getWriterInvitationsByEmail,
  updateWriterInvitation,
  acceptWriterInvitation,
  createWriterEarning,
  getWriterEarningsByProfile,
  getWriterEarningsByTrack,
  getWriterEarning,
  updateWriterEarning,
  addEarningsToWriter,
  getWritersPendingPayouts,
  createWriterPayout,
  getWriterPayoutsByProfile,
  getWriterPayoutById,
  updateWriterPayout,
  getPendingPayouts,
  markPayoutComplete,
  markPayoutFailed,
} from "../writerPayments";
import crypto from "crypto";

/**
 * Writer Payment System Router
 * Handles songwriter splits, invitations, payment methods, and automatic payouts
 */

export const writerPaymentsRouter = router({
  // ============================================================================
  // WRITER PROFILES
  // ============================================================================
  
  profile: router({
    /**
     * Get current user's writer profile
     */
    getMy: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getWriterProfileByUserId(ctx.user.id);
      return profile;
    }),
    
    /**
     * Create writer profile for current user
     */
    create: protectedProcedure
      .input(z.object({
        fullName: z.string(),
        email: z.string().email(),
        ipiNumber: z.string().optional(),
        proAffiliation: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if profile already exists
        const existing = await getWriterProfileByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Writer profile already exists",
          });
        }
        
        const profile = await createWriterProfile({
          userId: ctx.user.id,
          fullName: input.fullName,
          email: input.email,
          ipiNumber: input.ipiNumber,
          proAffiliation: input.proAffiliation,
          status: "active",
          verifiedAt: new Date(),
        });
        
        return profile;
      }),
    
    /**
     * Update writer profile
     */
    update: protectedProcedure
      .input(z.object({
        fullName: z.string().optional(),
        ipiNumber: z.string().optional(),
        proAffiliation: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const profile = await getWriterProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Writer profile not found",
          });
        }
        
        await updateWriterProfile(profile.id, input);
        return { success: true };
      }),
    
    /**
     * Get writer profile by ID (public)
     */
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const profile = await getWriterProfileById(input.id);
        return profile;
      }),
  }),
  
  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================
  
  paymentMethods: router({
    /**
     * Get all payment methods for current user
     */
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getWriterProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Writer profile not found. Create a profile first.",
        });
      }
      
      const methods = await getWriterPaymentMethods(profile.id);
      return methods;
    }),
    
    /**
     * Add new payment method
     */
    add: protectedProcedure
      .input(z.object({
        type: z.enum(["bank_account", "paypal", "venmo", "zelle", "crypto"]),
        // Bank account
        bankName: z.string().optional(),
        bankAccountType: z.enum(["checking", "savings"]).optional(),
        bankRoutingNumber: z.string().optional(),
        bankAccountNumber: z.string().optional(),
        // PayPal/Venmo/Zelle
        paypalEmail: z.string().email().optional(),
        venmoHandle: z.string().optional(),
        zelleEmail: z.string().email().optional(),
        // Crypto
        cryptoWalletAddress: z.string().optional(),
        cryptoCurrency: z.string().optional(),
        // Default
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const profile = await getWriterProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Writer profile not found. Create a profile first.",
          });
        }
        
        const method = await createWriterPaymentMethod({
          writerProfileId: profile.id,
          type: input.type,
          bankName: input.bankName,
          bankAccountType: input.bankAccountType,
          bankRoutingNumber: input.bankRoutingNumber,
          bankAccountNumber: input.bankAccountNumber,
          paypalEmail: input.paypalEmail,
          venmoHandle: input.venmoHandle,
          zelleEmail: input.zelleEmail,
          cryptoWalletAddress: input.cryptoWalletAddress,
          cryptoCurrency: input.cryptoCurrency,
          isDefault: input.isDefault,
          status: "pending", // Will be verified later
        });
        
        return method;
      }),
    
    /**
     * Set default payment method
     */
    setDefault: protectedProcedure
      .input(z.object({ methodId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const profile = await getWriterProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Writer profile not found",
          });
        }
        
        await setDefaultPaymentMethod(profile.id, input.methodId);
        return { success: true };
      }),
    
    /**
     * Delete payment method
     */
    delete: protectedProcedure
      .input(z.object({ methodId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const profile = await getWriterProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Writer profile not found",
          });
        }
        
        await deleteWriterPaymentMethod(input.methodId);
        return { success: true };
      }),
  }),
  
  // ============================================================================
  // WRITER INVITATIONS
  // ============================================================================
  
  invitations: router({
    /**
     * Send invitation to writer (called during track upload)
     */
    send: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        fullName: z.string(),
        trackId: z.number(),
        splitPercentage: z.number().min(0).max(100),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get artist profile
        const { getArtistProfileByUserId } = await import("../db");
        const artistProfile = await getArtistProfileByUserId(ctx.user.id);
        if (!artistProfile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Artist profile not found",
          });
        }
        
        // Generate secure invite token
        const inviteToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days to accept
        
        const invitation = await createWriterInvitation({
          email: input.email,
          fullName: input.fullName,
          invitedByArtistId: artistProfile.id,
          trackId: input.trackId,
          splitPercentage: input.splitPercentage.toString(),
          inviteToken,
          expiresAt,
          status: "pending",
        });
        
        // TODO: Send email with invitation link
        // Email should contain: boptone.com/writer-invite?token={inviteToken}
        
        return {
          success: true,
          invitationId: invitation.insertId,
          inviteToken,
        };
      }),
    
    /**
     * Get invitation by token (public - for accepting invites)
     */
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const invitation = await getWriterInvitationByToken(input.token);
        if (!invitation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invitation not found or expired",
          });
        }
        
        // Check if expired
        if (new Date() > new Date(invitation.expiresAt)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invitation has expired",
          });
        }
        
        return invitation;
      }),
    
    /**
     * Accept invitation and create writer profile
     */
    accept: protectedProcedure
      .input(z.object({
        token: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const invitation = await getWriterInvitationByToken(input.token);
        if (!invitation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invitation not found",
          });
        }
        
        if (invitation.status !== "pending") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invitation already accepted or expired",
          });
        }
        
        // Check if user already has writer profile
        let writerProfile = await getWriterProfileByUserId(ctx.user.id);
        
        // If not, create one
        if (!writerProfile) {
          const newProfile = await createWriterProfile({
            userId: ctx.user.id,
            fullName: invitation.fullName,
            email: invitation.email,
            status: "active",
            verifiedAt: new Date(),
            metadata: {
              invitedBy: invitation.invitedByArtistId,
            },
          });
          writerProfile = await getWriterProfileById(newProfile.insertId as number);
        }
        
        if (!writerProfile) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create writer profile",
          });
        }
        
        // Accept invitation
        await acceptWriterInvitation(input.token, writerProfile.id);
        
        // Create writer earning record for this track
        if (invitation.trackId) {
          await createWriterEarning({
            writerProfileId: writerProfile.id,
            trackId: invitation.trackId,
            splitPercentage: invitation.splitPercentage,
            totalEarned: 0,
            pendingPayout: 0,
            totalPaidOut: 0,
          });
        }
        
        return {
          success: true,
          writerProfileId: writerProfile.id,
        };
      }),
    
    /**
     * Get invitations for a track
     */
    getByTrack: protectedProcedure
      .input(z.object({ trackId: z.number() }))
      .query(async ({ input }) => {
        const invitations = await getWriterInvitationsByTrack(input.trackId);
        return invitations;
      }),
  }),
  
  // ============================================================================
  // SPLITS SUMMARY (for BAP dashboard)
  // ============================================================================

  splits: router({
    /**
     * Get all tracks owned by the current artist with their split breakdowns,
     * invitation statuses, and per-writer earnings.
     */
    getForMyTracks: protectedProcedure.query(async ({ ctx }) => {
      const { getArtistProfileByUserId } = await import("../db");
      const { getTracksByArtist } = await import("../bap");
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) return [];

      const tracks = await getTracksByArtist(profile.id);
      if (!tracks.length) return [];

      const db = await (await import("../db")).getDb();
      if (!db) return [];

      const { writerInvitations: invTable, writerEarnings: earnTable, writerProfiles: profTable } = await import("../../drizzle/schema");
      const { inArray, eq } = await import("drizzle-orm");

      const trackIds = tracks.map((t: any) => t.id);

      const [invitations, earnings] = await Promise.all([
        db.select().from(invTable).where(inArray(invTable.trackId, trackIds)),
        db.select({
          id: earnTable.id,
          trackId: earnTable.trackId,
          writerProfileId: earnTable.writerProfileId,
          splitPercentage: earnTable.splitPercentage,
          totalEarned: earnTable.totalEarned,
          pendingPayout: earnTable.pendingPayout,
          totalPaidOut: earnTable.totalPaidOut,
          writerName: profTable.fullName,
          writerEmail: profTable.email,
        })
          .from(earnTable)
          .leftJoin(profTable, eq(earnTable.writerProfileId, profTable.id))
          .where(inArray(earnTable.trackId, trackIds)),
      ]);

      return tracks.map((track: any) => ({
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        artworkUrl: track.artworkUrl,
        status: track.status,
        songwriterSplits: (track.songwriterSplits as any[]) || [],
        invitations: invitations.filter((inv: any) => inv.trackId === track.id),
        earnings: earnings.filter((e: any) => e.trackId === track.id),
      }));
    }),

    /**
     * Update songwriter splits for a track (artist only)
     */
    update: protectedProcedure
      .input(z.object({
        trackId: z.number(),
        splits: z.array(z.object({
          fullName: z.string(),
          email: z.string().email(),
          percentage: z.number().min(0).max(100),
          role: z.enum(["songwriter", "producer", "mixer", "mastering", "other"]).default("songwriter"),
          ipiNumber: z.string().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const total = input.splits.reduce((s, w) => s + w.percentage, 0);
        if (Math.abs(total - 100) > 0.01) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Splits must add up to 100%" });
        }

        const { getArtistProfileByUserId } = await import("../db");
        const artistProfile = await getArtistProfileByUserId(ctx.user.id);
        if (!artistProfile) throw new TRPCError({ code: "UNAUTHORIZED", message: "Artist profile required" });

        const db = await (await import("../db")).getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

        const { bapTracks } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        const [track] = await db.select().from(bapTracks).where(eq(bapTracks.id, input.trackId)).limit(1);
        if (!track || track.artistId !== artistProfile.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Track not found or access denied" });
        }

        await db.update(bapTracks).set({
          songwriterSplits: input.splits.map(s => ({
            name: s.fullName,
            percentage: s.percentage,
            role: s.role,
            ipi: s.ipiNumber,
          })),
        }).where(eq(bapTracks.id, input.trackId));

        return { success: true };
      }),
  }),

  // ============================================================================
  // EARNINGS
  // ============================================================================
  
  earnings: router({
    /**
     * Get earnings for current user
     */
    getMy: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getWriterProfileByUserId(ctx.user.id);
      if (!profile) {
        return [];
      }
      
      const earnings = await getWriterEarningsByProfile(profile.id);
      return earnings;
    }),
    
    /**
     * Get earnings for a specific track
     */
    getByTrack: protectedProcedure
      .input(z.object({ trackId: z.number() }))
      .query(async ({ input }) => {
        const earnings = await getWriterEarningsByTrack(input.trackId);
        return earnings;
      }),
  }),
  
  // ============================================================================
  // PAYOUTS
  // ============================================================================
  
  payouts: router({
    /**
     * Get payout history for current user
     */
    getMy: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getWriterProfileByUserId(ctx.user.id);
      if (!profile) {
        return [];
      }
      
      const payouts = await getWriterPayoutsByProfile(profile.id);
      return payouts;
    }),
    
    /**
     * Request payout (manual trigger)
     */
    request: protectedProcedure.mutation(async ({ ctx }) => {
      const profile = await getWriterProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Writer profile not found",
        });
      }
      
      // Get default payment method
      const paymentMethod = await getDefaultPaymentMethod(profile.id);
      if (!paymentMethod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No payment method configured. Please add a payment method first.",
        });
      }
      
      // Get all earnings with pending payouts
      const earnings = await getWriterEarningsByProfile(profile.id);
      const totalPending = earnings.reduce((sum, e) => sum + (e.pendingPayout || 0), 0);
      
      if (totalPending < 1000) { // Minimum $10 payout
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Minimum payout amount is $10. Current pending: $" + (totalPending / 100).toFixed(2),
        });
      }
      
      // Create payout
      const trackIds = earnings.filter(e => (e.pendingPayout || 0) > 0).map(e => e.trackId);
      const payout = await createWriterPayout({
        writerProfileId: profile.id,
        paymentMethodId: paymentMethod.id,
        amount: totalPending,
        currency: "USD",
        trackIds,
        status: "pending",
        scheduledFor: new Date(),
      });
      
      return {
        success: true,
        payoutId: payout.insertId,
        amount: totalPending,
      };
    }),
  }),
});
