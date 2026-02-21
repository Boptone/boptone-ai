import { useState } from "react";
import { ThumbsUp, ThumbsDown, BadgeCheck } from "lucide-react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ReviewResponseForm } from "./ReviewResponseForm";
import { useAuth } from "@/_core/hooks/useAuth";

interface ReviewPhoto {
  id: number;
  photoUrl: string;
  thumbnailUrl: string | null;
  altText: string;
}

interface Review {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  reviewerName: string | null;
  reviewerLocation: string | null;
  verifiedPurchase: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  createdAt: Date;
  photos?: ReviewPhoto[];
}

interface ReviewCardProps {
  review: Review;
  onVoteSuccess?: () => void;
}

/**
 * ReviewCard Component
 * 
 * Displays a single product review with:
 * - Star rating
 * - Verified purchase badge
 * - Review content
 * - Photo gallery
 * - Helpfulness voting
 */
export function ReviewCard({ review, onVoteSuccess }: ReviewCardProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch seller response
  const { data: response } = trpc.reviews.getResponse.useQuery({
    reviewId: review.id,
  });

  // Check if current user is the seller (can respond)
  // TODO: Add artistId to review query for proper ownership check
  const isProductOwner = false; // Placeholder until we add product owner info to review
  const voteHelpful = trpc.reviews.voteHelpful.useMutation({
    onSuccess: () => {
      toast.success("Thanks for your feedback!");
      onVoteSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit vote");
    },
  });

  const handleVote = (voteType: "helpful" | "unhelpful") => {
    voteHelpful.mutate({
      reviewId: review.id,
      voteType,
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <>
      <Card className="p-6">
        {/* Header: Rating + Verified Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <StarRating rating={review.rating} size="sm" />
            {review.verifiedPurchase && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <BadgeCheck className="w-4 h-4" />
                <span className="font-medium">Verified Purchase</span>
              </div>
            )}
          </div>
        </div>

        {/* Review Title */}
        {review.title && (
          <h4 className="font-semibold text-lg mb-2">{review.title}</h4>
        )}

        {/* Review Content */}
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {review.content}
        </p>

        {/* Photo Gallery */}
        {review.photos && review.photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {review.photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo.photoUrl)}
                className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer group"
              >
                <img
                  src={photo.thumbnailUrl || photo.photoUrl}
                  alt={photo.altText}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </button>
            ))}
          </div>
        )}

        {/* Footer: Reviewer Info + Helpfulness */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {review.reviewerName || "Anonymous"}
            </span>
            {review.reviewerLocation && (
              <span> from {review.reviewerLocation}</span>
            )}
            <span className="mx-2">•</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>

          {/* Helpfulness Voting */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">
              Helpful?
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote("helpful")}
              disabled={voteHelpful.isLoading}
              className="gap-1"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{review.helpfulVotes}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote("unhelpful")}
              disabled={voteHelpful.isLoading}
              className="gap-1"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{review.unhelpfulVotes}</span>
            </Button>
          </div>
        </div>

        {/* Seller Response */}
        {response && (
          <div className="mt-4">
            <ReviewResponseForm
              reviewId={review.id}
              existingResponse={response}
            />
          </div>
        )}

        {/* Response Form for Product Owner */}
        {!response && isProductOwner && (
          <div className="mt-4">
            <ReviewResponseForm reviewId={review.id} />
          </div>
        )}
      </Card>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            onClick={() => setSelectedPhoto(null)}
          >
            ×
          </button>
          <img
            src={selectedPhoto}
            alt="Review photo"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
