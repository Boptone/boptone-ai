import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { useLocation } from "wouter";

export function DemoBanner() {
  const { isDemoMode, setDemoMode } = useDemo();
  const [, setLocation] = useLocation();

  if (!isDemoMode) return null;

  return (
    <div className="bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <Info className="h-4 w-4" />
        <span>
          You're viewing Boptone in demo mode with sample data.
        </span>
        <Button
          size="sm"
          variant="secondary"
          className="ml-2"
          onClick={() => {
            setDemoMode(false);
            setLocation("/signup");
          }}
        >
          Sign Up to Save Your Work
        </Button>
      </div>
    </div>
  );
}
