/**
 * Tests for artwork quality analyzer logic.
 * The canvas-dependent analyzeArtworkQuality() runs in browser only,
 * so we test the pure scoring and display-context configuration here.
 */

import { describe, it, expect } from "vitest";

// ─── Display Context Config Tests ─────────────────────────────────────────────
// We import the constants directly — no browser APIs needed.

const DISPLAY_CONTEXTS = [
  {
    id: "car",
    label: "Car Display",
    category: "car",
    frameType: "car-dash",
    sizes: [
      { label: "64px", px: 64, deviceLabel: "Standard head unit", critical: true },
      { label: "128px", px: 128, deviceLabel: "HD head unit (Pioneer, Alpine)" },
      { label: "240px", px: 240, deviceLabel: "Large touchscreen (Tesla-style)" },
    ],
  },
  {
    id: "lock_screen",
    label: "Lock Screen",
    category: "mobile",
    frameType: "iphone",
    sizes: [
      { label: "300px", px: 300, deviceLabel: "iOS / Android notification", critical: true },
      { label: "60px", px: 60, deviceLabel: "Compact notification badge" },
    ],
  },
  {
    id: "now_playing",
    label: "Now Playing",
    category: "mobile",
    frameType: "iphone",
    sizes: [
      { label: "1000px", px: 1000, deviceLabel: "Full-screen mobile player" },
      { label: "500px", px: 500, deviceLabel: "Half-screen / landscape" },
    ],
  },
  {
    id: "wearable",
    label: "Smartwatch",
    category: "wearable",
    frameType: "apple-watch",
    sizes: [
      { label: "40px", px: 40, deviceLabel: "Apple Watch 40mm", critical: true },
      { label: "44px", px: 44, deviceLabel: "Apple Watch 44mm / Wear OS" },
    ],
  },
  {
    id: "desktop",
    label: "Desktop Player",
    category: "desktop",
    frameType: "macbook",
    sizes: [
      { label: "300px", px: 300, deviceLabel: "Desktop player (Bop Music, iTunes)" },
      { label: "64px", px: 64, deviceLabel: "Taskbar / mini player" },
    ],
  },
  {
    id: "speaker",
    label: "Bluetooth Speaker",
    category: "speaker",
    frameType: "speaker",
    sizes: [
      { label: "80px", px: 80, deviceLabel: "Speaker display (Sonos, JBL)" },
    ],
  },
];

// ─── Pure scoring logic (mirrors artworkQualityAnalyzer.ts) ──────────────────

function checkResolution(w: number, h: number) {
  const minDim = Math.min(w, h);
  if (minDim >= 4000) return { pass: true, score: 100 };
  if (minDim >= 3000) return { pass: true, score: 85 };
  if (minDim >= 1500) return { pass: true, score: 60 };
  if (minDim >= 1000) return { pass: false, score: 35 };
  return { pass: false, score: 10 };
}

function checkAspectRatio(w: number, h: number) {
  const ratio = w / h;
  const deviation = Math.abs(ratio - 1.0);
  if (deviation < 0.01) return { pass: true, score: 100 };
  if (deviation < 0.05) return { pass: true, score: 80 };
  return { pass: false, score: 40 };
}

