import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Zap,
  Calendar,
  CreditCard,
} from "lucide-react";

export default function PayoutSettings() {
  const utils = trpc.useUtils();

  // Queries
  const { data: balance, isLoading: balanceLoading } = trpc.payouts.getBalance.useQuery();
  const { data: accounts, isLoading: accountsLoading } = trpc.payouts.getAccounts.useQuery();
  const { data: history, isLoading: historyLoading } = trpc.payouts.getHistory.useQuery({
    limit: 20,
  });

  // Mutations
  const addAccountMutation = trpc.payouts.addAccount.useMutation({
    onSuccess: () => {
      toast.success("Bank account added successfully");
      utils.payouts.getAccounts.invalidate();
      setShowAddAccountDialog(false);
      setNewAccount({
        accountHolderName: "",
        accountType: "checking",
        routingNumber: "",
        accountNumber: "",
        bankName: "",
        isDefault: false,
      });
    },
    onError: (error) => {
      toast.error(`Failed to add account: ${error.message}`);
    },
  });

  const deleteAccountMutation = trpc.payouts.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Bank account deleted");
      utils.payouts.getAccounts.invalidate();
      setAccountToDelete(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete account: ${error.message}`);
    },
  });

  const updateScheduleMutation = trpc.payouts.updatePayoutSchedule.useMutation({
    onSuccess: () => {
      toast.success("Payout schedule updated");
      utils.payouts.getBalance.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update schedule: ${error.message}`);
    },
  });

  const requestPayoutMutation = trpc.payouts.requestPayout.useMutation({
    onSuccess: () => {
      toast.success("Payout requested successfully");
      utils.payouts.getBalance.invalidate();
      utils.payouts.getHistory.invalidate();
      setShowPayoutDialog(false);
      setPayoutRequest({ amount: "", payoutType: "standard", payoutAccountId: null });
    },
    onError: (error) => {
      toast.error(`Payout request failed: ${error.message}`);
    },
  });

  // State
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null);
  const [newAccount, setNewAccount] = useState({
    accountHolderName: "",
    accountType: "checking" as "checking" | "savings",
    routingNumber: "",
    accountNumber: "",
    bankName: "",
    isDefault: false,
  });
  const [payoutRequest, setPayoutRequest] = useState<{
    amount: string;
    payoutType: "standard" | "instant";
    payoutAccountId: number | null;
  }>({
    amount: "",
    payoutType: "standard",
    payoutAccountId: null,
  });

  // Helper functions
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
      case "processing":
        return "text-yellow-600";
      case "failed":
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const calculateInstantFee = () => {
    const amountCents = Math.round(parseFloat(payoutRequest.amount || "0") * 100);
    if (payoutRequest.payoutType === "instant" && amountCents > 0) {
      const fee = Math.ceil(amountCents * 0.01);
      return { fee, netAmount: amountCents - fee };
    }
    return { fee: 0, netAmount: amountCents };
  };

  const handleAddAccount = () => {
    addAccountMutation.mutate(newAccount);
  };

  const handleRequestPayout = () => {
    if (!payoutRequest.payoutAccountId) {
      toast.error("Please select a bank account");
      return;
    }

    const amountCents = Math.round(parseFloat(payoutRequest.amount || "0") * 100);
    if (amountCents < 2000) {
      toast.error("Minimum payout amount is $20.00");
      return;
    }

    requestPayoutMutation.mutate({
      amount: amountCents,
      payoutType: payoutRequest.payoutType,
      payoutAccountId: payoutRequest.payoutAccountId,
    });
  };

  const defaultAccount = accounts?.find((a) => a.isDefault);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payout Settings</h1>
          <p className="text-base text-gray-600">
            Manage your bank accounts, configure payout schedules, and withdraw your earnings
          </p>
        </div>

        {/* Current Balance Card */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-300 mb-2">Available Balance</p>
              <p className="text-5xl font-bold tracking-tight mb-4">
                {balanceLoading ? "..." : formatCurrency(balance?.availableBalance || 0)}
              </p>
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-gray-400">Pending</p>
                  <p className="font-semibold">
                    {balanceLoading ? "..." : formatCurrency(balance?.pendingBalance || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Withdrawn</p>
                  <p className="font-semibold">
                    {balanceLoading ? "..." : formatCurrency(balance?.withdrawnBalance || 0)}
                  </p>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => setShowPayoutDialog(true)}
              disabled={!balance || balance.availableBalance < 2000 || balance.isOnHold}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Withdraw Funds
            </Button>
          </div>

          {balance?.isOnHold && (
            <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-sm font-medium text-yellow-200">
                ⚠️ Payouts temporarily on hold: {balance.holdReason}
              </p>
            </div>
          )}
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Bank Accounts */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Bank Accounts</h2>
              <Button onClick={() => setShowAddAccountDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </div>

            {accountsLoading ? (
              <p className="text-sm text-gray-500">Loading accounts...</p>
            ) : accounts && accounts.length > 0 ? (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {account.bankName || "Bank Account"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {account.accountType} •••• {account.accountNumberLast4}
                        </p>
                        {account.isDefault && (
                          <span className="inline-block mt-1 text-xs font-medium text-green-600">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAccountToDelete(account.id)}
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">No bank accounts added yet</p>
                <Button onClick={() => setShowAddAccountDialog(true)} size="sm">
                  Add Your First Account
                </Button>
              </div>
            )}
          </Card>

          {/* Payout Schedule */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Payout Schedule</h2>
            </div>

            <RadioGroup
              value={balance?.payoutSchedule || "manual"}
              onValueChange={(value) => {
                updateScheduleMutation.mutate({
                  payoutSchedule: value as "daily" | "weekly" | "monthly" | "manual",
                });
              }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="flex-1 cursor-pointer">
                  <p className="font-medium text-gray-900">Manual</p>
                  <p className="text-sm text-gray-500">Request payouts when you want</p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="flex-1 cursor-pointer">
                  <p className="font-medium text-gray-900">Daily</p>
                  <p className="text-sm text-gray-500">Auto-payout every day ($20 min)</p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                  <p className="font-medium text-gray-900">Weekly</p>
                  <p className="text-sm text-gray-500">Auto-payout every Monday</p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                  <p className="font-medium text-gray-900">Monthly</p>
                  <p className="text-sm text-gray-500">Auto-payout on the 1st of each month</p>
                </Label>
              </div>
            </RadioGroup>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Auto-payouts only trigger when your balance exceeds $20.
                You can always request manual payouts anytime.
              </p>
            </div>
          </Card>
        </div>

        {/* Payout History */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Payout History</h2>

          {historyLoading ? (
            <p className="text-sm text-gray-500">Loading history...</p>
          ) : history && history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Arrival
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((payout) => (
                    <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {formatDate(payout.requestedAt)}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">
                        {formatCurrency(payout.netAmount)}
                        {payout.fee > 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            (${(payout.fee / 100).toFixed(2)} fee)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {payout.payoutType === "instant" ? (
                          <span className="inline-flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Instant
                          </span>
                        ) : (
                          "Standard"
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payout.status)}
                          <span className={`text-sm capitalize ${getStatusColor(payout.status)}`}>
                            {payout.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {payout.status === "completed"
                          ? formatDate(payout.completedAt)
                          : formatDate(payout.estimatedArrival)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No payout history yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Add Bank Account Dialog */}
      <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
            <DialogDescription>
              Add a bank account to receive payouts. Your information is encrypted and secure.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                value={newAccount.accountHolderName}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, accountHolderName: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="accountType">Account Type</Label>
              <Select
                value={newAccount.accountType}
                onValueChange={(value: "checking" | "savings") =>
                  setNewAccount({ ...newAccount, accountType: value })
                }
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

            <div>
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                value={newAccount.routingNumber}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, routingNumber: e.target.value.replace(/\D/g, "") })
                }
                placeholder="123456789"
                maxLength={9}
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                type="password"
                value={newAccount.accountNumber}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, accountNumber: e.target.value.replace(/\D/g, "") })
                }
                placeholder="••••••••••"
              />
            </div>

            <div>
              <Label htmlFor="bankName">Bank Name (Optional)</Label>
              <Input
                id="bankName"
                value={newAccount.bankName}
                onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                placeholder="Chase, Bank of America, etc."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={newAccount.isDefault}
                onChange={(e) => setNewAccount({ ...newAccount, isDefault: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Set as default account
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAccountDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAccount}
              disabled={
                !newAccount.accountHolderName ||
                !newAccount.routingNumber ||
                !newAccount.accountNumber ||
                newAccount.routingNumber.length !== 9 ||
                addAccountMutation.isPending
              }
            >
              {addAccountMutation.isPending ? "Adding..." : "Add Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Payout Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>
              Withdraw your available earnings to your bank account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="payoutAmount">Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="payoutAmount"
                  type="number"
                  step="0.01"
                  min="20"
                  max={(balance?.availableBalance || 0) / 100}
                  value={payoutRequest.amount}
                  onChange={(e) => setPayoutRequest({ ...payoutRequest, amount: e.target.value })}
                  placeholder="20.00"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum: $20.00 • Available: {formatCurrency(balance?.availableBalance || 0)}
              </p>
            </div>

            <div>
              <Label htmlFor="payoutAccount">Bank Account</Label>
              <Select
                value={payoutRequest.payoutAccountId?.toString() || ""}
                onValueChange={(value) =>
                  setPayoutRequest({ ...payoutRequest, payoutAccountId: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.bankName || "Bank Account"} •••• {account.accountNumberLast4}
                      {account.isDefault && " (Default)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Payout Speed</Label>
              <RadioGroup
                value={payoutRequest.payoutType}
                onValueChange={(value: "standard" | "instant") =>
                  setPayoutRequest({ ...payoutRequest, payoutType: value })
                }
                className="space-y-2 mt-2"
              >
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="flex-1 cursor-pointer">
                    <p className="font-medium">Standard (Free)</p>
                    <p className="text-sm text-gray-500">Next business day</p>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <RadioGroupItem value="instant" id="instant" />
                  <Label htmlFor="instant" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <p className="font-medium">Instant (1% fee)</p>
                    </div>
                    <p className="text-sm text-gray-500">Arrives in ~1 hour</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {payoutRequest.amount && parseFloat(payoutRequest.amount) >= 20 && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">
                    ${parseFloat(payoutRequest.amount).toFixed(2)}
                  </span>
                </div>
                {payoutRequest.payoutType === "instant" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fee (1%)</span>
                    <span className="text-red-600">
                      -${(calculateInstantFee().fee / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                  <span>You'll receive</span>
                  <span>${(calculateInstantFee().netAmount / 100).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestPayout}
              disabled={
                !payoutRequest.amount ||
                parseFloat(payoutRequest.amount) < 20 ||
                !payoutRequest.payoutAccountId ||
                requestPayoutMutation.isPending
              }
            >
              {requestPayoutMutation.isPending ? "Processing..." : "Request Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={accountToDelete !== null} onOpenChange={() => setAccountToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this bank account from your payout settings. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (accountToDelete) {
                  deleteAccountMutation.mutate({ accountId: accountToDelete });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
