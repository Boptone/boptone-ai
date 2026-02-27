# Boptone Video Feed: Phase 1 MVP Project Plan

**Project:** TikTok-Style Vertical Video Component  
**Phase:** 1 - Minimum Viable Product  
**Timeline:** 2-3 Weeks (Sprint-based)  
**Author:** Manus AI  
**Date:** February 26, 2026

---

## Executive Summary

This document outlines a comprehensive implementation plan for building a TikTok-style vertical video feed component for Boptone. The Phase 1 MVP focuses on core functionality: vertical swipeable video playback, basic interactions (like, comment, share), and artist profile integration. This feature will enable artists to share short-form video content (performances, behind-the-scenes, tutorials) and dramatically increase platform engagement.

**Key Objectives:**
- Deliver a working vertical video feed in 2-3 weeks
- Enable artists to upload and share 15-60 second videos
- Provide smooth, mobile-optimized swipe navigation
- Integrate with existing Boptone infrastructure (auth, storage, database)
- Lay foundation for advanced features in Phase 2 and 3

**Expected Impact:**
- **10x engagement increase** - Video content generates significantly higher engagement than static posts
- **Artist retention** - Provides new creative outlet for artist expression
- **User discovery** - Short-form video is the #1 content discovery format
- **Platform differentiation** - Positions Boptone as a modern, video-first music platform

---

## Technical Architecture Overview

### System Components

The video feed system consists of four primary layers:

**1. Frontend Layer (React Components)**
- `VideoFeed` - Main container managing video list and navigation
- `VideoPlayer` - Individual video player with controls and interactions
- `VideoUpload` - Artist-facing upload interface
- `VideoControls` - Like, comment, share, follow buttons

**2. Backend Layer (tRPC API)**
- `video.upload` - Handle video file uploads to S3
- `video.list` - Fetch paginated video feed
- `video.getById` - Retrieve single video details
- `video.like` - Toggle like status
- `video.incrementViews` - Track view count

**3. Storage Layer (S3)**
- Raw video files stored in S3 buckets
- Organized by artist ID and upload date
- Cache-Control headers for bandwidth optimization
- CDN-ready structure for future CloudFront integration

**4. Database Layer (MySQL)**
- `videos` table - Video metadata, URLs, stats
- `videoLikes` table - User like relationships
- `videoComments` table - Comment threads
- `videoViews` table - View tracking and analytics

### Data Flow

```
Artist Upload Flow:
1. Artist selects video file (MP4, max 60s, max 100MB)
2. Frontend validates file size/duration
3. Upload to S3 via storagePut() with progress tracking
4. Server creates database record with metadata
5. Video appears in artist's profile and feed

User Viewing Flow:
1. User opens video feed page
2. Fetch initial batch of videos (10-20)
3. Preload first 3 videos in background
4. Auto-play first video when in viewport
5. User swipes up → pause current, play next, preload next 2
6. Track view after 3 seconds of watch time
```

---

## Database Schema Design

### Videos Table

```sql
CREATE TABLE videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artistId INT NOT NULL,
  videoUrl VARCHAR(512) NOT NULL,
  thumbnailUrl VARCHAR(512),
  caption TEXT,
  duration INT NOT NULL, -- in seconds
  fileSize BIGINT NOT NULL, -- in bytes
  width INT NOT NULL,
  height INT NOT NULL,
  viewCount INT DEFAULT 0,
  likeCount INT DEFAULT 0,
  commentCount INT DEFAULT 0,
  shareCount INT DEFAULT 0,
  isPublished BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artistId) REFERENCES artistProfiles(id) ON DELETE CASCADE,
  INDEX idx_artist_published (artistId, isPublished, createdAt),
  INDEX idx_feed_published (isPublished, createdAt),
  INDEX idx_view_count (viewCount DESC)
);
```

**Design Rationale:**
- **artistId foreign key** - Links videos to artist profiles for attribution
- **videoUrl** - S3 URL with Cache-Control headers for performance
- **thumbnailUrl** - Poster frame for preview (generated client-side initially)
- **caption** - Artist-provided description (max 500 characters)
- **duration/fileSize** - Validation and analytics metadata
- **width/height** - Aspect ratio detection (enforce 9:16 vertical)
- **Counters** - Denormalized for performance (updated via triggers/jobs)
- **Indexes** - Optimized for feed queries and artist profile pages

