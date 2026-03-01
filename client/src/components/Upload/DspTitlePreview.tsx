/**
 * DspTitlePreview — Live DSP title formatting preview card
 *
 * Shows artists exactly how their title will appear on Apple Music,
 * Spotify, Amazon Music, TIDAL, and Deezer as they type, with
 * per-platform issue flags and auto-corrections highlighted.
 */

import {
  formatForAllDsps,
  type DspTitleInput,
  type DspKey,
} from "@/lib/dspTitleFormatter";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

// ─── DSP Brand Config ─────────────────────────────────────────────────────────

const DSP_CONFIG: Record<DspKey, {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  logo: React.ReactNode;
}> = {
  apple: {
    name: "Apple Music",
    color: "text-pink-400",
    bgColor: "bg-pink-950/30",
    borderColor: "border-pink-500/30",
    logo: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
  spotify: {
    name: "Spotify",
    color: "text-green-400",
    bgColor: "bg-green-950/30",
    borderColor: "border-green-500/30",
    logo: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    ),
  },
  amazon: {
    name: "Amazon Music",
    color: "text-orange-400",
    bgColor: "bg-orange-950/30",
    borderColor: "border-orange-500/30",
    logo: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.074-1.052-.872-1.238-1.276-1.814-2.106-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.095v-.41c0-.753.06-1.642-.383-2.294-.385-.579-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.549.582l-3.061-.333c-.259-.056-.548-.266-.472-.66C5.57 2.056 8.359 1 10.891 1c1.293 0 2.983.344 4.003 1.323 1.293 1.21 1.169 2.826 1.169 4.584v4.155c0 1.248.52 1.797 1.009 2.47.173.243.211.533-.01.712l-2.908 2.551-.01-.01zM21.4 19.2c-2.5 1.85-6.13 2.84-9.25 2.84-4.37 0-8.31-1.61-11.29-4.29-.23-.21-.02-.5.26-.34 3.22 1.87 7.19 3 11.31 3 2.77 0 5.82-.57 8.63-1.76.42-.18.77.28.34.55z"/>
      </svg>
    ),
  },
  tidal: {
    name: "TIDAL",
    color: "text-cyan-400",
    bgColor: "bg-cyan-950/30",
    borderColor: "border-cyan-500/30",
    logo: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004 4.004-4.004 4.004 4.004 4.004-4.004zM8.008 16.004l4.004-4.004 4.004 4.004 4.004-4.004-4.004-4.004-4.004 4.004-4.004-4.004-4.004 4.004z"/>
      </svg>
    ),
  },
  deezer: {
    name: "Deezer",
    color: "text-purple-400",
    bgColor: "bg-purple-950/30",
    borderColor: "border-purple-500/30",
    logo: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.944 17.773H24v2.25h-5.056zm0-4.33H24v2.25h-5.056zm0-4.33H24v2.25h-5.056zm0-4.33H24v2.25h-5.056zM12.472 17.773h5.056v2.25h-5.056zm0-4.33h5.056v2.25h-5.056zm0-4.33h5.056v2.25h-5.056zM5.999 17.773h5.056v2.25H5.999zm0-4.33h5.056v2.25H5.999zM0 17.773h5.056v2.25H0z"/>
      </svg>
    ),
  },
};

// ─── Single DSP Row ───────────────────────────────────────────────────────────

import React from "react";
import type { DspTitleCompatResult } from "@/lib/dspTitleFormatter";

function DspRow({ dsp, result, originalTitle }: {
  dsp: DspKey;
  result: DspTitleCompatResult;
  originalTitle: string;
}) {
  const config = DSP_CONFIG[dsp];
  const hasChanged = result.formattedTitle !== originalTitle;

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-3`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${config.color}`}>
          {config.logo}
          {config.name}
        </div>
        <div className="flex items-center gap-1">
          {result.errors.length > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
              {result.errors.length} error{result.errors.length !== 1 ? "s" : ""}
            </Badge>
          )}
          {result.warnings.length > 0 && (
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/20 text-amber-300 border-amber-500/30">
              {result.warnings.length} warning{result.warnings.length !== 1 ? "s" : ""}
            </Badge>
          )}
          {result.errors.length === 0 && result.warnings.length === 0 && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </div>
      </div>

      {/* Formatted title */}
      <div className="font-medium text-sm text-foreground mb-1">
        {result.formattedTitle || <span className="text-muted-foreground italic">Enter a title above</span>}
      </div>

      {/* Show diff if title was auto-corrected */}
      {hasChanged && originalTitle && (
        <div className="text-[10px] text-muted-foreground mb-2">
          Auto-corrected from: <span className="line-through opacity-60">{originalTitle}</span>
        </div>
      )}

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="space-y-1 mt-2 border-t border-border/20 pt-2">
          {result.errors.map((msg, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <AlertCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
              <span className="text-[10px] leading-relaxed text-red-300">{msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="space-y-1 mt-2 border-t border-border/20 pt-2">
          {result.warnings.map((msg, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-[10px] leading-relaxed text-amber-300">{msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DspTitlePreviewProps {
  input: DspTitleInput;
  className?: string;
}

export function DspTitlePreview({ input, className = "" }: DspTitlePreviewProps) {
  if (!input.title.trim() && !input.featuredArtists?.length) {
    return null;
  }

  const results = formatForAllDsps(input);
  const dsps: DspKey[] = ["apple", "spotify", "amazon", "tidal", "deezer"];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          DSP Title Preview
        </p>
        {results.hasErrors ? (
          <Badge variant="destructive" className="text-[10px]">Formatting Issues</Badge>
        ) : results.hasWarnings ? (
          <Badge className="text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/30">Warnings</Badge>
        ) : (
          <Badge className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            All Platforms Ready
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {dsps.map((dsp) => (
          <DspRow key={dsp} dsp={dsp} result={results[dsp]} originalTitle={input.title} />
        ))}
      </div>
    </div>
  );
}
