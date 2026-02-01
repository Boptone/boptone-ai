import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Users, 
  TrendingUp, 
  Heart,
  Share2,
  BarChart3,
  Award,
  Target,
  Sparkles
} from "lucide-react";

export default function Fans() {
  const { user } = useAuth();
  
  // Analytics data
  const { data: profile } = trpc.artistProfile.getMyProfile.useQuery();
  
  const stats = [
    {
      title: "Your Followers",
      value: "0", // TODO: Add followers count
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Your Streams",
      value: "0", // TODO: Add streams count
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Your Engagement",
      value: "0%", // TODO: Calculate engagement
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      title: "Your Rewards",
      value: "0", // TODO: Add rewards points
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-4 border-black pb-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase">YOUR AUDIENCE</h1>
          <p className="text-xl font-bold mt-3">
            GROW YOUR AUDIENCE, TRACK ENGAGEMENT, AND REWARD YOUR SUPPORTERS
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-4 border-4 border-black">
          {stats.map((stat, idx) => (
            <div key={stat.title} className={`p-6 bg-white ${idx < stats.length - 1 ? 'border-r-4 border-black' : ''} ${idx < 2 ? 'lg:border-b-0 border-b-4' : ''} md:border-b-0`}>
              <div className="text-xs font-black uppercase tracking-wider mb-2">
                {stat.title}
              </div>
              <div className="text-4xl font-black font-mono" style={{ color: '#4285F4' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="rounded-none border-2 border-black bg-white">
            <TabsTrigger value="analytics" className="rounded-none font-black uppercase data-[state=active]:bg-black data-[state=active]:text-white">ANALYTICS</TabsTrigger>
            <TabsTrigger value="growth" className="rounded-none font-black uppercase data-[state=active]:bg-black data-[state=active]:text-white">FAN GROWTH</TabsTrigger>
            <TabsTrigger value="rewards" className="rounded-none font-black uppercase data-[state=active]:bg-black data-[state=active]:text-white">REWARDS</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-none border-4 border-black">
                <CardHeader className="bg-black text-white">
                  <CardTitle className="text-xl font-black uppercase">STREAM PERFORMANCE</CardTitle>
                  <CardDescription className="text-white/80 font-bold">
                    YOUR MOST POPULAR TRACKS
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No streaming data yet</p>
                    <p className="text-sm mt-2">Upload music to start tracking performance</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-none border-4 border-black">
                <CardHeader className="bg-black text-white">
                  <CardTitle className="text-xl font-black uppercase">AUDIENCE DEMOGRAPHICS</CardTitle>
                  <CardDescription className="text-white/80 font-bold">
                    WHERE YOUR FANS ARE LISTENING FROM
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No audience data yet</p>
                    <p className="text-sm mt-2">Build your fanbase to see demographics</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-xl font-black uppercase">ENGAGEMENT TRENDS</CardTitle>
                <CardDescription className="text-white/80 font-bold">
                  LIKES, SHARES, AND PLAYLIST ADDS OVER TIME
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No engagement data yet</p>
                  <p className="text-sm mt-2">Fans will start engaging with your music soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fan Growth Tab */}
          <TabsContent value="growth" className="space-y-4">
            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-xl font-black uppercase">GROWTH STRATEGIES</CardTitle>
                <CardDescription>
                  Tools to help you reach more fans
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Share2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Share Your Profile</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get your unique artist link to share on social media
                    </p>
                    <Button variant="outline" size="sm">
                      Copy Profile Link
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Promote Your Music</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Run targeted campaigns to reach new listeners
                    </p>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Collaborate with Artists</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Find and connect with other artists for features
                    </p>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Tips</CardTitle>
                <CardDescription>
                  Personalized recommendations to grow your audience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm">Upload consistently - artists who release monthly grow 3x faster</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm">Complete your profile - bios and photos get 50% more followers</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm">Engage with fans - respond to comments and messages</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tone Rewards Program</CardTitle>
                <CardDescription>
                  Reward your most loyal fans with exclusive perks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Bronze Tier</h3>
                      <Badge variant="outline">0 fans</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Fans who stream 10+ songs
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Early access to new releases</li>
                      <li>• Exclusive behind-the-scenes content</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Silver Tier</h3>
                      <Badge variant="outline">0 fans</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Fans who stream 50+ songs
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• All Bronze benefits</li>
                      <li>• Discounted merchandise</li>
                      <li>• Priority support responses</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Gold Tier</h3>
                      <Badge variant="outline">0 fans</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Fans who stream 100+ songs
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• All Silver benefits</li>
                      <li>• Free merchandise</li>
                      <li>• Meet & greet opportunities</li>
                      <li>• Vote on setlists and releases</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-center">
                    <strong>Tip:</strong> Reward tiers are automatically assigned based on fan engagement. The more your fans listen, the more they unlock!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