### Video Likes Table

```sql
CREATE TABLE videoLikes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  videoId INT NOT NULL,
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (videoId) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_video_user (videoId, userId),
  INDEX idx_user_likes (userId, createdAt),
  INDEX idx_video_likes (videoId, createdAt)
);
```

**Design Rationale:**
- **Unique constraint** - Prevents duplicate likes from same user
- **Cascade delete** - Clean up likes when video or user deleted
- **Dual indexes** - Support both "user's liked videos" and "video's likers" queries

### Video Comments Table

```sql
CREATE TABLE videoComments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  videoId INT NOT NULL,
  userId INT NOT NULL,
  content TEXT NOT NULL,
  likeCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (videoId) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_video_comments (videoId, createdAt),
  INDEX idx_user_comments (userId, createdAt)
);
```

**Design Rationale:**
- **Simple flat structure** - No nested replies in MVP (add in Phase 2)
- **likeCount** - Denormalized for sorting popular comments
- **content** - Plain text only (no rich formatting in MVP)

### Video Views Table

```sql
CREATE TABLE videoViews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  videoId INT NOT NULL,
  userId INT, -- NULL for anonymous views
  watchDuration INT NOT NULL, -- seconds watched
  completionRate DECIMAL(5,2), -- percentage watched
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (videoId) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_video_views (videoId, createdAt),
  INDEX idx_user_views (userId, createdAt)
);
```

**Design Rationale:**
- **Anonymous tracking** - userId can be NULL for logged-out users
- **watchDuration** - Track actual engagement (not just page views)
- **completionRate** - Analytics for artist insights (Phase 3)
- **High write volume** - Consider partitioning by date in production

---

## API Design (tRPC Procedures)

### Video Upload

```typescript
video: router({
  upload: protectedProcedure
    .input(z.object({
      caption: z.string().max(500).optional(),
      duration: z.number().min(1).max(60), // 1-60 seconds
      fileSize: z.number().max(100 * 1024 * 1024), // 100MB max
      width: z.number(),
      height: z.number(),
      videoKey: z.string(), // S3 key after client-side upload
      thumbnailKey: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate user is an artist
      const artist = await getArtistByUserId(ctx.user.id);
      if (!artist) throw new TRPCError({ code: 'FORBIDDEN' });
      
      // Validate aspect ratio (must be vertical 9:16 or similar)
      const aspectRatio = input.width / input.height;
      if (aspectRatio > 0.7) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: 'Video must be vertical (9:16 aspect ratio)' 
        });
      }
      
      // Create video record
      const video = await db.insert(videos).values({
        artistId: artist.id,
        videoUrl: `${S3_BASE_URL}/${input.videoKey}`,
        thumbnailUrl: input.thumbnailKey ? `${S3_BASE_URL}/${input.thumbnailKey}` : null,
        caption: input.caption,
        duration: input.duration,
        fileSize: input.fileSize,
        width: input.width,
        height: input.height,
      });
      
      return { videoId: video.insertId };
    }),
})
```

### Video Feed

```typescript
getFeed: publicProcedure
  .input(z.object({
    cursor: z.number().optional(), // Pagination cursor (video ID)
    limit: z.number().min(1).max(50).default(20),
    artistId: z.number().optional(), // Filter by artist
  }))
  .query(async ({ input }) => {
    const { cursor, limit, artistId } = input;
    
    // Build query with cursor-based pagination
    let query = db
      .select({
        id: videos.id,
        videoUrl: videos.videoUrl,
        thumbnailUrl: videos.thumbnailUrl,
        caption: videos.caption,
        duration: videos.duration,
        viewCount: videos.viewCount,
        likeCount: videos.likeCount,
        commentCount: videos.commentCount,
        createdAt: videos.createdAt,
        artist: {
          id: artistProfiles.id,
          stageName: artistProfiles.stageName,
          avatarUrl: artistProfiles.avatarUrl,
        },
      })
      .from(videos)
      .innerJoin(artistProfiles, eq(videos.artistId, artistProfiles.id))
      .where(eq(videos.isPublished, true))
      .orderBy(desc(videos.createdAt))
      .limit(limit + 1); // Fetch one extra to determine if there's more
    
    if (cursor) {
      query = query.where(lt(videos.id, cursor));
    }
    
    if (artistId) {
      query = query.where(eq(videos.artistId, artistId));
    }
    
    const results = await query;
    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, -1) : results;
    
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }),
```

