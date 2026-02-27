/**
 * Artist Bops Profile — /bops/artist/:artistId
 *
 * Desktop-first layout inspired by TikTok/Instagram Reels profile pages:
 * - Full-width artist header with cover gradient, avatar, stats, and action buttons
 * - 4-column responsive video grid (4 col desktop → 3 col tablet → 2 col mobile)
 * - Each card: 9:16 aspect ratio, video preview on hover, stats overlay
 * - Infinite scroll pagination
 * - Tip Artist modal → Stripe Checkout (Kick In: card fees only, Boptone takes 0%)
 * - Respects system dark/light mode via prefers-color-scheme
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
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
  X,
  MessageSquare,
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

// ─── Tip presets ─────────────────────────────────────────────────────────────

const TIP_PRESETS = [
  { label: "$1", cents: 100 },
  { label: "$5", cents: 500 },
  { label: "$10", cents: 1000 },
  { label: "$20", cents: 2000 },
  { label: "$50", cents: 5000 },
] as const;

type TipCents = typeof TIP_PRESETS[number]["cents"];

// ─── Tip Artist Modal ─────────────────────────────────────────────────────────

interface TipModalProps {
  artistId: number;
  artistName: string;
  onClose: () => void;
}

function TipArtistModal({ artistId, artistName, onClose }: TipModalProps) {
  const [selectedCents, setSelectedCents] = useState<TipCents>(500);
  const [message, setMessage] = useState("");

  const createCheckout = trpc.bops.createTipCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.info("Redirecting to secure checkout…");
        window.open(data.checkoutUrl, "_blank");
        onClose();
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to start checkout. Please try again.");
    },
  });

  const handleTip = () => {
    createCheckout.mutate({
      artistId,
      artistName,
      amountCents: selectedCents,
      message: message.trim() || undefined,
    });
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "#111827",
          border: "1px solid rgba(93,204,204,0.2)",
          boxShadow: "0 0 60px rgba(93,204,204,0.12)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-white font-black text-xl tracking-tight">Tip Artist</h2>
            <p className="text-white/50 text-sm mt-0.5">
              100% goes to <span className="text-[#5DCCCC] font-semibold">{artistName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px mx-6" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Amount presets */}
        <div className="px-6 pt-5 pb-4">
          <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">Choose amount</p>
          <div className="grid grid-cols-5 gap-2">
            {TIP_PRESETS.map(({ label, cents }) => (
              <button
                key={cents}
                onClick={() => setSelectedCents(cents)}
                className="py-2.5 rounded-xl text-sm font-bold transition-all"
                style={
                  selectedCents === cents
                    ? { background: "#5DCCCC", color: "#000", boxShadow: "0 0 16px rgba(93,204,204,0.4)" }
                    : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Message field */}
        <div className="px-6 pb-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-white/30" />
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">
              Message <span className="normal-case text-white/25">(optional)</span>
            </p>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 150))}
            placeholder={`Say something to ${artistName}…`}
            rows={2}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.8)",
              fontFamily: "inherit",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(93,204,204,0.4)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          />
          <p className="text-right text-[10px] text-white/20 mt-1">{message.length}/150</p>
        </div>

        {/* Fee note */}
        <div className="mx-6 mb-4 px-3 py-2 rounded-lg" style={{ background: "rgba(93,204,204,0.06)", border: "1px solid rgba(93,204,204,0.12)" }}>
          <p className="text-[11px] text-[#5DCCCC]/70 text-center">
            ⚡ Only card processing fees apply — Boptone takes <strong className="text-[#5DCCCC]">0%</strong>
          </p>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={handleTip}
            disabled={createCheckout.isPending}
            className="w-full py-3.5 rounded-full font-black text-base transition-all disabled:opacity-60"
            style={{
              background: createCheckout.isPending ? "rgba(93,204,204,0.5)" : "#5DCCCC",
              color: "#000",
              boxShadow: createCheckout.isPending ? "none" : "0 4px 24px rgba(93,204,204,0.3)",
            }}
          >
            {createCheckout.isPending
              ? "Opening checkout…"
              : `Send ${TIP_PRESETS.find((p) => p.cents === selectedCents)?.label ?? ""} Tip ⚡`}
          </button>
          <p className="text-center text-white/25 text-[11px] mt-2.5">
            Powered by Stripe · Secure payment
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Video Grid Card ──────────────────────────────────────────────────────────

interface BopGridCardProps {
  bop: BopVideo;
  onClick: () => void;
}

function BopGridCard({ bop, onClick }: BopGridCardProps) {
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
      className="relative overflow-hidden rounded-sm cursor-pointer group"
      style={{ aspectRatio: "9/16", background: "#111" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      aria-label={bop.caption ?? "Watch Bop"}
    >
      {/* Thumbnail or video */}
      {bop.thumbnailUrl ? (
        <img
          src={bop.thumbnailUrl}
          alt={bop.caption ?? "Bop"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#1a1a1a" }}>
          <Video className="w-8 h-8 text-white/15" />
        </div>
      )}

      {/* Hover video preview */}
      <video
        ref={videoRef}
        src={bop.videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.2s ease" }}
        muted
        playsInline
        loop
        preload="none"
      />

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
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [allBops, setAllBops] = useState<BopVideo[]>([]);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [showTipModal, setShowTipModal] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const seenCursors = useRef<Set<string>>(new Set());

  const parsedArtistId = parseInt(artistId ?? "0", 10);

  // Handle tip success/cancel from Stripe redirect URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tipStatus = params.get("tip");
    const amount = params.get("amount");
    if (tipStatus === "success" && amount) {
      toast.success(`⚡ $${amount} tip sent! The artist will receive it shortly.`, { duration: 6000 });
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (tipStatus === "cancelled") {
      toast.info("Tip cancelled — no charge was made.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const key = String(cursor ?? "init");
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
    <div className="min-h-screen text-white" style={{ fontFamily: "'Inter', sans-serif", background: "#0d1117", colorScheme: "dark" }}>

      {/* ── Tip Artist Modal ── */}
      {showTipModal && (
        <TipArtistModal
          artistId={parsedArtistId}
          artistName={artist.stageName}
          onClose={() => setShowTipModal(false)}
        />
      )}

      {/* ── Breadcrumb bar (below global nav) ── */}
      <div className="border-b border-white/5" style={{ background: "rgba(13,17,23,0.95)" }}>
        <div className="max-w-6xl mx-auto px-4 h-11 flex items-center gap-3">
          <button
            onClick={() => navigate("/bops")}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Back to Bops"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs font-medium">Bops</span>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-white/70 text-xs font-semibold">{artist.stageName}</span>
          </div>
        </div>
      </div>

      {/* ── Hero header ── */}
      <div
        className="relative"
        style={{
          background: "#0d1117",
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
                {/* Tip button — primary CTA — opens modal */}
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all"
                  style={{ background: "#5DCCCC", color: "#000", boxShadow: "0 4px 20px rgba(93,204,204,0.25)" }}
                  onClick={() => setShowTipModal(true)}
                >
                  <Zap className="w-4 h-4" />
                  Tip Artist
                </button>

                {/* BopMusic */}
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
                  BopMusic
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
