import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Heart,
  Plus,
  Trash2,
  Star,
  DollarSign,
  AlertTriangle,
  Check,
  Loader2,
  Settings,
  FileText,
} from "lucide-react";

const PAYMENT_METHODS = [
  { value: "paypal", label: "PayPal", placeholder: "email or @username" },
  { value: "venmo", label: "Venmo", placeholder: "@username" },
  { value: "zelle", label: "Zelle", placeholder: "phone or email" },
  { value: "cashapp", label: "Cash App", placeholder: "$cashtag" },
  { value: "apple_cash", label: "Apple Cash", placeholder: "phone number" },
];

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
];

export default function KickInSettings() {
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [newMethod, setNewMethod] = useState({ method: "", handle: "", displayName: "" });
  const [taxCountry, setTaxCountry] = useState("");

  const utils = trpc.useUtils();

  // Queries
  const { data: paymentMethods, isLoading: methodsLoading } = trpc.kickIn.getMyPaymentMethods.useQuery();
  const { data: tipStats } = trpc.kickIn.getTipStats.useQuery();
  const { data: taxSettings } = trpc.kickIn.getTaxSettings.useQuery();
  const { data: taxStatus } = trpc.kickIn.getTaxComplianceStatus.useQuery();
  const { data: recentTips, isLoading: tipsLoading } = trpc.kickIn.getMyTips.useQuery({ limit: 10 });

  // Mutations
  const addMethodMutation = trpc.kickIn.addPaymentMethod.useMutation({
    onSuccess: () => {
      toast.success("Payment method added!");
      setAddMethodOpen(false);
      setNewMethod({ method: "", handle: "", displayName: "" });
      utils.kickIn.getMyPaymentMethods.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMethodMutation = trpc.kickIn.deletePaymentMethod.useMutation({
    onSuccess: () => {
      toast.success("Payment method removed");
      utils.kickIn.getMyPaymentMethods.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMethodMutation = trpc.kickIn.updatePaymentMethod.useMutation({
    onSuccess: () => {
      toast.success("Payment method updated");
      utils.kickIn.getMyPaymentMethods.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateTaxMutation = trpc.kickIn.updateTaxSettings.useMutation({
    onSuccess: () => {
      toast.success("Tax settings updated");
      utils.kickIn.getTaxSettings.invalidate();
      utils.kickIn.getTaxComplianceStatus.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const verifyTipMutation = trpc.kickIn.verifyTip.useMutation({
    onSuccess: () => {
      toast.success("Tip verified");
      utils.kickIn.getMyTips.invalidate();
      utils.kickIn.getTipStats.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleAddMethod = () => {
    if (!newMethod.method || !newMethod.handle) {
      toast.error("Please fill in all required fields");
      return;
    }
    addMethodMutation.mutate({
      method: newMethod.method as any,
      handle: newMethod.handle,
      displayName: newMethod.displayName || undefined,
      isPrimary: (paymentMethods?.length || 0) === 0,
    });
  };

  const handleSetPrimary = (id: number) => {
    updateMethodMutation.mutate({ id, isPrimary: true });
  };

  const handleSaveTaxSettings = () => {
    if (!taxCountry) {
      toast.error("Please select a country");
      return;
    }
    updateTaxMutation.mutate({ country: taxCountry });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-pink-500" />
            Kick In Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your tip jar and payment methods
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tips (This Year)</p>
                  <p className="text-2xl font-bold">
                    ${((tipStats?.totalAmount || 0) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Heart className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tips Received</p>
                  <p className="text-2xl font-bold">{tipStats?.tipCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Check className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified Tips</p>
                  <p className="text-2xl font-bold">{tipStats?.verifiedCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tax Compliance Alert */}
        {taxStatus?.requiresAction && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-600">Tax Action Required</h3>
                  <p className="text-sm text-muted-foreground mt-1">{taxStatus.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Add your payment handles so fans can tip you
                  </CardDescription>
                </div>
                <Dialog open={addMethodOpen} onOpenChange={setAddMethodOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                      <DialogDescription>
                        Add a way for fans to send you tips
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Payment Service</Label>
                        <Select
                          value={newMethod.method}
                          onValueChange={(v) => setNewMethod({ ...newMethod, method: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_METHODS.map((pm) => (
                              <SelectItem key={pm.value} value={pm.value}>
                                {pm.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Your Handle</Label>
                        <Input
                          placeholder={
                            PAYMENT_METHODS.find((p) => p.value === newMethod.method)?.placeholder ||
                            "Enter your handle"
                          }
                          value={newMethod.handle}
                          onChange={(e) => setNewMethod({ ...newMethod, handle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Display Name (optional)</Label>
                        <Input
                          placeholder="e.g., 'Main Account'"
                          value={newMethod.displayName}
                          onChange={(e) => setNewMethod({ ...newMethod, displayName: e.target.value })}
                        />
                      </div>
                      <Button
                        onClick={handleAddMethod}
                        disabled={addMethodMutation.isPending}
                        className="w-full"
                      >
                        {addMethodMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Add Payment Method"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {methodsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : paymentMethods?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payment methods added yet</p>
                  <p className="text-sm">Add one to start receiving tips!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods?.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{method.info?.name}</div>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {method.handle}
                        </code>
                        {method.isPrimary && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!method.isPrimary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetPrimary(method.id)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMethodMutation.mutate({ id: method.id })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tax Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tax Settings
              </CardTitle>
              <CardDescription>
                Configure your tax information for compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Country of Residence</Label>
                <Select
                  value={taxCountry || taxSettings?.country || ""}
                  onValueChange={setTaxCountry}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {taxStatus?.configured && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Year Total:</span>
                    <span className="font-medium">
                      ${((taxStatus.currentTotal || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                  {taxStatus.threshold && taxStatus.threshold > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reporting Threshold:</span>
                      <span className="font-medium">
                        ${(taxStatus.threshold / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {taxStatus.thresholdReached && (
                    <Badge variant="destructive" className="mt-2">
                      Threshold Reached
                    </Badge>
                  )}
                </div>
              )}

              <Button
                onClick={handleSaveTaxSettings}
                disabled={updateTaxMutation.isPending || !taxCountry}
                className="w-full"
              >
                {updateTaxMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Tax Settings"
                )}
              </Button>

              <p className="text-xs text-muted-foreground">
                Tips may be taxable income. Consult a tax professional for advice specific to your situation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tips</CardTitle>
            <CardDescription>
              Tips reported by fans. Verify to confirm receipt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tipsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : recentTips?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tips received yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTips?.map((tip) => (
                    <TableRow key={tip.id}>
                      <TableCell className="text-sm">
                        {new Date(tip.tippedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${(tip.amount / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="capitalize">{tip.paymentMethod.replace("_", " ")}</TableCell>
                      <TableCell>{tip.fanName || "Anonymous"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {tip.message || "-"}
                      </TableCell>
                      <TableCell>
                        {tip.isVerified ? (
                          <Badge variant="secondary" className="gap-1">
                            <Check className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!tip.isVerified && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => verifyTipMutation.mutate({ tipId: tip.id })}
                            disabled={verifyTipMutation.isPending}
                          >
                            Verify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
