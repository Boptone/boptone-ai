/**
 * artworkQualityAnalyzer — runs entirely in the browser using Canvas API.
 * No server round-trip needed. Analyzes resolution, aspect ratio, color depth,
 * small-size legibility (edge detection proxy), and compression artifacts.
 */

export type QualityCheck = {
  pass: boolean;
  detail: string;
  score: number; // 0–100 contribution
};

export type ArtworkQualityReport = {
  overallScore: number;
  resolution: QualityCheck;
  aspectRatio: QualityCheck;
  colorDepth: QualityCheck;
  smallSizeLegibility: QualityCheck;
  compressionArtifacts: QualityCheck;
  warnings: string[];
  naturalWidth: number;
  naturalHeight: number;
};

/**
 * Load an image from a URL and run all quality checks.
 * Returns a full ArtworkQualityReport.
 */
export async function analyzeArtworkQuality(imageUrl: string): Promise<ArtworkQualityReport> {
  const img = await loadImage(imageUrl);
  const { naturalWidth: w, naturalHeight: h } = img;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // ── Resolution check ──────────────────────────────────────────────────────
  const resolutionCheck = checkResolution(w, h);

  // ── Aspect ratio check ────────────────────────────────────────────────────
  const aspectRatioCheck = checkAspectRatio(w, h);

  // ── Color depth / richness (sample pixel variance) ────────────────────────
  canvas.width = Math.min(w, 200);
  canvas.height = Math.min(h, 200);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const colorDepthCheck = checkColorDepth(imageData);

  // ── Small-size legibility (edge density at 64px) ──────────────────────────
  const smallCanvas = document.createElement("canvas");
  smallCanvas.width = 64;
  smallCanvas.height = 64;
  const smallCtx = smallCanvas.getContext("2d")!;
  smallCtx.drawImage(img, 0, 0, 64, 64);
  const smallData = smallCtx.getImageData(0, 0, 64, 64);
  const legibilityCheck = checkSmallSizeLegibility(smallData);

  // ── Compression artifacts (blockiness at 8px grid) ───────────────────────
  const compressionCheck = checkCompressionArtifacts(imageData);

  // ── Warnings ──────────────────────────────────────────────────────────────
  const warnings: string[] = [];
  if (w < 3000 || h < 3000) {
    warnings.push("Boptone recommends 3000×3000px minimum for DSP distribution. 4000×4000px preferred for Bop Music native streaming.");
  }
  if (!aspectRatioCheck.pass) {
    warnings.push("Non-square artwork may be cropped or letterboxed on some platforms.");
  }
  if (!legibilityCheck.pass) {
    warnings.push("Artwork may be hard to read at 64px (car head units, smartwatches). Consider bolder, higher-contrast design elements.");
  }

  // ── Overall score (weighted) ──────────────────────────────────────────────
  const overallScore = Math.round(
    resolutionCheck.score * 0.35 +
    aspectRatioCheck.score * 0.15 +
    colorDepthCheck.score * 0.20 +
    legibilityCheck.score * 0.20 +
    compressionCheck.score * 0.10
  );

  return {
    overallScore,
    resolution: resolutionCheck,
    aspectRatio: aspectRatioCheck,
    colorDepth: colorDepthCheck,
    smallSizeLegibility: legibilityCheck,
    compressionArtifacts: compressionCheck,
    warnings,
    naturalWidth: w,
    naturalHeight: h,
  };
}

// ─── Individual Checks ────────────────────────────────────────────────────────

function checkResolution(w: number, h: number): QualityCheck {
  const minDim = Math.min(w, h);

  if (minDim >= 4000) {
    return { pass: true, score: 100, detail: `${w}×${h}px — Boptone Native Premium quality` };
  } else if (minDim >= 3000) {
    return { pass: true, score: 85, detail: `${w}×${h}px — DSP distribution ready` };
  } else if (minDim >= 1500) {
    return { pass: true, score: 60, detail: `${w}×${h}px — Acceptable for Boptone streaming, below DSP standard` };
  } else if (minDim >= 1000) {
    return { pass: false, score: 35, detail: `${w}×${h}px — Below minimum. Upgrade to 3000×3000px for distribution` };
  } else {
    return { pass: false, score: 10, detail: `${w}×${h}px — Too low resolution. Will appear blurry on all displays` };
  }
}

function checkAspectRatio(w: number, h: number): QualityCheck {
  const ratio = w / h;
  const deviation = Math.abs(ratio - 1.0);

  if (deviation < 0.01) {
    return { pass: true, score: 100, detail: "Perfect square (1:1) — optimal for all platforms" };
  } else if (deviation < 0.05) {
    return { pass: true, score: 80, detail: `Near-square (${w}:${h}) — minor crop may occur on some platforms` };
  } else {
    return {
      pass: false,
      score: 40,
      detail: `Non-square (${w}:${h}) — will be cropped or letterboxed. All platforms require 1:1 square artwork`,
    };
  }
}

