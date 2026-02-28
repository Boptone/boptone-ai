import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  artistToneyProfiles,
  toneyConversationTurns,
  ArtistToneyProfile,
  InsertArtistToneyProfile,
  InsertToneyConversationTurn,
} from "../drizzle/schema";

/**
 * Toney v1.1 — Persistent Artist Profile Helpers
 * Implements the data architecture from the v1.1 Deep Artist Personalization Addendum.
 */

/** Retrieve the Toney profile for an artist. Returns null if not yet created. */
export async function getToneyProfile(artistProfileId: number): Promise<ArtistToneyProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(artistToneyProfiles)
    .where(eq(artistToneyProfiles.artistProfileId, artistProfileId))
    .limit(1);
  return rows.length > 0 ? rows[0] : null;
}

/** Retrieve the Toney profile by userId for quick lookup. */
export async function getToneyProfileByUserId(userId: number): Promise<ArtistToneyProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(artistToneyProfiles)
    .where(eq(artistToneyProfiles.userId, userId))
    .limit(1);
  return rows.length > 0 ? rows[0] : null;
}

/** Create or update the Toney profile for an artist. */
export async function upsertToneyProfile(
  profile: InsertArtistToneyProfile
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(artistToneyProfiles)
    .values(profile)
    .onDuplicateKeyUpdate({
      set: {
        careerStage: profile.careerStage,
        primaryGenre: profile.primaryGenre,
        subGenre: profile.subGenre,
        teamStructure: profile.teamStructure,
        geographicBase: profile.geographicBase,
        releaseHistorySummary: profile.releaseHistorySummary,
        financialPatternsSummary: profile.financialPatternsSummary,
        primaryIncomeSource: profile.primaryIncomeSource,
        seasonalPatterns: profile.seasonalPatterns,
        activeGoals: profile.activeGoals,
        implicitPriorities: profile.implicitPriorities,
        prefersBriefResponses: profile.prefersBriefResponses,
        prefersDataHeavy: profile.prefersDataHeavy,
        communicationNotes: profile.communicationNotes,
        sensitivities: profile.sensitivities,
        protectedTopics: profile.protectedTopics,
        conversationSummary: profile.conversationSummary,
        summaryUpdatedAt: profile.summaryUpdatedAt,
      },
    });
}

/** Update only the conversation summary (called after compression job). */
export async function updateToneyConversationSummary(
  artistProfileId: number,
  summary: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(artistToneyProfiles)
    .set({ conversationSummary: summary, summaryUpdatedAt: new Date() })
    .where(eq(artistToneyProfiles.artistProfileId, artistProfileId));
}

/** Save a conversation turn for rolling history compression. */
export async function saveToneyConversationTurn(
  turn: InsertToneyConversationTurn
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(toneyConversationTurns).values(turn);
}

/** Get the last N conversation turns for an artist (for compression). */
export async function getRecentToneyTurns(
  artistProfileId: number,
  limit = 50
) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(toneyConversationTurns)
    .where(eq(toneyConversationTurns.artistProfileId, artistProfileId))
    .orderBy(desc(toneyConversationTurns.createdAt))
    .limit(limit);
}

/**
 * Build the "Know This Artist" context block for injection into the system prompt.
 * Returns an empty string if no profile exists yet (graceful degradation).
 */
export function buildKnowThisArtistBlock(profile: ArtistToneyProfile | null): string {
  if (!profile) return "";

  const lines: string[] = ["\nKNOW THIS ARTIST"];

  // Category 1 — Identity and Career Context
  const identityParts: string[] = [];
  if (profile.careerStage) identityParts.push(`Career stage: ${profile.careerStage}`);
  if (profile.primaryGenre) {
    const genreStr = profile.subGenre
      ? `${profile.primaryGenre} / ${profile.subGenre}`
      : profile.primaryGenre;
    identityParts.push(`Genre: ${genreStr}`);
  }
  if (profile.teamStructure) identityParts.push(`Team: ${profile.teamStructure.replace("_", " ")}`);
  if (profile.geographicBase) identityParts.push(`Based in: ${profile.geographicBase}`);
  if (identityParts.length > 0) {
    lines.push("Identity & Career: " + identityParts.join(" | "));
  }
  if (profile.releaseHistorySummary) {
    lines.push("Release history: " + profile.releaseHistorySummary);
  }

  // Category 2 — Financial Patterns
  if (profile.financialPatternsSummary) {
    lines.push("Financial patterns: " + profile.financialPatternsSummary);
  }
  if (profile.primaryIncomeSource) {
    lines.push("Primary income source: " + profile.primaryIncomeSource);
  }
  if (profile.seasonalPatterns) {
    lines.push("Seasonal patterns: " + profile.seasonalPatterns);
  }

  // Category 3 — Goals and Priorities
  if (profile.activeGoals) {
    lines.push("Active goals: " + profile.activeGoals);
  }
  if (profile.implicitPriorities) {
    lines.push("Implicit priorities: " + profile.implicitPriorities);
  }

  // Category 4 — Communication Style
  const commParts: string[] = [];
  if (profile.prefersBriefResponses) commParts.push("prefers brief responses");
  if (profile.prefersDataHeavy) commParts.push("comfortable with data-heavy responses");
  if (profile.communicationNotes) commParts.push(profile.communicationNotes);
  if (commParts.length > 0) {
    lines.push("Communication style: " + commParts.join("; "));
  }

  // Category 5 — Sensitivities
  if (profile.sensitivities) {
    lines.push("Handle with care: " + profile.sensitivities);
  }

  // Category 6 — Conversation History Summary
  if (profile.conversationSummary) {
    lines.push("Recent conversation context: " + profile.conversationSummary);
  }

  lines.push(
    "\nUse this profile actively. Reference it when it is relevant. Connect the present conversation to the artist's history and goals. Notice patterns they may not have noticed. Adjust your communication style to match theirs. The artist should feel known — not monitored, not analyzed, but genuinely understood."
  );

  return lines.join("\n");
}
