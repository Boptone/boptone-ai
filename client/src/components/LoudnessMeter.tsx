/**
 * LoudnessMeter — DISTRO-A2
 * Per-DSP loudness meter showing LUFS/dBTP/LRA measurements against
 * platform-specific targets. Renders inline after upload or on track detail.
 */

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertTriangle, Volume2, Info } from "lucide-react";

// DSP loudness targets (LUFS integrated, dBTP true peak)
const DSP_TARGETS = [
  {
    id: "spotify",
    name: "Spotify",
    color: "#1DB954",
    targetLufs: -14,
    toleranceLufs: 1.0,
    maxTruePeak: -1.0,
    note: "Normalizes to −14 LUFS; louder tracks turned down",
  },
  {
    id: "apple",
    name: "Apple Music",
    color: "#FC3C44",
    targetLufs: -16,
    toleranceLufs: 1.0,
    maxTruePeak: -1.0,
    note: "Sound Check targets −16 LUFS",
  },
  {
    id: "youtube",
    name: "YouTube",
    color: "#FF0000",
    targetLufs: -14,
    toleranceLufs: 2.0,
    maxTruePeak: -1.0,
    note: "Normalizes to −14 LUFS; wider tolerance",
  },
  {
    id: "amazon",
    name: "Amazon Music",
    color: "#00A8E0",
    targetLufs: -14,
    toleranceLufs: 1.5,
    maxTruePeak: -2.0,
    note: "HD/Ultra HD: −14 LUFS target",
  },
  {
    id: "tidal",
    name: "Tidal",
    color: "#00FFFF",
    targetLufs: -14,
    toleranceLufs: 1.0,
    maxTruePeak: -1.0,
    note: "HiFi/Master: −14 LUFS",
  },
  {
    id: "deezer",
    name: "Deezer",
    color: "#A238FF",
    targetLufs: -15,
    toleranceLufs: 1.5,
    maxTruePeak: -1.0,
    note: "Normalizes to −15 LUFS",
  },
] as const;

export interface LoudnessData {
  integratedLufs: number | null;
  truePeakDbtp: number | null;
  loudnessRange: number | null;
  isClipping: boolean;
  spotifyReady: boolean;
  appleReady: boolean;
  youtubeReady: boolean;
  amazonReady: boolean;
  tidalReady: boolean;
  deezerReady: boolean;
  recommendation: string | null;
}

interface LoudnessMeterProps {
  loudness: LoudnessData;
  className?: string;
  compact?: boolean;
}

// Map DSP id to ready flag
const getDspReady = (id: string, loudness: LoudnessData): boolean => {
  switch (id) {
    case "spotify": return loudness.spotifyReady;
    case "apple": return loudness.appleReady;
    case "youtube": return loudness.youtubeReady;
    case "amazon": return loudness.amazonReady;
    case "tidal": return loudness.tidalReady;
    case "deezer": return loudness.deezerReady;
    default: return false;
  }
};

// LUFS gauge: maps −24 to −6 LUFS range to 0–100%
const lufsToPercent = (lufs: number): number => {
  const min = -24;
  const max = -6;
  return Math.max(0, Math.min(100, ((lufs - min) / (max - min)) * 100));
};

// Color based on how close to target
const getBarColor = (lufs: number, target: number, tolerance: number): string => {
  const diff = Math.abs(lufs - target);
  if (diff <= tolerance) return "bg-emerald-500";
  if (diff <= tolerance * 2) return "bg-amber-500";
  return "bg-red-500";
};

