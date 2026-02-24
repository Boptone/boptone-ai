import { useState } from "react";
import { useRequireArtist } from "@/hooks/useRequireArtist";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Check, DollarSign, CreditCard } from "lucide-react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Writer Profile Setup Page
 * Where songwriters configure their payment information for receiving split payouts
 */

export default function WriterProfile() {
  useRequireArtist(); // Enforce artist authentication
  const { user, loading: authLoading } = useAuth();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    ipiNumber: "",
    proAffiliation: "",
  });
  
  // Payment method form state
  const [paymentForm, setPaymentForm] = useState({
    type: "paypal" as "bank_account" | "paypal" | "venmo" | "zelle" | "crypto",
    // Bank
    bankName: "",
    bankAccountType: "checking" as "checking" | "savings",
    bankRoutingNumber: "",
    bankAccountNumber: "",
    // PayPal/Venmo/Zelle
    paypalEmail: "",
    venmoHandle: "",
    zelleEmail: "",
    // Crypto
    cryptoWalletAddress: "",
    cryptoCurrency: "",
    isDefault: false,
  });
  
  // Queries
  const { data: writerProfile, refetch: refetchProfile } = trpc.writerPayments.profile.getMy.useQuery();
  const { data: paymentMethods, refetch: refetchPaymentMethods } = trpc.writerPayments.paymentMethods.getAll.useQuery(
    undefined,
    { enabled: !!writerProfile }
  );
  
  // Mutations
  const createProfileMutation = trpc.writerPayments.profile.create.useMutation({
    onSuccess: () => {
      toast.success("Writer profile created!");
      refetchProfile();
      setIsCreatingProfile(false);
    },
    onError: (error) => {
      toast.error("Failed to create profile", { description: error.message });
    },
  });
  
  const addPaymentMethodMutation = trpc.writerPayments.paymentMethods.add.useMutation({
    onSuccess: () => {
      toast.success("Payment method added!");
      refetchPaymentMethods();
      setIsAddingPayment(false);
      resetPaymentForm();
    },
    onError: (error) => {
      toast.error("Failed to add payment method", { description: error.message });
    },
  });
  
  const setDefaultMutation = trpc.writerPayments.paymentMethods.setDefault.useMutation({
    onSuccess: () => {
      toast.success("Default payment method updated!");
      refetchPaymentMethods();
    },
    onError: (error) => {
      toast.error("Failed to update default", { description: error.message });
    },
  });
  
  const deletePaymentMethodMutation = trpc.writerPayments.paymentMethods.delete.useMutation({
    onSuccess: () => {
      toast.success("Payment method deleted!");
      refetchPaymentMethods();
    },
    onError: (error) => {
      toast.error("Failed to delete payment method", { description: error.message });
    },
  });
  
  const resetPaymentForm = () => {
    setPaymentForm({
      type: "paypal",
      bankName: "",
      bankAccountType: "checking",
      bankRoutingNumber: "",
      bankAccountNumber: "",
      paypalEmail: "",
      venmoHandle: "",
      zelleEmail: "",
      cryptoWalletAddress: "",
      cryptoCurrency: "",
      isDefault: false,
    });
  };
  
  const handleCreateProfile = () => {
    createProfileMutation.mutate(profileForm);
  };
  
  const handleAddPaymentMethod = () => {
    addPaymentMethodMutation.mutate(paymentForm);
  };
  
  const handleSetDefault = (methodId: number) => {
    setDefaultMutation.mutate({ methodId });
  };
  
  const handleDeletePaymentMethod = (methodId: number) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      deletePaymentMethodMutation.mutate({ methodId });
    }
  };
  
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!user) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to manage your writer profile</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Writer Profile & Payments</h1>
          <p className="text-muted-foreground">
            Manage your songwriter profile and payment information for receiving split payouts
          </p>
        </div>
        
        {/* Profile Section */}
        {!writerProfile ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Create Writer Profile
              </CardTitle>
              <CardDescription>
                Set up your writer profile to receive payments from tracks you've contributed to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                onClick={handleCreateProfile}
                disabled={!profileForm.fullName || !profileForm.email || createProfileMutation.isPending}
                className="w-full"
              >
                {createProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  "Create Writer Profile"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Profile Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  Writer Profile Active
                </CardTitle>
                <CardDescription>Your songwriter profile is set up and ready</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-medium">{writerProfile.fullName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{writerProfile.email}</p>
                  </div>
                  {writerProfile.ipiNumber && (
                    <div>
                      <p className="text-muted-foreground">IPI Number</p>
                      <p className="font-medium">{writerProfile.ipiNumber}</p>
                    </div>
                  )}
                  {writerProfile.proAffiliation && (
                    <div>
                      <p className="text-muted-foreground">PRO</p>
                      <p className="font-medium">{writerProfile.proAffiliation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Methods Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Add payment methods to receive your songwriter split payouts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods && paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium capitalize">{method.type.replace("_", " ")}</p>
                            {method.isDefault && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {method.type === "bank_account" && `${method.bankName} - ${method.bankAccountType}`}
                            {method.type === "paypal" && method.paypalEmail}
                            {method.type === "venmo" && `@${method.venmoHandle}`}
                            {method.type === "zelle" && method.zelleEmail}
                            {method.type === "crypto" && `${method.cryptoCurrency} - ${method.cryptoWalletAddress?.substring(0, 10)}...`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!method.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(method.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePaymentMethod(method.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      No payment methods added yet. Add one below to receive payouts.
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Add Payment Method Form */}
                {isAddingPayment ? (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
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
                    
                    {/* Conditional fields based on payment type */}
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
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddPaymentMethod}
                        disabled={addPaymentMethodMutation.isPending}
                        className="flex-1"
                      >
                        {addPaymentMethodMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Payment Method"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingPayment(false);
                          resetPaymentForm();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingPayment(true)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