### Like Video

```typescript
like: protectedProcedure
  .input(z.object({
    videoId: z.number(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Check if already liked
    const existing = await db
      .select()
      .from(videoLikes)
      .where(
        and(
          eq(videoLikes.videoId, input.videoId),
          eq(videoLikes.userId, ctx.user.id)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      // Unlike: remove like and decrement counter
      await db.delete(videoLikes).where(eq(videoLikes.id, existing[0].id));
      await db
        .update(videos)
        .set({ likeCount: sql`likeCount - 1` })
        .where(eq(videos.id, input.videoId));
      
      return { liked: false };
    } else {
      // Like: add like and increment counter
      await db.insert(videoLikes).values({
        videoId: input.videoId,
        userId: ctx.user.id,
      });
      await db
        .update(videos)
        .set({ likeCount: sql`likeCount + 1` })
        .where(eq(videos.id, input.videoId));
      
      return { liked: true };
    }
  }),
```

### Track View

```typescript
trackView: publicProcedure
  .input(z.object({
    videoId: z.number(),
    watchDuration: z.number().min(0),
  }))
  .mutation(async ({ ctx, input }) => {
    // Only count as view if watched for 3+ seconds
    if (input.watchDuration < 3) return { counted: false };
    
    // Get video duration for completion rate
    const video = await db
      .select({ duration: videos.duration })
      .from(videos)
      .where(eq(videos.id, input.videoId))
      .limit(1);
    
    if (!video.length) return { counted: false };
    
    const completionRate = (input.watchDuration / video[0].duration) * 100;
    
    // Insert view record
    await db.insert(videoViews).values({
      videoId: input.videoId,
      userId: ctx.user?.id || null,
      watchDuration: input.watchDuration,
      completionRate: Math.min(completionRate, 100),
    });
    
    // Increment view counter (only once per session)
    await db
      .update(videos)
      .set({ viewCount: sql`viewCount + 1` })
      .where(eq(videos.id, input.videoId));
    
    return { counted: true };
  }),
```

---

## Frontend Component Architecture

### Component Hierarchy

```
<VideoFeedPage>
  └── <VideoFeed>
      ├── <VideoPlayer> (current video)
      │   ├── <video> (HTML5 element)
      │   ├── <VideoOverlay>
      │   │   ├── <ArtistInfo>
      │   │   ├── <VideoCaption>
      │   │   └── <VideoActions>
      │   │       ├── <LikeButton>
      │   │       ├── <CommentButton>
      │   │       ├── <ShareButton>
      │   │       └── <FollowButton>
      │   └── <VideoControls>
      │       ├── <PlayPauseButton>
      │       ├── <MuteButton>
      │       └── <ProgressBar>
      └── <VideoPlayer> (preloaded next videos)
```

### Core Components

#### VideoFeed Component

