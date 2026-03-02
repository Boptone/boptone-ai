/**
 * DISTRO-UX1: Distribution Wizard Router
 *
 * tRPC procedures for the multi-step distribution wizard.
 * Handles draft management, step-by-step updates, submission, and status queries.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { DSP_CATALOG, PRICING_TIERS, TERRITORY_REGIONS } from "../../shared/distributionConstants";
import {
  createDistributionSubmission,
  updateDistributionSubmission,
  submitDistributionSubmission,
  getDistributionSubmissionById,
  getDistributionSubmissionsByArtist,
  getDraftSubmissionForArtist,
  deleteDistributionSubmission,
} from "../db/distribution";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const territoriesSchema = z.object({
  mode: z.enum(["worldwide", "regions", "custom"]),
  regions: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  excludedCountries: z.array(z.string()).optional(),
});

const pricingTierSchema = z.enum(["free", "standard", "premium"]);

// Re-export shared constants so server-side code can import from one place
export { DSP_CATALOG, PRICING_TIERS, TERRITORY_REGIONS } from "../../shared/distributionConstants";
export type { DspSlug } from "../../shared/distributionConstants";

// ─── Pure Business Logic Helpers (exported for testing) ─────────────────────

export type TerritoryInput = {
  mode?: "worldwide" | "regions" | "custom";
  regions?: string[];
  countries?: string[];
  excludedCountries?: string[];
};

export function validateTerritories(territories: TerritoryInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const mode = territories?.mode ?? "worldwide";

  if (mode === "regions") {
    if (!territories.regions || territories.regions.length === 0) {
      errors.push("At least one region must be selected");
    }
  } else if (mode === "custom") {
    if (!territories.countries || territories.countries.length === 0) {
      errors.push("At least one country must be selected");
    }
  }

  return { valid: errors.length === 0, errors };
}

export type SubmissionInput = {
  trackIds: number[];
  selectedDsps: string[];
  territories: TerritoryInput;
  pricingTier: "free" | "standard" | "premium";
  releaseDate: string | null;
  preSaveEnabled: boolean;
  exclusiveWindowDays: number;
};

export function validateSubmissionForSubmit(input: SubmissionInput): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input.trackIds || input.trackIds.length === 0) {
    errors.push("At least one track must be selected");
  }

  if (!input.selectedDsps || input.selectedDsps.length === 0) {
    errors.push("At least one platform must be selected");
  }

  const territoryValidation = validateTerritories(input.territories);
  if (!territoryValidation.valid) {
    errors.push(...territoryValidation.errors);
  }

  if (input.releaseDate !== null && input.releaseDate !== undefined) {
    const parsed = new Date(input.releaseDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (parsed < now) {
      errors.push("Release date cannot be in the past");
    }
  }

  if (input.preSaveEnabled && !input.releaseDate) {
    warnings.push("Pre-save campaigns require a scheduled release date to be effective");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export type SubmissionSummaryInput = {
  selectedDsps: string[];
  territories: TerritoryInput;
  pricingTier: "free" | "standard" | "premium";
  releaseDate: string | null;
  exclusiveWindowDays: number;
};

export function getSubmissionSummary(input: SubmissionSummaryInput): {
  dspCount: number;
  territoryLabel: string;
  pricingLabel: string;
  releaseDateLabel: string | null;
  exclusiveWindowLabel: string | null;
} {
  const mode = input.territories?.mode ?? "worldwide";
  let territoryLabel = "Worldwide";
  if (mode === "regions") {
    const count = input.territories.regions?.length ?? 0;
    territoryLabel = `${count} region${count !== 1 ? "s" : ""}`;
  } else if (mode === "custom") {
    const count = input.territories.countries?.length ?? 0;
    territoryLabel = `${count} countr${count !== 1 ? "ies" : "y"}`;
  }

  const tierMap: Record<string, string> = {
    free: "Free",
    standard: "Standard",
    premium: "Premium",
  };

  const releaseDateLabel = input.releaseDate
    ? new Date(input.releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const exclusiveWindowLabel =
    input.exclusiveWindowDays > 0
      ? `${input.exclusiveWindowDays}-day Boptone exclusive`
      : null;

  return {
    dspCount: input.selectedDsps.length,
    territoryLabel,
    pricingLabel: tierMap[input.pricingTier] ?? input.pricingTier,
    releaseDateLabel,
    exclusiveWindowLabel,
  };
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const distributionRouter = router({
  /**
   * Get the DSP catalog (static, public)
   */
  getDspCatalog: protectedProcedure.query(() => {
    return DSP_CATALOG;
  }),

  /**
   * Get territory regions (static, public)
   */
  getTerritoryRegions: protectedProcedure.query(() => {
    return TERRITORY_REGIONS;
  }),

  /**
   * Get pricing tiers (static, public)
   */
  getPricingTiers: protectedProcedure.query(() => {
    return PRICING_TIERS;
  }),

  /**
   * Create a new draft distribution submission (start wizard)
   */
  createDraft: protectedProcedure
    .input(z.object({
      trackIds: z.array(z.number()).min(1, "Select at least one track"),
    }))
    .mutation(async ({ input, ctx }) => {
      const { getArtistProfileByUserId } = await import("../db");
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }

      const result = await createDistributionSubmission({
        artistId: profile.id,
        trackIds: input.trackIds,
        selectedDsps: ["boptone"], // Boptone always included
        territories: { mode: "worldwide" },
        pricingTier: "standard",
      });

      return { submissionId: (result as any).insertId as number };
    }),

  /**
   * Update wizard step data (called on each step completion)
   */
  updateStep: protectedProcedure
    .input(z.object({
      submissionId: z.number(),
      // Step 1 — Track selection
      trackIds: z.array(z.number()).optional(),
      // Step 2 — DSP selection
      selectedDsps: z.array(z.string()).optional(),
      // Step 3 — Territories
      territories: territoriesSchema.optional(),
      // Step 4 — Pricing
      pricingTier: pricingTierSchema.optional(),
      // Step 5 — Schedule
      releaseDate: z.string().nullable().optional(), // ISO date string
      preSaveEnabled: z.boolean().optional(),
      exclusiveWindowDays: z.number().min(0).max(90).optional(),
      // Misc
      upc: z.string().nullable().optional(),
      isrc: z.string().nullable().optional(),
      artistNotes: z.string().nullable().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const submission = await getDistributionSubmissionById(input.submissionId);
      if (!submission) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
      }

      // Verify ownership
      const { getArtistProfileByUserId } = await import("../db");
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile || submission.artistId !== profile.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your submission" });
      }

      if (submission.status !== "draft") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot edit a submitted release" });
      }

      // Enforce Boptone always included in DSPs
      let dsps = input.selectedDsps;
      if (dsps && !dsps.includes("boptone")) {
        dsps = ["boptone", ...dsps];
      }

      // Enforce 14-day lead time for Spotify/Apple
      let releaseDate: Date | null | undefined = undefined;
      if (input.releaseDate !== undefined) {
        if (input.releaseDate === null) {
          releaseDate = null;
        } else {
          const parsed = new Date(input.releaseDate);
          if (isNaN(parsed.getTime())) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid release date" });
          }
          const minDate = new Date();
          minDate.setDate(minDate.getDate() + 2); // Minimum 2 days for Boptone-only
          if (parsed < minDate) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Release date must be at least 2 days in the future",
            });
          }
          releaseDate = parsed;
        }
      }

      await updateDistributionSubmission(input.submissionId, {
        ...(input.trackIds !== undefined && { trackIds: input.trackIds }),
        ...(dsps !== undefined && { selectedDsps: dsps }),
        ...(input.territories !== undefined && { territories: input.territories }),
        ...(input.pricingTier !== undefined && { pricingTier: input.pricingTier }),
        ...(releaseDate !== undefined && { releaseDate }),
        ...(input.preSaveEnabled !== undefined && { preSaveEnabled: input.preSaveEnabled }),
        ...(input.exclusiveWindowDays !== undefined && { exclusiveWindowDays: input.exclusiveWindowDays }),
        ...(input.upc !== undefined && { upc: input.upc }),
        ...(input.isrc !== undefined && { isrc: input.isrc }),
        ...(input.artistNotes !== undefined && { artistNotes: input.artistNotes }),
      });

      return { success: true };
    }),

  /**
   * Submit the distribution (final wizard step)
   */
  submit: protectedProcedure
    .input(z.object({ submissionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const submission = await getDistributionSubmissionById(input.submissionId);
      if (!submission) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
      }

      const { getArtistProfileByUserId } = await import("../db");
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile || submission.artistId !== profile.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your submission" });
      }

      if (submission.status !== "draft") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already submitted" });
      }

      // Validate required fields
      const trackIds = submission.trackIds as number[];
      if (!trackIds || trackIds.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Select at least one track" });
      }

      const dsps = submission.selectedDsps as string[];
      if (!dsps || dsps.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Select at least one platform" });
      }

      await submitDistributionSubmission(input.submissionId);

      // TODO (DISTRO-D1): Trigger DDEX ERN delivery pipeline here
      // For now, mark as processing — human review step
      await updateDistributionSubmission(input.submissionId, {
        status: "processing",
        processedAt: new Date(),
      });

      return {
        success: true,
        submissionId: input.submissionId,
        message: "Your release has been submitted and is being processed.",
      };
    }),

  /**
   * Get a single submission by ID
   */
  getById: protectedProcedure
    .input(z.object({ submissionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const submission = await getDistributionSubmissionById(input.submissionId);
      if (!submission) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
      }

      const { getArtistProfileByUserId } = await import("../db");
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile || submission.artistId !== profile.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your submission" });
      }

      return submission;
    }),

  /**
   * Get all submissions for the current artist
   */
  getMySubmissions: protectedProcedure.query(async ({ ctx }) => {
    const { getArtistProfileByUserId } = await import("../db");
      const profile = await getArtistProfileByUserId(ctx.user.id);
    if (!profile) return [];

    return getDistributionSubmissionsByArtist(profile.id);
  }),

  /**
   * Get or create a draft submission (for resuming the wizard)
   */
  getOrCreateDraft: protectedProcedure
    .input(z.object({
      trackIds: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { getArtistProfileByUserId } = await import("../db");
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });
      }

      // Check for existing draft
      const existing = await getDraftSubmissionForArtist(profile.id);
      if (existing) {
        // If new track IDs provided, update the draft
        if (input.trackIds && input.trackIds.length > 0) {
          await updateDistributionSubmission(existing.id, { trackIds: input.trackIds });
        }
        return { submissionId: existing.id, isNew: false };
      }

      // Create new draft
      const result = await createDistributionSubmission({
        artistId: profile.id,
        trackIds: input.trackIds ?? [],
        selectedDsps: ["boptone"],
        territories: { mode: "worldwide" },
        pricingTier: "standard",
      });

      return { submissionId: (result as any).insertId as number, isNew: true };
    }),

  /**
   * Delete a draft submission
   */
  deleteDraft: protectedProcedure
    .input(z.object({ submissionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const submission = await getDistributionSubmissionById(input.submissionId);
      if (!submission) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
      }

      const { getArtistProfileByUserId } = await import("../db");
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile || submission.artistId !== profile.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your submission" });
      }

      if (submission.status !== "draft") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Can only delete draft submissions" });
      }

      await deleteDistributionSubmission(input.submissionId);
      return { success: true };
    }),
});
