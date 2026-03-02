/**
 * DISTRO-UX1 Wizard — Step 3: Territory Selection
 * Artists choose where their music will be available.
 */

import { Globe, MapPin, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TerritoryMode = "worldwide" | "regions" | "custom";

export interface TerritorySelection {
  mode: TerritoryMode;
  regions?: string[];
  countries?: string[];
  excludedCountries?: string[];
}

interface StepTerritoriesProps {
  territories: TerritorySelection;
  onChange: (territories: TerritorySelection) => void;
}

const REGIONS = [
  { id: "north_america", label: "North America", flag: "🇺🇸", countryCount: 3, key: ["US", "CA", "MX"] },
  { id: "europe", label: "Europe", flag: "🇪🇺", countryCount: 30, key: [] },
  { id: "latin_america", label: "Latin America", flag: "🌎", countryCount: 19, key: [] },
  { id: "asia_pacific", label: "Asia Pacific", flag: "🌏", countryCount: 14, key: [] },
  { id: "middle_east_africa", label: "Middle East & Africa", flag: "🌍", countryCount: 12, key: [] },
];

// Major markets for custom selection
const MAJOR_MARKETS = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
];

export function StepTerritories({ territories, onChange }: StepTerritoriesProps) {
  const setMode = (mode: TerritoryMode) => {
    onChange({ mode, regions: [], countries: [], excludedCountries: [] });
  };

  const toggleRegion = (regionId: string) => {
    const current = territories.regions ?? [];
    if (current.includes(regionId)) {
      onChange({ ...territories, regions: current.filter((r) => r !== regionId) });
    } else {
      onChange({ ...territories, regions: [...current, regionId] });
    }
  };

  const toggleCountry = (code: string) => {
    const current = territories.countries ?? [];
    if (current.includes(code)) {
      onChange({ ...territories, countries: current.filter((c) => c !== code) });
    } else {
      onChange({ ...territories, countries: [...current, code] });
    }
  };

  const modes: { id: TerritoryMode; label: string; description: string; icon: React.ReactNode }[] = [
    {
      id: "worldwide",
      label: "Worldwide",
      description: "Available in every country and territory globally",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      id: "regions",
      label: "By Region",
      description: "Select specific continents or geographic regions",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      id: "custom",
      label: "Custom Countries",
      description: "Hand-pick individual countries from major markets",
      icon: <Check className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Territory Selection</h2>
        <p className="text-muted-foreground mt-1">
          Choose where your music will be available. Most artists select Worldwide.
        </p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              "flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              territories.mode === m.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40 hover:bg-accent/30"
            )}
          >
            <div className={cn("p-2 rounded-lg", territories.mode === m.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {m.icon}
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{m.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Worldwide confirmation */}
      {territories.mode === "worldwide" && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
          <Globe className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Worldwide Distribution Selected</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your music will be available in all countries and territories supported by each platform.
            </p>
          </div>
          <Badge className="ml-auto rounded-full" variant="secondary">Recommended</Badge>
        </div>
      )}

      {/* Region selector */}
      {territories.mode === "regions" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Select Regions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {REGIONS.map((region) => {
              const isSelected = (territories.regions ?? []).includes(region.id);
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => toggleRegion(region.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                    isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <span className="text-2xl">{region.flag}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{region.label}</p>
                    <p className="text-xs text-muted-foreground">{region.countryCount}+ countries</p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>
          {(territories.regions ?? []).length === 0 && (
            <p className="text-xs text-amber-500">Select at least one region to continue.</p>
          )}
        </div>
      )}

      {/* Custom country selector */}
      {territories.mode === "custom" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Select Countries</p>
            <span className="text-xs text-muted-foreground">
              {(territories.countries ?? []).length} selected
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MAJOR_MARKETS.map((country) => {
              const isSelected = (territories.countries ?? []).includes(country.code);
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => toggleCountry(country.code)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all text-sm",
                    isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="font-medium text-xs text-foreground flex-1 truncate">{country.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
                </button>
              );
            })}
          </div>
          {(territories.countries ?? []).length === 0 && (
            <p className="text-xs text-amber-500">Select at least one country to continue.</p>
          )}
        </div>
      )}
    </div>
  );
}
