import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { invokeLLM, Message } from "../_core/llm";
import { aiOrchestrator } from "../aiOrchestrator";

/**
 * Toney Chatbot Router
 * 
 * Connects Toney to LLM with full artist context awareness and
 * capability to trigger actions across the platform.
 */

// System prompt for Toney
const TONEY_SYSTEM_PROMPT = `You are Toney, the AI assistant for Boptone - the complete operating system for artists.

CORE IDENTITY:
- You are helpful, knowledgeable, and genuinely care about artists' success
- You speak in a warm, conversational tone - like a trusted advisor, not a corporate bot
- You have deep knowledge of the music industry, artist workflows, and Boptone's features
- You can take actions on behalf of artists (generate workflows, check balances, etc.)

BOPTONE PHILOSOPHY:
- Artists deserve 90% of revenue (Boptone takes only 10%)
- Trust and transparency are paramount
- Automation should empower artists, not replace their creativity
- Every feature exists to help artists focus on their art, not business logistics

YOUR CAPABILITIES:
1. Answer questions about Boptone features
2. Check artist earnings and payout status
3. Generate workflows from natural language descriptions
4. Provide career advice and growth strategies
5. Troubleshoot issues and guide artists through the platform
6. Proactively suggest optimizations based on artist data

WORKFLOW GENERATION:
When an artist describes an automation they want (e.g., "thank fans who tip over $50"), you can:
1. Acknowledge their request
2. Explain what the workflow will do
3. Offer to generate it immediately by saying: "I can create that workflow for you right now. Would you like me to generate it?"
4. If they agree, respond with: "GENERATE_WORKFLOW: [their description]"

The system will intercept this command and trigger the workflow generator.

CONVERSATION GUIDELINES:
- Keep responses concise (2-3 paragraphs max)
- Use specific numbers when discussing earnings/metrics
- Suggest actionable next steps
- If you can take an action (like generating a workflow), offer to do it
- Never mention competitors or compare Boptone to other platforms
- Avoid spiritual/warrior language - stay practical and accessible

CONTEXT AWARENESS:
You have access to the artist's complete context including:
- Current earnings balance and payout schedule
- Active workflows and their performance
- Recent platform activity
- Goals and pain points

Use this context to provide personalized, relevant responses.`;

export const toneyRouter = router({
  /**
   * Send message to Toney and get AI response
   */
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      
      // Get artist context from AIOrchestrator
      const artistContext = await aiOrchestrator.getArtistContext(userId);
      
      // Enrich context with latest data
      await aiOrchestrator.enrichContext(userId);
      
      // Build context-aware system prompt
      const contextPrompt = artistContext ? `
CURRENT ARTIST CONTEXT:
- Name: ${artistContext.artistName}
- Available Balance: $${artistContext.revenue.available.toFixed(2)}
- Pending Balance: $${artistContext.revenue.pending.toFixed(2)}
- Payout Schedule: ${artistContext.payoutSchedule}
- Active Workflows: ${artistContext.activeWorkflows.length}
- Career Stage: ${artistContext.careerStage}

Use this context to provide personalized responses.
` : '';
      
      // Build conversation history
      const messages: Message[] = [
        { role: "system", content: TONEY_SYSTEM_PROMPT + contextPrompt },
      ];
      
      // Add conversation history
      if (input.conversationHistory) {
        messages.push(...input.conversationHistory.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })));
      }
      
      // Add current message
      messages.push({ role: "user", content: input.message });
      
      // Call LLM
      const response = await invokeLLM({
        messages,
      });
      
      const assistantMessage = response.choices[0].message.content;
      const assistantText = typeof assistantMessage === 'string' 
        ? assistantMessage 
        : Array.isArray(assistantMessage) 
          ? assistantMessage.map(c => 'text' in c ? c.text : '').join('') 
          : '';
      
      // Update artist context with conversation
      if (artistContext) {
        const updatedHistory = [
          ...(artistContext.conversationHistory || []),
          { role: "user", content: input.message },
          { role: "assistant", content: assistantText },
        ].slice(-20); // Keep last 20 messages
        
        await aiOrchestrator.updateContext(userId, {
          conversationHistory: updatedHistory,
          lastActive: new Date(),
          recentActions: [
            ...(artistContext.recentActions || []),
            `Asked Toney: "${input.message.substring(0, 50)}..."`,
          ].slice(-10),
        });
      }
      
      // Publish event
      await aiOrchestrator.publishEvent({
        type: "toney_conversation",
        userId,
        data: { message: input.message, response: assistantText },
        timestamp: new Date(),
      });
      
      return {
        message: assistantText,
        timestamp: new Date().toISOString(),
      };
    }),
  
  /**
   * Get artist context for Toney UI
   */
  getContext: protectedProcedure
    .query(async ({ ctx }) => {
      const context = await aiOrchestrator.getArtistContext(ctx.user.id);
      return context;
    }),
  
  /**
   * Get pending recommendations for artist
   */
  getRecommendations: protectedProcedure
    .query(async ({ ctx }) => {
      const recommendations = await aiOrchestrator.getPendingRecommendations(ctx.user.id);
      return recommendations;
    }),
  
  /**
   * Generate proactive recommendations
   */
  generateRecommendations: protectedProcedure
    .mutation(async ({ ctx }) => {
      const recommendations = await aiOrchestrator.generateRecommendations(ctx.user.id);
      
      // Save recommendations to database
      for (const rec of recommendations) {
        await aiOrchestrator.saveRecommendation(ctx.user.id, rec);
      }
      
      return recommendations;
    }),
  
  /**
   * Execute capability through Toney
   */
  executeCapability: protectedProcedure
    .input(
      z.object({
        capability: z.string(),
        params: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await aiOrchestrator.executeCapability(
        input.capability,
        ctx.user.id,
        input.params
      );
      
      return result;
    }),
});
