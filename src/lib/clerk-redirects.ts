const DEFAULT_AUTH_REDIRECT_URL = '/fleet-compliance';

export type ClerkRedirectConfig = {
  signInFallbackRedirectUrl: string;
  signUpFallbackRedirectUrl: string;
  signInForceRedirectUrl?: string;
  signUpForceRedirectUrl?: string;
};

export function getClerkRedirectConfig(): ClerkRedirectConfig {
  const signInFallbackRedirectUrl =
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ||
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ||
    DEFAULT_AUTH_REDIRECT_URL;

  const signUpFallbackRedirectUrl =
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ||
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL ||
    DEFAULT_AUTH_REDIRECT_URL;

  return {
    signInFallbackRedirectUrl,
    signUpFallbackRedirectUrl,
    signInForceRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL,
    signUpForceRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL,
  };
}
