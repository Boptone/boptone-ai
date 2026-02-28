/**
 * BopsVideoPlayer
 *
 * Single full-screen video card in the Bops feed.
 * - Auto-plays when ≥60% visible (IntersectionObserver)
 * - Tap anywhere on video to pause/resume
 * - Muted by default (browser autoplay policy), unmute button top-right
 * - Shows artist info and caption overlaid at bottom-left
 * - Action buttons (like, tip, share, comment) on right rail
 * - Designed for mobile-only 9:16 full-viewport experience
 *
 * HLS Support:
 * - If `bop.hlsUrl` is present, uses hls.js for adaptive bitrate streaming
 * - Falls back to `bop.videoUrl` (raw MP4) if HLS is not available or not supported
 * - hls.js automatically selects 360p on mobile data, 1080p on WiFi
 */
import { useRef, useEffect, useState, useCallback } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import BopsActionButtons from "./BopsActionButtons";

export interface BopItem {
  id: number;
  caption: string | null;
  videoUrl: string;
  hlsUrl?: string | null;       // HLS master playlist URL (set after transcoding)
  thumbnailUrl: string | null;
  durationMs: number | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tipCount: number;
  tipTotalCents: number;
  publishedAt: Date | null;
  artistId: number | null;
  linkedTrackId: number | null;
  // Joined artist info (enriched by feed page)
  artistName?: string;
  artistAvatarUrl?: string;
  artistUsername?: string;
}

interface BopsVideoPlayerProps {
  bop: BopItem;
  isActive: boolean; // true when this card is the currently visible one
  isMuted: boolean;
  onMuteToggle: () => void;
}

export default function BopsVideoPlayer({
  bop,
  isActive,
  isMuted,
  onMuteToggle,
}: BopsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // user-initiated pause
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const [hasRecordedView, setHasRecordedView] = useState(false);
  const { isAuthenticated } = useAuth();

  const recordView = trpc.bops.recordView.useMutation();

  // ── HLS initialization ─────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Destroy any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const hlsUrl = bop.hlsUrl;

    if (hlsUrl && Hls.isSupported()) {
      // Use hls.js for adaptive bitrate streaming
      const hls = new Hls({
        startLevel: -1,         // Auto-select quality level
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.error("[BopsVideoPlayer] HLS fatal error:", data.type, data.details);
          // Fall back to raw video URL on fatal HLS error
          video.src = bop.videoUrl;
        }
      });
      hlsRef.current = hls;
    } else if (hlsUrl && video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari / iOS)
      video.src = hlsUrl;
    } else {
      // Fallback: use raw video URL
      video.src = bop.videoUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [bop.id, bop.hlsUrl, bop.videoUrl]);

  // ── Auto-play / pause based on visibility ──────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !isPaused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, isPaused]);

  // ── Sync muted state ───────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = isMuted;
  }, [isMuted]);

  // ── Record view after 3 seconds of playback ────────────────────────────────
  useEffect(() => {
    if (!isActive || hasRecordedView) return;
    const timer = setTimeout(() => {
      recordView.mutate({ videoId: bop.id });
      setHasRecordedView(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isActive, hasRecordedView, bop.id]);

  // ── Tap to pause / resume ──────────────────────────────────────────────────
  const handleVideoTap = useCallback(() => {
    if (!isActive) return;
    if (isPaused) {
      setIsPaused(false);
      setShowPauseIcon(false);
    } else {
      setIsPaused(true);
      setShowPauseIcon(true);
    }
  }, [isActive, isPaused]);

  // ── Hide pause icon after 1s ───────────────────────────────────────────────
  useEffect(() => {
    if (!showPauseIcon) return;
    const timer = setTimeout(() => setShowPauseIcon(false), 900);
    return () => clearTimeout(timer);
  }, [showPauseIcon]);

  // ── Loop video ─────────────────────────────────────────────────────────────
  const handleEnded = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      if (!isPaused) video.play().catch(() => {});
    }
  }, [isPaused]);

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* ── Video element ────────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        poster={bop.thumbnailUrl ?? undefined}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted={isMuted}
        loop={false}
        preload="metadata"
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={handleVideoTap}
        style={{ touchAction: "none" }}
      />

      {/* ── Tap overlay (invisible, captures taps) ───────────────────────── */}
      <div
        className="absolute inset-0 z-10"
        onClick={handleVideoTap}
        style={{ touchAction: "none" }}
      />

      {/* ── Pause / Play flash icon ───────────────────────────────────────── */}
      {showPauseIcon && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
            {isPaused ? (
              <Pause className="w-10 h-10 text-white fill-white" />
            ) : (
              <Play className="w-10 h-10 text-white fill-white" />
            )}
          </div>
        </div>
      )}

      {/* ── Mute / Unmute button — top right ─────────────────────────────── */}
      <button
        onClick={(e) => { e.stopPropagation(); onMuteToggle(); }}
        className="absolute top-4 right-4 z-30 bg-black/40 rounded-full p-2 backdrop-blur-sm"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </button>

      {/* ── HLS quality indicator — top left (dev only) ──────────────────── */}
      {bop.hlsUrl && (
        <div className="absolute top-4 left-4 z-30 pointer-events-none">
          <span className="bg-[#5DCCCC]/80 text-black text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
            HLS
          </span>
        </div>
      )}

      {/* ── Bottom gradient overlay ───────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
        style={{
          height: "55%",
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
        }}
      />

      {/* ── Artist info + caption — bottom left ──────────────────────────── */}
      <div className="absolute bottom-6 left-4 right-20 z-30">
        {/* Artist identity — clickable, navigates to artist profile */}
        <ArtistIdentity bop={bop} />
        <div className="pointer-events-none">
          {/* Caption */}
          {bop.caption && (
            <p className="text-white text-sm leading-snug line-clamp-3 drop-shadow-md">
              {bop.caption}
            </p>
          )}

          {/* View count */}
          <p className="text-white/60 text-xs mt-1 drop-shadow-md">
            {formatCount(bop.viewCount)} views
          </p>
        </div>
      </div>

      {/* ── Action buttons — right rail ───────────────────────────────────── */}
      <div className="absolute bottom-6 right-3 z-30">
        <BopsActionButtons
          bop={bop}
          isAuthenticated={isAuthenticated}
          onAuthRequired={() => { window.location.href = getLoginUrl(); }}
        />
      </div>
    </div>
  );
}

/**
 * ArtistIdentity — clickable avatar + username that navigates to /bops/artist/:artistId
 * Rendered inside the video overlay; stops tap propagation so it doesn't toggle play/pause.
 */
function ArtistIdentity({ bop }: { bop: BopItem }) {
  const [, navigate] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bop.artistId) {
      navigate(`/bops/artist/${bop.artistId}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 mb-2 group cursor-pointer"
      style={{ background: "none", border: "none", padding: 0 }}
      aria-label={`View ${bop.artistName ?? "artist"}'s profile`}
    >
      {bop.artistAvatarUrl ? (
        <img
          src={bop.artistAvatarUrl}
          alt={bop.artistName ?? "Artist"}
          className="w-9 h-9 rounded-full object-cover border-2 border-white/80 group-hover:border-[#5DCCCC] transition-colors"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-[#5DCCCC] flex items-center justify-center border-2 border-white/80 group-hover:border-white transition-colors">
          <span className="text-black font-bold text-sm">
            {(bop.artistName ?? "A").charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <span className="text-white font-semibold text-sm drop-shadow-md group-hover:text-[#5DCCCC] transition-colors">
        {bop.artistUsername ? `@${bop.artistUsername}` : bop.artistName ?? "Artist"}
      </span>
    </button>
  );
}
