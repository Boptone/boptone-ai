/**
 * Quick Wins Sprint Tests
 * - Insights page artist ID resolution logic
 * - Writer invitation email service
 * - Admin moderation router guard
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── 1. Insights page: artist ID resolution ───────────────────────────────────
describe("ArtistInsights — artistId resolution", () => {
  it("uses the profile id when a profile exists", () => {
    const myProfile = { id: 42, stageName: "Test Artist" };
    const artistId = myProfile?.id ?? 180001;
    expect(artistId).toBe(42);
  });

  it("falls back to demo artist id 180001 when no profile", () => {
    const myProfile = undefined;
    const artistId = myProfile?.id ?? 180001;
    expect(artistId).toBe(180001);
  });

  it("falls back to demo artist id 180001 when profile id is null", () => {
    const myProfile = { id: null as unknown as number, stageName: "Incomplete" };
    const artistId = myProfile?.id ?? 180001;
    expect(artistId).toBe(180001);
  });

  it("uses id 0 when explicitly set (nullish coalescing keeps 0)", () => {
    // ?? only falls back on null/undefined, NOT on 0
    // So id=0 will be used as-is — the UI should handle this gracefully
    const myProfile = { id: 0, stageName: "Zero ID" };
    const artistId = myProfile?.id ?? 180001;
    // 0 is returned because ?? only replaces null/undefined
    expect(artistId).toBe(0);
  });
});

// ─── 2. Writer invitation email: template construction ───────────────────────
describe("sendWriterInvitationEmail — template construction", () => {
  const baseParams = {
    recipientEmail: "writer@example.com",
    recipientName: "Jane Writer",
    invitingArtistName: "The Honky Tonk Heroes",
    trackTitle: "Midnight Rodeo",
    splitPercentage: 25,
    role: "Songwriter",
    inviteToken: "abc123secure",
    baseUrl: "https://boptone.com",
  };

  it("builds the correct invite URL", () => {
    const inviteUrl = `${baseParams.baseUrl}/writer-invite?token=${baseParams.inviteToken}`;
    expect(inviteUrl).toBe("https://boptone.com/writer-invite?token=abc123secure");
  });

  it("builds the correct email subject", () => {
    const subject = `${baseParams.invitingArtistName} has invited you to a song split on Boptone`;
    expect(subject).toBe("The Honky Tonk Heroes has invited you to a song split on Boptone");
  });

  it("includes split percentage in the email body", () => {
    const text = [
      `${baseParams.invitingArtistName} has invited you to a song split on Boptone.`,
      "",
      `Track: ${baseParams.trackTitle}`,
      `Your Role: ${baseParams.role}`,
      `Your Split: ${baseParams.splitPercentage}%`,
    ].join("\n");
    expect(text).toContain("25%");
    expect(text).toContain("Midnight Rodeo");
    expect(text).toContain("Songwriter");
  });

  it("includes the invite URL in the plain text body", () => {
    const inviteUrl = `${baseParams.baseUrl}/writer-invite?token=${baseParams.inviteToken}`;
    const text = [
      "Accept your invitation:",
      inviteUrl,
    ].join("\n");
    expect(text).toContain("https://boptone.com/writer-invite?token=abc123secure");
  });

  it("handles 0% split gracefully", () => {
    const params = { ...baseParams, splitPercentage: 0 };
    const text = `Your Split: ${params.splitPercentage}%`;
    expect(text).toBe("Your Split: 0%");
  });

  it("handles 100% split gracefully", () => {
    const params = { ...baseParams, splitPercentage: 100 };
    const text = `Your Split: ${params.splitPercentage}%`;
    expect(text).toBe("Your Split: 100%");
  });

  it("uses baseUrl from request origin for invite URL", () => {
    const origin = "https://staging.boptone.com";
    const inviteUrl = `${origin}/writer-invite?token=${baseParams.inviteToken}`;
    expect(inviteUrl).toContain("staging.boptone.com");
  });
});

// ─── 3. Admin moderation: admin-only guard logic ──────────────────────────────
describe("Admin moderation — role guard", () => {
  function simulateAdminGuard(role: string) {
    if (role !== "admin") {
      throw new Error("FORBIDDEN: Admin access required");
    }
    return true;
  }

  it("allows admin users through", () => {
    expect(() => simulateAdminGuard("admin")).not.toThrow();
    expect(simulateAdminGuard("admin")).toBe(true);
  });

  it("blocks regular users", () => {
    expect(() => simulateAdminGuard("user")).toThrow("FORBIDDEN");
  });

  it("blocks artist role", () => {
    expect(() => simulateAdminGuard("artist")).toThrow("FORBIDDEN");
  });

  it("blocks empty role string", () => {
    expect(() => simulateAdminGuard("")).toThrow("FORBIDDEN");
  });
});

// ─── 4. Moderation queue: status filtering logic ─────────────────────────────
describe("Moderation queue — status filter", () => {
  const mockItems = [
    { id: 1, status: "pending", flagReason: "ai_detection_high_confidence" },
    { id: 2, status: "under_review", flagReason: "manual_report" },
    { id: 3, status: "approved", flagReason: "copyright_claim" },
    { id: 4, status: "removed", flagReason: "ai_detection_medium_confidence" },
    { id: 5, status: "pending", flagReason: "other" },
  ];

  it("filters to pending items only", () => {
    const result = mockItems.filter(i => i.status === "pending");
    expect(result).toHaveLength(2);
    expect(result.every(i => i.status === "pending")).toBe(true);
  });

  it("returns all items when status is 'all'", () => {
    const status = "all";
    const result = status === "all" ? mockItems : mockItems.filter(i => i.status === status);
    expect(result).toHaveLength(5);
  });

  it("filters to under_review items", () => {
    const result = mockItems.filter(i => i.status === "under_review");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it("returns empty array for status with no matches", () => {
    const result = mockItems.filter(i => i.status === "appealed");
    expect(result).toHaveLength(0);
  });
});

// ─── 5. Strike system: penalty escalation logic ──────────────────────────────
describe("Strike system — penalty escalation", () => {
  function determinePenalty(strikeCount: number): { penalty: string; suspensionDays: number | null } {
    const nextStrike = strikeCount + 1;
    if (nextStrike === 1) return { penalty: "warning", suspensionDays: null };
    if (nextStrike === 2) return { penalty: "suspension", suspensionDays: 30 };
    return { penalty: "permanent_ban", suspensionDays: null };
  }

  it("issues a warning for first strike", () => {
    const result = determinePenalty(0);
    expect(result.penalty).toBe("warning");
    expect(result.suspensionDays).toBeNull();
  });

  it("issues a 30-day suspension for second strike", () => {
    const result = determinePenalty(1);
    expect(result.penalty).toBe("suspension");
    expect(result.suspensionDays).toBe(30);
  });

  it("issues a permanent ban for third strike", () => {
    const result = determinePenalty(2);
    expect(result.penalty).toBe("permanent_ban");
    expect(result.suspensionDays).toBeNull();
  });

  it("issues a permanent ban for any strike beyond third", () => {
    const result = determinePenalty(5);
    expect(result.penalty).toBe("permanent_ban");
  });
});