```typescript
// client/src/components/VideoFeed/VideoFeed.tsx

import { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { trpc } from '@/lib/trpc';
import VideoPlayer from './VideoPlayer';

interface VideoFeedProps {
  artistId?: number; // Optional: filter by artist
}

export default function VideoFeed({ artistId }: VideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Fetch video feed with infinite scroll
  const { data, fetchNextPage, hasNextPage } = trpc.video.getFeed.useInfiniteQuery(
    { artistId, limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  
  // Flatten paginated results
  const videos = data?.pages.flatMap((page) => page.items) ?? [];
  
  // Preload next videos when approaching end
  useEffect(() => {
    if (currentIndex >= videos.length - 5 && hasNextPage) {
      fetchNextPage();
    }
  }, [currentIndex, videos.length, hasNextPage, fetchNextPage]);
  
  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedUp: () => {
      if (currentIndex < videos.length - 1 && !isTransitioning) {
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    },
    onSwipedDown: () => {
      if (currentIndex > 0 && !isTransitioning) {
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev - 1);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true, // Enable mouse drag on desktop
  });
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      } else if (e.key === 'ArrowDown' && currentIndex < videos.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length]);
  
  if (!videos.length) {
    return <div className="flex items-center justify-center h-screen">Loading videos...</div>;
  }
  
  return (
    <div 
      {...handlers}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* Render current video and preload adjacent videos */}
      {[-1, 0, 1].map((offset) => {
        const index = currentIndex + offset;
        if (index < 0 || index >= videos.length) return null;
        
        const video = videos[index];
        const isActive = offset === 0;
        
        return (
          <div
            key={video.id}
            className="absolute inset-0 transition-transform duration-300"
            style={{
              transform: `translateY(${offset * 100}%)`,
              zIndex: isActive ? 10 : 1,
            }}
          >
            <VideoPlayer
              video={video}
              isActive={isActive}
              shouldPreload={Math.abs(offset) <= 1}
            />
          </div>
        );
      })}
      
      {/* Progress indicator */}
      <div className="absolute top-4 right-4 z-20 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
        {currentIndex + 1} / {videos.length}
      </div>
    </div>
  );
}
```

#### VideoPlayer Component

```typescript
// client/src/components/VideoFeed/VideoPlayer.tsx

import { useRef, useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Heart, MessageCircle, Share2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  video: {
    id: number;
    videoUrl: string;
    thumbnailUrl: string | null;
    caption: string | null;
    duration: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    artist: {
      id: number;
      stageName: string;
      avatarUrl: string | null;
    };
  };
  isActive: boolean;
  shouldPreload: boolean;
}

export default function VideoPlayer({ video, isActive, shouldPreload }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  
  const utils = trpc.useUtils();
  
  // Like mutation
  const likeMutation = trpc.video.like.useMutation({
    onSuccess: () => {
      utils.video.getFeed.invalidate();
    },
  });
  
  // Track view mutation
  const trackViewMutation = trpc.video.trackView.useMutation();
  
  // Auto-play when active
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isActive) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
      setWatchStartTime(Date.now());
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      
      // Track view when leaving video
      if (watchStartTime) {
        const watchDuration = Math.floor((Date.now() - watchStartTime) / 1000);
        trackViewMutation.mutate({ videoId: video.id, watchDuration });
        setWatchStartTime(null);
      }
    }
  }, [isActive]);
  
  // Preload video
  useEffect(() => {
    if (videoRef.current && shouldPreload) {
      videoRef.current.load();
    }
  }, [shouldPreload]);
  
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const handleLike = () => {
    likeMutation.mutate({ videoId: video.id });
  };
  
  return (
    <div className="relative w-full h-full bg-black">
      {/* Video element */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl || undefined}
        className="w-full h-full object-contain"
        loop
        playsInline
        preload={shouldPreload ? 'auto' : 'none'}
        onClick={togglePlay}
      />
      
      {/* Overlay with artist info and actions */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Artist info (bottom left) */}
        <div className="absolute bottom-20 left-4 text-white pointer-events-auto">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={video.artist.avatarUrl || '/default-avatar.png'}
              alt={video.artist.stageName}
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div>
              <p className="font-bold text-lg">{video.artist.stageName}</p>
              <p className="text-sm opacity-80">{video.viewCount.toLocaleString()} views</p>
            </div>
          </div>
          
          {video.caption && (
            <p className="text-sm max-w-xs line-clamp-3 mb-2">{video.caption}</p>
          )}
        </div>
        
        {/* Action buttons (bottom right) */}
        <div className="absolute bottom-20 right-4 flex flex-col gap-6 pointer-events-auto">
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-1 text-white"
          >
            <Heart
              className={`w-8 h-8 ${likeMutation.data?.liked ? 'fill-red-500 text-red-500' : ''}`}
            />
            <span className="text-xs">{video.likeCount.toLocaleString()}</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-white">
            <MessageCircle className="w-8 h-8" />
            <span className="text-xs">{video.commentCount.toLocaleString()}</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-white">
            <Share2 className="w-8 h-8" />
            <span className="text-xs">Share</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-white">
            <UserPlus className="w-8 h-8" />
            <span className="text-xs">Follow</span>
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### VideoUpload Component

```typescript
// client/src/components/VideoFeed/VideoUpload.tsx

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { storagePut } from '@/lib/storage';
import { toast } from 'sonner';

