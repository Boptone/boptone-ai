/**
 * dspTitleFormatter.ts
 *
 * DSP-specific title formatting rules engine.
 * Each platform has strict style guides — this library enforces them
 * and generates a live preview so artists know exactly how their
 * title will appear before they submit.
 *
 * Sources:
 *  - Apple Music Style Guide (2024)
 *  - Amazon Music Submission Requirements
 *  - Spotify Metadata Best Practices
 *  - TIDAL Distributor Handbook
 *  - DDEX ERN 4.3 Title Formatting Spec
 */

export interface DspTitleResult {
  formatted: string;
  original: string;
  issues: DspTitleIssue[];
  isValid: boolean;
}

export interface DspTitleIssue {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
}

export interface FeaturedArtist {
  name: string;
  role?: string; // "featured" | "remixer" | "vs" | "with"
}

export interface TitleFormatterInput {
  title: string;
  featuredArtists?: FeaturedArtist[];
  isRemix?: boolean;
  remixArtist?: string;
  isLive?: boolean;
  isAcoustic?: boolean;
  isInstrumental?: boolean;
  versionNote?: string; // e.g., "Radio Edit", "Extended Mix"
}

// ─── Shared Utilities ─────────────────────────────────────────────────────────

/** Convert a string to proper title case (Chicago Manual of Style) */
function toTitleCase(str: string): string {
  const minorWords = new Set([
    "a", "an", "the", "and", "but", "or", "nor", "for", "so", "yet",
    "at", "by", "in", "of", "on", "to", "up", "as", "is", "it",
  ]);
  return str
    .toLowerCase()
    .split(" ")
    .map((word, i) => {
      // Always capitalize first and last word
      if (i === 0) return capitalize(word);
      // Always capitalize words after punctuation
      if (/[:()\[\]]/.test(word[0] ?? "")) return word;
      // Don't capitalize minor words in the middle
      if (minorWords.has(word)) return word;
      return capitalize(word);
    })
    .join(" ");
}

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Detect ALL CAPS words (3+ chars) */
function hasAllCaps(str: string): boolean {
  return /\b[A-Z]{3,}\b/.test(str);
}

/** Detect marketing phrases banned by Apple Music */
const APPLE_BANNED_PHRASES = [
  "exclusive",
  "official",
  "new single",
  "new album",
  "out now",
  "available now",
  "buy now",
  "free download",
  "hd version",
  "hd",
  "4k",
  "remastered version",
  "deluxe version",
  "bonus track",
  "hidden track",
];

function detectBannedPhrases(str: string, banned: string[]): string[] {
  const lower = str.toLowerCase();
  return banned.filter((phrase) => lower.includes(phrase));
}

/** Build the feat. suffix string */
function buildFeatSuffix(
  artists: FeaturedArtist[],
  style: "feat." | "ft." | "Feat." | "(feat.)" | "(ft.)"
): string {
  if (!artists.length) return "";
  const names = artists.map((a) => a.name).join(", ");
  return ` ${style} ${names}`;
}

/** Build version suffix */
function buildVersionSuffix(input: TitleFormatterInput): string {
  const parts: string[] = [];
  if (input.isRemix && input.remixArtist) parts.push(`${input.remixArtist} Remix`);
  else if (input.isRemix) parts.push("Remix");
  if (input.isLive) parts.push("Live");
  if (input.isAcoustic) parts.push("Acoustic");
  if (input.isInstrumental) parts.push("Instrumental");
  if (input.versionNote) parts.push(input.versionNote);
  return parts.length ? ` (${parts.join(" - ")})` : "";
}

// ─── Apple Music Formatter ────────────────────────────────────────────────────

/**
 * Apple Music Style Guide rules:
 * - Proper title case (not ALL CAPS, not all lowercase)
 * - No marketing phrases ("Exclusive", "Official", "Out Now", etc.)
 * - No AI-generated content without authorship disclosure
 * - Featured artists: "Track Name (feat. Artist Name)"
 * - Remix format: "Track Name (Artist Name Remix)"
 * - No brackets [ ] — use parentheses ( ) only
 * - Artist IDs must match Apple's internal records exactly
 * - Classical: separate Composer/Conductor/Ensemble fields
 */
