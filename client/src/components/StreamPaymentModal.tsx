import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Music } from "lucide-react";

// Load Stripe publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface StreamPaymentModalProps {
  open: boolean;
  onClose: () => void;
  trackId: number;
  trackTitle: string;
  artistName: string;
  artworkUrl: string;
  pricePerStream: number; // In cents
  onPaymentSuccess: (sessionToken: string) => void;
}

function PaymentForm({
  trackId,
  pricePerStream,
  onSuccess,
  onCancel,
}: {
  trackId: number;
  pricePerStream: number;
  onSuccess: (sessionToken: string) => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmPayment = trpc.bap.payments.confirmPayment.useMutation({
    onSuccess: (data) => {
      toast.success("Payment successful! Enjoy your stream.");
      onSuccess(data.sessionToken);
    },
    onError: (error) => {
      toast.error(`Payment confirmation failed: ${error.message}`);
      setIsProcessing(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm payment on backend and get session token
        await confirmPayment.mutateAsync({
          paymentIntentId: paymentIntent.id,
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing failed");
      setIsProcessing(false);
    }
  };

  const artistShare = Math.floor(pricePerStream * 0.9);
  const platformShare = pricePerStream - artistShare;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Price Breakdown */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Stream price</span>
          <span className="font-medium">${(pricePerStream / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Artist receives (90%)</span>
          <span className="font-medium text-green-600">${(artistShare / 100).toFixed(3)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Platform fee (10%)</span>
          <span className="font-medium">${(platformShare / 100).toFixed(3)}</span>
        </div>
        <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span>${(pricePerStream / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="space-y-4">
        <PaymentElement />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${(pricePerStream / 100).toFixed(2)} & Listen`
          )}
        </Button>
      </div>

      {/* 24-hour unlock notice */}
      <p className="text-xs text-center text-muted-foreground">
        After payment, you can listen to this track for free for 24 hours
      </p>
    </form>
  );
}

export function StreamPaymentModal({
  open,
  onClose,
  trackId,
  trackTitle,
  artistName,
  artworkUrl,
  pricePerStream,
  onPaymentSuccess,
}: StreamPaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createIntent = trpc.bap.payments.createIntent.useMutation({
    onSuccess: (data) => {
      setClientSecret(data.clientSecret || null);
    },
    onError: (error) => {
      toast.error(`Failed to initialize payment: ${error.message}`);
      onClose();
    },
  });

  useEffect(() => {
    if (open && !clientSecret) {
      createIntent.mutate({ trackId });
    }
  }, [open, trackId]);

  const handleSuccess = (sessionToken: string) => {
    onPaymentSuccess(sessionToken);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Pay to Stream
          </DialogTitle>
          <DialogDescription>
            Support the artist directly with a one-time payment
          </DialogDescription>
        </DialogHeader>

        {/* Track Info */}
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <img
            src={artworkUrl}
            alt={trackTitle}
            className="w-16 h-16 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{trackTitle}</h3>
            <p className="text-sm text-muted-foreground truncate">{artistName}</p>
          </div>
        </div>

        {/* Payment Form */}
        {createIntent.isPending && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
              },
            }}
          >
            <PaymentForm
              trackId={trackId}
              pricePerStream={pricePerStream}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
