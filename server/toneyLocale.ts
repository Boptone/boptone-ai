/**
 * Toney Locale Context Builder
 *
 * Builds a geo-adaptive cultural context block that is injected into
 * Toney's system prompt at runtime. This gives Toney culturally relevant
 * reference points without making assumptions about what an artist creates
 * or who they are. Every artist gets the same quality of intelligence —
 * only the cultural texture changes.
 */

interface LocaleProfile {
  country: string;
  region: string;
  language: string;
  musicCulture: string;
  calendarNotes: string;
  idiomNote: string;
}

/**
 * Core locale profiles for key music markets.
 * Covers the regions where Boptone expects the highest early adoption.
 * Additional profiles can be added as the platform grows (part of v2.0 locale taxonomy).
 */
const LOCALE_PROFILES: Record<string, LocaleProfile> = {
  // North America
  US: {
    country: "United States",
    region: "North America",
    language: "English",
    musicCulture:
      "Hip-hop, R&B, country, pop, and indie are dominant reference points. Regional scenes (Atlanta, New York, Los Angeles, Nashville, Chicago) carry significant weight. The Billboard charts and DSP playlist culture are central to the release conversation.",
    calendarNotes:
      "Key moments include Grammy season (February), summer festival season (June–August), and Q4 holiday release windows. Friday is the conventional global release day, but it is not a hard rule — artists release on any day based on algorithm behavior, cultural moments, and personal strategy. The right release day is a strategic decision, not a calendar obligation.",
    idiomNote:
      "Standard American English idioms are appropriate. Avoid assuming all artists are in major markets — independent artists are spread across every state.",
  },
  CA: {
    country: "Canada",
    region: "North America",
    language: "English / French",
    musicCulture:
      "Hip-hop, R&B, pop, and indie are strong. Toronto is a major global music hub. French-language music is significant in Quebec. Canadian content (CanCon) regulations are part of the industry landscape.",
    calendarNotes:
      "Juno Awards season (March) is a key cultural moment. Release timing largely mirrors the US market.",
    idiomNote:
      "Standard English idioms are appropriate. Be aware of the bilingual context — some artists may operate primarily in French.",
  },
  // United Kingdom & Ireland
  GB: {
    country: "United Kingdom",
    region: "Europe",
    language: "English",
    musicCulture:
      "Grime, UK drill, garage, jungle, indie rock, and pop are dominant. The UK charts and BBC Radio 1 remain influential. London is a major global music hub with strong Caribbean and West African diaspora influence.",
    calendarNotes:
      "BRIT Awards season (February) and festival season (Glastonbury, Reading/Leeds in summer) are key cultural moments.",
    idiomNote:
      "British English is appropriate. Avoid exclusively American idioms — phrases like 'the trunk of a car' or 'the first floor' mean different things.",
  },
  IE: {
    country: "Ireland",
    region: "Europe",
    language: "English",
    musicCulture:
      "Pop, indie, folk, and traditional Irish music are significant. The Irish music scene has strong international reach relative to its size.",
    calendarNotes: "Longitude and Electric Picnic are key festival moments.",
    idiomNote: "Irish English idioms are appropriate where relevant.",
  },
  // West Africa
  NG: {
    country: "Nigeria",
    region: "West Africa",
    language: "English",
    musicCulture:
      "Afrobeats, Afropop, Highlife, and Afro-fusion are dominant. Lagos is the epicenter of one of the world's fastest-growing music industries. Artists like Burna Boy, Wizkid, and Davido have defined global Afrobeats. The industry is increasingly export-focused.",
    calendarNotes:
      "Detty December (the Lagos end-of-year festival season) is the single most important cultural and release moment of the year. Avoid scheduling major releases to compete with it unless the artist is a headliner.",
    idiomNote:
      "Avoid exclusively Western idioms. Nigerian Pidgin references are appropriate in casual register if the artist uses them first. Never assume — follow the artist's lead.",
  },
  GH: {
    country: "Ghana",
    region: "West Africa",
    language: "English",
    musicCulture:
      "Afrobeats, Highlife, Hiplife, and Gospel are dominant. Accra has a vibrant and growing music scene with strong diaspora connections to the UK and US.",
    calendarNotes:
      "December is a major cultural moment (Afrochella, Year of Return legacy events). VGMA (Vodafone Ghana Music Awards) is a key industry milestone.",
    idiomNote: "Standard English with awareness of Ghanaian cultural context.",
  },
  // East Africa
  KE: {
    country: "Kenya",
    region: "East Africa",
    language: "English / Swahili",
    musicCulture:
      "Afropop, Gengetone, Bongo Flava, and Gospel are significant. Nairobi is the regional hub. The East African music market is growing rapidly with strong mobile-first consumption.",
    calendarNotes: "Blankets & Wine and Koroga Festival are key cultural moments.",
    idiomNote:
      "Standard English is appropriate. Swahili phrases may be used by artists — follow their lead.",
  },
  // Southern Africa
  ZA: {
    country: "South Africa",
    region: "Southern Africa",
    language: "English",
    musicCulture:
      "Amapiano, Afrohouse, Gqom, Kwaito, and Gospel are dominant. Johannesburg and Cape Town are major hubs. Amapiano has become a global export genre.",
    calendarNotes:
      "Summer festival season (November–January in the Southern Hemisphere) is key. AfrikaBurn and Oppikoppi are cultural touchpoints.",
    idiomNote:
      "South African English idioms are appropriate. Be aware of the multilingual context (11 official languages).",
  },
  // Europe
  FR: {
    country: "France",
    region: "Europe",
    language: "French",
    musicCulture:
      "French rap, electronic music, and pop are dominant. Paris is a major global music hub. French-language music has strong domestic and Francophone African market reach.",
    calendarNotes:
      "Fête de la Musique (June 21) is a unique cultural moment. Les Victoires de la Musique is the key industry award.",
    idiomNote:
      "French-language responses are appropriate if the artist communicates in French. Avoid assuming English is preferred.",
  },
  DE: {
    country: "Germany",
    region: "Europe",
    language: "German",
    musicCulture:
      "Electronic music (Berlin's techno scene is globally iconic), hip-hop, pop, and metal are significant. Germany is one of the largest music markets in Europe.",
    calendarNotes:
      "Reeperbahn Festival (Hamburg, September) and Lollapalooza Berlin are key industry moments.",
    idiomNote:
      "German-language responses are appropriate if the artist communicates in German.",
  },
  // Latin America
  BR: {
    country: "Brazil",
    region: "Latin America",
    language: "Portuguese",
    musicCulture:
      "Funk carioca, Sertanejo, Pagode, Bossa Nova, and Forró are dominant. Brazil is the largest music market in Latin America. São Paulo and Rio de Janeiro are major hubs.",
    calendarNotes:
      "Carnival season (February/March) is the most significant cultural moment of the year for music. Lollapalooza Brasil and Rock in Rio are major festival touchpoints.",
    idiomNote:
      "Brazilian Portuguese responses are appropriate if the artist communicates in Portuguese. Do not use European Portuguese idioms.",
  },
  MX: {
    country: "Mexico",
    region: "Latin America",
    language: "Spanish",
    musicCulture:
      "Regional Mexican (Corridos Tumbados, Banda, Norteño), Latin pop, and urban Latin are dominant. Mexico City is a major regional hub. The US Latin market is closely connected.",
    calendarNotes:
      "Día de los Muertos (November) and Vive Latino (March) are key cultural moments.",
    idiomNote:
      "Mexican Spanish idioms are appropriate. Latin American Spanish is preferred over Castilian Spanish.",
  },
  CO: {
    country: "Colombia",
    region: "Latin America",
    language: "Spanish",
    musicCulture:
      "Reggaeton, Cumbia, Vallenato, and Latin pop are dominant. Colombia has produced globally significant artists. Medellín and Bogotá are major hubs.",
    calendarNotes:
      "Estéreo Picnic (Bogotá, March) is a key festival moment. Feria de las Flores (Medellín, August) has strong music programming.",
    idiomNote: "Colombian Spanish idioms are appropriate.",
  },
  // Asia-Pacific
  JP: {
    country: "Japan",
    region: "Asia-Pacific",
    language: "Japanese",
    musicCulture:
      "J-Pop, City Pop, Visual Kei, and electronic music are dominant. Japan is one of the world's largest music markets with a strong physical media culture. The idol industry is a significant economic force.",
    calendarNotes:
      "Summer festival season (Fuji Rock, Summer Sonic) is a key cultural moment. Year-end Kohaku Uta Gassen (NHK) is a major industry event.",
    idiomNote:
      "Japanese-language responses are appropriate if the artist communicates in Japanese. Be aware of the formal/informal register distinction.",
  },
  KR: {
    country: "South Korea",
    region: "Asia-Pacific",
    language: "Korean",
    musicCulture:
      "K-Pop is a globally dominant export genre with a highly structured industry model (agencies, fan engagement, physical album culture). Hip-hop and indie scenes are also significant. Seoul is the hub.",
    calendarNotes:
      "MAMA Awards (December) and Melon Music Awards are key industry moments. Comeback cycles (the K-Pop release model) are a distinct cultural concept.",
    idiomNote:
      "Korean-language responses are appropriate if the artist communicates in Korean. Be aware of the specific K-Pop industry vocabulary (comeback, fandom, lightstick, etc.).",
  },
  AU: {
    country: "Australia",
    region: "Asia-Pacific",
    language: "English",
    musicCulture:
      "Pop, indie, hip-hop, and electronic music are dominant. Australia has a strong live music culture. Indigenous Australian music is a significant and respected tradition.",
    calendarNotes:
      "Summer festival season (November–February in the Southern Hemisphere). Splendour in the Grass (July) and Laneway Festival are key moments.",
    idiomNote:
      "Australian English idioms are appropriate. Be aware of the Southern Hemisphere calendar — summer is December–February.",
  },
  IN: {
    country: "India",
    region: "Asia-Pacific",
    language: "English / Hindi",
    musicCulture:
      "Bollywood film music, Punjabi pop, independent Indian pop, and classical traditions are all significant. India is one of the world's fastest-growing music markets. Mumbai and Mumbai-adjacent industry structures dominate commercial music.",
    calendarNotes:
      "Diwali (October/November) and Holi (March) are major cultural moments with strong music associations. NH7 Weekender is a key independent music festival.",
    idiomNote:
      "Indian English idioms are appropriate. Hindi phrases may be used by artists — follow their lead. Do not assume all Indian artists work in Hindi.",
  },
  // Middle East
  AE: {
    country: "United Arab Emirates",
    region: "Middle East",
    language: "Arabic / English",
    musicCulture:
      "Arabic pop, Khaleeji music, and international genres are significant. Dubai is a growing hub for live events and regional music industry infrastructure.",
    calendarNotes:
      "Ramadan affects release and event timing significantly — major releases are typically avoided during this period. Dubai Music Week is a key industry moment.",
    idiomNote:
      "Standard English is widely used in the UAE music industry. Arabic responses are appropriate if the artist communicates in Arabic.",
  },
};

