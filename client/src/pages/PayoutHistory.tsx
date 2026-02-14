import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

/**
 * Payout History Page
 * Displays a table of past payouts with date, amount, and status
 */
export default function PayoutHistory() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data: payouts, isLoading, error } = trpc.payouts.getHistory.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated }
  );

  // Format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  // Format date
  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // Get status badge styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-black text-white";
      case "processing":
        return "bg-gray-200 text-black border-2 border-gray-400";
      case "failed":
      case "cancelled":
        return "bg-white text-black border-2 border-black";
      default:
        return "bg-white text-black border-2 border-gray-300";
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="max-w-md border-4 border-black rounded-none bg-white">
          <CardHeader>
            <CardTitle className="text-black">Authentication Required</CardTitle>
            <CardDescription className="text-gray-600">Please log in to view your payout history.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="max-w-md border-4 border-black rounded-none bg-white">
          <CardHeader>
            <CardTitle className="text-black">Error Loading Payouts</CardTitle>
            <CardDescription className="text-gray-600">{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4 rounded-full">
              <span className="mr-2">←</span>
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-black">Payout History</h1>
              <p className="text-gray-600">
                View all your past payouts and their status
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full border-2 border-black">
              <span className="mr-2">↓</span>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Payouts Table */}
        <Card className="border-4 border-black rounded-none bg-white">
          <CardContent className="p-0">
            {!payouts || payouts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-600 mb-4">No payouts yet</p>
                <Link href="/dashboard">
                  <Button className="rounded-full bg-black hover:bg-gray-800 text-white">Go to Dashboard</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-black">
                    <TableHead className="text-black font-bold">Date</TableHead>
                    <TableHead className="text-black font-bold">Amount</TableHead>
                    <TableHead className="text-black font-bold">Type</TableHead>
                    <TableHead className="text-black font-bold">Status</TableHead>
                    <TableHead className="text-black font-bold">Fee</TableHead>
                    <TableHead className="text-black font-bold">Net Amount</TableHead>
                    <TableHead className="text-right text-black font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id} className="border-b border-gray-200">
                      <TableCell className="font-medium text-black">
                        {formatDate(payout.requestedAt)}
                      </TableCell>
                      <TableCell className="text-black">{formatCurrency(payout.amount)}</TableCell>
                      <TableCell className="capitalize text-black">{payout.payoutType}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusStyle(payout.status)} rounded-full`}>
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{formatCurrency(payout.fee)}</TableCell>
                      <TableCell className="font-semibold text-black">
                        {formatCurrency(payout.netAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="rounded-full">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {payouts && payouts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="border-4 border-black rounded-none bg-white">
              <CardHeader className="pb-3">
                <CardDescription className="text-gray-600">Total Payouts</CardDescription>
                <CardTitle className="text-2xl text-black">
                  {payouts.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-4 border-black rounded-none bg-white">
              <CardHeader className="pb-3">
                <CardDescription className="text-gray-600">Total Amount</CardDescription>
                <CardTitle className="text-2xl text-black">
                  {formatCurrency(
                    payouts.reduce((sum, p) => sum + p.amount, 0)
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-4 border-black rounded-none bg-white">
              <CardHeader className="pb-3">
                <CardDescription className="text-gray-600">Total Fees</CardDescription>
                <CardTitle className="text-2xl text-black">
                  {formatCurrency(
                    payouts.reduce((sum, p) => sum + p.fee, 0)
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
