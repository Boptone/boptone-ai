/**
 * RightsDeclaration.tsx
 * DISTRO-RIGHTS: Territory rights declaration and legal attestation component.
 *
 * Protects Boptone from liability by requiring artists to:
 * 1. Declare their rights type (independent / label-authorized / split-rights)
 * 2. Confirm master recording rights per territory
 * 3. Agree to a legally precise, territory-scoped attestation before submission
 *
 * The attestation text is stored verbatim in the rightsAttestations audit table
 * along with IP address, user agent, and timestamp — creating an immutable
 * legal record that Boptone can produce in any rights dispute.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Info,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type RightsType = "independent" | "label_authorized" | "split_rights";
export type PublishingHandledBy = "self" | "pro" | "publisher" | "label";

export interface TerritoryRightsState {
  territory: string;
  territoryName: string;
  masterRightsConfirmed: boolean;
  publishingHandledBy: PublishingHandledBy;
}

export interface RightsDeclarationState {
  rightsType: RightsType;
  territories: TerritoryRightsState[];
  attestationAgreed: boolean;
}

interface RightsDeclarationProps {
  /** Territories already added to the release deal list */
  territories: Array<{ territory: string; territoryName: string }>;
  value: RightsDeclarationState;
  onChange: (state: RightsDeclarationState) => void;
  /** If true, show in compact read-only mode for the review step */
  readOnly?: boolean;
}

// ── Attestation text ─────────────────────────────────────────────────────────
// Version 1.0 — increment attestationVersion in the router when this changes.

export const ATTESTATION_TEXT = `By checking this box and submitting this release, I, the submitting artist or authorized representative ("I"), declare and warrant the following:

1. TERRITORY-SPECIFIC RIGHTS: For each territory listed in this release's distribution deal, I hold or have been expressly granted the right to distribute, reproduce, and make available the master sound recording(s) in this release in that specific territory. I have NOT included any territory in which a record label, publisher, or other third party holds exclusive distribution rights that would prevent my independent distribution.

2. SPLIT-RIGHTS ACKNOWLEDGMENT: I understand that if I have a record label deal, licensing agreement, or any other arrangement that grants a third party exclusive rights in certain territories, those territories must NOT be included in this release submission. Submitting content to territories where I do not hold distribution rights is a breach of this agreement and may constitute copyright infringement.

3. COMPOSITION RIGHTS: I confirm that the composition(s) embodied in this release are either (a) original works I authored or co-authored, (b) licensed under a valid mechanical license, (c) in the public domain, or (d) handled by a registered performing rights organization (PRO) or publisher on my behalf, as declared per territory.

4. INDEMNIFICATION: I agree to indemnify, defend, and hold harmless Boptone, its officers, directors, employees, agents, and licensees from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising from or related to any breach of the representations and warranties in this declaration.

5. AUDIT TRAIL: I acknowledge that this declaration, together with my IP address, browser information, and the timestamp of this submission, will be recorded and retained by Boptone as an immutable legal record. This record may be produced as evidence in any rights dispute, legal proceeding, or regulatory inquiry.

6. ACCURACY: All information submitted in this release, including artist names, track titles, ISRC codes, UPC/EAN barcodes, copyright years, and territory selections, is accurate and complete to the best of my knowledge.

Boptone Distribution Rights Declaration — Version 1.0`;

// ── Territory name map ────────────────────────────────────────────────────────

const TERRITORY_NAMES: Record<string, string> = {
  WW: "Worldwide",
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  AU: "Australia",
  NZ: "New Zealand",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  JP: "Japan",
  KR: "South Korea",
  BR: "Brazil",
  MX: "Mexico",
  IN: "India",
  ZA: "South Africa",
  NG: "Nigeria",
};

export function getTerritoryName(code: string): string {
  return TERRITORY_NAMES[code] ?? code;
}

// ── Rights type config ────────────────────────────────────────────────────────

