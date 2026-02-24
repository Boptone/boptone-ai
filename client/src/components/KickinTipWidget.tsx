import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DollarSign, Heart, Loader2 } from "lucide-react";

interface KickinTipWidgetProps {
  artistId: number;
  artistName: string;
  artistAvatar?: string;
}

const PRESET_AMOUNTS = [5, 10, 20, 50, 100];
const MAX_TIP_AMOUNT = 500;
const MAX_MESSAGE_LENGTH = 500;

export function KickinTipWidget({ artistId, artistName, artistAvatar }: KickinTipWidgetProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(20);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const { data: currencies } = trpc.payment.getCurrencies.useQuery();
  const { data: limits } = trpc.payment.getUserTipLimits.useQuery();
  const createCheckout = trpc.payment.createKickinCheckout.useMutation({
    onSuccess: (data) => {
      // Open Stripe checkout in new tab
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
        toast.success("Redirecting to secure checkout...");
      } else {
        toast.error("Failed to create checkout session");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

  const finalAmount = selectedAmount === null 
    ? parseFloat(customAmount) || 0 
    : selectedAmount;

  const isValidAmount = finalAmount >= 1 && finalAmount <= MAX_TIP_AMOUNT;
  const isOverDailyLimit = limits && finalAmount > limits.dailyRemaining;
  const isOverWeeklyLimit = limits && finalAmount > limits.weeklyRemaining;
  const isOverMonthlyLimit = limits && finalAmount > limits.monthlyRemaining;

  const handleTip = () => {
    if (!isValidAmount) {
      toast.error(`Tip amount must be between $1 and $${MAX_TIP_AMOUNT}`);
      return;
    }

    if (isOverDailyLimit || isOverWeeklyLimit || isOverMonthlyLimit) {
      toast.error("This tip would exceed your velocity limits");
      return;
    }

    createCheckout.mutate({
      artistId,
      amount: finalAmount,
      currency: selectedCurrency,
      message: message.trim() || undefined,
      isAnonymous,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 hover:border-gray-400 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-4">
        {artistAvatar && (
          <img
            src={artistAvatar}
            alt={artistName}
            className="w-16 h-16 rounded-xl border border-gray-200 object-cover"
          />
        )}
        <div>
          <h3 className="text-xl font-bold text-black">Support {artistName}</h3>
          <p className="text-sm text-gray-600">Send a tip with Kick-in</p>
        </div>
      </div>

      {/* Currency Selector */}
      <div>
        <Label htmlFor="currency" className="text-sm font-medium text-black mb-2 block">
          Currency
        </Label>
        <select
          id="currency"
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#81e6ff] focus:outline-none transition-colors"
        >
          {currencies?.map((curr) => (
            <option key={curr.code} value={curr.code}>
              {curr.symbol} {curr.code} - {curr.name}
            </option>
          ))}
        </select>
      </div>

      {/* Preset Amounts */}
      <div>
        <Label className="text-sm font-medium text-black mb-3 block">
          Select Amount
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount("");
              }}
              className={`
                px-4 py-3 border rounded-xl font-semibold transition-all
                ${
                  selectedAmount === amount
                    ? "border-[#81e6ff] bg-[#e0f9ff] text-[#60d5ed] shadow-[0_0_0_3px_rgba(6,182,212,0.1)]"
                    : "border-gray-200 text-black hover:border-gray-400"
                }
              `}
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div>
        <Label htmlFor="custom-amount" className="text-sm font-medium text-black mb-2 block">
          Or Enter Custom Amount (${selectedCurrency} 1-{MAX_TIP_AMOUNT})
        </Label>
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="custom-amount"
            type="number"
            min="1"
            max={MAX_TIP_AMOUNT}
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
            placeholder="Enter amount"
            className="pl-12 border border-gray-200 rounded-xl focus:border-[#81e6ff] hover:border-gray-400 transition-colors"
          />
        </div>
        {customAmount && !isValidAmount && (
          <p className="text-sm text-red-600 mt-2">
            Amount must be between $1 and ${MAX_TIP_AMOUNT}
          </p>
        )}
      </div>

      {/* Velocity Limits Display */}
      {limits && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-medium text-black">Your Tip Limits</p>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Daily remaining:</span>
              <span className="font-medium text-black">
                ${limits.dailyRemaining.toFixed(2)} / ${limits.dailyLimit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Weekly remaining:</span>
              <span className="font-medium text-black">
                ${limits.weeklyRemaining.toFixed(2)} / ${limits.weeklyLimit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Monthly remaining:</span>
              <span className="font-medium text-black">
                ${limits.monthlyRemaining.toFixed(2)} / ${limits.monthlyLimit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Optional Message */}
      <div>
        <Label htmlFor="message" className="text-sm font-medium text-black mb-2 block">
          Optional Message ({message.length}/{MAX_MESSAGE_LENGTH})
        </Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          placeholder="Say something nice to the artist..."
          rows={3}
          className="border border-gray-200 rounded-xl focus:border-[#81e6ff] hover:border-gray-400 transition-colors resize-none"
        />
      </div>

      {/* Anonymous Option */}
      <div className="flex items-center gap-3">
        <Checkbox
          id="anonymous"
          checked={isAnonymous}
          onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
          className="border border-gray-200 data-[state=checked]:bg-[#81e6ff] data-[state=checked]:border-[#81e6ff]"
        />
        <Label
          htmlFor="anonymous"
          className="text-sm font-medium text-black cursor-pointer"
        >
          Send tip anonymously
        </Label>
      </div>

      {/* Send Tip Button */}
      <Button
        onClick={handleTip}
        disabled={!isValidAmount || createCheckout.isPending || isOverDailyLimit || isOverWeeklyLimit || isOverMonthlyLimit}
        className="w-full bg-black text-white border border-gray-200 rounded-xl py-6 text-lg font-bold hover:bg-gray-900 hover:shadow-[0_0_0_3px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {createCheckout.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            <Heart className="w-5 h-5 mr-2" />
            Send ${finalAmount.toFixed(2)} Tip
          </>
        )}
      </Button>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 text-center">
        Tips are voluntary gifts to support artists. Tips are non-refundable except in cases of
        fraud or error. By tipping, you confirm this is a legitimate gift. Artists keep 100% minus
        card processing fees (~3%).
      </p>
    </div>
  );
}