export function formatForApple(input: TitleFormatterInput): DspTitleResult {
  const issues: DspTitleIssue[] = [];
  let title = input.title.trim();

  // Check for ALL CAPS
  if (hasAllCaps(title)) {
    issues.push({
      code: "APPLE_NO_ALL_CAPS",
      severity: "error",
      message: "Apple Music rejects titles with ALL CAPS words.",
      suggestion: "Use proper title case instead.",
    });
    title = toTitleCase(title);
  } else {
    title = toTitleCase(title);
  }

  // Check for banned marketing phrases
  const banned = detectBannedPhrases(title, APPLE_BANNED_PHRASES);
  if (banned.length) {
    issues.push({
      code: "APPLE_BANNED_PHRASE",
      severity: "error",
      message: `Apple Music bans marketing phrases in titles: "${banned.join('", "')}"`,
      suggestion: "Remove these phrases — they cause automatic rejection.",
    });
    // Strip banned phrases from title
    for (const phrase of banned) {
      const regex = new RegExp(`\\s*[-–—]?\\s*${phrase}\\s*[-–—]?\\s*`, "gi");
      title = title.replace(regex, " ").trim();
    }
  }

  // Check for square brackets
  if (/[\[\]]/.test(title)) {
    issues.push({
      code: "APPLE_NO_BRACKETS",
      severity: "error",
      message: "Apple Music requires parentheses ( ) instead of square brackets [ ].",
      suggestion: "Replace [ ] with ( ).",
    });
    title = title.replace(/\[/g, "(").replace(/\]/g, ")");
  }

  // Build featured artist suffix — Apple uses & for multiple artists
  const featArtists = input.featuredArtists?.filter((a) => a.name) ?? [];
  const featSuffix = featArtists.length
    ? (() => {
        const names = featArtists.map((a) => a.name);
        const joined = names.length === 1 ? names[0]
          : names.length === 2 ? `${names[0]} & ${names[1]}`
          : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
        return ` (feat. ${joined})`;
      })()
    : "";

  // Build version suffix
  const versionSuffix = buildVersionSuffix(input);

  // Strip any existing feat. from title before appending
  const cleanTitle = title.replace(/\s*[\(\[]?feat\.?.*?[\)\]]?$/i, "").trim();

  const formatted = `${cleanTitle}${versionSuffix}${featSuffix}`;

  return {
    formatted,
    original: input.title,
    issues,
    isValid: !issues.some((i) => i.severity === "error"),
  };
}

// ─── Amazon Music Formatter ───────────────────────────────────────────────────

/**
 * Amazon Music Submission Requirements:
 * - Featured artists in parentheses: "Song Title (feat. Artist Name)"
 * - No square brackets [ ] — use parentheses only
 * - No descriptive tags like "HD VERSION", "4K", "REMASTERED"
 * - No silent, ambient-only, or noise-based tracks without clear authorship
 * - Generic artist naming without brand clarity is rejected
 * - Avoid "Official", "Exclusive" in titles
 */
const AMAZON_BANNED_PHRASES = [
  "hd version",
  "hd",
  "4k",
  "exclusive",
  "official",
  "remastered version",
  "bonus track",
];

export function formatForAmazon(input: TitleFormatterInput): DspTitleResult {
  const issues: DspTitleIssue[] = [];
  let title = input.title.trim();

  // Check for square brackets
  if (/[\[\]]/.test(title)) {
    issues.push({
      code: "AMAZON_NO_BRACKETS",
      severity: "error",
      message: "Amazon Music requires parentheses ( ) instead of square brackets [ ].",
      suggestion: "Replace [ ] with ( ).",
    });
    title = title.replace(/\[/g, "(").replace(/\]/g, ")");
  }

  // Check for banned descriptive tags
  const banned = detectBannedPhrases(title, AMAZON_BANNED_PHRASES);
  if (banned.length) {
    issues.push({
      code: "AMAZON_BANNED_TAG",
      severity: "error",
      message: `Amazon Music bans descriptive tags: "${banned.join('", "')}"`,
      suggestion: "Remove these tags from the title.",
    });
    for (const phrase of banned) {
      const regex = new RegExp(`\\s*[-–—]?\\s*${phrase}\\s*[-–—]?\\s*`, "gi");
      title = title.replace(regex, " ").trim();
    }
  }

  // ALL CAPS warning (not a hard rejection but flagged)
  if (hasAllCaps(title)) {
    issues.push({
      code: "AMAZON_ALL_CAPS_WARNING",
      severity: "warning",
      message: "Amazon Music recommends proper title case, not ALL CAPS.",
      suggestion: "Use proper title case for better discoverability.",
    });
  }

  // Build featured artist suffix — Amazon requires parentheses, uses & for multiple
  const amazonFeatArtists = input.featuredArtists?.filter((a) => a.name) ?? [];
  const featSuffix = amazonFeatArtists.length
    ? (() => {
        const names = amazonFeatArtists.map((a) => a.name);
        const joined = names.length === 1 ? names[0]
          : names.length === 2 ? `${names[0]} & ${names[1]}`
          : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
        return ` (feat. ${joined})`;
      })()
    : "";

  const versionSuffix = buildVersionSuffix(input);
  const cleanTitle = title.replace(/\s*[\(\[]?feat\.?.*?[\)\]]?$/i, "").trim();
  const formatted = `${cleanTitle}${versionSuffix}${featSuffix}`;

  return {
    formatted,
    original: input.title,
    issues,
    isValid: !issues.some((i) => i.severity === "error"),
  };
}

