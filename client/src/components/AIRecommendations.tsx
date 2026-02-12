import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, X, TrendingUp, Zap, DollarSign } from "lucide-react";
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
  
  if (!recommendations || recommendations.length === 0) {
    return null;
  }
  
  const visibleRecommendations = recommendations.filter(
    (rec) => !dismissed.has(rec.title)
  );
  
  if (visibleRecommendations.length === 0) {
    return null;
  }
  
  const getIcon = (type: string) => {
    switch (type) {
      case "workflow_suggestion":
        return <Zap className="w-5 h-5" />;
      case "revenue_optimization":
        return <DollarSign className="w-5 h-5" />;
      case "growth_opportunity":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };
  
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold">AI Recommendations</h3>
      </div>
      
      {visibleRecommendations.map((rec, index) => (
        <Card key={index} className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="text-yellow-500 mt-0.5">
                {getIcon(rec.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{rec.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {rec.description}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(rec)}
                  >
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(rec.title)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => handleDismiss(rec.title)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
