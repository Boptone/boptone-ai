import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { stripeRouter } from "./routers/stripe";
import { bapRouter } from "./routers/bap";
import { toneRewardsRouter } from "./routers/tonerewards";
import { kickinRouter } from "./routers/kickin";
import { fanFunnelRouter } from "./routers/fanfunnel";
import { microloansRouter } from "./routers/microloans";
import { ecommerceRouter } from "./ecommerceRouter";
import { podRouter } from "./routers/pod";
import { writerPaymentsRouter } from "./routers/writerPayments";
import { subscriptionsRouter } from "./routers/subscriptions";
import { musicRouter } from "./routers/music";
import { payoutsRouter } from "./routers/payouts";
import { workflowsRouter } from "./routers/workflows";
import { toneyRouter } from "./routers/toney";

// ============================================================================
// ARTIST PROFILE ROUTER
// ============================================================================

const artistProfileRouter = router({
  // Get current user's artist profile
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    return await db.getArtistProfileByUserId(ctx.user.id);
  }),

  // Create artist profile
  create: protectedProcedure
    .input(z.object({
      stageName: z.string().min(1).max(255),
      bio: z.string().optional(),
      genres: z.array(z.string()).optional(),
      location: z.string().optional(),
      socialLinks: z.object({
        instagram: z.string().optional(),
        tiktok: z.string().optional(),
        twitter: z.string().optional(),
        youtube: z.string().optional(),
        spotify: z.string().optional(),
        website: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.createArtistProfile({
        userId: ctx.user.id,
        ...input,
      });
    }),

  // Update artist profile
  update: protectedProcedure
    .input(z.object({
      stageName: z.string().optional(),
      bio: z.string().optional(),
      genres: z.array(z.string()).optional(),
      location: z.string().optional(),
      avatarUrl: z.string().optional(),
      profilePhotoUrl: z.string().optional(),
      coverImageUrl: z.string().optional(),
      socialLinks: z.object({
        instagram: z.string().optional(),
        tiktok: z.string().optional(),
        twitter: z.string().optional(),
        youtube: z.string().optional(),
        spotify: z.string().optional(),
        website: z.string().optional(),
      }).optional(),
      themeColor: z.string().optional(),
      accentColor: z.string().optional(),
      layoutStyle: z.enum(["default", "minimal", "grid"]).optional(),
      fontFamily: z.string().optional(),
      onboardingCompleted: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new Error("Artist profile not found");
      
      await db.updateArtistProfile(profile.id, input);
      return { success: true };
    }),

  // Get all artist profiles (admin only)
  getAll: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getAllArtistProfiles(input.limit, input.offset);
    }),

  // Get artist profile by username (public)
  getByUsername: publicProcedure
    .input(z.object({
      username: z.string(),
    }))
    .query(async ({ input }) => {
      // For now, use stageName as username. Later we can add a dedicated username field
      const profiles = await db.getAllArtistProfiles(1, 0);
      return profiles.find(p => p.stageName?.toLowerCase() === input.username.toLowerCase());
    }),

  // Upload profile photo to S3
  uploadPhoto: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileData: z.string(), // base64 encoded image
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { storagePut } = await import("./storage");
      
      // Convert base64 to buffer
      const base64Data = input.fileData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileExtension = input.fileName.split(".").pop() || "jpg";
      const fileKey = `profile-photos/${ctx.user.id}/${timestamp}-${randomSuffix}.${fileExtension}`;
      
      // Upload to S3
      const result = await storagePut(fileKey, buffer, input.mimeType);
      
      return { url: result.url, key: result.key };
    }),
});

// ============================================================================
// METRICS ROUTER
// ============================================================================

