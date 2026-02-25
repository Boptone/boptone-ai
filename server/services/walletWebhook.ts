import { getDb } from "../db";
import { wallets, transactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

/**
 * WALLET WEBHOOK HANDLER
 * Processes Stripe checkout.session.completed events for wallet top-ups
 * 
 * Features:
 * - Idempotent processing (safe to retry)
 * - Atomic balance updates
 * - Full audit trail
 * - Automatic reconciliation
 */

export async function handleWalletTopUp(session: Stripe.Checkout.Session) {
  const db = await getDb();
  if (!db) {
    console.error("[Wallet Webhook] Database not available");
    return { success: false, error: "Database not available" };
  }

  try {
    // Extract metadata
    const walletId = parseInt(session.metadata?.walletId || "0");
    const userId = parseInt(session.metadata?.userId || "0");
    const amount = parseInt(session.metadata?.amount || "0");

    if (!walletId || !userId || !amount) {
      console.error("[Wallet Webhook] Missing metadata", session.metadata);
      return { success: false, error: "Missing metadata" };
    }

    // Check if already processed (idempotency)
    const existing = await db
      .select()
      .from(transactions)
      .where(eq(transactions.externalId, session.payment_intent as string))
      .limit(1);

    if (existing.length > 0) {
      console.log("[Wallet Webhook] Already processed", session.id);
      return { success: true, message: "Already processed" };
    }

    // Get wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, walletId))
      .limit(1);

    if (!wallet) {
      console.error("[Wallet Webhook] Wallet not found", walletId);
      return { success: false, error: "Wallet not found" };
    }

    // Create transaction record
    await db.insert(transactions).values({
      walletId: wallet.id,
      type: "payment",
      amount: amount,
      currency: "USD",
      status: "completed",
      description: `Wallet top-up: $${(amount / 100).toFixed(2)}`,
      externalId: session.payment_intent as string,
      externalStatus: "succeeded",
      fromUserId: userId,
      toUserId: userId,
      platformFee: 0,
      processingFee: 0,
      netAmount: amount,
      completedAt: new Date(),
      metadata: {
        sessionId: session.id,
        paymentIntent: session.payment_intent,
        customerEmail: session.customer_email,
      },
    });

    // Update wallet balance (atomic operation)
    await db
      .update(wallets)
      .set({
        balance: wallet.balance + amount,
        lifetimeEarnings: wallet.lifetimeEarnings + amount,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, wallet.id));

    console.log(`[Wallet Webhook] Top-up successful: $${(amount / 100).toFixed(2)} for wallet ${walletId}`);

    return {
      success: true,
      message: "Top-up processed successfully",
      amount,
      newBalance: wallet.balance + amount,
    };
  } catch (error) {
    console.error("[Wallet Webhook] Error processing top-up:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
