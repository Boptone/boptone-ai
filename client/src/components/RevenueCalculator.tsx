import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { DollarSign, TrendingUp, Users, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RevenueCalculatorProps {
  pricePerStream: number; // In cents
  onChange: (price: number) => void;
}

export function RevenueCalculator({ pricePerStream, onChange }: RevenueCalculatorProps) {
  const priceInDollars = pricePerStream / 100;
  const artistShare = Math.floor(pricePerStream * 0.9);
  const platformFee = pricePerStream - artistShare;
  
  // Calculate projections at different stream volumes
  const streamVolumes = [100, 500, 1000, 5000, 10000];
  
  // Estimate stream volume impact based on price
  // Higher prices typically result in fewer streams
  const getEstimatedStreams = (baseStreams: number) => {
    const priceMultiplier = 1 - ((pricePerStream - 1) * 0.1); // 10% reduction per cent increase
    return Math.floor(baseStreams * Math.max(0.5, priceMultiplier));
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <div className="space-y-6">
        {/* Pricing Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Price Per Stream
            </Label>
            <div className="text-3xl font-bold text-purple-600">
              ${priceInDollars.toFixed(2)}
            </div>
          </div>
          
          <Slider
            value={[pricePerStream]}
            onValueChange={(value) => onChange(value[0])}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>$0.01</span>
            <span>$0.02</span>
            <span>$0.03</span>
            <span>$0.04</span>
            <span>$0.05</span>
          </div>
        </div>

        {/* Revenue Split */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Revenue Split</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">You receive (90%)</span>
              <span className="font-bold text-green-600">${(artistShare / 100).toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Platform fee (10%)</span>
              <span className="font-medium text-muted-foreground">${(platformFee / 100).toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Revenue Projections */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <h3 className="font-semibold text-sm">Estimated Earnings</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Estimates based on typical streaming patterns. Higher prices may result in fewer streams.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {streamVolumes.map((volume) => {
              const estimatedStreams = getEstimatedStreams(volume);
              const earnings = (estimatedStreams * artistShare) / 100;
              
              return (
                <div
                  key={volume}
                  className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-purple-100"
                >
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Users className="h-3 w-3" />
                    <span>{estimatedStreams.toLocaleString()} streams</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    ${earnings.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Strategy Tip */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-blue-900">Pricing Strategy Tip</h4>
              <p className="text-sm text-blue-800">
                {pricePerStream === 1 && "Starting at $0.01 maximizes reach and builds your fanbase quickly."}
                {pricePerStream === 2 && "$0.02 balances accessibility with higher revenue per stream."}
                {pricePerStream === 3 && "$0.03 is ideal for established artists with loyal fans."}
                {pricePerStream === 4 && "$0.04 works best for exclusive releases or premium content."}
                {pricePerStream === 5 && "$0.05 is premium pricing—perfect for special releases or limited content."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
