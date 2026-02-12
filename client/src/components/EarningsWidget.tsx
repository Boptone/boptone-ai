import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

/**
 * Earnings Widget
 * Displays current balance and quick access to withdraw funds
 * Designed for main dashboard
 */
export function EarningsWidget() {
  const [, setLocation] = useLocation();

  // Fetch earnings balance
  const { data: balance, isLoading } = trpc.payouts.getBalance.useQuery();

  // Fetch recent payout history (last 1)
  const { data: history } = trpc.payouts.getHistory.useQuery({ limit: 1 });

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getNextPayoutDate = () => {
    if (!balance || balance.payoutSchedule === "manual") {
      return null;
    }

    const now = new Date();
    let nextDate = new Date();

    switch (balance.payoutSchedule) {
      case "daily":
        nextDate.setDate(now.getDate() + 1);
        break;
      case "weekly":
        // Next Monday
        const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
        nextDate.setDate(now.getDate() + daysUntilMonday);
        break;
      case "monthly":
        // 1st of next month
        nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
    }

    return nextDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getScheduleLabel = (schedule: string) => {
    switch (schedule) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      default:
        return "Manual";
    }
  };

  const recentPayout = history?.[0];
  const nextPayoutDate = getNextPayoutDate();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <DollarSign className="h-5 w-5 text-gray-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Earnings</h3>
        </div>
        <p className="text-sm text-gray-500">Loading balance...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Earnings</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/settings/payouts")}
          className="text-gray-600 hover:text-gray-900"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Available Balance */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-1">Available Balance</p>
        <p className="text-4xl font-bold text-gray-900 tracking-tight">
          {formatCurrency(balance?.availableBalance || 0)}
        </p>
      </div>

      {/* Balance Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <p className="text-xs text-gray-600">Pending</p>
          </div>
          <p className="text-base font-semibold text-gray-900">
            {formatCurrency(balance?.pendingBalance || 0)}
          </p>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <p className="text-xs text-gray-600">Withdrawn</p>
          </div>
          <p className="text-base font-semibold text-gray-900">
            {formatCurrency(balance?.withdrawnBalance || 0)}
          </p>
        </div>
      </div>

      {/* Payout Schedule Info */}
      {balance && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-medium mb-1">Payout Schedule</p>
              <p className="text-sm font-semibold text-blue-900">
                {getScheduleLabel(balance.payoutSchedule)}
                {nextPayoutDate && ` • Next: ${nextPayoutDate}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Payout Status */}
      {recentPayout && (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {recentPayout.status === "completed" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-yellow-600" />
              )}
              <div>
                <p className="text-xs text-gray-600">Recent Payout</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(recentPayout.netAmount)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-xs font-medium capitalize ${
                  recentPayout.status === "completed"
                    ? "text-green-600"
                    : recentPayout.status === "failed"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {recentPayout.status}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(recentPayout.requestedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Button */}
      <Button
        onClick={() => setLocation("/settings/payouts")}
        disabled={!balance || balance.availableBalance < 2000 || balance.isOnHold}
        className="w-full"
        size="lg"
      >
        <DollarSign className="h-5 w-5 mr-2" />
        Withdraw Funds
      </Button>

      {balance?.isOnHold && (
        <p className="text-xs text-red-600 text-center mt-2">
          ⚠️ Payouts temporarily on hold
        </p>
      )}

      {balance && balance.availableBalance < 2000 && !balance.isOnHold && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Minimum withdrawal: $20.00
        </p>
      )}
    </Card>
  );
}
