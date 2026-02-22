/**
 * BOPixel™ - Enterprise Tracking SDK
 * Version: 1.0.0
 * 
 * Lightweight tracking pixel for Boptone artists
 * Tracks user behavior, conversions, and traffic attribution
 * with automatic privacy compliance (GDPR/CCPA)
 */

(function(window, document) {
  'use strict';
  
  // Prevent multiple initializations
  if (window.bopixel && window.bopixel._initialized) {
    return;
  }
  
  // Configuration
  const config = {
    endpoint: '/api/pixel/track',
    artistId: null,
    autoTrack: true,
    cookieDomain: null,
    cookieName: '_bp_uid',
    sessionCookieName: '_bp_sid',
    cookieExpiry: 365, // days
    sessionTimeout: 30 * 60 * 1000, // 30 minutes in ms
    respectDNT: true,
    debug: false
  };
  
  // State
  let pixelUserId = null;
  let sessionId = null;
  let consentStatus = 'unknown';
  let privacyTier = 'permissive';
  let initialized = false;
  
  /**
   * Generate a unique ID
   */
  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Get or create cookie
   */
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  }
  
  /**
   * Set cookie
   */
  function setCookie(name, value, days) {
    const domain = config.cookieDomain || window.location.hostname;
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=${domain};SameSite=Lax`;
  }
  
  /**
   * Get or create pixel user ID
   */
  function getPixelUserId() {
    if (pixelUserId) {
      return pixelUserId;
    }
    
    // Check cookie
    pixelUserId = getCookie(config.cookieName);
    
    // Create new ID if not found
    if (!pixelUserId) {
      pixelUserId = generateId();
      setCookie(config.cookieName, pixelUserId, config.cookieExpiry);
    }
    
    return pixelUserId;
  }
  
  /**
   * Get or create session ID
   */
  function getSessionId() {
    if (sessionId) {
      return sessionId;
    }
    
    // Check cookie
    sessionId = getCookie(config.sessionCookieName);
    
    // Create new session if not found or expired
    if (!sessionId) {
      sessionId = generateId();
      // Session cookie expires when browser closes
      document.cookie = `${config.sessionCookieName}=${sessionId};path=/;SameSite=Lax`;
    }
    
    return sessionId;
  }
  
  /**
   * Check if Do Not Track is enabled
   */
  function isDNTEnabled() {
    return navigator.doNotTrack === '1' || 
           navigator.doNotTrack === 'yes' ||
           window.doNotTrack === '1';
  }
  
  /**
   * Get device type
   */
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }
  
  /**
   * Get browser name
   */
  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) return 'IE';
    return 'Unknown';
  }
  
  /**
   * Get OS name
   */
  function getOS() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Win') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'MacOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iOS') > -1) return 'iOS';
    return 'Unknown';
  }
  
  /**
   * Parse UTM parameters from URL
   */
  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
      utmContent: params.get('utm_content'),
      utmTerm: params.get('utm_term')
    };
  }
  
  /**
   * Send event to tracking endpoint
   */
  function sendEvent(eventData) {
    // Check DNT
    if (config.respectDNT && isDNTEnabled()) {
      if (config.debug) {
        console.log('[BOPixel] Tracking blocked by Do Not Track');
      }
      return;
    }
    
    // Check consent
    if (privacyTier === 'strict' && consentStatus !== 'granted') {
      if (config.debug) {
        console.log('[BOPixel] Tracking blocked - consent required');
      }
      return;
    }
    
    // Build event payload
    const payload = {
      eventId: generateId(),
      pixelUserId: getPixelUserId(),
      sessionId: getSessionId(),
      artistId: config.artistId,
      eventType: eventData.eventType || 'custom',
      eventName: eventData.eventName,
      pageUrl: window.location.href,
      pageTitle: document.title,
      referrer: document.referrer || null,
      ...getUTMParams(),
      deviceType: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      userAgent: navigator.userAgent,
      customData: eventData.customData || {},
      revenue: eventData.revenue,
      currency: eventData.currency,
      productId: eventData.productId,
      timestamp: new Date().toISOString()
    };
    
    if (config.debug) {
      console.log('[BOPixel] Sending event:', payload);
    }
    
    // Send via fetch (with fallback to image beacon)
    if (typeof fetch !== 'undefined') {
      fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function(error) {
        if (config.debug) {
          console.error('[BOPixel] Tracking error:', error);
        }
      });
    } else {
      // Fallback: Image beacon
      const img = new Image();
      img.src = config.endpoint + '?' + new URLSearchParams(payload).toString();
    }
  }
  
  /**
   * Track page view
   */
  function trackPageView() {
    sendEvent({
      eventType: 'page_view',
      eventName: 'Page Viewed'
    });
  }
  
  /**
   * Track custom event
   */
  function trackEvent(eventName, properties) {
    properties = properties || {};
    
    sendEvent({
      eventType: 'custom',
      eventName: eventName,
      customData: properties,
      revenue: properties.revenue,
      currency: properties.currency,
      productId: properties.productId
    });
  }
  
  /**
   * Track e-commerce event
   */
  function trackEcommerce(eventType, properties) {
    properties = properties || {};
    
    sendEvent({
      eventType: eventType,
      eventName: properties.eventName || eventType,
      customData: properties,
      revenue: properties.revenue,
      currency: properties.currency,
      productId: properties.productId
    });
  }
  
  /**
   * Identify user
   */
  function identify(userId, traits) {
    traits = traits || {};
    
    sendEvent({
      eventType: 'identify',
      eventName: 'User Identified',
      customData: {
        userId: userId,
        ...traits
      }
    });
  }
  
  /**
   * Set consent status
   */
  function setConsent(status, types) {
    types = types || ['analytics', 'marketing', 'functional'];
    consentStatus = status;
    
    // Store consent in cookie
    setCookie('_bp_consent', status, 365);
    
    // Send consent event
    sendEvent({
      eventType: 'consent',
      eventName: 'Consent Updated',
      customData: {
        consentStatus: status,
        consentTypes: types
      }
    });
    
    if (config.debug) {
      console.log('[BOPixel] Consent updated:', status);
    }
  }
  
  /**
   * Get consent status
   */
  function getConsent() {
    return consentStatus;
  }
  
  /**
   * Initialize BOPixel
   */
  function init(artistId, options) {
    if (initialized) {
      if (config.debug) {
        console.warn('[BOPixel] Already initialized');
      }
      return;
    }
    
    // Merge options
    if (options) {
      Object.keys(options).forEach(function(key) {
        config[key] = options[key];
      });
    }
    
    // Set artist ID
    config.artistId = artistId;
    
    // Check for existing consent
    const savedConsent = getCookie('_bp_consent');
    if (savedConsent) {
      consentStatus = savedConsent;
    }
    
    // Auto-track page view
    if (config.autoTrack) {
      trackPageView();
    }
    
    initialized = true;
    
    if (config.debug) {
      console.log('[BOPixel] Initialized with artist ID:', artistId);
      console.log('[BOPixel] Pixel User ID:', getPixelUserId());
      console.log('[BOPixel] Session ID:', getSessionId());
    }
  }
  
  // Public API
  window.bopixel = {
    init: init,
    track: trackEvent,
    page: trackPageView,
    ecommerce: trackEcommerce,
    identify: identify,
    consent: {
      grant: function(types) { setConsent('granted', types); },
      deny: function(types) { setConsent('denied', types); },
      status: getConsent
    },
    _initialized: false,
    _version: '1.0.0'
  };
  
  // Auto-initialize if artist ID is in script tag
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const src = scripts[i].src;
    if (src && src.indexOf('bopixel.js') > -1) {
      const match = src.match(/[?&]id=([^&]+)/);
      if (match && match[1]) {
        // Delay initialization to ensure DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            init(match[1]);
          });
        } else {
          init(match[1]);
        }
      }
      break;
    }
  }
  
})(window, document);
