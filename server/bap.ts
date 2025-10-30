import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { getDb } from "./db";
import {
  bapTracks,
  bapAlbums,
  bapPlaylists,
  bapFollows,
  bapLikes,
  bapStreams,
  bapPayments,
  bapReposts,
  type InsertBapTrack,
  type InsertBapAlbum,
  type InsertBapPlaylist,
  type InsertBapFollow,
  type InsertBapLike,
  type InsertBapStream,
  type InsertBapPayment,
  type InsertBapRepost,
} from "../drizzle/schema";

/**
 * BAP Database Helpers
 * All functions for Boptone Audio Protocol data access
 */

// ============================================================================
// TRACKS
// ============================================================================

export async function createTrack(track: InsertBapTrack) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [newTrack] = await db.insert(bapTracks).values(track);
  return newTrack;
}

export async function getTrackById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [track] = await db.select().from(bapTracks).where(eq(bapTracks.id, id)).limit(1);
  return track || null;
}

export async function getTracksByArtist(artistId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(bapTracks)
    .where(and(
      eq(bapTracks.artistId, artistId),
      eq(bapTracks.status, "live")
    ))
    .orderBy(desc(bapTracks.releasedAt))
    .limit(limit);
}

export async function updateTrack(id: number, updates: Partial<InsertBapTrack>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(bapTracks).set(updates).where(eq(bapTracks.id, id));
}

export async function incrementTrackPlay(trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(bapTracks)
    .set({ playCount: sql`${bapTracks.playCount} + 1` })
    .where(eq(bapTracks.id, trackId));
}

export async function incrementTrackLike(trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(bapTracks)
    .set({ likeCount: sql`${bapTracks.likeCount} + 1` })
    .where(eq(bapTracks.id, trackId));
}

export async function decrementTrackLike(trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(bapTracks)
    .set({ likeCount: sql`${bapTracks.likeCount} - 1` })
    .where(eq(bapTracks.id, trackId));
}

export async function incrementTrackRepost(trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(bapTracks)
    .set({ repostCount: sql`${bapTracks.repostCount} + 1` })
    .where(eq(bapTracks.id, trackId));
}

export async function decrementTrackRepost(trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(bapTracks)
    .set({ repostCount: sql`${bapTracks.repostCount} - 1` })
    .where(eq(bapTracks.id, trackId));
}

// ============================================================================
// ALBUMS
// ============================================================================

export async function createAlbum(album: InsertBapAlbum) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [newAlbum] = await db.insert(bapAlbums).values(album);
  return newAlbum;
}

export async function getAlbumById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [album] = await db.select().from(bapAlbums).where(eq(bapAlbums.id, id)).limit(1);
  return album || null;
}

export async function getAlbumsByArtist(artistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(bapAlbums)
    .where(eq(bapAlbums.artistId, artistId))
    .orderBy(desc(bapAlbums.releaseDate));
}

// ============================================================================
// PLAYLISTS
// ============================================================================

export async function createPlaylist(playlist: InsertBapPlaylist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [newPlaylist] = await db.insert(bapPlaylists).values(playlist);
  return newPlaylist;
}

export async function getPlaylistById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [playlist] = await db.select().from(bapPlaylists).where(eq(bapPlaylists.id, id)).limit(1);
  return playlist || null;
}

export async function getUserPlaylists(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(bapPlaylists)
    .where(eq(bapPlaylists.userId, userId))
    .orderBy(desc(bapPlaylists.updatedAt));
}

export async function getCuratedPlaylists(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(bapPlaylists)
    .where(and(
      eq(bapPlaylists.isCurated, true),
      eq(bapPlaylists.isPublic, true)
    ))
    .orderBy(desc(bapPlaylists.followerCount))
    .limit(limit);
}

export async function addTrackToPlaylist(playlistId: number, trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const playlist = await getPlaylistById(playlistId);
  if (!playlist) throw new Error("Playlist not found");
  
  const currentTrackIds = (playlist.trackIds as number[]) || [];
  if (currentTrackIds.includes(trackId)) {
    return; // Already in playlist
  }
  
  const newTrackIds = [...currentTrackIds, trackId];
  
  await db
    .update(bapPlaylists)
    .set({
      trackIds: newTrackIds as any,
      trackCount: newTrackIds.length,
    })
    .where(eq(bapPlaylists.id, playlistId));
}

export async function removeTrackFromPlaylist(playlistId: number, trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const playlist = await getPlaylistById(playlistId);
  if (!playlist) throw new Error("Playlist not found");
  
  const currentTrackIds = (playlist.trackIds as number[]) || [];
  const newTrackIds = currentTrackIds.filter(id => id !== trackId);
  
  await db
    .update(bapPlaylists)
    .set({
      trackIds: newTrackIds as any,
      trackCount: newTrackIds.length,
    })
    .where(eq(bapPlaylists.id, playlistId));
}

// ============================================================================
// SOCIAL - FOLLOWS
// ============================================================================

export async function followUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already following
  const existing = await db
    .select()
    .from(bapFollows)
    .where(and(
      eq(bapFollows.followerId, followerId),
      eq(bapFollows.followingId, followingId)
    ))
    .limit(1);
  
  if (existing.length > 0) return; // Already following
  
  await db.insert(bapFollows).values({
    followerId,
    followingId,
  });
}

export async function unfollowUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(bapFollows)
    .where(and(
      eq(bapFollows.followerId, followerId),
      eq(bapFollows.followingId, followingId)
    ));
}

export async function isFollowing(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const [result] = await db
    .select()
    .from(bapFollows)
    .where(and(
      eq(bapFollows.followerId, followerId),
      eq(bapFollows.followingId, followingId)
    ))
    .limit(1);
  
  return !!result;
}

