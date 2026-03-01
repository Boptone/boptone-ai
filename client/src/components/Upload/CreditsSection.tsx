/**
 * CreditsSection — Professional credits form for track uploads
 *
 * Captures the full industry-standard credits stack:
 *   - © Composition copyright (year + owner)
 *   - ℗ Master copyright (year + owner)
 *   - Label / "Independent"
 *   - Featured artists
 *   - Producers
 *   - Engineers (recording / mixing / mastering / assistant)
 *   - Songwriters / composers
 *   - Classical metadata (conductor, ensemble, soloists)
 *   - Art director, photographer, liner notes
 *
 * Optional for Boptone streaming.
 * © and ℗ are required for DSP distribution.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Music,
  Mic2,
  Settings2,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreditsData {
  compositionCopyright?: { year: number; owner: string };
  masterCopyright?: { year: number; owner: string };
  label?: string;
  featuredArtists?: Array<{ name: string; role?: string }>;
  producers?: Array<{ name: string; role?: string }>;
  engineers?: Array<{ name: string; role: "recording" | "mixing" | "mastering" | "assistant" | "other" }>;
  additionalProducers?: Array<{ name: string; role?: string }>;
  writers?: Array<{ name: string; ipi?: string; pro?: string }>;
  composers?: Array<{ name: string; ipi?: string }>;
  classical?: {
    conductor?: string;
    ensemble?: string;
    soloists?: Array<{ name: string; instrument: string }>;
    workTitle?: string;
    movementNumber?: number;
    movementTitle?: string;
    catalogNumber?: string;
  };
  artDirector?: string;
  photographer?: string;
  notes?: string;
}

export interface CreditsSectionProps {
  value: CreditsData;
  onChange: (credits: CreditsData) => void;
  /** If true, shows © and ℗ as required fields */
  distributionMode?: boolean;
  /** Compact mode for Bops video upload (hides classical section) */
  compact?: boolean;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => currentYear - i);

const ENGINEER_ROLES = [
  { value: "recording", label: "Recording Engineer" },
  { value: "mixing", label: "Mixing Engineer" },
  { value: "mastering", label: "Mastering Engineer" },
  { value: "assistant", label: "Assistant Engineer" },
  { value: "other", label: "Other" },
] as const;

