import { useState, useMemo } from "react";
import { useRequireArtist } from "@/hooks/useRequireArtist";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/reviews/StarRating";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, Star, ThumbsUp, BadgeCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReviewAnalyticsDashboard() {
  useRequireArtist(); // Enforce artist authentication
  const [location] = useLocation();
  const artistId = useMemo(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    return Number(params.get("artistId"));
  }, [location]);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  const { data: analytics, isLoading } = trpc.reviewAnalytics.getArtistAnalytics.useQuery({
    artistId,
    timeRange,
  }, {
    enabled: !!artistId,
  });

  if (!artistId) {
    return (
      <div className="container mx-auto py-12">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Please select an artist to view review analytics.
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <Card className="p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto py-12">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No review data available for this artist.
          </p>
        </Card>
      </div>
    );
  }

  const { stats, trend, topReviews, productBreakdown } = analytics;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track customer feedback and review trends
          </p>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-bold">{stats.totalReviews}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <BadgeCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified</p>
              <p className="text-2xl font-bold">
                {stats.verifiedPurchasePercentage.toFixed(0)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ThumbsUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">5-Star Reviews</p>
              <p className="text-2xl font-bold">{stats.distribution[5]}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Rating Distribution</h2>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.distribution[rating as keyof typeof stats.distribution];
            const percentage = stats.totalReviews > 0
              ? (count / stats.totalReviews) * 100
              : 0;

            return (
              <div key={rating} className="flex items-center gap-4">
                <div className="w-20 flex items-center gap-1">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-16 text-right text-sm text-muted-foreground">
                  {count} ({percentage.toFixed(0)}%)
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Product Breakdown */}
      {productBreakdown.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Reviews by Product</h2>
          <div className="space-y-3">
            {productBreakdown.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div>
                  <p className="font-medium">{product.productName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={product.averageRating} size="sm" />
                    <span className="text-sm text-muted-foreground">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{product.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">avg rating</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Reviews */}
      {topReviews.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Most Helpful Reviews</h2>
          <div className="space-y-4">
            {topReviews.map((review) => (
              <div
                key={review.id}
                className="p-4 border border-border rounded-lg space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <StarRating rating={review.rating} size="sm" />
                    {review.title && (
                      <p className="font-semibold mt-1">{review.title}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{review.helpfulVotes}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {review.content}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{review.reviewerName || "Anonymous"}</span>
                  <span>{review.productName}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
