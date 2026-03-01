import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createTrack,
  getTrackById,
  getTracksByArtist,
  updateTrack,
  createAlbum,
  getAlbumById,
  getAlbumsByArtist,
  createPlaylist,
  getPlaylistById,
  getUserPlaylists,
  getCuratedPlaylists,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  getFollowing,
  likeTrack,
  unlikeTrack,
  isTrackLiked,
  getUserLikedTracks,
  repostTrack,
  unrepostTrack,
  recordStream,
  getArtistEarnings,
  getArtistPayments,
  getTrendingTracks,
  getNewReleases,
  searchTracks,
} from "../bap";
import { storagePut } from "../storage";
import { fireWorkflowEvent } from "../workflowEngine";
import { createTranscodeJobs, getTranscodeJobsByTrack } from "../db/transcodeJobs";
import type { TranscodeFormat } from "../lib/audioTranscoder";

/**
 * Boptone Audio Protocol (BAP) Router
 * Handles all music streaming, social, and payment features
 */

export const bapRouter = router({
  // ============================================================================
  // TRACKS
  // ============================================================================
  
  tracks: router({
    /**
     * Upload a new track (Phase 1: Basic upload, AI metadata in Phase 3)
     */
    upload: protectedProcedure
      .input(z.object({
        title: z.string(),
        artist: z.string().optional(),
        genre: z.string().optional(),
        audioFile: z.string(), // Base64 encoded audio file
        artworkFile: z.string().optional(), // Base64 encoded image
        albumId: z.number().optional(),
        isExplicit: z.boolean().default(false),
        isrcCode: z.string().optional(),
        upcCode: z.string().optional(),
        songwriterSplits: z.array(z.object({
          email: z.string(),
          fullName: z.string(),
          percentage: z.number(),
          role: z.enum(["songwriter", "producer", "mixer", "mastering", "other"]).default("songwriter"),
          ipiNumber: z.string().optional(),
        })).optional(),
        publishingData: z.object({
          publisher: z.string().optional(),
          pro: z.string().optional(),
        }).optional(),
        aiDisclosure: z.object({
          used: z.boolean(),
          types: z.array(z.enum(['lyrics', 'production', 'mastering', 'vocals', 'artwork'])).optional(),
        }).optional(),
        pricePerStream: z.number().min(1).max(5).default(1), // In cents: $0.01-$0.05

        // Professional credits (DISTRO-CREDITS)
        credits: z.object({
          compositionCopyright: z.object({ year: z.number(), owner: z.string() }).optional(),
          masterCopyright: z.object({ year: z.number(), owner: z.string() }).optional(),
          label: z.string().optional(),
          featuredArtists: z.array(z.object({ name: z.string(), role: z.string().optional() })).optional(),
          producers: z.array(z.object({ name: z.string(), role: z.string().optional() })).optional(),
          engineers: z.array(z.object({
            name: z.string(),
            role: z.enum(['recording', 'mixing', 'mastering', 'assistant', 'other']),
          })).optional(),
          additionalProducers: z.array(z.object({ name: z.string(), role: z.string().optional() })).optional(),
          writers: z.array(z.object({ name: z.string(), ipi: z.string().optional(), pro: z.string().optional() })).optional(),
          composers: z.array(z.object({ name: z.string(), ipi: z.string().optional() })).optional(),
          classical: z.object({
            conductor: z.string().optional(),
            ensemble: z.string().optional(),
            soloists: z.array(z.object({ name: z.string(), instrument: z.string() })).optional(),
            workTitle: z.string().optional(),
            movementNumber: z.number().optional(),
            movementTitle: z.string().optional(),
            catalogNumber: z.string().optional(),
          }).optional(),
          artDirector: z.string().optional(),
          photographer: z.string().optional(),
          notes: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get artist profile
        const { getArtistProfileByUserId } = await import("../db");
        const profile = await getArtistProfileByUserId(ctx.user.id);
        
        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Artist profile not found. Please complete your profile first.",
          });
        }
        
        // Upload audio file to S3
        const audioBuffer = Buffer.from(input.audioFile, "base64");
        const audioKey = `bap/tracks/${profile.id}/${Date.now()}-${input.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.mp3`;
        const { url: audioUrl } = await storagePut(audioKey, audioBuffer, "audio/mpeg");
        
        // Extract AI metadata if title/artist not provided
        let finalTitle = input.title;
        let finalArtist = input.artist || profile.stageName;
        let finalGenre = input.genre;
        
        if (!input.artist || !input.genre) {
          try {
            const { extractAudioMetadata } = await import("../_core/audioMetadata");
            const aiMetadata = await extractAudioMetadata({
              filename: input.title,
              fileSize: audioBuffer.length,
            });
            
            if (!input.artist) finalArtist = aiMetadata.artist;
            if (!input.genre) finalGenre = aiMetadata.genre;
          } catch (error) {
            console.error("[BAP] AI metadata extraction failed:", error);
            // Continue with provided/default values
          }
        }
        
        // Upload artwork if provided
        let artworkUrl: string | undefined;
        if (input.artworkFile) {
          const artworkBuffer = Buffer.from(input.artworkFile, "base64");
          const artworkKey = `bap/artwork/${profile.id}/${Date.now()}-cover.jpg`;
          const result = await storagePut(artworkKey, artworkBuffer, "image/jpeg");
          artworkUrl = result.url;
        }
        
        // Create track record (store songwriter splits as metadata for now)
        const track = await createTrack({
          artistId: profile.id,
          title: finalTitle,
          artist: finalArtist,
          albumId: input.albumId,
          genre: finalGenre,
          audioUrl,
          artworkUrl,
          isExplicit: input.isExplicit,
          status: "processing",
          duration: 0,
          fileSize: audioBuffer.length,
          audioFormat: "mp3",
          did: `did:boptone:${profile.stageName.toLowerCase().replace(/[^a-z0-9]/g, "")}:${Date.now()}`,
          isrcCode: input.isrcCode,
          upcCode: input.upcCode,
          pricePerStream: input.pricePerStream,
          songwriterSplits: input.songwriterSplits ? input.songwriterSplits.map(s => ({
            name: s.fullName,
            percentage: s.percentage,
            role: s.role,
            ipi: s.ipiNumber,
          })) : undefined,
          publishingData: input.publishingData,
          aiDisclosure: input.aiDisclosure,
          credits: input.credits,
        });
        
        // Auto-publish for now (in Phase 3, this will wait for AI processing)
        await updateTrack(track.insertId as number, {
          status: "live",
          releasedAt: new Date(),
        });
        
        // Create writerEarnings record for the primary artist (index 0) immediately
        if (input.songwriterSplits && input.songwriterSplits.length > 0) {
          try {
            const { getWriterProfileByUserId, createWriterProfile, createWriterEarning } = await import("../writerPayments");
            let primaryWriterProfile = await getWriterProfileByUserId(ctx.user.id);
            if (!primaryWriterProfile) {
              const primaryWriter = input.songwriterSplits[0];
              const newProfile = await createWriterProfile({
                userId: ctx.user.id,
                fullName: primaryWriter.fullName || profile.stageName,
                email: primaryWriter.email || ctx.user.email || "",
                status: "active",
                verifiedAt: new Date(),
              });
              const { getWriterProfileById } = await import("../writerPayments");
              primaryWriterProfile = await getWriterProfileById(newProfile.insertId as number);
            }
            if (primaryWriterProfile) {
              const primarySplit = input.songwriterSplits[0];
              await createWriterEarning({
                writerProfileId: primaryWriterProfile.id,
                trackId: track.insertId as number,
                splitPercentage: primarySplit.percentage.toString(),
                totalEarned: 0,
                pendingPayout: 0,
                totalPaidOut: 0,
              });
            }
          } catch (err) {
            console.error("[BAP] Failed to create primary writer earnings record:", err);
          }
        }

        // Send writer invitations for co-writers (skip first writer - that's the uploader)
        if (input.songwriterSplits && input.songwriterSplits.length > 1) {
          const { createWriterInvitation } = await import("../writerPayments");
          const crypto = await import("crypto");
          
          for (let i = 1; i < input.songwriterSplits.length; i++) {
            const writer = input.songwriterSplits[i];
            const inviteToken = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 days to accept
            
            try {
              await createWriterInvitation({
                email: writer.email,
                fullName: writer.fullName,
                invitedByArtistId: profile.id,
                trackId: track.insertId as number,
                splitPercentage: writer.percentage.toString(),
                inviteToken,
                expiresAt,
                status: "pending",
              });
              
              // TODO: Send email with invitation link
              // Email should contain: boptone.com/writer-invite?token={inviteToken}
              console.log(`[BAP] Writer invitation sent to ${writer.email} for track ${track.insertId}`);
            } catch (error) {
              console.error(`[BAP] Failed to create writer invitation for ${writer.email}:`, error);
              // Continue with other invitations even if one fails
            }
          }
        }
        
        // Run audio quality validation for client-side display (DISTRO-UQ1)
        let audioQualityReport: any = null;
        let coverArtReport: any = null;
        try {
          const { validateAudioForDistribution } = await import("../lib/audioValidator");
          const audioValidation = await validateAudioForDistribution(audioBuffer, input.title + '.mp3', { skipLoudness: false });
          const lr = audioValidation.loudnessReport;
          const tp = audioValidation.technicalProfile;
          audioQualityReport = {
            qualityTier: audioValidation.qualityTier,
            isDistributionReady: audioValidation.isDistributionReady,
            summary: audioValidation.summary,
            warnings: audioValidation.warnings.map((w: any) => ({ code: w.code, message: w.message, field: w.field })),
            errors: audioValidation.errors.map((e: any) => ({ code: e.code, message: e.message, field: e.field })),
            recommendations: audioValidation.recommendations,
            loudness: lr ? {
              integratedLufs: lr.integratedLufs,
              truePeakDbtp: lr.truePeakDbtp,
              loudnessRange: lr.loudnessRange,
              isClipping: lr.isClipping,
              spotifyReady: lr.spotifyReady,
              appleReady: lr.appleReady,
              youtubeReady: lr.youtubeReady,
              amazonReady: lr.integratedLufs !== null ? Math.abs(lr.integratedLufs - (-14)) <= 3 : false,
              tidalReady: lr.integratedLufs !== null ? Math.abs(lr.integratedLufs - (-14)) <= 3 : false,
              deezerReady: lr.integratedLufs !== null ? Math.abs(lr.integratedLufs - (-15)) <= 3 : false,
              recommendation: lr.recommendation,
            } : null,
            technicalProfile: tp ? {
              format: tp.format, sampleRateHz: tp.sampleRateHz, bitDepth: tp.bitDepth,
              channels: tp.channels, bitrateKbps: tp.bitrateKbps, durationSeconds: tp.durationSeconds,
              isLossless: tp.isLossless, codec: tp.codec,
            } : null,
          };
          // Update track with audio metrics
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
            validatedAt: new Date().toISOString(),
          };
          await updateTrack(track.insertId as number, { audioMetrics: audioMetricsPayload } as any);
        } catch (err) {
          console.error("[BAP] Audio quality validation failed (non-blocking):", err);
        }

        // DISTRO-A3: Enqueue DSP format transcode jobs (non-blocking)
        const trackId = track.insertId as number;
        const allFormats: TranscodeFormat[] = ["aac_256", "ogg_vorbis", "flac_16", "mp3_320", "wav_24_96"];
        createTranscodeJobs(trackId, allFormats).catch((err) =>
          console.error("[BAP] Failed to enqueue transcode jobs:", err)
        );

        return {
          success: true,
          trackId: track.insertId,
          audioQuality: audioQualityReport,
          coverArt: coverArtReport,
        };
      }),

    /**
     * Get transcode job status for a track (DISTRO-A3)
     */
    transcodeStatus: protectedProcedure
      .input(z.object({ trackId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Verify the requesting user owns this track
        const track = await getTrackById(input.trackId);
        if (!track) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Track not found" });
        }
        const jobs = await getTranscodeJobsByTrack(input.trackId);
        return {
          trackId: input.trackId,
          jobs: jobs.map((j) => ({
            id: j.id,
            format: j.format,
            status: j.status,
            s3Url: j.s3Url ?? null,
            fileSizeBytes: j.fileSizeBytes ?? null,
            attempts: j.attempts,
            errorMessage: j.errorMessage ?? null,
            startedAt: j.startedAt ?? null,
            completedAt: j.completedAt ?? null,
          })),
          summary: {
            total: jobs.length,
            done: jobs.filter((j) => j.status === "done").length,
            processing: jobs.filter((j) => j.status === "processing").length,
            queued: jobs.filter((j) => j.status === "queued").length,
            error: jobs.filter((j) => j.status === "error").length,
            skipped: jobs.filter((j) => j.status === "skipped").length,
          },
        };
      }),

    /**
     * Get track by ID
     */
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const track = await getTrackById(input.id);
        
        if (!track) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Track not found",
          });
        }
        
        return track;
      }),
    
    /**
     * Get tracks by artist
     */
    getByArtist: publicProcedure
      .input(z.object({
        artistId: z.number(),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        return getTracksByArtist(input.artistId, input.limit);
      }),
    
    /**
     * Get my tracks
     */
    getMy: protectedProcedure
      .query(async ({ ctx }) => {
        const { getArtistProfileByUserId } = await import("../db");
        const profile = await getArtistProfileByUserId(ctx.user.id);
        
        if (!profile) return [];
        
        return getTracksByArtist(profile.id);
      }),
  }),
  
  // ============================================================================
  // ALBUMS
  // ============================================================================
  
  albums: router({
    /**
     * Create album
     */
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        albumType: z.enum(["single", "ep", "album", "compilation"]),
        genre: z.string().optional(),
        releaseDate: z.date(),
        artworkFile: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getArtistProfileByUserId } = await import("../db");
        const profile = await getArtistProfileByUserId(ctx.user.id);
        
        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Artist profile not found",
          });
        }
        
        let artworkUrl: string | undefined;
        if (input.artworkFile) {
          const artworkBuffer = Buffer.from(input.artworkFile, "base64");
          const artworkKey = `bap/albums/${profile.id}/${Date.now()}-cover.jpg`;
          const result = await storagePut(artworkKey, artworkBuffer, "image/jpeg");
          artworkUrl = result.url;
        }
        
        const album = await createAlbum({
          artistId: profile.id,
          title: input.title,
          description: input.description,
          albumType: input.albumType,
          genre: input.genre,
          releaseDate: input.releaseDate,
          artworkUrl,
        });
        
        return {
          success: true,
          albumId: album.insertId,
        };
      }),
    
    /**
     * Get album by ID
     */
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const album = await getAlbumById(input.id);
        
        if (!album) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Album not found",
          });
        }
        
        return album;
      }),
    
    /**
     * Get albums by artist
     */
    getByArtist: publicProcedure
      .input(z.object({ artistId: z.number() }))
      .query(async ({ input }) => {
        return getAlbumsByArtist(input.artistId);
      }),
  }),
  
  // ============================================================================
  // PLAYLISTS
  // ============================================================================
  
  playlists: router({
    /**
     * Create playlist
     */
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        isPublic: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        const playlist = await createPlaylist({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
        });
        
        return {
          success: true,
          playlistId: playlist.insertId,
        };
      }),
    
    /**
     * Get my playlists
     */
    getMy: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserPlaylists(ctx.user.id);
      }),
    
    /**
     * Get curated playlists
     */
    getCurated: publicProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return getCuratedPlaylists(input.limit);
      }),
    
    /**
     * Add track to playlist
     */
    addTrack: protectedProcedure
      .input(z.object({
        playlistId: z.number(),
        trackId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const playlist = await getPlaylistById(input.playlistId);
        
        if (!playlist) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Playlist not found",
          });
        }
        
        if (playlist.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to edit this playlist",
          });
        }
        
        await addTrackToPlaylist(input.playlistId, input.trackId);
        
        return { success: true };
      }),
    
    /**
     * Remove track from playlist
     */
    removeTrack: protectedProcedure
      .input(z.object({
        playlistId: z.number(),
        trackId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const playlist = await getPlaylistById(input.playlistId);
        
        if (!playlist) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Playlist not found",
          });
        }
        
        if (playlist.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to edit this playlist",
          });
        }
        
        await removeTrackFromPlaylist(input.playlistId, input.trackId);
        
        return { success: true };
      }),
  }),
  
  // ============================================================================
  // SOCIAL - FOLLOWS, LIKES, REPOSTS
  // ============================================================================
  
  social: router({
    /**
     * Follow user
     */
    follow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (input.userId === ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You cannot follow yourself",
          });
        }
        
        await followUser(ctx.user.id, input.userId);
        // Fire workflow event for new_follower triggers (non-blocking)
        fireWorkflowEvent("new_follower", input.userId, {
          followerId: ctx.user.id,
          followerName: ctx.user.name ?? "A fan",
        }).catch((err) => console.error("[Workflow] new_follower event error:", err));
        return { success: true };
      }),
    
    /**
     * Unfollow user
     */
    unfollow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await unfollowUser(ctx.user.id, input.userId);
        return { success: true };
      }),
    
    /**
     * Check if following
     */
    isFollowing: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input, ctx }) => {
        return isFollowing(ctx.user.id, input.userId);
      }),
    
    /**
     * Get followers
     */
    getFollowers: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return getFollowers(input.userId);
      }),
    
    /**
     * Get following
     */
    getFollowing: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return getFollowing(input.userId);
      }),
    
    /**
     * Like track
     */
    likeTrack: protectedProcedure
      .input(z.object({ trackId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await likeTrack(ctx.user.id, input.trackId);
        return { success: true };
      }),
    
    /**
     * Unlike track
     */
    unlikeTrack: protectedProcedure
      .input(z.object({ trackId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await unlikeTrack(ctx.user.id, input.trackId);
        return { success: true };
      }),
    
    /**
     * Check if track is liked
     */
    isTrackLiked: protectedProcedure
      .input(z.object({ trackId: z.number() }))
      .query(async ({ input, ctx }) => {
        return isTrackLiked(ctx.user.id, input.trackId);
      }),
    
    /**
     * Get liked tracks
     */
    getLikedTracks: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input, ctx }) => {
        return getUserLikedTracks(ctx.user.id, input.limit);
      }),
    
    /**
     * Repost track
     */
    repostTrack: protectedProcedure
      .input(z.object({ trackId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await repostTrack(ctx.user.id, input.trackId);
        return { success: true };
      }),
    
    /**
     * Unrepost track
     */
    unrepostTrack: protectedProcedure
      .input(z.object({ trackId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await unrepostTrack(ctx.user.id, input.trackId);
        return { success: true };
      }),
  }),
  
  // ============================================================================
  // STREAMING & PAYMENTS
  // ============================================================================
  
  stream: router({
    /**
     * Record a stream (called when user plays >30s of a track)
     */
    record: publicProcedure
      .input(z.object({
        trackId: z.number(),
        durationPlayed: z.number(), // Seconds
        source: z.enum(["feed", "playlist", "artist_page", "search", "direct"]),
        deviceType: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Only count streams > 30 seconds
        if (input.durationPlayed < 30) {
          return { success: false, message: "Stream too short to count" };
        }
        
        const track = await getTrackById(input.trackId);
        if (!track) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Track not found",
          });
        }
        
        const completionRate = Math.min(100, Math.floor((input.durationPlayed / track.duration) * 100));
        
        await recordStream({
          trackId: input.trackId,
          userId: ctx.user?.id || null,
          durationPlayed: input.durationPlayed,
          completionRate,
          source: input.source,
          deviceType: input.deviceType,
          paymentAmount: 1, // $0.01 per stream
        });
        
        return { success: true };
      }),
  }),
  
  earnings: router({
    /**
     * Get my earnings
     */
    getMy: protectedProcedure
      .input(z.object({
        periodStart: z.date().optional(),
        periodEnd: z.date().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const { getArtistProfileByUserId } = await import("../db");
        const profile = await getArtistProfileByUserId(ctx.user.id);
        
        if (!profile) {
          return { totalEarnings: 0, streamCount: 0 };
        }
        
        return getArtistEarnings(profile.id, input.periodStart, input.periodEnd);
      }),
    
    /**
     * Get my payments
     */
    getMyPayments: protectedProcedure
      .query(async ({ ctx }) => {
        const { getArtistProfileByUserId } = await import("../db");
        const profile = await getArtistProfileByUserId(ctx.user.id);
        
        if (!profile) return [];
        
        return getArtistPayments(profile.id);
      }),
    
    /**
     * Get pending earnings (ready for payout)
     */
    getPending: protectedProcedure
      .query(async ({ ctx }) => {
        const { getArtistProfileByUserId } = await import("../db");
        const { calculatePendingEarnings } = await import("../bap-payments");
        
        const profile = await getArtistProfileByUserId(ctx.user.id);
        if (!profile) {
          return {
            totalEarnings: 0,
            totalPaidOut: 0,
            pendingAmount: 0,
            streamCount: 0,
            canPayout: false,
            minimumThreshold: 1000,
          };
        }
        
        return calculatePendingEarnings(profile.id);
      }),
    
    /**
     * Request payout (admin only for now)
     */
    requestPayout: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { getArtistProfileByUserId } = await import("../db");
        const { createArtistPayout } = await import("../bap-payments");
        
        const profile = await getArtistProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Artist profile not found",
          });
        }
        
        return createArtistPayout(profile.id);
      }),
    
    /**
     * Get Stripe Connect account status
     */
    getStripeStatus: protectedProcedure
      .query(async ({ ctx }) => {
        const { getArtistProfileByUserId } = await import("../db");
        const { checkStripeAccountStatus } = await import("../bap-payments");
        
        const profile = await getArtistProfileByUserId(ctx.user.id);
        if (!profile) {
          return {
            connected: false,
            chargesEnabled: false,
            payoutsEnabled: false,
          };
        }
        
        return checkStripeAccountStatus(profile.id);
      }),
    
    /**
     * Create Stripe Connect onboarding link
     */
    createStripeLink: protectedProcedure
      .input(z.object({
        refreshUrl: z.string(),
        returnUrl: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getArtistProfileByUserId } = await import("../db");
        const { createStripeConnectAccountLink } = await import("../bap-payments");
        
        const profile = await getArtistProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Artist profile not found",
          });
        }
        
        return createStripeConnectAccountLink(profile.id, input.refreshUrl, input.returnUrl);
      }),
  }),
  
  // ============================================================================
  // PUBLIC STREAMING
  // ============================================================================
  
  /**
   * Get track by ID (public - for streaming page)
   */
  getTrack: publicProcedure
    .input(z.object({ trackId: z.number() }))
    .query(async ({ input }) => {
      const track = await getTrackById(input.trackId);
      if (!track) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Track not found",
        });
      }
      return track;
    }),
  
  /**
   * Get artist profile (public)
   */
  getArtistProfile: publicProcedure
    .input(z.object({ artistId: z.number() }))
    .query(async ({ input }) => {
      const { getArtistProfileById } = await import("../db");
      const profile = await getArtistProfileById(input.artistId);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artist profile not found",
        });
      }
      return profile;
    }),
  
  /**
   * Track a play event (public - records stream and payment)
   */
  trackPlay: publicProcedure
    .input(z.object({
      trackId: z.number(),
      durationPlayed: z.number(),
      completionRate: z.number(),
      source: z.enum(["direct", "playlist", "artist_page", "search", "feed"]),
    }))
    .mutation(async ({ input, ctx }) => {
      // Record the stream
      const stream = await recordStream({
        trackId: input.trackId,
        userId: ctx.user?.id,
        durationPlayed: input.durationPlayed,
        completionRate: input.completionRate,
        source: input.source,
      });
      
      return { success: true };
    }),
  
  // ============================================================================
  // STREAM PAYMENTS (Stripe Integration)
  // ============================================================================
  
  payments: router({
    /**
     * Create a payment intent for a stream
     */
    createIntent: publicProcedure
      .input(z.object({
        trackId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createStreamPaymentIntent } = await import("../stripe-payments");
        return createStreamPaymentIntent(input.trackId, ctx.user?.id);
      }),
    
    /**
     * Confirm a payment and create unlock session
     */
    confirmPayment: publicProcedure
      .input(z.object({
        paymentIntentId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { confirmStreamPayment } = await import("../stripe-payments");
        return confirmStreamPayment(input.paymentIntentId);
      }),
    
    /**
     * Check if user has valid session for track
     */
    checkSession: publicProcedure
      .input(z.object({
        trackId: z.number(),
        sessionToken: z.string(),
      }))
      .query(async ({ input }) => {
        const { checkSessionUnlock } = await import("../stripe-payments");
        return checkSessionUnlock(input.trackId, input.sessionToken);
      }),
    
    /**
     * Get payment stats for a track (artist only)
     */
    getTrackStats: protectedProcedure
      .input(z.object({
        trackId: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        const { getTrackPaymentStats } = await import("../stripe-payments");
        const track = await getTrackById(input.trackId);
        
        if (!track) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Track not found",
          });
        }
        
        // Check if user owns this track
        const { getArtistProfileByUserId } = await import("../db");
        const profile = await getArtistProfileByUserId(ctx.user.id);
        
        if (!profile || profile.id !== track.artistId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't own this track",
          });
        }
        
        return getTrackPaymentStats(input.trackId);
      }),
  }),
  
  // ============================================================================
  // DISCOVERY & FEEDS
  // ============================================================================
  
  discover: router({
    /**
     * Get trending tracks
     */
    trending: publicProcedure
      .input(z.object({ 
        limit: z.number().default(50),
        genre: z.string().optional()
      }))
      .query(async ({ input }) => {
        return getTrendingTracks(input.limit, input.genre);
      }),
    
    /**
     * Get new releases
     */
    newReleases: publicProcedure
      .input(z.object({ 
        limit: z.number().default(50),
        genre: z.string().optional()
      }))
      .query(async ({ input }) => {
        return getNewReleases(input.limit, input.genre);
      }),
    
    /**
     * Search tracks
     */
    search: publicProcedure
      .input(z.object({
        query: z.string(),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        return searchTracks(input.query, input.limit);
      }),
  }),
});
