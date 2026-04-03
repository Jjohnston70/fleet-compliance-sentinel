/**
 * Firestore Repository Implementation
 * Adapts Firestore to the ComplianceRepository interface
 *
 * In production, this would connect to real Firestore collections:
 * - companies
 * - compliance_packages
 * - templates
 * - compliance_frameworks
 */

import type {
  CompanyRecord,
  ComplianceFrameworkRecord,
  CompliancePackageRecord,
  PackageNumber,
  TemplateRecord,
} from "./firestore-schema.js";
import type { ComplianceRepository } from "./repository.js";
import { createInMemoryComplianceRepository } from "./in-memory-repository.js";
import { FRAMEWORK_SEED, TEMPLATE_SEED } from "./seed-data.js";

/**
 * Factory function to create a Firestore-backed repository
 *
 * PRODUCTION NOTE:
 * Replace the in-memory fallback with actual Firestore calls:
 *   - Initialize firebase-admin SDK
 *   - Use admin.firestore().collection(COLLECTIONS.companies).doc(id).get()
 *   - Implement transaction wrapping for upsertCompanyByName
 */
export function createFirestoreRepository(): ComplianceRepository {
  // For now, delegate to in-memory (production would use real Firestore)
  return createInMemoryComplianceRepository({
    templates: TEMPLATE_SEED,
    frameworks: FRAMEWORK_SEED,
  });
}

/**
 * Helper to map Firestore documents to TypeScript records
 * Used in production when reading from real Firestore
 */
export function firestoreCompanyToRecord(doc: unknown): CompanyRecord {
  const data = doc as Record<string, unknown>;
  return {
    id: String(data.id ?? ""),
    company_name: String(data.company_name ?? ""),
    company_short_name: data.company_short_name ? String(data.company_short_name) : undefined,
    address: data.address ? String(data.address) : undefined,
    city: data.city ? String(data.city) : undefined,
    state: data.state ? String(data.state) : undefined,
    zip: data.zip ? String(data.zip) : undefined,
    website: data.website ? String(data.website) : undefined,
    ceo: data.ceo ? String(data.ceo) : undefined,
    cfo: data.cfo ? String(data.cfo) : undefined,
    cto: data.cto ? String(data.cto) : undefined,
    ciso: data.ciso ? String(data.ciso) : undefined,
    hr_director: data.hr_director ? String(data.hr_director) : undefined,
    compliance_officer: data.compliance_officer ? String(data.compliance_officer) : undefined,
    industry: data.industry ? String(data.industry) : undefined,
    employee_count: data.employee_count ? Number(data.employee_count) : undefined,
    annual_revenue: data.annual_revenue ? String(data.annual_revenue) : undefined,
    primary_contact: data.primary_contact ? String(data.primary_contact) : undefined,
    company_email: data.company_email ? String(data.company_email) : undefined,
    company_phone: data.company_phone ? String(data.company_phone) : undefined,
    ein: data.ein ? String(data.ein) : undefined,
    state_of_incorporation: data.state_of_incorporation ? String(data.state_of_incorporation) : undefined,
    year_founded: data.year_founded ? String(data.year_founded) : undefined,
    entity_type: data.entity_type ? String(data.entity_type) : undefined,
    cage_code: data.cage_code ? String(data.cage_code) : undefined,
    duns_number: data.duns_number ? String(data.duns_number) : undefined,
    sam_uei: data.sam_uei ? String(data.sam_uei) : undefined,
    naics_codes: data.naics_codes ? String(data.naics_codes) : undefined,
    sic_codes: data.sic_codes ? String(data.sic_codes) : undefined,
    contract_types: data.contract_types ? String(data.contract_types) : undefined,
    clearance_level: data.clearance_level ? String(data.clearance_level) : undefined,
    set_aside_status: data.set_aside_status ? String(data.set_aside_status) : undefined,
    it_poc: data.it_poc ? String(data.it_poc) : undefined,
    security_poc: data.security_poc ? String(data.security_poc) : undefined,
    compliance_poc: data.compliance_poc ? String(data.compliance_poc) : undefined,
    remote_workforce: data.remote_workforce ? String(data.remote_workforce) : undefined,
    cloud_provider: data.cloud_provider ? String(data.cloud_provider) : undefined,
    email_platform: data.email_platform ? String(data.email_platform) : undefined,
    insurance_carrier: data.insurance_carrier ? String(data.insurance_carrier) : undefined,
    cyber_insurance: data.cyber_insurance ? String(data.cyber_insurance) : undefined,
    created_at: String(data.created_at ?? ""),
    updated_at: String(data.updated_at ?? ""),
  };
}

/**
 * Environment variable configuration for Firestore
 *
 * Expected in .env:
 *   GOOGLE_CLOUD_PROJECT=your-project-id
 *   FIRESTORE_EMULATOR_HOST=localhost:8080  (optional, dev only)
 *   FIREBASE_SERVICE_ACCOUNT_KEY=path/to/key.json  (production)
 */
export const FirestoreConfig = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT ?? "compliance-dev",
  emulatorsEnabled: Boolean(process.env.FIRESTORE_EMULATOR_HOST),
  emulatorHost: process.env.FIRESTORE_EMULATOR_HOST,
  serviceAccountKeyPath: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
};
