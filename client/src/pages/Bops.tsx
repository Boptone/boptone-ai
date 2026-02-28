/**
 * Bops Feed Page — /bops
 *
 * Full-screen vertical video feed. Mobile-only experience.
 * - CSS scroll-snap for native swipe-up feel
 * - IntersectionObserver tracks which card is active (≥60% visible)
 * - Infinite scroll via cursor-based pagination
 * - Desktop users see a mobile-only gate with QR/link
 * - Shared mute state across all videos (one toggle controls all)
 */
import { useRef, useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Plus, Bell } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import BopsVideoPlayer, { type BopItem } from "@/components/BopsVideoPlayer";

export default function Bops() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true); // Start muted (browser autoplay policy)
  const [allBops, setAllBops] = useState<BopItem[]>([]);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // ── Fetch first page ───────────────────────────────────────────────────
  const { data: firstPage, isLoading } = trpc.bops.getFeed.useQuery(
    { limit: 10 },
    { staleTime: 30_000 }
  );

  useEffect(() => {
    if (firstPage?.items) {
      setAllBops(firstPage.items as BopItem[]);
      setCursor(firstPage.nextCursor);
      setHasNextPage(firstPage.hasNextPage);
    }
  }, [firstPage]);

  // ── Fetch more (infinite scroll) ──────────────────────────────────────
  const utils = trpc.useUtils();

  const fetchMore = useCallback(async () => {
    if (!hasNextPage || isFetchingMore || !cursor) return;
    setIsFetchingMore(true);
    try {
      const result = await utils.bops.getFeed.fetch({ cursor, limit: 10 });
      setAllBops((prev) => [...prev, ...(result.items as BopItem[])]);
      setCursor(result.nextCursor);
      setHasNextPage(result.hasNextPage);
    } finally {
      setIsFetchingMore(false);
    }
  }, [hasNextPage, isFetchingMore, cursor, utils]);

  // ── IntersectionObserver: track active card ────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setActiveIndex(index);
            // Fetch more when 2 cards from the end
            if (index >= allBops.length - 2) {
              fetchMore();
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    const cards = container.querySelectorAll("[data-index]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [allBops.length, fetchMore]);

  // ── Keyboard navigation (desktop testing) ─────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") setActiveIndex((i) => Math.min(i + 1, allBops.length - 1));
      if (e.key === "ArrowUp") setActiveIndex((i) => Math.max(i - 1, 0));
      if (e.key === " ") e.preventDefault(); // prevent page scroll on space
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [allBops.length]);

  // ── Loading statee ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5DCCCC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────
  if (!allBops.length) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "#5DCCCC" }}
        >
          <Plus className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">No Bops yet</h2>
        <p className="text-white/50 text-sm mb-6">
          Be the first artist to post a Bop.
        </p>
        {isAuthenticated ? (
          <button
            onClick={() => navigate("/bops/upload")}
            className="px-6 py-3 rounded-full font-semibold text-black text-sm"
            style={{ background: "#5DCCCC" }}
          >
            Post a Bop
          </button>
        ) : (
          <button
            onClick={() => { window.location.href = getLoginUrl(); }}
            className="px-6 py-3 rounded-full font-semibold text-black text-sm"
            style={{ background: "#5DCCCC" }}
          >
            Sign in to post
          </button>
        )}
      </div>
    );
  }

  // ── Main feed ──────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Upload button — top right */}
      {isAuthenticated && (
        <button
          onClick={() => navigate("/bops/upload")}
          className="absolute top-4 left-4 z-40 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5"
          aria-label="Post a Bop"
        >
          <Plus className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-semibold">Post</span>
        </button>
      )}

      {/* Boptone wordmark — top center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <span className="text-white font-black text-sm tracking-widest uppercase drop-shadow-lg">
          BOPTONE
        </span>
      </div>

      {/* Notifications bell — top right */}
      {isAuthenticated && (
        <button
          onClick={() => navigate("/bops/notifications")}
          className="absolute top-4 right-4 z-40 bg-black/40 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center"
          aria-label="Bops Notifications"
        >
          <Bell className="w-4 h-4 text-white" />
        </button>
      )}

      {/* Scroll container — CSS scroll-snap */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll"
        style={{
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {allBops.map((bop, index) => (
          <div
            key={bop.id}
            data-index={index}
            className="w-full relative"
            style={{
              height: "100dvh",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
          >
            <BopsVideoPlayer
              bop={bop}
              isActive={activeIndex === index}
              isMuted={isMuted}
              onMuteToggle={() => setIsMuted((m) => !m)}
            />
          </div>
        ))}

        {/* Loading more indicator */}
        {isFetchingMore && (
          <div
            className="w-full flex items-center justify-center"
            style={{ height: "100dvh", scrollSnapAlign: "start" }}
          >
            <div className="w-8 h-8 border-2 border-[#5DCCCC] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* End of feed */}
        {!hasNextPage && allBops.length > 0 && (
          <div
            className="w-full flex flex-col items-center justify-center gap-4"
            style={{ height: "100dvh", scrollSnapAlign: "start" }}
          >
            <p className="text-white/40 text-sm">You have seen all Bops.</p>
            {isAuthenticated && (
              <button
                onClick={() => navigate("/bops/upload")}
                className="px-6 py-3 rounded-full font-semibold text-black text-sm"
                style={{ background: "#5DCCCC" }}
              >
                Post a Bop
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
