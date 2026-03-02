/**
 * ArtworkSimulator — shows artists how their cover art renders across every
 * real-world display context: car head units, phone lock screens, full-screen
 * mobile players, smartwatches, desktop players, and Bluetooth speaker displays.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, AlertTriangle, CheckCircle, Info, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { analyzeArtworkQuality, type ArtworkQualityReport } from "./artworkQualityAnalyzer";
import { DeviceFrame } from "./DeviceFrame";

// ─── Display Context Definitions ─────────────────────────────────────────────

export type DisplayContext = {
  id: string;
  label: string;
  description: string;
  sizes: Array<{
    label: string;
    px: number;
    deviceLabel: string;
    critical?: boolean;
  }>;
  category: "car" | "mobile" | "wearable" | "desktop" | "speaker";
  frameType: "car-dash" | "iphone" | "android" | "apple-watch" | "macbook" | "speaker" | "none";
};

export const DISPLAY_CONTEXTS: DisplayContext[] = [
  {
    id: "car",
    label: "Car Display",
    description: "Head unit screens — the hardest test for artwork clarity",
    category: "car",
    frameType: "car-dash",
    sizes: [
      { label: "64px", px: 64, deviceLabel: "Standard head unit", critical: true },
      { label: "128px", px: 128, deviceLabel: "HD head unit (Pioneer, Alpine)" },
      { label: "240px", px: 240, deviceLabel: "Large touchscreen (Tesla-style)" },
    ],
  },
  {
    id: "lock_screen",
    label: "Lock Screen",
    description: "Notification art on iOS and Android lock screens",
    category: "mobile",
    frameType: "iphone",
    sizes: [
      { label: "300px", px: 300, deviceLabel: "iOS / Android notification", critical: true },
      { label: "60px", px: 60, deviceLabel: "Compact notification badge" },
    ],
  },
  {
    id: "now_playing",
    label: "Now Playing",
    description: "Full-screen artwork on mobile players",
    category: "mobile",
    frameType: "iphone",
    sizes: [
      { label: "1000px", px: 1000, deviceLabel: "Full-screen mobile player" },
      { label: "500px", px: 500, deviceLabel: "Half-screen / landscape" },
    ],
  },
  {
    id: "wearable",
    label: "Smartwatch",
    description: "Apple Watch and Wear OS now-playing screens",
    category: "wearable",
    frameType: "apple-watch",
    sizes: [
      { label: "40px", px: 40, deviceLabel: "Apple Watch 40mm", critical: true },
      { label: "44px", px: 44, deviceLabel: "Apple Watch 44mm / Wear OS" },
    ],
  },
  {
    id: "desktop",
    label: "Desktop Player",
    description: "macOS, Windows, and web player artwork",
    category: "desktop",
    frameType: "macbook",
    sizes: [
      { label: "500px", px: 500, deviceLabel: "Desktop media player" },
      { label: "250px", px: 250, deviceLabel: "Mini player / sidebar" },
    ],
  },
  {
    id: "bluetooth",
    label: "Bluetooth Display",
    description: "JBL, Sonos, Bose, and smart speaker screens",
    category: "speaker",
    frameType: "speaker",
    sizes: [
      { label: "128px", px: 128, deviceLabel: "Smart speaker display", critical: true },
      { label: "64px", px: 64, deviceLabel: "Compact speaker screen" },
    ],
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArtworkSimulatorProps {
  /** Pre-loaded image URL (e.g. from upload or track data) */
  imageUrl?: string;
  /** Track title for context labels */
  trackTitle?: string;
  /** Artist name for context labels */
  artistName?: string;
  /** Compact mode for embedding inside other components */
  compact?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ArtworkSimulator({
  imageUrl: initialImageUrl,
  trackTitle = "Track Title",
  artistName = "Artist Name",
  compact = false,
  className,
}: ArtworkSimulatorProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl ?? null);
  const [activeContext, setActiveContext] = useState<string>("car");
  const [qualityReport, setQualityReport] = useState<ArtworkQualityReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Analyze artwork quality whenever image changes
  useEffect(() => {
    if (!imageUrl) {
      setQualityReport(null);
      return;
    }
    setIsAnalyzing(true);
    analyzeArtworkQuality(imageUrl)
      .then(setQualityReport)
      .catch(console.error)
      .finally(() => setIsAnalyzing(false));
  }, [imageUrl]);

  // Update if parent passes a new URL
  useEffect(() => {
    if (initialImageUrl) setImageUrl(initialImageUrl);
  }, [initialImageUrl]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const context = DISPLAY_CONTEXTS.find((c) => c.id === activeContext)!;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Artwork Display Simulator</h3>
            <p className="text-sm text-muted-foreground">
              See exactly how your cover art looks on every device before publishing
            </p>
          </div>
          {qualityReport && (
            <QualityBadge score={qualityReport.overallScore} />
          )}
        </div>
      )}

      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3")}>
        {/* Left: Upload + Quality Panel */}
        <div className="flex flex-col gap-3">
          {/* Upload zone */}
          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden",
              "flex items-center justify-center",
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30",
              imageUrl ? "aspect-square" : "aspect-square min-h-[160px]"
            )}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Cover art"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Drop artwork here</p>
                <p className="text-xs text-muted-foreground">or click to upload</p>
                <p className="text-xs text-muted-foreground/70">JPG, PNG, WebP — min 3000×3000px</p>
              </div>
            )}
            {imageUrl && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded">
                  Change artwork
                </span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />

          {/* Quality Analysis Panel */}
          {imageUrl && (
            <QualityPanel report={qualityReport} isAnalyzing={isAnalyzing} />
          )}
        </div>

        {/* Right: Device Previews */}
        <div className={cn("flex flex-col gap-3", compact ? "" : "lg:col-span-2")}>
          {/* Context tabs */}
          <Tabs value={activeContext} onValueChange={setActiveContext}>
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              {DISPLAY_CONTEXTS.map((ctx) => (
                <TabsTrigger
                  key={ctx.id}
                  value={ctx.id}
                  className="text-xs flex-1 min-w-[80px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <span className="mr-1">{categoryIcon(ctx.category)}</span>
                  {ctx.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {DISPLAY_CONTEXTS.map((ctx) => (
              <TabsContent key={ctx.id} value={ctx.id} className="mt-3">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{ctx.label}</p>
                      <p className="text-xs text-muted-foreground">{ctx.description}</p>
                    </div>
                    {/* Zoom controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-xs text-muted-foreground w-10 text-center">
                        {Math.round(zoom * 100)}%
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setZoom(1)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Size previews grid */}
                  <div className="flex flex-wrap gap-6 items-end justify-start overflow-auto">
                    {ctx.sizes.map((size) => (
                      <DeviceFrame
                        key={size.px}
                        frameType={ctx.frameType}
                        imageUrl={imageUrl}
                        displayPx={size.px}
                        zoom={zoom}
                        label={size.label}
                        deviceLabel={size.deviceLabel}
                        trackTitle={trackTitle}
                        artistName={artistName}
                        critical={size.critical}
                        qualityReport={qualityReport}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ─── Quality Badge ────────────────────────────────────────────────────────────

function QualityBadge({ score }: { score: number }) {
  const tier =
    score >= 90 ? { label: "Excellent", variant: "default" as const, color: "text-emerald-600" } :
    score >= 75 ? { label: "Good", variant: "secondary" as const, color: "text-blue-600" } :
    score >= 55 ? { label: "Fair", variant: "outline" as const, color: "text-amber-600" } :
    { label: "Needs Work", variant: "destructive" as const, color: "text-red-600" };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Artwork Quality</span>
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              score >= 90 ? "bg-emerald-500" :
              score >= 75 ? "bg-blue-500" :
              score >= 55 ? "bg-amber-500" : "bg-red-500"
            )}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={cn("text-xs font-semibold", tier.color)}>{score}/100</span>
        <Badge variant={tier.variant} className="text-xs px-1.5 py-0">{tier.label}</Badge>
      </div>
    </div>
  );
}

// ─── Quality Panel ────────────────────────────────────────────────────────────

function QualityPanel({
  report,
  isAnalyzing,
}: {
  report: ArtworkQualityReport | null;
  isAnalyzing: boolean;
}) {
  if (isAnalyzing) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Analyzing artwork...
        </div>
      </div>
    );
  }

  if (!report) return null;

  const checks = [
    {
      label: "Resolution",
      pass: report.resolution.pass,
      detail: report.resolution.detail,
    },
    {
      label: "Aspect Ratio",
      pass: report.aspectRatio.pass,
      detail: report.aspectRatio.detail,
    },
    {
      label: "Color Depth",
      pass: report.colorDepth.pass,
      detail: report.colorDepth.detail,
    },
    {
      label: "Small Size Legibility",
      pass: report.smallSizeLegibility.pass,
      detail: report.smallSizeLegibility.detail,
    },
    {
      label: "Compression Artifacts",
      pass: report.compressionArtifacts.pass,
      detail: report.compressionArtifacts.detail,
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Quality Analysis</span>
        <QualityBadge score={report.overallScore} />
      </div>
      <div className="flex flex-col gap-1.5">
        {checks.map((check) => (
          <div key={check.label} className="flex items-start gap-2">
            {check.pass ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-foreground">{check.label}</span>
              <p className="text-xs text-muted-foreground leading-tight">{check.detail}</p>
            </div>
          </div>
        ))}
      </div>
      {report.warnings.length > 0 && (
        <div className="pt-1 border-t border-border">
          {report.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-1.5 mt-1">
              <Info className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">{w}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function categoryIcon(category: DisplayContext["category"]): string {
  switch (category) {
    case "car": return "🚗";
    case "mobile": return "📱";
    case "wearable": return "⌚";
    case "desktop": return "💻";
    case "speaker": return "🔊";
  }
}
