/**
 * Seed data for initial database population
 * Includes govcon pipeline + compliance document templates
 */
import { Opportunity, OutreachContact, ComplianceItem } from "./schemas.js";
/**
 * Example opportunities for testing and demo
 */
export declare const SEED_OPPORTUNITIES: Opportunity[];
/**
 * Example outreach contacts
 */
export declare const SEED_OUTREACH_CONTACTS: OutreachContact[];
/**
 * Default compliance items seeded from config
 */
export declare const SEED_COMPLIANCE_ITEMS: ComplianceItem[];
/**
 * 7 compliance package template masters
 * These are Handlebars templates with {{PLACEHOLDER}} tokens
 * that get replaced with company-specific data
 */
export declare const COMPLIANCE_PACKAGE_TEMPLATES: Record<number, string>;
/**
 * Placeholder token mapping for template rendering
 */
export declare const PLACEHOLDER_MAP: Record<string, string>;
export declare function seedDatabase(repo: any): Promise<void>;
//# sourceMappingURL=seeds.d.ts.map