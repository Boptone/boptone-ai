/**
 * DISTRO-UX1 Wizard — Step 5: Release Scheduling
 * Artists choose their release date, pre-save toggle, and Boptone exclusive window.
 */

import { useState } from "react";
import { Calendar, Clock, Zap, Info, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface StepScheduleProps {
  releaseDate: string | null;
  preSaveEnabled: boolean;
  exclusiveWindowDays: number;
  selectedDsps: string[];
  onChange: (data: {
    releaseDate: string | null;
    preSaveEnabled: boolean;
    exclusiveWindowDays: number;
  }) => void;
}

const EXCLUSIVE_WINDOW_OPTIONS = [
  { days: 0, label: "No exclusive window", description: "Release everywhere simultaneously" },
  { days: 7, label: "7 days", description: "Bop Music exclusive for 1 week" },
  { days: 14, label: "14 days", description: "Bop Music exclusive for 2 weeks" },
  { days: 30, label: "30 days", description: "Bop Music exclusive for 1 month" },
];

function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getMinDate(selectedDsps: string[]): Date {
  const hasSlowDsp = selectedDsps.some((d) =>
    ["spotify", "apple_music", "tidal", "amazon_music", "deezer", "pandora"].includes(d)
  );
  const minDays = hasSlowDsp ? 7 : 2;
  const min = new Date();
  min.setDate(min.getDate() + minDays);
  return min;
}

export function StepSchedule({
  releaseDate,
  preSaveEnabled,
  exclusiveWindowDays,
  selectedDsps,
  onChange,
}: StepScheduleProps) {
  const [mode, setMode] = useState<"immediate" | "scheduled">(
    releaseDate ? "scheduled" : "immediate"
  );

  const minDate = getMinDate(selectedDsps);
  const minDateStr = formatDateForInput(minDate);

  const hasSlowDsp = selectedDsps.some((d) =>
    ["spotify", "apple_music", "tidal", "amazon_music", "deezer", "pandora"].includes(d)
  );

  const handleModeChange = (newMode: "immediate" | "scheduled") => {
    setMode(newMode);
    if (newMode === "immediate") {
      onChange({ releaseDate: null, preSaveEnabled: false, exclusiveWindowDays });
    } else {
      // Default to 14 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      onChange({ releaseDate: formatDateForInput(defaultDate), preSaveEnabled, exclusiveWindowDays });
    }
  };

  const handleDateChange = (dateStr: string) => {
    onChange({ releaseDate: dateStr, preSaveEnabled, exclusiveWindowDays });
  };

  const handlePreSaveChange = (enabled: boolean) => {
    onChange({ releaseDate, preSaveEnabled: enabled, exclusiveWindowDays });
  };

  const handleExclusiveWindowChange = (days: number) => {
    onChange({ releaseDate, preSaveEnabled, exclusiveWindowDays: days });
  };

  // Check if selected date respects lead times
  const selectedDate = releaseDate ? new Date(releaseDate) : null;
  const dateWarning = selectedDate && hasSlowDsp && selectedDate < minDate
    ? "Some platforms require at least 7 days lead time. Your release date may be adjusted."
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Release Schedule</h2>
        <p className="text-muted-foreground mt-1">
          Choose when your music goes live. Schedule in advance to build anticipation.
        </p>
      </div>

      {/* Release mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleModeChange("immediate")}
          className={cn(
            "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
            mode === "immediate" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
          )}
        >
          <div className={cn("p-2 rounded-lg", mode === "immediate" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Release Now</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submit for immediate processing. Goes live as soon as each platform approves.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange("scheduled")}
          className={cn(
            "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
            mode === "scheduled" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
          )}
        >
          <div className={cn("p-2 rounded-lg", mode === "scheduled" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Schedule a Date</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pick a future release date. Recommended for building pre-save campaigns.
            </p>
            <Badge variant="secondary" className="rounded-full text-xs mt-1">Recommended</Badge>
          </div>
        </button>
      </div>

      {/* Date picker */}
      {mode === "scheduled" && (
        <div className="space-y-3">
          <Label htmlFor="release-date" className="text-sm font-medium">
            Release Date
          </Label>
          <input
            id="release-date"
            type="date"
            min={minDateStr}
            value={releaseDate ?? ""}
            onChange={(e) => handleDateChange(e.target.value)}
            className={cn(
              "w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground",
              "focus:outline-none focus:border-primary transition-colors",
              dateWarning && "border-amber-500"
            )}
          />
          {dateWarning && (
            <p className="text-xs text-amber-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              {dateWarning}
            </p>
          )}
          {hasSlowDsp && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Spotify, Apple Music, and other platforms require at least 7 days lead time.
            </p>
          )}
        </div>
      )}

      {/* Pre-save toggle */}
      {mode === "scheduled" && releaseDate && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Enable Pre-Save</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Let fans save your release before it drops. Boosts first-day streams.
                </p>
              </div>
            </div>
            <Switch
              checked={preSaveEnabled}
              onCheckedChange={handlePreSaveChange}
            />
          </div>
        </div>
      )}

      {/* Boptone exclusive window */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Bop Music Exclusive Window</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Release on Bop Music first, then distribute to other platforms after the window ends.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EXCLUSIVE_WINDOW_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              type="button"
              onClick={() => handleExclusiveWindowChange(opt.days)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all text-xs",
                exclusiveWindowDays === opt.days
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <span className="font-bold text-sm text-foreground">
                {opt.days === 0 ? "None" : `${opt.days}d`}
              </span>
              <span className="text-muted-foreground leading-tight">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