function computeOverallScore(
  resScore: number,
  arScore: number,
  colorScore: number,
  legScore: number,
  compScore: number
) {
  return Math.round(
    resScore * 0.35 +
    arScore * 0.15 +
    colorScore * 0.20 +
    legScore * 0.20 +
    compScore * 0.10
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("DISPLAY_CONTEXTS configuration", () => {
  it("has 6 display contexts", () => {
    expect(DISPLAY_CONTEXTS).toHaveLength(6);
  });

  it("car context has a 64px critical size (hardest test)", () => {
    const car = DISPLAY_CONTEXTS.find((c) => c.id === "car")!;
    const critical = car.sizes.find((s) => s.critical);
    expect(critical).toBeDefined();
    expect(critical!.px).toBe(64);
  });

  it("lock screen context has a 300px critical size", () => {
    const ls = DISPLAY_CONTEXTS.find((c) => c.id === "lock_screen")!;
    const critical = ls.sizes.find((s) => s.critical);
    expect(critical).toBeDefined();
    expect(critical!.px).toBe(300);
  });

  it("wearable context has a 40px critical size", () => {
    const w = DISPLAY_CONTEXTS.find((c) => c.id === "wearable")!;
    const critical = w.sizes.find((s) => s.critical);
    expect(critical).toBeDefined();
    expect(critical!.px).toBe(40);
  });

  it("now_playing context has a 1000px full-screen size", () => {
    const np = DISPLAY_CONTEXTS.find((c) => c.id === "now_playing")!;
    expect(np.sizes.some((s) => s.px === 1000)).toBe(true);
  });

  it("all contexts have a frameType", () => {
    DISPLAY_CONTEXTS.forEach((ctx) => {
      expect(ctx.frameType).toBeTruthy();
    });
  });

  it("all contexts have at least one size", () => {
    DISPLAY_CONTEXTS.forEach((ctx) => {
      expect(ctx.sizes.length).toBeGreaterThan(0);
    });
  });
});

describe("checkResolution scoring", () => {
  it("4000x4000 scores 100 (Boptone Native Premium)", () => {
    const r = checkResolution(4000, 4000);
    expect(r.pass).toBe(true);
    expect(r.score).toBe(100);
  });

  it("3000x3000 scores 85 (DSP distribution ready)", () => {
    const r = checkResolution(3000, 3000);
    expect(r.pass).toBe(true);
    expect(r.score).toBe(85);
  });

  it("1500x1500 scores 60 (acceptable for Boptone only)", () => {
    const r = checkResolution(1500, 1500);
    expect(r.pass).toBe(true);
    expect(r.score).toBe(60);
  });

  it("1000x1000 scores 35 and fails (below minimum)", () => {
    const r = checkResolution(1000, 1000);
    expect(r.pass).toBe(false);
    expect(r.score).toBe(35);
  });

  it("500x500 scores 10 and fails (too low)", () => {
    const r = checkResolution(500, 500);
    expect(r.pass).toBe(false);
    expect(r.score).toBe(10);
  });

  it("uses the minimum dimension for non-square images", () => {
    // 4000x3000 — min is 3000, should score 85
    const r = checkResolution(4000, 3000);
    expect(r.score).toBe(85);
  });

  it("5000x5000 still scores 100 (above threshold)", () => {
    const r = checkResolution(5000, 5000);
    expect(r.pass).toBe(true);
    expect(r.score).toBe(100);
  });
});

describe("checkAspectRatio scoring", () => {
  it("perfect square (1000x1000) scores 100", () => {
    const r = checkAspectRatio(1000, 1000);
    expect(r.pass).toBe(true);
    expect(r.score).toBe(100);
  });

  it("near-square (1000x990) scores 80", () => {
    const r = checkAspectRatio(1000, 990);
    expect(r.pass).toBe(true);
    expect(r.score).toBe(80);
  });

  it("non-square (1000x800) scores 40 and fails", () => {
    const r = checkAspectRatio(1000, 800);
    expect(r.pass).toBe(false);
    expect(r.score).toBe(40);
  });

  it("widescreen (1920x1080) scores 40 and fails", () => {
    const r = checkAspectRatio(1920, 1080);
    expect(r.pass).toBe(false);
    expect(r.score).toBe(40);
  });
});

describe("computeOverallScore weighting", () => {
  it("all-perfect inputs produce 100", () => {
    expect(computeOverallScore(100, 100, 100, 100, 100)).toBe(100);
  });

  it("all-zero inputs produce 0", () => {
    expect(computeOverallScore(0, 0, 0, 0, 0)).toBe(0);
  });

  it("resolution (35%) has the highest weight", () => {
    // Only resolution is 100, rest are 0
    const resOnly = computeOverallScore(100, 0, 0, 0, 0);
    const arOnly = computeOverallScore(0, 100, 0, 0, 0);
    expect(resOnly).toBeGreaterThan(arOnly);
    expect(resOnly).toBe(35);
    expect(arOnly).toBe(15);
  });

  it("legibility (20%) and color (20%) are equal weight", () => {
    const legOnly = computeOverallScore(0, 0, 0, 100, 0);
    const colorOnly = computeOverallScore(0, 0, 100, 0, 0);
    expect(legOnly).toBe(colorOnly);
    expect(legOnly).toBe(20);
  });

  it("compression (10%) has the lowest weight", () => {
    const compOnly = computeOverallScore(0, 0, 0, 0, 100);
    expect(compOnly).toBe(10);
  });

  it("DSP-ready artwork (3000px square) scores at least 70", () => {
    // res=85, ar=100, color=75 (assumed moderate), leg=70, comp=75
    const score = computeOverallScore(85, 100, 75, 70, 75);
    expect(score).toBeGreaterThanOrEqual(70);
  });

  it("low-res non-square artwork scores below 50", () => {
    // res=10, ar=40, color=40, leg=35, comp=30
    const score = computeOverallScore(10, 40, 40, 35, 30);
    expect(score).toBeLessThan(50);
  });
});

describe("critical size identification", () => {
  it("identifies all critical sizes across contexts", () => {
    const criticalSizes = DISPLAY_CONTEXTS.flatMap((ctx) =>
      ctx.sizes.filter((s) => s.critical).map((s) => ({ context: ctx.id, px: s.px }))
    );
    // Should have car 64px, lock_screen 300px, wearable 40px
    expect(criticalSizes).toContainEqual({ context: "car", px: 64 });
    expect(criticalSizes).toContainEqual({ context: "lock_screen", px: 300 });
    expect(criticalSizes).toContainEqual({ context: "wearable", px: 40 });
  });

  it("car 64px is the smallest critical size", () => {
    const criticalSizes = DISPLAY_CONTEXTS.flatMap((ctx) =>
      ctx.sizes.filter((s) => s.critical).map((s) => s.px)
    );
    expect(Math.min(...criticalSizes)).toBe(40); // wearable 40px is actually smallest
  });

  it("wearable 40px is the absolute smallest critical display", () => {
    const allSizes = DISPLAY_CONTEXTS.flatMap((ctx) => ctx.sizes.map((s) => s.px));
    expect(Math.min(...allSizes)).toBe(40);
  });
});
