import { useAuth } from "@/_core/hooks/useAuth";
import { useDemo } from "@/contexts/DemoContext";
import { DemoBanner } from "@/components/DemoBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Music, 
  ShoppingBag, 
  Shield, 
  Heart, 
  Calendar,
  Bell,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const { isDemoMode, demoUser, demoProfile } = useDemo();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading: profileLoading } = trpc.artistProfile.getMyProfile.useQuery();
  const { data: notifications } = trpc.notifications.getAll.useQuery({ isRead: false });
  const { data: totalRevenue } = trpc.revenue.getTotal.useQuery({});
  const { data: opportunities } = trpc.opportunities.getAll.useQuery({ status: "new" });

  useEffect(() => {
    if (!loading && !isAuthenticated && !isDemoMode) {
      setLocation("/");
    }
  }, [loading, isAuthenticated, isDemoMode, setLocation]);

  if ((loading || profileLoading) && !isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const effectiveProfile = isDemoMode ? demoProfile : profile;
  
  if (!effectiveProfile && !isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Set up your artist profile to start using Boptone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/onboarding")} className="w-full">
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: totalRevenue ? `$${(totalRevenue / 100).toLocaleString()}` : "$0",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Streams",
      value: "1.2M",
      change: "+8.2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Followers",
      value: "45.2K",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "New Opportunities",
      value: opportunities?.length || 0,
      change: "This week",
      trend: "neutral",
      icon: Sparkles,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const quickActions = [
    { label: "Upload Music", icon: Music, href: "/releases/new", color: "bg-primary" },
    { label: "Add Product", icon: ShoppingBag, href: "/store", color: "bg-chart-3" },
    { label: "View Analytics", icon: TrendingUp, href: "/analytics", color: "bg-chart-4" },
    { label: "IP Protection", icon: Shield, href: "/ip-protection", color: "bg-destructive" },
  ];

  return (
    <>
      <DemoBanner />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {effectiveProfile!.stageName}
              </h1>
              <p className="text-muted-foreground mt-1">
                Career Phase: <span className="font-semibold capitalize text-primary">{effectiveProfile!.careerPhase}</span>
                {effectiveProfile!.priorityScore && (
                  <span className="ml-4">
                    Priority Score: <span className="font-semibold text-primary">{effectiveProfile!.priorityScore}/10</span>
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications && notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
              <Button onClick={() => setLocation("/ai-advisor")}>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Advisor
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    {stat.trend === "up" && (
                      <ArrowUpRight className="h-5 w-5 text-green-600" />
                    )}
                    {stat.trend === "down" && (
                      <ArrowDownRight className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-muted-foreground"}`}>
                      {stat.change}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your career</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="h-24 flex-col gap-2 hover:border-primary"
                    onClick={() => setLocation(action.href)}
                  >
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest platform updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem
                  icon={Music}
                  title="New release performing well"
                  description="Your single 'Summer Vibes' reached 50K streams"
                  time="2 hours ago"
                  color="bg-blue-100 text-blue-600"
                />
                <ActivityItem
                  icon={Users}
                  title="Follower milestone reached"
                  description="You gained 1,000 new Instagram followers this week"
                  time="1 day ago"
                  color="bg-purple-100 text-purple-600"
                />
                <ActivityItem
                  icon={DollarSign}
                  title="Payment received"
                  description="Streaming royalties deposited: $247.50"
                  time="2 days ago"
                  color="bg-green-100 text-green-600"
                />
                <ActivityItem
                  icon={Sparkles}
                  title="New opportunity detected"
                  description="Playlist curator interested in your latest track"
                  time="3 days ago"
                  color="bg-orange-100 text-orange-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <EventItem
                  title="Release: New Single"
                  date="Oct 31, 2025"
                  color="bg-primary"
                />
                <EventItem
                  title="Tour: LA Show"
                  date="Nov 5, 2025"
                  color="bg-chart-3"
                />
                <EventItem
                  title="Loan Payment Due"
                  date="Nov 10, 2025"
                  color="bg-chart-4"
                />
              </CardContent>
            </Card>

            {/* Health & Wellness */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Health & Wellness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Your health coverage is active
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Benefits
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

function ActivityItem({ 
  icon: Icon, 
  title, 
  description, 
  time, 
  color 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  time: string; 
  color: string;
}) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}

function EventItem({ 
  title, 
  date, 
  color 
}: { 
  title: string; 
  date: string; 
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}
