import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "./db";
import { artistLoans, loanRepayments, artistProfiles, bapTracks } from "../drizzle/schema";

const MAX_LOAN_AMOUNT = 750;
const ORIGINATION_FEE_PERCENT = 0.05; // 5%
const DEFAULT_REPAYMENT_PERCENT = 15; // 15% of royalties

/**
 * Calculate artist eligibility for micro-loan
 * Based on: account age, earnings history, existing loans
 */
export async function calculateLoanEligibility(artistProfileId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get artist profile
  const [profile] = await db.select().from(artistProfiles).where(eq(artistProfiles.id, artistProfileId));
  if (!profile) return null;

  // Calculate account age in months
  const accountAgeMonths = Math.floor(
    (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  // Get 3-month average earnings from BAP streams
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  // Simplified earnings calculation from tracks
  const streamEarnings = await db.select({
    total: sql<string>`COALESCE(SUM(totalEarnings), 0)`
  }).from(bapTracks).where(
    eq(bapTracks.artistId, artistProfileId)
  );

  const totalEarnings = parseFloat(streamEarnings[0]?.total || "0");
  const monthlyEarningsAvg = totalEarnings / 3;

  // Check for existing active loans
  const existingLoans = await db.select().from(artistLoans).where(
    and(
      eq(artistLoans.artistProfileId, artistProfileId),
      sql`${artistLoans.status} IN ('pending', 'approved', 'active')`
    )
  );

  const hasActiveLoan = existingLoans.length > 0;

  // Calculate risk score (1-100, higher = lower risk)
  let riskScore = 50; // Base score
  
  // Account age bonus (up to +20)
  riskScore += Math.min(accountAgeMonths * 2, 20);
  
  // Earnings bonus (up to +25)
  if (monthlyEarningsAvg >= 100) riskScore += 25;
  else if (monthlyEarningsAvg >= 50) riskScore += 15;
  else if (monthlyEarningsAvg >= 20) riskScore += 10;
  
  // Existing loan penalty
  if (hasActiveLoan) riskScore -= 30;

  // Calculate max eligible amount based on earnings
  // Max loan = 3x monthly earnings, capped at $750
  const maxEligibleAmount = Math.min(monthlyEarningsAvg * 3, MAX_LOAN_AMOUNT);

  return {
    eligible: !hasActiveLoan && accountAgeMonths >= 1 && monthlyEarningsAvg >= 10,
    maxAmount: Math.max(0, maxEligibleAmount),
    monthlyEarningsAvg,
    accountAgeMonths,
    riskScore: Math.max(0, Math.min(100, riskScore)),
    hasActiveLoan,
    reasons: getEligibilityReasons(!hasActiveLoan, accountAgeMonths, monthlyEarningsAvg)
  };
}

function getEligibilityReasons(noActiveLoan: boolean, accountAge: number, earnings: number): string[] {
  const reasons: string[] = [];
  if (!noActiveLoan) reasons.push("You have an existing active loan");
  if (accountAge < 1) reasons.push("Account must be at least 1 month old");
  if (earnings < 10) reasons.push("Need at least $10/month average earnings");
  return reasons;
}

/**
 * Apply for a micro-loan
 */
export async function applyForLoan(
  artistProfileId: number,
  userId: number,
  amount: number,
  purpose: "emergency" | "production" | "marketing" | "equipment" | "other",
  purposeDescription?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check eligibility
  const eligibility = await calculateLoanEligibility(artistProfileId);
  if (!eligibility?.eligible) {
    throw new Error("Not eligible for a loan: " + (eligibility?.reasons.join(", ") || "Unknown reason"));
  }

  if (amount > eligibility.maxAmount) {
    throw new Error(`Maximum eligible amount is $${eligibility.maxAmount.toFixed(2)}`);
  }

  if (amount > MAX_LOAN_AMOUNT) {
    throw new Error(`Maximum loan amount is $${MAX_LOAN_AMOUNT}`);
  }

  // Calculate fees
  const originationFee = amount * ORIGINATION_FEE_PERCENT;
  const totalOwed = amount + originationFee;

  // Create loan application
  await db.insert(artistLoans).values({
    artistProfileId,
    userId,
    requestedAmount: amount.toFixed(2),
    purpose,
    purposeDescription,
    originationFee: originationFee.toFixed(2),
    repaymentPercent: DEFAULT_REPAYMENT_PERCENT.toFixed(2),
    totalOwed: totalOwed.toFixed(2),
    remainingBalance: totalOwed.toFixed(2),
    monthlyEarningsAvg: eligibility.monthlyEarningsAvg.toFixed(2),
    accountAgeMonths: eligibility.accountAgeMonths,
    riskScore: eligibility.riskScore,
    status: "pending"
  });

  return { success: true, totalOwed, originationFee };
}

/**
 * Get all loans for an artist
 */
export async function getArtistLoans(artistProfileId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(artistLoans)
    .where(eq(artistLoans.artistProfileId, artistProfileId))
    .orderBy(desc(artistLoans.createdAt));
}

/**
 * Get active loan for an artist (if any)
 */
export async function getActiveLoan(artistProfileId: number) {
  const db = await getDb();
  if (!db) return null;

  const [loan] = await db.select().from(artistLoans)
    .where(and(
      eq(artistLoans.artistProfileId, artistProfileId),
      eq(artistLoans.status, "active")
    ))
    .limit(1);

  return loan || null;
}

/**
 * Process automatic repayment from royalties
 * Called whenever artist receives payment from any source
 */
export async function processLoanRepayment(
  artistProfileId: number,
  paymentAmount: number,
  source: "bap_streams" | "kick_in" | "backing" | "merch" | "manual",
  sourceTransactionId?: string
) {
  const db = await getDb();
  if (!db) return null;

  // Get active loan
  const loan = await getActiveLoan(artistProfileId);
  if (!loan) return null; // No active loan, nothing to repay

  // Calculate repayment amount (percentage of payment)
  const repaymentPercent = parseFloat(loan.repaymentPercent || "15") / 100;
  const repaymentAmount = Math.min(
    paymentAmount * repaymentPercent,
    parseFloat(loan.remainingBalance || "0")
  );

  if (repaymentAmount <= 0) return null;

  const balanceBefore = parseFloat(loan.remainingBalance || "0");
  const balanceAfter = balanceBefore - repaymentAmount;
  const newTotalRepaid = parseFloat(loan.totalRepaid || "0") + repaymentAmount;

  // Record repayment
  await db.insert(loanRepayments).values({
    loanId: loan.id,
    artistProfileId,
    amount: repaymentAmount.toFixed(2),
    source,
    sourceTransactionId,
    balanceBefore: balanceBefore.toFixed(2),
    balanceAfter: balanceAfter.toFixed(2)
  });

  // Update loan balance
  const isFullyRepaid = balanceAfter <= 0;
  await db.update(artistLoans)
    .set({
      totalRepaid: newTotalRepaid.toFixed(2),
      remainingBalance: Math.max(0, balanceAfter).toFixed(2),
      status: isFullyRepaid ? "repaid" : "active",
      actualRepaidAt: isFullyRepaid ? new Date() : undefined
    })
    .where(eq(artistLoans.id, loan.id));

  return {
    repaymentAmount,
    balanceAfter: Math.max(0, balanceAfter),
    isFullyRepaid,
    artistReceives: paymentAmount - repaymentAmount
  };
}

/**
 * Get repayment history for a loan
 */
export async function getLoanRepayments(loanId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(loanRepayments)
    .where(eq(loanRepayments.loanId, loanId))
    .orderBy(desc(loanRepayments.processedAt));
}

/**
 * Approve a loan (admin function)
 */
export async function approveLoan(loanId: number, reviewerId: number, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [loan] = await db.select().from(artistLoans).where(eq(artistLoans.id, loanId));
  if (!loan) throw new Error("Loan not found");
  if (loan.status !== "pending") throw new Error("Loan is not pending approval");

  await db.update(artistLoans)
    .set({
      status: "approved",
      approvedAmount: loan.requestedAmount,
      approvedAt: new Date(),
      reviewedBy: reviewerId,
      reviewNotes: notes
    })
    .where(eq(artistLoans.id, loanId));

  return { success: true };
}

/**
 * Disburse approved loan (marks as active)
 */
export async function disburseLoan(loanId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [loan] = await db.select().from(artistLoans).where(eq(artistLoans.id, loanId));
  if (!loan) throw new Error("Loan not found");
  if (loan.status !== "approved") throw new Error("Loan is not approved");

  // Calculate expected repayment date (estimate based on earnings)
  const monthlyEarnings = parseFloat(loan.monthlyEarningsAvg || "0");
  const repaymentPercent = parseFloat(loan.repaymentPercent || "15") / 100;
  const monthlyRepayment = monthlyEarnings * repaymentPercent;
  const totalOwed = parseFloat(loan.totalOwed || "0");
  const monthsToRepay = monthlyRepayment > 0 ? Math.ceil(totalOwed / monthlyRepayment) : 12;
  
  const expectedRepaymentDate = new Date();
  expectedRepaymentDate.setMonth(expectedRepaymentDate.getMonth() + monthsToRepay);

  await db.update(artistLoans)
    .set({
      status: "active",
      disbursedAt: new Date(),
      expectedRepaymentDate
    })
    .where(eq(artistLoans.id, loanId));

  return { success: true, expectedRepaymentDate };
}
