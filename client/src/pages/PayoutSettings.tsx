import { useEffect, useState } from "react";
import { useRequireArtist } from "@/hooks/useRequireArtist";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, CreditCard, Shield, Zap, DollarSign } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { toast } from "sonner";
import { useLocation } from "wouter";

/**
 * Enterprise Payout Settings (Stripe Connect)
 * 
 * Eliminates money transmitter licensing by routing payments directly to artists.
 * Stripe handles all KYC/AML compliance, tax reporting (1099-K), and regulatory requirements.
 * 
 * This is the ONLY compliant way to handle artist payouts at scale.
 */
export default function PayoutSettings() {
  useRequireArtist(); // Enforce artist authentication
  const [location, setLocation] = useLocation();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const { data: accountStatus, isLoading, refetch } = trpc.stripeConnect.getAccountStatus.useQuery();
  const createAccountMutation = trpc.stripeConnect.createConnectAccount.useMutation();
  const createOnboardingLinkMutation = trpc.stripeConnect.createOnboardingLink.useMutation();
  const createDashboardLinkMutation = trpc.stripeConnect.createDashboardLink.useMutation();

  // Handle return from Stripe onboarding
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const success = params.get('success');
    const refresh = params.get('refresh');

    if (success === 'true') {
      toast.success("Payout setup complete! You can now receive payments.");
      refetch();
      // Clean URL
      setLocation('/settings/payouts');
    } else if (refresh === 'true') {
      toast.info("Please complete the payout setup to receive payments.");
      refetch();
      // Clean URL
      setLocation('/settings/payouts');
    }
  }, [location, refetch, setLocation]);

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    try {
      await createAccountMutation.mutateAsync();
      toast.success("Payout account created! Now let's complete the setup.");
      refetch();
    } catch (error) {
      toast.error("Failed to create payout account. Please try again.");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleStartOnboarding = async () => {
    setIsGeneratingLink(true);
    try {
      const { url } = await createOnboardingLinkMutation.mutateAsync();
      // Redirect to Stripe onboarding
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to generate onboarding link. Please try again.");
      setIsGeneratingLink(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      const { url } = await createDashboardLinkMutation.mutateAsync();
      window.open(url, '_blank');
    } catch (error) {
      toast.error("Failed to open Stripe dashboard. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-start gap-6">
          <UserAvatar size="lg" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Payout Settings</h1>
            <p className="text-gray-600 mt-2">
              Set up direct payouts powered by Stripe to receive earnings from BopShop sales, streaming, and fan support.
            </p>
          </div>
        </div>

        {/* Enterprise Compliance Badge */}
        <Card className="p-4 mb-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-900">Enterprise-Grade Compliance</p>
              <p className="text-sm text-green-700">
                Powered by Stripe Connect • No money transmitter licensing required • Fully compliant in 195+ countries
              </p>
            </div>
          </div>
        </Card>

        {/* Account Status Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payout Account Status</h2>
              {!accountStatus?.hasAccount && (
                <p className="text-gray-600 mb-4">
                  You need to set up a payout account to receive earnings. This takes about 2 minutes and is required for compliance.
                </p>
              )}
            </div>
            {accountStatus?.onboardingComplete && (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            )}
            {accountStatus?.hasAccount && !accountStatus?.onboardingComplete && (
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            )}
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-700">Account Created</span>
              <span className={accountStatus?.hasAccount ? "text-green-600 font-medium" : "text-gray-400"}>
                {accountStatus?.hasAccount ? "✓ Yes" : "Not yet"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-700">Onboarding Complete</span>
              <span className={accountStatus?.onboardingComplete ? "text-green-600 font-medium" : "text-gray-400"}>
                {accountStatus?.onboardingComplete ? "✓ Yes" : "Not yet"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-700">Can Accept Payments</span>
              <span className={accountStatus?.chargesEnabled ? "text-green-600 font-medium" : "text-gray-400"}>
                {accountStatus?.chargesEnabled ? "✓ Yes" : "Not yet"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">Payouts Enabled</span>
              <span className={accountStatus?.payoutsEnabled ? "text-green-600 font-medium" : "text-gray-400"}>
                {accountStatus?.payoutsEnabled ? "✓ Yes" : "Not yet"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            {!accountStatus?.hasAccount && (
              <Button
                onClick={handleCreateAccount}
                disabled={isCreatingAccount}
                className="flex items-center gap-2"
              >
                {isCreatingAccount && <Loader2 className="w-4 h-4 animate-spin" />}
                <CreditCard className="w-4 h-4" />
                Create Payout Account
              </Button>
            )}

            {accountStatus?.hasAccount && !accountStatus?.onboardingComplete && (
              <Button
                onClick={handleStartOnboarding}
                disabled={isGeneratingLink}
                className="flex items-center gap-2"
              >
                {isGeneratingLink && <Loader2 className="w-4 h-4 animate-spin" />}
                Complete Setup
              </Button>
            )}

            {accountStatus?.onboardingComplete && (
              <Button
                onClick={handleOpenDashboard}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Stripe Dashboard
              </Button>
            )}
          </div>
        </Card>

        {/* How Payouts Work */}
        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            How Payouts Work
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span><strong>Direct payments:</strong> Funds go directly from customers to your Stripe account (not through Boptone)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span><strong>Platform fees:</strong> Boptone automatically deducts fees based on your subscription tier</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span><strong>Your control:</strong> Set your own payout schedule (instant, daily, weekly, or monthly)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span><strong>Tax compliance:</strong> Stripe handles all tax reporting (1099-K forms) automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span><strong>No minimums:</strong> Get paid immediately with no minimum payout threshold</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span><strong>Global support:</strong> Works in 195+ countries with local currency support</span>
            </li>
          </ul>
        </Card>

        {/* Platform Fees Card */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Platform Fees
          </h3>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between py-2 border-b">
              <span>Free Tier</span>
              <span className="font-medium">12% of sales</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Pro Tier ($49/month)</span>
              <span className="font-medium">5% of sales</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Enterprise Tier ($149/month)</span>
              <span className="font-medium">2% of sales</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Platform fees are automatically deducted from each sale. Credit card processing fees (2.9% + $0.30) are passed through to you and handled by Stripe.
          </p>
        </Card>

        {/* Why Stripe Connect */}
        <Card className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Stripe Connect?</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Legal compliance:</strong> Stripe Connect eliminates the need for Boptone to obtain money transmitter licenses in 48 states (saving $500k-$2M in licensing costs). This means faster payouts and lower fees for you.
            </p>
            <p>
              <strong>Security:</strong> Your banking information is stored securely by Stripe (PCI-DSS Level 1 certified), not by Boptone. Stripe handles all KYC/AML compliance automatically.
            </p>
            <p>
              <strong>Global reach:</strong> Stripe supports 195+ countries and 135+ currencies, making it easy to receive payments from fans worldwide.
            </p>
            <p>
              <strong>Tax reporting:</strong> Stripe automatically generates and files 1099-K forms for US artists, eliminating manual tax paperwork.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
