import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
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
      <div className="border border-gray-200 bg-white p-12">
        <h3 className="text-3xl font-bold mb-2">Earnings</h3>
        <p className="text-lg text-gray-600">Loading balance...</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 bg-white p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-4xl font-bold">Earnings</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/settings/payouts")}
          className="text-gray-600 hover:text-gray-900"
        >
          View All →
        </Button>
      </div>

      {/* Available Balance */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-2">Available Balance</p>
        <p className="text-6xl font-bold text-gray-900">
          {formatCurrency(balance?.availableBalance || 0)}
        </p>
      </div>

      {/* Balance Breakdown */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Pending</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(balance?.pendingBalance || 0)}
          </p>
        </div>

        <div className="p-6 bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Withdrawn</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(balance?.withdrawnBalance || 0)}
          </p>
        </div>
      </div>

      {/* Payout Schedule Info */}
      {balance && (
        <div className="mb-8 p-6 bg-white border border-gray-300">
          <p className="text-sm text-gray-600 font-medium mb-1">Payout Schedule</p>
          <p className="text-lg font-semibold text-gray-900">
            {getScheduleLabel(balance.payoutSchedule)}
            {nextPayoutDate && ` • Next: ${nextPayoutDate}`}
          </p>
        </div>
      )}

      {/* Recent Payout Status */}
      {recentPayout && (
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Recent Payout</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(recentPayout.netAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 capitalize mb-1">
                {recentPayout.status}
              </p>
              <p className="text-sm text-gray-600">
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
        className="w-full rounded-full h-14 text-lg bg-black hover:bg-gray-800 text-white"
        size="lg"
      >
        Withdraw Funds
      </Button>

      {balance?.isOnHold && (
        <p className="text-sm text-gray-600 text-center mt-3">
          Payouts temporarily on hold
        </p>
      )}

      {balance && balance.availableBalance < 2000 && !balance.isOnHold && (
        <p className="text-sm text-gray-500 text-center mt-3">
          Minimum withdrawal: $20.00
        </p>
      )}
    </div>
  );
}
