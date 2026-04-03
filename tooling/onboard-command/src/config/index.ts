import { OnboardingConfig } from '../data/schema.js';

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
}

export interface AppConfig {
  mode: 'test' | 'production';
  firebaseProjectId: string;
  firestoreCollectionPrefix: string;
  branding: BrandingConfig;
  logRetentionDays: number;
  maxQueueRetries: number;
  defaultDepartment: string;
}

export const getConfig = (): AppConfig => {
  return {
    mode: (process.env.MODE as 'test' | 'production') || 'test',
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'test-project',
    firestoreCollectionPrefix: process.env.FIRESTORE_COLLECTION_PREFIX || 'onboard',
    branding: {
      primaryColor: process.env.BRANDING_PRIMARY_COLOR || '#1a3a5c',
      secondaryColor: process.env.BRANDING_SECONDARY_COLOR || '#3d8eb9',
      companyName: process.env.BRANDING_COMPANY_NAME || 'Your Company',
    },
    logRetentionDays: parseInt(process.env.LOG_RETENTION_DAYS || '90', 10),
    maxQueueRetries: parseInt(process.env.MAX_QUEUE_RETRIES || '3', 10),
    defaultDepartment: process.env.DEFAULT_DEPARTMENT || 'Operations',
  };
};

export const isTestMode = (): boolean => getConfig().mode === 'test';
export const isProductionMode = (): boolean => getConfig().mode === 'production';

// Default department configurations
export const DEFAULT_CONFIGS: OnboardingConfig[] = [
  {
    id: 'Engineering',
    folder_template: [
      '0-Operations',
      '1-Contracts',
      '2-Deliverables',
      '3-Automations',
      '4-Reports',
      '5-Finance',
      'Templates',
    ],
    label_template: ['project', 'sprint', 'bug', 'feature', 'review'],
    license_type: 'business_standard',
    document_templates: ['proposal', 'sow', 'checklist'],
    auto_provision: true,
    notification_emails: [],
  },
  {
    id: 'Operations',
    folder_template: [
      '0-Operations',
      '1-Contracts',
      '2-Deliverables',
      '3-Automations',
      '4-Reports',
      '5-Finance',
      'Templates',
    ],
    label_template: ['process', 'policy', 'procedure', 'urgent', 'approved'],
    license_type: 'business_standard',
    document_templates: ['proposal', 'msa', 'sow', 'checklist'],
    auto_provision: false,
    notification_emails: [],
  },
  {
    id: 'Sales',
    folder_template: [
      '0-Operations',
      '1-Contracts',
      '2-Deliverables',
      '3-Automations',
      '4-Reports',
      '5-Finance',
      'Templates',
    ],
    label_template: ['prospect', 'customer', 'contract', 'deal', 'closed'],
    license_type: 'business_standard',
    document_templates: ['proposal', 'msa', 'checklist'],
    auto_provision: true,
    notification_emails: [],
  },
  {
    id: 'Finance',
    folder_template: [
      '0-Operations',
      '1-Contracts',
      '2-Deliverables',
      '3-Automations',
      '4-Reports',
      '5-Finance',
      'Templates',
    ],
    label_template: ['invoice', 'expense', 'budget', 'receipt', 'reconciliation'],
    license_type: 'business_standard',
    document_templates: ['proposal', 'msa', 'sow', 'checklist'],
    auto_provision: false,
    notification_emails: [],
  },
  {
    id: 'Admin',
    folder_template: [
      '0-Operations',
      '1-Contracts',
      '2-Deliverables',
      '3-Automations',
      '4-Reports',
      '5-Finance',
      'Templates',
    ],
    label_template: ['employee', 'hr', 'policy', 'compliance', 'training'],
    license_type: 'business_standard',
    document_templates: ['proposal', 'msa', 'sow', 'checklist'],
    auto_provision: false,
    notification_emails: [],
  },
];