export async function getFollowers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(bapFollows)
    .where(eq(bapFollows.followingId, userId));
}

export async function getFollowing(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(bapFollows)
    .where(eq(bapFollows.followerId, userId));
}

// ============================================================================
// SOCIAL - LIKES
// ============================================================================

export async function likeTrack(userId: number, trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already liked
  const existing = await db
    .select()
    .from(bapLikes)
    .where(and(
      eq(bapLikes.userId, userId),
      eq(bapLikes.trackId, trackId)
    ))
    .limit(1);
  
  if (existing.length > 0) return; // Already liked
  
  await db.insert(bapLikes).values({ userId, trackId });
  await incrementTrackLike(trackId);
}

export async function unlikeTrack(userId: number, trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(bapLikes)
    .where(and(
      eq(bapLikes.userId, userId),
      eq(bapLikes.trackId, trackId)
    ));
  
  await decrementTrackLike(trackId);
}

export async function isTrackLiked(userId: number, trackId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const [result] = await db
    .select()
    .from(bapLikes)
    .where(and(
      eq(bapLikes.userId, userId),
      eq(bapLikes.trackId, trackId)
    ))
    .limit(1);
  
  return !!result;
}

export async function getUserLikedTracks(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const likes = await db
    .select()
    .from(bapLikes)
    .where(eq(bapLikes.userId, userId))
    .orderBy(desc(bapLikes.createdAt))
    .limit(limit);
  
  if (likes.length === 0) return [];
  
  const trackIds = likes.map(like => like.trackId);
  return db
    .select()
    .from(bapTracks)
    .where(inArray(bapTracks.id, trackIds));
}

// ============================================================================
// SOCIAL - REPOSTS
// ============================================================================

export async function repostTrack(userId: number, trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already reposted
  const existing = await db
    .select()
    .from(bapReposts)
    .where(and(
      eq(bapReposts.userId, userId),
      eq(bapReposts.trackId, trackId)
    ))
    .limit(1);
  
  if (existing.length > 0) return; // Already reposted
  
  await db.insert(bapReposts).values({ userId, trackId });
  await incrementTrackRepost(trackId);
}

export async function unrepostTrack(userId: number, trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(bapReposts)
    .where(and(
      eq(bapReposts.userId, userId),
      eq(bapReposts.trackId, trackId)
    ));
  
  await decrementTrackRepost(trackId);
}

// ============================================================================
// STREAMS & PAYMENTS
// ============================================================================

export async function recordStream(stream: InsertBapStream) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Calculate payment split (90/10)
  const paymentAmount = stream.paymentAmount || 1; // Default $0.01 per stream
  const artistShare = Math.floor(paymentAmount * 0.9); // 90%
  const platformShare = paymentAmount - artistShare; // 10%
  
  const [newStream] = await db.insert(bapStreams).values({
    ...stream,
    artistShare,
    platformShare,
  });
  
  // Increment track play count
  await incrementTrackPlay(stream.trackId);
  
  // Update track total earnings
  const track = await getTrackById(stream.trackId);
  if (track) {
    await db
      .update(bapTracks)
      .set({
        totalEarnings: sql`${bapTracks.totalEarnings} + ${artistShare}`,
      })
      .where(eq(bapTracks.id, stream.trackId));
  }
  
  return newStream;
}

export async function getArtistEarnings(artistId: number, periodStart?: Date, periodEnd?: Date) {
  const db = await getDb();
  if (!db) return { totalEarnings: 0, streamCount: 0 };
  
  // Get all tracks by artist
  const tracks = await getTracksByArtist(artistId, 1000);
  const trackIds = tracks.map(t => t.id);
  
  if (trackIds.length === 0) {
    return { totalEarnings: 0, streamCount: 0 };
  }
  
  let whereConditions = [inArray(bapStreams.trackId, trackIds)];
  
  if (periodStart && periodEnd) {
    whereConditions.push(
      sql`${bapStreams.createdAt} >= ${periodStart}`,
      sql`${bapStreams.createdAt} <= ${periodEnd}`
    );
  }
  
  const query = db
    .select({
      totalEarnings: sql<number>`SUM(${bapStreams.artistShare})`,
      streamCount: sql<number>`COUNT(*)`,
    })
    .from(bapStreams)
    .where(and(...whereConditions as any));
  
  const [result] = await query as any;
  
  return {
    totalEarnings: result?.totalEarnings || 0,
    streamCount: result?.streamCount || 0,
  };
}

export async function createPayment(payment: InsertBapPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [newPayment] = await db.insert(bapPayments).values(payment);
  return newPayment;
}

export async function getArtistPayments(artistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(bapPayments)
    .where(eq(bapPayments.artistId, artistId))
    .orderBy(desc(bapPayments.createdAt));
}

// ============================================================================
// DISCOVERY & FEEDS
// ============================================================================

export async function getTrendingTracks(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  // Trending = highest play count in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return db
    .select()
    .from(bapTracks)
    .where(and(
      eq(bapTracks.status, "live"),
      sql`${bapTracks.releasedAt} >= ${sevenDaysAgo}`
    ))
    .orderBy(desc(bapTracks.playCount))
    .limit(limit);
}

export async function getNewReleases(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(bapTracks)
    .where(eq(bapTracks.status, "live"))
    .orderBy(desc(bapTracks.releasedAt))
    .limit(limit);
}

export async function searchTracks(query: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(bapTracks)
    .where(and(
      eq(bapTracks.status, "live"),
      sql`(${bapTracks.title} LIKE ${`%${query}%`} OR ${bapTracks.artist} LIKE ${`%${query}%`})`
    ))
    .orderBy(desc(bapTracks.playCount))
    .limit(limit);
}