const FEATURED_ROLES = [
  { value: "featured", label: "Featured" },
  { value: "remixer", label: "Remixer" },
  { value: "vs", label: "vs." },
  { value: "with", label: "with" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  subtitle,
  required,
  isComplete,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  required?: boolean;
  isComplete?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 mb-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {required && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
              Required for DSP
            </Badge>
          )}
          {isComplete && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="text-xs h-7 gap-1 border-dashed"
    >
      <Plus className="w-3 h-3" />
      {label}
    </Button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CreditsSection({
  value,
  onChange,
  distributionMode = false,
  className = "",
}: CreditsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [showClassical, setShowClassical] = useState(false);

  const update = (patch: Partial<CreditsData>) => onChange({ ...value, ...patch });

  // Completion checks
  const hasCopyrights =
    value.compositionCopyright?.owner && value.masterCopyright?.owner;
  const hasLabel = !!value.label;
  const hasProducers = (value.producers?.length ?? 0) > 0;
  const hasEngineers = (value.engineers?.length ?? 0) > 0;
  const completedSections = [hasCopyrights, hasLabel, hasProducers, hasEngineers].filter(Boolean).length;

  return (
    <div className={`rounded-xl border border-border/50 overflow-hidden ${className}`}>
      {/* ── Collapsed Header ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Professional Credits</span>
              {distributionMode && !hasCopyrights && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                  © ℗ Required
                </Badge>
              )}
              {hasCopyrights && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  {completedSections}/4 sections
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {distributionMode
                ? "© and ℗ required for DSP distribution. All other fields optional."
                : "Optional — adds full attribution to your Boptone page and DSP submissions."}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* ── Expanded Form ─────────────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-border/30 p-4 space-y-6">

          {/* ── Rights Holders ──────────────────────────────────────────── */}
          <div>
            <SectionHeader
              icon={<AlertCircle className="w-4 h-4" />}
              title="Rights Holders"
              subtitle="Copyright holders for the composition and master recording."
              required={distributionMode}
              isComplete={!!hasCopyrights}
            />
            <div className="grid grid-cols-1 gap-4">
              {/* Composition © */}
              <div className="rounded-lg border border-border/40 p-3 space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <span className="text-lg leading-none">©</span>
                  Composition Copyright
                  {distributionMode && <span className="text-destructive">*</span>}
                </Label>
                <p className="text-[10px] text-muted-foreground -mt-1">
                  The songwriter / publisher who owns the composition (lyrics + melody).
                </p>
                <div className="flex gap-2">
                  <Select
                    value={value.compositionCopyright?.year?.toString() ?? ""}
                    onValueChange={(v) =>
                      update({
                        compositionCopyright: {
                          year: parseInt(v),
                          owner: value.compositionCopyright?.owner ?? "",
                        },
                      })
                    }
                  >
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_OPTIONS.map((y) => (
                        <SelectItem key={y} value={y.toString()} className="text-xs">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="h-8 text-xs flex-1"
                    placeholder='e.g., "John Smith" or "Independent"'
                    value={value.compositionCopyright?.owner ?? ""}
                    onChange={(e) =>
                      update({
                        compositionCopyright: {
                          year: value.compositionCopyright?.year ?? currentYear,
                          owner: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Master ℗ */}
              <div className="rounded-lg border border-border/40 p-3 space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <span className="text-lg leading-none">℗</span>
                  Master Copyright
                  {distributionMode && <span className="text-destructive">*</span>}
                </Label>
                <p className="text-[10px] text-muted-foreground -mt-1">
                  The label or artist who owns the master recording.
                </p>
                <div className="flex gap-2">
                  <Select
                    value={value.masterCopyright?.year?.toString() ?? ""}
                    onValueChange={(v) =>
                      update({
                        masterCopyright: {
                          year: parseInt(v),
                          owner: value.masterCopyright?.owner ?? "",
                        },
                      })
                    }
                  >
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_OPTIONS.map((y) => (
                        <SelectItem key={y} value={y.toString()} className="text-xs">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="h-8 text-xs flex-1"
                    placeholder='e.g., "Jane Doe" or "Independent"'
                    value={value.masterCopyright?.owner ?? ""}
                    onChange={(e) =>
                      update({
                        masterCopyright: {
                          year: value.masterCopyright?.year ?? currentYear,
                          owner: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Label */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Label / Publisher</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder='Label name or "Independent"'
                  value={value.label ?? ""}
                  onChange={(e) => update({ label: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* ── Featured Artists ─────────────────────────────────────────── */}
          <div>
            <SectionHeader
              icon={<Mic2 className="w-4 h-4" />}
              title="Featured Artists"
              subtitle='Automatically formatted per DSP rules (e.g., "feat." for Apple/Spotify, parentheses for Amazon).'
              isComplete={(value.featuredArtists?.length ?? 0) > 0}
            />
            <div className="space-y-2">
              {(value.featuredArtists ?? []).map((artist, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    className="h-8 text-xs flex-1"
                    placeholder="Artist name"
                    value={artist.name}
                    onChange={(e) => {
                      const updated = [...(value.featuredArtists ?? [])];
                      updated[i] = { ...updated[i], name: e.target.value };
                      update({ featuredArtists: updated });
                    }}
                  />
                  <Select
                    value={artist.role ?? "featured"}
                    onValueChange={(v) => {
                      const updated = [...(value.featuredArtists ?? [])];
                      updated[i] = { ...updated[i], role: v };
                      update({ featuredArtists: updated });
                    }}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEATURED_ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value} className="text-xs">
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <RemoveButton
                    onClick={() => {
                      const updated = (value.featuredArtists ?? []).filter((_, j) => j !== i);
                      update({ featuredArtists: updated });
                    }}
                  />
                </div>
              ))}
              <AddButton
                label="Add Featured Artist"
                onClick={() =>
                  update({
                    featuredArtists: [
                      ...(value.featuredArtists ?? []),
                      { name: "", role: "featured" },
                    ],
                  })
                }
              />
            </div>
          </div>

          {/* ── Producers ────────────────────────────────────────────────── */}
          <div>
            <SectionHeader
              icon={<Settings2 className="w-4 h-4" />}
              title="Producers"
              subtitle='List producers under "Producer" role for proper display on Spotify and Apple Music.'
              isComplete={(value.producers?.length ?? 0) > 0}
            />
            <div className="space-y-2">
              {(value.producers ?? []).map((producer, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    className="h-8 text-xs flex-1"
                    placeholder="Producer name"
                    value={producer.name}
                    onChange={(e) => {
                      const updated = [...(value.producers ?? [])];
                      updated[i] = { ...updated[i], name: e.target.value };
                      update({ producers: updated });
                    }}
                  />
                  <Input
                    className="h-8 text-xs w-36"
                    placeholder="Role (optional)"
                    value={producer.role ?? ""}
                    onChange={(e) => {
                      const updated = [...(value.producers ?? [])];
                      updated[i] = { ...updated[i], role: e.target.value };
                      update({ producers: updated });
                    }}
                  />
                  <RemoveButton
                    onClick={() => {
                      const updated = (value.producers ?? []).filter((_, j) => j !== i);
                      update({ producers: updated });
                    }}
                  />
                </div>
              ))}
              <AddButton
                label="Add Producer"
                onClick={() =>
                  update({ producers: [...(value.producers ?? []), { name: "", role: "Producer" }] })
                }
              />
            </div>
          </div>

          {/* ── Engineers ────────────────────────────────────────────────── */}
          <div>
            <SectionHeader
              icon={<Settings2 className="w-4 h-4" />}
              title="Engineers"
              subtitle="Recording, mixing, and mastering engineers. Displayed in Spotify's 'Show Credits' section."
              isComplete={(value.engineers?.length ?? 0) > 0}
            />
            <div className="space-y-2">
              {(value.engineers ?? []).map((eng, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    className="h-8 text-xs flex-1"
                    placeholder="Engineer name"
                    value={eng.name}
                    onChange={(e) => {
                      const updated = [...(value.engineers ?? [])];
                      updated[i] = { ...updated[i], name: e.target.value };
                      update({ engineers: updated });
                    }}
                  />
                  <Select
                    value={eng.role}
                    onValueChange={(v) => {
                      const updated = [...(value.engineers ?? [])];
                      updated[i] = {
                        ...updated[i],
                        role: v as typeof eng.role,
                      };
                      update({ engineers: updated });
                    }}
                  >
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENGINEER_ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value} className="text-xs">
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <RemoveButton
                    onClick={() => {
                      const updated = (value.engineers ?? []).filter((_, j) => j !== i);
                      update({ engineers: updated });
                    }}
                  />
                </div>
              ))}
              <AddButton
                label="Add Engineer"
                onClick={() =>
                  update({
                    engineers: [
                      ...(value.engineers ?? []),
                      { name: "", role: "mixing" },
                    ],
                  })
                }
              />
            </div>
          </div>

          {/* ── Songwriters / Composers ───────────────────────────────────── */}
          <div>
            <SectionHeader
              icon={<Music className="w-4 h-4" />}
              title="Songwriters & Composers"
              subtitle="Display names for the 'Written By' section on Spotify and Apple Music. IPI number optional."
              isComplete={(value.writers?.length ?? 0) > 0}
            />
            <div className="space-y-2">
              {(value.writers ?? []).map((writer, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    className="h-8 text-xs flex-1"
                    placeholder="Full legal name"
                    value={writer.name}
                    onChange={(e) => {
                      const updated = [...(value.writers ?? [])];
                      updated[i] = { ...updated[i], name: e.target.value };
                      update({ writers: updated });
                    }}
                  />
                  <Input
                    className="h-8 text-xs w-28"
                    placeholder="IPI # (opt.)"
                    value={writer.ipi ?? ""}
                    onChange={(e) => {
                      const updated = [...(value.writers ?? [])];
                      updated[i] = { ...updated[i], ipi: e.target.value };
                      update({ writers: updated });
                    }}
                  />
                  <Input
                    className="h-8 text-xs w-24"
                    placeholder="PRO (opt.)"
                    value={writer.pro ?? ""}
                    onChange={(e) => {
                      const updated = [...(value.writers ?? [])];
                      updated[i] = { ...updated[i], pro: e.target.value };
                      update({ writers: updated });
                    }}
                  />
                  <RemoveButton
                    onClick={() => {
                      const updated = (value.writers ?? []).filter((_, j) => j !== i);
                      update({ writers: updated });
                    }}
                  />
                </div>
              ))}
              <AddButton
                label="Add Songwriter"
                onClick={() =>
                  update({ writers: [...(value.writers ?? []), { name: "" }] })
                }
              />
            </div>
          </div>

          {/* ── Classical Toggle ──────────────────────────────────────────── */}
          <div>
            <button
              type="button"
              onClick={() => setShowClassical(!showClassical)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              {showClassical ? "Hide" : "Show"} Classical Metadata (Apple Music Classical standards)
              {showClassical ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showClassical && (
              <div className="mt-3 rounded-lg border border-border/40 p-3 space-y-3">
                <p className="text-[10px] text-muted-foreground">
                  Apple Music Classical requires separate fields for conductor, ensemble, and soloists.
                  These are also used by TIDAL's classical catalog.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Conductor</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="Conductor name"
                      value={value.classical?.conductor ?? ""}
                      onChange={(e) =>
                        update({ classical: { ...value.classical, conductor: e.target.value } })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Ensemble / Orchestra</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g., Berlin Philharmonic"
                      value={value.classical?.ensemble ?? ""}
                      onChange={(e) =>
                        update({ classical: { ...value.classical, ensemble: e.target.value } })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Work Title</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="Original work title"
                      value={value.classical?.workTitle ?? ""}
                      onChange={(e) =>
                        update({ classical: { ...value.classical, workTitle: e.target.value } })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Catalog Number</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder='e.g., "BWV 1007", "Op. 9"'
                      value={value.classical?.catalogNumber ?? ""}
                      onChange={(e) =>
                        update({ classical: { ...value.classical, catalogNumber: e.target.value } })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Movement Number</Label>
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      placeholder="e.g., 1"
                      value={value.classical?.movementNumber?.toString() ?? ""}
                      onChange={(e) =>
                        update({
                          classical: {
                            ...value.classical,
                            movementNumber: e.target.value ? parseInt(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Movement Title</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder='e.g., "Allegro ma non troppo"'
                      value={value.classical?.movementTitle ?? ""}
                      onChange={(e) =>
                        update({ classical: { ...value.classical, movementTitle: e.target.value } })
                      }
                    />
                  </div>
                </div>

                {/* Soloists */}
                <div>
                  <Label className="text-xs mb-2 block">Soloists</Label>
                  <div className="space-y-2">
                    {(value.classical?.soloists ?? []).map((soloist, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <Input
                          className="h-8 text-xs flex-1"
                          placeholder="Soloist name"
                          value={soloist.name}
                          onChange={(e) => {
                            const updated = [...(value.classical?.soloists ?? [])];
                            updated[i] = { ...updated[i], name: e.target.value };
                            update({ classical: { ...value.classical, soloists: updated } });
                          }}
                        />
                        <Input
                          className="h-8 text-xs w-36"
                          placeholder="Instrument"
                          value={soloist.instrument}
                          onChange={(e) => {
                            const updated = [...(value.classical?.soloists ?? [])];
                            updated[i] = { ...updated[i], instrument: e.target.value };
                            update({ classical: { ...value.classical, soloists: updated } });
                          }}
                        />
                        <RemoveButton
                          onClick={() => {
                            const updated = (value.classical?.soloists ?? []).filter((_, j) => j !== i);
                            update({ classical: { ...value.classical, soloists: updated } });
                          }}
                        />
                      </div>
                    ))}
                    <AddButton
                      label="Add Soloist"
                      onClick={() =>
                        update({
                          classical: {
                            ...value.classical,
                            soloists: [
                              ...(value.classical?.soloists ?? []),
                              { name: "", instrument: "" },
                            ],
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Additional Credits ────────────────────────────────────────── */}
          <div>
            <SectionHeader
              icon={<BookOpen className="w-4 h-4" />}
              title="Additional Credits & Liner Notes"
              subtitle="Art director, photographer, and free-text liner notes."
            />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Art Director</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="Art director name"
                    value={value.artDirector ?? ""}
                    onChange={(e) => update({ artDirector: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Photographer</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="Photographer name"
                    value={value.photographer ?? ""}
                    onChange={(e) => update({ photographer: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Liner Notes</Label>
                <Textarea
                  className="text-xs resize-none"
                  rows={3}
                  placeholder="Additional credits, thank-yous, or notes about the recording..."
                  value={value.notes ?? ""}
                  onChange={(e) => update({ notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* ── Distribution readiness indicator ─────────────────────────── */}
          {distributionMode && (
            <div className={`rounded-lg p-3 text-xs ${
              hasCopyrights
                ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-300"
                : "bg-amber-950/30 border border-amber-500/30 text-amber-300"
            }`}>
              {hasCopyrights ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    © and ℗ are set. This track is eligible for DSP distribution.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Add © (Composition) and ℗ (Master) copyright holders above to enable DSP distribution.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CreditsDisplay — read-only credits card for track detail sheet ───────────

interface CreditsDisplayProps {
  credits: CreditsData;
  className?: string;
}

export function CreditsDisplay({ credits, className = "" }: CreditsDisplayProps) {
  const sections: Array<{ label: string; content: string }> = [];

  if (credits.compositionCopyright?.owner) {
    sections.push({
      label: "Composition (©)",
      content: `${credits.compositionCopyright.year} ${credits.compositionCopyright.owner}`,
    });
  }
  if (credits.masterCopyright?.owner) {
    sections.push({
      label: "Master (℗)",
      content: `${credits.masterCopyright.year} ${credits.masterCopyright.owner}`,
    });
  }
  if (credits.label) {
    sections.push({ label: "Label", content: credits.label });
  }
  if (credits.featuredArtists?.length) {
    sections.push({
      label: "Featured Artists",
      content: credits.featuredArtists.map((a) => a.name).join(", "),
    });
  }
  if (credits.producers?.length) {
    sections.push({
      label: "Producers",
      content: credits.producers.map((p) => p.name).join(", "),
    });
  }
  if (credits.engineers?.length) {
    sections.push({
      label: "Engineers",
      content: credits.engineers
        .map((e) => `${e.name} (${e.role})`)
        .join(", "),
    });
  }
  if (credits.writers?.length) {
    sections.push({
      label: "Songwriters",
      content: credits.writers.map((w) => w.name).join(", "),
    });
  }
  if (credits.composers?.length) {
    sections.push({
      label: "Composers",
      content: credits.composers.map((c) => c.name).join(", "),
    });
  }
  if (credits.artDirector) {
    sections.push({ label: "Art Direction", content: credits.artDirector });
  }
  if (credits.photographer) {
    sections.push({ label: "Photography", content: credits.photographer });
  }
  if (credits.notes) {
    sections.push({ label: "Notes", content: credits.notes });
  }

  if (!sections.length) return null;

  return (
    <div className={`rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 ${className}`}>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Credits
      </p>
      <div className="space-y-2">
        {sections.map(({ label, content }) => (
          <div key={label} className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground shrink-0">{label}</span>
            <span className="text-foreground text-right">{content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
