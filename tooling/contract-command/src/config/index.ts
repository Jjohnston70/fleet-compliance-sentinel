/**
 * Configuration for contract-command module
 */

// Environment variables
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const APP_URL = process.env.APP_URL || 'http://localhost:3000';
export const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'admin@example.com';
export const TIMEZONE = process.env.TIMEZONE || 'America/Denver';

// Company configuration
export const COMPANY_CONFIG = {
  name: process.env.COMPANY_NAME || 'True North Data Strategies',
  email: process.env.COMPANY_EMAIL || 'contracts@truenorth.com',
  phone: process.env.COMPANY_PHONE || '+1-303-555-0100'
};

// Alert configuration
export const NOTIFICATION_DAYS = [90, 60, 30, 14, 7];
export const DEFAULT_RENEWAL_NOTICE_DAYS = 30;

// Contract defaults
export const CONTRAT_DEFAULTS = {
  currency: 'USD',
  status: 'draft' as const,
  auto_renew: false,
  renewal_notice_days: 30
};

// API configuration
export const API_CONFIG = {
  pageSize: 50,
  maxPageSize: 200,
  timeout: 30000
};

// Validation rules
export const VALIDATION = {
  minContractValue: 0,
  maxContractValue: 999999999.99,
  maxTitleLength: 255,
  maxNotesLength: 5000
};

/**
 * Get config value with fallback
 */
export function getConfig(key: string, defaultValue?: unknown) {
  const envValue = process.env[`CONTRACT_${key.toUpperCase()}`];
  if (envValue !== undefined) return envValue;
  return defaultValue;
}

/**
 * Validate configuration
 */
export function validateConfig(): string[] {
  const errors: string[] = [];

  if (!DATABASE_URL) {
    errors.push('DATABASE_URL environment variable is not set');
  }

  if (!NOTIFICATION_EMAIL) {
    errors.push('NOTIFICATION_EMAIL environment variable is not set');
  }

  return errors;
}

/**
 * Log configuration (sanitized)
 */
export function logConfig() {
  console.log('Contract Command Configuration:');
  console.log(`  App URL: ${APP_URL}`);
  console.log(`  Timezone: ${TIMEZONE}`);
  console.log(`  Notification Email: ${NOTIFICATION_EMAIL}`);
  console.log(`  Company: ${COMPANY_CONFIG.name}`);
  console.log(`  Notification Days: ${NOTIFICATION_DAYS.join(', ')}`);
}
