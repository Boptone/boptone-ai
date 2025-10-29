import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface StripeCheckoutProps {
  tier: "pro" | "enterprise";
  buttonText?: string;
  buttonVariant?: "default" | "outline";
  className?: string;
}

export function StripeCheckout({ 
  tier, 
  buttonText = "Subscribe Now", 
  buttonVariant = "default",
  className = "",
}: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const createCheckout = trpc.stripe.createSubscriptionCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error("Failed to create checkout session", {
        description: error.message,
      });
      setIsLoading(false);
    },
  });

  const handleCheckout = () => {
    setIsLoading(true);
    createCheckout.mutate({ tier });
  };

  return (
    <Button
      className={className}
      variant={buttonVariant}
      onClick={handleCheckout}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}
