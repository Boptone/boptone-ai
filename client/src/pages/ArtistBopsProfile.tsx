/**
 * Artist Bops Profile — /bops/artist/:artistId
 *
 * White/light background, own Bops header with the big logo.
 * No global marketing nav.
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

const BOPS_LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/98208888/nTbKjjzazhRpeJn9kKuXdQ/bops_main_logo_black_f87d2efe.png";

// Boptone brand cyan — single source of truth for all accent usage on this page
const BOPTONE_CYAN = "#5DCCCC";
// Tip pill: trustworthy green
const TIP_GREEN = "#2D9E5F";
const TIP_GREEN_LIGHT = "#E8F7EF";
const TIP_YELLOW_BOLT = "#FFD600";

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

function artistAccent(themeColor?: string | null): string {
  return themeColor || BOPTONE_CYAN;
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

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden bg-white"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-gray-900 font-black text-xl tracking-tight">Tip Artist</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              100% goes to <span className="font-semibold" style={{ color: "#00AACC" }}>{artistName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="h-px mx-6 bg-gray-100" />
        <div className="px-6 pt-5 pb-4">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">Choose amount</p>
          <div className="grid grid-cols-5 gap-2">
            {TIP_PRESETS.map(({ label, cents }) => (
              <button
                key={cents}
                onClick={() => setSelectedCents(cents)}
                className="py-2.5 rounded-xl text-sm font-bold transition-all"
                style={
                  selectedCents === cents
                    ? { background: "#00AACC", color: "#fff", boxShadow: "0 4px 16px rgba(0,170,204,0.35)" }
                    : { background: "#f3f4f6", color: "#374151" }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="px-6 pb-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-gray-300" />
            <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">
              Message <span className="normal-case text-gray-300">(optional)</span>
            </p>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 150))}
            placeholder={`Say something to ${artistName}…`}
            rows={2}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none border border-gray-200 focus:border-[#00AACC] text-gray-700 placeholder-gray-300 transition-colors"
            style={{ fontFamily: "inherit" }}
          />
          <p className="text-right text-[10px] text-gray-300 mt-1">{message.length}/150</p>
        </div>
        <div className="mx-6 mb-4 px-3 py-2 rounded-lg bg-cyan-50 border border-cyan-100">
          <p className="text-[11px] text-cyan-600 text-center">
            ⚡ Only card processing fees apply — Boptone takes <strong>0%</strong>
          </p>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={handleTip}
            disabled={createCheckout.isPending}
            className="w-full py-3.5 rounded-full font-black text-base transition-all disabled:opacity-60 text-white"
            style={{
              background: createCheckout.isPending ? "#7dd3e8" : "#00AACC",
              boxShadow: createCheckout.isPending ? "none" : "0 4px 20px rgba(0,170,204,0.3)",
            }}
          >
            {createCheckout.isPending
              ? "Opening checkout…"
              : `Send ${TIP_PRESETS.find((p) => p.cents === selectedCents)?.label ?? ""} Tip ⚡`}
          </button>
          <p className="text-center text-gray-300 text-[11px] mt-2.5">
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
  accentColor: string;
  onClick: () => void;
}

function BopGridCard({ bop, accentColor, onClick }: BopGridCardProps) {
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
      className="relative overflow-hidden cursor-pointer group"
      style={{ aspectRatio: "9/16", background: "#f3f4f6", borderRadius: "8px" }}
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
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/60"
            >
              <Play className="w-5 h-5 fill-current" style={{ color: BOPTONE_CYAN }} />
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
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm"
        >
          <Play className="w-5 h-5 fill-current ml-0.5" style={{ color: BOPTONE_CYAN }} />
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
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded px-1.5 py-0.5">
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
      toast.success(`⚡ $${amount} tip sent! The artist will receive it shortly.`, { duration: 6000 });
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
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${BOPTONE_CYAN} transparent transparent transparent` }} />
      </div>
    );
  }

  if (!artistProfile && !profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-lg font-semibold text-gray-800">Artist not found</p>
        <button onClick={() => navigate("/bops")} className="underline text-sm" style={{ color: BOPTONE_CYAN }}>
          Back to Bops
        </button>
      </div>
    );
  }

  const artist = artistProfile!;
  const isOwner = user && (artist as any).userId === (user as any).id;
  // Always use Boptone cyan for all UI chrome; artist themeColor only used for avatar ring
  const accent = BOPTONE_CYAN;
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
          BOPS HEADER — big logo on white, back arrow, bell
      ══════════════════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-40 bg-white flex items-center justify-between px-4"
        style={{
          height: "72px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        {/* Back arrow */}
        <button
          onClick={() => navigate("/bops")}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Back to Bops"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
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

        {/* Notifications bell */}
        <button
          onClick={() => navigate("/bops/notifications")}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Bops notifications"
        >
          <Bell className="w-4 h-4 text-gray-700" />
        </button>
      </header>

      {/* No cover banner — clean white from header straight into profile */}
      <div className="h-8" />

      {/* ══════════════════════════════════════════════════════════════════════
          ARTIST HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-5 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-7">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-gray-100"
              style={{
                border: `3px solid ${avatarAccent}`,
                boxShadow: `0 0 0 4px white, 0 4px 24px rgba(0,0,0,0.10)`,
              }}
            >
              {artist.avatarUrl ? (
                <img src={artist.avatarUrl} alt={artist.stageName} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
              style={{ background: `${avatarAccent}18` }}
            >
              <span className="text-5xl font-black" style={{ color: avatarAccent }}>
                    {artist.stageName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {artist.verifiedStatus && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center bg-white">
                <CheckCircle className="w-6 h-6" style={{ color: avatarAccent }} />
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 flex flex-col items-center md:items-start gap-2 pb-1">
            <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-start">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none text-gray-900">{artist.stageName}</h1>
              {artist.verifiedStatus && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: `${BOPTONE_CYAN}14`, color: BOPTONE_CYAN, border: `1px solid ${BOPTONE_CYAN}40` }}
                >
                  Verified
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              {artist.location && <span className="text-gray-400 text-sm">{artist.location}</span>}
              {artist.genres && artist.genres.length > 0 && (
                <>
                  {artist.location && <span className="text-gray-200">·</span>}
                  {artist.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                      style={{ background: `${BOPTONE_CYAN}12`, color: BOPTONE_CYAN, border: `1px solid ${BOPTONE_CYAN}30` }}
                    >
                      {genre}
                    </span>
                  ))}
                </>
              )}
            </div>

            {artist.bio && (
              <p className="text-gray-500 text-sm leading-relaxed max-w-md text-center md:text-left">
                {artist.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div
          className="mt-6 flex items-center rounded-2xl overflow-hidden"
          style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
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
              style={{ borderRight: i < arr.length - 1 ? "1px solid #e5e7eb" : "none" }}
            >
              <span
                className="text-2xl md:text-3xl font-black tabular-nums leading-none"
                style={{ color: stat.label === "Followers" ? BOPTONE_CYAN : "#111827" }}
              >
                {stat.value}
              </span>
              <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Action pills */}
        <div className="mt-4 flex items-center gap-2.5 flex-wrap justify-center md:justify-start pb-6">
          {/* Follow — hidden for owner */}
          {!isOwner && (
            <button
              onClick={handleFollowToggle}
              disabled={followMutation.isPending || unfollowMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all disabled:opacity-60"
              style={
                isFollowing
                  ? { background: `${BOPTONE_CYAN}18`, color: BOPTONE_CYAN, border: `1px solid ${BOPTONE_CYAN}50` }
                  : { background: BOPTONE_CYAN, color: "#000", boxShadow: `0 4px 16px ${BOPTONE_CYAN}40` }
              }
            >
              {isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
            </button>
          )}

          {/* Tip Artist — trustworthy green, black text, yellow bolt */}
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all"
            style={{ background: TIP_GREEN, color: "#000", boxShadow: "0 4px 16px rgba(45,158,95,0.28)" }}
            onClick={() => setShowTipModal(true)}
          >
            <Zap className="w-4 h-4" style={{ color: TIP_YELLOW_BOLT, fill: TIP_YELLOW_BOLT }} />
            Tip Artist
          </button>

          {/* BopMusic */}
          <button
            onClick={() => navigate("/music")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-colors"
            style={{ background: `${BOPTONE_CYAN}14`, color: BOPTONE_CYAN, border: `1px solid ${BOPTONE_CYAN}40` }}
          >
            <Music className="w-4 h-4" />
            BopMusic
          </button>

          {/* BopShop */}
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-colors"
            style={{ background: `${BOPTONE_CYAN}14`, color: BOPTONE_CYAN, border: `1px solid ${BOPTONE_CYAN}40` }}
          >
            <ShoppingBag className="w-4 h-4" />
            BopShop
          </button>

          {/* Owner: Post a Bop */}
          {isOwner && (
            <button
              onClick={() => navigate("/bops/upload")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm"
              style={{ background: BOPTONE_CYAN, color: "#000", border: `1px solid ${BOPTONE_CYAN}` }}
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
        className="max-w-5xl mx-auto px-5 pt-2 pb-3 flex items-center justify-between"
        style={{ borderTop: "1px solid #f0f0f0" }}
      >
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4" style={{ color: BOPTONE_CYAN }} />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Latest Bops
          </span>
        </div>
        <span className="text-xs tabular-nums text-gray-300">
          {formatCount(allBops.length)} videos
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          VIDEO GRID
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-5 pb-20">
        {bopsLoading && allBops.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg bg-gray-100"
                style={{ aspectRatio: "9/16" }}
              />
            ))}
          </div>
        ) : allBops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: `${BOPTONE_CYAN}10`, border: `1px solid ${BOPTONE_CYAN}20` }}
            >
              <Video className="w-9 h-9" style={{ color: `${BOPTONE_CYAN}80` }} />
            </div>
            <div>
              <p className="text-gray-600 text-base font-semibold mb-1">
                {isOwner ? "You haven't posted any Bops yet." : "No Bops posted yet."}
              </p>
              <p className="text-gray-400 text-sm">
                {isOwner ? "Share your first video with the world." : "Check back soon."}
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => navigate("/bops/upload")}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm"
                style={{ background: BOPTONE_CYAN, color: "#000" }}
              >
                <Plus className="w-4 h-4" />
                Post a Bop
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {allBops.map((bop) => (
                <BopGridCard
                  key={bop.id}
                  bop={bop}
                  accentColor={accent}
                  onClick={() => navigate(`/bops?start=${bop.id}`)}
                />
              ))}
            </div>

            {hasMore && (
              <div ref={sentinelRef} className="h-16 flex items-center justify-center mt-4">
                {isFetching && (
                  <div
                    className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: `${BOPTONE_CYAN} transparent transparent transparent` }}
                  />
                )}
              </div>
            )}

            {!hasMore && allBops.length > 0 && (
              <div className="flex items-center justify-center py-8 gap-3">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-gray-300 text-xs uppercase tracking-widest font-medium">All Bops loaded</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
