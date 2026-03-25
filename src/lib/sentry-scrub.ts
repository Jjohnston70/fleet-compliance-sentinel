const SCRUB_KEY_MATCHERS = ['email', 'name', 'license', 'ssn', 'dob', 'medical'];

function shouldScrubKey(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  if (!normalized) return false;
  return SCRUB_KEY_MATCHERS.some((matcher) => normalized.includes(matcher));
}

function scrubValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (shouldScrubKey(key)) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = scrubValue(nested);
      }
    }
    return out;
  }
  return value;
}

export function scrubSentryEvent(event: unknown): unknown {
  const scrubbed = scrubValue(event) as Record<string, unknown>;
  const user = (scrubbed as Record<string, unknown>).user as Record<string, unknown> | undefined;
  const userId = user?.id ? String(user.id) : undefined;
  (scrubbed as Record<string, unknown>).user = userId ? { id: userId } : undefined;

  return scrubbed;
}
