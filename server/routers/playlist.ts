import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { bapPlaylists, bapTracks } from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";

export const playlistRouter = router({
  // Get all playlists for the current user
  getUserPlaylists: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const playlists = await db
      .select()
      .from(bapPlaylists)
      .where(eq(bapPlaylists.userId, ctx.user.id))
      .orderBy(desc(bapPlaylists.updatedAt));

    return playlists;
  }),

  // Get a single playlist by ID with tracks
  getPlaylist: protectedProcedure
    .input(z.object({
      playlistId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const playlist = await db
        .select()
        .from(bapPlaylists)
        .where(eq(bapPlaylists.id, input.playlistId))
        .limit(1);

      if (playlist.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }

      const playlistData = playlist[0];

      // Check if user has access (owner or public playlist)
      if (playlistData.userId !== ctx.user.id && !playlistData.isPublic) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't have access to this playlist" });
      }

      // Fetch tracks if trackIds exist
      let tracks = [];
      if (playlistData.trackIds && Array.isArray(playlistData.trackIds) && playlistData.trackIds.length > 0) {
        const trackRecords = await db
          .select()
          .from(bapTracks)
          .where(eq(bapTracks.id, playlistData.trackIds[0])); // Start with first track

        // Fetch all tracks (this is a workaround for Drizzle's IN clause limitation)
        const allTracks = [];
        for (const trackId of playlistData.trackIds) {
          const trackResult = await db
            .select()
            .from(bapTracks)
            .where(eq(bapTracks.id, trackId))
            .limit(1);
          
          if (trackResult.length > 0) {
            allTracks.push(trackResult[0]);
          }
        }

        // Sort tracks according to trackIds order
        tracks = playlistData.trackIds
          .map(id => allTracks.find(t => t.id === id))
          .filter(Boolean);
      }

      return {
        ...playlistData,
        tracks,
      };
    }),

  // Create a new playlist
  createPlaylist: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      coverImageUrl: z.string().url().optional(),
      isPublic: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const result = await db.insert(bapPlaylists).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description || null,
        coverImageUrl: input.coverImageUrl || null,
        isPublic: input.isPublic,
        trackIds: [],
        trackCount: 0,
      });

      return {
        success: true,
        playlistId: Number(result.insertId),
      };
    }),

  // Update playlist metadata
  updatePlaylist: protectedProcedure
    .input(z.object({
      playlistId: z.number(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      coverImageUrl: z.string().url().optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify ownership
      const playlist = await db
        .select()
        .from(bapPlaylists)
        .where(eq(bapPlaylists.id, input.playlistId))
        .limit(1);

      if (playlist.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }

      if (playlist[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't own this playlist" });
      }

      const updates: any = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.coverImageUrl !== undefined) updates.coverImageUrl = input.coverImageUrl;
      if (input.isPublic !== undefined) updates.isPublic = input.isPublic;

      await db
        .update(bapPlaylists)
        .set(updates)
        .where(eq(bapPlaylists.id, input.playlistId));

      return { success: true };
    }),

  // Delete a playlist
  deletePlaylist: protectedProcedure
    .input(z.object({
      playlistId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify ownership
      const playlist = await db
        .select()
        .from(bapPlaylists)
        .where(eq(bapPlaylists.id, input.playlistId))
        .limit(1);

      if (playlist.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }

      if (playlist[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't own this playlist" });
      }

      await db
        .delete(bapPlaylists)
        .where(eq(bapPlaylists.id, input.playlistId));

      return { success: true };
    }),

  // Add a track to a playlist
  addTrackToPlaylist: protectedProcedure
    .input(z.object({
      playlistId: z.number(),
      trackId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify ownership
      const playlist = await db
        .select()
        .from(bapPlaylists)
        .where(eq(bapPlaylists.id, input.playlistId))
        .limit(1);

      if (playlist.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }

      if (playlist[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't own this playlist" });
      }

      // Verify track exists
      const track = await db
        .select()
        .from(bapTracks)
        .where(eq(bapTracks.id, input.trackId))
        .limit(1);

      if (track.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Track not found" });
      }

      // Add track to playlist (avoid duplicates)
      const currentTrackIds = (playlist[0].trackIds as number[]) || [];
      if (currentTrackIds.includes(input.trackId)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Track already in playlist" });
      }

      const newTrackIds = [...currentTrackIds, input.trackId];

      await db
        .update(bapPlaylists)
        .set({
          trackIds: newTrackIds,
          trackCount: newTrackIds.length,
        })
        .where(eq(bapPlaylists.id, input.playlistId));

      return { success: true };
    }),

  // Remove a track from a playlist
  removeTrackFromPlaylist: protectedProcedure
    .input(z.object({
      playlistId: z.number(),
      trackId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify ownership
      const playlist = await db
        .select()
        .from(bapPlaylists)
        .where(eq(bapPlaylists.id, input.playlistId))
        .limit(1);

      if (playlist.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }

      if (playlist[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't own this playlist" });
      }

      // Remove track from playlist
      const currentTrackIds = (playlist[0].trackIds as number[]) || [];
      const newTrackIds = currentTrackIds.filter(id => id !== input.trackId);

      await db
        .update(bapPlaylists)
        .set({
          trackIds: newTrackIds,
          trackCount: newTrackIds.length,
        })
        .where(eq(bapPlaylists.id, input.playlistId));

      return { success: true };
    }),

  // Reorder tracks in a playlist
  reorderPlaylistTracks: protectedProcedure
    .input(z.object({
      playlistId: z.number(),
      trackIds: z.array(z.number()),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify ownership
      const playlist = await db
        .select()
        .from(bapPlaylists)
        .where(eq(bapPlaylists.id, input.playlistId))
        .limit(1);

      if (playlist.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }

      if (playlist[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't own this playlist" });
      }

      // Validate that all trackIds are in the playlist
      const currentTrackIds = (playlist[0].trackIds as number[]) || [];
      const allIdsValid = input.trackIds.every(id => currentTrackIds.includes(id));
      
      if (!allIdsValid || input.trackIds.length !== currentTrackIds.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid track IDs provided" });
      }

      await db
        .update(bapPlaylists)
        .set({
          trackIds: input.trackIds,
        })
        .where(eq(bapPlaylists.id, input.playlistId));

      return { success: true };
    }),
});
