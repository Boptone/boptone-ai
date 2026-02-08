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
  ShoppingBag, 
  Shield, 
  Heart, 
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const effectiveProfile = isDemoMode ? demoProfile : profile;
  
  if (!effectiveProfile && !isDemoMode && !DEV_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Claim Your Profile</CardTitle>
            <CardDescription>
              Create your artist profile to take control of your career
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
      title: "Revenue",
      value: totalRevenue ? `$${(totalRevenue / 100).toLocaleString()}` : "$0",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-400 to-emerald-500",
      borderColor: "border-green-500",
    },
    {
      title: "Streams",
      value: "1.2M",
      change: "+8.2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
      borderColor: "border-blue-500",
    },
    {
      title: "Followers",
      value: "45.2K",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-400 to-purple-600",
      borderColor: "border-purple-500",
    },
    {
      title: "Opportunities",
      value: opportunities?.length || 0,
      change: "This week",
      trend: "neutral",
      icon: Sparkles,
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-400 to-orange-600",
      borderColor: "border-orange-500",
    },
  ];

  const quickActions = [
    { label: "Upload Music", icon: Upload, href: "/upload", color: "bg-gradient-to-br from-blue-600 to-indigo-600", borderColor: "border-blue-500" },
    { label: "View Analytics", icon: BarChart3, href: "/analytics", color: "bg-gradient-to-br from-purple-600 to-pink-600", borderColor: "border-purple-500" },
    { label: "Discover Music", icon: Music, href: "/discover", color: "bg-gradient-to-br from-green-600 to-teal-600", borderColor: "border-green-500" },
    { label: "Edit Profile", icon: Users, href: "/profile-settings", color: "bg-gradient-to-br from-orange-600 to-red-600", borderColor: "border-orange-500" },
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Revolutionary Header with Asymmetric Layout */}
      <div className="border-b-4 border-black bg-white sticky top-0 z-10 shadow-xl">
        <div className="container py-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Massive Typography */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-none mb-4">
                Welcome back,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  {effectiveProfile?.stageName || 'Artist'}
                </span>
                <span className="text-black">.</span>
              </h1>
              <p className="text-xl text-gray-700 font-medium">
                Career Phase: <span className="font-black capitalize text-purple-600">{effectiveProfile?.careerPhase || 'Getting Started'}</span>
                {effectiveProfile?.priorityScore && (
                  <span className="ml-4">
                    • Priority Score: <span className="font-black text-blue-600">{effectiveProfile?.priorityScore}/10</span>
                  </span>
                )}
              </p>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center justify-end gap-4">
              <Button variant="outline" size="lg" className="relative rounded-full border-4 border-black hover:bg-black hover:text-white transition-all hover:scale-105 shadow-xl">
                <Bell className="h-6 w-6" />
                {notifications && notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-black border-2 border-white">
                    {notifications.length}
                  </span>
                )}
              </Button>
              <Button onClick={() => setLocation("/ai-advisor")} size="lg" className="rounded-full gap-2 text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105">
                <Sparkles className="h-5 w-5" />
                AI Advisor
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12 space-y-12">
        {/* Stats Grid - Revolutionary Color-Coded Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className={`rounded-3xl border-4 ${stat.borderColor} shadow-2xl hover:scale-105 transition-transform bg-white`}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${stat.bgColor} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    {stat.trend === "up" && (
                      <ArrowUpRight className="h-7 w-7 text-green-600 font-black" />
                    )}
                    {stat.trend === "down" && (
                      <ArrowDownRight className="h-7 w-7 text-red-600 font-black" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-bold uppercase tracking-wide">{stat.title}</p>
                  <p className="text-4xl font-black mt-2">{stat.value}</p>
                  <p className={`text-sm mt-2 font-bold ${stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-gray-600"}`}>
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions - Bold Color-Coded Cards */}
        <Card className="rounded-3xl border-4 border-black shadow-2xl bg-white">
          <CardHeader className="pb-8">
            <CardTitle className="text-4xl font-black">Quick Actions</CardTitle>
            <CardDescription className="text-lg font-medium">Common tasks to manage your career</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={action.label}
                    className={`rounded-3xl border-4 ${action.borderColor} shadow-xl hover:scale-105 transition-all cursor-pointer bg-white`}
                    onClick={() => setLocation(action.href)}
                  >
                    <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl ${action.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <span className="text-lg font-black">{action.label}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Score Widget - New Feature */}
        <Card className="rounded-3xl border-4 border-blue-500 shadow-2xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-black">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              Compliance Score
            </CardTitle>
            <CardDescription className="text-lg font-medium">Industry-standard metadata quality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-6xl font-black text-gray-900">85%</p>
                <p className="text-lg font-bold text-gray-600 mt-2">Good compliance level</p>
              </div>
              <div className="w-32 h-32 rounded-full border-8 border-blue-500 flex items-center justify-center bg-white shadow-xl">
                <Sparkles className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="font-bold text-gray-900">ISRC Codes</span>
                </div>
                <span className="text-sm font-black text-green-600">+20%</span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="font-bold text-gray-900">UPC Codes</span>
                </div>
                <span className="text-sm font-black text-green-600">+20%</span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="font-bold text-gray-900">Songwriter Splits</span>
                </div>
                <span className="text-sm font-black text-green-600">+20%</span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="font-bold text-gray-900">Publishing Data</span>
                </div>
                <span className="text-sm font-black text-green-600">+20%</span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full border-2 border-gray-400" />
                  <span className="font-bold text-gray-500">AI Disclosure</span>
                </div>
                <span className="text-sm font-black text-gray-400">+0%</span>
              </div>
            </div>
            
            <Button 
              onClick={() => setLocation("/upload")} 
              className="w-full rounded-full text-lg py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-xl"
            >
              <Upload className="h-5 w-5 mr-2" />
              Improve Score
            </Button>
            
            <p className="text-sm text-gray-600 text-center font-medium">
              Add metadata during upload to meet platform requirements and avoid rejections
            </p>
          </CardContent>
        </Card>

        {/* Plan Management - Subscription Upgrade/Downgrade */}
        <PlanManagementSection />

        {/* Goals & Tips Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Goal Tracking - Green Card */}
          <Card className="rounded-3xl border-4 border-green-500 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-3xl font-black">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                Goals
              </CardTitle>
              <CardDescription className="text-lg font-medium">Track your progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {goals.map((goal) => {
                const progress = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div key={goal.title} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {goal.completed && (
                          <CheckCircle2 className="h-6 w-6 text-green-600 font-black" />
                        )}
                        <span className={`text-lg font-bold ${goal.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                          {goal.title}
                        </span>
                      </div>
                      <span className="text-lg font-black text-gray-700">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3 rounded-full" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Tips & Recommendations - Purple Card */}
          <Card className="rounded-3xl border-4 border-purple-500 shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-3xl font-black">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                Growth Tips
              </CardTitle>
              <CardDescription className="text-lg font-medium">Recommended actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tips.map((tip) => (
                <div key={tip.title} className="flex items-start gap-4 p-6 rounded-2xl bg-white border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
                  <Lightbulb className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0 font-black" />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-lg text-gray-900">{tip.title}</p>
                    <p className="text-sm text-gray-600 mt-2 font-medium">{tip.description}</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-3 text-sm font-black text-purple-600 hover:text-purple-700"
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
          {/* Recent Activity - Blue Card */}
          <Card className="lg:col-span-2 rounded-3xl border-4 border-blue-500 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-3xl font-black">Recent Activity</CardTitle>
              <CardDescription className="text-lg font-medium">Your latest platform updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem
                  icon={Music}
                  title="New release performing well"
                  description="Your single 'Summer Vibes' reached 50K streams"
                  time="2 hours ago"
                  color="bg-gradient-to-br from-blue-400 to-blue-600"
                />
                <ActivityItem
                  icon={Users}
                  title="Follower milestone reached"
                  description="You gained 1,000 new Instagram followers this week"
                  time="1 day ago"
                  color="bg-gradient-to-br from-purple-400 to-purple-600"
                />
                <ActivityItem
                  icon={DollarSign}
                  title="Payment received"
                  description="Streaming royalties deposited: $247.50"
                  time="2 days ago"
                  color="bg-gradient-to-br from-green-400 to-emerald-500"
                />
                <ActivityItem
                  icon={Sparkles}
                  title="New opportunity detected"
                  description="Playlist curator interested in your latest track"
                  time="3 days ago"
                  color="bg-gradient-to-br from-orange-400 to-orange-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Events - Orange Card */}
            <Card className="rounded-3xl border-4 border-orange-500 shadow-2xl bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-black">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <EventItem
                  title="Release: New Single"
                  date="Oct 31, 2025"
                  color="bg-gradient-to-r from-blue-500 to-indigo-500"
                />
                <EventItem
                  title="Tour: LA Show"
                  date="Nov 5, 2025"
                  color="bg-gradient-to-r from-green-500 to-teal-500"
                />
                <EventItem
                  title="Loan Payment Due"
                  date="Nov 10, 2025"
                  color="bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </CardContent>
            </Card>

            {/* Health & Wellness - Pink Card */}
            <Card className="rounded-3xl border-4 border-pink-500 shadow-2xl bg-gradient-to-br from-pink-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-black">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  Health & Wellness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-gray-700 mb-4 font-medium">
                  Your health coverage is active
                </p>
                <Button variant="outline" size="lg" className="w-full rounded-full border-4 border-pink-500 hover:bg-pink-500 hover:text-white transition-all hover:scale-105 shadow-lg font-black">
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
    <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg flex-shrink-0`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-lg text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1 font-medium">{description}</p>
        <p className="text-xs text-gray-500 mt-2 font-medium">{time}</p>
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
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-lg">
      <div className={`w-4 h-4 rounded-full ${color} flex-shrink-0 shadow-md`} />
      <div className="flex-1 min-w-0">
        <p className="text-base font-black text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 font-medium">{date}</p>
      </div>
    </div>
  );
}
