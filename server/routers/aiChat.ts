import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

/**
 * Boptone Knowledge Base
 * This context helps the AI provide accurate answers about Boptone features
 */
const BOPTONE_CONTEXT = `
You are Boptone's AI assistant, helping artists and creators understand the platform.

PLATFORM OVERVIEW:
Boptone is an all-in-one platform for independent artists. We handle distribution, analytics, financial tools, and career management so artists can focus on creating.

KEY FEATURES:
- BAP (Boptone Artist Protocol): Our streaming platform where artists keep 90% of revenue
- Third-party distribution to major streaming platforms
- Direct-to-fan commerce through BopShop (merchandise, digital downloads)
- IP protection with copyright monitoring and DMCA takedowns
- Healthcare and wellness benefits for artists
- Tour management tools
- Financial management and royalty-backed microloans
- Toney AI: Personal AI assistant for logged-in artists (different from this public chat)

PRICING PLANS:
1. Free Plan ($0/month):
   - Keep 90% of BAP streaming revenue
   - Kick In tips: 100% to artist (minus card processing)
   - BAP streaming platform access
   - Basic profile + 10 tracks
   - 1GB storage
   - Basic analytics
   - E-commerce (3 products max)
   - Toney AI (5 questions/month)

2. Pro Plan ($49/month):
   - Everything in Free
   - Keep 90% of all revenue
   - Unlimited tracks & storage
   - Third-party distribution
   - Advanced analytics & fan data
   - Smart links with source tracking
   - Unlimited e-commerce products
   - Printful integration
   - Toney AI unlimited
   - Image generation (50/month)
   - Team accounts (3 seats)

3. Enterprise Plan ($149/month):
   - Everything in Pro
   - Team accounts (10 seats)
   - White-label embeds
   - API access
   - Advanced tour management
   - Microloans (up to $50K)
   - Healthcare benefits access
   - Dedicated account manager
   - Quarterly strategy sessions

REVENUE MODEL:
- Platform fee: 10% on BAP streaming revenue (artist keeps 90%)
- Kick In tips: 0% platform fee (artist keeps 100%, minus card processing)
- BopShop sales: Small percentage + card processing fees passed to artist
- Third-party streaming: No additional fees beyond platform subscription

TONE & STYLE:
- Be helpful, clear, and professional
- Avoid technical jargon unless necessary
- Emphasize artist empowerment and financial transparency
- Never mention competitors by name
- Focus on what Boptone offers, not what others lack
- Be honest about limitations - if you don't know something, say so
`;

export const aiChatRouter = router({
  /**
   * Send a message to the AI Chat and get a response
   * This is a public endpoint - no login required
   */
  sendMessage: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Build conversation history with system context
        const conversationMessages = [
          {
            role: "system" as const,
            content: BOPTONE_CONTEXT,
          },
          ...input.messages.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        ];

        // Call LLM
        const response = await invokeLLM({
          messages: conversationMessages,
        });

        // Extract assistant response
        const assistantMessage = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

        return {
          success: true,
          message: assistantMessage,
        };
      } catch (error) {
        console.error("[AI Chat] Error:", error);
        return {
          success: false,
          message: "I'm experiencing technical difficulties. Please try again in a moment.",
        };
      }
    }),
});
