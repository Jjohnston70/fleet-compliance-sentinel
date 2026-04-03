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
export declare const getConfig: () => AppConfig;
export declare const isTestMode: () => boolean;
export declare const isProductionMode: () => boolean;
export declare const DEFAULT_CONFIGS: OnboardingConfig[];
//# sourceMappingURL=index.d.ts.map