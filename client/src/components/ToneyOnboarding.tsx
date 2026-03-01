import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

/**
 * ToneyOnboarding — 5-step profile setup modal.
 * Shown automatically on first login when no Toney profile exists.
 * Populates artistToneyProfiles so the "Know This Artist" block activates.
 */

type Step = 1 | 2 | 3 | 4 | 5;

const GENRES = [
  "Hip-Hop / Rap", "R&B / Soul", "Pop", "Rock", "Electronic / Dance",
  "Afrobeats", "Latin", "Country", "Jazz", "Classical", "Gospel / Christian",
  "Reggae / Dancehall", "Folk / Indie", "Metal", "Alternative", "Other",
];

const CAREER_STAGES = [
  { value: "emerging", label: "Emerging", description: "Just getting started — building an audience and releasing early work." },
  { value: "developing", label: "Developing", description: "Growing consistently — some releases, a real fanbase forming." },
  { value: "established", label: "Established", description: "Solid career — regular releases, touring, meaningful revenue." },
  { value: "legacy", label: "Legacy", description: "Decades in — catalog is the asset, brand is the business." },
];

const INCOME_SOURCES = [
  "Streaming", "Live performances / touring", "Merchandise", "Sync licensing",
  "Direct fan support", "Teaching / workshops", "Session work", "Publishing royalties", "Other",
];

interface ToneyOnboardingProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function ToneyOnboarding({ open, onComplete, onSkip }: ToneyOnboardingProps) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    careerStage: "" as "emerging" | "developing" | "established" | "legacy" | "",
    primaryGenre: "",
    subGenre: "",
    teamStructure: "solo" as "solo" | "managed" | "label_affiliated" | "collective",
    geographicBase: "",
    activeGoals: "",
    primaryIncomeSource: "",
    prefersBriefResponses: false,
    prefersDataHeavy: false,
    communicationNotes: "",
  });

  const saveProfile = trpc.toney.saveOnboardingProfile.useMutation({
    onSuccess: () => {
      toast.success("Your profile is set. Toney is ready.");
      onComplete();
    },
    onError: () => {
      toast.error("Something went wrong saving your profile. You can update it later in settings.");
      onComplete();
    },
  });

  const handleSubmit = () => {
    saveProfile.mutate({
      careerStage: form.careerStage || undefined,
      primaryGenre: form.primaryGenre || undefined,
      subGenre: form.subGenre || undefined,
      teamStructure: form.teamStructure,
      geographicBase: form.geographicBase || undefined,
      activeGoals: form.activeGoals || undefined,
      primaryIncomeSource: form.primaryIncomeSource || undefined,
      prefersBriefResponses: form.prefersBriefResponses,
      prefersDataHeavy: form.prefersDataHeavy,
      communicationNotes: form.communicationNotes || undefined,
    });
  };

  const next = () => setStep(s => Math.min(s + 1, 5) as Step);
  const back = () => setStep(s => Math.max(s - 1, 1) as Step);

  const progressPct = ((step - 1) / 4) * 100;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg w-full p-0 overflow-hidden" onInteractOutside={e => e.preventDefault()}>
        {/* Progress bar */}
        <div className="h-1 bg-muted w-full">
          <div
            className="h-1 bg-foreground transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
              Step {step} of 5
            </div>
            <DialogTitle className="text-2xl font-bold leading-tight">
              {step === 1 && "Where are you in your career?"}
              {step === 2 && "What genre do you make?"}
              {step === 3 && "Where is your primary income coming from?"}
              {step === 4 && "What are you focused on right now?"}
              {step === 5 && "How do you like to communicate?"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1 && "This helps set the right context for every conversation."}
              {step === 2 && "Be as specific as you like — or keep it broad."}
              {step === 3 && "No judgment. Knowing this helps give you more relevant advice."}
              {step === 4 && "Your current goals shape what Toney prioritizes."}
              {step === 5 && "Toney adapts to how you like to work."}
            </p>
          </DialogHeader>

          {/* Step 1 — Career Stage */}
          {step === 1 && (
            <div className="space-y-3">
              {CAREER_STAGES.map(cs => (
                <button
                  key={cs.value}
                  onClick={() => setForm(f => ({ ...f, careerStage: cs.value as typeof form.careerStage }))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    form.careerStage === cs.value
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  <div className="font-semibold text-sm">{cs.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{cs.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Genre */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <button
                    key={g}
                    onClick={() => setForm(f => ({ ...f, primaryGenre: g }))}
                    className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                      form.primaryGenre === g
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/40"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-1.5">
                  Sub-genre or style (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Afro-trap, Dream pop, Lo-fi..."
                  value={form.subGenre}
                  onChange={e => setForm(f => ({ ...f, subGenre: e.target.value }))}
                  className="w-full border-2 border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            </div>
          )}

          {/* Step 3 — Income source */}
          {step === 3 && (
            <div className="space-y-3">
              {INCOME_SOURCES.map(src => (
                <button
                  key={src}
                  onClick={() => setForm(f => ({ ...f, primaryIncomeSource: src }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                    form.primaryIncomeSource === src
                      ? "border-foreground bg-foreground/5 font-medium"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>
          )}

          {/* Step 4 — Goals */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-1.5">
                  What are your top 1–3 goals right now?
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Release my debut EP by June, grow my monthly listeners to 50k, land my first sync placement..."
                  value={form.activeGoals}
                  onChange={e => setForm(f => ({ ...f, activeGoals: e.target.value }))}
                  className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:border-foreground transition-colors resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-1.5">
                  Where are you based? (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lagos, London, Atlanta..."
                  value={form.geographicBase}
                  onChange={e => setForm(f => ({ ...f, geographicBase: e.target.value }))}
                  className="w-full border-2 border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            </div>
          )}

          {/* Step 5 — Communication preferences */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <button
                  onClick={() => setForm(f => ({ ...f, prefersBriefResponses: !f.prefersBriefResponses }))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    form.prefersBriefResponses
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">Keep it brief</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Short answers, fast decisions. Skip the context unless I ask.</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${form.prefersBriefResponses ? "bg-foreground border-foreground" : "border-border"}`} />
                  </div>
                </button>
                <button
                  onClick={() => setForm(f => ({ ...f, prefersDataHeavy: !f.prefersDataHeavy }))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    form.prefersDataHeavy
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">Give me the numbers</div>
                      <div className="text-xs text-muted-foreground mt-0.5">I want data, breakdowns, and specifics whenever they are available.</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${form.prefersDataHeavy ? "bg-foreground border-foreground" : "border-border"}`} />
                  </div>
                </button>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-1.5">
                  Anything else Toney should know? (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. I'm not a morning person, I prefer plain language over industry jargon, I'm dyslexic so shorter sentences help..."
                  value={form.communicationNotes}
                  onChange={e => setForm(f => ({ ...f, communicationNotes: e.target.value }))}
                  className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:border-foreground transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <Button variant="ghost" size="sm" onClick={back} className="text-muted-foreground">
                  Back
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-muted-foreground text-xs"
              >
                Skip for now
              </Button>
            </div>
            {step < 5 ? (
              <Button onClick={next} className="rounded-full px-6">
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={saveProfile.isPending}
                className="rounded-full px-6"
              >
                {saveProfile.isPending ? "Saving..." : "Finish setup"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
