import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, Zap, Shield, DollarSign, Clock, ArrowRight, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

/**
 * ArtistPayout — Stripe Connect Onboarding
 *
 * This is the financial backbone of Boptone. Every tip, every BopShop sale,
 * and every royalty payment flows through this page.
 *
 * Design: Full-screen, premium, milestone-feeling. Not a settings screen.
 * Artists should feel like they are unlocking something significant.
 */
export default function ArtistPayout() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const { data: accountStatus, isLoading, refetch } = trpc.stripeConnect.getAccountStatus.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const createAccountMutation = trpc.stripeConnect.createConnectAccount.useMutation();
  const createOnboardingLinkMutation = trpc.stripeConnect.createOnboardingLink.useMutation();
  const createDashboardLinkMutation = trpc.stripeConnect.createDashboardLink.useMutation();

  // Handle return from Stripe onboarding
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const success = params.get("success");
    const refresh = params.get("refresh");

    if (success === "true") {
      toast.success("Payout account connected. You can now receive payments.");
      refetch();
      setLocation("/artist/payout");
    } else if (refresh === "true") {
      toast.info("Please complete the payout setup to receive payments.");
      refetch();
      setLocation("/artist/payout");
    }
  }, [location, refetch, setLocation]);

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    try {
      await createAccountMutation.mutateAsync();
      toast.success("Account created. Completing setup now...");
      await refetch();
      // Immediately proceed to onboarding
      handleStartOnboarding();
    } catch {
      toast.error("Failed to create payout account. Please try again.");
      setIsCreatingAccount(false);
    }
  };

  const handleStartOnboarding = async () => {
    setIsGeneratingLink(true);
    try {
      const { url } = await createOnboardingLinkMutation.mutateAsync();
      window.location.href = url;
    } catch {
      toast.error("Failed to open Stripe setup. Please try again.");
      setIsGeneratingLink(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      const { url } = await createDashboardLinkMutation.mutateAsync();
      window.open(url, "_blank");
    } catch {
      toast.error("Failed to open Stripe dashboard. Please try again.");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DCCCC]" />
      </div>
    );
  }

  const isFullyEnabled = accountStatus?.chargesEnabled && accountStatus?.payoutsEnabled;
  const isPartiallyOnboarded = accountStatus?.hasAccount && !isFullyEnabled;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <span className="text-white font-bold text-lg tracking-tight">Boptone</span>
        {isFullyEnabled && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Status: Fully Enabled */}
        {isFullyEnabled ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#5DCCCC]/20 border-2 border-[#5DCCCC] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#5DCCCC]" />
            </div>
            <h1 className="text-4xl font-bold mb-3">You are ready to earn.</h1>
            <p className="text-white/60 text-lg mb-10">
              Your payout account is connected and fully verified. Every tip, every sale, and every royalty will go directly to your bank account.
            </p>

            {/* Payout Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                <Zap className="w-5 h-5 text-[#5DCCCC] mb-3" />
                <div className="text-2xl font-bold">Next-Day</div>
                <div className="text-white/50 text-sm mt-1">Payout speed</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                <DollarSign className="w-5 h-5 text-[#5DCCCC] mb-3" />
                <div className="text-2xl font-bold">No Min.</div>
                <div className="text-white/50 text-sm mt-1">Payout threshold</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                <Shield className="w-5 h-5 text-[#5DCCCC] mb-3" />
                <div className="text-2xl font-bold">195+</div>
                <div className="text-white/50 text-sm mt-1">Countries supported</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleOpenDashboard}
                className="bg-[#5DCCCC] hover:bg-[#4BBBBB] text-black font-semibold px-8 py-3 rounded-xl"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Stripe Dashboard
              </Button>
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent px-8 py-3 rounded-xl"
              >
                Go to Artist Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Onboarding Header */}
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 bg-[#5DCCCC]/10 border border-[#5DCCCC]/30 rounded-full px-4 py-1.5 text-[#5DCCCC] text-sm font-medium mb-6">
                <Zap className="w-3.5 h-3.5" />
                Step 3 of 3 — Connect Payouts
              </div>
              <h1 className="text-5xl font-bold leading-tight mb-4">
                Connect your<br />bank account.
              </h1>
              <p className="text-white/60 text-xl leading-relaxed">
                Set up direct payouts so every tip, every sale, and every royalty goes straight to your bank. Takes about 2 minutes.
              </p>
            </div>

            {/* Status Indicator */}
            {isPartiallyOnboarded && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 mb-8 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-300 font-semibold">Setup incomplete</p>
                  <p className="text-yellow-300/70 text-sm mt-1">
                    Your account was created but the bank connection was not finished. Complete the setup below to start receiving payments.
                  </p>
                </div>
              </div>
            )}

            {/* Main CTA Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#5DCCCC]/20 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-[#5DCCCC]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Stripe Connect</h2>
                  <p className="text-white/50 text-sm">Secure bank connection — PCI-DSS Level 1 certified</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { icon: Clock, text: "Next-day payouts — funds in your bank within 24 hours" },
                  { icon: DollarSign, text: "No minimum threshold — withdraw any amount, any time" },
                  { icon: Shield, text: "Boptone never touches your money — Stripe pays you directly" },
                  { icon: CheckCircle2, text: "Automatic 1099-K tax reporting — no manual paperwork" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-[#5DCCCC] mt-0.5 flex-shrink-0" />
                    <span className="text-white/70 text-sm">{text}</span>
                  </div>
                ))}
              </div>

              {!accountStatus?.hasAccount ? (
                <Button
                  onClick={handleCreateAccount}
                  disabled={isCreatingAccount}
                  className="w-full bg-[#5DCCCC] hover:bg-[#4BBBBB] text-black font-bold py-4 rounded-xl text-base"
                >
                  {isCreatingAccount ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Connect Bank Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleStartOnboarding}
                  disabled={isGeneratingLink}
                  className="w-full bg-[#5DCCCC] hover:bg-[#4BBBBB] text-black font-bold py-4 rounded-xl text-base"
                >
                  {isGeneratingLink ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening Stripe...
                    </>
                  ) : (
                    <>
                      Complete Bank Setup
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}

              <p className="text-white/30 text-xs text-center mt-4">
                Your banking information is stored securely by Stripe, not by Boptone.
              </p>
            </div>

            {/* Fee Transparency */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">How earnings work</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70 text-sm">Bops tips (Kick In)</span>
                  <span className="text-[#5DCCCC] font-semibold text-sm">Card fees only — Boptone takes 0%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70 text-sm">BopShop sales</span>
                  <span className="text-white font-semibold text-sm">Shopify-aligned fee structure</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70 text-sm">Music streaming royalties</span>
                  <span className="text-white font-semibold text-sm">Per-stream rate, paid monthly</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/70 text-sm">Payout speed</span>
                  <span className="text-[#5DCCCC] font-semibold text-sm">Next-day to your bank</span>
                </div>
              </div>
            </div>

            {/* Skip for now */}
            <div className="text-center mt-8">
              <button
                onClick={() => setLocation("/dashboard")}
                className="text-white/30 text-sm hover:text-white/50 transition-colors"
              >
                Set up later from Settings
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
