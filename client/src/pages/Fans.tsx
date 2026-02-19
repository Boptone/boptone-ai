import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

export default function Fans() {
  const { user } = useAuth();
  
  // Analytics data
  const { data: profile } = trpc.artistProfile.getMyProfile.useQuery();
  
  const stats = [
    {
      title: "Followers",
      value: "0", // TODO: Add followers count
    },
    {
      title: "Streams",
      value: "0", // TODO: Add streams count
    },
    {
      title: "Engagement",
      value: "0%", // TODO: Calculate engagement
    },
    {
      title: "Rewards",
      value: "0", // TODO: Add rewards points
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-4 border-black pb-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight uppercase">Audience</h1>
          <p className="text-xl font-medium mt-3 text-gray-600">
            Grow your audience, track engagement, and reward your supporters
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-4 border-4 border-black">
          {stats.map((stat, idx) => (
            <div 
              key={stat.title} 
              className={`p-6 bg-white ${idx < stats.length - 1 ? 'border-r-4 border-black' : ''} ${idx < 2 ? 'lg:border-b-0 border-b-4 border-black' : ''} md:border-b-0`}
            >
              <div className="text-xs font-bold tracking-wider mb-2 uppercase text-gray-600">
                {stat.title}
              </div>
              <div className="text-4xl font-bold font-mono">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="rounded-none border-4 border-black bg-white">
            <TabsTrigger value="analytics" className="rounded-none font-bold uppercase data-[state=active]:bg-black data-[state=active]:text-white">Analytics</TabsTrigger>
            <TabsTrigger value="growth" className="rounded-none font-bold uppercase data-[state=active]:bg-black data-[state=active]:text-white">Fan Growth</TabsTrigger>
            <TabsTrigger value="rewards" className="rounded-none font-bold uppercase data-[state=active]:bg-black data-[state=active]:text-white">Rewards</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-none border-4 border-black">
                <CardHeader className="bg-black text-white">
                  <CardTitle className="text-xl font-bold uppercase">Stream Performance</CardTitle>
                  <CardDescription className="text-white/90 font-medium">
                    Your most popular tracks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-600">
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-4 border-2 border-gray-200">
                      <span className="text-gray-400 text-5xl">📊</span>
                    </div>
                    <p className="font-medium">No streaming data yet</p>
                    <p className="text-sm mt-2">Upload music to start tracking performance</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-none border-4 border-black">
                <CardHeader className="bg-black text-white">
                  <CardTitle className="text-xl font-bold uppercase">Audience Demographics</CardTitle>
                  <CardDescription className="text-white/90 font-medium">
                    Where your fans are listening from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-600">
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-4 border-2 border-gray-200">
                      <span className="text-gray-400 text-5xl">FANS</span>
                    </div>
                    <p className="font-medium">No audience data yet</p>
                    <p className="text-sm mt-2">Build your fanbase to see demographics</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-xl font-bold uppercase">Engagement Trends</CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Likes, shares, and playlist adds over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-600">
                  <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-4 border-2 border-gray-200">
                    <span className="text-gray-400 text-5xl">↗</span>
                  </div>
                  <p className="font-medium">No engagement data yet</p>
                  <p className="text-sm mt-2">Fans will start engaging with your music soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fan Growth Tab */}
          <TabsContent value="growth" className="space-y-4">
            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-xl font-bold uppercase">Growth Strategies</CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Tools to help you reach more fans
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 border-2 border-gray-200">
                  <div className="h-10 w-10 bg-black flex items-center justify-center shrink-0">
                    <span className="text-white text-xl">SHARE</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Share Your Profile</h3>
                    <p className="text-sm text-gray-600 mb-3 font-medium">
                      Get your unique artist link to share on social media
                    </p>
                    <Button className="rounded-none border-2 border-gray-200 font-bold" variant="outline" size="sm">
                      Copy Profile Link
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border-2 border-gray-200">
                  <div className="h-10 w-10 bg-black flex items-center justify-center shrink-0">
                    <span className="text-white text-xl">TARGET</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Promote Your Music</h3>
                    <p className="text-sm text-gray-600 mb-3 font-medium">
                      Run targeted campaigns to reach new listeners
                    </p>
                    <Badge variant="secondary" className="rounded-none border-2 border-gray-200 bg-gray-100 font-bold uppercase">Coming Soon</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border-2 border-gray-200">
                  <div className="h-10 w-10 bg-black flex items-center justify-center shrink-0">
                    <span className="text-white text-xl">NEW</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Collaborate with Artists</h3>
                    <p className="text-sm text-gray-600 mb-3 font-medium">
                      Find and connect with other artists for features
                    </p>
                    <Badge variant="secondary" className="rounded-none border-2 border-gray-200 bg-gray-100 font-bold uppercase">Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-xl font-bold uppercase">Growth Tips</CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Personalized recommendations to grow your audience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-100 border-2 border-gray-200">
                  <div className="h-8 w-8 bg-black flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">1</span>
                  </div>
                  <p className="text-sm font-medium">Upload consistently - artists who release monthly grow 3x faster</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-100 border-2 border-gray-200">
                  <div className="h-8 w-8 bg-black flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">2</span>
                  </div>
                  <p className="text-sm font-medium">Complete your profile - bios and photos get 50% more followers</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-100 border-2 border-gray-200">
                  <div className="h-8 w-8 bg-black flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">3</span>
                  </div>
                  <p className="text-sm font-medium">Engage with fans - respond to comments and messages</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-4">
            <Card className="rounded-none border-4 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-xl font-bold uppercase">Tone Rewards Program</CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Reward your most loyal fans with exclusive perks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">Bronze Tier</h3>
                      <Badge variant="outline" className="rounded-none border-2 border-gray-200 font-bold">0 fans</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 font-medium">
                      Fans who stream 10+ songs
                    </p>
                    <ul className="text-sm space-y-1 text-gray-600 font-medium">
                      <li>• Early access to new releases</li>
                      <li>• Exclusive behind-the-scenes content</li>
                    </ul>
                  </div>

                  <div className="p-4 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">Silver Tier</h3>
                      <Badge variant="outline" className="rounded-none border-2 border-gray-200 font-bold">0 fans</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 font-medium">
                      Fans who stream 50+ songs
                    </p>
                    <ul className="text-sm space-y-1 text-gray-600 font-medium">
                      <li>• All Bronze benefits</li>
                      <li>• Discounted merchandise</li>
                      <li>• Priority support responses</li>
                    </ul>
                  </div>

                  <div className="p-4 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">Gold Tier</h3>
                      <Badge variant="outline" className="rounded-none border-2 border-gray-200 font-bold">0 fans</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 font-medium">
                      Fans who stream 100+ songs
                    </p>
                    <ul className="text-sm space-y-1 text-gray-600 font-medium">
                      <li>• All Silver benefits</li>
                      <li>• Free merchandise</li>
                      <li>• Meet & greet opportunities</li>
                      <li>• Vote on setlists and releases</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-100 border-2 border-gray-200">
                  <p className="text-sm text-center font-medium">
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
