import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DollarSign, Loader2 } from "lucide-react";

interface PayToStreamButtonProps {
  trackId: number;
  trackTitle: string;
  artistName: string;
  artistId: number;
  defaultPrice?: number; // in cents
  onStreamUnlocked?: () => void;
}

export function PayToStreamButton({
  trackId,
  trackTitle,
  artistName,
  artistId,
  defaultPrice = 3, // $0.03 default
  onStreamUnlocked,
}: PayToStreamButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [customPrice, setCustomPrice] = useState(defaultPrice.toString());
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: currencies } = trpc.payment.getCurrencies.useQuery();
  const createCheckoutMutation = trpc.payment.createBopAudioCheckout.useMutation();

  const handlePayToStream = async () => {
    setIsProcessing(true);
    
    try {
      const priceInCents = Math.round(parseFloat(customPrice) * 100);
      
      if (priceInCents < 1 || priceInCents > 500) {
        toast.error("Price must be between $0.01 and $5.00");
        setIsProcessing(false);
        return;
      }

      const result = await createCheckoutMutation.mutateAsync({
        trackId,
        streamCount: 1,
        pricePerStream: priceInCents,
        currency: selectedCurrency,
      });

      if (result.checkoutUrl) {
        // Open Stripe checkout in new tab
        window.open(result.checkoutUrl, '_blank');
        toast.success("Redirecting to payment...");
        setIsOpen(false);
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (cents: number, currency: string) => {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const priceInCents = Math.round(parseFloat(customPrice || "0") * 100);
  const artistEarnings = Math.round(priceInCents * 0.9); // 90% to artist

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="rounded-xl border border-gray-200 bg-white text-black hover:border-gray-400 hover:bg-white transition-all shadow-[4px_4px_0px_0px_rgba(0,255,255,0.3)]"
      >
        <DollarSign className="h-4 w-4 mr-1" />
        Pay to Stream
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Pay to Stream</DialogTitle>
            <DialogDescription className="text-gray-600">
              Support {artistName} directly by paying to stream "{trackTitle}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Currency Selector */}
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger 
                  id="currency"
                  className="rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
                >
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-200">
                  {currencies?.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <Label htmlFor="price">Stream Price (in {selectedCurrency})</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                max="5.00"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="rounded-xl border border-gray-200 hover:border-gray-400 focus:border-gray-400 transition-colors"
                placeholder="0.03"
              />
              <p className="text-xs text-gray-500">
                Recommended: $0.01 - $0.05 per stream
              </p>
            </div>

            {/* Revenue Split Display */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Stream Price:</span>
                <span className="font-semibold">{formatPrice(priceInCents, selectedCurrency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Artist Earnings (90%):</span>
                <span className="font-semibold text-green-600">{formatPrice(artistEarnings, selectedCurrency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee (10%):</span>
                <span className="text-gray-500">{formatPrice(priceInCents - artistEarnings, selectedCurrency)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayToStream}
                disabled={isProcessing || !customPrice || parseFloat(customPrice) <= 0}
                className="flex-1 rounded-xl border border-gray-200 bg-black text-white hover:bg-gray-900 transition-all shadow-[4px_4px_0px_0px_rgba(0,255,255,0.3)]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay {formatPrice(priceInCents, selectedCurrency)}</>
                )}
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 text-center">
              Payment processed securely by Stripe. All payments are final and non-refundable.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