/**
 * Default profile used when the country is not in the locale profiles list.
 * Designed to be globally neutral — no region-specific assumptions.
 */
const DEFAULT_LOCALE_PROFILE: Omit<LocaleProfile, "country" | "region"> = {
  language: "English",
  musicCulture:
    "Music culture varies by region. Use the artist's own language and references as the guide. Do not assume genre, scene, or industry structure.",
  calendarNotes:
    "Release timing conventions vary by market. Friday is the global convention but is not a hard rule — the right release day is a strategic decision, not a calendar obligation.",
  idiomNote:
    "Use globally accessible language. Avoid idioms that are specific to North America or the UK unless the artist uses them first.",
};

/**
 * Builds the locale context block to inject into Toney's system prompt.
 *
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g. "NG", "US", "GB")
 * @param acceptLanguage The Accept-Language header value from the request (optional)
 * @returns A formatted string block for injection into the system prompt
 */
export function buildLocaleContext(
  countryCode: string | null,
  acceptLanguage?: string
): string {
  const code = (countryCode || "").toUpperCase();
  const profile = LOCALE_PROFILES[code];

  if (!profile) {
    // Unknown or undetected country — use the neutral default
    const detectedLang = parseAcceptLanguage(acceptLanguage);
    return `
[LOCALE CONTEXT]
Country: ${code || "Unknown"}
Language hint: ${detectedLang || "English"}
Music culture: ${DEFAULT_LOCALE_PROFILE.musicCulture}
Calendar notes: ${DEFAULT_LOCALE_PROFILE.calendarNotes}
Idiom guidance: ${DEFAULT_LOCALE_PROFILE.idiomNote}
Instruction: Use globally accessible language and follow the artist's own cultural cues. Do not make assumptions about genre, scene, or industry structure based on location alone.
`;
  }

  return `
[LOCALE CONTEXT]
Country: ${profile.country}
Region: ${profile.region}
Primary language: ${profile.language}
Music culture context: ${profile.musicCulture}
Calendar notes: ${profile.calendarNotes}
Idiom guidance: ${profile.idiomNote}
Instruction: Use this context to make examples and references feel locally relevant. This is a texture layer — do not make assumptions about what genre the artist makes, adjust the quality of your responses, or treat this artist differently from any other. Every artist receives the same level of intelligence and care regardless of location.
`;
}

/**
 * Parses the Accept-Language header to extract the primary language code.
 * Returns null if the header is absent or unparseable.
 */
function parseAcceptLanguage(header?: string): string | null {
  if (!header) return null;
  const primary = header.split(",")[0]?.split(";")[0]?.trim();
  return primary || null;
}
