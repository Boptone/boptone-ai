import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, DollarSign, TrendingUp, Activity, Shield, Package, Calendar, Heart, Loader2, ArrowLeft } from "lucide-react";
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
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Platform Revenue",
      value: "$2.4M",
      change: "+18% this month",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Loans",
      value: "$450K",
      change: "342 active",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Monthly Active Users",
      value: "8,934",
      change: "+24% this month",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const systemMetrics = [
    {
      category: "IP Protection",
      icon: Shield,
      stats: [
        { label: "Infringements Detected", value: "1,234" },
        { label: "DMCA Takedowns Sent", value: "892" },
        { label: "Resolved Cases", value: "756" },
      ],
    },
    {
      category: "E-Commerce",
      icon: Package,
      stats: [
        { label: "Total Products", value: "4,567" },
        { label: "Monthly Sales", value: "$127K" },
        { label: "Active Stores", value: "892" },
      ],
    },
    {
      category: "Tours",
      icon: Calendar,
      stats: [
        { label: "Active Tours", value: "234" },
        { label: "Upcoming Shows", value: "1,456" },
        { label: "Total Revenue", value: "$3.2M" },
      ],
    },
    {
      category: "Healthcare",
      icon: Heart,
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button className="rounded-full" variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Platform Administration</h1>
              <p className="text-sm text-muted-foreground">Boptone control center</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card className="rounded-xl" key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {systemMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card className="rounded-xl" key={metric.category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    {metric.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metric.stats.map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        <span className="font-semibold">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="rounded-xl lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Platform Activity</CardTitle>
              <CardDescription>Real-time updates across all systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="rounded-full w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Artists
              </Button>
              <Button className="rounded-full w-full justify-start" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Review IP Cases
              </Button>
              <Button className="rounded-full w-full justify-start" variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Loan Approvals
              </Button>
              <Button className="rounded-full w-full justify-start" variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Product Moderation
              </Button>
              <Button className="rounded-full w-full justify-start" variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Healthcare Claims
              </Button>
              <Button className="rounded-full w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                System Health
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Platform Health */}
        <Card className="rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Platform Status: Operational
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">API Response Time</p>
                <p className="text-2xl font-bold text-green-600">42ms</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold text-green-600">99.98%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold text-green-600">2,341</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Database Load</p>
                <p className="text-2xl font-bold text-green-600">34%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
