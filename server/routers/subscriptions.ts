import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getUserSubscription,
  changePlan,
  calculateProratedCredit,
  getSubscriptionHistory,
} from "../subscriptions";

export const subscriptionsRouter = router({
  /**
   * Get current user's subscription
   */
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await getUserSubscription(ctx.user.id);
    return subscription;
  }),

  /**
   * Get subscription change history
   */
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const history = await getSubscriptionHistory(ctx.user.id);
    return history;
  }),

  /**
   * Preview plan change with proration calculation
   */
  previewChange: protectedProcedure
    .input(
      z.object({
        newPlan: z.enum(["creator", "pro", "studio", "label"]),
        newBillingCycle: z.enum(["monthly", "annual"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const currentSub = await getUserSubscription(ctx.user.id);
      
      if (!currentSub) {
        return {
          currentPlan: "creator",
          currentBillingCycle: "monthly",
          newPlan: input.newPlan,
          newBillingCycle: input.newBillingCycle,
          proratedCredit: 0,
          daysRemaining: 0,
        };
      }

      const now = new Date();
      const periodEnd = currentSub.currentPeriodEnd ? new Date(currentSub.currentPeriodEnd) : now;
      const periodStart = currentSub.currentPeriodStart ? new Date(currentSub.currentPeriodStart) : now;
      
      const daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));

      const proratedCredit = calculateProratedCredit({
        currentPlan: currentSub.plan,
        currentBillingCycle: currentSub.billingCycle,
        newPlan: input.newPlan,
        newBillingCycle: input.newBillingCycle,
        daysRemainingInPeriod: daysRemaining,
        totalDaysInPeriod: totalDays,
      });

      return {
        currentPlan: currentSub.plan,
        currentBillingCycle: currentSub.billingCycle,
        newPlan: input.newPlan,
        newBillingCycle: input.newBillingCycle,
        proratedCredit,
        daysRemaining,
      };
    }),

  /**
   * Change subscription plan
   */
  changePlan: protectedProcedure
    .input(
      z.object({
        newPlan: z.enum(["creator", "pro", "studio", "label"]),
        newBillingCycle: z.enum(["monthly", "annual"]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await changePlan({
        userId: ctx.user.id,
        newPlan: input.newPlan,
        newBillingCycle: input.newBillingCycle,
        reason: input.reason,
      });

      return result;
    }),
});
