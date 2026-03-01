/**
 * Music Management Router
 * Handles track upload, CRUD operations, and metadata management
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { bapTracks, bapAlbums, artistProfiles } from "../../drizzle/schema";
import { eq, and, desc, asc, like, or, sql } from "drizzle-orm";
import { storagePut } from "../storage";
import { 
  extractAudioMetadata, 
  generateTrackFileKey,
  generateArtworkFileKey 
} from "../audioMetadata";
import { validateAudioForDistribution, validateAudioFile, validateCoverArt } from "../lib/audioValidator";
import { validateCoverArtFile } from "../lib/coverArtValidator";
import { TRPCError } from "@trpc/server";

export const musicRouter = router({
  /**
   * Upload a new track with audio file and metadata
   */
  uploadTrack: protectedProcedure
    .input(z.object({
      // Audio file (base64 encoded)
      audioFileBase64: z.string(),
      audioFileName: z.string(),
      
      // Cover art (optional, base64 encoded)
      artworkFileBase64: z.string().optional(),
      artworkFileName: z.string().optional(),
      
      // Track metadata
      title: z.string().min(1).max(255),
      artist: z.string().optional(), // Defaults to artist profile name
      albumId: z.number().optional(),
      genre: z.string().optional(),
      mood: z.string().optional(),
      bpm: z.number().optional(),
      musicalKey: z.string().optional(),
      isExplicit: z.boolean().default(false),
      
      // Publishing metadata
      isrcCode: z.string().optional(),
      songwriterSplits: z.array(z.object({
        name: z.string(),
        percentage: z.number().min(0).max(100),
        ipi: z.string().optional(),
      })).optional(),
      publishingData: z.object({
        publisher: z.string().optional(),
        pro: z.string().optional(),
      }).optional(),
      
      // AI disclosure
      aiDisclosure: z.object({
        used: z.boolean(),
        types: z.array(z.enum(['lyrics', 'production', 'mastering', 'vocals', 'artwork'])).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Get artist profile
      const [profile] = await db
        .select()
        .from(artistProfiles)
        .where(eq(artistProfiles.userId, ctx.user.id))
        .limit(1);
      
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      try {
        // Decode audio file from base64
        const audioBuffer = Buffer.from(input.audioFileBase64, 'base64');
        
        // Enterprise audio validation — DSP distribution quality gate (DISTRO-A1)
        const audioValidation = await validateAudioForDistribution(
          audioBuffer,
          input.audioFileName,
          { skipLoudness: false }
        );
        
        // Block upload on hard errors (corrupt file, wrong format, clipping, etc.)
        if (!audioValidation.isUploadable) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: audioValidation.errors[0]?.message ?? "Audio file failed quality validation.",
          });
        }
        
        // Extract audio metadata
        const metadata = await extractAudioMetadata(audioBuffer, input.audioFileName);
        
        // Upload audio file to S3
        const audioFileKey = generateTrackFileKey(profile.id, input.audioFileName);
        const audioUploadResult = await storagePut(
          audioFileKey,
          audioBuffer,
          `audio/${metadata.format}`
        );
        
        // Upload artwork if provided — enterprise cover art validator (DISTRO-A5)
        let artworkUrl: string | undefined;
        let coverArtReport: Awaited<ReturnType<typeof validateCoverArtFile>> | null = null;
        if (input.artworkFileBase64 && input.artworkFileName) {
          const artworkBuffer = Buffer.from(input.artworkFileBase64, 'base64');
          
          // Run enterprise cover art validation (DISTRO-A5)
          coverArtReport = await validateCoverArtFile(artworkBuffer, artworkBuffer.length);
          
          // Hard-reject only on critical errors (wrong format, CMYK, not square, too small)
          if (coverArtReport.qualityTier === 'rejected') {
            const firstError = coverArtReport.issues[0];
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Cover art rejected: ${firstError?.message ?? 'Does not meet DSP requirements'}`,
            });
          }
          
          const artworkFileKey = generateArtworkFileKey(profile.id, input.artworkFileName);
          const mimeType = input.artworkFileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
          const artworkUploadResult = await storagePut(
            artworkFileKey,
            artworkBuffer,
            mimeType
          );
          artworkUrl = artworkUploadResult.url;
        }
        
        // Validate songwriter splits add up to 100%
        if (input.songwriterSplits && input.songwriterSplits.length > 0) {
          const totalPercentage = input.songwriterSplits.reduce((sum, split) => sum + split.percentage, 0);
          if (Math.abs(totalPercentage - 100) > 0.01) {
            throw new TRPCError({ 
              code: "BAD_REQUEST", 
              message: `Songwriter splits must add up to 100% (current total: ${totalPercentage}%)` 
            });
          }
        }
        
        // Build audioMetrics payload from full validation result (DISTRO-A2)
        const lr = audioValidation.loudnessReport;
        const tp = audioValidation.technicalProfile;
        const audioMetricsPayload = {
          qualityTier: audioValidation.qualityTier,
          isDistributionReady: audioValidation.isDistributionReady,
          sampleRateHz: tp?.sampleRateHz ?? null,
          bitDepth: tp?.bitDepth ?? null,
          channels: tp?.channels ?? null,
          bitrateKbps: tp?.bitrateKbps ?? null,
          isLossless: tp?.isLossless ?? false,
          codec: tp?.codec ?? null,
          integratedLufs: lr?.integratedLufs ?? null,
          truePeakDbtp: lr?.truePeakDbtp ?? null,
          loudnessRange: lr?.loudnessRange ?? null,
          isClipping: lr?.isClipping ?? false,
          spotifyReady: lr?.spotifyReady ?? false,
          appleReady: lr?.appleReady ?? false,
          youtubeReady: lr?.youtubeReady ?? false,
          amazonReady: lr?.integratedLufs !== null && lr?.integratedLufs !== undefined
            ? Math.abs(lr.integratedLufs - (-14)) <= 3 : false,
          tidalReady: lr?.integratedLufs !== null && lr?.integratedLufs !== undefined
            ? Math.abs(lr.integratedLufs - (-14)) <= 3 : false,
          deezerReady: lr?.integratedLufs !== null && lr?.integratedLufs !== undefined
            ? Math.abs(lr.integratedLufs - (-15)) <= 3 : false,
          loudnessRecommendation: lr?.recommendation ?? null,
          validatedAt: new Date().toISOString(),
        };

        // Insert track into database
        const [track] = await db.insert(bapTracks).values({
          artistId: profile.id,
          title: input.title,
          artist: input.artist || profile.stageName,
          albumId: input.albumId,
          duration: metadata.duration,
          bpm: input.bpm,
          musicalKey: input.musicalKey,
          genre: input.genre,
          mood: input.mood,
          audioUrl: audioUploadResult.url,
          artworkUrl,
          fileSize: metadata.fileSize,
          audioFormat: metadata.format,
          isrcCode: input.isrcCode,
          songwriterSplits: input.songwriterSplits,
          publishingData: input.publishingData,
          aiDisclosure: input.aiDisclosure,
          isExplicit: input.isExplicit,
          status: 'draft',
          audioMetrics: audioMetricsPayload,
        });
        
        return {
          success: true,
          trackId: track.insertId,
          message: "Track uploaded successfully",
          // Full quality report for client-side display (AudioQualityReport + LoudnessMeter)
          audioQuality: {
            qualityTier: audioValidation.qualityTier,
            isDistributionReady: audioValidation.isDistributionReady,
            summary: audioValidation.summary,
            warnings: audioValidation.warnings.map(w => ({ code: w.code, message: w.message, field: w.field })),
            errors: audioValidation.errors.map(e => ({ code: e.code, message: e.message, field: e.field })),
            recommendations: audioValidation.recommendations,
            loudness: audioValidation.loudnessReport ? {
              integratedLufs: audioValidation.loudnessReport.integratedLufs,
              truePeakDbtp: audioValidation.loudnessReport.truePeakDbtp,
              loudnessRange: audioValidation.loudnessReport.loudnessRange,
              isClipping: audioValidation.loudnessReport.isClipping,
              spotifyReady: audioValidation.loudnessReport.spotifyReady,
              appleReady: audioValidation.loudnessReport.appleReady,
              youtubeReady: audioValidation.loudnessReport.youtubeReady,
              amazonReady: audioMetricsPayload.amazonReady,
              tidalReady: audioMetricsPayload.tidalReady,
              deezerReady: audioMetricsPayload.deezerReady,
              recommendation: audioValidation.loudnessReport.recommendation,
            } : null,
            technicalProfile: audioValidation.technicalProfile ? {
              format: audioValidation.technicalProfile.format,
              sampleRateHz: audioValidation.technicalProfile.sampleRateHz,
              bitDepth: audioValidation.technicalProfile.bitDepth,
              channels: audioValidation.technicalProfile.channels,
              bitrateKbps: audioValidation.technicalProfile.bitrateKbps,
              durationSeconds: audioValidation.technicalProfile.durationSeconds,
              isLossless: audioValidation.technicalProfile.isLossless,
              codec: audioValidation.technicalProfile.codec,
            } : null,
          },
          // Cover art compliance report (DISTRO-A5)
          coverArt: coverArtReport ? {
            qualityTier: coverArtReport.qualityTier,
            isDistributionReady: coverArtReport.isDistributionReady,
            width: coverArtReport.width,
            height: coverArtReport.height,
            format: coverArtReport.format,
            colorSpace: coverArtReport.colorSpace,
            fileSizeBytes: coverArtReport.fileSizeBytes,
            hasAlphaChannel: coverArtReport.hasAlphaChannel,
            issues: coverArtReport.issues.map(i => ({ code: i.code, severity: i.severity, message: i.message, affectedDsps: i.affectedDsps })),
            warnings: coverArtReport.warnings.map(w => ({ code: w.code, severity: w.severity, message: w.message, affectedDsps: w.affectedDsps })),
            dspCompliance: coverArtReport.dspCompliance,
            recommendation: coverArtReport.recommendation,
          } : null,
        };
      } catch (error) {
        console.error('[Music] Upload failed:', error);
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: error instanceof Error ? error.message : "Failed to upload track" 
        });
      }
    }),
  
  /**
   * Get all tracks for the current artist
   */
  getTracks: protectedProcedure
    .input(z.object({
      status: z.enum(['draft', 'processing', 'live', 'archived']).optional(),
      search: z.string().optional(),
      sortBy: z.enum(['createdAt', 'title', 'playCount', 'duration']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Get artist profile
      const [profile] = await db
        .select()
        .from(artistProfiles)
        .where(eq(artistProfiles.userId, ctx.user.id))
        .limit(1);
      
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      // Build query conditions
      const conditions = [eq(bapTracks.artistId, profile.id)];
      
      if (input.status) {
        conditions.push(eq(bapTracks.status, input.status));
      }
      
      if (input.search) {
        conditions.push(
          or(
            like(bapTracks.title, `%${input.search}%`),
            like(bapTracks.artist, `%${input.search}%`),
            like(bapTracks.genre, `%${input.search}%`)
          )!
        );
      }
      
      // Determine sort column
      const sortColumn = input.sortBy === 'createdAt' ? bapTracks.createdAt :
                        input.sortBy === 'title' ? bapTracks.title :
                        input.sortBy === 'playCount' ? bapTracks.playCount :
                        bapTracks.duration;
      
      // Execute query
      const tracks = await db
        .select()
        .from(bapTracks)
        .where(and(...conditions))
        .orderBy(input.sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
        .limit(input.limit)
        .offset(input.offset);
      
      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(bapTracks)
        .where(and(...conditions));
      
      return {
        tracks,
        total: countResult?.count || 0,
        hasMore: (input.offset + tracks.length) < (countResult?.count || 0),
      };
    }),
  
  /**
   * Get a single track by ID
   */
  getTrack: protectedProcedure
    .input(z.object({
      trackId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Get artist profile
      const [profile] = await db
        .select()
        .from(artistProfiles)
        .where(eq(artistProfiles.userId, ctx.user.id))
        .limit(1);
      
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      // Get track
      const [track] = await db
        .select()
        .from(bapTracks)
        .where(and(
          eq(bapTracks.id, input.trackId),
          eq(bapTracks.artistId, profile.id)
        ))
        .limit(1);
      
      if (!track) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Track not found" });
      }
      
      return track;
    }),
  
  /**
   * Update track metadata
   */
  updateTrack: protectedProcedure
    .input(z.object({
      trackId: z.number(),
      title: z.string().min(1).max(255).optional(),
      artist: z.string().optional(),
      genre: z.string().optional(),
      mood: z.string().optional(),
      bpm: z.number().optional(),
      musicalKey: z.string().optional(),
      isExplicit: z.boolean().optional(),
      isrcCode: z.string().optional(),
      songwriterSplits: z.array(z.object({
        name: z.string(),
        percentage: z.number().min(0).max(100),
        ipi: z.string().optional(),
      })).optional(),
      publishingData: z.object({
        publisher: z.string().optional(),
        pro: z.string().optional(),
      }).optional(),
      aiDisclosure: z.object({
        used: z.boolean(),
        types: z.array(z.enum(['lyrics', 'production', 'mastering', 'vocals', 'artwork'])).optional(),
      }).optional(),
      status: z.enum(['draft', 'processing', 'live', 'archived']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Get artist profile
      const [profile] = await db
        .select()
        .from(artistProfiles)
        .where(eq(artistProfiles.userId, ctx.user.id))
        .limit(1);
      
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      // Validate songwriter splits if provided
      if (input.songwriterSplits && input.songwriterSplits.length > 0) {
        const totalPercentage = input.songwriterSplits.reduce((sum, split) => sum + split.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: `Songwriter splits must add up to 100% (current total: ${totalPercentage}%)` 
          });
        }
      }
      
      // Update track
      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.artist !== undefined) updateData.artist = input.artist;
      if (input.genre !== undefined) updateData.genre = input.genre;
      if (input.mood !== undefined) updateData.mood = input.mood;
      if (input.bpm !== undefined) updateData.bpm = input.bpm;
      if (input.musicalKey !== undefined) updateData.musicalKey = input.musicalKey;
      if (input.isExplicit !== undefined) updateData.isExplicit = input.isExplicit;
      if (input.isrcCode !== undefined) updateData.isrcCode = input.isrcCode;
      if (input.songwriterSplits !== undefined) updateData.songwriterSplits = input.songwriterSplits;
      if (input.publishingData !== undefined) updateData.publishingData = input.publishingData;
      if (input.aiDisclosure !== undefined) updateData.aiDisclosure = input.aiDisclosure;
      if (input.status !== undefined) updateData.status = input.status;
      
      await db
        .update(bapTracks)
        .set(updateData)
        .where(and(
          eq(bapTracks.id, input.trackId),
          eq(bapTracks.artistId, profile.id)
        ));
      
      return {
        success: true,
        message: "Track updated successfully",
      };
    }),
  
  /**
   * Delete a track
   */
  deleteTrack: protectedProcedure
    .input(z.object({
      trackId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Get artist profile
      const [profile] = await db
        .select()
        .from(artistProfiles)
        .where(eq(artistProfiles.userId, ctx.user.id))
        .limit(1);
      
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      // Delete track (soft delete by archiving)
      await db
        .update(bapTracks)
        .set({ status: 'archived' })
        .where(and(
          eq(bapTracks.id, input.trackId),
          eq(bapTracks.artistId, profile.id)
        ));
      
      return {
        success: true,
        message: "Track deleted successfully",
      };
    }),
  
  /**
   * Get track statistics
   */
  getTrackStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Get artist profile
      const [profile] = await db
        .select()
        .from(artistProfiles)
        .where(eq(artistProfiles.userId, ctx.user.id))
        .limit(1);
      
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }
      
      // Get statistics
      const [stats] = await db
        .select({
          totalTracks: sql<number>`count(*)`,
          liveTracks: sql<number>`sum(case when ${bapTracks.status} = 'live' then 1 else 0 end)`,
          draftTracks: sql<number>`sum(case when ${bapTracks.status} = 'draft' then 1 else 0 end)`,
          totalPlays: sql<number>`sum(${bapTracks.playCount})`,
          totalLikes: sql<number>`sum(${bapTracks.likeCount})`,
          totalEarnings: sql<number>`sum(${bapTracks.totalEarnings})`,
        })
        .from(bapTracks)
        .where(eq(bapTracks.artistId, profile.id));
      
      return stats || {
        totalTracks: 0,
        liveTracks: 0,
        draftTracks: 0,
        totalPlays: 0,
        totalLikes: 0,
        totalEarnings: 0,
      };
    }),

  /**
   * Batch Upload Tracks
   * Upload multiple tracks at once with shared metadata
   */
  batchUploadTracks: protectedProcedure
    .input(z.object({
      tracks: z.array(z.object({
        audioFileBase64: z.string(),
        audioFileName: z.string(),
        title: z.string().min(1).max(255),
      })),
      
      // Shared metadata applied to all tracks
      sharedMetadata: z.object({
        artist: z.string().optional(),
        genre: z.string().optional(),
        mood: z.string().optional(),
        artworkFileBase64: z.string().optional(),
        artworkFileName: z.string().optional(),
      }),
      
      // Distribution settings
      distribution: z.object({
        distributeToBAP: z.boolean().default(true),
        platformIds: z.array(z.number()).default([]),
        releaseDate: z.string().optional(), // ISO date string
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user.id;
      const uploadedTracks = [];

      // Upload shared artwork once if provided
      let sharedArtworkUrl: string | undefined;
      if (input.sharedMetadata.artworkFileBase64 && input.sharedMetadata.artworkFileName) {
        const artworkBuffer = Buffer.from(input.sharedMetadata.artworkFileBase64, "base64");
        const artworkKey = generateArtworkFileKey(userId, input.sharedMetadata.artworkFileName);
        const artworkResult = await storagePut(artworkKey, artworkBuffer, "image/jpeg");
        sharedArtworkUrl = artworkResult.url;
      }

      // Process each track
      for (const track of input.tracks) {
        try {
          // Decode and validate audio file
          const audioBuffer = Buffer.from(track.audioFileBase64, "base64");
          const validation = await validateAudioFile(audioBuffer, track.audioFileName);
          
          if (!validation.isValid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Invalid audio file: ${track.audioFileName} - ${validation.error}`,
            });
          }

          // Extract metadata
          const metadata = await extractAudioMetadata(audioBuffer, track.audioFileName);

          // Upload audio file to S3
          const audioKey = generateTrackFileKey(userId, track.audioFileName);
          const audioResult = await storagePut(audioKey, audioBuffer, validation.mimeType!);

          // Insert track into database
          const [insertedTrack] = await db.insert(bapTracks).values({
            artistId: userId,
            title: track.title,
            artist: input.sharedMetadata.artist || ctx.user.name || "Unknown Artist",
            genre: input.sharedMetadata.genre,
            mood: input.sharedMetadata.mood,
            audioUrl: audioResult.url,
            artworkUrl: sharedArtworkUrl,
            duration: metadata.duration,
            audioFormat: validation.format,
            fileSize: audioBuffer.length,
            status: "draft",
          }).$returningId();

          const trackId = insertedTrack.id;

          // Handle distribution if BAP is selected
          if (input.distribution.distributeToBAP) {
            // Track is already in bapTracks, just update status if releasing immediately
            if (!input.distribution.releaseDate) {
              await db.update(bapTracks)
                .set({ status: "live" })
                .where(eq(bapTracks.id, trackId));
            }
          }

          // Handle third-party distribution
          if (input.distribution.platformIds.length > 0) {
            const { trackDistributions } = await import("../../drizzle/schema");
            
            for (const platformId of input.distribution.platformIds) {
              await db.insert(trackDistributions).values({
                trackId,
                platformId,
                status: "pending",
                releaseDate: input.distribution.releaseDate ? new Date(input.distribution.releaseDate) : null,
              });
            }
          }

          uploadedTracks.push({
            id: trackId,
            title: track.title,
            status: "success",
          });
        } catch (error) {
          uploadedTracks.push({
            title: track.title,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        success: true,
        uploadedTracks,
        totalUploaded: uploadedTracks.filter(t => t.status === "success").length,
        totalFailed: uploadedTracks.filter(t => t.status === "error").length,
      };
    }),

  /**
   * Get Distribution Platforms
   * Fetch all available third-party streaming platforms
   */
  getDistributionPlatforms: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { distributionPlatforms } = await import("../../drizzle/schema");
      const platforms = await db.select().from(distributionPlatforms).where(eq(distributionPlatforms.isActive, true));

      return platforms;
    }),

  /**
   * Get Track Distribution Status
   * Get distribution status for a specific track across all platforms
   */
  getTrackDistribution: protectedProcedure
    .input(z.object({
      trackId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { trackDistributions, distributionPlatforms } = await import("../../drizzle/schema");

      // Verify track ownership
      const track = await db.select().from(bapTracks)
        .where(and(eq(bapTracks.id, input.trackId), eq(bapTracks.artistId, ctx.user.id)))
        .limit(1);

      if (track.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Track not found" });
      }

      // Get distribution status
      const distributions = await db
        .select({
          id: trackDistributions.id,
          platformName: distributionPlatforms.name,
          platformSlug: distributionPlatforms.slug,
          status: trackDistributions.status,
          platformUrl: trackDistributions.platformUrl,
          releaseDate: trackDistributions.releaseDate,
          publishedAt: trackDistributions.publishedAt,
          totalStreams: trackDistributions.totalStreams,
          totalEarnings: trackDistributions.totalEarnings,
        })
        .from(trackDistributions)
        .leftJoin(distributionPlatforms, eq(trackDistributions.platformId, distributionPlatforms.id))
        .where(eq(trackDistributions.trackId, input.trackId));

      return {
        trackId: input.trackId,
        distributions,
      };
    }),

  /**
   * Update Track Distribution
   * Update distribution settings for a track (e.g., add/remove platforms)
   */
  updateTrackDistribution: protectedProcedure
    .input(z.object({
      trackId: z.number(),
      platformIds: z.array(z.number()),
      releaseDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { trackDistributions } = await import("../../drizzle/schema");

      // Verify track ownership
      const track = await db.select().from(bapTracks)
        .where(and(eq(bapTracks.id, input.trackId), eq(bapTracks.artistId, ctx.user.id)))
        .limit(1);

      if (track.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Track not found" });
      }

      // Get existing distributions
      const existing = await db.select().from(trackDistributions)
        .where(eq(trackDistributions.trackId, input.trackId));

      const existingPlatformIds = existing.map(d => d.platformId);

      // Add new platforms
      const toAdd = input.platformIds.filter(id => !existingPlatformIds.includes(id));
      for (const platformId of toAdd) {
        await db.insert(trackDistributions).values({
          trackId: input.trackId,
          platformId,
          status: "pending",
          releaseDate: input.releaseDate ? new Date(input.releaseDate) : null,
        });
      }

      // Remove platforms no longer selected
      const toRemove = existingPlatformIds.filter(id => !input.platformIds.includes(id));
      if (toRemove.length > 0) {
        await db.delete(trackDistributions)
          .where(
            and(
              eq(trackDistributions.trackId, input.trackId),
              sql`${trackDistributions.platformId} IN (${toRemove.join(",")})`
            )
          );
      }

      return { success: true };
    }),

  /**
   * Get tracks by artist ID for mini-player display
   */
  getArtistTracks: protectedProcedure
    .input(z.object({
      artistId: z.number(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const tracks = await db
        .select({
          id: bapTracks.id,
          title: bapTracks.title,
          artist: bapTracks.artist,
          genre: bapTracks.genre,
          duration: bapTracks.duration,
          artworkUrl: bapTracks.artworkUrl,
          audioUrl: bapTracks.audioUrl,
          createdAt: bapTracks.createdAt,
        })
        .from(bapTracks)
        .where(eq(bapTracks.artistId, input.artistId))
        .orderBy(desc(bapTracks.createdAt))
        .limit(input.limit);

      return tracks;
    }),
});
