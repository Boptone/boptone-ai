import AdminDashboard from "@/components/AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Admin Product Analytics Dashboard
 * 
 * Features:
 * - Total products, active products, revenue per product metrics
 * - Bar chart: Top-selling products
 * - Line chart: Product performance trends
 * - Pie chart: Product category distribution
 * - Date range selector
 */
export default function AdminProducts() {
  // TODO: Replace with real tRPC queries
  // const { data: analytics } = trpc.admin.products.getAnalytics.useQuery();

  // Mock data
  const metrics = {
    totalProducts: 89,
    activeProducts: 76,
    avgRevenuePerProduct: 145.50,
    totalRevenue: 12945.50,
  };

  // Top-selling products (Bar chart)
  const topProducts = [
    { name: "Product A", sales: 45, revenue: 1350 },
    { name: "Product B", sales: 38, revenue: 1140 },
    { name: "Product C", sales: 32, revenue: 960 },
    { name: "Product D", sales: 28, revenue: 840 },
    { name: "Product E", sales: 24, revenue: 720 },
  ];

  // Product performance trends (Line chart)
  const performanceTrends = [
    { month: "Jan", sales: 120, revenue: 3600 },
    { month: "Feb", sales: 145, revenue: 4350 },
    { month: "Mar", sales: 132, revenue: 3960 },
    { month: "Apr", sales: 168, revenue: 5040 },
    { month: "May", sales: 185, revenue: 5550 },
    { month: "Jun", sales: 195, revenue: 5850 },
  ];

  // Category distribution (Pie chart)
  const categoryData = [
    { name: "Music", value: 35, color: "#3b82f6" },
    { name: "Merch", value: 28, color: "#10b981" },
    { name: "Digital", value: 18, color: "#f59e0b" },
    { name: "Other", value: 8, color: "#8b5cf6" },
  ];

  return (
    <AdminDashboard>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Analytics</h1>
        <p className="text-gray-600 mb-8">
          Track product performance, sales trends, and category distribution.
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metrics.totalProducts}</div>
              <p className="text-xs text-gray-500 mt-1">All products in catalog</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metrics.activeProducts}</div>
              <p className="text-xs text-gray-500 mt-1">Currently available for sale</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Revenue/Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${metrics.avgRevenuePerProduct.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Per product performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${metrics.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-green-600 mt-1">+15.3% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top-Selling Products Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top-Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Product Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Trends Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Product Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Sales"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Sales
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Revenue
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Avg Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {product.sales}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        ${product.revenue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        ${(product.revenue / product.sales).toFixed(2)}
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
