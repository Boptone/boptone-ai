import { useAuth } from "@/_core/hooks/useAuth";
import { useRequireArtist } from "@/hooks/useRequireArtist";
import { DEV_MODE } from "@/lib/devMode";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type TimeRange = "7d" | "30d" | "90d" | "1y" | "all";

export default function Analytics() {
  useRequireArtist(); // Enforce artist authentication
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
    },
    {
      title: "Total Followers",
      value: stats.totalFollowers.toLocaleString(),
      change: "+8.3%",
    },
    {
      title: "Total Revenue",
      value: `$${(stats.totalRevenue / 100).toLocaleString()}`,
      change: "+15.2%",
    },
    {
      title: "Avg. Engagement",
      value: `${stats.avgEngagement}%`,
      change: "+2.1%",
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <span className="text-2xl">←</span>
              </Button>
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">Analytics</h1>
                <p className="text-lg text-gray-600 mt-2">Comprehensive performance metrics and growth analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-[140px]">
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
            return (
              <Card className="border border-gray-200 hover:border-gray-400 transition-colors" key={stat.title}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium text-gray-600">{stat.change}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{stat.title}</p>
                    <p className="text-4xl font-bold mt-2 text-gray-900">{stat.value}</p>
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
              Streaming
            </TabsTrigger>
            <TabsTrigger value="social">
              Social
            </TabsTrigger>
            <TabsTrigger value="revenue">
              Revenue
            </TabsTrigger>
            <TabsTrigger value="insights">
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Streaming Analytics */}
          <TabsContent value="streaming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Streaming Performance by Platform</CardTitle>
                <CardDescription>Total streams across all platforms in selected time range</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(streamingByPlatform).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(streamingByPlatform)
                      .sort(([, a], [, b]) => b - a)
                      .map(([platform, streams]) => (
                        <div key={platform} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">{platformLabels[platform] || platform}</span>
                            <span className="text-2xl font-bold">{streams.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3">
                            <div
                              className="bg-gray-900 h-3 rounded-full transition-all"
                              style={{
                                width: `${(streams / Math.max(...Object.values(streamingByPlatform))) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No streaming data yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Connect your streaming platforms to see analytics
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-gray-200 hover:border-gray-400 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Top Platform</p>
                      <p className="text-3xl font-bold mt-2">
                        {Object.keys(streamingByPlatform).length > 0
                          ? platformLabels[
                              Object.entries(streamingByPlatform).sort(([, a], [, b]) => b - a)[0][0]
                            ] || "N/A"
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 hover:border-gray-400 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Avg. per Platform</p>
                      <p className="text-3xl font-bold mt-2">
                        {Object.keys(streamingByPlatform).length > 0
                          ? Math.round(
                              Object.values(streamingByPlatform).reduce((a, b) => a + b, 0) /
                                Object.keys(streamingByPlatform).length
                            ).toLocaleString()
                          : "0"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Analytics */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Presence</CardTitle>
                <CardDescription>Follower counts and engagement rates across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(socialByPlatform).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(socialByPlatform)
                      .sort(([, a], [, b]) => b.followers - a.followers)
                      .map(([platform, data]) => (
                        <div key={platform} className="border border-gray-200 hover:border-gray-400 transition-colors rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-bold capitalize">{platformLabels[platform] || platform}</span>
                            <span className="text-sm text-gray-600">
                              {(data.engagement / data.count).toFixed(2)}% engagement
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Followers</span>
                            <span className="text-2xl font-bold">{data.followers.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No social media data yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Connect your social accounts to track growth
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
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Income sources and earnings distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(revenueBySource).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(revenueBySource)
                      .sort(([, a], [, b]) => b - a)
                      .map(([source, amount]) => (
                        <div key={source} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{revenueSourceLabels[source] || source}</span>
                            <span className="text-2xl font-bold">${(amount / 100).toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3">
                            <div
                              className="bg-gray-900 h-3 rounded-full transition-all"
                              style={{
                                width: `${(amount / Math.max(...Object.values(revenueBySource))) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No revenue data yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start earning to see revenue analytics
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Personalized recommendations to grow your audience and revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-100 border border-gray-200 hover:border-gray-400 transition-colors rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Growth Opportunity</h3>
                  <p className="text-gray-700">
                    Your engagement rate on Instagram is 2.3% above average. Consider posting more frequently to
                    capitalize on this momentum.
                  </p>
                </div>

                <div className="p-4 bg-gray-100 border border-gray-200 hover:border-gray-400 transition-colors rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Revenue Optimization</h3>
                  <p className="text-gray-700">
                    Streaming revenue increased 15% this month. Focus on playlist placements and collaborations to
                    maintain growth.
                  </p>
                </div>

                <div className="p-4 bg-gray-100 border border-gray-200 hover:border-gray-400 transition-colors rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Audience Insight</h3>
                  <p className="text-gray-700">
                    Your top listeners are in Los Angeles, New York, and London. Consider planning shows in these
                    cities for maximum impact.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-gray-200 hover:border-gray-400 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Growth Score</p>
                      <p className="text-3xl font-bold mt-2">8.5/10</p>
                      <p className="text-sm text-gray-600 mt-2">Above average performance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 hover:border-gray-400 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Revenue Potential</p>
                      <p className="text-3xl font-bold mt-2">High</p>
                      <p className="text-sm text-gray-600 mt-2">Strong monetization opportunities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
