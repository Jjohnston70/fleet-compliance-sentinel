const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;

const hasClerkKeys = Boolean(publishableKey && secretKey);
const runtimeEnv = process.env.VERCEL_ENV || process.env.NODE_ENV;
const isDevMode = runtimeEnv !== 'production';
const isLivePublishableKey = Boolean(publishableKey?.startsWith('pk_live_'));

export function isClerkEnabled() {
  // Disable Clerk locally when a production key is present.
  // Localhost cannot initialize production-domain Clerk keys.
  if (isDevMode && isLivePublishableKey) {
    return false;
  }

  return hasClerkKeys;
}
