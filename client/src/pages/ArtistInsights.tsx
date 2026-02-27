import { useState, useEffect } from "react";
import { useRequireArtist } from "@/hooks/useRequireArtist";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { Eye, TrendingUp, ShoppingCart, DollarSign } from "lucide-react";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type DateRange = "7d" | "30d" | "90d" | "all";

export default function ArtistInsights() {
  useRequireArtist(); // Enforce artist authentication
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [realtimeCount, setRealtimeCount] = useState(0);

  // Fetch analytics data (using demo artist Luna Waves ID: 180001)
  const { data: overview, isLoading: overviewLoading, error: overviewError } = trpc.analytics.getOverview.useQuery({
    dateRange,
    artistId: 180001
  });

  useEffect(() => {
    console.log('[ArtistInsights] Overview data:', overview);
    console.log('[ArtistInsights] Overview loading:', overviewLoading);
    console.log('[ArtistInsights] Overview error:', overviewError);
  }, [overview, overviewLoading, overviewError]);

  const { data: trafficSources, isLoading: trafficLoading } = trpc.analytics.getTrafficSources.useQuery({
    dateRange,
    artistId: 180001
  });

  const { data: productPerformance, isLoading: productsLoading } = trpc.analytics.getProductPerformance.useQuery({
    dateRange,
    artistId: 180001
  });

  const { data: revenueAttribution, isLoading: revenueLoading } = trpc.analytics.getRevenueAttribution.useQuery({
    dateRange,
    artistId: 180001
  });

  const { data: conversionFunnel, isLoading: funnelLoading } = trpc.analytics.getConversionFunnel.useQuery({
    dateRange,
    artistId: 180001
  });

  const { data: realtimeVisitors } = trpc.analytics.getRealtimeVisitors.useQuery({
    artistId: 180001
  });

  // Update realtime counter
  useEffect(() => {
    if (realtimeVisitors) {
      setRealtimeCount(realtimeVisitors.count);
    }
  }, [realtimeVisitors]);

  // Chart data - using BAP Protocol colors
  const trafficSourcesChartData = {
    labels: trafficSources?.map(s => s.source) || [],
    datasets: [{
      data: trafficSources?.map(s => s.visits) || [],
      backgroundColor: [
        "#000000", // Black
        "#81e6fe", // Cyan accent
        "#4b5563", // Gray-600
        "#9ca3af", // Gray-400
        "#d1d5db"  // Gray-300
      ],
      borderWidth: 0
    }]
  };

  const revenueAttributionChartData = {
    labels: revenueAttribution?.map(r => r.source) || [],
    datasets: [{
      label: "Revenue ($)",
      data: revenueAttribution?.map(r => r.revenue) || [],
      backgroundColor: "#000000",
      borderWidth: 0,
      borderRadius: 8
    }]
  };

  const isLoading = overviewLoading || trafficLoading || productsLoading || revenueLoading || funnelLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <div className="text-2xl font-bold">Loading insights...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Hero Section - BAP Protocol */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Artist Insights
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              Real-time analytics showing where your fans come from and what drives sales.
            </p>

            {/* Date Range Selector */}
            <div className="flex flex-wrap gap-3">
              {(["7d", "30d", "90d", "all"] as DateRange[]).map((range) => (
                <Button
                  key={range}
                  onClick={() => setDateRange(range)}
                  size="lg"
                  className={`rounded-full h-12 px-6 text-base font-bold transition-all ${
                    dateRange === range
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-white text-black border border-gray-300 hover:border-black"
                  }`}
                  style={dateRange === range ? { boxShadow: "4px 4px 0px #81e6fe" } : {}}
                >
                  {range === "7d" && "7 Days"}
                  {range === "30d" && "30 Days"}
                  {range === "90d" && "90 Days"}
                  {range === "all" && "All Time"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Visitors - BAP Protocol */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xl md:text-2xl font-bold">
              {realtimeCount} {realtimeCount === 1 ? "visitor" : "visitors"} online now
            </span>
          </div>
        </div>
      </section>

      {/* Overview Stats - BAP Protocol Design */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Page Views */}
            <div className="border border-gray-200 rounded-xl p-8 bg-white hover:border-gray-400 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <Eye className="w-8 h-8" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-4xl font-extrabold mb-2">
                {overview?.totalPageViews.toLocaleString() || 0}
              </div>
              <div className="text-lg text-gray-700">Page Views</div>
            </div>

            {/* Unique Visitors */}
            <div className="border border-gray-200 rounded-xl p-8 bg-white hover:border-gray-400 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <Eye className="w-8 h-8" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-4xl font-extrabold mb-2">
                {overview?.totalPageViews.toLocaleString() || 0}
              </div>
              <div className="text-lg text-gray-700">Unique Visitors</div>
            </div>

            {/* Conversions */}
            <div className="border border-gray-200 rounded-xl p-8 bg-white hover:border-gray-400 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <ShoppingCart className="w-8 h-8" />
                <div className="text-sm font-bold text-green-600">
                  {overview && overview.totalPageViews > 0 ? ((overview.totalConversions / overview.totalPageViews) * 100).toFixed(1) : '0.0'}%
                </div>
              </div>
              <div className="text-4xl font-extrabold mb-2">
                {overview?.totalConversions.toLocaleString() || 0}
              </div>
              <div className="text-lg text-gray-700">Conversions</div>
            </div>

            {/* Revenue */}
            <div className="border border-gray-200 rounded-xl p-8 bg-white hover:border-gray-400 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <DollarSign className="w-8 h-8" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-4xl font-extrabold mb-2">
                ${overview?.totalRevenue.toFixed(2) || "0.00"}
              </div>
              <div className="text-lg text-gray-700">Total Revenue</div>
            </div>
          </div>
        </div>
      </section>

      {/* Traffic Sources & Revenue Attribution - BAP Protocol */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            Traffic & Revenue
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Traffic Sources */}
            <div className="border border-gray-200 rounded-xl p-8 bg-white">
              <h3 className="text-2xl font-bold mb-6">Traffic Sources</h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Where your visitors come from
              </p>
              <div className="h-80 flex items-center justify-center">
                {trafficSources && trafficSources.length > 0 ? (
                  <Pie
                    data={trafficSourcesChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            font: { size: 14, weight: 600 },
                            padding: 16
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="text-gray-500 text-lg">No traffic data yet</div>
                )}
              </div>
            </div>

            {/* Revenue Attribution */}
            <div className="border border-gray-200 rounded-xl p-8 bg-white">
              <h3 className="text-2xl font-bold mb-6">Revenue by Source</h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Which channels drive the most sales
              </p>
              <div className="h-80">
                {revenueAttribution && revenueAttribution.length > 0 ? (
                  <Bar
                    data={revenueAttributionChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => `$${value}`,
                            font: { size: 12, weight: 600 }
                          }
                        },
                        x: {
                          ticks: {
                            font: { size: 12, weight: 600 }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-lg">
                    No revenue data yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Performance - BAP Protocol */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Product Performance
          </h2>
          <p className="text-xl text-gray-700 mb-12 leading-relaxed">
            Your top-selling products and conversion rates
          </p>
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-base font-bold">Product</th>
                    <th className="px-6 py-4 text-right text-base font-bold">Views</th>
                    <th className="px-6 py-4 text-right text-base font-bold">Purchases</th>
                    <th className="px-6 py-4 text-right text-base font-bold">Conv. Rate</th>
                    <th className="px-6 py-4 text-right text-base font-bold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {productPerformance && productPerformance.length > 0 ? (
                    productPerformance.map((product, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-base">{product.productName}</td>
                        <td className="px-6 py-4 text-right">{product.views}</td>
                        <td className="px-6 py-4 text-right">{product.purchases}</td>
                        <td className="px-6 py-4 text-right font-bold">{product.conversionRate.toFixed(1)}%</td>
                        <td className="px-6 py-4 text-right font-bold">${product.revenue.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-lg">
                        No product data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Funnel - BAP Protocol */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Conversion Funnel
          </h2>
          <p className="text-xl text-gray-700 mb-12 leading-relaxed">
            Track visitor journey from view to purchase
          </p>
          <div className="border border-gray-200 rounded-xl p-8 bg-white">
            {conversionFunnel && conversionFunnel.stages.length > 0 ? (
              <div className="space-y-6">
                {conversionFunnel.stages.map((stage, index) => (
                  <div key={stage.name}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold">{stage.name}</span>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold mr-3">{stage.count.toLocaleString()}</span>
                        <span className={`text-base font-bold ${
                          index === conversionFunnel.stages.length - 1 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          ({stage.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div
                      className={`h-12 rounded-lg ${
                        index === 0 ? 'bg-black' :
                        index === conversionFunnel.stages.length - 1 ? 'bg-black' :
                        index === 1 ? 'bg-gray-700' :
                        index === 2 ? 'bg-gray-500' : 'bg-gray-300'
                      }`}
                      style={{
                        width: index === 0 ? '100%' : `${stage.percentage}%`
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-lg py-12">
                No funnel data yet
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