export default function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const uploadMutation = trpc.video.upload.useMutation({
    onSuccess: () => {
      toast.success('Video uploaded successfully!');
      setFile(null);
      setCaption('');
      setUploadProgress(0);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Validate file type
    if (!selectedFile.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    
    // Validate file size (100MB max)
    if (selectedFile.size > 100 * 1024 * 1024) {
      toast.error('Video must be under 100MB');
      return;
    }
    
    setFile(selectedFile);
    
    // Load video metadata
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      // Validate duration (60 seconds max)
      if (video.duration > 60) {
        toast.error('Video must be 60 seconds or less');
        setFile(null);
        return;
      }
      
      // Validate aspect ratio (must be vertical)
      const aspectRatio = video.videoWidth / video.videoHeight;
      if (aspectRatio > 0.7) {
        toast.error('Video must be vertical (9:16 aspect ratio)');
        setFile(null);
        return;
      }
    };
    video.src = URL.createObjectURL(selectedFile);
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Get video metadata
      const video = videoRef.current!;
      const duration = Math.floor(video.duration);
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      // Generate unique video key
      const timestamp = Date.now();
      const videoKey = `videos/${timestamp}-${file.name}`;
      
      // Upload to S3
      const { url } = await storagePut(videoKey, file, file.type);
      
      // Create database record
      await uploadMutation.mutateAsync({
        caption: caption.trim() || undefined,
        duration,
        fileSize: file.size,
        width,
        height,
        videoKey,
      });
      
      setIsUploading(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Video</h2>
      
      {!file ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <Upload className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Click to upload video</p>
          <p className="text-xs text-gray-400 mt-1">MP4, max 60 seconds, max 100MB</p>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4">
          {/* Video preview */}
          <div className="relative">
            <video
              ref={videoRef}
              src={URL.createObjectURL(file)}
              controls
              className="w-full max-h-96 rounded-lg"
            />
            <button
              onClick={() => setFile(null)}
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Caption input */}
          <Textarea
            placeholder="Add a caption... (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={500}
            rows={3}
          />
          
          {/* Upload button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

## Implementation Timeline

### Sprint 1: Foundation (Week 1)

**Days 1-2: Database & API Setup**
- [ ] Create database migrations for `videos`, `videoLikes`, `videoComments`, `videoViews` tables
- [ ] Add database indexes for performance
- [ ] Implement tRPC procedures: `upload`, `getFeed`, `getById`, `like`, `trackView`
- [ ] Write unit tests for API endpoints
- [ ] Test with Postman/Thunder Client

**Days 3-4: Video Upload Flow**
- [ ] Build `VideoUpload` component with file validation
- [ ] Implement client-side video metadata extraction
- [ ] Add progress tracking for S3 uploads
- [ ] Create artist dashboard page with upload button
- [ ] Test upload flow end-to-end

**Days 5-7: Video Player Component**
- [ ] Build `VideoPlayer` component with HTML5 video
- [ ] Implement play/pause, mute controls
- [ ] Add like button with optimistic updates
- [ ] Create artist info overlay
- [ ] Test video playback on multiple devices

### Sprint 2: Feed & Polish (Week 2)

**Days 8-10: Video Feed Component**
- [ ] Build `VideoFeed` container with swipe detection
- [ ] Implement cursor-based pagination
- [ ] Add video preloading logic (next 2 videos)
- [ ] Create smooth transitions between videos
- [ ] Test swipe gestures on mobile and desktop

**Days 11-12: Interactions & Analytics**
- [ ] Implement view tracking (3-second threshold)
- [ ] Add comment button (opens modal)
- [ ] Create share functionality (copy link)
- [ ] Build follow button integration
- [ ] Test all interactions

**Days 13-14: Testing & Deployment**
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Performance optimization (memory leaks, preloading)
- [ ] Accessibility audit (keyboard navigation, screen readers)
- [ ] Deploy to production

### Sprint 3: Buffer & Documentation (Week 3)

**Days 15-17: Bug Fixes & Polish**
- [ ] Address bugs from testing
- [ ] Optimize video loading performance
- [ ] Improve error handling and user feedback
- [ ] Add loading skeletons and empty states
- [ ] Polish UI animations and transitions

**Days 18-19: Documentation**
- [ ] Write API documentation for video endpoints
- [ ] Create artist guide for video uploads
- [ ] Document component usage for future developers
- [ ] Add analytics dashboard for video performance

**Day 20: Launch Preparation**
- [ ] Final QA testing
- [ ] Prepare launch announcement
- [ ] Monitor initial user feedback
- [ ] Plan Phase 2 features based on usage

---

## Testing Strategy

### Unit Tests

**Backend (tRPC Procedures)**
- Test video upload validation (file size, duration, aspect ratio)
- Test feed pagination (cursor logic, limit enforcement)
- Test like toggle (add/remove, counter updates)
- Test view tracking (threshold, anonymous users)
- Test error handling (missing video, unauthorized access)

**Frontend (React Components)**
- Test VideoPlayer play/pause functionality
- Test swipe gesture detection
- Test video preloading logic
- Test like button optimistic updates
- Test upload form validation

### Integration Tests

- End-to-end upload flow (file selection → S3 → database → feed)
- Video feed navigation (swipe, keyboard, pagination)
- Like/unlike flow (UI update → API call → database → counter)
- View tracking flow (watch time → API call → analytics)

### Performance Tests

- Video loading time (target: <2 seconds on 4G)
- Memory usage (target: <500MB for 20 preloaded videos)
- Swipe responsiveness (target: <100ms transition)
- Feed scroll performance (target: 60fps on mobile)

### Browser Compatibility

| Browser | Version | Priority | Status |
|---------|---------|----------|--------|
| Chrome | Latest | P0 | ✅ |
| Safari (iOS) | Latest | P0 | ✅ |
| Safari (macOS) | Latest | P1 | ✅ |
| Firefox | Latest | P1 | ✅ |
| Edge | Latest | P2 | ✅ |
| Chrome (Android) | Latest | P0 | ✅ |

---

## Success Metrics

### Phase 1 MVP Goals

**Adoption Metrics**
- **Target:** 100 videos uploaded in first week
- **Target:** 50% of active artists upload at least one video
- **Target:** 1000+ video views in first week

**Engagement Metrics**
- **Target:** Average watch time >15 seconds (50% completion rate)
- **Target:** 10% like rate (likes per view)
- **Target:** 5% comment rate (comments per view)

**Performance Metrics**
- **Target:** <2 second video load time on 4G
- **Target:** 60fps scroll performance on mobile
- **Target:** <5% error rate on uploads

**User Feedback**
- **Target:** >4.0/5.0 average rating from artist survey
- **Target:** <10% bounce rate on video feed page
- **Target:** Positive sentiment in user interviews

### Analytics Dashboard

Track these metrics in real-time:

```typescript
// Example analytics queries

// Total videos uploaded
SELECT COUNT(*) FROM videos WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY);

// Average watch time
SELECT AVG(watchDuration) FROM videoViews WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY);

// Top performing videos
SELECT v.id, v.caption, v.viewCount, v.likeCount, a.stageName
FROM videos v
JOIN artistProfiles a ON v.artistId = a.id
ORDER BY v.viewCount DESC
LIMIT 10;

// Engagement rate by artist
SELECT 
  a.stageName,
  COUNT(v.id) as videoCount,
  SUM(v.viewCount) as totalViews,
  SUM(v.likeCount) as totalLikes,
  (SUM(v.likeCount) / SUM(v.viewCount) * 100) as likeRate
FROM artistProfiles a
JOIN videos v ON a.id = v.artistId
GROUP BY a.id
ORDER BY totalViews DESC;
```

---

## Risk Assessment & Mitigation

### Technical Risks

**Risk 1: Video playback performance on low-end devices**
- **Likelihood:** Medium
- **Impact:** High (poor UX = user churn)
- **Mitigation:** 
  - Implement adaptive streaming (serve lower resolution on slow connections)
  - Add video quality selector (let users choose resolution)
  - Optimize preloading strategy (reduce memory footprint)

**Risk 2: S3 bandwidth costs exceed budget**
- **Likelihood:** Medium
- **Impact:** Medium (unexpected costs)
- **Mitigation:**
  - Our Cache-Control headers already implemented (70-80% reduction)
  - Monitor bandwidth usage daily
  - Set CloudWatch alarms for cost thresholds
  - Plan CloudFront CDN integration for Phase 2

**Risk 3: Large video uploads fail or timeout**
- **Likelihood:** High
- **Impact:** Medium (artist frustration)
- **Mitigation:**
  - Implement chunked uploads with retry logic
  - Add upload progress indicator
  - Provide clear error messages with retry button
  - Consider direct S3 upload with presigned URLs

### Product Risks

**Risk 4: Low artist adoption (not enough content)**
- **Likelihood:** Medium
- **Impact:** High (empty feed = no value)
- **Mitigation:**
  - Launch with beta group of 10-20 active artists
  - Provide upload incentives (featured placement, analytics)
  - Create artist guide with best practices
  - Seed feed with high-quality example videos

**Risk 5: Copyright issues (artists upload copyrighted content)**
- **Likelihood:** Low
- **Impact:** High (legal liability)
- **Mitigation:**
  - Add terms of service agreement on upload
  - Implement DMCA takedown process
  - Add reporting mechanism for copyright violations
  - Consider content moderation in Phase 2

---

## Phase 2 & 3 Preview

### Phase 2: Performance Optimization (2-3 weeks)

**Video Transcoding Pipeline**
- Integrate AWS MediaConvert or Cloudflare Stream
- Generate multiple resolutions (1080p, 720p, 480p, 360p)
- Implement HLS/DASH adaptive streaming
- Extract thumbnails automatically

**Advanced Interactions**
- Comment threads with nested replies
- Video sharing to social media
- Duet/response videos
- Sound attribution (link to full track)

**Performance Enhancements**
- Implement service worker for offline caching
- Add video quality selector
- Optimize memory management
- Reduce bundle size with code splitting

### Phase 3: Enterprise Features (3-4 weeks)

**Algorithm & Discovery**
- Personalized "For You" feed
- Trending videos page
- Search by artist, caption, sound
- Related videos recommendations

**Analytics Dashboard**
- Artist insights (views, engagement, demographics)
- Audience retention graphs
- Traffic sources analysis
- Export analytics reports

**Monetization**
- Premium video features (longer duration, higher resolution)
- Sponsored video placements
- Tip jar for artists
- Video ads (revenue share)

---

## Conclusion

This Phase 1 MVP plan provides a comprehensive roadmap for building a TikTok-style vertical video feed for Boptone. The implementation is designed to be **fast** (2-3 weeks), **scalable** (built on existing infrastructure), and **iterative** (foundation for advanced features).

**Key Success Factors:**
1. **Leverage existing infrastructure** - S3 storage, tRPC API, React components
2. **Start simple** - Core functionality first, polish later
3. **Validate early** - Launch with beta artists, gather feedback
4. **Iterate quickly** - Use metrics to guide Phase 2 priorities

**Next Steps:**
1. Review and approve this plan
2. Create GitHub project board with tasks
3. Begin Sprint 1 (database schema + API)
4. Schedule daily standups for progress tracking

This feature has the potential to transform Boptone from a music platform into a **video-first creator ecosystem**. Short-form video is the dominant content format of 2026, and artists need a platform that understands their creative workflow. Let's build it.

---

**Questions or feedback?** Reply with any concerns, adjustments, or additional requirements before we begin implementation.