// ─── Spotify Formatter ────────────────────────────────────────────────────────

/**
 * Spotify Metadata Best Practices:
 * - Standard formatting, similar to other platforms
 * - Featured artists: "Track Name (feat. Artist Name)"
 * - Submissions recommended 14+ days before release for playlist consideration
 * - No ALL CAPS (flagged, not rejected)
 * - No marketing phrases in titles
 */
const SPOTIFY_BANNED_PHRASES = [
  "exclusive",
  "official",
  "out now",
  "available now",
  "buy now",
  "free download",
];

export function formatForSpotify(input: TitleFormatterInput): DspTitleResult {
  const issues: DspTitleIssue[] = [];
  let title = input.title.trim();

  // ALL CAPS warning
  if (hasAllCaps(title)) {
    issues.push({
      code: "SPOTIFY_ALL_CAPS",
      severity: "warning",
      message: "Spotify recommends avoiding ALL CAPS in titles.",
      suggestion: "Use proper title case for better display on all devices.",
    });
  }

  // Marketing phrases
  const banned = detectBannedPhrases(title, SPOTIFY_BANNED_PHRASES);
  if (banned.length) {
    issues.push({
      code: "SPOTIFY_MARKETING_PHRASE",
      severity: "warning",
      message: `Spotify discourages marketing phrases in titles: "${banned.join('", "')}"`,
      suggestion: "Remove these phrases for cleaner metadata.",
    });
  }

  // Excessive punctuation check
  if (/[!?]{3,}/.test(title)) {
    issues.push({
      code: "SPOTIFY_EXCESSIVE_PUNCTUATION",
      severity: "warning",
      message: "Spotify discourages excessive punctuation (e.g., !!!, ???) in titles.",
      suggestion: "Use at most one or two punctuation marks for emphasis.",
    });
  }

  // 14-day lead time advisory
  issues.push({
    code: "SPOTIFY_LEAD_TIME",
    severity: "info",
    message: "Spotify recommends submitting at least 14 days before release for playlist consideration.",
    suggestion: "Schedule your release at least 2 weeks out for the best chance of editorial playlist placement.",
  });

  const featSuffix =
    input.featuredArtists?.length
      ? ` (feat. ${input.featuredArtists.map((a) => a.name).join(", ")})`
      : "";

  const versionSuffix = buildVersionSuffix(input);
  const cleanTitle = title.replace(/\s*[\(\[]?feat\.?.*?[\)\]]?$/i, "").trim();
  const formatted = `${cleanTitle}${versionSuffix}${featSuffix}`;

  return {
    formatted,
    original: input.title,
    issues,
    isValid: !issues.some((i) => i.severity === "error"),
  };
}

// ─── TIDAL Formatter ──────────────────────────────────────────────────────────

/**
 * TIDAL Distributor Handbook:
 * - Standard formatting
 * - Featured artists: "Track Name (feat. Artist Name)"
 * - Clickable producer/engineer credits — names must match TIDAL's artist database
 * - Hi-res audio preferred (MQA / FLAC)
 * - No marketing phrases
 */
export function formatForTidal(input: TitleFormatterInput): DspTitleResult {
  const issues: DspTitleIssue[] = [];
  const title = input.title.trim();

  if (hasAllCaps(title)) {
    issues.push({
      code: "TIDAL_ALL_CAPS",
      severity: "warning",
      message: "TIDAL recommends proper title case, not ALL CAPS.",
    });
  }

  // TIDAL clickable credits advisory
  issues.push({
    code: "TIDAL_CLICKABLE_CREDITS",
    severity: "info",
    message: "TIDAL supports clickable producer and engineer credits. Ensure all credited names match TIDAL's artist database for full linking.",
  });

  const featSuffix =
    input.featuredArtists?.length
      ? ` (feat. ${input.featuredArtists.map((a) => a.name).join(", ")})`
      : "";

  const versionSuffix = buildVersionSuffix(input);
  const cleanTitle = title.replace(/\s*[\(\[]?feat\.?.*?[\)\]]?$/i, "").trim();
  const formatted = `${cleanTitle}${versionSuffix}${featSuffix}`;

  return {
    formatted,
    original: input.title,
    issues,
    isValid: !issues.some((i) => i.severity === "error"),
  };
}

// ─── Deezer Formatter ────────────────────────────────────────────────────────

/**
 * Deezer Submission Requirements:
 * - Standard formatting
 * - Featured artists: "Track Name (feat. Artist Name)"
 * - No marketing phrases
 */
