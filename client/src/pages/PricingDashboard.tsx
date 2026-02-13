import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Users, Zap, Target, Info, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function PricingDashboard() {
  const { user } = useAuth();
  const [selectedPrice, setSelectedPrice] = useState(1); // Default $0.01
  
  // Pricing tiers to analyze
  const priceTiers = [1, 2, 3, 4, 5]; // $0.01 to $0.05
  
  // Simulate data for each price point
  const getPriceData = (priceInCents: number) => {
    const baseStreams = 10000;
    // Higher prices = fewer streams (demand elasticity)
    const demandMultiplier = 1 - ((priceInCents - 1) * 0.15);
    const estimatedStreams = Math.floor(baseStreams * Math.max(0.4, demandMultiplier));
    const artistShare = Math.floor(priceInCents * 0.9);
    const totalRevenue = (estimatedStreams * artistShare) / 100;
    
    return {
      price: priceInCents / 100,
      estimatedStreams,
      revenuePerStream: artistShare / 100,
      totalRevenue,
      platformFee: (priceInCents - artistShare) / 100,
    };
  };
  
  const selectedData = getPriceData(selectedPrice);
  
  // Find optimal price (highest total revenue)
  const optimalPrice = priceTiers.reduce((best, current) => {
    const bestData = getPriceData(best);
    const currentData = getPriceData(current);
    return currentData.totalRevenue > bestData.totalRevenue ? current : best;
  }, 1);
  
  const isOptimal = selectedPrice === optimalPrice;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Pricing Strategy</h1>
          <p className="text-muted-foreground">
            Optimize your per-stream pricing to maximize revenue and reach
          </p>
        </div>
        
        {/* Current Price Selector */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Test Your Price Point
            </CardTitle>
            <CardDescription>
              See how different prices affect your streams and revenue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Price Per Stream</span>
                <div className="text-3xl font-bold text-purple-600">
                  ${selectedData.price.toFixed(2)}
                </div>
              </div>
              
              <Slider
                value={[selectedPrice]}
                onValueChange={(value) => setSelectedPrice(value[0])}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                {priceTiers.map(price => (
                  <span key={price}>${(price / 100).toFixed(2)}</span>
                ))}
              </div>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span>Estimated Streams</span>
                </div>
                <div className="text-2xl font-bold">
                  {selectedData.estimatedStreams.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span>You Earn (90%)</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ${selectedData.revenuePerStream.toFixed(3)}
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 col-span-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Total Revenue (Monthly)</span>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  ${selectedData.totalRevenue.toFixed(2)}
                </div>
              </div>
            </div>
            
            {isOptimal && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <Zap className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Optimal Price Point!</p>
                  <p className="text-sm text-green-800">
                    This price maximizes your total revenue based on estimated demand.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Price Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Price Point Comparison</CardTitle>
            <CardDescription>
              Compare all pricing tiers side-by-side
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priceTiers.map(price => {
                const data = getPriceData(price);
                const isSelected = price === selectedPrice;
                const isOpt = price === optimalPrice;
                
                return (
                  <div
                    key={price}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedPrice(price)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-purple-600">
                          ${data.price.toFixed(2)}
                        </div>
                        {isOpt && (
                          <Badge className="bg-green-500">
                            <Zap className="h-3 w-3 mr-1" />
                            Optimal
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <div className="text-muted-foreground">Streams</div>
                          <div className="font-semibold">{data.estimatedStreams.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">You Earn</div>
                          <div className="font-semibold">${data.revenuePerStream.toFixed(3)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Total Revenue</div>
                          <div className="font-semibold text-green-600">${data.totalRevenue.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* A/B Testing Suggestions */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              A/B Testing Suggestions
            </CardTitle>
            <CardDescription>
              Data-driven strategies to optimize your pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Start Low, Build Momentum</h3>
                    <p className="text-sm text-muted-foreground">
                      Launch at <strong>$0.01</strong> to maximize initial streams and build your fanbase. 
                      Once you hit 10,000 streams, test increasing to <strong>$0.02</strong>.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Test Premium Pricing</h3>
                    <p className="text-sm text-muted-foreground">
                      For exclusive releases or special content, try <strong>$0.04-$0.05</strong>. 
                      Your most loyal fans will pay more for premium access.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Monitor Competitor Pricing</h3>
                    <p className="text-sm text-muted-foreground">
                      Most artists on BAP price between <strong>$0.01-$0.03</strong>. 
                      Stay competitive while testing what works for your audience.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Seasonal Adjustments</h3>
                    <p className="text-sm text-muted-foreground">
                      Lower prices during promotional periods (album launch, holidays) to drive volume. 
                      Raise prices for limited releases or anniversary editions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Spotify Comparison */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle>Why Boptone Beats Spotify</CardTitle>
            <CardDescription>
              See how much more you earn with BAP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border-2 border-gray-300">
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Spotify</div>
                  <div className="text-4xl font-bold text-gray-600">$0.003</div>
                  <div className="text-xs text-muted-foreground">per stream</div>
                  <div className="pt-4 border-t mt-4">
                    <div className="text-sm text-muted-foreground">10,000 streams =</div>
                    <div className="text-2xl font-bold text-gray-600">$30.00</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border-2 border-green-500">
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium text-green-600">Boptone (You)</div>
                  <div className="text-4xl font-bold text-green-600">
                    ${selectedData.revenuePerStream.toFixed(3)}
                  </div>
                  <div className="text-xs text-muted-foreground">per stream (90% of ${selectedData.price.toFixed(2)})</div>
                  <div className="pt-4 border-t border-green-200 mt-4">
                    <div className="text-sm text-muted-foreground">10,000 streams =</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${(10000 * selectedData.revenuePerStream).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-lg font-semibold text-green-900">
                You earn <strong>{((selectedData.revenuePerStream / 0.003) * 100).toFixed(0)}%</strong> more per stream on Boptone!
              </p>
              <p className="text-sm text-green-800 mt-1">
                That's ${((10000 * selectedData.revenuePerStream) - 30).toFixed(2)} extra for every 10,000 streams
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
