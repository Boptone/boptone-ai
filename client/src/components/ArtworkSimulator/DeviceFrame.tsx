/**
 * DeviceFrame — renders a realistic device shell mockup around the artwork.
 * Uses pure CSS/Tailwind — no external images required.
 * Supports: car-dash, iphone, android, apple-watch, macbook, speaker, none.
 */

import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle } from "lucide-react";
import type { ArtworkQualityReport } from "./artworkQualityAnalyzer";

interface DeviceFrameProps {
  frameType: "car-dash" | "iphone" | "android" | "apple-watch" | "macbook" | "speaker" | "none";
  imageUrl: string | null;
  displayPx: number;
  zoom: number;
  label: string;
  deviceLabel: string;
  trackTitle: string;
  artistName: string;
  critical?: boolean;
  qualityReport: ArtworkQualityReport | null;
}

export function DeviceFrame({
  frameType,
  imageUrl,
  displayPx,
  zoom,
  label,
  deviceLabel,
  trackTitle,
  artistName,
  critical,
  qualityReport,
}: DeviceFrameProps) {
  const scaledPx = Math.round(displayPx * zoom);

  // Clamp rendered size so it doesn't overflow the viewport
  const maxRender = 320;
  const renderPx = Math.min(scaledPx, maxRender);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Device shell */}
      <div className="relative">
        {frameType === "car-dash" && (
          <CarDashFrame imageUrl={imageUrl} artPx={renderPx} trackTitle={trackTitle} artistName={artistName} />
        )}
        {(frameType === "iphone" || frameType === "android") && (
          <PhoneFrame
            imageUrl={imageUrl}
            artPx={renderPx}
            trackTitle={trackTitle}
            artistName={artistName}
            isAndroid={frameType === "android"}
            fullScreen={displayPx >= 500}
          />
        )}
        {frameType === "apple-watch" && (
          <WatchFrame imageUrl={imageUrl} artPx={renderPx} trackTitle={trackTitle} artistName={artistName} />
        )}
        {frameType === "macbook" && (
          <DesktopFrame imageUrl={imageUrl} artPx={renderPx} trackTitle={trackTitle} artistName={artistName} />
        )}
        {frameType === "speaker" && (
          <SpeakerFrame imageUrl={imageUrl} artPx={renderPx} trackTitle={trackTitle} artistName={artistName} />
        )}
        {frameType === "none" && (
          <PlainFrame imageUrl={imageUrl} px={renderPx} />
        )}

        {/* Critical badge */}
        {critical && (
          <div className="absolute -top-2 -right-2 z-10">
            <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
              Critical
            </span>
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="text-center">
        <div className="flex items-center gap-1 justify-center">
          <span className="text-xs font-semibold text-foreground">{label}</span>
          {qualityReport && (
            <LegibilityIndicator px={displayPx} report={qualityReport} />
          )}
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight">{deviceLabel}</p>
      </div>
    </div>
  );
}

// ─── Car Dashboard Frame ──────────────────────────────────────────────────────

function CarDashFrame({
  imageUrl,
  artPx,
  trackTitle,
  artistName,
}: {
  imageUrl: string | null;
  artPx: number;
  trackTitle: string;
  artistName: string;
}) {
  const minArt = Math.max(artPx, 40);
  // artPx is used as the source; minArt is the rendered size
  const screenW = minArt + 120;
  const screenH = minArt + 24;

  return (
    <div
      className="rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700 shadow-xl p-2"
      style={{ width: screenW + 24, minWidth: 180 }}
    >
      {/* Screen bezel */}
      <div
        className="rounded bg-zinc-950 border border-zinc-800 flex items-center gap-2 px-2 py-1.5 overflow-hidden"
        style={{ height: screenH }}
      >
        {/* Artwork */}
        <ArtworkThumbnail imageUrl={imageUrl} px={minArt} rounded="sm" />

        {/* Track info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          <p
            className="text-white font-semibold leading-tight truncate"
            style={{ fontSize: Math.max(8, Math.min(12, minArt / 5)) }}
          >
            {trackTitle}
          </p>
          <p
            className="text-zinc-400 leading-tight truncate"
            style={{ fontSize: Math.max(7, Math.min(10, minArt / 6)) }}
          >
            {artistName}
          </p>
          {/* Progress bar */}
          <div className="mt-1 h-0.5 bg-zinc-700 rounded-full overflow-hidden">
            <div className="h-full w-2/5 bg-cyan-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Physical buttons row */}
      <div className="flex justify-between mt-1.5 px-1">
        {["⏮", "⏸", "⏭", "🔊"].map((icon, i) => (
          <div key={i} className="w-4 h-1.5 rounded-sm bg-zinc-700" />
        ))}
      </div>
    </div>
  );
}

