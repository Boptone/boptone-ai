import { useAuth } from "@/_core/hooks/useAuth";
import { DEV_MODE } from "@/lib/devMode";
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
  Shield, 
  Calendar,
  Bell,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Target,
  Lightbulb,
  CheckCircle2,
  Upload,
  BarChart3,
  Zap
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { PlanManagementSection } from "@/components/PlanManagementSection";
import { EarningsWidget } from "@/components/EarningsWidget";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const { isDemoMode, demoUser, demoProfile } = useDemo();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading: profileLoading } = trpc.artistProfile.getMyProfile.useQuery(undefined, {
    enabled: !isDemoMode && !DEV_MODE
  });
  const { data: notifications } = trpc.notifications.getAll.useQuery({ isRead: false }, {
    enabled: !isDemoMode && !DEV_MODE
  });
  const { data: totalRevenue } = trpc.revenue.getTotal.useQuery({}, {
    enabled: !isDemoMode && !DEV_MODE
  });
  const { data: opportunities } = trpc.opportunities.getAll.useQuery({ status: "new" }, {
    enabled: !isDemoMode && !DEV_MODE
  });

  useEffect(() => {
    if (!loading && !isAuthenticated && !isDemoMode && !DEV_MODE) {
      setLocation("/");
    }
  }, [loading, isAuthenticated, isDemoMode, setLocation]);

  if ((loading || profileLoading) && !isDemoMode && !DEV_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const effectiveProfile = isDemoMode ? demoProfile : profile;
  
  if (!effectiveProfile && !isDemoMode && !DEV_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <Card className="max-w-md w-full border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Claim Your Profile</CardTitle>
            <CardDescription className="text-lg">
              Create your artist profile to take control of your career
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/onboarding")} className="w-full bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Revenue",
      value: totalRevenue ? `$${(totalRevenue / 100).toLocaleString()}` : "$0",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Streams",
      value: "1.2M",
      change: "+8.2%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Followers",
      value: "45.2K",
      change: "+15.3%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Opportunities",
      value: opportunities?.length || 0,
      change: "This week",
      trend: "neutral",
      icon: Sparkles,
    },
  ];

  const quickActions = [
    { label: "Upload Music", icon: Upload, href: "/upload" },
    { label: "View Analytics", icon: BarChart3, href: "/analytics" },
    { label: "Discover Music", icon: Music, href: "/discover" },
    { label: "Edit Profile", icon: Users, href: "/profile-settings" },
  ];

  const goals = [
    { title: "Reach 1,000 Streams", current: 1200, target: 1000, completed: true },
    { title: "Get 100 Followers", current: 45, target: 100, completed: false },
    { title: "Upload 5 Tracks", current: 3, target: 5, completed: false },
    { title: "Earn $100", current: 67, target: 100, completed: false },
  ];

  const tips = [
    {
      title: "Upload consistently",
      description: "Artists who upload monthly grow 3x faster",
      action: "Upload Track",
      href: "/upload",
    },
    {
      title: "Complete your profile",
      description: "Profiles with bios get 50% more followers",
      action: "Edit Profile",
      href: "/profile-settings",
    },
    {
      title: "Share your music",
      description: "Social sharing drives 40% of new listeners",
      action: "View Tracks",
      href: "/discover",
    },
  ];

  return (
    <>
      <DemoBanner />
      <div className="min-h-screen bg-white">
        {/* Header - Minimal with massive typography */}
        <div className="border-b border-gray-200 bg-white">
          <div className="container py-16">
            <div className="flex items-start justify-between">
              {/* Left: Massive Typography */}
              <div className="flex-1">
                <h1 className="text-6xl lg:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-6">
                  Welcome back,
                  <br />
                  {effectiveProfile?.stageName || 'Artist'}.
                </h1>
                <p className="text-xl text-gray-600 font-normal">
                  Career Phase: <span className="font-semibold text-gray-900 capitalize">{effectiveProfile?.careerPhase || 'Getting Started'}</span>
                  {effectiveProfile?.priorityScore && (
                    <span className="ml-4">
                      • Priority Score: <span className="font-semibold text-gray-900">{effectiveProfile?.priorityScore}/10</span>
                    </span>
                  )}
                </p>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-4">
                <Button variant="outline" size="lg" className="relative border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50">
                  <Bell className="h-5 w-5" />
                  {notifications && notifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">
                      {notifications.length}
                    </span>
                  )}
                </Button>
                <Button onClick={() => setLocation("/ai-advisor")} size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-white">
                  <Sparkles className="h-5 w-5" />
                  AI Advisor
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-16 space-y-16">
          {/* Stats Grid - Minimal grayscale cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="border-2 border-gray-200 hover:border-gray-300 transition-colors bg-white">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-gray-700" />
                      </div>
                      {stat.trend === "up" && (
                        <ArrowUpRight className="h-5 w-5 text-gray-400" />
                      )}
                      {stat.trend === "down" && (
                        <ArrowDownRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{stat.title}</p>
                    <p className="text-4xl font-bold mt-2 text-gray-900">{stat.value}</p>
                    <p className={`text-sm mt-2 font-medium ${stat.trend === "up" ? "text-gray-600" : stat.trend === "down" ? "text-gray-600" : "text-gray-500"}`}>
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Earnings Widget */}
          <EarningsWidget />

          {/* Quick Actions - Minimal grid */}
          <Card className="border-2 border-gray-200 bg-white">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl font-bold">Quick Actions</CardTitle>
              <CardDescription className="text-lg text-gray-600">Common tasks to manage your career</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      className="p-6 border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all text-center flex flex-col items-center gap-4"
                      onClick={() => setLocation(action.href)}
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-gray-700" />
                      </div>
                      <span className="text-base font-semibold text-gray-900">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Score Widget - Turquoise accent */}
          <Card className="border-2 border-primary bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-3xl font-bold">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                Compliance Score
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">Industry-standard metadata quality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900">85%</p>
                  <p className="text-lg text-gray-600 mt-2">Good compliance level</p>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center bg-gray-50">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-gray-700" />
                    <span className="font-medium text-gray-900">ISRC Codes</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">+20%</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-gray-700" />
                    <span className="font-medium text-gray-900">UPC Codes</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">+20%</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-gray-700" />
                    <span className="font-medium text-gray-900">Songwriter Splits</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">+20%</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-gray-700" />
                    <span className="font-medium text-gray-900">Publishing Data</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">+20%</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    <span className="font-medium text-gray-500">AI Disclosure</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-400">+0%</span>
                </div>
              </div>
              
              <Button 
                onClick={() => setLocation("/upload")} 
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                <Upload className="h-5 w-5 mr-2" />
                Improve Score
              </Button>
              
              <p className="text-sm text-gray-500 text-center">
                Add metadata during upload to meet platform requirements and avoid rejections
              </p>
            </CardContent>
          </Card>

          {/* Plan Management - Subscription Upgrade/Downgrade */}
          <PlanManagementSection />

          {/* Goals & Tips Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Goal Tracking */}
            <Card className="border-2 border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-3xl font-bold">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Target className="h-6 w-6 text-gray-700" />
                  </div>
                  Goals
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">Track your progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {goals.map((goal) => {
                  const progress = Math.min((goal.current / goal.target) * 100, 100);
                  return (
                    <div key={goal.title} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {goal.completed && (
                            <CheckCircle2 className="h-5 w-5 text-gray-700" />
                          )}
                          <span className={`text-base font-medium ${goal.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                            {goal.title}
                          </span>
                        </div>
                        <span className="text-base font-semibold text-gray-700">
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Tips & Recommendations */}
            <Card className="border-2 border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-3xl font-bold">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-gray-700" />
                  </div>
                  Growth Tips
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">Recommended actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tips.map((tip) => (
                  <div key={tip.title} className="flex items-start gap-4 p-6 bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
                    <Lightbulb className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-gray-900">{tip.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-2 text-sm font-medium text-gray-900 hover:text-primary"
                        onClick={() => setLocation(tip.href)}
                      >
                        {tip.action} →
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <Card className="lg:col-span-2 border-2 border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">Recent Activity</CardTitle>
                <CardDescription className="text-lg text-gray-600">Your latest platform updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ActivityItem
                    icon={Music}
                    title="New release performing well"
                    description="Your single 'Summer Vibes' reached 50K streams"
                    time="2 hours ago"
                  />
                  <ActivityItem
                    icon={Users}
                    title="Follower milestone reached"
                    description="You gained 1,000 new Instagram followers this week"
                    time="1 day ago"
                  />
                  <ActivityItem
                    icon={DollarSign}
                    title="Payment received"
                    description="Streaming royalties deposited: $247.50"
                    time="2 days ago"
                  />
                  <ActivityItem
                    icon={Sparkles}
                    title="New opportunity detected"
                    description="Playlist curator interested in your latest track"
                    time="3 days ago"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Upcoming Events */}
              <Card className="border-2 border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-gray-700" />
                    </div>
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <EventItem
                    title="Release: New Single"
                    date="Oct 31, 2025"
                  />
                  <EventItem
                    title="Tour: LA Show"
                    date="Nov 5, 2025"
                  />
                  <EventItem
                    title="Collab Session"
                    date="Nov 12, 2025"
                  />
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
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200">
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-gray-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <p className="text-xs text-gray-500 mt-2">{time}</p>
      </div>
    </div>
  );
}

function EventItem({ title, date }: { title: string; date: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{date}</p>
      </div>
      <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
    </div>
  );
}