function checkColorDepth(imageData: ImageData): QualityCheck {
  const { data } = imageData;
  const sampleSize = Math.min(data.length / 4, 5000);
  const step = Math.floor(data.length / 4 / sampleSize);

  let rVariance = 0, gVariance = 0, bVariance = 0;
  let rMean = 0, gMean = 0, bMean = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += step * 4) {
    rMean += data[i];
    gMean += data[i + 1];
    bMean += data[i + 2];
    count++;
  }
  rMean /= count; gMean /= count; bMean /= count;

  for (let i = 0; i < data.length; i += step * 4) {
    rVariance += (data[i] - rMean) ** 2;
    gVariance += (data[i + 1] - gMean) ** 2;
    bVariance += (data[i + 2] - bMean) ** 2;
  }
  rVariance /= count; gVariance /= count; bVariance /= count;

  const avgVariance = (rVariance + gVariance + bVariance) / 3;
  const stdDev = Math.sqrt(avgVariance);

  if (stdDev > 60) {
    return { pass: true, score: 100, detail: `High color richness (σ=${stdDev.toFixed(0)}) — strong visual contrast` };
  } else if (stdDev > 30) {
    return { pass: true, score: 75, detail: `Moderate color range (σ=${stdDev.toFixed(0)}) — adequate for most displays` };
  } else {
    return {
      pass: false,
      score: 40,
      detail: `Low color contrast (σ=${stdDev.toFixed(0)}) — may appear washed out on car and watch displays`,
    };
  }
}

function checkSmallSizeLegibility(imageData: ImageData): QualityCheck {
  // Sobel edge detection proxy — high edge density = more legible at small sizes
  const { data, width, height } = imageData;

  const getGray = (x: number, y: number): number => {
    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
    const i = (y * width + x) * 4;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };

  let edgeSum = 0;
  let pixelCount = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const gx =
        -getGray(x - 1, y - 1) - 2 * getGray(x - 1, y) - getGray(x - 1, y + 1) +
        getGray(x + 1, y - 1) + 2 * getGray(x + 1, y) + getGray(x + 1, y + 1);
      const gy =
        -getGray(x - 1, y - 1) - 2 * getGray(x, y - 1) - getGray(x + 1, y - 1) +
        getGray(x - 1, y + 1) + 2 * getGray(x, y + 1) + getGray(x + 1, y + 1);
      edgeSum += Math.sqrt(gx * gx + gy * gy);
      pixelCount++;
    }
  }

  const edgeDensity = edgeSum / pixelCount;

  if (edgeDensity > 25) {
    return { pass: true, score: 100, detail: `High edge contrast (${edgeDensity.toFixed(0)}) — artwork reads clearly at 64px` };
  } else if (edgeDensity > 12) {
    return { pass: true, score: 70, detail: `Moderate edge contrast (${edgeDensity.toFixed(0)}) — legible on most small displays` };
  } else {
    return {
      pass: false,
      score: 35,
      detail: `Low edge contrast (${edgeDensity.toFixed(0)}) — may appear as a blur on car head units and smartwatches`,
    };
  }
}

function checkCompressionArtifacts(imageData: ImageData): QualityCheck {
  // Detect JPEG 8×8 block boundaries by measuring discontinuities at 8px intervals
  const { data, width, height } = imageData;

  let blockBoundaryDiff = 0;
  let comparisons = 0;

  for (let y = 0; y < height - 1; y++) {
    for (let x = 7; x < width - 1; x += 8) {
      const i1 = (y * width + x) * 4;
      const i2 = (y * width + x + 1) * 4;
      const diff =
        Math.abs(data[i1] - data[i2]) +
        Math.abs(data[i1 + 1] - data[i2 + 1]) +
        Math.abs(data[i1 + 2] - data[i2 + 2]);
      blockBoundaryDiff += diff;
      comparisons++;
    }
  }

  const avgBlockDiff = comparisons > 0 ? blockBoundaryDiff / comparisons / 3 : 0;

  if (avgBlockDiff < 8) {
    return { pass: true, score: 100, detail: "No visible compression artifacts detected" };
  } else if (avgBlockDiff < 18) {
    return { pass: true, score: 75, detail: `Minor compression artifacts (score: ${avgBlockDiff.toFixed(1)}) — acceptable quality` };
  } else {
    return {
      pass: false,
      score: 30,
      detail: `Significant compression artifacts (score: ${avgBlockDiff.toFixed(1)}) — use a higher-quality source file`,
    };
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}
