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
  validateAudioFile, 
  generateTrackFileKey,
  generateArtworkFileKey 
} from "../audioMetadata";
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
        
        // Validate audio file
        const validation = validateAudioFile(audioBuffer, input.audioFileName);
        if (!validation.valid) {
          throw new TRPCError({ code: "BAD_REQUEST", message: validation.error });
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
        
        // Upload artwork if provided
        let artworkUrl: string | undefined;
        if (input.artworkFileBase64 && input.artworkFileName) {
          const artworkBuffer = Buffer.from(input.artworkFileBase64, 'base64');
          const artworkFileKey = generateArtworkFileKey(profile.id, input.artworkFileName);
          const artworkUploadResult = await storagePut(
            artworkFileKey,
            artworkBuffer,
            'image/jpeg' // Assume JPEG, could be enhanced to detect actual type
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
          status: 'draft', // Start as draft
        });
        
        return {
          success: true,
          trackId: track.insertId,
          message: "Track uploaded successfully",
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
});
