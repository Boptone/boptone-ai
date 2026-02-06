/**
 * TONE REWARDS - Fan Membership & Rewards Dashboard
 * The revolutionary system where fans become investors
 */

import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  Crown, 
  Star, 
  Gift, 
  TrendingUp, 
  Users, 
  DollarSign,
  Check,
  Sparkles,
  Heart,
  Zap
} from "lucide-react";
import { toast } from "sonner";

const MEMBERSHIP_TIERS = {
  basic: {
    name: "Basic",
    price: "Free",
    priceNote: "",
    icon: Star,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    features: [
      "Limited streaming with ads",
      "Discover new artists",
      "Kick In tips only",
    ],
  },
  member: {
    name: "Member",
    price: "$36",
    priceNote: "/year ($3/mo)",
    icon: Heart,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    features: [
      "Unlimited ad-free streaming",
      "Support unlimited artists",
      "Early access to releases",
      "Named supporter status",
    ],
  },
  executive: {
    name: "Executive",
    price: "$99",
    priceNote: "/year ($8.25/mo)",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-100",
    features: [
      "Everything in Member",
      "2% annual cashback on all spending",
      "Exclusive content access",
      "VIP supporter badge",
      "Priority support",
    ],
  },
};

export default function ToneRewards() {
  const { user } = useAuth();
  
  const { data: membership, isLoading: membershipLoading } = trpc.toneRewards.getMyMembership.useQuery();
  const { data: cashbackStatus } = trpc.toneRewards.getMyCashbackStatus.useQuery({ year: new Date().getFullYear() });
  const { data: myBackings } = trpc.toneRewards.getMyBackings.useQuery();
  
  const upgradeMutation = trpc.toneRewards.upgradeMembership.useMutation({
    onSuccess: () => {
      toast.success("Membership upgraded successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const currentTier = membership?.tier || "basic";
  const tierConfig = MEMBERSHIP_TIERS[currentTier as keyof typeof MEMBERSHIP_TIERS];
  const TierIcon = tierConfig.icon;

  const handleUpgrade = (tier: "member" | "executive") => {
    // In production, this would redirect to Stripe checkout
    upgradeMutation.mutate({ tier });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tone Rewards</h1>
          <p className="text-muted-foreground mt-1">
            Your membership, your rewards, your music economy
          </p>
        </div>

        {/* Current Membership Status */}
        <Card className="rounded-xl border-2 border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${tierConfig.bgColor}`}>
                  <TierIcon className={`h-6 w-6 ${tierConfig.color}`} />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {tierConfig.name} Member
                  </CardTitle>
                  <CardDescription>
                    {currentTier === "executive" 
                      ? "You're earning 2% cashback on all spending!" 
                      : "Upgrade to earn cashback rewards"}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={currentTier === "executive" ? "default" : "secondary"} className="text-sm">
                {currentTier === "executive" ? "VIP" : currentTier.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          
          {cashbackStatus && currentTier === "executive" && (
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">${cashbackStatus.totalSpending.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total Spending</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">${cashbackStatus.projectedCashback.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Cashback Earned</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{myBackings?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Artists Backed</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Membership Tiers */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Membership Tiers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => {
              const Icon = tier.icon;
              const isCurrent = currentTier === key;
              const canUpgrade = !isCurrent && (
                (currentTier === "basic") ||
                (currentTier === "member" && key === "executive")
              );
              
              return (
                <Card key={key} 
                  className={`rounded-xl relative ${isCurrent ? "border-2 border-primary" : ""}`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge>Current Plan</Badge>
                    </div>
                  )}
                  {key === "executive" && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Best Value
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pt-8">
                    <div className={`mx-auto p-4 rounded-full ${tier.bgColor} mb-4`}>
                      <Icon className={`h-8 w-8 ${tier.color}`} />
                    </div>
                    <CardTitle>{tier.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground text-sm">{tier.priceNote}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {canUpgrade && (
                      <Button className="rounded-full w-full" 
                        variant={key === "executive" ? "default" : "outline"}
                        onClick={() => handleUpgrade(key as "member" | "executive")}
                        disabled={upgradeMutation.isPending}
                      >
                        {key === "executive" ? (
                          <>
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade to Executive
                          </>
                        ) : (
                          "Upgrade to Member"
                        )}
                      </Button>
                    )}
                    
                    {isCurrent && (
                      <Button className="rounded-full w-full" variant="secondary" disabled>
                        Current Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Artists I'm Backing */}
        {myBackings && myBackings.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Artists You're Backing</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myBackings.map(({ backing, artist }) => (
                <Card className="rounded-xl" key={backing.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                        <span className="text-lg font-bold">
                          {artist.stageName?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{artist.stageName}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${backing.monthlyAmount}/month • {backing.tier}
                        </p>
                      </div>
                      <Badge variant={backing.tier === "investor" ? "default" : "secondary"}>
                        {backing.tier}
                      </Badge>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total contributed</span>
                        <span className="font-medium">${backing.totalContributed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              How Tone Rewards Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Heart className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-1">Back Artists</h3>
                <p className="text-sm text-muted-foreground">
                  Choose artists to support with monthly backing. 90% goes directly to them.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-1">Earn Cashback</h3>
                <p className="text-sm text-muted-foreground">
                  Executive members earn 2% cashback on all spending - backing, merch, tips, tickets.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                  <Gift className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-semibold mb-1">Get Rewarded</h3>
                <p className="text-sm text-muted-foreground">
                  Receive your annual cashback check. The more you support, the more you earn back.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The Costco Comparison */}
        <Card className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Think Costco Executive Membership</h3>
                <p className="text-muted-foreground">
                  Just like Costco rewards loyal shoppers with annual cashback, Boptone rewards fans 
                  who support artists. Spend throughout the year backing artists, buying merch, 
                  tipping, and attending shows - then receive your 2% cashback check. 
                  <strong className="text-foreground"> It's the only music platform that pays YOU back.</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