export function LoudnessMeter({ loudness, className, compact = false }: LoudnessMeterProps) {
  const { integratedLufs, truePeakDbtp, loudnessRange, isClipping, recommendation } = loudness;

  const hasData = integratedLufs !== null;
  const readyCount = DSP_TARGETS.filter(dsp => getDspReady(dsp.id, loudness)).length;
  const allReady = readyCount === DSP_TARGETS.length;

  if (!hasData) {
    return (
      <div className={cn("rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 text-center", className)}>
        <Volume2 className="mx-auto mb-2 h-8 w-8 text-zinc-500" />
        <p className="text-sm text-zinc-400">Loudness data not available for this track.</p>
        <p className="mt-1 text-xs text-zinc-500">Re-upload the track to generate loudness analysis.</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">Loudness Analysis</span>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
          allReady
            ? "bg-emerald-500/20 text-emerald-400"
            : readyCount > 0
            ? "bg-amber-500/20 text-amber-400"
            : "bg-red-500/20 text-red-400"
        )}>
          {allReady ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
          {readyCount}/{DSP_TARGETS.length} platforms ready
        </div>
      </div>

      {/* Core metrics row */}
      <div className="grid grid-cols-3 divide-x divide-zinc-700 border-b border-zinc-700">
        <div className="px-4 py-3 text-center">
          <div className="text-xs text-zinc-400 mb-1">Integrated LUFS</div>
          <div className={cn(
            "text-2xl font-bold font-mono",
            integratedLufs >= -16 && integratedLufs <= -12
              ? "text-emerald-400"
              : integratedLufs < -18 || integratedLufs > -10
              ? "text-red-400"
              : "text-amber-400"
          )}>
            {integratedLufs.toFixed(1)}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">LUFS-I</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-xs text-zinc-400 mb-1">True Peak</div>
          <div className={cn(
            "text-2xl font-bold font-mono",
            truePeakDbtp !== null && truePeakDbtp <= -1.0
              ? "text-emerald-400"
              : "text-red-400"
          )}>
            {truePeakDbtp !== null ? truePeakDbtp.toFixed(1) : "N/A"}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">dBTP</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-xs text-zinc-400 mb-1">Loudness Range</div>
          <div className="text-2xl font-bold font-mono text-zinc-200">
            {loudnessRange !== null ? loudnessRange.toFixed(1) : "N/A"}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">LU</div>
        </div>
      </div>

      {/* Clipping warning */}
      {isClipping && (
        <div className="flex items-center gap-2 border-b border-zinc-700 bg-red-500/10 px-4 py-2">
          <XCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
          <p className="text-xs text-red-300">
            <strong>Clipping detected.</strong> True peak exceeds 0 dBFS — this track will be rejected by most DSPs. Re-master before distributing.
          </p>
        </div>
      )}

      {/* Per-DSP meter bars */}
      <div className={cn("px-4 py-3", compact ? "space-y-2" : "space-y-3")}>
        <div className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Per-Platform Readiness</div>
        {DSP_TARGETS.map((dsp) => {
          const ready = getDspReady(dsp.id, loudness);
          const diff = integratedLufs - dsp.targetLufs;
          const barPercent = lufsToPercent(integratedLufs);
          const targetPercent = lufsToPercent(dsp.targetLufs);
          const barColor = getBarColor(integratedLufs, dsp.targetLufs, dsp.toleranceLufs);

          return (
            <div key={dsp.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: dsp.color }}
                  />
                  <span className="text-xs font-medium text-zinc-200">{dsp.name}</span>
                  {!compact && (
                    <span className="text-xs text-zinc-500 hidden group-hover:inline">
                      — {dsp.note}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">
                    {diff > 0 ? "+" : ""}{diff.toFixed(1)} LU
                  </span>
                  {ready ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                  )}
                </div>
              </div>
              {/* Gauge bar */}
              <div className="relative h-1.5 rounded-full bg-zinc-700/60 overflow-visible">
                {/* Filled bar */}
                <div
                  className={cn("absolute left-0 top-0 h-full rounded-full transition-all", barColor)}
                  style={{ width: `${barPercent}%` }}
                />
                {/* Target marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full bg-white/40"
                  style={{ left: `${targetPercent}%` }}
                  title={`Target: ${dsp.targetLufs} LUFS`}
                />
                {/* Tolerance band */}
                <div
                  className="absolute top-0 h-full bg-white/5 rounded-sm"
                  style={{
                    left: `${lufsToPercent(dsp.targetLufs - dsp.toleranceLufs)}%`,
                    width: `${lufsToPercent(dsp.targetLufs + dsp.toleranceLufs) - lufsToPercent(dsp.targetLufs - dsp.toleranceLufs)}%`,
                  }}
                />
              </div>
              {!compact && (
                <div className="flex justify-between mt-0.5">
                  <span className="text-[10px] text-zinc-600">−24 LUFS</span>
                  <span className="text-[10px] text-zinc-500">Target: {dsp.targetLufs} LUFS</span>
                  <span className="text-[10px] text-zinc-600">−6 LUFS</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="flex items-start gap-2 border-t border-zinc-700 bg-cyan-500/5 px-4 py-3">
          <Info className="h-4 w-4 flex-shrink-0 text-cyan-400 mt-0.5" />
          <p className="text-xs text-zinc-300 leading-relaxed">{recommendation}</p>
        </div>
      )}
    </div>
  );
}

export default LoudnessMeter;
