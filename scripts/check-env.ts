/**
 * Runtime environment checker for local/dev startup and CI.
 *
 * CLI usage:
 *   npx tsx scripts/check-env.ts
 */

export type EnvCategory = 'CRITICAL' | 'REQUIRED' | 'OPTIONAL';

interface EnvVarSpec {
  name: string;
  category: EnvCategory;
  reason: string;
}

const SPECS: EnvVarSpec[] = [
  // CRITICAL: auth + database
  { name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', category: 'CRITICAL', reason: 'Clerk frontend auth bootstrap' },
  { name: 'CLERK_SECRET_KEY', category: 'CRITICAL', reason: 'Clerk server-side auth verification' },
  { name: 'DATABASE_URL', category: 'CRITICAL', reason: 'Neon Postgres connection used by Fleet-Compliance APIs' },

  // REQUIRED: core app features and service security
  { name: 'PENNY_API_URL', category: 'REQUIRED', reason: 'Next.js Penny proxy target (Railway FastAPI)' },
  { name: 'PENNY_API_KEY', category: 'REQUIRED', reason: 'Shared secret for Next.js -> Railway requests' },
  { name: 'SITE_URL', category: 'REQUIRED', reason: 'Canonical base URL for sitemap/robots metadata' },
  { name: 'PENNY_GENERAL_FALLBACK_SESSION_LIMIT', category: 'REQUIRED', reason: 'Session fallback throttle control' },
  { name: 'CORS_ORIGINS', category: 'REQUIRED', reason: 'Railway backend CORS allowlist lock-down' },
  { name: 'STRIPE_SECRET_KEY', category: 'REQUIRED', reason: 'Stripe server SDK key for checkout and portal sessions' },
  { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', category: 'REQUIRED', reason: 'Stripe publishable key used by frontend Stripe integrations' },
  { name: 'STRIPE_STARTER_PRICE_ID', category: 'REQUIRED', reason: 'Stripe price id for Starter subscription plan' },
  { name: 'STRIPE_PRO_PRICE_ID', category: 'REQUIRED', reason: 'Stripe price id for Professional subscription plan' },
  { name: 'STRIPE_WEBHOOK_SECRET', category: 'REQUIRED', reason: 'Stripe webhook signature verification — billing is broken without this' },

  // OPTIONAL: monitoring, alerts, and access controls
  { name: 'RESEND_API_KEY', category: 'OPTIONAL', reason: 'Email delivery for Fleet-Compliance alert engine' },
  { name: 'FLEET_COMPLIANCE_ALERT_FROM_EMAIL', category: 'OPTIONAL', reason: 'From address for compliance alerts' },
  { name: 'FLEET_COMPLIANCE_ALERT_EMAIL', category: 'OPTIONAL', reason: 'Default compliance manager email destination' },
  { name: 'FLEET_COMPLIANCE_CRON_SECRET', category: 'OPTIONAL', reason: 'Auth for cron-triggered alert sweep endpoint' },
  { name: 'FLEET_COMPLIANCE_ORG_NAME', category: 'OPTIONAL', reason: 'Branding text in alert notifications' },
  { name: 'FMCSA_API_KEY', category: 'OPTIONAL', reason: 'FMCSA lookup route enablement' },
  { name: 'ADMIN_EMAIL', category: 'OPTIONAL', reason: 'Penny role bypass allowlist seed' },
  { name: 'PENNY_ALLOWED_EMAILS', category: 'OPTIONAL', reason: 'Additional email allowlist for Penny access' },
  { name: 'PENNY_ENABLE_GENERAL_FALLBACK', category: 'OPTIONAL', reason: 'Enable general-knowledge fallback mode' },
  { name: 'GOOGLE_SHEET_WEBHOOK_URL', category: 'OPTIONAL', reason: 'Legacy webhook integration' },
];

function hasValue(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function check(category: EnvCategory) {
  const rows = SPECS.filter((item) => item.category === category);
  const missing = rows.filter((item) => !hasValue(process.env[item.name]));

  if (missing.length === 0) {
    console.log(`[${category}] OK (${rows.length}/${rows.length})`);
    return { total: rows.length, missing: [] as EnvVarSpec[] };
  }

  const level = category === 'CRITICAL' ? 'ERROR' : 'WARNING';
  console.log(`[${category}] ${level}: ${missing.length} missing of ${rows.length}`);
  for (const item of missing) {
    console.log(`  - ${item.name}: ${item.reason}`);
  }

  return { total: rows.length, missing };
}

export function runEnvCheck(options: { exitOnCritical?: boolean } = {}) {
  const { exitOnCritical = false } = options;

  console.log('Environment check: Fleet-Compliance Sentinel');

  const critical = check('CRITICAL');
  const required = check('REQUIRED');
  const optional = check('OPTIONAL');

  const missingCount = critical.missing.length + required.missing.length + optional.missing.length;
  console.log(`Summary: ${missingCount} missing across ${SPECS.length} tracked vars.`);

  if (critical.missing.length > 0) {
    console.error('CRITICAL env vars are missing.');
    if (exitOnCritical) {
      process.exit(1);
    }
  } else {
    console.log('No CRITICAL env vars missing.');
  }

  return {
    criticalMissing: critical.missing,
    requiredMissing: required.missing,
    optionalMissing: optional.missing,
    ok: critical.missing.length === 0,
  };
}

if (require.main === module) {
  runEnvCheck({ exitOnCritical: true });
}
