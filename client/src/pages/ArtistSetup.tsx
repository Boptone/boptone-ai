import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, ChevronRight, Upload, X } from "lucide-react";

// ─── Genre options ────────────────────────────────────────────────────────────
const GENRES = [
  "Hip-Hop", "R&B", "Pop", "Rock", "Electronic", "Jazz", "Classical",
  "Country", "Latin", "Reggae", "Soul", "Funk", "Blues", "Metal",
  "Indie", "Folk", "Gospel", "Afrobeats", "House", "Trap", "Drill",
  "Ambient", "World", "Alternative", "Punk", "Lo-fi", "K-Pop", "Other",
];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              i < current
                ? "bg-[#5DCCCC] text-black"
                : i === current
                ? "bg-white text-black"
                : "bg-white/10 text-white/40"
            }`}
          >
            {i < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`h-px w-8 transition-all duration-300 ${
                i < current ? "bg-[#5DCCCC]" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ArtistSetup() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [stageName, setStageName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [website, setWebsite] = useState("");

  // tRPC mutations
  const createProfile = trpc.artistProfile.create.useMutation();
  const updateProfile = trpc.artistProfile.update.useMutation();
  const uploadAvatar = trpc.artistProfile.uploadAvatar.useMutation();
  const utils = trpc.useUtils();

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5DCCCC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  function toggleGenre(genre: string) {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : prev.length < 5 ? [...prev, genre] : prev
    );
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarPreview(result);
      setAvatarBase64(result);
    };
    reader.readAsDataURL(file);
  }

  async function handleFinish() {
    setSaving(true);
    try {
      // Step 1: Create the artist profile
      await createProfile.mutateAsync({ stageName, bio });

      // Step 2: Upload avatar if provided
      if (avatarBase64) {
        const avatarResult = await uploadAvatar.mutateAsync({ fileData: avatarBase64 });
        await updateProfile.mutateAsync({ avatarUrl: avatarResult.url });
      }

      // Step 3: Update genres, location, social links, and mark onboarding complete
      await updateProfile.mutateAsync({
        genres: selectedGenres,
        location,
        socialLinks: {
          instagram: instagram || undefined,
          twitter: twitter || undefined,
          youtube: youtube || undefined,
          website: website || undefined,
        },
        onboardingCompleted: true,
      });

      await utils.artistProfile.invalidate();
      toast.success("Profile created. Welcome to Boptone.");
      navigate("/artist/signup");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  // ── Step validation ─────────────────────────────────────────────────────────
  function canAdvance(): boolean {
    if (step === 0) return stageName.trim().length >= 2;
    if (step === 1) return true; // photo is optional
    if (step === 2) return selectedGenres.length >= 1;
    return true;
  }

  function advance() {
    if (step < 3) setStep(s => s + 1);
    else handleFinish();
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  const stepLabels = ["Identity", "Photo", "Sound", "Links"];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="text-2xl font-black tracking-widest text-white uppercase mb-1">BOPTONE</div>
        <p className="text-white/40 text-sm tracking-wide">Artist Setup</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-2xl p-8">
        <StepIndicator current={step} total={4} />

        {/* Step label */}
        <div className="mb-6">
          <p className="text-[#5DCCCC] text-xs font-bold tracking-widest uppercase mb-1">
            Step {step + 1} of 4 — {stepLabels[step]}
          </p>
        </div>

        {/* ── Step 0: Identity ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black mb-1">What do you go by?</h2>
              <p className="text-white/50 text-sm">This is the name fans will see everywhere on Boptone.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
                Stage Name
              </label>
              <Input
                value={stageName}
                onChange={e => setStageName(e.target.value)}
                placeholder="Your artist name"
                maxLength={80}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 h-12 text-base focus:border-[#5DCCCC] focus:ring-0"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
                Bio <span className="text-white/30 normal-case font-normal">(optional)</span>
              </label>
              <Textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell the world about your music..."
                maxLength={300}
                rows={3}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5DCCCC] focus:ring-0 resize-none"
              />
              <p className="text-right text-xs text-white/30 mt-1">{bio.length}/300</p>
            </div>
          </div>
        )}

        {/* ── Step 1: Photo ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black mb-1">Add a profile photo</h2>
              <p className="text-white/50 text-sm">A clear photo helps fans connect with you. You can update this anytime.</p>
            </div>
            <div className="flex flex-col items-center gap-4 pt-2">
              {/* Circle preview */}
              <div
                className="w-32 h-32 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#5DCCCC] transition-colors relative group"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <>
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-white/30 mx-auto mb-1" />
                    <span className="text-white/30 text-xs">Upload</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {avatarPreview && (
                <button
                  onClick={() => { setAvatarPreview(null); setAvatarBase64(null); }}
                  className="text-white/40 hover:text-white text-xs flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Remove photo
                </button>
              )}
              <p className="text-white/30 text-xs text-center">JPG, PNG or WebP — max 5MB</p>
            </div>
          </div>
        )}

        {/* ── Step 2: Genres ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black mb-1">What is your sound?</h2>
              <p className="text-white/50 text-sm">Select up to 5 genres. This helps fans discover your music.</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                    selectedGenres.includes(genre)
                      ? "bg-[#5DCCCC] border-[#5DCCCC] text-black"
                      : "bg-transparent border-white/20 text-white/70 hover:border-white/50"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
                Location <span className="text-white/30 normal-case font-normal">(optional)</span>
              </label>
              <Input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City, Country"
                maxLength={100}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 h-11 focus:border-[#5DCCCC] focus:ring-0"
              />
            </div>
            {selectedGenres.length > 0 && (
              <p className="text-[#5DCCCC] text-xs">{selectedGenres.length}/5 selected</p>
            )}
          </div>
        )}

        {/* ── Step 3: Social Links ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black mb-1">Connect your world</h2>
              <p className="text-white/50 text-sm">Add your social links so fans can find you everywhere. All optional.</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Instagram", value: instagram, set: setInstagram, placeholder: "@yourhandle" },
                { label: "X / Twitter", value: twitter, set: setTwitter, placeholder: "@yourhandle" },
                { label: "YouTube", value: youtube, set: setYoutube, placeholder: "youtube.com/c/yourchannel" },
                { label: "Website", value: website, set: setWebsite, placeholder: "yoursite.com" },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1.5">
                    {label}
                  </label>
                  <Input
                    value={value}
                    onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 h-11 focus:border-[#5DCCCC] focus:ring-0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          <Button
            onClick={advance}
            disabled={!canAdvance() || saving}
            className="bg-[#5DCCCC] hover:bg-[#4BBBBB] text-black font-bold px-6 h-11 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : step === 3 ? (
              "Complete Setup"
            ) : (
              <span className="flex items-center gap-1">
                Continue <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>

        {/* Skip option on photo step */}
        {step === 1 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setStep(2)}
              className="text-white/30 hover:text-white/60 text-xs transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>

      {/* Progress text */}
      <p className="text-white/20 text-xs mt-6">
        {step < 3 ? `${3 - step} step${3 - step !== 1 ? "s" : ""} remaining` : "Almost done"}
      </p>
    </div>
  );
}
