import { useAuth } from "@/_core/hooks/useAuth";
import { DEV_MODE } from "@/lib/devMode";
import { useDemo } from "@/contexts/DemoContext";
import { DemoBanner } from "@/components/DemoBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { PlanManagementSection } from "@/components/PlanManagementSection";
import { EarningsWidget } from "@/components/EarningsWidget";
import { AIRecommendations } from "@/components/AIRecommendations";
import { UserAvatar } from "@/components/UserAvatar";
import { useRequireArtist } from "@/hooks/useRequireArtist";
import { ActivationFunnelWidget } from "@/components/ActivationFunnelWidget";

export default function Dashboard() {
  useRequireArtist(); // Enforce artist authentication
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
  const { data: onboardingStatus } = trpc.toney.getOnboardingStatus.useQuery(undefined, {
    enabled: !isDemoMode && !DEV_MODE && !!isAuthenticated,
    staleTime: Infinity,
  });
  const toneySetupIncomplete = !isDemoMode && !DEV_MODE && onboardingStatus != null && !onboardingStatus.completed;

  useEffect(() => {
    if (!loading && !isAuthenticated && !isDemoMode && !DEV_MODE) {
      setLocation("/");
    }
  }, [loading, isAuthenticated, isDemoMode, setLocation]);

  if ((loading || profileLoading) && !isDemoMode && !DEV_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  const effectiveProfile = isDemoMode ? demoProfile : profile;
  
  if (!effectiveProfile && !isDemoMode && !DEV_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="max-w-md w-full border border-black bg-white p-12 shadow-[4px_4px_0px_0px_black]">
          <h1 className="text-4xl font-bold mb-4">Claim Your Profile</h1>
          <p className="text-lg text-gray-600 mb-8">
            Create your artist profile to take control of your career
          </p>
                <Button onClick={() => setLocation("/onboarding")} className="w-full rounded-full h-14 text-lg bg-[#0cc0df] hover:bg-[#0aabca] text-black border border-black shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all">
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Revenue",
      value: totalRevenue ? `$${(totalRevenue / 100).toLocaleString()}` : "$0",
      change: "+12.5%",
      trend: "up",
    },
    {
      title: "Streams",
      value: "1.2M",
      change: "+8.2%",
      trend: "up",
    },
    {
      title: "Followers",
      value: "45.2K",
      change: "+15.3%",
      trend: "up",
    },
    {
      title: "Opportunities",
      value: opportunities?.length || 0,
      change: "This week",
      trend: "neutral",
    },
  ];

  const quickActions = [
    { label: "Upload to BopMusic", href: "/upload" },
    { label: "Post a Bop", href: "/bops/upload" },
    { label: "View Bops Feed", href: "/bops" },
    { label: "View Analytics", href: "/analytics" },
    { label: "Discover BopMusic", href: "/music" },
    { label: "Edit Profile", href: "/profile-settings" },
    { label: "Manage Billing", href: "/settings/billing" },
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
      href: "/music",
    },
  ];

  return (
    <>
      <DemoBanner />
      <div className="min-h-screen bg-[#f8f8f6]">
        {/* Header - Minimal with massive typography */}
        <div className="border-b border-black bg-white">
          <div className="container py-20">
            <div className="flex items-start justify-between">
              {/* Left: Avatar + Massive Typography */}
              <div className="flex-1 flex items-start gap-8">
                <UserAvatar size="xl" />
                <div className="flex-1">
                  <h1 className="text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-6">
                    Welcome back,
                    <br />
                    {effectiveProfile?.stageName || 'Artist'}.
                  </h1>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-4">
                <Button variant="outline" size="lg" className="relative border border-black hover:border-black rounded-full shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all">
                  Notifications
                  {notifications && notifications.length > 0 && (
                    <span className="ml-2 h-6 w-6 rounded-full bg-[#008B8B] text-white text-xs flex items-center justify-center font-semibold">
                      {notifications.length}
                    </span>
                  )}
                </Button>
                <Button onClick={() => setLocation("/ai-advisor")} size="lg" className="gap-2 bg-[#0cc0df] hover:bg-[#0aabca] text-black rounded-full border border-black shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all">
                  AI Advisor
                </Button>
              </div>
            </div>
            
            {/* Career Phase Info - Moved below */}
            <div className="mt-6 ml-32">
              <p className="text-xl text-gray-600 font-normal">
                Career Phase: <span className="font-semibold text-gray-900 capitalize">{effectiveProfile?.careerPhase || 'Getting Started'}</span>
                {effectiveProfile?.priorityScore && (
                  <span className="ml-4">
                    • Priority Score: <span className="font-semibold text-gray-900">{effectiveProfile?.priorityScore}/10</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="container py-20 space-y-20">
          {/* Stats Grid - BAP Protocol with black borders and brutalist shadows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat) => {
              return (
                <div key={stat.title} className="border border-black hover:border-black transition-colors bg-white p-8 rounded-lg shadow-[4px_4px_0px_0px_black]">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-3">{stat.title}</p>
                  <p className="text-5xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className={`text-sm font-medium ${stat.trend === "up" ? "text-[#008B8B]" : stat.trend === "down" ? "text-gray-600" : "text-gray-500"}`}>
                    {stat.change}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Earnings Widget */}
          <EarningsWidget />

          {/* AI Recommendations */}
          <AIRecommendations />

          {/* Bops Feature Card */}
          <div className="border-2 border-black bg-black text-white p-12 rounded-lg shadow-[4px_4px_0px_0px_rgba(12,192,223,1)]">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🎬</span>
                  <h2 className="text-4xl font-bold text-white">Bops</h2>
                  <span className="bg-[#0cc0df] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Live</span>
                </div>
                <p className="text-lg text-gray-300 max-w-xl">
                  Post 15–30 second vertical videos. Fans watch, like, and tip you directly — you keep 86% of every tip.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={() => setLocation("/bops")}
                  variant="outline"
                  className="rounded-full border-2 border-white text-white bg-transparent hover:bg-white hover:text-black transition-all font-semibold px-6"
                >
                  Watch Bops
                </Button>
                <Button
                  onClick={() => setLocation("/bops/upload")}
                  className="rounded-full bg-[#0cc0df] hover:bg-[#0aabca] text-black border-2 border-[#0cc0df] font-bold px-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] transition-all"
                >
                  Post a Bop
                </Button>
              </div>
            </div>
          </div>

          {/* Toney setup banner — shown when onboarding is incomplete */}
          {toneySetupIncomplete && (
            <div className="border-2 border-[#0cc0df] bg-[#0cc0df]/5 rounded-lg p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[4px_4px_0px_0px_#0cc0df]">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#0cc0df] mb-2">Action required</p>
                <h3 className="text-2xl font-bold mb-2">Activate Toney — your AI advisor</h3>
                <p className="text-base text-gray-600">Complete a 2-minute setup so Toney knows your career stage, goals, and how you like to work.</p>
              </div>
              <Button
                onClick={() => setLocation("/onboarding")}
                className="shrink-0 rounded-full bg-[#0cc0df] hover:bg-[#0aabca] text-black border-2 border-black font-bold px-8 h-12 shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all"
              >
                Complete Setup →
              </Button>
            </div>
          )}
          {/* Activation Funnel Widget — GROWTH-5: guides new artists to first revenue action */}
          <ActivationFunnelWidget />

          {/* Quick Actions - BAP Protocol design */}
          <div className="border border-black bg-white p-12 rounded-lg shadow-[4px_4px_0px_0px_black]">
            <h2 className="text-4xl font-bold mb-3">Quick Actions</h2>
            <p className="text-lg text-gray-600 mb-10">Common tasks to manage your career</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4">
              {quickActions.map((action) => {
                return (
                  <button
                    key={action.label}
                    className="p-8 border border-black hover:bg-gray-50 transition-all text-center rounded-lg shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black]"
                    onClick={() => setLocation(action.href)}
                  >
                    <span className="text-lg font-semibold text-gray-900">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compliance Score Widget - BAP Protocol design */}
          <div className="border border-black hover:border-black transition-colors bg-white p-12 rounded-lg shadow-[4px_4px_0px_0px_black]">
            <h2 className="text-3xl font-bold mb-6">Compliance Score</h2>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-6xl font-bold text-gray-900">85%</p>
                <p className="text-lg text-gray-600 mt-2">Overall compliance</p>
              </div>
              <Button onClick={() => setLocation("/compliance")} variant="outline" className="rounded-full border border-black hover:border-black shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all">
                View Details
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-base font-medium text-gray-700">Copyright Protection</span>
                  <span className="text-base font-semibold text-gray-900">95%</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-base font-medium text-gray-700">Metadata Accuracy</span>
                  <span className="text-base font-semibold text-gray-900">80%</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-base font-medium text-gray-700">Distribution Compliance</span>
                  <span className="text-base font-semibold text-gray-900">90%</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
            </div>
          </div>

          {/* Goals Progress - BAP Protocol design */}
          <div className="border border-black bg-white p-12 rounded-lg shadow-[4px_4px_0px_0px_black]">
            <h2 className="text-4xl font-bold mb-3">Your Goals</h2>
            <p className="text-lg text-gray-600 mb-10">Track your progress toward key milestones</p>
            <div className="space-y-6">
              {goals.map((goal) => (
                <div key={goal.title}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-semibold text-gray-900">{goal.title}</span>
                    <span className="text-base text-gray-600">
                      {goal.current} / {goal.target}
                      {goal.completed && <span className="ml-2 text-[#008B8B] font-bold">✓ Complete</span>}
                    </span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-3" />
                </div>
              ))}
            </div>
          </div>

          {/* Growth Tips - BAP Protocol design */}
          <div className="border border-black bg-white p-12 rounded-lg shadow-[4px_4px_0px_0px_black]">
            <h2 className="text-4xl font-bold mb-3">Growth Tips</h2>
            <p className="text-lg text-gray-600 mb-10">Personalized recommendations to accelerate your career</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {tips.map((tip) => (
                <div key={tip.title} className="border border-black p-8 rounded-lg shadow-[4px_4px_0px_0px_black]">
                  <h3 className="text-xl font-bold mb-3">{tip.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{tip.description}</p>
                  <Button
                    onClick={() => setLocation(tip.href)}
                    variant="outline"
                    className="w-full rounded-full border border-black hover:border-black shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all"
                  >
                    {tip.action}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Management */}
          <PlanManagementSection />
        </div>
      </div>
    </>
  );
}
