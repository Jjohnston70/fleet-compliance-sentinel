'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ConsentPreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const CONSENT_COOKIE_NAME = 'tnds_cookie_consent';
const CONSENT_EXPIRY_DAYS = 365;

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if consent has been given
    const consent = getCookie(CONSENT_COOKIE_NAME);
    if (!consent) {
      // Small delay to prevent layout shift on initial load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Parse existing preferences
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
      } catch {
        // Invalid cookie, show banner
        setShowBanner(true);
      }
    }
  }, []);

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const setCookie = (name: string, value: string, days: number) => {
    if (typeof document === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  const handleAcceptAll = () => {
    const allConsent: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allConsent);
    setCookie(CONSENT_COOKIE_NAME, JSON.stringify(allConsent), CONSENT_EXPIRY_DAYS);
    setShowBanner(false);

    // Enable analytics if consented
    enableAnalytics();
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(necessaryOnly);
    setCookie(CONSENT_COOKIE_NAME, JSON.stringify(necessaryOnly), CONSENT_EXPIRY_DAYS);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    setCookie(CONSENT_COOKIE_NAME, JSON.stringify(preferences), CONSENT_EXPIRY_DAYS);
    setShowBanner(false);
    setShowPreferences(false);

    if (preferences.analytics) {
      enableAnalytics();
    }
  };

  const enableAnalytics = () => {
    // This would enable Google Analytics or other tracking
    // The actual implementation depends on your analytics setup
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="max-w-4xl mx-auto bg-card-bg border border-gray-700 rounded-lg shadow-xl">
        {!showPreferences ? (
          // Main Banner
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2
                  id="cookie-consent-title"
                  className="text-lg font-semibold text-white mb-2"
                >
                  We Value Your Privacy
                </h2>
                <p
                  id="cookie-consent-description"
                  className="text-gray-300 text-sm mb-4"
                >
                  We use cookies to enhance your browsing experience, analyze site traffic, and provide
                  personalized content. By clicking "Accept All", you consent to our use of cookies.
                  You can manage your preferences or learn more in our{' '}
                  <Link href="/privacy-policy" className="text-tn-teal hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="bg-tn-teal text-dark-blue font-semibold px-6 py-2 rounded-lg hover:bg-tn-teal/90 transition-colors"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleAcceptNecessary}
                    className="bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Necessary Only
                  </button>
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="text-gray-300 hover:text-white px-4 py-2 transition-colors"
                  >
                    Manage Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Preferences Panel
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Cookie Preferences</h2>
            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Necessary Cookies</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Required for the website to function properly. Cannot be disabled.
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-5 h-5 rounded border-gray-600 bg-tn-teal cursor-not-allowed"
                    aria-label="Necessary cookies - always enabled"
                  />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Analytics Cookies</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Help us understand how visitors interact with our website to improve user experience.
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-tn-teal focus:ring-tn-teal cursor-pointer"
                    aria-label="Analytics cookies"
                  />
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Marketing Cookies</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Used to track visitors across websites to display relevant advertisements.
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-tn-teal focus:ring-tn-teal cursor-pointer"
                    aria-label="Marketing cookies"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSavePreferences}
                className="bg-tn-teal text-dark-blue font-semibold px-6 py-2 rounded-lg hover:bg-tn-teal/90 transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-300 hover:text-white px-4 py-2 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