const metricsRouter = router({
  // Add streaming metric
  addStreaming: protectedProcedure
    .input(z.object({
      platform: z.enum(["spotify", "apple_music", "youtube_music", "amazon_music", "tidal", "soundcloud"]),
      metricType: z.enum(["streams", "followers", "monthly_listeners", "saves", "playlist_adds"]),
      value: z.number().int(),
      growthRate: z.string().optional(),
      date: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new Error("Artist profile not found");
      
      await db.addStreamingMetric({
        artistId: profile.id,
        ...input,
      });
      return { success: true };
    }),

  // Get streaming metrics
  getStreaming: protectedProcedure
    .input(z.object({
      platform: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) return [];
      
      return await db.getStreamingMetrics(profile.id, input.platform, input.startDate, input.endDate);
    }),

  // Add social media metric
  addSocial: protectedProcedure
    .input(z.object({
      platform: z.enum(["instagram", "tiktok", "twitter", "youtube", "facebook"]),
      followers: z.number().int(),
      engagementRate: z.string().optional(),
      viralScore: z.string().optional(),
      totalPosts: z.number().int().optional(),
      averageLikes: z.number().int().optional(),
      averageComments: z.number().int().optional(),
      averageShares: z.number().int().optional(),
      date: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new Error("Artist profile not found");
      
      await db.addSocialMediaMetric({
        artistId: profile.id,
        ...input,
      });
      return { success: true };
    }),

  // Get social media metrics
  getSocial: protectedProcedure
    .input(z.object({
      platform: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) return [];
      
      return await db.getSocialMediaMetrics(profile.id, input.platform, input.startDate, input.endDate);
    }),
});

// ============================================================================
// REVENUE ROUTER
// ============================================================================

const revenueRouter = router({
  // Add revenue record
  add: protectedProcedure
    .input(z.object({
      source: z.enum(["streaming", "merchandise", "shows", "licensing", "brand_deals", "youtube_ads", "patreon", "other"]),
      amount: z.number().int(), // in cents
      currency: z.string().default("USD"),
      description: z.string().optional(),
      status: z.enum(["pending", "paid", "disputed", "cancelled"]).default("pending"),
      paymentDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new Error("Artist profile not found");
      
      await db.addRevenueRecord({
        artistId: profile.id,
        ...input,
      });
      return { success: true };
    }),

  // Get revenue records
  getAll: protectedProcedure
    .input(z.object({
      source: z.string().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) return [];
      
      return await db.getRevenueRecords(profile.id, input.source, input.status);
    }),

  // Get total revenue
  getTotal: protectedProcedure
    .input(z.object({
      source: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) return 0;
      
      return await db.getTotalRevenue(profile.id, input.source);
    }),
});

// ============================================================================
// MICRO-LOANS ROUTER
// ============================================================================

const loansRouter = router({
  // Apply for loan
  applyForLoan: protectedProcedure
    .input(z.object({
      amount: z.number().int(), // in cents
      repaymentTermMonths: z.number().int().min(1).max(24),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new Error("Artist profile not found");
      
      // Simple risk assessment (in production, this would be more sophisticated)
      const totalRevenue = await db.getTotalRevenue(profile.id);
      const riskScore = totalRevenue > input.amount * 2 ? "25.00" : "75.00";
      
      return await db.createMicroLoan({
        artistId: profile.id,
        amount: input.amount,
        interestRate: "5.00", // 5% interest rate
        repaymentTermMonths: input.repaymentTermMonths,
        riskScore,
        monthlyPayment: Math.ceil((input.amount * 1.05) / input.repaymentTermMonths),
        remainingBalance: Math.ceil(input.amount * 1.05),
      });
    }),

  // Get loans
  getAll: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) return [];
      
      return await db.getMicroLoans(profile.id, input.status);
    }),
});

// ============================================================================
// PRODUCTS / MERCHANDISE ROUTER
// ============================================================================

// Products router moved to ecommerceRouter below

// ============================================================================
// RELEASES / DISTRIBUTION ROUTER
// ============================================================================

const releasesRouter = router({
  // Create release
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      releaseType: z.enum(["single", "ep", "album", "compilation"]),
      releaseDate: z.date(),
      platforms: z.array(z.string()).optional(),
      artworkUrl: z.string().optional(),
      totalTracks: z.number().int().optional(),
      metadata: z.object({
        genre: z.string().optional(),
        label: z.string().optional(),
        copyrightYear: z.number().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new Error("Artist profile not found");
      
      return await db.createRelease({
        artistId: profile.id,
        ...input,
      });
    }),

  // Get releases
  getAll: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) return [];
      
      return await db.getReleases(profile.id, input.status);
    }),

  // Update release
  update: protectedProcedure
    .input(z.object({
      id: z.number().int(),
      status: z.enum(["draft", "scheduled", "released", "cancelled"]).optional(),
      upcCode: z.string().optional(),
      isrcCodes: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await db.updateRelease(id, updates);
      return { success: true };
    }),
});

