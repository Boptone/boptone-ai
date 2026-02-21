import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReviewResponseFormProps {
  reviewId: number;
  existingResponse?: {
    id: number;
    content: string;
  } | null;
  onSuccess?: () => void;
}

export function ReviewResponseForm({ reviewId, existingResponse, onSuccess }: ReviewResponseFormProps) {
  const [content, setContent] = useState(existingResponse?.content || "");
  const [isEditing, setIsEditing] = useState(!existingResponse);

  const submitMutation = trpc.reviews.submitResponse.useMutation({
    onSuccess: () => {
      toast.success(existingResponse ? "Response updated" : "Response posted");
      setIsEditing(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post response");
    },
  });

  const handleSubmit = () => {
    if (content.trim().length < 10) {
      toast.error("Response must be at least 10 characters");
      return;
    }

    submitMutation.mutate({
      reviewId,
      content: content.trim(),
    });
  };

  if (!isEditing && existingResponse) {
    return (
      <Card className="p-4 bg-blue-50 border-l-4 border-blue-500">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm font-semibold text-blue-900 mb-2">
              Seller Response
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {existingResponse.content}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gray-50">
      <div className="space-y-3">
        <div className="text-sm font-semibold text-gray-900">
          {existingResponse ? "Edit Your Response" : "Respond to this Review"}
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Thank the customer or address their concerns..."
          className="min-h-[100px] resize-none"
          maxLength={2000}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {content.length}/2000 characters
          </span>
          <div className="flex gap-2">
            {existingResponse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setContent(existingResponse.content);
                  setIsEditing(false);
                }}
                disabled={submitMutation.isPending}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || content.trim().length < 10}
              size="sm"
            >
              {submitMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {existingResponse ? "Update Response" : "Post Response"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
