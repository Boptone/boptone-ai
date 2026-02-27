/**
 * BopsActionButtons
 *
 * Right-rail action buttons for the Bops video player.
 * Stacked vertically: Like → Tip (lightning) → Comment → Share
 *
 * Like:    Optimistic UI, animated heart, requires auth
 * Tip:     Slide-up modal with $1/$5/$10 presets, requires auth
 * Comment: Slide-up drawer with comment list + input, requires auth to post
 * Share:   Native Web Share API, falls back to clipboard copy
 */
import { useState, useCallback } from "react";
import { Heart, Zap, MessageCircle, Share2, X, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { BopItem } from "./BopsVideoPlayer";

interface BopsActionButtonsProps {
  bop: BopItem;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

// ── Tip amounts in cents ───────────────────────────────────────────────────
const TIP_PRESETS = [
  { label: "$1", cents: 100 },
  { label: "$5", cents: 500 },
  { label: "$10", cents: 1000 },
] as const;

export default function BopsActionButtons({
  bop,
  isAuthenticated,
  onAuthRequired,
}: BopsActionButtonsProps) {
  // ── Local state ────────────────────────────────────────────────────────────
  const [likeCount, setLikeCount] = useState(bop.likeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [commentCount, setCommentCount] = useState(bop.commentCount);
  const [showComments, setShowComments] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isTipping, setIsTipping] = useState(false);

  // ── tRPC mutations ─────────────────────────────────────────────────────────
  const toggleLike = trpc.bops.toggleLike.useMutation({
    onMutate: () => {
      // Optimistic update
      if (isLiked) {
        setLikeCount((c) => Math.max(0, c - 1));
        setIsLiked(false);
      } else {
        setLikeCount((c) => c + 1);
        setIsLiked(true);
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 600);
      }
    },
    onError: () => {
      // Rollback
      if (isLiked) {
        setLikeCount((c) => c + 1);
        setIsLiked(true);
      } else {
        setLikeCount((c) => Math.max(0, c - 1));
        setIsLiked(false);
      }
      toast.error("Could not update like. Try again.");
    },
  });

  const postComment = trpc.bops.postComment.useMutation({
    onSuccess: () => {
      setCommentText("");
      setCommentCount((c) => c + 1);
      toast.success("Comment posted.");
    },
    onError: () => toast.error("Could not post comment."),
  });

  const { data: comments, refetch: refetchComments } = trpc.bops.getComments.useQuery(
    { videoId: bop.id },
    { enabled: showComments }
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLike = useCallback(() => {
    if (!isAuthenticated) { onAuthRequired(); return; }
    toggleLike.mutate({ videoId: bop.id });
  }, [isAuthenticated, bop.id, toggleLike, onAuthRequired]);

  const handleTip = useCallback(() => {
    if (!isAuthenticated) { onAuthRequired(); return; }
    setShowTip(true);
  }, [isAuthenticated, onAuthRequired]);

  const handleComment = useCallback(() => {
    setShowComments(true);
    refetchComments();
  }, [refetchComments]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/bops/${bop.id}`;
    const shareData = {
      title: bop.artistName ? `${bop.artistName} on Boptone` : "Boptone",
      text: bop.caption ?? "Check out this Bop on Boptone",
      url,
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled — no error needed
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard.");
    }
  }, [bop]);

  const handleSendTip = useCallback(async (cents: number) => {
    // Phase 2: Wire to Stripe PaymentIntent
    // For now show a placeholder toast until Stripe Connect is built
    setIsTipping(true);
    setTimeout(() => {
      setIsTipping(false);
      setShowTip(false);
      toast.success("Tip sent! Stripe Connect coming soon.");
    }, 1200);
  }, []);

  const handlePostComment = useCallback(() => {
    if (!commentText.trim()) return;
    postComment.mutate({ videoId: bop.id, body: commentText.trim() });
  }, [commentText, bop.id, postComment]);

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <>
      {/* ── Right-rail buttons ──────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-5">
        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1"
          aria-label="Like this Bop"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform ${
              likeAnimating ? "scale-125" : "scale-100"
            }`}
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                isLiked ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </div>
          <span className="text-white text-xs font-medium drop-shadow-md">
            {formatCount(likeCount)}
          </span>
        </button>

        {/* Lightning Tip */}
        <button
          onClick={handleTip}
          className="flex flex-col items-center gap-1"
          aria-label="Send a tip"
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "#5DCCCC" }}
          >
            <Zap className="w-6 h-6 text-black fill-black" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow-md">Tip</span>
        </button>

        {/* Comment */}
        <button
          onClick={handleComment}
          className="flex flex-col items-center gap-1"
          aria-label="View comments"
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow-md">
            {formatCount(commentCount)}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1"
          aria-label="Share this Bop"
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
          >
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow-md">Share</span>
        </button>
      </div>

      {/* ── Tip Modal ───────────────────────────────────────────────────── */}
      {showTip && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowTip(false)}
        >
          <div
            className="w-full max-w-sm bg-zinc-900 rounded-t-2xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Kick In a Tip</h3>
              <button onClick={() => setShowTip(false)}>
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <p className="text-white/50 text-sm mb-5">
              100% goes to the artist after card processing fees.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {TIP_PRESETS.map(({ label, cents }) => (
                <button
                  key={cents}
                  onClick={() => handleSendTip(cents)}
                  disabled={isTipping}
                  className="py-4 rounded-xl font-bold text-black text-lg transition-opacity disabled:opacity-50"
                  style={{ background: "#5DCCCC" }}
                >
                  {label}
                </button>
              ))}
            </div>

            {isTipping && (
              <p className="text-center text-white/60 text-sm">Processing...</p>
            )}
          </div>
        </div>
      )}

      {/* ── Comment Drawer ──────────────────────────────────────────────── */}
      {showComments && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowComments(false)}
        >
          <div
            className="w-full max-w-sm bg-zinc-900 rounded-t-2xl flex flex-col"
            style={{ maxHeight: "70vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle + header */}
            <div className="px-5 pt-4 pb-3 border-b border-white/10 flex-shrink-0">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-base">
                  {formatCount(commentCount)} Comments
                </h3>
                <button onClick={() => setShowComments(false)}>
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
              {!comments?.items?.length && (
                <p className="text-white/40 text-sm text-center py-8">
                  No comments yet. Be the first.
                </p>
              )}
              {comments?.items?.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#5DCCCC] flex-shrink-0 flex items-center justify-center">
                    <span className="text-black font-bold text-xs">
                      {String(comment.userId).charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs mb-0.5">
                      User {comment.userId}
                    </p>
                    <p className="text-white text-sm leading-snug">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment input */}
            <div className="px-4 py-3 border-t border-white/10 flex-shrink-0 flex gap-2 items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value.slice(0, 300))}
                onKeyDown={(e) => { if (e.key === "Enter") handlePostComment(); }}
                placeholder={isAuthenticated ? "Add a comment..." : "Sign in to comment"}
                disabled={!isAuthenticated}
                className="flex-1 bg-white/10 text-white placeholder-white/30 rounded-full px-4 py-2 text-sm outline-none border border-white/10 focus:border-[#5DCCCC] transition-colors"
              />
              <button
                onClick={isAuthenticated ? handlePostComment : onAuthRequired}
                disabled={isAuthenticated && !commentText.trim()}
                className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity"
                style={{ background: "#5DCCCC" }}
              >
                <Send className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
