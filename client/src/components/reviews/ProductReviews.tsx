import { useState } from "react";
import { StarRating } from "./StarRating";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

interface ProductReviewsProps {
  productId: number;
}

/**
 * ProductReviews Component
 * 
 * Complete review system for product pages:
 * - Review statistics and rating distribution
 * - Review list with sorting
 * - Review submission form
 */
export function ProductReviews({ productId }: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState<"helpful" | "recent" | "highest" | "lowest">("helpful");
  const [showForm, setShowForm] = useState(false);

  // Fetch review stats
  const { data: stats } = trpc.reviews.getProductReviewStats.useQuery({ productId });

  // Fetch reviews
  const { data: reviews, isLoading, refetch } = trpc.reviews.getProductReviews.useQuery({
    productId,
    sortBy,
    limit: 20,
  });

  const handleReviewSubmitted = () => {
    setShowForm(false);
    refetch();
  };

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      {stats && stats.totalReviews > 0 && (
        <Card className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-bold mb-2">{stats.averageRating}</div>
              <StarRating rating={stats.averageRating} size="lg" />
              <p className="text-muted-foreground mt-2">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star as keyof typeof stats.distribution];
                const percentage = stats.totalReviews > 0 
                  ? (count / stats.totalReviews) * 100 
                  : 0;

                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-8">{star} ★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Write Review Button */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          size="lg"
          className="w-full md:w-auto"
        >
          Write a Review
        </Button>
      )}

      {/* Review Form */}
      {showForm && (
        <div>
          <ReviewForm productId={productId} onSuccess={handleReviewSubmitted} />
          <Button
            variant="ghost"
            onClick={() => setShowForm(false)}
            className="mt-4"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Review List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">
            Customer Reviews
            {stats && stats.totalReviews > 0 && (
              <span className="text-muted-foreground ml-2">
                ({stats.totalReviews})
              </span>
            )}
          </h3>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="helpful">Most Helpful</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onVoteSuccess={() => refetch()}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {reviews && reviews.length === 0 && !isLoading && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No reviews yet. Be the first to review this product!
            </p>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                Write the First Review
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
