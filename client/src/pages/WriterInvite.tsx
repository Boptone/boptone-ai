import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Music, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Writer Invitation Acceptance Page
 * Where invited songwriters accept their invitation and set up payment profile
 * URL: /writer-invite?token={inviteToken}
 */

export default function WriterInvite() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [step, setStep] = useState<"loading" | "profile" | "payment" | "success">("loading");
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    ipiNumber: "",
    proAffiliation: "",
  });
  
  // Payment method form state
  const [paymentForm, setPaymentForm] = useState({
    type: "paypal" as "bank_account" | "paypal" | "venmo" | "zelle" | "crypto",
    bankName: "",
    bankAccountType: "checking" as "checking" | "savings",
    bankRoutingNumber: "",
    bankAccountNumber: "",
    paypalEmail: "",
    venmoHandle: "",
    zelleEmail: "",
    cryptoWalletAddress: "",
    cryptoCurrency: "",
  });
  
  // Extract token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get("token");
    if (inviteToken) {
      setToken(inviteToken);
    } else {
      toast.error("Invalid invitation link");
      setLocation("/");
    }
  }, [setLocation]);
  
  // Fetch invitation details
  const { data: invitation, isLoading: loadingInvitation } = trpc.writerPayments.invitations.getByToken.useQuery(
    { token: token! },
    { enabled: !!token }
  );
  
  useEffect(() => {
    if (invitation) {
      // Pre-fill form with invitation data
      setProfileForm(prev => ({
        ...prev,
        fullName: invitation.fullName,
        email: invitation.email,
      }));
      setStep("profile");
    }
  }, [invitation]);
  
  // Mutations
  const acceptInvitationMutation = trpc.writerPayments.invitations.accept.useMutation({
    onSuccess: async () => {
      // After accepting, add payment method
      if (paymentForm.type) {
        try {
          await addPaymentMethodMutation.mutateAsync(paymentForm);
        } catch (error) {
          console.error("Failed to add payment method:", error);
        }
      }
      setStep("success");
      toast.success("Welcome to Boptone! Your writer profile is set up.");
    },
    onError: (error) => {
      toast.error("Failed to accept invitation", { description: error.message });
    },
  });
  
  const addPaymentMethodMutation = trpc.writerPayments.paymentMethods.add.useMutation();
  
  const handleAcceptInvitation = () => {
    if (!token) return;
    acceptInvitationMutation.mutate({ token });
  };
  
  if (loadingInvitation || step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>This invitation link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-center">You're All Set!</h2>
            <p className="text-center text-muted-foreground">
              Your writer profile has been created and you're ready to receive payments for your contributions.
            </p>
            <div className="w-full space-y-2 pt-4">
              <Button onClick={() => setLocation("/writer-profile")} className="w-full">
                View My Profile
              </Button>
              <Button onClick={() => setLocation("/writer-earnings")} variant="outline" className="w-full">
                View My Earnings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Music className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Writer Invitation</CardTitle>
              <CardDescription>
                You've been invited to collaborate on a track
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <Alert>
            <AlertDescription>
              <strong>Track:</strong> Track ID #{invitation.trackId} • <strong>Split:</strong> {invitation.splitPercentage}%
            </AlertDescription>
          </Alert>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === "profile" ? "bg-primary text-white" : "bg-gray-200"}`}>
              1
            </div>
            <div className="w-12 h-1 bg-gray-200"></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === "payment" ? "bg-primary text-white" : "bg-gray-200"}`}>
              2
            </div>
          </div>
          
          {step === "profile" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Step 1: Your Profile</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Confirm your information to create your writer profile
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Your legal name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ipiNumber">IPI Number (Optional)</Label>
                  <Input
                    id="ipiNumber"
                    value={profileForm.ipiNumber}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, ipiNumber: e.target.value }))}
                    placeholder="00123456789"
                  />
                  <p className="text-xs text-muted-foreground">International Performer Identifier</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proAffiliation">PRO Affiliation (Optional)</Label>
                  <Input
                    id="proAffiliation"
                    value={profileForm.proAffiliation}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, proAffiliation: e.target.value }))}
                    placeholder="ASCAP, BMI, SESAC, etc."
                  />
                </div>
              </div>
              
              <Button
                onClick={() => setStep("payment")}
                disabled={!profileForm.fullName || !profileForm.email}
                className="w-full"
              >
                Continue to Payment Setup
              </Button>
            </div>
          )}
          
          {step === "payment" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Step 2: Payment Method
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add a payment method to receive your songwriter split payouts
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <Select
                    value={paymentForm.type}
                    onValueChange={(value: any) => setPaymentForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="venmo">Venmo</SelectItem>
                      <SelectItem value="zelle">Zelle</SelectItem>
                      <SelectItem value="bank_account">Bank Account</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {paymentForm.type === "bank_account" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input
                          value={paymentForm.bankName}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, bankName: e.target.value }))}
                          placeholder="Chase, Bank of America, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Type</Label>
                        <Select
                          value={paymentForm.bankAccountType}
                          onValueChange={(value: any) => setPaymentForm(prev => ({ ...prev, bankAccountType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="checking">Checking</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Routing Number</Label>
                        <Input
                          value={paymentForm.bankRoutingNumber}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, bankRoutingNumber: e.target.value }))}
                          placeholder="9 digits"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input
                          value={paymentForm.bankAccountNumber}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                          placeholder="Account number"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {paymentForm.type === "paypal" && (
                  <div className="space-y-2">
                    <Label>PayPal Email</Label>
                    <Input
                      type="email"
                      value={paymentForm.paypalEmail}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, paypalEmail: e.target.value }))}
                      placeholder="your@paypal.com"
                    />
                  </div>
                )}
                
                {paymentForm.type === "venmo" && (
                  <div className="space-y-2">
                    <Label>Venmo Handle</Label>
                    <Input
                      value={paymentForm.venmoHandle}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, venmoHandle: e.target.value }))}
                      placeholder="@yourhandle"
                    />
                  </div>
                )}
                
                {paymentForm.type === "zelle" && (
                  <div className="space-y-2">
                    <Label>Zelle Email</Label>
                    <Input
                      type="email"
                      value={paymentForm.zelleEmail}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, zelleEmail: e.target.value }))}
                      placeholder="your@zelle.com"
                    />
                  </div>
                )}
                
                {paymentForm.type === "crypto" && (
                  <>
                    <div className="space-y-2">
                      <Label>Cryptocurrency</Label>
                      <Input
                        value={paymentForm.cryptoCurrency}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, cryptoCurrency: e.target.value }))}
                        placeholder="BTC, ETH, USDC, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Wallet Address</Label>
                      <Input
                        value={paymentForm.cryptoWalletAddress}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, cryptoWalletAddress: e.target.value }))}
                        placeholder="0x..."
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("profile")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleAcceptInvitation}
                  disabled={acceptInvitationMutation.isPending}
                  className="flex-1"
                >
                  {acceptInvitationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
