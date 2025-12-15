import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { 
  calculateLoanEligibility, 
  applyForLoan, 
  getArtistLoans, 
  getActiveLoan,
  getLoanRepayments 
} from "../microloans";
import { getArtistProfileByUserId } from "../db";

export const microloansRouter = router({
  // Check loan eligibility
  checkEligibility: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getArtistProfileByUserId(ctx.user.id);
    if (!profile) {
      return { eligible: false, reasons: ["No artist profile found"] };
    }
    return calculateLoanEligibility(profile.id);
  }),

  // Apply for a loan
  submitApplication: protectedProcedure
    .input(z.object({
      amount: z.number().min(50).max(750),
      purpose: z.enum(["emergency", "production", "marketing", "equipment", "other"]),
      purposeDescription: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getArtistProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new Error("No artist profile found");
      }
      return applyForLoan(
        profile.id,
        ctx.user.id,
        input.amount,
        input.purpose,
        input.purposeDescription
      );
    }),

  // Get all loans for current artist
  getMyLoans: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getArtistProfileByUserId(ctx.user.id);
    if (!profile) return [];
    return getArtistLoans(profile.id);
  }),

  // Get active loan
  getActiveLoan: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getArtistProfileByUserId(ctx.user.id);
    if (!profile) return null;
    return getActiveLoan(profile.id);
  }),

  // Get repayment history for a specific loan
  getRepayments: protectedProcedure
    .input(z.object({ loanId: z.number() }))
    .query(async ({ input }) => {
      return getLoanRepayments(input.loanId);
    }),

  // Get loan summary stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getArtistProfileByUserId(ctx.user.id);
    if (!profile) {
      return {
        totalBorrowed: 0,
        totalRepaid: 0,
        activeLoans: 0,
        completedLoans: 0
      };
    }
    
    const loans = await getArtistLoans(profile.id);
    
    return {
      totalBorrowed: loans.reduce((sum, l) => sum + parseFloat(l.approvedAmount || "0"), 0),
      totalRepaid: loans.reduce((sum, l) => sum + parseFloat(l.totalRepaid || "0"), 0),
      activeLoans: loans.filter(l => l.status === "active").length,
      completedLoans: loans.filter(l => l.status === "repaid").length
    };
  })
});
