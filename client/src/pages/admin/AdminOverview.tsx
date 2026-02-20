import AdminDashboard from "@/components/AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

/**
 * Admin Overview Dashboard
 * 
 * High-level metrics and summary cards:
 * - Total Revenue
 * - Total Orders
 * - Total Products
 * - Growth Rate
 */
export default function AdminOverview() {
  // TODO: Replace with real data from tRPC queries
  const stats = [
    {
      title: "Total Revenue",
      value: "$12,345",
      change: "+20.1%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Total Orders",
      value: "234",
      change: "+15.3%",
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Total Products",
      value: "89",
      change: "+5.2%",
      icon: Package,
      trend: "up",
    },
    {
      title: "Growth Rate",
      value: "18.7%",
      change: "+2.4%",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  return (
    <AdminDashboard>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Overview</h1>
        <p className="text-gray-600 mb-8">
          Welcome to your admin dashboard. Here's a summary of your platform's performance.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"} mt-1`}>
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No recent activity to display.</p>
            {/* TODO: Add recent orders, new products, etc. */}
          </CardContent>
        </Card>
      </div>
    </AdminDashboard>
  );
}
