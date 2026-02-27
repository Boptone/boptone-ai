/**
 * Artist Bops Profile — /bops/artist/:artistId
 *
 * Desktop-first layout inspired by TikTok/Instagram Reels profile pages:
 * - Full-width artist header with cover gradient, avatar, stats, and action buttons
 * - 4-column responsive video grid (4 col desktop → 3 col tablet → 2 col mobile)
 * - Each card: 9:16 aspect ratio, video preview on hover, stats overlay
 * - Infinite scroll pagination
 * - Respects system dark/light mode via prefers-color-scheme
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowLeft,
  Music,
  ShoppingBag,
  Heart,
  Zap,
  Play,
  CheckCircle,
  Eye,
  Plus,
  Video,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BopVideo {
  id: number;
  thumbnailUrl: string | null;
  videoUrl: string;
  caption: string | null;
  viewCount: number;
  likeCount: number;
  tipCount: number;
  durationMs: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function sumField(items: BopVideo[], field: keyof BopVideo): number {
  return items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
}

// ─── Video Grid Card ──────────────────────────────────────────────────────────

function BopGridCard({ bop, onClick }: { bop: BopVideo; onClick: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden bg-[#111] group cursor-pointer"
      style={{ aspectRatio: "9/16" }}
      aria-label={bop.caption ?? "Watch Bop"}
    >
      {/* Video preview (plays on hover, muted) */}
      <video
        ref={videoRef}
        src={bop.videoUrl}
        muted
        playsInline
        loop
        preload="none"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Thumbnail / static fallback */}
      {bop.thumbnailUrl ? (
        <img
          src={bop.thumbnailUrl}
          alt={bop.caption ?? "Bop"}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          style={{
            opacity: isHovered ? 0 : 1,
            transition: "opacity 0.2s ease",
          }}
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
            opacity: isHovered ? 0 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          <Video className="w-8 h-8 text-white/20" />
        </div>
      )}

      {/* Dark gradient overlay — always present */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)",
        }}
      />

      {/* Hover: play icon center */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.15s ease",
        }}
      >
        <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 flex items-end justify-between gap-2">
        {/* Caption */}
        {bop.caption && (
          <p className="text-white text-[11px] leading-tight line-clamp-2 flex-1 text-left drop-shadow-md">
            {bop.caption}
          </p>
        )}

        {/* Stats */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-white/70" />
            <span className="text-white/80 text-[10px] font-semibold tabular-nums">
              {formatCount(bop.viewCount)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-white fill-white" />
            <span className="text-white text-[10px] font-semibold tabular-nums">
              {formatCount(bop.likeCount)}
            </span>
          </div>
        </div>
      </div>

      {/* Duration badge — top right */}
      {bop.durationMs > 0 && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
          <span className="text-white text-[10px] font-mono tabular-nums">
            {formatDuration(bop.durationMs)}
          </span>
        </div>
      )}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ArtistBopsProfile() {
  const { artistId } = useParams<{ artistId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [allBops, setAllBops] = useState<BopVideo[]>([]);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const seenCursors = useRef<Set<string>>(new Set());

  const parsedArtistId = parseInt(artistId ?? "0", 10);

  // Fetch artist profile
  const { data: artistProfile, isLoading: profileLoading } = trpc.artistProfile.getById.useQuery(
    { id: parsedArtistId },
    { enabled: parsedArtistId > 0 }
  );

  // Fetch Bops for this artist
  const { data: bopsData, isLoading: bopsLoading, isFetching } = trpc.bops.getByArtist.useQuery(
    { artistId: parsedArtistId, limit: 24, cursor },
    { enabled: parsedArtistId > 0 }
  );

  // Accumulate pages — use a stable cursor key to avoid double-appending
  useEffect(() => {
    if (!bopsData) return;
    const key = String(cursor ?? 'init');
    if (seenCursors.current.has(key)) return;
    seenCursors.current.add(key);
    const existingIds = new Set(allBops.map((b) => b.id));
    const newItems = (bopsData.items as unknown as BopVideo[]).filter((b) => !existingIds.has(b.id));
    if (newItems.length > 0) setAllBops((prev) => [...prev, ...newItems]);
    setHasMore(bopsData.hasNextPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bopsData]);

  // Infinite scroll sentinel
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isFetching) {
            setCursor(allBops[allBops.length - 1]?.id);
          }
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(node);
    },
    [hasMore, isFetching, allBops]
  );

  // Derived stats
  const totalLikes = sumField(allBops, "likeCount");
  const totalViews = sumField(allBops, "viewCount");

  // Loading
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#5DCCCC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not found
  if (!artistProfile && !profileLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-lg font-semibold">Artist not found</p>
        <button onClick={() => navigate("/bops")} className="text-[#5DCCCC] underline text-sm">
          Back to Bops
        </button>
      </div>
    );
  }

  const artist = artistProfile!;
  const isOwner = user && (artist as any).userId === (user as any).id;

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: "'Inter', sans-serif", background: "var(--bops-bg, #000)", colorScheme: "dark light" }}>

      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-40 backdrop-blur-md border-b border-white/5" style={{ background: "var(--bops-nav-bg, rgba(0,0,0,0.8))" }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate("/bops")}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Back to Bops"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-widest uppercase text-white">BOPTONE</span>
            <span className="text-white/30 text-sm">/</span>
            <span className="text-white/60 text-sm font-medium">{artist.stageName}</span>
          </div>
        </div>
      </div>

      {/* ── Hero header ── */}
      <div
        className="relative"
        style={{
          background: "linear-gradient(180deg, #0d1a1a 0%, #000 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Subtle cyan glow behind avatar */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(93,204,204,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 py-10 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden"
                style={{
                  border: artist.verifiedStatus ? "3px solid #5DCCCC" : "3px solid rgba(255,255,255,0.15)",
                  boxShadow: artist.verifiedStatus
                    ? "0 0 24px rgba(93,204,204,0.35)"
                    : "0 0 0 transparent",
                }}
              >
                {artist.avatarUrl ? (
                  <img
                    src={artist.avatarUrl}
                    alt={artist.stageName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                    <span className="text-4xl font-black text-white/30">
                      {artist.stageName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {artist.verifiedStatus && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-black rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#5DCCCC] fill-[#5DCCCC]" />
                </div>
              )}
            </div>

            {/* Info block */}
            <div className="flex-1 flex flex-col items-center md:items-start gap-4">

              {/* Name + verified */}
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{artist.stageName}</h1>
                {artist.verifiedStatus && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: "rgba(93,204,204,0.15)", color: "#5DCCCC", border: "1px solid rgba(93,204,204,0.3)" }}
                  >
                    Verified
                  </span>
                )}
              </div>

              {/* Location + genres */}
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                {artist.location && (
                  <span className="text-white/50 text-sm">{artist.location}</span>
                )}
                {artist.genres && artist.genres.length > 0 && (
                  <>
                    {artist.location && <span className="text-white/20">·</span>}
                    {artist.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre}
                        className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
                      >
                        {genre}
                      </span>
                    ))}
                  </>
                )}
              </div>

              {/* Bio */}
              {artist.bio && (
                <p className="text-white/60 text-sm leading-relaxed max-w-md text-center md:text-left">
                  {artist.bio}
                </p>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-6 md:gap-8">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-xl font-black tabular-nums">{formatCount(allBops.length)}</span>
                  <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Bops</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-xl font-black tabular-nums">{formatCount(totalViews)}</span>
                  <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Views</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-xl font-black tabular-nums">{formatCount(totalLikes)}</span>
                  <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Likes</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
                {/* Tip button — primary CTA */}
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all"
                  style={{ background: "#5DCCCC", color: "#000" }}
                  onClick={() => navigate("/bops")}
                >
                  <Zap className="w-4 h-4" />
                  Tip Artist
                </button>

                {/* Music */}
                <button
                  onClick={() => navigate("/music")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <Music className="w-4 h-4" />
                  Music
                </button>

                {/* BopShop */}
                <button
                  onClick={() => navigate("/shop")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  BopShop
                </button>

                {/* Owner: Post a Bop */}
                {isOwner && (
                  <button
                    onClick={() => navigate("/bops/upload")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all"
                    style={{
                      background: "rgba(93,204,204,0.1)",
                      color: "#5DCCCC",
                      border: "1px solid rgba(93,204,204,0.3)",
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Post a Bop
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid section header ── */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-[#5DCCCC]" />
          <span className="text-sm font-semibold text-white/70 uppercase tracking-widest">Latest Bops</span>
        </div>
        <span className="text-xs text-white/30 tabular-nums">{formatCount(allBops.length)} videos</span>
      </div>

      {/* ── Video grid ── */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {bopsLoading && allBops.length === 0 ? (
          /* Skeleton */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#111] animate-pulse rounded-sm"
                style={{ aspectRatio: "9/16" }}
              />
            ))}
          </div>
        ) : allBops.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(93,204,204,0.08)", border: "1px solid rgba(93,204,204,0.15)" }}
            >
              <Video className="w-9 h-9 text-[#5DCCCC]/40" />
            </div>
            <div>
              <p className="text-white/50 text-base font-semibold mb-1">
                {isOwner ? "You haven't posted any Bops yet." : "No Bops posted yet."}
              </p>
              <p className="text-white/30 text-sm">
                {isOwner ? "Share your first video with the world." : "Check back soon."}
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => navigate("/bops/upload")}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm"
                style={{ background: "#5DCCCC", color: "#000" }}
              >
                <Plus className="w-4 h-4" />
                Post a Bop
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 4-column grid on desktop, 3 on tablet, 2 on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
              {allBops.map((bop) => (
                <BopGridCard
                  key={bop.id}
                  bop={bop}
                  onClick={() => navigate(`/bops?start=${bop.id}`)}
                />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div
                ref={sentinelRef}
                className="col-span-full h-16 flex items-center justify-center mt-4"
              >
                {isFetching && (
                  <div className="w-6 h-6 border-2 border-[#5DCCCC] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            )}

            {/* End of feed */}
            {!hasMore && allBops.length > 0 && (
              <div className="flex items-center justify-center py-8 gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-white/25 text-xs uppercase tracking-widest font-medium">All Bops loaded</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
