import Stripe from 'stripe';
import { getDb } from './db';
import { bapStreamPayments, bapTracks, paidStreamSessions } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

/**
 * Create a Stripe Payment Intent for a stream payment
 * @param trackId - ID of the track being streamed
 * @param userId - ID of the user (null for anonymous)
 * @returns Payment intent client secret and payment ID
 */
export async function createStreamPaymentIntent(trackId: number, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get track details
  const track = await db.select().from(bapTracks).where(eq(bapTracks.id, trackId)).limit(1);
  if (!track || track.length === 0) {
    throw new Error('Track not found');
  }

  const trackData = track[0];
  const amount = trackData.pricePerStream; // In cents
  const artistShare = Math.floor(amount * (trackData.artistShare / 100));
  const platformShare = amount - artistShare;

  // Create Stripe Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: {
      trackId: trackId.toString(),
      userId: userId?.toString() || 'anonymous',
      artistId: trackData.artistId.toString(),
      trackTitle: trackData.title,
      artistName: trackData.artist,
    },
    description: `Stream payment for "${trackData.title}" by ${trackData.artist}`,
  });

  // Store payment record in database
  const [paymentRecord] = await db.insert(bapStreamPayments).values({
    trackId,
    userId: userId || null,
    amount,
    artistShare,
    platformShare,
    stripePaymentIntentId: paymentIntent.id,
    stripeCustomerId: null,
    status: 'pending',
    currency: 'usd',
  });

  // Get the inserted payment ID
  const insertedPayments = await db
    .select()
    .from(bapStreamPayments)
    .where(eq(bapStreamPayments.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    paymentId: insertedPayments[0]?.id || 0,
    amount,
    artistShare,
    platformShare,
  };
}

/**
 * Confirm a payment and create a 24-hour unlock session
 * @param paymentIntentId - Stripe payment intent ID
 * @returns Session token for 24-hour unlock
 */
export async function confirmStreamPayment(paymentIntentId: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Retrieve payment intent from Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    throw new Error('Payment not successful');
  }

  // Update payment record in database
  const paymentRecords = await db
    .select()
    .from(bapStreamPayments)
    .where(eq(bapStreamPayments.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  if (!paymentRecords || paymentRecords.length === 0) {
    throw new Error('Payment record not found');
  }

  const payment = paymentRecords[0];

  await db
    .update(bapStreamPayments)
    .set({
      status: 'succeeded',
      paidAt: new Date(),
      paymentMethod: paymentIntent.payment_method_types[0] || 'card',
      stripeCustomerId: paymentIntent.customer as string | null,
    })
    .where(eq(bapStreamPayments.id, payment.id));

  // Generate session token (24-hour unlock)
  const sessionToken = `bap_session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  await db.insert(paidStreamSessions).values({
    trackId: payment.trackId,
    paymentId: payment.id,
    sessionToken,
    userId: payment.userId,
    expiresAt,
  });

  return {
    sessionToken,
    expiresAt,
    trackId: payment.trackId,
  };
}

/**
 * Check if a session token is valid for a track
 * @param trackId - ID of the track
 * @param sessionToken - Session token from localStorage
 * @returns Whether the session is valid and not expired
 */
export async function checkSessionUnlock(trackId: number, sessionToken: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const sessions = await db
    .select()
    .from(paidStreamSessions)
    .where(eq(paidStreamSessions.sessionToken, sessionToken))
    .limit(1);

  if (!sessions || sessions.length === 0) {
    return { unlocked: false, reason: 'Session not found' };
  }

  const session = sessions[0];

  // Check if session is for the correct track
  if (session.trackId !== trackId) {
    return { unlocked: false, reason: 'Session is for a different track' };
  }

  // Check if session has expired
  if (new Date() > new Date(session.expiresAt)) {
    return { unlocked: false, reason: 'Session expired', expiresAt: session.expiresAt };
  }

  return {
    unlocked: true,
    expiresAt: session.expiresAt,
    paymentId: session.paymentId,
  };
}

/**
 * Get payment statistics for a track
 * @param trackId - ID of the track
 * @returns Payment stats (total revenue, payment count, etc.)
 */
export async function getTrackPaymentStats(trackId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const payments = await db
    .select()
    .from(bapStreamPayments)
    .where(eq(bapStreamPayments.trackId, trackId));

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalArtistShare = payments.reduce((sum, p) => sum + p.artistShare, 0);
  const totalPlatformShare = payments.reduce((sum, p) => sum + p.platformShare, 0);
  const successfulPayments = payments.filter((p) => p.status === 'succeeded').length;

  return {
    totalRevenue,
    totalArtistShare,
    totalPlatformShare,
    paymentCount: payments.length,
    successfulPayments,
  };
}
