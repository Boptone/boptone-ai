/**
 * Shared distribution constants — safe to import from both client and server.
 * NO server-only imports (no drizzle, no trpc, no node: modules).
 */

// ─── DSP Catalog ─────────────────────────────────────────────────────────────

export const DSP_CATALOG = [
  {
    slug: "boptone",
    name: "Bop Music",
    description: "Boptone's own streaming platform — always included",
    logoEmoji: "🎵",
    color: "#00BFFF",
    alwaysIncluded: true,
    supportsPreSave: true,
    minLeadTimeDays: 0,
    revenueShareNote: "100% artist revenue on Boptone",
  },
  {
    slug: "spotify",
    name: "Spotify",
    description: "World's largest music streaming platform",
    logoEmoji: "🟢",
    color: "#1DB954",
    alwaysIncluded: false,
    supportsPreSave: true,
    minLeadTimeDays: 7,
    revenueShareNote: "Boptone takes 10–15% of streaming revenue",
  },
  {
    slug: "apple_music",
    name: "Apple Music",
    description: "Apple's premium streaming service",
    logoEmoji: "🍎",
    color: "#FC3C44",
    alwaysIncluded: false,
    supportsPreSave: true,
    minLeadTimeDays: 7,
    revenueShareNote: "Boptone takes 10–15% of streaming revenue",
  },
  {
    slug: "tidal",
    name: "Tidal",
    description: "High-fidelity streaming — supports FLAC masters",
    logoEmoji: "🌊",
    color: "#000000",
    alwaysIncluded: false,
    supportsPreSave: false,
    minLeadTimeDays: 7,
    revenueShareNote: "Boptone takes 10–15% of streaming revenue",
  },
  {
    slug: "amazon_music",
    name: "Amazon Music",
    description: "Amazon's streaming service with HD tier",
    logoEmoji: "📦",
    color: "#FF9900",
    alwaysIncluded: false,
    supportsPreSave: false,
    minLeadTimeDays: 7,
    revenueShareNote: "Boptone takes 10–15% of streaming revenue",
  },
  {
    slug: "youtube_music",
    name: "YouTube Music",
    description: "Google's music streaming platform",
    logoEmoji: "▶️",
    color: "#FF0000",
    alwaysIncluded: false,
    supportsPreSave: false,
    minLeadTimeDays: 3,
    revenueShareNote: "Boptone takes 10–15% of streaming revenue",
  },
  {
    slug: "deezer",
    name: "Deezer",
    description: "Global streaming with strong European presence",
    logoEmoji: "🎧",
    color: "#A238FF",
    alwaysIncluded: false,
    supportsPreSave: false,
    minLeadTimeDays: 7,
    revenueShareNote: "Boptone takes 10–15% of streaming revenue",
  },
  {
    slug: "pandora",
    name: "Pandora",
    description: "US-focused streaming and radio platform",
    logoEmoji: "📻",
    color: "#3668FF",
    alwaysIncluded: false,
    supportsPreSave: false,
    minLeadTimeDays: 14,
    revenueShareNote: "Boptone takes 10–15% of streaming revenue",
  },
] as const;

export type DspSlug = (typeof DSP_CATALOG)[number]["slug"];

// ─── Territory Regions ────────────────────────────────────────────────────────

export const TERRITORY_REGIONS = [
  { id: "worldwide", label: "Worldwide", countries: [] as string[] },
  { id: "north_america", label: "North America", countries: ["US", "CA", "MX"] },
  { id: "europe", label: "Europe", countries: ["GB", "DE", "FR", "IT", "ES", "NL", "SE", "NO", "DK", "FI", "PL", "PT", "AT", "BE", "CH", "IE", "GR", "CZ", "HU", "RO", "SK", "BG", "HR", "SI", "LT", "LV", "EE", "LU", "MT", "CY"] },
  { id: "latin_america", label: "Latin America", countries: ["BR", "AR", "CO", "CL", "PE", "VE", "EC", "BO", "PY", "UY", "CR", "GT", "HN", "SV", "NI", "PA", "DO", "CU", "PR"] },
  { id: "asia_pacific", label: "Asia Pacific", countries: ["JP", "KR", "AU", "NZ", "CN", "IN", "SG", "HK", "TW", "TH", "ID", "MY", "PH", "VN"] },
  { id: "middle_east_africa", label: "Middle East & Africa", countries: ["AE", "SA", "EG", "ZA", "NG", "KE", "GH", "ET", "TZ", "MA", "IL", "TR"] },
] as const;

// ─── Pricing Tiers ────────────────────────────────────────────────────────────

export const PRICING_TIERS = [
  {
    id: "free",
    label: "Free Streaming",
    description: "Available on ad-supported tiers only. No per-stream revenue.",
    boptoneSharePercent: 0,
    perStreamRateCents: 0,
    badge: null as string | null,
  },
  {
    id: "standard",
    label: "Standard",
    description: "Available on all tiers including premium. Standard per-stream rate.",
    boptoneSharePercent: 10,
    perStreamRateCents: 0.4,
    badge: "Most Popular" as string | null,
  },
  {
    id: "premium",
    label: "Premium",
    description: "Premium-only platforms. Higher per-stream rate, limited DSP availability.",
    boptoneSharePercent: 15,
    perStreamRateCents: 0.7,
    badge: "Highest Earnings" as string | null,
  },
] as const;
