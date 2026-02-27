import { useState, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, Music, ShoppingBag, Heart, Zap, Play, CheckCircle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BopVideo {
  id: number;
  thumbnailUrl: string | null;
  caption: string | null;
  viewCount: number;
  likeCount: number;
  tipCount: number;
  duration: number;
}

// ─── Bop Thumbnail Card ───────────────────────────────────────────────────────

function BopThumbnail({ bop, onClick }: { bop: BopVideo; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative aspect-[9/16] w-full overflow-hidden bg-black rounded-sm group"
      style={{ cursor: "pointer" }}
    >
      {/* Thumbnail image or fallback */}
      {bop.thumbnailUrl ? (
        <img
          src={bop.thumbnailUrl}
          alt={bop.caption ?? "Bop"}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <Play className="w-8 h-8 text-gray-600" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Play className="w-10 h-10 text-white fill-white" />
      </div>

      {/* Like count bottom-left */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1">
        <Heart className="w-3.5 h-3.5 text-white fill-white" />
        <span className="text-white text-xs font-semibold drop-shadow-md">
          {formatCount(bop.likeCount)}
        </span>
      </div>
    </button>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function sumField(items: BopVideo[], field: keyof BopVideo): number {
  return items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ArtistBopsProfile() {
  const { artistId } = useParams<{ artistId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [allBops, setAllBops] = useState<BopVideo[]>([]);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [selectedBopId, setSelectedBopId] = useState<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const parsedArtistId = parseInt(artistId ?? "0", 10);

  // Fetch artist profile
  const { data: artistProfile, isLoading: profileLoading } = trpc.artistProfile.getById.useQuery(
    { id: parsedArtistId },
    { enabled: parsedArtistId > 0 }
  );

  // Fetch Bops for this artist
  const { data: bopsData, isLoading: bopsLoading, isFetching } = trpc.bops.getByArtist.useQuery(
    { artistId: parsedArtistId, limit: 18, cursor },
    { enabled: parsedArtistId > 0 }
  );

  // Accumulate pages into allBops
  const prevCursorRef = useRef<number | undefined>(undefined);
  if (bopsData && prevCursorRef.current !== cursor) {
    prevCursorRef.current = cursor;
    const existingIds = new Set(allBops.map(b => b.id));
    const newItems = (bopsData.items as unknown as BopVideo[]).filter(b => !existingIds.has(b.id));
    if (newItems.length > 0) {
      setAllBops(prev => [...prev, ...newItems]);
    }
    if (bopsData.hasNextPage !== hasMore) setHasMore(bopsData.hasNextPage);
  }

  // Infinite scroll sentinel
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
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
  }, [hasMore, isFetching, allBops]);

  // Stats derived from loaded Bops
  const totalLikes = sumField(allBops, "likeCount");
  const totalTips = sumField(allBops, "tipCount");
  const totalBops = allBops.length;

  // Loading state
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
        <button
          onClick={() => navigate("/bops")}
          className="text-[#5DCCCC] underline text-sm"
        >
          Back to Boptone
        </button>
      </div>
    );
  }

  const artist = artistProfile!;
  const isOwner = user && artist.userId === (user as any).id;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Back button ── */}
      <div className="sticky top-0 z-30 px-4 pt-safe-top pt-4 pb-2 bg-black/80 backdrop-blur-sm flex items-center gap-3">
        <button
          onClick={() => navigate("/bops")}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <span className="text-sm font-semibold tracking-wide uppercase text-white/70">
          Boptone
        </span>
      </div>

      {/* ── Profile header ── */}
      <div className="flex flex-col items-center px-6 pt-6 pb-4 gap-4">

        {/* Circle profile photo */}
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full overflow-hidden border-[3px]"
            style={{ borderColor: artist.verifiedStatus ? "#5DCCCC" : "#333" }}
          >
            {artist.avatarUrl ? (
              <img
                src={artist.avatarUrl}
                alt={artist.stageName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-3xl font-bold text-white/40">
                  {artist.stageName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {artist.verifiedStatus && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#5DCCCC] fill-[#5DCCCC]" />
            </div>
          )}
        </div>

        {/* Name */}
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight">{artist.stageName}</h1>
          {artist.location && (
            <p className="text-sm text-white/50 mt-0.5">{artist.location}</p>
          )}
        </div>

        {/* Bio */}
        {artist.bio && (
          <p className="text-sm text-white/70 text-center max-w-xs leading-relaxed">
            {artist.bio}
          </p>
        )}

        {/* Genres */}
        {artist.genres && artist.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {artist.genres.slice(0, 4).map((genre) => (
              <span
                key={genre}
                className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/70 font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-8 mt-1">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg font-bold">{formatCount(totalBops)}</span>
            <span className="text-xs text-white/50 uppercase tracking-wider">Bops</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg font-bold">{formatCount(totalLikes)}</span>
            <span className="text-xs text-white/50 uppercase tracking-wider">Likes</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg font-bold">{formatCount(totalTips)}</span>
            <span className="text-xs text-white/50 uppercase tracking-wider">Tips</span>
          </div>
        </div>

        {/* ── Circle quick-link buttons ── */}
        <div className="flex items-center gap-6 mt-2">
          {/* Boptone Music */}
          <button
            onClick={() => navigate(`/music`)}
            className="flex flex-col items-center gap-1.5 group"
            aria-label="Boptone Music"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-[#5DCCCC]/20 group-hover:border-[#5DCCCC] transition-all">
              <Music className="w-6 h-6 text-white group-hover:text-[#5DCCCC] transition-colors" />
            </div>
            <span className="text-[10px] text-white/60 font-medium tracking-wide">Music</span>
          </button>

          {/* BopShop */}
          <button
            onClick={() => navigate(`/shop`)}
            className="flex flex-col items-center gap-1.5 group"
            aria-label="BopShop"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-[#5DCCCC]/20 group-hover:border-[#5DCCCC] transition-all">
              <ShoppingBag className="w-6 h-6 text-white group-hover:text-[#5DCCCC] transition-colors" />
            </div>
            <span className="text-[10px] text-white/60 font-medium tracking-wide">BopShop</span>
          </button>

          {/* Tip artist directly */}
          <button
            onClick={() => {
              // Navigate to the feed and find a Bop to tip
              navigate("/bops");
            }}
            className="flex flex-col items-center gap-1.5 group"
            aria-label="Tip Artist"
          >
            <div className="w-14 h-14 rounded-full bg-[#5DCCCC]/20 border border-[#5DCCCC]/40 flex items-center justify-center group-hover:bg-[#5DCCCC]/40 group-hover:border-[#5DCCCC] transition-all">
              <Zap className="w-6 h-6 text-[#5DCCCC]" />
            </div>
            <span className="text-[10px] text-[#5DCCCC]/80 font-medium tracking-wide">Tip</span>
          </button>
        </div>

        {/* Owner: Post a Bop CTA */}
        {isOwner && (
          <button
            onClick={() => navigate("/bops/upload")}
            className="mt-1 px-6 py-2.5 rounded-full bg-[#5DCCCC] text-black text-sm font-bold tracking-wide hover:bg-[#4ab8b8] transition-colors"
          >
            Post a Bop
          </button>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-white/10 mx-0" />

      {/* ── Section label ── */}
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
          Latest Bops
        </span>
        <span className="text-xs text-white/30">{formatCount(totalBops)} posts</span>
      </div>

      {/* ── Bops grid ── */}
      <div className="flex-1 px-0.5">
        {bopsLoading && allBops.length === 0 ? (
          // Skeleton grid
          <div className="grid grid-cols-3 gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-gray-900 animate-pulse" />
            ))}
          </div>
        ) : allBops.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 gap-4 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Play className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">
              {isOwner
                ? "You haven't posted any Bops yet. Share your first one."
                : "No Bops posted yet."}
            </p>
            {isOwner && (
              <button
                onClick={() => navigate("/bops/upload")}
                className="px-5 py-2 rounded-full bg-[#5DCCCC] text-black text-sm font-bold"
              >
                Post a Bop
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {allBops.map((bop) => (
              <BopThumbnail
                key={bop.id}
                bop={bop}
                onClick={() => {
                  // Navigate to the feed, deep-linking to this specific Bop
                  navigate(`/bops?start=${bop.id}`);
                }}
              />
            ))}
            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="col-span-3 h-12 flex items-center justify-center">
                {isFetching && (
                  <div className="w-6 h-6 border-2 border-[#5DCCCC] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom safe area spacer */}
      <div className="h-8" />
    </div>
  );
}