const RIGHTS_TYPE_CONFIG = {
  independent: {
    label: "Fully Independent",
    description:
      "I own my master recordings outright. No label holds any rights to this music in any territory.",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    color: "border-emerald-500/40 bg-emerald-950/20",
    badgeColor: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
  },
  label_authorized: {
    label: "Label-Authorized Distribution",
    description:
      "A label owns or co-owns the masters, but has explicitly authorized me to distribute this release. I have written authorization.",
    icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
    color: "border-amber-500/40 bg-amber-950/20",
    badgeColor: "bg-amber-900/50 text-amber-300 border-amber-700",
  },
  split_rights: {
    label: "Split Rights (Territory-Specific)",
    description:
      "My rights vary by territory. A label or other party controls distribution in some territories — I am only distributing in the territories where I hold rights.",
    icon: <Globe className="w-5 h-5 text-blue-400" />,
    color: "border-blue-500/40 bg-blue-950/20",
    badgeColor: "bg-blue-900/50 text-blue-300 border-blue-700",
  },
};

// ── Main component ────────────────────────────────────────────────────────────

export default function RightsDeclaration({
  territories,
  value,
  onChange,
  readOnly = false,
}: RightsDeclarationProps) {
  const [expandedAttestation, setExpandedAttestation] = useState(false);

  const setRightsType = (rightsType: RightsType) => {
    // When switching to independent, auto-confirm all territories
    const updatedTerritories = value.territories.map((t) => ({
      ...t,
      masterRightsConfirmed: rightsType === "independent" ? true : t.masterRightsConfirmed,
    }));
    onChange({ ...value, rightsType, territories: updatedTerritories });
  };

  const setTerritoryConfirmed = (territory: string, confirmed: boolean) => {
    onChange({
      ...value,
      territories: value.territories.map((t) =>
        t.territory === territory ? { ...t, masterRightsConfirmed: confirmed } : t
      ),
    });
  };

  const setPublishingHandledBy = (territory: string, by: PublishingHandledBy) => {
    onChange({
      ...value,
      territories: value.territories.map((t) =>
        t.territory === territory ? { ...t, publishingHandledBy: by } : t
      ),
    });
  };

  const allTerritoriesConfirmed =
    value.territories.length > 0 &&
    value.territories.every((t) => t.masterRightsConfirmed);

  const cfg = RIGHTS_TYPE_CONFIG[value.rightsType];

  if (readOnly) {
    return (
      <div className="space-y-3">
        <div className={`rounded-lg border p-3 ${cfg.color}`}>
          <div className="flex items-center gap-2">
            {cfg.icon}
            <span className="text-sm font-medium text-white">{cfg.label}</span>
          </div>
        </div>
        <div className="space-y-1">
          {value.territories.map((t) => (
            <div key={t.territory} className="flex items-center gap-2 text-sm">
              {t.masterRightsConfirmed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <span className={t.masterRightsConfirmed ? "text-zinc-300" : "text-red-400"}>
                {t.territoryName || getTerritoryName(t.territory)}
              </span>
              <Badge variant="outline" className="text-xs text-zinc-500 border-zinc-700">
                Publishing: {t.publishingHandledBy}
              </Badge>
            </div>
          ))}
        </div>
        {value.attestationAgreed && (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            Rights attestation agreed and will be recorded on submission
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Step 1: Rights type ── */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-zinc-400" />
          How do you hold rights to this release?
        </h3>
        <p className="text-xs text-zinc-500 mb-3">
          Be precise. Boptone will only deliver to territories where you have confirmed rights.
          Incorrect declarations may result in account suspension and legal liability.
        </p>

        <div className="space-y-2">
          {(["independent", "label_authorized", "split_rights"] as RightsType[]).map((type) => {
            const c = RIGHTS_TYPE_CONFIG[type];
            const isSelected = value.rightsType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setRightsType(type)}
                className={`w-full text-left rounded-lg border p-3 transition-all ${
                  isSelected
                    ? `${c.color} border-opacity-100`
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {isSelected ? (
                      c.icon
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-zinc-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{c.label}</span>
                      {isSelected && (
                        <Badge className={`text-xs ${c.badgeColor}`}>Selected</Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{c.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Split-rights callout ── */}
      {value.rightsType === "split_rights" && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-950/20 p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-300">
              <p className="font-semibold mb-1">Split-rights scenario detected</p>
              <p>
                Only add territories where YOU hold distribution rights. If a label controls
                UK/EU distribution, do not add those territories — add only US, CA, AU, or
                wherever you are free and clear. Boptone will only deliver to the territories
                you confirm below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Per-territory rights confirmation ── */}
      {value.territories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <Globe className="w-4 h-4 text-zinc-400" />
            Confirm rights per territory
          </h3>
          <p className="text-xs text-zinc-500 mb-3">
            For each territory in your release, confirm that you hold or are authorized to
            distribute the master recording. You must also declare how publishing is handled.
          </p>

          <div className="space-y-2">
            {value.territories.map((t) => (
              <div
                key={t.territory}
                className={`rounded-lg border p-3 transition-colors ${
                  t.masterRightsConfirmed
                    ? "border-emerald-700/40 bg-emerald-950/10"
                    : "border-zinc-700 bg-zinc-900"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`rights-${t.territory}`}
                    checked={t.masterRightsConfirmed}
                    onCheckedChange={(checked) =>
                      setTerritoryConfirmed(t.territory, checked === true)
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`rights-${t.territory}`}
                      className="text-sm font-medium text-white cursor-pointer"
                    >
                      {t.territoryName || getTerritoryName(t.territory)}{" "}
                      <span className="text-zinc-500 font-normal">({t.territory})</span>
                    </Label>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      I hold or am authorized to distribute the master recording in this territory
                    </p>
                    {t.masterRightsConfirmed && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-zinc-400">Publishing handled by:</span>
                        <Select
                          value={t.publishingHandledBy}
                          onValueChange={(v) =>
                            setPublishingHandledBy(t.territory, v as PublishingHandledBy)
                          }
                        >
                          <SelectTrigger className="h-7 text-xs w-40 bg-zinc-800 border-zinc-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="self">Myself (self-published)</SelectItem>
                            <SelectItem value="pro">PRO (ASCAP/BMI/SOCAN/etc.)</SelectItem>
                            <SelectItem value="publisher">Publisher</SelectItem>
                            <SelectItem value="label">Label (label handles publishing)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  {t.masterRightsConfirmed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {!allTerritoriesConfirmed && (
            <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              All territories must have rights confirmed before you can proceed.
            </p>
          )}
        </div>
      )}

      {/* ── Step 3: Legal attestation ── */}
      {allTerritoriesConfirmed && (
        <div className="rounded-lg border border-zinc-600 bg-zinc-900 p-4">
          <div className="flex items-start gap-2 mb-3">
            <Lock className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">Legal Rights Declaration</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                This declaration will be recorded with your IP address and timestamp as an
                immutable legal record. Read it carefully before agreeing.
              </p>
            </div>
          </div>

          {/* Attestation text — collapsible */}
          <div
            className={`rounded border border-zinc-700 bg-zinc-950 p-3 text-xs text-zinc-400 leading-relaxed overflow-hidden transition-all ${
              expandedAttestation ? "max-h-none" : "max-h-24"
            }`}
          >
            <pre className="whitespace-pre-wrap font-sans">{ATTESTATION_TEXT}</pre>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-500 hover:text-zinc-300 mt-1 h-6 px-2"
            onClick={() => setExpandedAttestation(!expandedAttestation)}
          >
            {expandedAttestation ? "Collapse" : "Read full declaration"}
          </Button>

          <div className="flex items-start gap-3 mt-4 p-3 rounded-lg border border-zinc-700 bg-zinc-800">
            <Checkbox
              id="attestation-agree"
              checked={value.attestationAgreed}
              onCheckedChange={(checked) =>
                onChange({ ...value, attestationAgreed: checked === true })
              }
              className="mt-0.5"
            />
            <Label
              htmlFor="attestation-agree"
              className="text-sm text-zinc-200 cursor-pointer leading-relaxed"
            >
              I have read and agree to the Boptone Distribution Rights Declaration above. I
              confirm that all territory selections in this release are territories where I
              hold or have been authorized to exercise distribution rights, and I understand
              that this agreement will be recorded as a legally binding declaration.
            </Label>
          </div>

          {value.attestationAgreed && (
            <div className="flex items-center gap-2 mt-3 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Declaration agreed — will be recorded on submission with your IP address and
              timestamp
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helper: build initial state from territory list ───────────────────────────

export function buildInitialRightsState(
  territories: Array<{ territory: string; territoryName?: string }>,
  rightsType: RightsType = "independent"
): RightsDeclarationState {
  return {
    rightsType,
    territories: territories.map((t) => ({
      territory: t.territory,
      territoryName: t.territoryName ?? getTerritoryName(t.territory),
      masterRightsConfirmed: rightsType === "independent",
      publishingHandledBy: "self",
    })),
    attestationAgreed: false,
  };
}
