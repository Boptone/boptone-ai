/**
 * ARTIST BACKERS - Dashboard for artists to see who supports them
 * Shows backers, patrons, investors and their contributions
 */

import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";

export default function ArtistBackers() {
  const { user } = useAuth();
  
  const { data: profile } = trpc.artistProfile.getMyProfile.useQuery();
  const { data: stats } = trpc.toneRewards.getArtistStats.useQuery(
    { artistProfileId: profile?.id || 0 },
    { enabled: !!profile?.id }
  );
  const { data: backers } = trpc.toneRewards.getMyBackers.useQuery(
    { artistProfileId: profile?.id || 0 },
    { enabled: !!profile?.id }
  );
  const { data: dividends } = trpc.toneRewards.getArtistDividends.useQuery(
    { artistProfileId: profile?.id || 0 },
    { enabled: !!profile?.id }
  );

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "investor": return "👑";
      case "patron": return "★";
      default: return "♥";
    }
  };

  const getTierStyle = (tier: string) => {
    switch (tier) {
      case "investor": return "bg-black text-white";
      case "patron": return "bg-gray-800 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Your Backers</h1>
          <p className="text-gray-600 mt-1">
            See who's supporting your music career
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-4 border-black rounded-none bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-none bg-gray-100 border-2 border-gray-200">
                  <span className="text-2xl font-bold">U</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-black">{stats?.totalBackers || 0}</p>
                  <p className="text-sm text-gray-600">Total Backers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-4 border-black rounded-none bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-none bg-gray-100 border-2 border-gray-200">
                  <span className="text-2xl font-bold">$</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-black">${stats?.monthlyRevenue?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-4 border-black rounded-none bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-none bg-gray-100 border-2 border-gray-200">
                  <span className="text-2xl font-bold">↑</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-black">${stats?.totalContributed?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm text-gray-600">Total Contributed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-4 border-black rounded-none bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-none bg-gray-100 border-2 border-gray-200">
                  <span className="text-2xl font-bold">G</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-black">
                    ${dividends?.[0]?.dividendAmount || "0.00"}
                  </p>
                  <p className="text-sm text-gray-600">Tone Dividend</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tone Dividend Explanation */}
        <Card className="rounded-none border-4 border-black bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-none bg-gray-200 border-2 border-gray-200">
                <span className="text-2xl font-bold">G</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-black">Your Tone Dividend</h3>
                <p className="text-gray-700">
                  As a Boptone artist, you earn a 3% bonus on all your platform earnings. 
                  This is our way of saying "thanks for building on Boptone." Your dividend 
                  is calculated annually and paid out at year end.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backers List */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-black">Your Supporters</h2>
          
          {backers && backers.length > 0 ? (
            <div className="space-y-3">
              {backers.map(({ backing, fan }) => {
                const tierLabel = getTierLabel(backing.tier);
                const tierStyle = getTierStyle(backing.tier);
                
                return (
                  <Card className="rounded-none border-2 border-gray-200 bg-white" key={backing.id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="rounded-none border-2 border-gray-200">
                            <AvatarFallback className="rounded-none bg-gray-100 text-black font-bold">
                              {fan.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-black">{fan.name || "Anonymous"}</p>
                            <p className="text-sm text-gray-600">
                              Backing since {new Date(backing.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-black">${backing.monthlyAmount}/mo</p>
                            <p className="text-sm text-gray-600">
                              ${backing.totalContributed} total
                            </p>
                          </div>
                          <Badge className={`${tierStyle} rounded-full`}>
                            <span className="mr-1">{tierLabel}</span>
                            {backing.tier}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-4 border-black rounded-none bg-white">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="h-12 w-12 mx-auto mb-4 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
                  <span className="text-2xl text-gray-400">U</span>
                </div>
                <h3 className="font-semibold mb-2 text-black">No backers yet</h3>
                <p className="text-gray-600 mb-4">
                  Share your Boptone profile to start building your supporter community
                </p>
                <Button className="rounded-full bg-black hover:bg-gray-800 text-white">Share Your Profile</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* How Backing Works */}
        <Card className="border-4 border-black rounded-none bg-white">
          <CardHeader>
            <CardTitle className="text-black">How Fan Backing Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-600 flex items-center justify-center mb-3">
                  <span className="text-2xl">♥</span>
                </div>
                <h3 className="font-semibold mb-1 text-black">Backer ($3/mo)</h3>
                <p className="text-sm text-gray-600">
                  Basic monthly support. You receive $2.70 (90%).
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-800 flex items-center justify-center mb-3">
                  <span className="text-2xl">★</span>
                </div>
                <h3 className="font-semibold mb-1 text-black">Patron ($10/mo)</h3>
                <p className="text-sm text-gray-600">
                  Premium support + early access. You receive $9 (90%).
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center mb-3">
                  <span className="text-2xl">👑</span>
                </div>
                <h3 className="font-semibold mb-1 text-black">Investor ($25+/mo)</h3>
                <p className="text-sm text-gray-600">
                  VIP support + revenue share. You receive $22.50+ (90%).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