// ─── Phone Frame ─────────────────────────────────────────────────────────────

function PhoneFrame({
  imageUrl,
  artPx,
  trackTitle,
  artistName,
  isAndroid,
  fullScreen,
}: {
  imageUrl: string | null;
  artPx: number;
  trackTitle: string;
  artistName: string;
  isAndroid: boolean;
  fullScreen: boolean;
}) {
  const phoneW = Math.max(artPx + 32, 140);
  const phoneH = Math.round(phoneW * 2.16);

  return (
    <div
      className={cn(
        "relative bg-zinc-900 border-4 border-zinc-800 shadow-2xl flex flex-col overflow-hidden",
        isAndroid ? "rounded-2xl" : "rounded-[2rem]"
      )}
      style={{ width: phoneW, height: phoneH }}
    >
      {/* Notch / Dynamic Island */}
      {!isAndroid && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-zinc-950 rounded-full z-10" />
      )}
      {isAndroid && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-950 rounded-full z-10" />
      )}

      {/* Status bar */}
      <div className="flex justify-between items-center px-3 pt-6 pb-1">
        <span className="text-[8px] text-zinc-400">9:41</span>
        <div className="flex gap-1">
          <div className="w-3 h-1.5 bg-zinc-400 rounded-sm" />
          <div className="w-1.5 h-1.5 bg-zinc-400 rounded-sm" />
        </div>
      </div>

      {/* Screen content */}
      {fullScreen ? (
        // Full-screen now playing
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-3 bg-zinc-950">
          <ArtworkThumbnail imageUrl={imageUrl} px={artPx} rounded="lg" />
          <div className="text-center mt-1">
            <p className="text-white text-xs font-semibold truncate max-w-full">{trackTitle}</p>
            <p className="text-zinc-400 text-[9px] truncate">{artistName}</p>
          </div>
          {/* Controls */}
          <div className="flex gap-4 mt-1">
            {["⏮", "⏸", "⏭"].map((_, i) => (
              <div key={i} className="w-5 h-1 bg-zinc-700 rounded-full" />
            ))}
          </div>
        </div>
      ) : (
        // Lock screen notification
        <div className="flex-1 flex flex-col bg-gradient-to-b from-zinc-800 to-zinc-900">
          {/* Lock screen wallpaper hint */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-zinc-600 text-2xl font-thin">9:41</div>
          </div>
          {/* Notification banner */}
          <div className="mx-2 mb-3 bg-zinc-800/90 backdrop-blur rounded-xl p-2 flex items-center gap-2 border border-zinc-700/50">
            <ArtworkThumbnail imageUrl={imageUrl} px={Math.min(artPx, 36)} rounded="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-[9px] font-semibold truncate">{trackTitle}</p>
              <p className="text-zinc-400 text-[8px] truncate">{artistName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Home indicator */}
      <div className="flex justify-center pb-1.5 bg-zinc-950">
        <div className={cn("h-0.5 bg-zinc-600 rounded-full", isAndroid ? "w-8" : "w-12")} />
      </div>
    </div>
  );
}

// ─── Apple Watch Frame ────────────────────────────────────────────────────────

function WatchFrame({
  imageUrl,
  artPx,
  trackTitle,
  artistName,
}: {
  imageUrl: string | null;
  artPx: number;
  trackTitle: string;
  artistName: string;
}) {
  const watchSize = Math.max(artPx + 40, 80);

  return (
    <div className="relative flex items-center justify-center">
      {/* Band top */}
      <div
        className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-700 rounded-t-sm"
        style={{ width: watchSize * 0.55, height: 24 }}
      />
      {/* Watch body */}
      <div
        className="relative bg-zinc-900 border-4 border-zinc-700 shadow-xl flex flex-col items-center justify-center overflow-hidden z-10"
        style={{
          width: watchSize,
          height: Math.round(watchSize * 1.2),
          borderRadius: watchSize * 0.28,
        }}
      >
        {/* Crown */}
        <div className="absolute -right-2 top-1/3 w-1.5 h-5 bg-zinc-600 rounded-sm" />

        {/* Screen */}
        <div className="flex flex-col items-center gap-1 p-2 w-full">
          <ArtworkThumbnail imageUrl={imageUrl} px={Math.min(artPx, watchSize - 20)} rounded="sm" />
          <p
            className="text-white font-semibold truncate w-full text-center"
            style={{ fontSize: Math.max(6, Math.min(9, artPx / 5)) }}
          >
            {trackTitle}
          </p>
          <p
            className="text-zinc-400 truncate w-full text-center"
            style={{ fontSize: Math.max(5, Math.min(7, artPx / 6)) }}
          >
            {artistName}
          </p>
        </div>
      </div>
      {/* Band bottom */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-zinc-700 rounded-b-sm"
        style={{ width: watchSize * 0.55, height: 24 }}
      />
    </div>
  );
}

// ─── Desktop Player Frame ─────────────────────────────────────────────────────

function DesktopFrame({
  imageUrl,
  artPx,
  trackTitle,
  artistName,
}: {
  imageUrl: string | null;
  artPx: number;
  trackTitle: string;
  artistName: string;
}) {
  const playerW = artPx + 120;

  return (
    <div
      className="rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden"
      style={{ width: Math.max(playerW, 220) }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 border-b border-zinc-700">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="text-[9px] text-zinc-500 ml-2">Music Player</span>
      </div>

      {/* Player body */}
      <div className="flex items-center gap-3 p-3">
        <ArtworkThumbnail imageUrl={imageUrl} px={artPx} rounded="md" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate">{trackTitle}</p>
          <p className="text-zinc-400 text-[10px] truncate">{artistName}</p>
          {/* Progress */}
          <div className="mt-2 h-0.5 bg-zinc-700 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-cyan-400 rounded-full" />
          </div>
          {/* Controls */}
          <div className="flex gap-2 mt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-4 h-1 bg-zinc-600 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bluetooth Speaker Frame ──────────────────────────────────────────────────

function SpeakerFrame({
  imageUrl,
  artPx,
  trackTitle,
  artistName,
}: {
  imageUrl: string | null;
  artPx: number;
  trackTitle: string;
  artistName: string;
}) {
  const speakerW = artPx + 80;

  return (
    <div
      className="rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700 shadow-xl overflow-hidden"
      style={{ width: Math.max(speakerW, 160) }}
    >
      {/* Speaker grill top */}
      <div className="h-3 bg-zinc-950 flex items-center justify-center gap-0.5 px-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-0.5 h-1.5 bg-zinc-700 rounded-full" />
        ))}
      </div>

      {/* Display */}
      <div className="flex items-center gap-2 px-3 py-2">
        <ArtworkThumbnail imageUrl={imageUrl} px={Math.min(artPx, 80)} rounded="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-[9px] font-semibold truncate">{trackTitle}</p>
          <p className="text-zinc-400 text-[8px] truncate">{artistName}</p>
          {/* Volume dots */}
          <div className="flex gap-0.5 mt-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn("w-1 h-1.5 rounded-sm", i < 5 ? "bg-cyan-400" : "bg-zinc-700")}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Speaker grill bottom */}
      <div className="h-3 bg-zinc-950 flex items-center justify-center gap-0.5 px-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-0.5 h-1.5 bg-zinc-700 rounded-full" />
        ))}
      </div>
    </div>
  );
}

