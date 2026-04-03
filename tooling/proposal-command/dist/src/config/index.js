/**
 * TNDS Proposal Command Module - Configuration
 * Centralized configuration for Firebase, email, branding, and defaults
 */
export const CONFIG = {
    // Firebase Configuration
    FIREBASE: {
        PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'tnds-proposal-module',
        API_KEY: process.env.FIREBASE_API_KEY || '',
        AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
        DATABASE_URL: process.env.FIREBASE_DATABASE_URL || '',
        STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
        MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        APP_ID: process.env.FIREBASE_APP_ID || '',
    },
    // Email Service Configuration (Resend pattern)
    EMAIL: {
        API_KEY: process.env.RESEND_API_KEY || '',
        FROM_NAME: process.env.EMAIL_FROM_NAME || 'True North Strategy Ops',
        FROM_EMAIL: process.env.EMAIL_FROM_EMAIL || 'proposals@truenorthstrategyops.com',
        REPLY_TO: process.env.EMAIL_REPLY_TO || 'sales@truenorthstrategyops.com',
        ADMIN_EMAIL: process.env.EMAIL_ADMIN_EMAIL || '',
        CC_ADMIN: process.env.EMAIL_CC_ADMIN === 'true',
    },
    // Company Branding
    BRANDING: {
        NAME: process.env.COMPANY_NAME || 'True North Strategy Ops',
        WEBSITE: process.env.COMPANY_WEBSITE || 'https://truenorthstrategyops.com',
        PHONE: process.env.COMPANY_PHONE || '(555) 123-4567',
        ADDRESS: process.env.COMPANY_ADDRESS || '',
        LOGO_URL: process.env.COMPANY_LOGO_URL || '',
        PRIMARY_COLOR: '#1a3a5c', // Navy
        SECONDARY_COLOR: '#3d8eb9', // Teal
        FONT_FAMILY: 'Arial, sans-serif',
    },
    // Application Settings
    APP: {
        URL: process.env.APP_URL || 'http://localhost:3000',
        TIMEZONE: process.env.TIMEZONE || 'America/Chicago',
        ENVIRONMENT: process.env.NODE_ENV || 'development',
    },
    // Proposal Defaults
    PROPOSAL: {
        DEFAULT_VALIDITY_DAYS: 30,
        NUMBERING_PREFIX: 'PROP',
        SEQUENCE_START: 1000,
    },
    // Service Types (maps to templates)
    SERVICE_TYPES: [
        'Web Development',
        'Consulting',
        'Design',
        'Data Analytics',
        'Strategy',
    ],
    // Proposal Status Workflow
    PROPOSAL_STATUSES: [
        'draft',
        'generated',
        'sent',
        'viewed',
        'accepted',
        'declined',
        'expired',
    ],
    // Activity Types
    ACTIVITY_TYPES: [
        'created',
        'sent',
        'viewed',
        'revised',
        'accepted',
        'declined',
    ],
    // Pricing Categories
    PRICING_CATEGORIES: [
        'Development',
        'Design',
        'Consulting',
        'Training',
        'Support',
        'Other',
    ],
};
