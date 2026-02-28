/**
 * Artist Bops Profile — /bops/artist/:artistId
 *
 * BAP Protocol compliant: black borders, 4px brutalist shadows,
 * #0cc0df cyan primary buttons with black text, rounded-lg for all interactive elements.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
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
  UserPlus,
  UserCheck,
  Bell,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BOPS_LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/98208888/nTbKjjzazhRpeJn9kKuXdQ/bops_main_logo_black_f87d2efe.png";

/** BAP Protocol primary cyan */
const BAP_CYAN = "#0cc0df";
/** Trustworthy green for money/tip actions */
const TIP_GREEN = "#2D9E5F";
const TIP_YELLOW_BOLT = "#FFD600";
/** BAP brutalist shadow */
const BAP_SHADOW = "4px 4px 0px 0px rgba(0,0,0,1)";
const BAP_SHADOW_HOVER = "6px 6px 0px 0px rgba(0,0,0,1)";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function artistAccent(themeColor?: string | null): string {
  return themeColor || BAP_CYAN;
}

// ─── Tip presets ──────────────────────────────────────────────────────────────

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

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
      onClick={handleBackdrop}
    >
      {/* BAP Protocol modal: white bg, black border-4, 4px shadow */}
      <div
        className="w-full max-w-sm rounded-lg bg-white border-4 border-black overflow-hidden"
        style={{ boxShadow: BAP_SHADOW }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b-4 border-black">
          <div>
            <h2 className="text-black font-black text-xl tracking-tight">Tip Artist</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              100% goes to <span className="font-bold text-black">{artistName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 transition-colors"
            style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Amount presets */}
        <div className="px-6 pt-5 pb-4">
          <p className="text-black text-xs uppercase tracking-widest font-black mb-3">Choose amount</p>
          <div className="grid grid-cols-5 gap-2">
            {TIP_PRESETS.map(({ label, cents }) => (
              <button
                key={cents}
                onClick={() => setSelectedCents(cents)}
                className="py-2.5 rounded-lg text-sm font-black border-2 border-black transition-all"
                style={
                  selectedCents === cents
                    ? { background: TIP_GREEN, color: "#000", boxShadow: BAP_SHADOW }
                    : { background: "#fff", color: "#000", boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="px-6 pb-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-black" />
            <p className="text-black text-xs uppercase tracking-widest font-black">
              Message <span className="normal-case text-gray-400 font-normal">(optional)</span>
            </p>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 150))}
            placeholder={`Say something to ${artistName}…`}
            rows={2}
            className="w-full rounded-lg px-4 py-3 text-sm resize-none outline-none border-2 border-black focus:border-black text-black placeholder-gray-400 transition-colors"
            style={{ fontFamily: "inherit" }}
          />
          <p className="text-right text-[10px] text-gray-400 mt-1">{message.length}/150</p>
        </div>

        {/* Zero-fee callout */}
        <div className="mx-6 mb-4 px-3 py-2 rounded-lg border-2 border-black bg-[#0cc0df]/10">
          <p className="text-[11px] text-black text-center font-semibold">
            ⚡ Only card processing fees apply — Boptone takes <strong>0%</strong>
          </p>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={handleTip}
            disabled={createCheckout.isPending}
            className="w-full py-3.5 rounded-lg font-black text-base border-4 border-black transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              background: createCheckout.isPending ? "#aaa" : TIP_GREEN,
              color: "#000",
              boxShadow: createCheckout.isPending ? "none" : BAP_SHADOW,
            }}
          >
            <Zap className="w-4 h-4" style={{ color: TIP_YELLOW_BOLT, fill: TIP_YELLOW_BOLT }} />
            {createCheckout.isPending
              ? "Opening checkout…"
              : `Send ${TIP_PRESETS.find((p) => p.cents === selectedCents)?.label ?? ""} Tip`}
          </button>
          <p className="text-center text-gray-400 text-[11px] mt-2.5">
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

  // Vivid unique gradient per bop
  const hue = (bop.id * 47) % 360;
  const hue2 = (bop.id * 83 + 120) % 360;
  const placeholderGradient = `linear-gradient(160deg, hsl(${hue},55%,85%) 0%, hsl(${hue2},45%,92%) 100%)`;

  return (
    <button
      className="relative overflow-hidden cursor-pointer group border-2 border-black rounded-lg"
      style={{ aspectRatio: "9/16", background: "#f3f4f6", boxShadow: BAP_SHADOW }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      aria-label={bop.caption ?? "Watch Bop"}
    >
      {/* Thumbnail or vivid gradient placeholder */}
      {bop.thumbnailUrl ? (
        <img
          src={bop.thumbnailUrl}
          alt={bop.caption ?? "Bop"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: placeholderGradient }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/70 border-2 border-black">
              <Play className="w-5 h-5 fill-current text-black" />
            </div>
          </div>
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

      {/* Persistent bottom gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)" }}
      />

      {/* Hover: centered play ring */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.15s ease" }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#0cc0df] border-2 border-black"
          style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>
          <Play className="w-5 h-5 fill-current ml-0.5 text-black" />
        </div>
      </div>

      {/* Bottom: caption + stats */}
      <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 flex items-end justify-between gap-2">
        {bop.caption && (
          <p className="text-white text-[11px] leading-tight line-clamp-2 flex-1 text-left drop-shadow-md">
            {bop.caption}
          </p>
        )}
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-white/70" />
            <span className="text-white/90 text-[10px] font-semibold tabular-nums">{formatCount(bop.viewCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-white fill-white" />
            <span className="text-white text-[10px] font-semibold tabular-nums">{formatCount(bop.likeCount)}</span>
          </div>
        </div>
      </div>

      {/* Duration badge */}
      {bop.durationMs > 0 && (
        <div className="absolute top-2 right-2 bg-black/70 rounded px-1.5 py-0.5">
          <span className="text-white text-[10px] font-mono tabular-nums">{formatDuration(bop.durationMs)}</span>
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
  const [showTipModal, setShowTipModal] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const seenCursors = useRef<Set<string>>(new Set());

  const parsedArtistId = parseInt(artistId ?? "0", 10);

  // ── Follow state ──────────────────────────────────────────────────────────
  const utils = trpc.useUtils();
  const { data: followData } = trpc.bops.isFollowingArtist.useQuery(
    { artistId: parsedArtistId },
    { enabled: parsedArtistId > 0 }
  );
  const { data: followerData } = trpc.bops.getFollowerCount.useQuery(
    { artistId: parsedArtistId },
    { enabled: parsedArtistId > 0 }
  );
  const [optimisticFollowing, setOptimisticFollowing] = useState<boolean | null>(null);
  const isFollowing =
    optimisticFollowing !== null ? optimisticFollowing : (followData?.isFollowing ?? false);
  const followerCount =
    (followerData?.count ?? 0) +
    (optimisticFollowing === true && !followData?.isFollowing ? 1 : 0) +
    (optimisticFollowing === false && followData?.isFollowing ? -1 : 0);

  const followMutation = trpc.bops.followArtist.useMutation({
    onMutate: () => setOptimisticFollowing(true),
    onError: () => { setOptimisticFollowing(null); toast.error("Could not follow artist"); },
    onSuccess: () => {
      utils.bops.isFollowingArtist.invalidate({ artistId: parsedArtistId });
      utils.bops.getFollowerCount.invalidate({ artistId: parsedArtistId });
    },
  });
  const unfollowMutation = trpc.bops.unfollowArtist.useMutation({
    onMutate: () => setOptimisticFollowing(false),
    onError: () => { setOptimisticFollowing(null); toast.error("Could not unfollow artist"); },
    onSuccess: () => {
      utils.bops.isFollowingArtist.invalidate({ artistId: parsedArtistId });
      utils.bops.getFollowerCount.invalidate({ artistId: parsedArtistId });
    },
  });

  function handleFollowToggle() {
    if (!user) { toast.info("Sign in to follow artists"); return; }
    if (isFollowing) {
      unfollowMutation.mutate({ artistId: parsedArtistId });
    } else {
      followMutation.mutate({ artistId: parsedArtistId });
      toast.success(`Following ${artistProfile?.stageName ?? "artist"}!`);
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tipStatus = params.get("tip");
    const amount = params.get("amount");
    if (tipStatus === "success" && amount) {
      toast.success(`Tip sent! $${amount} is on its way to the artist.`, { duration: 6000 });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (tipStatus === "cancelled") {
      toast.info("Tip cancelled — no charge was made.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: artistProfile, isLoading: profileLoading } = trpc.artistProfile.getById.useQuery(
    { id: parsedArtistId },
    { enabled: parsedArtistId > 0 }
  );

  const { data: bopsData, isLoading: bopsLoading, isFetching } = trpc.bops.getByArtist.useQuery(
    { artistId: parsedArtistId, limit: 24, cursor },
    { enabled: parsedArtistId > 0 }
  );

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

  const totalLikes = sumField(allBops, "likeCount");
  const totalViews = sumField(allBops, "viewCount");

  // ── Loading ───────────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div
          className="w-10 h-10 border-4 border-black border-t-[#0cc0df] rounded-full animate-spin"
        />
      </div>
    );
  }

  if (!artistProfile && !profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-lg font-black text-black">Artist not found</p>
        <button
          onClick={() => navigate("/bops")}
          className="px-5 py-2 rounded-lg font-bold text-sm border-2 border-black bg-[#0cc0df] text-black"
          style={{ boxShadow: BAP_SHADOW }}
        >
          Back to Bops
        </button>
      </div>
    );
  }

  const artist = artistProfile!;
  const isOwner = user && (artist as any).userId === (user as any).id;
  const avatarAccent = artistAccent(artist.themeColor);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Tip Modal ── */}
      {showTipModal && (
        <TipArtistModal
          artistId={parsedArtistId}
          artistName={artist.stageName}
          onClose={() => setShowTipModal(false)}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          BOPS HEADER — big logo on white, BAP border bottom
      ══════════════════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-40 bg-white flex items-center justify-between px-4 border-b-4 border-black"
        style={{ height: "72px" }}
      >
        {/* Back arrow — BAP secondary button */}
        <button
          onClick={() => navigate("/bops")}
          className="w-9 h-9 rounded-lg flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 transition-colors"
          style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
          aria-label="Back to Bops"
        >
          <ArrowLeft className="w-4 h-4 text-black" />
        </button>

        {/* Big Bops logo — centered */}
        <Link href="/bops">
          <img
            src={BOPS_LOGO_URL}
            alt="Bops"
            className="cursor-pointer"
            style={{ height: "44px", width: "auto", objectFit: "contain" }}
          />
        </Link>

        {/* Notifications bell — BAP secondary button */}
        <button
          onClick={() => navigate("/bops/notifications")}
          className="w-9 h-9 rounded-lg flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 transition-colors"
          style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
          aria-label="Bops notifications"
        >
          <Bell className="w-4 h-4 text-black" />
        </button>
      </header>

      {/* Spacer below header */}
      <div className="h-8" />

      {/* ══════════════════════════════════════════════════════════════════════
          ARTIST HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-7">

          {/* Avatar — rounded-full per BAP (circular elements only) */}
          <div className="relative shrink-0">
            <div
              className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-gray-100 border-4 border-black"
              style={{ boxShadow: BAP_SHADOW }}
            >
              {artist.avatarUrl ? (
                <img src={artist.avatarUrl} alt={artist.stageName} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `${avatarAccent}20` }}
                >
                  <span className="text-5xl font-black text-black">
                    {artist.stageName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {artist.verifiedStatus && (
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center bg-[#0cc0df] border-2 border-black"
                style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
              >
                <CheckCircle className="w-4 h-4 text-black" />
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 flex flex-col items-center md:items-start gap-2 pb-1">
            <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-start">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none text-black">
                {artist.stageName}
              </h1>
              {artist.verifiedStatus && (
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider border-2 border-black bg-[#0cc0df] text-black"
                  style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
                >
                  Verified
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              {artist.location && <span className="text-gray-500 text-sm font-medium">{artist.location}</span>}
              {artist.genres && artist.genres.length > 0 && (
                <>
                  {artist.location && <span className="text-gray-300">·</span>}
                  {artist.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="text-xs px-2.5 py-0.5 rounded-lg font-bold border-2 border-black bg-white text-black"
                      style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
                    >
                      {genre}
                    </span>
                  ))}
                </>
              )}
            </div>

            {artist.bio && (
              <p className="text-gray-600 text-sm leading-relaxed max-w-md text-center md:text-left">
                {artist.bio}
              </p>
            )}
          </div>
        </div>

        {/* ── Stats row — BAP card: white bg, black border-4, 4px shadow ── */}
        <div
          className="mt-6 flex items-center rounded-lg border-4 border-black bg-white overflow-hidden"
          style={{ boxShadow: BAP_SHADOW }}
        >
          {[
            { value: formatCount(allBops.length), label: "Bops" },
            { value: formatCount(totalViews), label: "Views" },
            { value: formatCount(totalLikes), label: "Likes" },
            { value: formatCount(followerCount), label: "Followers" },
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              className="flex-1 flex flex-col items-center py-4 gap-0.5"
              style={{ borderRight: i < arr.length - 1 ? "4px solid #000" : "none" }}
            >
              <span
                className="text-2xl md:text-3xl font-black tabular-nums leading-none"
                style={{ color: stat.label === "Followers" ? BAP_CYAN : "#000" }}
              >
                {stat.value}
              </span>
              <span className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Action pills — BAP Protocol buttons ── */}
        <div className="mt-4 flex items-center gap-2.5 flex-wrap justify-center md:justify-start pb-6">

          {/* Follow — hidden for owner */}
          {!isOwner && (
            <button
              onClick={handleFollowToggle}
              disabled={followMutation.isPending || unfollowMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-black text-sm border-4 border-black transition-all disabled:opacity-60"
              style={
                isFollowing
                  ? { background: "#fff", color: "#000", boxShadow: BAP_SHADOW }
                  : { background: BAP_CYAN, color: "#000", boxShadow: BAP_SHADOW }
              }
            >
              {isFollowing
                ? <><UserCheck className="w-4 h-4" /> Following</>
                : <><UserPlus className="w-4 h-4" /> Follow</>}
            </button>
          )}

          {/* Tip Artist — trustworthy green, yellow bolt */}
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-black text-sm border-4 border-black transition-all"
            style={{ background: TIP_GREEN, color: "#000", boxShadow: BAP_SHADOW }}
            onClick={() => setShowTipModal(true)}
          >
            <Zap className="w-4 h-4" style={{ color: TIP_YELLOW_BOLT, fill: TIP_YELLOW_BOLT }} />
            Tip Artist
          </button>

          {/* BopMusic */}
          <button
            onClick={() => navigate("/music")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm border-4 border-black bg-white text-black transition-all"
            style={{ boxShadow: BAP_SHADOW }}
          >
            <Music className="w-4 h-4" />
            BopMusic
          </button>

          {/* BopShop */}
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm border-4 border-black bg-white text-black transition-all"
            style={{ boxShadow: BAP_SHADOW }}
          >
            <ShoppingBag className="w-4 h-4" />
            BopShop
          </button>

          {/* Owner: Post a Bop */}
          {isOwner && (
            <button
              onClick={() => navigate("/bops/upload")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-black text-sm border-4 border-black"
              style={{ background: BAP_CYAN, color: "#000", boxShadow: BAP_SHADOW }}
            >
              <Plus className="w-4 h-4" />
              Post a Bop
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          GRID SECTION HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        className="max-w-5xl mx-auto px-5 pt-2 pb-3 flex items-center justify-between border-t-4 border-black"
      >
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-black" />
          <span className="text-xs font-black uppercase tracking-widest text-black">
            Latest Bops
          </span>
        </div>
        <span className="text-xs tabular-nums font-bold text-gray-400">
          {formatCount(allBops.length)} videos
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          VIDEO GRID
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-5 pb-20">
        {bopsLoading && allBops.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg bg-gray-100 border-2 border-black"
                style={{ aspectRatio: "9/16" }}
              />
            ))}
          </div>
        ) : allBops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
            <div
              className="w-20 h-20 rounded-lg flex items-center justify-center border-4 border-black bg-white"
              style={{ boxShadow: BAP_SHADOW }}
            >
              <Video className="w-9 h-9 text-black" />
            </div>
            <div>
              <p className="text-black text-base font-black mb-1">
                {isOwner ? "You haven't posted any Bops yet." : "No Bops posted yet."}
              </p>
              <p className="text-gray-500 text-sm">
                {isOwner ? "Share your first video with the world." : "Check back soon."}
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => navigate("/bops/upload")}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm border-4 border-black bg-[#0cc0df] text-black"
                style={{ boxShadow: BAP_SHADOW }}
              >
                <Plus className="w-4 h-4" />
                Post a Bop
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allBops.map((bop) => (
                <BopGridCard
                  key={bop.id}
                  bop={bop}
                  onClick={() => navigate(`/bops?start=${bop.id}`)}
                />
              ))}
            </div>

            {hasMore && (
              <div ref={sentinelRef} className="h-16 flex items-center justify-center mt-4">
                {isFetching && (
                  <div className="w-6 h-6 border-4 border-black border-t-[#0cc0df] rounded-full animate-spin" />
                )}
              </div>
            )}

            {!hasMore && allBops.length > 0 && (
              <div className="flex items-center justify-center py-8 gap-3">
                <div className="h-1 flex-1 bg-black" />
                <span className="text-black text-xs uppercase tracking-widest font-black px-3">All Bops loaded</span>
                <div className="h-1 flex-1 bg-black" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
