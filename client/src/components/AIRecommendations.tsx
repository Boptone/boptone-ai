import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

/**
 * AI Recommendations Widget
 * 
 * Displays proactive AI-generated recommendations based on artist context.
 * Shows actionable suggestions that artists can accept or dismiss.
 */

interface Recommendation {
  type: string;
  title: string;
  description: string;
  actionData: any;
  expiresAt?: Date;
}

export function AIRecommendations() {
  const { data: recommendations, refetch } = trpc.toney.getRecommendations.useQuery();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const executeMutation = trpc.toney.executeCapability.useMutation();
  
  // Feature temporarily disabled for security updates
  if (!recommendations || recommendations.length === 0) {
    return null;
  }
  
  // Type guard for recommendations
  const typedRecommendations = recommendations as Recommendation[];
  
  const visibleRecommendations = typedRecommendations.filter(
    (rec) => !dismissed.has(rec.title)
  );
  
  if (visibleRecommendations.length === 0) {
    return null;
  }
  
  const handleAccept = async (rec: Recommendation) => {
    try {
      // Execute the recommendation action
      await executeMutation.mutateAsync({
        capability: rec.type,
        params: rec.actionData,
      });
      
      toast.success("Recommendation applied successfully!");
      setDismissed(prev => new Set([...prev, rec.title]));
      refetch();
    } catch (error) {
      console.error("[AIRecommendations] Failed to apply recommendation:", error);
      toast.error("Failed to apply recommendation");
    }
  };
  
  const handleDismiss = (title: string) => {
    setDismissed(prev => new Set([...prev, title]));
  };
  
  return (
    <div className="border-2 border-gray-200 bg-white p-12">
      <h3 className="text-4xl font-bold mb-8">AI Recommendations</h3>
      
      <div className="space-y-4">
        {visibleRecommendations.map((rec, index) => (
          <div key={index} className="p-6 border-2 border-gray-300 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">{rec.title}</h4>
                <p className="text-base text-gray-600 mb-4">
                  {rec.description}
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(rec)}
                    className="rounded-full bg-black hover:bg-gray-800 text-white"
                  >
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(rec.title)}
                    className="rounded-full"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss(rec.title)}
                className="text-gray-400 hover:text-gray-900"
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