export function formatForDeezer(input: TitleFormatterInput): DspTitleResult {
  const issues: DspTitleIssue[] = [];
  const title = input.title.trim();

  if (hasAllCaps(title)) {
    issues.push({
      code: "DEEZER_ALL_CAPS",
      severity: "warning",
      message: "Deezer recommends proper title case, not ALL CAPS.",
    });
  }

  const featSuffix =
    input.featuredArtists?.length
      ? ` (feat. ${input.featuredArtists.map((a) => a.name).join(" & ")})`
      : "";

  const versionSuffix = buildVersionSuffix(input);
  const cleanTitle = title.replace(/\s*[\(\[]?feat\.?.*?[\)\]]?$/i, "").trim();
  const formatted = `${cleanTitle}${versionSuffix}${featSuffix}`;

  return {
    formatted,
    original: input.title,
    issues,
    isValid: !issues.some((i) => i.severity === "error"),
  };
}

// ─── Compatibility Adapter ────────────────────────────────────────────────────

/** DSP keys supported by the formatter */
export type DspKey = "apple" | "amazon" | "spotify" | "tidal" | "deezer";

/**
 * Compatibility shim — maps the test API shape to the internal formatters.
 * Input uses { title, featuredArtists } and output uses { formattedTitle, warnings }.
 */
export interface DspTitleInput {
  title: string;
  featuredArtists?: Array<{ name: string; role?: string }>;
  isRemix?: boolean;
  remixArtist?: string;
  isLive?: boolean;
  isAcoustic?: boolean;
  isInstrumental?: boolean;
  versionNote?: string;
}

export interface DspTitleCompatResult {
  formattedTitle: string;
  warnings: string[];
  errors: string[];
  isValid: boolean;
}

/** Generic per-DSP formatter with a stable API surface */
export function formatForDsp(input: DspTitleInput, dsp: DspKey): DspTitleCompatResult {
  const raw = (() => {
    switch (dsp) {
      case "apple": return formatForApple(input);
      case "amazon": return formatForAmazon(input);
      case "spotify": return formatForSpotify(input);
      case "tidal": return formatForTidal(input);
      case "deezer": return formatForDeezer(input);
    }
  })();
  return {
    formattedTitle: raw.formatted,
    warnings: raw.issues.filter((i) => i.severity === "warning").map((i) => i.message),
    errors: raw.issues.filter((i) => i.severity === "error").map((i) => i.message),
    isValid: raw.isValid,
  };
}

/** Validate a title string against a single DSP's rules */
export function validateTitleForDsp(
  title: string,
  dsp: DspKey
): { valid: boolean; errors: string[]; warnings: string[] } {
  if (!title || !title.trim()) {
    return { valid: false, errors: ["Title cannot be empty."], warnings: [] };
  }
  if (title.length > 255) {
    return { valid: false, errors: ["Title exceeds maximum length of 255 characters."], warnings: [] };
  }
  const result = formatForDsp({ title }, dsp);
  return {
    valid: result.errors.length === 0,
    errors: result.errors,
    warnings: result.warnings,
  };
}

/** Build a "feat. Artist A & Artist B" string from an array of featured artists */
export function buildFeaturedArtistString(
  artists: Array<{ name: string; role?: string }>
): string {
  const names = artists.map((a) => a.name).filter(Boolean);
  if (!names.length) return "";
  if (names.length === 1) return `feat. ${names[0]}`;
  if (names.length === 2) return `feat. ${names[0]} & ${names[1]}`;
  const last = names[names.length - 1];
  const rest = names.slice(0, -1).join(", ");
  return `feat. ${rest} & ${last}`;
}

// ─── Unified Formatter ────────────────────────────────────────────────────────

export interface AllDspTitles {
  apple: DspTitleCompatResult;
  spotify: DspTitleCompatResult;
  amazon: DspTitleCompatResult;
  tidal: DspTitleCompatResult;
  deezer: DspTitleCompatResult;
  hasErrors: boolean;
  hasWarnings: boolean;
  allValid: boolean;
}

export function formatForAllDsps(input: DspTitleInput): AllDspTitles {
  const apple = formatForDsp(input, "apple");
  const spotify = formatForDsp(input, "spotify");
  const amazon = formatForDsp(input, "amazon");
  const tidal = formatForDsp(input, "tidal");
  const deezer = formatForDsp(input, "deezer");

  const all = [apple, spotify, amazon, tidal, deezer];
  const hasErrors = all.some((r) => r.errors.length > 0);
  const hasWarnings = all.some((r) => r.warnings.length > 0);

  return {
    apple,
    spotify,
    amazon,
    tidal,
    deezer,
    hasErrors,
    hasWarnings,
    allValid: !hasErrors,
  };
}
