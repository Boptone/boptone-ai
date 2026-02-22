/**
 * Cart Tracker
 * Client-side cart tracking for abandoned cart detection
 * Lightweight, no external dependencies
 */

import { trpc } from './trpc';

const SESSION_ID_KEY = 'boptone_cart_session';

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Track cart event
 */
async function trackEvent(params: {
  eventType: 'cart_viewed' | 'item_added' | 'item_removed' | 'checkout_started' | 'checkout_abandoned' | 'checkout_completed';
  productId?: number;
  variantId?: number;
  quantity?: number;
  cartSnapshot?: {
    items: Array<{
      productId: number;
      variantId?: number;
      name: string;
      imageUrl?: string;
      price: number;
      quantity: number;
    }>;
    subtotal: number;
    currency: string;
  };
}) {
  const sessionId = getSessionId();
  
  try {
    await trpc.postPurchase.trackCartEvent.mutate({
      sessionId,
      eventType: params.eventType,
      productId: params.productId,
      variantId: params.variantId,
      quantity: params.quantity,
      cartSnapshot: params.cartSnapshot,
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined,
    });
    
    console.log(`[CartTracker] Tracked event: ${params.eventType}`);
  } catch (error) {
    console.error('[CartTracker] Failed to track event:', error);
  }
}

/**
 * Track cart viewed (call on cart page load)
 */
export function trackCartViewed() {
  trackEvent({ eventType: 'cart_viewed' });
}

/**
 * Track item added to cart
 */
export function trackItemAdded(productId: number, variantId?: number, quantity: number = 1) {
  trackEvent({
    eventType: 'item_added',
    productId,
    variantId,
    quantity,
  });
}

/**
 * Track item removed from cart
 */
export function trackItemRemoved(productId: number, variantId?: number, quantity: number = 1) {
  trackEvent({
    eventType: 'item_removed',
    productId,
    variantId,
    quantity,
  });
}

/**
 * Track checkout started (CRITICAL: triggers 24-hour abandoned cart email)
 */
export function trackCheckoutStarted(cart: {
  items: Array<{
    productId: number;
    variantId?: number;
    name: string;
    imageUrl?: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  currency: string;
}) {
  trackEvent({
    eventType: 'checkout_started',
    cartSnapshot: cart,
  });
}

/**
 * Track checkout abandoned
 */
export function trackCheckoutAbandoned(cart: {
  items: Array<{
    productId: number;
    variantId?: number;
    name: string;
    imageUrl?: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  currency: string;
}) {
  trackEvent({
    eventType: 'checkout_abandoned',
    cartSnapshot: cart,
  });
}

/**
 * Track checkout completed (cancels abandoned cart email)
 */
export function trackCheckoutCompleted(cart: {
  items: Array<{
    productId: number;
    variantId?: number;
    name: string;
    imageUrl?: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  currency: string;
}) {
  trackEvent({
    eventType: 'checkout_completed',
    cartSnapshot: cart,
  });
}

/**
 * Calculate cart subtotal
 */
export function calculateSubtotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Auto-track cart viewed on page load (call in cart page useEffect)
 */
export function initCartTracking() {
  trackCartViewed();
}
