import AdminDashboard from "@/components/AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Admin Revenue Tracking Dashboard
 * 
 * Features:
 * - Total revenue, pending, paid out metrics
 * - Revenue by product category chart
 * - Revenue by artist table
 * - Payout history table
 * - Date range filtering
 */
export default function AdminRevenue() {
  // TODO: Replace with real tRPC queries
  // const { data: revenueData } = trpc.admin.revenue.getOverview.useQuery();

  // Mock data
  const metrics = {
    totalRevenue: 45678.90,
    pendingRevenue: 8234.50,
    paidOut: 37444.40,
    platformFee: 4567.89,
  };

  // Revenue by category
  const revenueByCategory = [
    { category: "BopShop", revenue: 18500, percentage: 40.5 },
    { category: "BAP Streams", revenue: 12300, percentage: 26.9 },
    { category: "Kick In Tips", revenue: 8900, percentage: 19.5 },
    { category: "Subscriptions", revenue: 5978.90, percentage: 13.1 },
  ];

  // Revenue trends
  const revenueTrends = [
    { month: "Jan", revenue: 5200, payout: 4680 },
    { month: "Feb", revenue: 6100, payout: 5490 },
    { month: "Mar", revenue: 5800, payout: 5220 },
    { month: "Apr", revenue: 7200, payout: 6480 },
    { month: "May", revenue: 8400, payout: 7560 },
    { month: "Jun", revenue: 12978.90, payout: 7014.40 },
  ];

  // Revenue by artist
  const revenueByArtist = [
    { artist: "Artist A", revenue: 12500, orders: 145, avgOrder: 86.21 },
    { artist: "Artist B", revenue: 9800, orders: 98, avgOrder: 100 },
    { artist: "Artist C", revenue: 7600, orders: 76, avgOrder: 100 },
    { artist: "Artist D", revenue: 6200, orders: 62, avgOrder: 100 },
    { artist: "Artist E", revenue: 5100, orders: 51, avgOrder: 100 },
  ];

  // Payout history
  const payoutHistory = [
    { id: 1, artist: "Artist A", amount: 2500, date: "2026-02-15", status: "completed" },
    { id: 2, artist: "Artist B", amount: 1800, date: "2026-02-14", status: "completed" },
    { id: 3, artist: "Artist C", amount: 1200, date: "2026-02-13", status: "pending" },
    { id: 4, artist: "Artist D", amount: 950, date: "2026-02-12", status: "completed" },
  ];

  const getStatusBadgeColor = (status: string) => {
    return status === "completed" 
      ? "bg-green-100 text-green-800" 
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <AdminDashboard>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Revenue Tracking</h1>
        <p className="text-gray-600 mb-8">
          Monitor revenue streams, payouts, and earnings breakdown across the platform.
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${metrics.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 mt-1">+18.7% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${metrics.pendingRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Paid Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${metrics.paidOut.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Successfully transferred</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Platform Fee (10%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${metrics.platformFee.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total platform earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Payout Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="payout"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Payout"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Artist Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Revenue by Artist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Artist
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Revenue
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Orders
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Avg Order
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revenueByArtist.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {item.artist}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        ${item.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {item.orders}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        ${item.avgOrder.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payout History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Artist
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payoutHistory.map((payout) => (
                    <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {payout.artist}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        ${payout.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(payout.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(payout.status)}`}>
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboard>
  );
}
