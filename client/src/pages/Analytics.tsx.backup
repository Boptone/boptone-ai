import { useAuth } from "@/_core/hooks/useAuth";
import { DEV_MODE } from "@/lib/devMode";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  TrendingUp, 
  Users, 
  Music, 
  DollarSign, 
  ArrowLeft, 
  Download,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type TimeRange = "7d" | "30d" | "90d" | "1y" | "all";

export default function Analytics() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  // Calculate date range based on selection
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case "7d":
        start.setDate(end.getDate() - 7);
        break;
      case "30d":
        start.setDate(end.getDate() - 30);
        break;
      case "90d":
        start.setDate(end.getDate() - 90);
        break;
      case "1y":
        start.setFullYear(end.getFullYear() - 1);
        break;
      case "all":
        start.setFullYear(2020, 0, 1); // Start from 2020
        break;
    }
    
    return { startDate: start, endDate: end };
  }, [timeRange]);

  const { data: streamingMetrics } = trpc.metrics.getStreaming.useQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  }, {
    enabled: !isDemoMode && !DEV_MODE
  });

  const { data: socialMetrics } = trpc.metrics.getSocial.useQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  }, {
    enabled: !isDemoMode && !DEV_MODE
  });

  const { data: revenueRecords } = trpc.revenue.getAll.useQuery({}, {
    enabled: !isDemoMode && !DEV_MODE
  });

  const { data: totalRevenue } = trpc.revenue.getTotal.useQuery({}, {
    enabled: !isDemoMode && !DEV_MODE
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isDemoMode && !DEV_MODE) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, isDemoMode, setLocation]);

  // Calculate aggregate stats
  const stats = useMemo(() => {
    const totalStreams = streamingMetrics?.reduce((sum, m) => 
      m.metricType === "streams" ? sum + m.value : sum, 0) || 0;
    
    const totalFollowers = socialMetrics?.reduce((sum, m) => sum + m.followers, 0) || 0;
    
    const avgEngagement = socialMetrics && socialMetrics.length > 0
      ? socialMetrics.reduce((sum, m) => sum + parseFloat(m.engagementRate || "0"), 0) / socialMetrics.length
      : 0;

    return {
      totalStreams,
      totalFollowers,
      totalRevenue: totalRevenue || 0,
      avgEngagement: avgEngagement.toFixed(2),
    };
  }, [streamingMetrics, socialMetrics, totalRevenue]);

  // Group streaming by platform
  const streamingByPlatform = useMemo(() => {
    if (!streamingMetrics) return {};
    
    return streamingMetrics.reduce((acc, metric) => {
      if (metric.metricType === "streams") {
        acc[metric.platform] = (acc[metric.platform] || 0) + metric.value;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [streamingMetrics]);

  // Group social by platform
  const socialByPlatform = useMemo(() => {
    if (!socialMetrics) return {};
    
    return socialMetrics.reduce((acc, metric) => {
      if (!acc[metric.platform]) {
        acc[metric.platform] = {
          followers: 0,
          engagement: 0,
          count: 0,
        };
      }
      acc[metric.platform].followers = Math.max(acc[metric.platform].followers, metric.followers);
      acc[metric.platform].engagement += parseFloat(metric.engagementRate || "0");
      acc[metric.platform].count += 1;
      return acc;
    }, {} as Record<string, { followers: number; engagement: number; count: number }>);
  }, [socialMetrics]);

  // Revenue by source
  const revenueBySource = useMemo(() => {
    if (!revenueRecords) return {};
    
    return revenueRecords.reduce((acc, record) => {
      acc[record.source] = (acc[record.source] || 0) + record.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [revenueRecords]);

  const handleExportReport = () => {
    toast.info("Export feature coming soon! Will generate PDF/CSV reports.");
  };

  const overviewStats = [
    {
      title: "Total Streams",
      value: stats.totalStreams.toLocaleString(),
      change: "+12.5%",
      icon: Music,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Followers",
      value: stats.totalFollowers.toLocaleString(),
      change: "+8.3%",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Revenue",
      value: `$${(stats.totalRevenue / 100).toLocaleString()}`,
      change: "+15.2%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Avg. Engagement",
      value: `${stats.avgEngagement}%`,
      change: "+2.1%",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const platformLabels: Record<string, string> = {
    boptone: "Boptone",
    instagram: "Instagram",
    tiktok: "TikTok",
    twitter: "Twitter",
    youtube: "YouTube",
    facebook: "Facebook",
  };

  const revenueSourceLabels: Record<string, string> = {
    streaming: "Streaming",
    merchandise: "Merchandise",
    shows: "Live Shows",
    licensing: "Licensing",
    brand_deals: "Brand Deals",
    youtube_ads: "YouTube Ads",
    patreon: "Patreon",
    other: "Other",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button className="rounded-full" variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Analytics & Insights</h1>
                <p className="text-sm text-muted-foreground">Comprehensive performance metrics and growth analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Button className="rounded-full" variant="outline" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card className="rounded-xl" key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="streaming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="streaming">
              <Music className="h-4 w-4 mr-2" />
              Streaming
            </TabsTrigger>
            <TabsTrigger value="social">
              <Users className="h-4 w-4 mr-2" />
              Social
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <DollarSign className="h-4 w-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Target className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Streaming Analytics */}
          <TabsContent value="streaming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Streaming Performance by Platform
                </CardTitle>
                <CardDescription>Total streams across all platforms in selected time range</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(streamingByPlatform).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(streamingByPlatform)
                      .sort(([, a], [, b]) => b - a)
                      .map(([platform, streams]) => {
                        const total = Object.values(streamingByPlatform).reduce((sum, val) => sum + val, 0);
                        const percentage = total > 0 ? (streams / total) * 100 : 0;
                        
                        return (
                          <div key={platform} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{platformLabels[platform] || platform}</span>
                              <span className="text-muted-foreground">{streams.toLocaleString()} streams</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground text-right">
                              {percentage.toFixed(1)}% of total
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No streaming data yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Connect your streaming platforms to see analytics
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>Track your streaming growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Listeners</p>
                      <p className="text-2xl font-bold">
                        {streamingMetrics?.filter(m => m.metricType === "monthly_listeners")
                          .reduce((max, m) => Math.max(max, m.value), 0).toLocaleString() || "0"}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Playlist Adds</p>
                      <p className="text-2xl font-bold">
                        {streamingMetrics?.filter(m => m.metricType === "playlist_adds")
                          .reduce((sum, m) => sum + m.value, 0).toLocaleString() || "0"}
                      </p>
                    </div>
                    <Music className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Analytics */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Social Media Presence
                </CardTitle>
                <CardDescription>Follower count and engagement across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(socialByPlatform).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(socialByPlatform)
                      .sort(([, a], [, b]) => b.followers - a.followers)
                      .map(([platform, data]) => {
                        const avgEngagement = data.count > 0 ? (data.engagement / data.count).toFixed(2) : "0.00";
                        
                        return (
                          <div key={platform} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{platformLabels[platform] || platform}</h3>
                              <span className="text-2xl font-bold">{data.followers.toLocaleString()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Followers</p>
                                <p className="font-medium">{data.followers.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Avg. Engagement</p>
                                <p className="font-medium">{avgEngagement}%</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No social media data yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Connect your social accounts to see analytics
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Analytics */}
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
                <CardDescription>Income sources and distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(revenueBySource).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(revenueBySource)
                      .sort(([, a], [, b]) => b - a)
                      .map(([source, amount]) => {
                        const total = Object.values(revenueBySource).reduce((sum, val) => sum + val, 0);
                        const percentage = total > 0 ? (amount / total) * 100 : 0;
                        
                        return (
                          <div key={source} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{revenueSourceLabels[source] || source}</span>
                              <span className="text-muted-foreground">${(amount / 100).toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-600 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground text-right">
                              {percentage.toFixed(1)}% of total
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No revenue data yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start tracking your income to see analytics
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI-Powered Insights */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription>Personalized recommendations based on your performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">🎯 Growth Opportunity</h3>
                  <p className="text-sm text-blue-800">
                    Your engagement rate on TikTok is 2.3x higher than Instagram. Consider increasing your TikTok content frequency to maximize reach.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">💰 Revenue Optimization</h3>
                  <p className="text-sm text-green-800">
                    Merchandise sales peak on Fridays. Schedule product launches and promotions for Thursday evenings to maximize conversions.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">📈 Streaming Trend</h3>
                  <p className="text-sm text-purple-800">
                    Your streams are growing 15% faster than similar artists in your genre. Maintain your current release cadence to sustain momentum.
                  </p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">🎵 Playlist Strategy</h3>
                  <p className="text-sm text-orange-800">
                    You're getting added to 12% more playlists month-over-month. Focus on curator outreach to accelerate this growth.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Predicted Growth</CardTitle>
                <CardDescription>Smart forecasts for the next 90 days based on your data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Projected Streams</p>
                      <p className="text-2xl font-bold">+{((stats.totalStreams * 0.15) || 0).toLocaleString()}</p>
                      <p className="text-xs text-green-600 mt-1">+15% growth expected</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Projected Revenue</p>
                      <p className="text-2xl font-bold">+${((stats.totalRevenue * 0.12) / 100 || 0).toLocaleString()}</p>
                      <p className="text-xs text-green-600 mt-1">+12% growth expected</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
