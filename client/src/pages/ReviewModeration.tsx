import { useState } from "react";
import { useRequireArtist } from "@/hooks/useRequireArtist";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/reviews/StarRating";
import { CheckCircle, XCircle, Flag, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

type FilterStatus = "all" | "pending" | "approved" | "rejected" | "flagged";

/**
 * Review Moderation Dashboard (Admin Only)
 * 
 * Allows admins to:
 * - View all product reviews
 * - Filter by status (pending, approved, rejected, flagged)
 * - Approve/reject/flag reviews
 * - View review photos and details
 */
export default function ReviewModeration() {
  useRequireArtist(); // Enforce artist authentication
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");

  // Fetch reviews based on filter
  const { data: reviews, isLoading, refetch } = trpc.reviews.getAllReviews.useQuery({
    status: filterStatus === "all" ? undefined : filterStatus,
    limit: 100,
  });

  // Moderate review mutation
  const moderateReview = trpc.reviews.moderateReview.useMutation({
    onSuccess: (_, variables) => {
      const action = variables.action === "approve" ? "approved" : 
                     variables.action === "reject" ? "rejected" : "flagged";
      toast.success(`Review ${action} successfully`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to moderate review");
    },
  });

  const handleModerate = (reviewId: number, action: "approve" | "reject" | "flag") => {
    moderateReview.mutate({ reviewId, action });
  };

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You must be an admin to access this page.
          </p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Review Moderation</h1>
          <p className="text-muted-foreground text-lg">
            Manage customer reviews for BopShop products
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {["pending", "approved", "rejected", "flagged"].map((status) => {
            const count = reviews?.filter((r: any) => r.moderationStatus === status).length || 0;
            return (
              <Card key={status} className="p-6">
                <div className="text-sm text-muted-foreground mb-1 capitalize">{status}</div>
                <div className="text-3xl font-bold">{count}</div>
              </Card>
            );
          })}
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <label className="font-medium">Filter by status:</label>
            <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {reviews?.length || 0} review{reviews?.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Reviews List */}
        {reviews && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {/* Product Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <Link href={`/shop/${review.product?.slug}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          {review.product?.name || `Product #${review.productId}`}
                        </Button>
                      </Link>
                      <Badge
                        variant={
                          review.moderationStatus === "approved" ? "default" :
                          review.moderationStatus === "rejected" ? "destructive" :
                          review.moderationStatus === "flagged" ? "outline" :
                          "secondary"
                        }
                      >
                        {review.moderationStatus}
                      </Badge>
                      {review.verifiedPurchase && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>

                    {/* Rating & Title */}
                    <div className="flex items-center gap-3 mb-2">
                      <StarRating rating={review.rating} size="sm" />
                      {review.title && (
                        <span className="font-semibold text-lg">{review.title}</span>
                      )}
                    </div>

                    {/* Review Content */}
                    <p className="text-muted-foreground mb-3 leading-relaxed">
                      {review.content}
                    </p>

                    {/* Photos */}
                    {review.photos && review.photos.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {review.photos.map((photo: any) => (
                          <img
                            key={photo.id}
                            src={photo.thumbnailUrl || photo.photoUrl}
                            alt={photo.altText}
                            className="w-20 h-20 object-cover rounded-lg border border-border"
                          />
                        ))}
                      </div>
                    )}

                    {/* Reviewer Info */}
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {review.reviewerName || "Anonymous"}
                      </span>
                      {review.reviewerLocation && (
                        <span> from {review.reviewerLocation}</span>
                      )}
                      <span className="mx-2">•</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{review.helpfulVotes} helpful votes</span>
                    </div>
                  </div>

                  {/* Moderation Actions */}
                  <div className="flex gap-2 ml-4">
                    {review.moderationStatus !== "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModerate(review.id, "approve")}
                        disabled={moderateReview.isPending}
                        className="gap-2 text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </Button>
                    )}

                    {review.moderationStatus !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModerate(review.id, "reject")}
                        disabled={moderateReview.isPending}
                        className="gap-2 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    )}

                    {review.moderationStatus !== "flagged" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModerate(review.id, "flag")}
                        disabled={moderateReview.isPending}
                        className="gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
                      >
                        <Flag className="w-4 h-4" />
                        Flag
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {reviews && reviews.length === 0 && !isLoading && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              No {filterStatus !== "all" && filterStatus} reviews found.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