// ─── Plain Frame (no device shell) ───────────────────────────────────────────

function PlainFrame({ imageUrl, px }: { imageUrl: string | null; px: number }) {
  return <ArtworkThumbnail imageUrl={imageUrl} px={px} rounded="sm" />;
}

// ─── Shared Artwork Thumbnail ─────────────────────────────────────────────────

function ArtworkThumbnail({
  imageUrl,
  px,
  rounded,
}: {
  imageUrl: string | null;
  px: number;
  rounded: "sm" | "md" | "lg" | "none";
}) {
  const radiusClass = {
    none: "",
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-xl",
  }[rounded];

  return (
    <div
      className={cn("shrink-0 overflow-hidden bg-zinc-800", radiusClass)}
      style={{ width: px, height: px, minWidth: px }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Cover art preview"
          className="w-full h-full object-cover"
          style={{ imageRendering: px <= 64 ? "pixelated" : "auto" }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-1/3 h-1/3 border border-zinc-600 rounded-sm" />
        </div>
      )}
    </div>
  );
}

// ─── Legibility Indicator ─────────────────────────────────────────────────────

function LegibilityIndicator({
  px,
  report,
}: {
  px: number;
  report: ArtworkQualityReport;
}) {
  // Only show for critical small sizes
  if (px > 128) return null;

  const pass = report.smallSizeLegibility.pass;
  return pass ? (
    <CheckCircle className="w-3 h-3 text-emerald-500" />
  ) : (
    <AlertTriangle className="w-3 h-3 text-amber-500" />
  );
}
