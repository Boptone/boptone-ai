/**
 * ProductRatingWidget
 *
 * A lightweight star-rating widget for BopShop product pages.
 * - Shows aggregate rating stats (average, total, distribution bar)
 * - Lets authenticated users submit or update a 1-5 star rating
 * - Optionally accepts a short note (tweet-length)
 * - Upsert semantics: re-rating updates the existing record
 * - Feeds the collaborative filter's rating-boost signal
 */

import { useState } from "react";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  productId: number;
}

export function ProductRatingWidget({ productId }: Props) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Aggregate stats (public)
  const { data: stats, isLoading: statsLoading } = trpc.productRatings.getProductStats.useQuery(
    { productId },
    { enabled: !!productId }
  );

  // Current user's rating (protected — only fetched if logged in)
  const { data: myRating } = trpc.productRatings.getMyRating.useQuery(
    { productId },
    { enabled: !!productId && isAuthenticated }
  );

  // Recent ratings with notes (public)
  const { data: recentNotes } = trpc.productRatings.getRecentWithNotes.useQuery(
    { productId, limit: 3 },
    { enabled: !!productId }
  );

  // Local UI state
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Derive the display star (hovered > selected > existing)
  const displayStar = hovered ?? selected ?? myRating?.rating ?? 0;

  const rateMutation = trpc.productRatings.rate.useMutation({
    onSuccess: (data) => {
      toast.success(`Your ${data.rating}-star rating was saved!`);
      setSubmitted(true);
      setShowNoteInput(false);
      setNote("");
      utils.productRatings.getProductStats.invalidate({ productId });
      utils.productRatings.getMyRating.invalidate({ productId });
      utils.productRatings.getRecentWithNotes.invalidate({ productId });
      // Bust the recommendations cache so the new rating is reflected
      utils.recommendations.getAlsoBought.invalidate({ productId });
    },
    onError: (err) => toast.error(err.message || "Failed to save rating"),
  });

  const deleteMutation = trpc.productRatings.deleteMyRating.useMutation({
    onSuccess: () => {
      toast.success("Rating removed.");
      setSelected(null);
      setSubmitted(false);
      utils.productRatings.getProductStats.invalidate({ productId });
      utils.productRatings.getMyRating.invalidate({ productId });
    },
    onError: (err) => toast.error(err.message || "Failed to remove rating"),
  });

  const handleStarClick = (star: number) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setSelected(star);
    setShowNoteInput(true);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!selected) return;
    rateMutation.mutate({
      productId,
      rating: selected,
      note: note.trim() || undefined,
      source: "quick_rate",
    });
  };

  const handleCancel = () => {
    setSelected(null);
    setShowNoteInput(false);
    setNote("");
  };

  if (statsLoading) return null;

  const avg = stats?.average ?? 0;
  const total = stats?.total ?? 0;
  const dist = stats?.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">Customer Ratings</h3>
        {total > 0 && (
          <span className="text-sm text-gray-500">{total} rating{total !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Aggregate Stats */}
      {total > 0 ? (
        <div className="flex gap-6 items-start">
          {/* Big average number */}
          <div className="text-center shrink-0">
            <div className="text-5xl font-bold text-gray-900">{avg.toFixed(1)}</div>
            <div className="flex justify-center mt-1 gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= Math.round(avg) ? "fill-[#0cc0df] text-[#0cc0df]" : "text-gray-300"}`}
                />
              ))}
            </div>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = dist[star] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-4 text-right text-gray-500">{star}</span>
                  <Star className="w-3 h-3 text-gray-400 shrink-0" />
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 bg-[#0cc0df] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-400 text-xs">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No ratings yet — be the first!</p>
      )}

      {/* Interactive Star Input */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {myRating ? "Update your rating" : "Rate this product"}
        </p>
        <div className="flex gap-1.5 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleStarClick(star)}
              className="p-1 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= displayStar
                    ? "fill-[#0cc0df] text-[#0cc0df]"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          {myRating && !showNoteInput && (
            <span className="ml-3 self-center text-sm text-gray-500">
              Your rating: {myRating.rating} star{myRating.rating !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Note input — shown after clicking a star */}
        {showNoteInput && selected && (
          <div className="space-y-3 mt-3">
            <Textarea
              placeholder="Add a short note (optional, max 280 chars)"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 280))}
              className="resize-none rounded-xl border-gray-200 text-sm"
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={rateMutation.isPending}
                className="bg-black text-white rounded-xl px-5 shadow-[2px_2px_0px_#81e6fe] hover:shadow-[1px_1px_0px_#81e6fe] transition-all"
              >
                {rateMutation.isPending ? "Saving…" : `Submit ${selected}-star rating`}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="rounded-xl border-gray-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Remove rating option */}
        {myRating && !showNoteInput && (
          <button
            type="button"
            onClick={() => deleteMutation.mutate({ productId })}
            disabled={deleteMutation.isPending}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-1"
          >
            Remove my rating
          </button>
        )}

        {/* Success confirmation */}
        {submitted && (
          <p className="text-sm text-[#0cc0df] font-medium mt-2">
            Thanks for rating! Your feedback improves recommendations for everyone.
          </p>
        )}
      </div>

      {/* Recent notes */}
      {recentNotes && recentNotes.length > 0 && (
        <div className="border-t border-gray-100 pt-5 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Recent feedback</p>
          {recentNotes.map((r) => (
            <div key={r.id} className="flex gap-3 items-start">
              <div className="flex gap-0.5 shrink-0 mt-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-[#0cc0df] text-[#0cc0df]" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{r.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
