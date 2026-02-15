import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  // Admin-level queries would go here
  // For now, showing placeholder stats

  const platformStats = [
    {
      title: "Total Artists",
      value: "1,247",
      change: "+12% this month",
    },
    {
      title: "Platform Revenue",
      value: "$2.4M",
      change: "+18% this month",
    },
    {
      title: "Active Loans",
      value: "$450K",
      change: "342 active",
    },
    {
      title: "Monthly Active Users",
      value: "8,934",
      change: "+24% this month",
    },
  ];

  const systemMetrics = [
    {
      category: "IP Protection",
      stats: [
        { label: "Infringements Detected", value: "1,234" },
        { label: "DMCA Takedowns Sent", value: "892" },
        { label: "Resolved Cases", value: "756" },
      ],
    },
    {
      category: "E-Commerce",
      stats: [
        { label: "Total Products", value: "4,567" },
        { label: "Monthly Sales", value: "$127K" },
        { label: "Active Stores", value: "892" },
      ],
    },
    {
      category: "Tours",
      stats: [
        { label: "Active Tours", value: "234" },
        { label: "Upcoming Shows", value: "1,456" },
        { label: "Total Revenue", value: "$3.2M" },
      ],
    },
    {
      category: "Healthcare",
      stats: [
        { label: "Enrolled Artists", value: "567" },
        { label: "Monthly Premiums", value: "$89K" },
        { label: "Claims Processed", value: "234" },
      ],
    },
  ];

  const recentActivity = [
    { type: "New Artist", description: "Sarah Chen joined the platform", time: "2 minutes ago" },
    { type: "Loan Approved", description: "$5,000 loan approved for Marcus Williams", time: "15 minutes ago" },
    { type: "DMCA Sent", description: "Takedown notice sent for unauthorized use", time: "1 hour ago" },
    { type: "Tour Created", description: "Summer 2026 Tour planned by The Echoes", time: "2 hours ago" },
    { type: "Healthcare Enrollment", description: "Premium plan enrolled by Alex Rodriguez", time: "3 hours ago" },
  ];

  const quickActions = [
    { label: "Manage Artists", symbol: "♪" },
    { label: "Review IP Cases", symbol: "⚡" },
    { label: "Loan Approvals", symbol: "$" },
    { label: "Product Moderation", symbol: "□" },
    { label: "Healthcare Claims", symbol: "+" },
    { label: "System Health", symbol: "~" },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-white sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <Button 
              className="rounded-full border-2 border-black bg-white hover:bg-gray-100 text-black" 
              variant="outline" 
              size="sm"
              onClick={() => setLocation("/dashboard")}
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">PLATFORM ADMINISTRATION</h1>
              <p className="text-sm text-gray-600 mt-1">Boptone control center</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12 space-y-12">
        {/* Platform Stats */}
        <div>
          <h2 className="text-2xl font-bold mb-6">PLATFORM OVERVIEW</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformStats.map((stat) => (
              <div className="p-6 border-4 border-black bg-white rounded-none" key={stat.title}>
                <div className="text-xs font-bold tracking-wider mb-2 text-gray-600">
                  {stat.title.toUpperCase()}
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Metrics */}
        <div>
          <h2 className="text-2xl font-bold mb-6">SYSTEM METRICS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemMetrics.map((metric) => (
              <div className="border-4 border-black bg-white rounded-none" key={metric.category}>
                <div className="border-b-4 border-black p-6">
                  <h3 className="text-xl font-bold">{metric.category.toUpperCase()}</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {metric.stats.map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between pb-4 border-b-2 border-gray-200 last:border-0 last:pb-0">
                        <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                        <span className="text-xl font-bold">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="border-4 border-black bg-white rounded-none lg:col-span-2">
            <div className="border-b-4 border-black p-6">
              <h3 className="text-xl font-bold">RECENT PLATFORM ACTIVITY</h3>
              <p className="text-sm text-gray-600 mt-1">Real-time updates across all systems</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b-2 border-gray-200 last:border-0 last:pb-0">
                    <div className="w-3 h-3 rounded-full bg-black mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{activity.type}</p>
                      <p className="text-sm text-gray-700">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-4 border-black bg-white rounded-none">
            <div className="border-b-4 border-black p-6">
              <h3 className="text-xl font-bold">QUICK ACTIONS</h3>
            </div>
            <div className="p-6 space-y-3">
              {quickActions.map((action) => (
                <Button 
                  key={action.label}
                  className="rounded-full w-full justify-start border-2 border-black bg-white hover:bg-gray-100 text-black font-medium" 
                  variant="outline"
                >
                  <span className="mr-2 text-lg">{action.symbol}</span>
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Health */}
        <div className="border-4 border-black bg-white rounded-none">
          <div className="border-b-4 border-black p-6">
            <h3 className="text-xl font-bold">PLATFORM STATUS: OPERATIONAL</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">API Response Time</p>
                <p className="text-4xl font-bold">42ms</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Uptime</p>
                <p className="text-4xl font-bold">99.98%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Active Connections</p>
                <p className="text-4xl font-bold">2,341</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Database Load</p>
                <p className="text-4xl font-bold">34%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
