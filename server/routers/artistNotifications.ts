import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { notifyOwner } from '../_core/notification';

/**
 * Artist Tax Threshold Notifications
 * 
 * Monitors annual tip income and notifies artists when approaching tax thresholds:
 * - $15,000: Warning notification (78% of $19k threshold)
 * - $18,000: Urgent notification (95% of $19k threshold)
 * - $19,000: Critical notification (at IRS gift tax reporting threshold)
 */

const TAX_THRESHOLDS = {
  WARNING: 15000, // 78% of $19k
  URGENT: 18000,  // 95% of $19k
  CRITICAL: 19000, // IRS annual gift exclusion
};

export const artistNotificationsRouter = router({
  /**
   * Get artist's annual tip totals and tax threshold status
   */
  getAnnualTipStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Get tips received in current calendar year (as artist)
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(`${currentYear}-01-01T00:00:00Z`);
    const yearEnd = new Date(`${currentYear}-12-31T23:59:59Z`);

    const annualTipsResult = await db.execute(
      `SELECT COALESCE(SUM(amount), 0) as total FROM tips 
       WHERE artistId = ${ctx.user.id} 
       AND createdAt >= '${yearStart.toISOString()}' 
       AND createdAt <= '${yearEnd.toISOString()}'`
    );

    const annualTotal = Number((annualTipsResult[0] as any)?.total || 0) / 100; // Convert cents to dollars

    // Determine threshold status
    let thresholdStatus: 'safe' | 'warning' | 'urgent' | 'critical' = 'safe';
    let message = '';
    let percentOfLimit = (annualTotal / TAX_THRESHOLDS.CRITICAL) * 100;

    if (annualTotal >= TAX_THRESHOLDS.CRITICAL) {
      thresholdStatus = 'critical';
      message = `You've received $${annualTotal.toFixed(2)} in tips this year, which meets or exceeds the $19,000 IRS annual gift exclusion. Consult a tax professional about reporting requirements.`;
    } else if (annualTotal >= TAX_THRESHOLDS.URGENT) {
      thresholdStatus = 'urgent';
      message = `You've received $${annualTotal.toFixed(2)} in tips this year. You're approaching the $19,000 IRS gift tax reporting threshold. Consider consulting a tax professional.`;
    } else if (annualTotal >= TAX_THRESHOLDS.WARNING) {
      thresholdStatus = 'warning';
      message = `You've received $${annualTotal.toFixed(2)} in tips this year. Be mindful that the IRS annual gift exclusion is $19,000. Tips above this amount may have tax implications.`;
    } else {
      message = `You've received $${annualTotal.toFixed(2)} in tips this year. You're well below the $19,000 IRS threshold.`;
    }

    return {
      annualTotal,
      thresholdStatus,
      message,
      percentOfLimit: Math.round(percentOfLimit),
      thresholds: TAX_THRESHOLDS,
      remainingBeforeWarning: Math.max(0, TAX_THRESHOLDS.WARNING - annualTotal),
      remainingBeforeUrgent: Math.max(0, TAX_THRESHOLDS.URGENT - annualTotal),
      remainingBeforeCritical: Math.max(0, TAX_THRESHOLDS.CRITICAL - annualTotal),
    };
  }),

  /**
   * Get detailed tip history for tax reporting
   */
  getTaxReportData: protectedProcedure
    .input(
      z.object({
        year: z.number().min(2020).max(2030).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const year = input.year || new Date().getFullYear();
      const yearStart = new Date(`${year}-01-01T00:00:00Z`);
      const yearEnd = new Date(`${year}-12-31T23:59:59Z`);

      // Get all tips received by this artist in the specified year
      const tipsResult = await db.execute(
        `SELECT 
          id, 
          fanId, 
          amount, 
          message, 
          isAnonymous, 
          createdAt,
          paymentIntentId
         FROM tips 
         WHERE artistId = ${ctx.user.id} 
         AND createdAt >= '${yearStart.toISOString()}' 
         AND createdAt <= '${yearEnd.toISOString()}'
         ORDER BY createdAt DESC`
      );

      const tipsArray = Array.isArray(tipsResult[0]) ? tipsResult[0] : [];
      const tips = tipsArray.map((tip: any) => ({
        id: tip.id,
        fanId: tip.isAnonymous ? null : tip.fanId,
        amount: Number(tip.amount) / 100, // Convert cents to dollars
        message: tip.message,
        isAnonymous: Boolean(tip.isAnonymous),
        date: tip.createdAt,
        paymentIntentId: tip.paymentIntentId,
      }));

      const totalAmount = tips.reduce((sum, tip) => sum + tip.amount, 0);

      return {
        year,
        tips,
        totalAmount,
        tipCount: tips.length,
        averageTipAmount: tips.length > 0 ? totalAmount / tips.length : 0,
      };
    }),

  /**
   * Manually trigger tax threshold check and notification
   * (Also runs automatically via webhook after each tip)
   */
  checkAndNotifyThreshold: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Get annual tip status
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(`${currentYear}-01-01T00:00:00Z`);
    const yearEnd = new Date(`${currentYear}-12-31T23:59:59Z`);

    const annualTipsResult = await db.execute(
      `SELECT COALESCE(SUM(amount), 0) as total FROM tips 
       WHERE artistId = ${ctx.user.id} 
       AND createdAt >= '${yearStart.toISOString()}' 
       AND createdAt <= '${yearEnd.toISOString()}'`
    );

    const annualTotal = Number((annualTipsResult[0] as any)?.total || 0) / 100;

    // Check if notification should be sent
    let shouldNotify = false;
    let notificationLevel = '';

    if (annualTotal >= TAX_THRESHOLDS.CRITICAL) {
      shouldNotify = true;
      notificationLevel = 'CRITICAL';
    } else if (annualTotal >= TAX_THRESHOLDS.URGENT) {
      shouldNotify = true;
      notificationLevel = 'URGENT';
    } else if (annualTotal >= TAX_THRESHOLDS.WARNING) {
      shouldNotify = true;
      notificationLevel = 'WARNING';
    }

    if (shouldNotify) {
      // Send notification to artist
      const notificationSent = await notifyOwner({
        title: `Tax Threshold Alert: ${notificationLevel}`,
        content: `Artist ${ctx.user.name} (ID: ${ctx.user.id}) has received $${annualTotal.toFixed(2)} in tips this year (${currentYear}). Threshold: ${notificationLevel} ($${TAX_THRESHOLDS[notificationLevel as keyof typeof TAX_THRESHOLDS]}).`,
      });

      return {
        notified: true,
        level: notificationLevel,
        annualTotal,
        notificationSent,
      };
    }

    return {
      notified: false,
      level: 'SAFE',
      annualTotal,
    };
  }),
});