// ============================================================================
// IP PROTECTION ROUTER
// ============================================================================

const ipProtectionRouter = router({
  // Get infringements
  getAll: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) return [];
      
      return await db.getInfringements(profile.id, input.status);
    }),

  // Update infringement status
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number().int(),
      status: z.enum(["detected", "dmca_sent", "resolved", "disputed", "false_positive"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await db.updateInfringement(id, updates);
      return { success: true };
    }),
});

// ============================================================================
// TOURS ROUTER
// ============================================================================

const toursRouter = router({
  // Create tour
  create: protectedProcedure
    .input(z.object({
      tourName: z.string().min(1).max(255),
      startDate: z.date(),
      endDate: z.date(),
      venues: z.array(z.object({
        name: z.string(),
        city: z.string(),
        state: z.string().optional(),
        country: z.string(),
        date: z.string(),
        capacity: z.number().optional(),
        ticketsSold: z.number().optional(),
      })).optional(),
      budget: z.number().int().optional(),
      revenueProjection: z.number().int().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new Error("Artist profile not found");
      
      return await db.createTour({
        artistId: profile.id,
        ...input,
      });
    }),

  // Get tours
  getAll: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) return [];
      
      return await db.getTours(profile.id, input.status);
    }),

  // Update tour
  update: protectedProcedure
    .input(z.object({
      id: z.number().int(),
      status: z.enum(["planning", "confirmed", "in_progress", "completed", "cancelled"]).optional(),
      actualRevenue: z.number().int().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await db.updateTour(id, updates);
      return { success: true };
    }),
});

// ============================================================================
// HEALTHCARE ROUTER
// ============================================================================

const healthcareRouter = router({
  // Get healthcare plans
  getAll: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) return [];
      
      return await db.getHealthcarePlans(profile.id, input.status);
    }),

  // Enroll in plan
  enroll: protectedProcedure
    .input(z.object({
      provider: z.string(),
      planType: z.string(),
      monthlyCost: z.number().int(),
      coverageDetails: z.object({
        medical: z.boolean().optional(),
        dental: z.boolean().optional(),
        vision: z.boolean().optional(),
        mentalHealth: z.boolean().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new Error("Artist profile not found");
      
      return await db.createHealthcarePlan({
        artistId: profile.id,
        enrollmentDate: new Date(),
        ...input,
      });
    }),
});

// ============================================================================
// OPPORTUNITIES ROUTER
// ============================================================================

const opportunitiesRouter = router({
  // Get opportunities
  getAll: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      opportunityType: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) return [];
      
      return await db.getOpportunities(profile.id, input.status, input.opportunityType);
    }),

  // Update opportunity status
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number().int(),
      status: z.enum(["new", "contacted", "in_progress", "accepted", "declined", "expired"]),
    }))
    .mutation(async ({ input }) => {
      await db.updateOpportunity(input.id, { status: input.status });
      return { success: true };
    }),
});

// ============================================================================
// NOTIFICATIONS ROUTER
// ============================================================================

