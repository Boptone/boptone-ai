import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as fanfunnel from "../fanfunnel";
import { getArtistProfileByUserId } from "../db";
import crypto from "crypto";

export const fanfunnelRouter = router({
  // ============================================================================
  // FAN MANAGEMENT
  // ============================================================================

  getFans: protectedProcedure
    .input(z.object({
      funnelStage: z.enum(["discovered", "follower", "engaged", "customer", "superfan"]).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }

      return fanfunnel.getFansByArtist(profile.id, input);
    }),

  getFan: protectedProcedure
    .input(z.object({ fanId: z.number() }))
    .query(async ({ ctx, input }) => {
      const fan = await fanfunnel.getFanById(input.fanId);
      if (!fan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Fan not found" });
      }

      // Verify ownership
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile || fan.artistId !== profile.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      const events = await fanfunnel.getFanEvents(fan.id);
      return { fan, events };
    }),

  // ============================================================================
  // SMART LINKS
  // ============================================================================

  getSmartLinks: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getArtistProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
    }

    return fanfunnel.getSmartLinksByArtist(profile.id);
  }),

  createSmartLink: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      linkType: z.enum(["release", "presave", "bio", "tour", "merch", "custom"]),
      slug: z.string().min(1).max(100).optional(),
      destinations: z.object({
        spotify: z.string().url().optional(),
        appleMusic: z.string().url().optional(),
        youtube: z.string().url().optional(),
        soundcloud: z.string().url().optional(),
        bandcamp: z.string().url().optional(),
        tidal: z.string().url().optional(),
        amazonMusic: z.string().url().optional(),
        deezer: z.string().url().optional(),
        custom: z.string().url().optional(),
      }).optional(),
      defaultUrl: z.string().url().optional(),
      imageUrl: z.string().url().optional(),
      backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      collectEmail: z.boolean().default(false),
      collectPhone: z.boolean().default(false),
      showDiscoverySurvey: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }

      // Check Pro plan (placeholder - implement actual plan check)
      // if (profile.plan !== 'pro' && profile.plan !== 'label' && profile.plan !== 'enterprise') {
      //   throw new TRPCError({ code: "FORBIDDEN", message: "Fan Funnel requires Pro plan or higher" });
      // }

      const link = await fanfunnel.createSmartLink({
        artistId: profile.id,
        ...input,
      });

      return link;
    }),

  updateSmartLink: protectedProcedure
    .input(z.object({
      linkId: z.number(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      destinations: z.object({
        spotify: z.string().url().optional(),
        appleMusic: z.string().url().optional(),
        youtube: z.string().url().optional(),
        soundcloud: z.string().url().optional(),
        bandcamp: z.string().url().optional(),
        tidal: z.string().url().optional(),
        amazonMusic: z.string().url().optional(),
        deezer: z.string().url().optional(),
        custom: z.string().url().optional(),
      }).optional(),
      defaultUrl: z.string().url().optional(),
      imageUrl: z.string().url().optional(),
      backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      collectEmail: z.boolean().optional(),
      collectPhone: z.boolean().optional(),
      showDiscoverySurvey: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }

      const { linkId, ...data } = input;
      await fanfunnel.updateSmartLink(linkId, data);
      return { success: true };
    }),

  getLinkStats: protectedProcedure
    .input(z.object({ linkId: z.number() }))
    .query(async ({ ctx, input }) => {
      return fanfunnel.getLinkClickStats(input.linkId);
    }),

  // ============================================================================
  // PUBLIC LINK ACCESS (for fans clicking links)
  // ============================================================================

  getPublicLink: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const link = await fanfunnel.getSmartLinkBySlug(input.slug);
      if (!link || !link.isActive) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
      }

      return {
        title: link.title,
        description: link.description,
        linkType: link.linkType,
        destinations: link.destinations,
        imageUrl: link.imageUrl,
        backgroundColor: link.backgroundColor,
        collectEmail: link.collectEmail,
        collectPhone: link.collectPhone,
        showDiscoverySurvey: link.showDiscoverySurvey,
      };
    }),

  recordClick: publicProcedure
    .input(z.object({
      slug: z.string(),
      destination: z.string().optional(),
      utmSource: z.string().optional(),
      utmMedium: z.string().optional(),
      utmCampaign: z.string().optional(),
      utmContent: z.string().optional(),
      referrer: z.string().optional(),
      device: z.string().optional(),
      browser: z.string().optional(),
      os: z.string().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const link = await fanfunnel.getSmartLinkBySlug(input.slug);
      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
      }

      await fanfunnel.recordLinkClick({
        linkId: link.id,
        destination: input.destination,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        utmContent: input.utmContent,
        referrer: input.referrer,
        device: input.device,
        browser: input.browser,
        os: input.os,
        country: input.country,
        city: input.city,
      });

      return { success: true };
    }),

  // Fan signup from smart link
  signupFan: publicProcedure
    .input(z.object({
      slug: z.string(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      name: z.string().optional(),
      discoverySource: z.enum([
        "spotify_playlist", "spotify_algorithm", "spotify_search",
        "apple_music_playlist", "apple_music_algorithm", "apple_music_search",
        "youtube", "tiktok", "instagram", "twitter", "facebook",
        "friend_recommendation", "live_show", "radio", "podcast",
        "blog_press", "shazam", "bandcamp", "soundcloud", "other"
      ]).optional(),
      discoveryDetail: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const link = await fanfunnel.getSmartLinkBySlug(input.slug);
      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
      }

      if (!input.email && !input.phone) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Email or phone required" });
      }

      const fan = await fanfunnel.createOrUpdateFan({
        artistId: link.artistId,
        email: input.email,
        phone: input.phone,
        name: input.name,
        discoverySource: input.discoverySource,
        discoveryDetail: input.discoveryDetail,
        emailOptIn: !!input.email,
        smsOptIn: !!input.phone,
      });

      if (fan) {
        await fanfunnel.recordFanEvent({
          fanId: fan.id,
          artistId: link.artistId,
          eventType: "email_signup",
          eventSource: `smartlink:${link.slug}`,
          metadata: { linkId: link.id },
        });
      }

      return { success: true };
    }),

  // ============================================================================
  // FUNNEL ANALYTICS
  // ============================================================================

  getFunnelStats: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getArtistProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
    }

    return fanfunnel.getFunnelStats(profile.id);
  }),

  // ============================================================================
  // FAN SEGMENTS
  // ============================================================================

  getSegments: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getArtistProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
    }

    return fanfunnel.getFanSegmentsByArtist(profile.id);
  }),

  createSegment: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      rules: z.object({
        funnelStages: z.array(z.string()).optional(),
        discoverySources: z.array(z.string()).optional(),
        minFanScore: z.number().optional(),
        maxFanScore: z.number().optional(),
        countries: z.array(z.string()).optional(),
        hasEmail: z.boolean().optional(),
        hasPhone: z.boolean().optional(),
        hasPurchased: z.boolean().optional(),
        minLifetimeValue: z.number().optional(),
        lastActiveWithinDays: z.number().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }

      const segmentId = await fanfunnel.createFanSegment({
        artistId: profile.id,
        name: input.name,
        description: input.description,
        rules: input.rules,
      });

      return { id: segmentId };
    }),
});
