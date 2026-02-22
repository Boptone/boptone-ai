/**
 * useBOPixel Hook
 * 
 * Provides access to BOPixel tracking functions throughout the app
 * Invisible infrastructure - artists never see this mentioned
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';

// Extend Window interface to include bopixel
declare global {
  interface Window {
    bopixel?: {
      init: (artistId: string, options?: any) => void;
      track: (eventName: string, properties?: any) => void;
      page: () => void;
      ecommerce: (eventType: string, properties?: any) => void;
      identify: (userId: string, traits?: any) => void;
      consent: {
        grant: (types?: string[]) => void;
        deny: (types?: string[]) => void;
        status: () => string;
      };
    };
  }
}

export function useBOPixel() {
  const { user } = useAuth();
  const initialized = useRef(false);
  
  useEffect(() => {
    // Wait for BOPixel SDK to load
    const checkBOPixel = setInterval(() => {
      if (window.bopixel && !initialized.current) {
        // Initialize BOPixel with platform-wide tracking
        // Use 'boptone' as the artist ID for platform-level tracking
        window.bopixel.init('boptone', {
          autoTrack: true,
          debug: process.env.NODE_ENV === 'development'
        });
        
        // If user is logged in, identify them
        if (user) {
          window.bopixel.identify(user.id.toString(), {
            name: user.name,
            email: user.email,
            role: user.role
          });
        }
        
        initialized.current = true;
        clearInterval(checkBOPixel);
      }
    }, 100);
    
    // Cleanup
    return () => clearInterval(checkBOPixel);
  }, [user]);
  
  /**
   * Track custom event
   */
  const track = (eventName: string, properties?: Record<string, any>) => {
    if (window.bopixel) {
      window.bopixel.track(eventName, properties);
    }
  };
  
  /**
   * Track page view
   */
  const trackPageView = () => {
    if (window.bopixel) {
      window.bopixel.page();
    }
  };
  
  /**
   * Track artist profile view
   */
  const trackArtistView = (artistId: number, artistName: string) => {
    track('Artist Profile Viewed', {
      artistId,
      artistName
    });
  };
  
  /**
   * Track product view
   */
  const trackProductView = (productId: number, productName: string, price: number, artistId: number) => {
    if (window.bopixel) {
      window.bopixel.ecommerce('product_view', {
        productId,
        productName,
        price,
        artistId,
        currency: 'USD'
      });
    }
  };
  
  /**
   * Track add to cart
   */
  const trackAddToCart = (productId: number, productName: string, price: number, quantity: number, artistId: number) => {
    if (window.bopixel) {
      window.bopixel.ecommerce('add_to_cart', {
        productId,
        productName,
        price,
        quantity,
        artistId,
        currency: 'USD'
      });
    }
  };
  
  /**
   * Track remove from cart
   */
  const trackRemoveFromCart = (productId: number, productName: string, price: number, quantity: number, artistId: number) => {
    if (window.bopixel) {
      window.bopixel.ecommerce('remove_from_cart', {
        productId,
        productName,
        price,
        quantity,
        artistId,
        currency: 'USD'
      });
    }
  };
  
  /**
   * Track checkout started
   */
  const trackCheckoutStarted = (cartTotal: number, itemCount: number, items: any[]) => {
    if (window.bopixel) {
      window.bopixel.ecommerce('checkout_started', {
        revenue: cartTotal,
        itemCount,
        items,
        currency: 'USD'
      });
    }
  };
  
  /**
   * Track purchase
   */
  const trackPurchase = (orderId: number, revenue: number, items: any[]) => {
    if (window.bopixel) {
      window.bopixel.ecommerce('purchase', {
        orderId,
        revenue,
        items,
        currency: 'USD'
      });
    }
  };
  
  /**
   * Grant consent (for GDPR/CCPA compliance)
   */
  const grantConsent = (types?: string[]) => {
    if (window.bopixel) {
      window.bopixel.consent.grant(types);
    }
  };
  
  /**
   * Deny consent
   */
  const denyConsent = (types?: string[]) => {
    if (window.bopixel) {
      window.bopixel.consent.deny(types);
    }
  };
  
  return {
    track,
    trackPageView,
    trackArtistView,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckoutStarted,
    trackPurchase,
    grantConsent,
    denyConsent,
    isReady: initialized.current
  };
}