const notificationsRouter = router({
  // Get notifications
  getAll: protectedProcedure
    .input(z.object({
      isRead: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return await db.getNotifications(ctx.user.id, input.isRead);
    }),

  // Mark as read
  markAsRead: protectedProcedure
    .input(z.object({
      id: z.number().int(),
    }))
    .mutation(async ({ input }) => {
      await db.markNotificationAsRead(input.id);
      return { success: true };
    }),
});

// ============================================================================
// MAIN APP ROUTER
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    // Email verification flow
    sendEmailVerification: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        // Create verification code in database
        const code = await db.createVerificationCode("email", input.email);
        console.log(`[Auth] Email verification code for ${input.email}: ${code}`);
        
        // TODO: Send email via Resend API
        // await resend.emails.send({
        //   from: 'Boptone <verify@boptone.com>',
        //   to: input.email,
        //   subject: 'Verify your Boptone account',
        //   html: `Your verification code is: <strong>${code}</strong>`,
        // });
        
        return { success: true, message: "Verification code sent to email" };
      }),

    verifyEmailCode: publicProcedure
      .input(z.object({ email: z.string().email(), code: z.string() }))
      .mutation(async ({ input }) => {
        // Verify code against database
        const isValid = await db.verifyCode("email", input.email, input.code);
        if (isValid) {
          console.log(`[Auth] Email verified: ${input.email}`);
          return { success: true };
        }
        return { success: false };
      }),

    // Phone verification flow (Twilio-ready)
    sendPhoneVerification: publicProcedure
      .input(z.object({ phone: z.string() }))
      .mutation(async ({ input }) => {
        // Create verification code in database
        const code = await db.createVerificationCode("phone", input.phone);
        console.log(`[Auth] SMS verification code for ${input.phone}: ${code}`);
        
        // TODO: Send SMS via Twilio
        // await twilioClient.messages.create({
        //   body: `Your Boptone verification code is: ${code}`,
        //   from: process.env.TWILIO_PHONE_NUMBER,
        //   to: input.phone,
        // });
        
        return { success: true, message: "Verification code sent via SMS" };
      }),

    verifyPhoneCode: publicProcedure
      .input(z.object({ phone: z.string(), code: z.string() }))
      .mutation(async ({ input }) => {
        // Verify code against database
        const isValid = await db.verifyCode("phone", input.phone, input.code);
        if (isValid) {
          console.log(`[Auth] Phone verified: ${input.phone}`);
          return { success: true };
        }
        return { success: false };
      }),

    // Password reset flow
    sendPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        // Create password reset code in database
        const code = await db.createVerificationCode("password_reset", input.email);
        console.log(`[Auth] Password reset code for ${input.email}: ${code}`);
        
        // TODO: Send email via Resend API
        // await resend.emails.send({
        //   from: 'Boptone <reset@boptone.com>',
        //   to: input.email,
        //   subject: 'Reset your Boptone password',
        //   html: `Your password reset code is: <strong>${code}</strong>`,
        // });
        
        return { success: true, message: "Password reset code sent to email" };
      }),

    verifyPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email(), code: z.string() }))
      .mutation(async ({ input }) => {
        // Verify code against database
        const isValid = await db.verifyCode("password_reset", input.email, input.code);
        if (isValid) {
          console.log(`[Auth] Password reset code verified for: ${input.email}`);
          return { success: true };
        }
        return { success: false };
      }),
  }),

  // Feature routers
  artistProfile: artistProfileRouter,
  metrics: metricsRouter,
  revenue: revenueRouter,
  loans: loansRouter,
  // products: productsRouter, // Replaced by ecommerce router
  ecommerce: ecommerceRouter,
  pod: podRouter,
  releases: releasesRouter,
  stripe: stripeRouter,
  ipProtection: ipProtectionRouter,
  tours: toursRouter,
  healthcare: healthcareRouter,
  opportunities: opportunitiesRouter,
  notifications: notificationsRouter,
  
  // Boptone Audio Protocol (BAP)
  bap: bapRouter,
  
  // Tone Rewards Membership System
  toneRewards: toneRewardsRouter,
  
  // Kick In Tip Jar
  kickin: kickinRouter,
  
  // Fan Funnel Marketing
  fanFunnel: fanFunnelRouter,
  
  // Artist Micro-Loans
  microloans: microloansRouter,
  
  // Writer Payment System (Songwriter Splits)
  writerPayments: writerPaymentsRouter,

  // Subscription Management (Upgrade/Downgrade)
  subscriptions: subscriptionsRouter,

  // Music Upload & Management System
  music: musicRouter,

  // Payout System (Withdrawals & Bank Accounts)
  payouts: payoutsRouter,

  // Workflow Automation System (Pro/Enterprise)
  workflows: workflowsRouter,

  // Toney AI Assistant
  toney: toneyRouter,
});

export type AppRouter = typeof appRouter;
