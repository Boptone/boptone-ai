/**
 * server/routers/releases.ts
 * tRPC router for the DISTRO-F5 release metadata system.
 * Covers album-level container management required for DDEX ERN 4.1 delivery.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import {
  addTrackToRelease,
  confirmTerritoryRights,
  createRelease,
  createRightsAttestation,
  deleteRelease,
  getReleaseById,
  getRightsAttestationsByRelease,
  getReleasesByArtist,
  getReleaseWithFullMetadata,
  getTracksByRelease,
  getTerritoryDealsByRelease,
  publishRelease,
  removeTrackFromRelease,
  reorderReleaseTracks,
  replaceAllTerritoryDeals,
  setTerritoryDeal,
  updateRelease,
} from "../db/releases";

// ============================================================================
// Shared Zod schemas
// ============================================================================

const releaseTypeEnum = z.enum([
  "album", "single", "ep", "compilation", "soundtrack",
  "mixtape", "live", "remix", "ringtone", "other",
]);

const releaseStatusEnum = z.enum([
  "draft", "ready", "submitted", "distributed", "takedown",
]);

const pricingTierEnum = z.enum(["free", "standard", "premium"]);

const rightsTypeEnum = z.enum(["independent", "label_authorized", "split_rights"]);
const publishingHandledByEnum = z.enum(["self", "pro", "publisher", "label"]);

const createReleaseInput = z.object({
  title: z.string().min(1).max(500),
  releaseType: releaseTypeEnum.default("album"),
  rightsType: rightsTypeEnum.default("independent"),
  artworkUrl: z.string().url().optional(),
  artworkS3Key: z.string().optional(),
  globalReleaseDate: z.string().optional(), // ISO date string
  originalReleaseDate: z.string().optional(),
  labelName: z.string().max(500).optional(),
  upc: z.string().max(20).optional(),
  ean: z.string().max(20).optional(),
  grid: z.string().max(30).optional(),
  primaryGenre: z.string().max(100).optional(),
  secondaryGenre: z.string().max(100).optional(),
  pLineYear: z.number().int().min(1900).max(2100).optional(),
  pLineOwner: z.string().max(500).optional(),
  cLineYear: z.number().int().min(1900).max(2100).optional(),
  cLineOwner: z.string().max(500).optional(),
  parentalWarning: z.enum(["NotExplicit", "Explicit", "ExplicitContentEdited"]).default("NotExplicit").optional(),
  displayArtistName: z.string().max(500).optional(),
  notes: z.string().optional(),
});

const updateReleaseInput = createReleaseInput.partial().extend({
  id: z.number().int().positive(),
  status: releaseStatusEnum.optional(),
});

const territoryDealInput = z.object({
  releaseId: z.number().int().positive(),
  territory: z.string().min(2).max(2), // ISO 3166-1 alpha-2 or "WW"
  pricingTier: pricingTierEnum.default("standard"),
  streamingRights: z.boolean().default(true),
  downloadRights: z.boolean().default(false),
  syncRights: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  priceOverride: z.string().optional(),
  currency: z.string().max(3).default("USD"),
  notes: z.string().optional(),
  masterRightsConfirmed: z.boolean().default(false),
  publishingHandledBy: publishingHandledByEnum.default("self"),
});

// ============================================================================
// Router
// ============================================================================

export const releasesRouter = router({
  // ── Create a new release ──────────────────────────────────────────────────
  create: protectedProcedure
    .input(createReleaseInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Artist profile not found" });

      const { id } = await createRelease({
        artistId: profile.id,
        title: input.title,
        releaseType: input.releaseType,
        rightsType: input.rightsType,
        artworkUrl: input.artworkUrl ?? undefined,
        artworkS3Key: input.artworkS3Key ?? undefined,
        globalReleaseDate: input.globalReleaseDate ?? undefined,
        originalReleaseDate: input.originalReleaseDate ?? undefined,
        labelName: input.labelName ?? undefined,
        upc: input.upc ?? undefined,
        ean: input.ean ?? undefined,
        grid: input.grid ?? undefined,
        primaryGenre: input.primaryGenre ?? undefined,
        secondaryGenre: input.secondaryGenre ?? undefined,
        pLineYear: input.pLineYear ?? undefined,
        pLineOwner: input.pLineOwner ?? undefined,
        cLineYear: input.cLineYear ?? undefined,
        cLineOwner: input.cLineOwner ?? undefined,
        parentalWarning: input.parentalWarning ?? "NotExplicit",
        displayArtistName: input.displayArtistName ?? undefined,
        notes: input.notes ?? undefined,
        status: "draft",
      });

      return { id };
    }),

  // ── Update release metadata ───────────────────────────────────────────────
  update: protectedProcedure
    .input(updateReleaseInput)
    .mutation(async ({ ctx, input }) => {
      const { id, status, ...updates } = input;
      await assertOwnsRelease(ctx.user.id, id);
      await updateRelease(id, {
        ...updates,
        status: status ?? undefined,
        globalReleaseDate: updates.globalReleaseDate ?? undefined,
        originalReleaseDate: updates.originalReleaseDate ?? undefined,
      });
      return { success: true };
    }),

  // ── Get single release (with tracks + deals) ──────────────────────────────
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      await assertOwnsRelease(ctx.user.id, input.id);
      return await getReleaseWithFullMetadata(input.id);
    }),

  // ── List all releases for the current artist ──────────────────────────────
  getMy: protectedProcedure
    .input(z.object({
      status: releaseStatusEnum.optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const profile = await db.getArtistProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return await getReleasesByArtist(profile.id);
    }),

  // ── Delete a release ──────────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await assertOwnsRelease(ctx.user.id, input.id);
      await deleteRelease(input.id);
      return { success: true };
    }),

  // ── Mark release as ready for distribution ────────────────────────────────
  publish: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await assertOwnsRelease(ctx.user.id, input.id);
      // Validate minimum requirements for DDEX delivery
      const bundle = await getReleaseWithFullMetadata(input.id);
      if (!bundle) throw new TRPCError({ code: "NOT_FOUND" });
      const errors = validateReleaseForPublish(bundle);
      if (errors.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Release is not ready: ${errors.join("; ")}`,
        });
      }
      await publishRelease(input.id);
      return { success: true };
    }),

  // ── Track management ──────────────────────────────────────────────────────
  addTrack: protectedProcedure
    .input(z.object({
      releaseId: z.number().int().positive(),
      trackId: z.number().int().positive(),
      discNumber: z.number().int().min(1).default(1),
      sequenceNumber: z.number().int().min(1),
      isBonus: z.boolean().default(false),
      isHidden: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertOwnsRelease(ctx.user.id, input.releaseId);
      await addTrackToRelease({
        releaseId: input.releaseId,
        trackId: input.trackId,
        discNumber: input.discNumber,
        sequenceNumber: input.sequenceNumber,
        isBonus: input.isBonus ? 1 : 0,
        isHidden: input.isHidden ? 1 : 0,
      });
      return { success: true };
    }),

  removeTrack: protectedProcedure
    .input(z.object({
      releaseId: z.number().int().positive(),
      trackId: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertOwnsRelease(ctx.user.id, input.releaseId);
      await removeTrackFromRelease(input.releaseId, input.trackId);
      return { success: true };
    }),

  reorderTracks: protectedProcedure
    .input(z.object({
      releaseId: z.number().int().positive(),
      order: z.array(z.object({
        trackId: z.number().int().positive(),
        discNumber: z.number().int().min(1),
        sequenceNumber: z.number().int().min(1),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertOwnsRelease(ctx.user.id, input.releaseId);
      await reorderReleaseTracks(input.releaseId, input.order);
      return { success: true };
    }),

  // ── Territory deals ───────────────────────────────────────────────────────
  setTerritoryDeal: protectedProcedure
    .input(territoryDealInput)
    .mutation(async ({ ctx, input }) => {
      await assertOwnsRelease(ctx.user.id, input.releaseId);
      await setTerritoryDeal({
        ...input,
        streamingRights: input.streamingRights ? 1 : 0,
        downloadRights: input.downloadRights ? 1 : 0,
        syncRights: input.syncRights ? 1 : 0,
        startDate: input.startDate ?? undefined,
        endDate: input.endDate ?? undefined,
        masterRightsConfirmed: input.masterRightsConfirmed ? 1 : 0,
        publishingHandledBy: input.publishingHandledBy,
      });
      return { success: true };
    }),

  replaceAllDeals: protectedProcedure
    .input(z.object({
      releaseId: z.number().int().positive(),
      deals: z.array(territoryDealInput.omit({ releaseId: true })),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertOwnsRelease(ctx.user.id, input.releaseId);
      await replaceAllTerritoryDeals(
        input.releaseId,
        input.deals.map(d => ({
          ...d,
          releaseId: input.releaseId,
          streamingRights: d.streamingRights ? 1 : 0,
          downloadRights: d.downloadRights ? 1 : 0,
          syncRights: d.syncRights ? 1 : 0,
          startDate: d.startDate ?? undefined,
          endDate: d.endDate ?? undefined,
          masterRightsConfirmed: d.masterRightsConfirmed ? 1 : 0,
          publishingHandledBy: d.publishingHandledBy,
        }))
      );
      return { success: true };
    }),

  // ── Confirm rights for a single territory ──────────────────────────────────────────
  confirmTerritoryRights: protectedProcedure
    .input(z.object({
      releaseId: z.number().int().positive(),
      territory: z.string().min(2).max(10),
      publishingHandledBy: publishingHandledByEnum.default("self"),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertOwnsRelease(ctx.user.id, input.releaseId);
      await confirmTerritoryRights(input.releaseId, input.territory, input.publishingHandledBy);
      return { success: true };
    }),

  // ── Record a legal rights attestation (called on distribution submission) ──────
  attestRights: protectedProcedure
    .input(z.object({
      releaseId: z.number().int().positive(),
      rightsType: rightsTypeEnum,
      territoriesCovered: z.array(z.string()).min(1),
      // The frontend sends the full attestation text it displayed to the user
      attestationText: z.string().min(100),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertOwnsRelease(ctx.user.id, input.releaseId);

      // Capture IP and user agent from the request for the audit trail
      const ipAddress =
        (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        ctx.req.socket?.remoteAddress ||
        "unknown";
      const userAgent = (ctx.req.headers["user-agent"] as string) || "unknown";

      const { id } = await createRightsAttestation({
        releaseId: input.releaseId,
        userId: ctx.user.id,
        rightsType: input.rightsType,
        territoriesCovered: JSON.stringify(input.territoriesCovered),
        attestationText: input.attestationText,
        ipAddress: ipAddress.slice(0, 45),
        userAgent: userAgent.slice(0, 500),
        attestationVersion: "1.0",
      });

      return { attestationId: id };
    }),

  // ── Get rights attestation history for a release ────────────────────────────
  getRightsHistory: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      await assertOwnsRelease(ctx.user.id, input.id);
      return await getRightsAttestationsByRelease(input.id);
    }),

  // ── DDEX readiness check ──────────────────────────────────────────────────
  getDdexReadiness: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      await assertOwnsRelease(ctx.user.id, input.id);
      const bundle = await getReleaseWithFullMetadata(input.id);
      if (!bundle) throw new TRPCError({ code: "NOT_FOUND" });
      const errors = validateReleaseForPublish(bundle);
      const warnings = getPublishWarnings(bundle);
      const unconfirmedTerritories = bundle.deals
        .filter((d) => !d.masterRightsConfirmed)
        .map((d) => d.territory ?? "unknown");
      return {
        ready: errors.length === 0,
        errors,
        warnings,
        trackCount: bundle.tracks.length,
        dealCount: bundle.deals.length,
        rightsType: bundle.release.rightsType,
        unconfirmedTerritories,
        hasRightsAttestation: !!bundle.latestAttestation,
        lastAttestedAt: bundle.latestAttestation?.attestedAt ?? null,
      };
    }),
});

// ============================================================================
// Helpers
// ============================================================================

async function assertOwnsRelease(userId: number, releaseId: number) {
  const profile = await db.getArtistProfileByUserId(userId);
  if (!profile) throw new TRPCError({ code: "UNAUTHORIZED" });
  const release = await getReleaseById(releaseId);
  if (!release) throw new TRPCError({ code: "NOT_FOUND" });
  if (release.artistId !== profile.id) throw new TRPCError({ code: "FORBIDDEN" });
  return release;
}

/** Minimum DDEX ERN 4.1 requirements + DISTRO-RIGHTS territory rights gating */
export function validateReleaseForPublish(bundle: {
  release: {
    title: string | null;
    upc: string | null;
    pLineYear: number | null;
    pLineOwner: string | null;
    cLineYear: number | null;
    cLineOwner: string | null;
    artworkUrl: string | null;
    rightsType?: string | null;
  };
  tracks: unknown[];
  deals: Array<{ masterRightsConfirmed?: number | null; territory?: string }>;
  latestAttestation?: { attestedAt: Date | null } | null;
}): string[] {
  const errors: string[] = [];
  const r = bundle.release;
  if (!r.title) errors.push("Release title is required");
  if (!r.artworkUrl) errors.push("Cover artwork is required");
  if (!r.cLineYear || !r.cLineOwner) errors.push("Composition copyright (\u00a9 year and holder) is required");
  if (!r.pLineYear || !r.pLineOwner) errors.push("Master copyright (\u2117 year and holder) is required");
  if (bundle.tracks.length === 0) errors.push("At least one track must be added to the release");
  if (bundle.deals.length === 0) errors.push("At least one territory deal must be configured");

  // DISTRO-RIGHTS: Every territory deal must have master rights confirmed
  const unconfirmedTerritories = bundle.deals
    .filter((d) => !d.masterRightsConfirmed)
    .map((d) => d.territory ?? "unknown");
  if (unconfirmedTerritories.length > 0) {
    errors.push(
      `Master recording rights not confirmed for: ${unconfirmedTerritories.join(", ")}. ` +
      `You must confirm you hold distribution rights in each territory before delivery.`
    );
  }

  // DISTRO-RIGHTS: A signed rights attestation must exist for this release
  if (!bundle.latestAttestation) {
    errors.push(
      "Rights declaration not completed. You must agree to the Boptone Distribution Rights Declaration before this release can be submitted."
    );
  }

  return errors;
}

export function getPublishWarnings(bundle: {
  release: { upc: string | null; labelName: string | null; primaryGenre: string | null; globalReleaseDate: string | null };
  tracks: unknown[];
  deals: unknown[];
}): string[] {
  const warnings: string[] = [];
  const r = bundle.release;
  if (!r.upc) warnings.push("UPC/EAN barcode not set — will be auto-assigned by some DSPs");
  if (!r.labelName) warnings.push("Record label not set — will appear as 'Independent'");
  if (!r.primaryGenre) warnings.push("Primary genre not set — may affect DSP categorization");
  if (!r.globalReleaseDate) warnings.push("Release date not set — will default to submission date");
  return warnings;
}
