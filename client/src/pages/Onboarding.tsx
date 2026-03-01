import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

// ─── Constants ───────────────────────────────────────────────────────────────

const GENRES = [
  "Hip-Hop", "R&B / Soul", "Pop", "Rock", "Electronic / Dance",
  "Jazz", "Country", "Latin", "Reggae / Dancehall", "Afrobeats",
  "Indie / Alternative", "Classical", "Gospel / Worship", "Folk / Americana",
  "Metal", "Punk", "Blues", "Funk", "World", "Experimental",
];

const CAREER_STAGES = [
  { value: "emerging", label: "Emerging", desc: "Building the foundation — first releases, first fans" },
  { value: "developing", label: "Developing", desc: "Growing steadily — consistent releases, real traction" },
  { value: "established", label: "Established", desc: "Known in the scene — solid fanbase, regular income" },
  { value: "legacy", label: "Legacy", desc: "Proven track record — catalog, brand, long-term career" },
] as const;

const TEAM_STRUCTURES = [
  { value: "solo", label: "Solo", desc: "I handle everything myself" },
  { value: "managed", label: "Managed", desc: "I have a manager or team" },
  { value: "label_affiliated", label: "Label", desc: "I work with a label" },
  { value: "collective", label: "Collective", desc: "I'm part of a group or collective" },
] as const;

const INCOME_SOURCES = [
  "Streaming", "Live performances", "Merchandise", "Sync licensing",
  "Fan tips / crowdfunding", "Teaching / coaching", "Session work", "Brand deals",
];

const TOTAL_STEPS = 4;

