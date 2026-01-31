import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./trpc";
import { storagePut } from "../storage";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  uploadFile: protectedProcedure
    .input(
      z.object({
        fileKey: z.string(),
        data: z.string(), // base64
        contentType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Convert base64 to buffer
      const buffer = Buffer.from(input.data, 'base64');
      
      // Upload to S3
      const result = await storagePut(input.fileKey, buffer, input.contentType);
      
      return result;
    }),
});
