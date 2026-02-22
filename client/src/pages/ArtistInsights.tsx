import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, TrendingUp, ShoppingBag, DollarSign, Users, Activity } from "lucide-react";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Artist Insights Dashboard
 * 
 * Powered by BOPixel (invisible to artists)
 * Shows real-time traffic, conversions, and revenue attribution
 */
export default function ArtistInsights() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("30d");
  const [artistId, setArtistId] = useState<number | null>(null);

  // Get artist profile to extract artistId
  const { data: profile } = trpc.artistProfile.getMyProfile.useQuery();

  useEffect(() => {
    if (profile) {
      setArtistId(profile.id);
    }
  }, [profile]);

  // Calculate date range
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();

    switch (dateRange) {
      case "7d":
        start.setDate(end.getDate() - 7);
        break;
      case "30d":
        start.setDate(end.getDate() - 30);
        break;
      case "90d":
        start.setDate(end.getDate() - 90);
        break;
      case "all":
        start.setFullYear(2020); // Start of Boptone
        break;
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch analytics data
  const { data: overview, isLoading: overviewLoading } = trpc.analytics.getOverview.useQuery(
    { artistId: artistId!, startDate, endDate },
    { enabled: !!artistId, refetchInterval: 30000 } // Refresh every 30 seconds
  );

  const { data: trafficSources, isLoading: trafficLoading } = trpc.analytics.getTrafficSources.useQuery(
    { artistId: artistId!, startDate, endDate },
    { enabled: !!artistId }
  );

  const { data: productPerformance, isLoading: productsLoading } = trpc.analytics.getProductPerformance.useQuery(
    { artistId: artistId!, startDate, endDate },
    { enabled: !!artistId }
  );

  const { data: revenueAttribution, isLoading: revenueLoading } = trpc.analytics.getRevenueAttribution.useQuery(
    { artistId: artistId!, startDate, endDate },
    { enabled: !!artistId }
  );

  const { data: conversionFunnel, isLoading: funnelLoading } = trpc.analytics.getConversionFunnel.useQuery(
    { artistId: artistId!, startDate, endDate },
    { enabled: !!artistId }
  );

  const { data: realtimeVisitors } = trpc.analytics.getRealtimeVisitors.useQuery(
    { artistId: artistId! },
    { enabled: !!artistId, refetchInterval: 5000 } // Refresh every 5 seconds
  );

  // Prepare traffic sources chart data
  const trafficChartData = {
    labels: trafficSources?.map((s) => s.category) || [],
    datasets: [
      {
        data: trafficSources?.map((s) => s.visits) || [],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6384",
          "#C9CBCF",
        ],
      },
    ],
  };

  // Prepare revenue attribution chart data
  const revenueChartData = {
    labels: revenueAttribution?.map((r) => r.category) || [],
    datasets: [
      {
        label: "Revenue ($)",
        data: revenueAttribution?.map((r) => r.revenue) || [],
        backgroundColor: "#36A2EB",
      },
    ],
  };

  if (!artistId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artist Profile Required</h1>
          <p className="text-gray-600">
            Please create an artist profile to view insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Insights</h1>
              <p className="text-gray-600 mt-1">
                Track your traffic, conversions, and revenue
              </p>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Real-time Visitors */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  LIVE VISITORS
                </p>
                <p className="text-4xl font-bold mt-2">
                  {realtimeVisitors?.count || 0}
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  Active in the last 5 minutes
                </p>
              </div>
              <Activity className="h-16 w-16 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Page Views
              </CardTitle>
              <Eye className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewLoading ? "..." : overview?.totalPageViews.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Conversions
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewLoading ? "..." : overview?.totalConversions.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${overviewLoading ? "..." : overview?.totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Conversion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewLoading || !overview
                  ? "..."
                  : overview.totalPageViews > 0
                  ? ((overview.totalConversions / overview.totalPageViews) * 100).toFixed(2)
                  : "0.00"}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <p className="text-sm text-gray-600">
                Where your visitors come from
              </p>
            </CardHeader>
            <CardContent>
              {trafficLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-400">Loading...</p>
                </div>
              ) : trafficSources && trafficSources.length > 0 ? (
                <div className="h-64">
                  <Pie
                    data={trafficChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-400">No traffic data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Attribution */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Channel</CardTitle>
              <p className="text-sm text-gray-600">
                Which traffic sources drive sales
              </p>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-400">Loading...</p>
                </div>
              ) : revenueAttribution && revenueAttribution.length > 0 ? (
                <div className="h-64">
                  <Bar
                    data={revenueChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-400">No revenue data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Performance Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
            <p className="text-sm text-gray-600">
              Your top-selling products and conversion rates
            </p>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading...</p>
              </div>
            ) : productPerformance && productPerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-right py-3 px-4">Views</th>
                      <th className="text-right py-3 px-4">Purchases</th>
                      <th className="text-right py-3 px-4">Revenue</th>
                      <th className="text-right py-3 px-4">Conv. Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productPerformance.map((product, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          {product.productName}
                        </td>
                        <td className="text-right py-3 px-4">
                          {product.views.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          {product.purchases.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          ${product.revenue.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {product.conversionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No product data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <p className="text-sm text-gray-600">
              Track visitor journey from view to purchase
            </p>
          </CardHeader>
          <CardContent>
            {funnelLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading...</p>
              </div>
            ) : conversionFunnel && conversionFunnel.stages ? (
              <div className="space-y-4">
                {conversionFunnel.stages.map((stage, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{stage.name}</span>
                      <span className="text-sm text-gray-600">
                        {stage.count.toLocaleString()} ({stage.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Overall Conversion Rate: {conversionFunnel.overallConversionRate}%
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {conversionFunnel.overallConversionRate > 2
                      ? "Great job! Your conversion rate is above average."
                      : "Tip: Optimize your product pages and checkout flow to increase conversions."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No funnel data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