// ─── Component ───────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1 — Identity
  const [stageName, setStageName] = useState("");
  const [careerStage, setCareerStage] = useState<"emerging" | "developing" | "established" | "legacy">("emerging");
  const [primaryGenre, setPrimaryGenre] = useState("");
  const [subGenre, setSubGenre] = useState("");
  const [geographicBase, setGeographicBase] = useState("");
  const [teamStructure, setTeamStructure] = useState<"solo" | "managed" | "label_affiliated" | "collective">("solo");

  // Step 2 — Goals & Priorities
  const [activeGoals, setActiveGoals] = useState("");
  const [primaryIncomeSource, setPrimaryIncomeSource] = useState("");

  // Step 3 — Communication Style
  const [prefersBriefResponses, setPrefersBriefResponses] = useState(false);
  const [prefersDataHeavy, setPrefersDataHeavy] = useState(false);

  // Mutations
  const createProfile = trpc.artistProfile.create.useMutation();
  const updateProfile = trpc.artistProfile.update.useMutation();
  const saveOnboarding = trpc.toney.saveOnboardingProfile.useMutation();
  const { data: existingProfile } = trpc.artistProfile.getMyProfile.useQuery();

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  // ─── Navigation ────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 1 && !stageName.trim()) {
      toast.error("Please enter your artist name to continue.");
      return;
    }
    if (step === 1 && !primaryGenre) {
      toast.error("Please select your primary genre.");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  // ─── Final Submit ───────────────────────────────────────────────────────────

  const handleFinish = async () => {
    try {
      // 1. Create or update the artist profile
      if (existingProfile) {
        await updateProfile.mutateAsync({
          stageName: stageName.trim() || existingProfile.stageName,
          genres: primaryGenre ? [primaryGenre] : existingProfile.genres ?? [],
          location: geographicBase.trim() || existingProfile.location || undefined,
          onboardingCompleted: true,
        });
      } else {
        await createProfile.mutateAsync({
          stageName: stageName.trim(),
          genres: primaryGenre ? [primaryGenre] : [],
          location: geographicBase.trim() || undefined,
        });
        await updateProfile.mutateAsync({ onboardingCompleted: true });
      }

      // 2. Save the Toney v1.1 personalization profile
      await saveOnboarding.mutateAsync({
        careerStage,
        primaryGenre: primaryGenre || undefined,
        subGenre: subGenre.trim() || undefined,
        teamStructure,
        geographicBase: geographicBase.trim() || undefined,
        activeGoals: activeGoals.trim() || undefined,
        primaryIncomeSource: primaryIncomeSource || undefined,
        prefersBriefResponses,
        prefersDataHeavy,
      });

      toast.success("Setup complete — welcome to Boptone.");
      setLocation("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong. Please try again.");
    }
  };

  const isSubmitting =
    createProfile.isPending || updateProfile.isPending || saveOnboarding.isPending;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f8f8f6] flex flex-col">
      {/* Top bar */}
      <div className="border-b border-black bg-white px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">BoPTONE</span>
        <span className="text-sm text-gray-500 font-medium">
          Step {step} of {TOTAL_STEPS}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-1 bg-[#0cc0df] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center py-16 px-4">
        <div className="w-full max-w-xl">

          {/* ── Step 1: Identity ── */}
          {step === 1 && (
            <div className="space-y-10">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-[#0cc0df] mb-3">Step 1 of 4</p>
                <h1 className="text-5xl font-bold leading-tight mb-3">Who are you as an artist?</h1>
                <p className="text-lg text-gray-600">
                  This is how Toney, your AI advisor, will know you. Take 60 seconds — it makes every conversation sharper.
                </p>
              </div>

              {/* Artist name */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Artist name <span className="text-[#0cc0df]">*</span></Label>
                <Input
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="The name your fans know you by"
                  className="h-14 text-lg border-2 border-black rounded-lg focus-visible:ring-[#0cc0df]"
                />
              </div>

              {/* Career stage */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Where are you in your career?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {CAREER_STAGES.map((stage) => (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => setCareerStage(stage.value)}
                      className={`p-4 text-left rounded-lg border-2 transition-all ${
                        careerStage === stage.value
                          ? "border-[#0cc0df] bg-[#0cc0df]/10"
                          : "border-black bg-white hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-bold text-sm">{stage.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{stage.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary genre */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Primary genre <span className="text-[#0cc0df]">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setPrimaryGenre(g)}
                      className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${
                        primaryGenre === g
                          ? "border-[#0cc0df] bg-[#0cc0df] text-black"
                          : "border-black bg-white hover:bg-gray-50"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-genre */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Sub-genre or style{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input
                  value={subGenre}
                  onChange={(e) => setSubGenre(e.target.value)}
                  placeholder="e.g. Trap soul, Bedroom pop, Nu-metal…"
                  className="h-12 border-2 border-black rounded-lg focus-visible:ring-[#0cc0df]"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Where are you based?{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input
                  value={geographicBase}
                  onChange={(e) => setGeographicBase(e.target.value)}
                  placeholder="City, country — e.g. Atlanta, USA"
                  className="h-12 border-2 border-black rounded-lg focus-visible:ring-[#0cc0df]"
                />
              </div>

              {/* Team structure */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">How do you operate?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {TEAM_STRUCTURES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTeamStructure(t.value)}
                      className={`p-4 text-left rounded-lg border-2 transition-all ${
                        teamStructure === t.value
                          ? "border-[#0cc0df] bg-[#0cc0df]/10"
                          : "border-black bg-white hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-bold text-sm">{t.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Goals & Priorities ── */}
          {step === 2 && (
            <div className="space-y-10">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-[#0cc0df] mb-3">Step 2 of 4</p>
                <h1 className="text-5xl font-bold leading-tight mb-3">What are you working toward?</h1>
                <p className="text-lg text-gray-600">
                  Toney tracks your goals across every conversation. The more specific you are, the more useful the advice.
                </p>
              </div>

              {/* Active goals */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">What are you focused on right now?</Label>
                <p className="text-sm text-gray-500">Write it like you'd tell a trusted advisor. No format required.</p>
                <Textarea
                  value={activeGoals}
                  onChange={(e) => setActiveGoals(e.target.value)}
                  placeholder="e.g. I want to hit 10,000 monthly listeners by the end of the year. I'm also trying to land my first sync placement and build a merch line around my next album drop."
                  className="min-h-[140px] border-2 border-black rounded-lg text-base focus-visible:ring-[#0cc0df] resize-none"
                />
              </div>

              {/* Primary income source */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Where does most of your music income come from today?{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {INCOME_SOURCES.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setPrimaryIncomeSource(src === primaryIncomeSource ? "" : src)}
                      className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${
                        primaryIncomeSource === src
                          ? "border-[#0cc0df] bg-[#0cc0df] text-black"
                          : "border-black bg-white hover:bg-gray-50"
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Communication Style ── */}
          {step === 3 && (
            <div className="space-y-10">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-[#0cc0df] mb-3">Step 3 of 4</p>
                <h1 className="text-5xl font-bold leading-tight mb-3">How do you like to receive information?</h1>
                <p className="text-lg text-gray-600">
                  Toney adjusts to how you think. These two settings shape every response you get.
                </p>
              </div>

              {/* Brief vs detailed */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Response length</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPrefersBriefResponses(true)}
                    className={`p-6 text-left rounded-lg border-2 transition-all ${
                      prefersBriefResponses
                        ? "border-[#0cc0df] bg-[#0cc0df]/10"
                        : "border-black bg-white hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-2xl mb-2">⚡</p>
                    <p className="font-bold">Brief & direct</p>
                    <p className="text-sm text-gray-500 mt-1">Bottom line first. I'll ask for more if I need it.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrefersBriefResponses(false)}
                    className={`p-6 text-left rounded-lg border-2 transition-all ${
                      !prefersBriefResponses
                        ? "border-[#0cc0df] bg-[#0cc0df]/10"
                        : "border-black bg-white hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-2xl mb-2">📖</p>
                    <p className="font-bold">Full context</p>
                    <p className="text-sm text-gray-500 mt-1">Give me the reasoning and the options, not just the answer.</p>
                  </button>
                </div>
              </div>

              {/* Data-heavy vs plain language */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Data style</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPrefersDataHeavy(true)}
                    className={`p-6 text-left rounded-lg border-2 transition-all ${
                      prefersDataHeavy
                        ? "border-[#0cc0df] bg-[#0cc0df]/10"
                        : "border-black bg-white hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-2xl mb-2">📊</p>
                    <p className="font-bold">Numbers & data</p>
                    <p className="text-sm text-gray-500 mt-1">I'm comfortable with charts, percentages, and metrics.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrefersDataHeavy(false)}
                    className={`p-6 text-left rounded-lg border-2 transition-all ${
                      !prefersDataHeavy
                        ? "border-[#0cc0df] bg-[#0cc0df]/10"
                        : "border-black bg-white hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-2xl mb-2">💬</p>
                    <p className="font-bold">Plain language</p>
                    <p className="text-sm text-gray-500 mt-1">Translate the numbers into clear, simple takeaways.</p>
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-5 bg-white">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">You can change this anytime.</span>{" "}
                  Tell Toney "be more brief" or "give me more data" in any conversation and it will adjust immediately.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 4: Welcome ── */}
          {step === 4 && (
            <div className="space-y-10">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-[#0cc0df] mb-3">Step 4 of 4</p>
                <h1 className="text-5xl font-bold leading-tight mb-3">
                  Toney is ready<br />to work with you.
                </h1>
                <p className="text-lg text-gray-600">
                  Your profile is set. Toney now knows your career stage, your goals, and how you like to communicate. Every conversation from here builds on this foundation.
                </p>
              </div>

              {/* Summary card */}
              <div className="border-2 border-black rounded-lg bg-white p-8 space-y-4">
                <h2 className="text-xl font-bold">Know This Artist</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Artist name</span>
                    <span className="font-semibold">{stageName || user?.name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Career stage</span>
                    <span className="font-semibold capitalize">{careerStage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Genre</span>
                    <span className="font-semibold">{[primaryGenre, subGenre].filter(Boolean).join(" · ") || "—"}</span>
                  </div>
                  {geographicBase && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Based in</span>
                      <span className="font-semibold">{geographicBase}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Team</span>
                    <span className="font-semibold capitalize">{teamStructure.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Response style</span>
                    <span className="font-semibold">
                      {prefersBriefResponses ? "Brief & direct" : "Full context"}{" "}
                      · {prefersDataHeavy ? "Data-heavy" : "Plain language"}
                    </span>
                  </div>
                  {activeGoals && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-500 font-medium mb-1">Active goals</p>
                      <p className="text-gray-700 text-xs leading-relaxed line-clamp-3">{activeGoals}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-5 bg-white">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">What happens next:</span>{" "}
                  Toney will use this profile in every conversation. As you use the platform, it learns your patterns, tracks your goals, and adjusts to how you work. The profile gets sharper over time — not just from what you tell it, but from what you do.
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                className="rounded-full border-2 border-black px-8 h-12 font-semibold hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <Button
                onClick={handleNext}
                className="rounded-full bg-[#0cc0df] hover:bg-[#0aabca] text-black border-2 border-black px-10 h-12 font-bold shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="rounded-full bg-black hover:bg-gray-900 text-white border-2 border-black px-10 h-12 font-bold shadow-[4px_4px_0px_0px_#0cc0df] hover:shadow-[2px_2px_0px_0px_#0cc0df] transition-all"
              >
                {isSubmitting ? "Saving…" : "Enter Boptone →"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
