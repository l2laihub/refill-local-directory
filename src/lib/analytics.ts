import posthog from 'posthog-js';

// Initialize PostHog
const initAnalytics = () => {
  const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
  const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';
  
  if (!apiKey) {
    console.error('PostHog API key is missing. Analytics will not be tracked.');
    return;
  }
  
  posthog.init(apiKey, {
    api_host: apiHost,
    capture_pageview: true, // Automatically capture pageviews
    capture_pageleave: true, // Capture when users leave the page
    loaded: (posthog) => {
      console.log('PostHog loaded successfully');
    },
  });
};

// Track page views
export const trackPageView = (pageName: string) => {
  posthog.capture('$pageview', { page: pageName });
};

// Track events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  posthog.capture(eventName, properties);
};

// Track city searches
export const trackCitySearch = (cityName: string, found: boolean) => {
  trackEvent('city_search', { 
    city: cityName,
    found: found,
    timestamp: new Date().toISOString(),
  });
};

// Track store views
export const trackStoreView = (storeId: string, storeName: string) => {
  trackEvent('store_view', { 
    store_id: storeId,
    store_name: storeName,
  });
};

// Track waitlist signups
export const trackWaitlistSignup = (city: string) => {
  trackEvent('waitlist_signup', { 
    city: city,
  });
};

export default { 
  initAnalytics,
  trackPageView,
  trackEvent,
  trackCitySearch,
  trackStoreView,
  trackWaitlistSignup,
};
