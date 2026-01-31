/**
 * POD (Print-on-Demand) tRPC Router
 * 
 * Handles POD provider connections, product catalog browsing, and order fulfillment
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getPodProviders,
  getPodProviderById,
  getPodProviderByName,
  getArtistPodAccounts,
  getArtistPodAccount,
  createArtistPodAccount,
  updateArtistPodAccount,
  disconnectArtistPodAccount,
} from "../db/pod";
import { getArtistProfileByUserId } from "../db";
import { createPrintfulClient } from "../integrations/printful";

export const podRouter = router({
  /**
   * Get all available POD providers
   */
  getProviders: protectedProcedure.query(async () => {
    return getPodProviders();
  }),

  /**
   * Get artist's connected POD accounts
   */
  getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getArtistProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Artist profile required",
      });
    }

    const accounts = await getArtistPodAccounts(profile.id);
    
    // Fetch provider details for each account
    const accountsWithProviders = await Promise.all(
      accounts.map(async (account) => {
        const provider = await getPodProviderById(account.providerId);
        return {
          ...account,
          provider,
        };
      })
    );

    return accountsWithProviders;
  }),

  /**
   * Connect to Printful account
   */
  connectPrintful: protectedProcedure
    .input(
      z.object({
        apiToken: z.string().min(1, "API token is required"),
        storeId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Artist profile required",
        });
      }

      // Get Printful provider
      const provider = await getPodProviderByName("printful");
      if (!provider) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Printful provider not found",
        });
      }

      // Verify API token by fetching store info
      try {
        const client = createPrintfulClient(input.apiToken, input.storeId);
        const storeInfo = await client.getStoreInfo();

        // Check if already connected
        const existingAccount = await getArtistPodAccount(
          profile.id,
          provider.id
        );

        if (existingAccount) {
          // Update existing connection
          await updateArtistPodAccount(existingAccount.id, {
            apiToken: input.apiToken,
            providerStoreId: input.storeId || (storeInfo.result as any)?.id?.toString(),
            status: "active",
            lastSyncedAt: new Date(),
            metadata: {
              storeUrl: (storeInfo.result as any)?.website,
              email: (storeInfo.result as any)?.email,
            },
          });

          return {
            success: true,
            accountId: existingAccount.id,
            message: "Printful account updated successfully",
          };
        } else {
          // Create new connection
          const result = await createArtistPodAccount({
            artistId: profile.id,
            providerId: provider.id,
            apiToken: input.apiToken,
            providerStoreId: input.storeId || (storeInfo.result as any)?.id?.toString(),
            status: "active",
            lastSyncedAt: new Date(),
            metadata: {
              storeUrl: (storeInfo.result as any)?.website,
              email: (storeInfo.result as any)?.email,
            },
          });

          return {
            success: true,
            accountId: (result as any).insertId,
            message: "Printful account connected successfully",
          };
        }
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to connect to Printful: ${error.message}`,
        });
      }
    }),

  /**
   * Disconnect POD account
   */
  disconnectAccount: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Artist profile required",
        });
      }

      // Verify account belongs to artist
      const account = await getArtistPodAccount(
        profile.id,
        input.accountId
      );

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      await disconnectArtistPodAccount(input.accountId);

      return {
        success: true,
        message: "Account disconnected successfully",
      };
    }),

  /**
   * Test connection to POD provider
   */
  testConnection: protectedProcedure
    .input(
      z.object({
        providerId: z.number(),
        apiToken: z.string(),
        storeId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const provider = await getPodProviderById(input.providerId);
      if (!provider) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Provider not found",
        });
      }

      try {
        if (provider.name === "printful") {
          const client = createPrintfulClient(input.apiToken, input.storeId);
          const storeInfo = await client.getStoreInfo();
          
          return {
            success: true,
            storeInfo: {
              name: (storeInfo.result as any)?.name || null,
              website: (storeInfo.result as any)?.website || null,
              email: (storeInfo.result as any)?.email || null,
            },
          };
        }

        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: `Provider ${provider.name} not yet supported`,
        });
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Connection test failed: ${error.message}`,
        });
      }
    }),
});
