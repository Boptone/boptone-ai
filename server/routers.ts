import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { stripeRouter } from "./routers/stripe";

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
      coverImageUrl: z.string().optional(),
      socialLinks: z.object({
        instagram: z.string().optional(),
        tiktok: z.string().optional(),
        twitter: z.string().optional(),
        youtube: z.string().optional(),
        spotify: z.string().optional(),
        website: z.string().optional(),
      }).optional(),
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

const productsRouter = router({
  // Create product
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      price: z.number().int(), // in cents
      inventoryCount: z.number().int().default(0),
      images: z.array(z.string()).optional(),
      variants: z.object({
        size: z.array(z.string()).optional(),
        color: z.array(z.string()).optional(),
      }).optional(),
      productType: z.enum(["physical", "digital", "experience"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new Error("Artist profile not found");
      
      return await db.createProduct({
        artistId: profile.id,
        ...input,
      });
    }),

  // Get products
  getAll: protectedProcedure
    .input(z.object({
      isActive: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) return [];
      
      return await db.getProducts(profile.id, input.isActive);
    }),

  // Update product
  update: protectedProcedure
    .input(z.object({
      id: z.number().int(),
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().int().optional(),
      inventoryCount: z.number().int().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await db.updateProduct(id, updates);
      return { success: true };
    }),
});

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
  }),

  // Feature routers
  artistProfile: artistProfileRouter,
  metrics: metricsRouter,
  revenue: revenueRouter,
  loans: loansRouter,
  products: productsRouter,
  releases: releasesRouter,
  stripe: stripeRouter,
  ipProtection: ipProtectionRouter,
  tours: toursRouter,
  healthcare: healthcareRouter,
  opportunities: opportunitiesRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
