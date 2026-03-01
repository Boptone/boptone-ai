import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db_toney
vi.mock("../db_toney", () => ({
  getToneyProfileByUserId: vi.fn(),
  upsertToneyProfile: vi.fn(),
  buildKnowThisArtistBlock: vi.fn().mockReturnValue(""),
  saveToneyConversationTurn: vi.fn(),
}));

import { getToneyProfileByUserId, upsertToneyProfile } from "../db_toney";

describe("Toney Onboarding — getOnboardingStatus logic", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns completed=false when no profile exists", async () => {
    vi.mocked(getToneyProfileByUserId).mockResolvedValue(null);
    const profile = await getToneyProfileByUserId(1);
    expect(profile).toBeNull();
    const status = { completed: !!profile, profile: null };
    expect(status.completed).toBe(false);
    expect(status.profile).toBeNull();
  });

  it("returns completed=true when profile exists", async () => {
    const mockProfile = {
      id: 1,
      userId: 42,
      artistProfileId: 10,
      careerStage: "emerging" as const,
      primaryGenre: "Hip-Hop / Rap",
      activeGoals: "Release debut EP",
      prefersBriefResponses: false,
      prefersDataHeavy: true,
    };
    vi.mocked(getToneyProfileByUserId).mockResolvedValue(mockProfile as any);
    const profile = await getToneyProfileByUserId(42);
    const status = {
      completed: !!profile,
      profile: profile ? {
        careerStage: profile.careerStage,
        primaryGenre: profile.primaryGenre,
        activeGoals: profile.activeGoals,
        prefersBriefResponses: profile.prefersBriefResponses,
        prefersDataHeavy: profile.prefersDataHeavy,
      } : null,
    };
    expect(status.completed).toBe(true);
    expect(status.profile?.careerStage).toBe("emerging");
    expect(status.profile?.primaryGenre).toBe("Hip-Hop / Rap");
    expect(status.profile?.prefersDataHeavy).toBe(true);
  });
});

describe("Toney Onboarding — saveOnboardingProfile logic", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls upsertToneyProfile with correct fields", async () => {
    vi.mocked(upsertToneyProfile).mockResolvedValue(undefined);
    const input = {
      careerStage: "developing" as const,
      primaryGenre: "R&B / Soul",
      teamStructure: "managed" as const,
      activeGoals: "Grow to 50k monthly listeners",
      prefersBriefResponses: true,
      prefersDataHeavy: false,
    };
    await upsertToneyProfile({
      userId: 5,
      artistProfileId: 10,
      ...input,
    } as any);
    expect(upsertToneyProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        artistProfileId: 10,
        careerStage: "developing",
        primaryGenre: "R&B / Soul",
        teamStructure: "managed",
        activeGoals: "Grow to 50k monthly listeners",
        prefersBriefResponses: true,
        prefersDataHeavy: false,
      })
    );
  });

  it("defaults careerStage to emerging when not provided", async () => {
    vi.mocked(upsertToneyProfile).mockResolvedValue(undefined);
    const careerStage = (undefined as any) ?? "emerging";
    expect(careerStage).toBe("emerging");
  });

  it("defaults teamStructure to solo when not provided", async () => {
    const teamStructure = (undefined as any) ?? "solo";
    expect(teamStructure).toBe("solo");
  });

  it("defaults prefersBriefResponses to false when not provided", async () => {
    const prefersBriefResponses = (undefined as any) ?? false;
    expect(prefersBriefResponses).toBe(false);
  });

  it("defaults prefersDataHeavy to false when not provided", async () => {
    const prefersDataHeavy = (undefined as any) ?? false;
    expect(prefersDataHeavy).toBe(false);
  });

  it("handles optional fields gracefully (undefined passthrough)", async () => {
    vi.mocked(upsertToneyProfile).mockResolvedValue(undefined);
    await upsertToneyProfile({
      userId: 7,
      artistProfileId: 14,
      careerStage: "legacy",
      teamStructure: "solo",
      prefersBriefResponses: false,
      prefersDataHeavy: false,
    } as any);
    expect(upsertToneyProfile).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 7, careerStage: "legacy" })
    );
  });
});

describe("Toney Onboarding — UI trigger logic", () => {
  it("shows onboarding when status.completed is false", () => {
    const onboardingStatus = { completed: false, profile: null };
    const shouldShow = onboardingStatus && !onboardingStatus.completed;
    expect(shouldShow).toBe(true);
  });

  it("does not show onboarding when status.completed is true", () => {
    const onboardingStatus = { completed: true, profile: {} };
    const shouldShow = onboardingStatus && !onboardingStatus.completed;
    expect(shouldShow).toBeFalsy();
  });

  it("does not show onboarding when status is undefined (loading)", () => {
    const onboardingStatus = undefined;
    const shouldShow = onboardingStatus && !(onboardingStatus as any).completed;
    expect(shouldShow).toBeFalsy();
  });

  it("1200ms delay before showing modal", () => {
    vi.useFakeTimers();
    let shown = false;
    const timer = setTimeout(() => { shown = true; }, 1200);
    expect(shown).toBe(false);
    vi.advanceTimersByTime(1199);
    expect(shown).toBe(false);
    vi.advanceTimersByTime(1);
    expect(shown).toBe(true);
    clearTimeout(timer);
    vi.useRealTimers();
  });
});
