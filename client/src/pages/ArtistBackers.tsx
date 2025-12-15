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
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Heart,
  Crown,
  Star,
  Gift
} from "lucide-react";

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

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "investor": return Crown;
      case "patron": return Star;
      default: return Heart;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "investor": return "text-amber-500 bg-amber-100";
      case "patron": return "text-purple-500 bg-purple-100";
      default: return "text-blue-500 bg-blue-100";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Backers</h1>
          <p className="text-muted-foreground mt-1">
            See who's supporting your music career
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalBackers || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Backers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats?.monthlyRevenue?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats?.totalContributed?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm text-muted-foreground">Total Contributed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-100">
                  <Gift className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    ${dividends?.[0]?.dividendAmount || "0.00"}
                  </p>
                  <p className="text-sm text-muted-foreground">Tone Dividend</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tone Dividend Explanation */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-200">
                <Gift className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Your Tone Dividend</h3>
                <p className="text-muted-foreground">
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
          <h2 className="text-xl font-semibold mb-4">Your Supporters</h2>
          
          {backers && backers.length > 0 ? (
            <div className="space-y-3">
              {backers.map(({ backing, fan }) => {
                const TierIcon = getTierIcon(backing.tier);
                const tierColor = getTierColor(backing.tier);
                
                return (
                  <Card key={backing.id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {fan.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{fan.name || "Anonymous"}</p>
                            <p className="text-sm text-muted-foreground">
                              Backing since {new Date(backing.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">${backing.monthlyAmount}/mo</p>
                            <p className="text-sm text-muted-foreground">
                              ${backing.totalContributed} total
                            </p>
                          </div>
                          <Badge className={tierColor}>
                            <TierIcon className="h-3 w-3 mr-1" />
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
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No backers yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your Boptone profile to start building your supporter community
                </p>
                <Button>Share Your Profile</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* How Backing Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Fan Backing Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Heart className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-1">Backer ($3/mo)</h3>
                <p className="text-sm text-muted-foreground">
                  Basic monthly support. You receive $2.70 (90%).
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                  <Star className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-1">Patron ($10/mo)</h3>
                <p className="text-sm text-muted-foreground">
                  Premium support + early access. You receive $9 (90%).
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                  <Crown className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-semibold mb-1">Investor ($25+/mo)</h3>
                <p className="text-sm text-muted-foreground">
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
