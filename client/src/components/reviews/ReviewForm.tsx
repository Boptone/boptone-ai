import { useState } from "react";
import { Upload, X } from "lucide-react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ReviewFormProps {
  productId: number;
  onSuccess?: () => void;
}

interface PhotoUpload {
  file: File;
  preview: string;
  base64: string;
}

/**
 * ReviewForm Component
 * 
 * Form for submitting product reviews with:
 * - Star rating selection
 * - Title and content
 * - Photo uploads (max 5)
 * - Optional reviewer name and location
 */
export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerLocation, setReviewerLocation] = useState("");
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);

  const submitReview = trpc.reviews.submitReview.useMutation({
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      // Reset form
      setRating(0);
      setTitle("");
      setContent("");
      setReviewerName("");
      setReviewerLocation("");
      setPhotos([]);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (photos.length + files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        continue;
      }

      // Create preview
      const preview = URL.createObjectURL(file);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => [
          ...prev,
          {
            file,
            preview,
            base64: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (content.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    submitReview.mutate({
      productId,
      rating,
      title: title.trim() || undefined,
      content: content.trim(),
      reviewerName: reviewerName.trim() || undefined,
      reviewerLocation: reviewerLocation.trim() || undefined,
      photos: photos.map((p) => ({
        base64: p.base64,
        mimeType: p.file.type,
        filename: p.file.name,
      })),
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Write a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Selection */}
        <div>
          <Label className="mb-2 block">Your Rating *</Label>
          <StarRating
            rating={rating}
            interactive
            onRatingChange={setRating}
            size="lg"
          />
        </div>

        {/* Review Title */}
        <div>
          <Label htmlFor="title">Review Title (Optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience in one line"
            maxLength={255}
          />
        </div>

        {/* Review Content */}
        <div>
          <Label htmlFor="content">Your Review *</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell us what you think about this product..."
            rows={5}
            className="resize-none"
            minLength={10}
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Minimum 10 characters ({content.length}/10)
          </p>
        </div>

        {/* Photo Upload */}
        <div>
          <Label>Add Photos (Optional)</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Upload up to 5 photos (max 5MB each)
          </p>

          {/* Photo Preview Grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                  <img
                    src={photo.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {photos.length < 5 && (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to upload photos
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Reviewer Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reviewerName">Your Name (Optional)</Label>
            <Input
              id="reviewerName"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="How should we display your name?"
              maxLength={255}
            />
          </div>
          <div>
            <Label htmlFor="reviewerLocation">Location (Optional)</Label>
            <Input
              id="reviewerLocation"
              value={reviewerLocation}
              onChange={(e) => setReviewerLocation(e.target.value)}
              placeholder="e.g., Los Angeles, CA"
              maxLength={255}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={submitReview.isLoading || rating === 0 || content.trim().length < 10}
          className="w-full"
          size="lg"
        >
          {submitReview.isLoading ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </Card>
  );
}
