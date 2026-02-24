import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
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
          <h1 className="text-4xl font-bold mb-2 text-black">Pricing Strategy</h1>
          <p className="text-gray-700 font-medium">
            Optimize your per-stream pricing to maximize revenue and reach
          </p>
        </div>
        
        {/* Current Price Selector */}
        <Card className="rounded-none border-4 border-black bg-white">
          <CardHeader className="border-b-4 border-black">
            <CardTitle className="text-2xl font-bold text-black">
              TARGET Test Your Price Point
            </CardTitle>
            <CardDescription className="text-gray-700 font-medium">
              See how different prices affect your streams and revenue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-black">Price Per Stream</span>
                <div className="text-4xl font-bold text-black">
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
              
              <div className="flex justify-between text-sm text-gray-700 font-medium">
                {priceTiers.map(price => (
                  <span key={price}>${(price / 100).toFixed(2)}</span>
                ))}
              </div>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 rounded-none p-4 border border-gray-200 hover:border-gray-400 transition-colors">
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-1 font-medium">
                  <span>FANS Estimated Streams</span>
                </div>
                <div className="text-2xl font-bold text-black">
                  {selectedData.estimatedStreams.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-none p-4 border border-gray-200 hover:border-gray-400 transition-colors">
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-1 font-medium">
                  <span>$ You Earn (90%)</span>
                </div>
                <div className="text-2xl font-bold text-black">
                  ${selectedData.revenuePerStream.toFixed(3)}
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-none p-4 col-span-2 border border-gray-200 hover:border-gray-400 transition-colors">
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-1 font-medium">
                  <span>↗ Total Revenue (Monthly)</span>
                </div>
                <div className="text-3xl font-bold text-black">
                  ${selectedData.totalRevenue.toFixed(2)}
                </div>
              </div>
            </div>
            
            {isOptimal && (
              <div className="bg-gray-100 border border-gray-200 hover:border-gray-400 transition-colors rounded-none p-4 flex items-start gap-3">
                <span className="text-2xl">INSTANT</span>
                <div>
                  <p className="font-bold text-black">Optimal Price Point!</p>
                  <p className="text-sm text-gray-700 font-medium">
                    This price maximizes your total revenue based on estimated demand.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Price Comparison Table */}
        <Card className="rounded-none border-4 border-black bg-white">
          <CardHeader className="border-b-4 border-black">
            <CardTitle className="text-2xl font-bold text-black">Price Point Comparison</CardTitle>
            <CardDescription className="text-gray-700 font-medium">
              Compare all pricing tiers side-by-side
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {priceTiers.map(price => {
                const data = getPriceData(price);
                const isSelected = price === selectedPrice;
                const isOpt = price === optimalPrice;
                
                return (
                  <div
                    key={price}
                    className={`p-4 rounded-none border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-black bg-gray-100'
                        : 'border-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPrice(price)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-black">
                          ${data.price.toFixed(2)}
                        </div>
                        {isOpt && (
                          <Badge className="rounded-none bg-black text-white border border-gray-200 font-bold">
                            INSTANT Optimal
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <div className="text-gray-700 font-medium">Streams</div>
                          <div className="font-bold text-black">{data.estimatedStreams.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-700 font-medium">You Earn</div>
                          <div className="font-bold text-black">${data.revenuePerStream.toFixed(3)}</div>
                        </div>
                        <div>
                          <div className="text-gray-700 font-medium">Total Revenue</div>
                          <div className="font-bold text-black">${data.totalRevenue.toFixed(2)}</div>
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
        <Card className="rounded-none border-4 border-black bg-white">
          <CardHeader className="border-b-4 border-black">
            <CardTitle className="text-2xl font-bold text-black">
              NEW A/B Testing Suggestions
            </CardTitle>
            <CardDescription className="text-gray-700 font-medium">
              Data-driven strategies to optimize your pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              <div className="bg-gray-100 rounded-none p-4 border border-gray-200 hover:border-gray-400 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-black text-white rounded-none flex items-center justify-center flex-shrink-0 font-bold border border-gray-200">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-black">Start Low, Build Momentum</h3>
                    <p className="text-sm text-gray-700 font-medium">
                      Launch at <strong>$0.01</strong> to maximize initial streams and build your fanbase. 
                      Once you hit 10,000 streams, test increasing to <strong>$0.02</strong>.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-none p-4 border border-gray-200 hover:border-gray-400 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-black text-white rounded-none flex items-center justify-center flex-shrink-0 font-bold border border-gray-200">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-black">Test Premium Pricing</h3>
                    <p className="text-sm text-gray-700 font-medium">
                      For exclusive releases or special content, try <strong>$0.04-$0.05</strong>. 
                      Your most loyal fans will pay more for premium access.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-none p-4 border border-gray-200 hover:border-gray-400 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-black text-white rounded-none flex items-center justify-center flex-shrink-0 font-bold border border-gray-200">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-black">Monitor Competitor Pricing</h3>
                    <p className="text-sm text-gray-700 font-medium">
                      Most artists on BAP price between <strong>$0.01-$0.03</strong>. 
                      Stay competitive while testing what works for your audience.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-none p-4 border border-gray-200 hover:border-gray-400 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-black text-white rounded-none flex items-center justify-center flex-shrink-0 font-bold border border-gray-200">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-black">Seasonal Adjustments</h3>
                    <p className="text-sm text-gray-700 font-medium">
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
        <Card className="rounded-none border-4 border-black bg-white">
          <CardHeader className="border-b-4 border-black">
            <CardTitle className="text-2xl font-bold text-black">Why Boptone Beats Spotify</CardTitle>
            <CardDescription className="text-gray-700 font-medium">
              See how much more you earn with BAP
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 rounded-none p-6 border border-gray-200 hover:border-gray-400 transition-colors">
                <div className="text-center space-y-2">
                  <div className="text-sm font-bold text-gray-700">Spotify</div>
                  <div className="text-4xl font-bold text-gray-900">$0.003</div>
                  <div className="text-xs text-gray-700 font-medium">per stream</div>
                  <div className="pt-4 border-t-2 border-gray-900 mt-4">
                    <div className="text-sm text-gray-700 font-medium">10,000 streams =</div>
                    <div className="text-2xl font-bold text-gray-900">$30.00</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black rounded-none p-6 border border-gray-200">
                <div className="text-center space-y-2">
                  <div className="text-sm font-bold text-white">Boptone (You)</div>
                  <div className="text-4xl font-bold text-white">
                    ${selectedData.revenuePerStream.toFixed(3)}
                  </div>
                  <div className="text-xs text-gray-300 font-medium">per stream (90% of ${selectedData.price.toFixed(2)})</div>
                  <div className="pt-4 border-t-2 border-white mt-4">
                    <div className="text-sm text-gray-300 font-medium">10,000 streams =</div>
                    <div className="text-2xl font-bold text-white">
                      ${(10000 * selectedData.revenuePerStream).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-gray-100 border border-gray-200 hover:border-gray-400 transition-colors rounded-none p-4 text-center">
              <p className="text-lg font-bold text-black">
                You earn <strong>{((selectedData.revenuePerStream / 0.003) * 100).toFixed(0)}%</strong> more per stream on Boptone!
              </p>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                That's ${((10000 * selectedData.revenuePerStream) - 30).toFixed(2)} extra for every 10,000 streams
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
