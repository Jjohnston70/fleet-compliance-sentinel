import { Branding } from '../data/schema.js';

export interface EmailCommandConfig {
  branding: Branding;
  timezone: string;
  anomalyThreshold: number; // z-score threshold for anomaly detection
  reportTypes: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    quarterly: boolean;
    alert: boolean;
    custom: boolean;
  };
}

export const DEFAULT_CONFIG: EmailCommandConfig = {
  branding: {
    primary_color: '#0077cc',
    secondary_color: '#333333',
    accent_color: '#ff9900',
  },
  timezone: 'America/Denver',
  anomalyThreshold: 2.0, // Standard 2-sigma for statistical anomalies
  reportTypes: {
    daily: true,
    weekly: true,
    monthly: true,
    quarterly: true,
    alert: true,
    custom: true,
  },
};

export const REPORT_TYPE_NAMES: Record<string, string> = {
  daily: 'Daily Digest',
  weekly: 'Weekly Summary',
  monthly: 'Monthly Report',
  quarterly: 'Quarterly Review',
  alert: 'Anomaly Alert',
  custom: 'Custom Report',
};
