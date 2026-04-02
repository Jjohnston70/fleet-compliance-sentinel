/**
 * dq-command — Intake Form Configuration
 * Defines the multi-step driver intake form structure
 *
 * Token-gated, unauthenticated flow per §391.21 signature requirement.
 * Driver fills in their own data to maintain the certification chain.
 */

export interface IntakeFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'checkbox' | 'textarea' | 'file' | 'repeater';
  required: boolean;
  pii?: boolean;
  placeholder?: string;
  options?: string[];
  maxItems?: number;
  helpText?: string;
}

export interface IntakeSectionConfig {
  id: string;
  title: string;
  description: string;
  fields: IntakeFieldConfig[];
}

export const INTAKE_SECTIONS: IntakeSectionConfig[] = [
  {
    id: 'personal',
    title: 'Section 1 — Personal Information',
    description: 'Full legal name, contact info, and address history.',
    fields: [
      { name: 'legal_first_name',   label: 'Legal First Name',     type: 'text',   required: true },
      { name: 'legal_middle_name',  label: 'Legal Middle Name',    type: 'text',   required: false },
      { name: 'legal_last_name',    label: 'Legal Last Name',      type: 'text',   required: true },
      { name: 'dob',                label: 'Date of Birth',        type: 'date',   required: true, pii: true },
      { name: 'ssn_last4',          label: 'SSN (last 4 digits)',  type: 'text',   required: true, pii: true, helpText: 'For identity verification only. Full SSN is never stored.' },
      { name: 'phone',              label: 'Phone Number',         type: 'text',   required: true },
      { name: 'email',              label: 'Email Address',        type: 'text',   required: true },
      { name: 'current_address',    label: 'Current Street Address', type: 'text', required: true },
      { name: 'current_city',       label: 'City',                 type: 'text',   required: true },
      { name: 'current_state',      label: 'State',                type: 'text',   required: true },
      { name: 'current_zip',        label: 'ZIP Code',             type: 'text',   required: true },
      { name: 'address_history',    label: 'Address History (past 3 years)', type: 'repeater', required: true, maxItems: 10 },
    ],
  },
  {
    id: 'licensing',
    title: 'Section 2 — Licensing',
    description: 'CDL/license details, endorsements, and licensing history.',
    fields: [
      { name: 'license_number',     label: 'CDL / License Number', type: 'text',   required: true },
      { name: 'issuing_state',      label: 'Issuing State',        type: 'text',   required: true },
      { name: 'license_expiration', label: 'License Expiration',   type: 'date',   required: true },
      { name: 'cdl_class',          label: 'CDL Class',            type: 'select', required: false, options: ['A', 'B', 'C', 'N/A'] },
      { name: 'endorsements',       label: 'Endorsements',         type: 'text',   required: false, placeholder: 'H, N, P, S, T, X' },
      { name: 'restrictions',       label: 'Restrictions',         type: 'text',   required: false },
      { name: 'other_states_3yr',   label: 'Other states licensed in past 3 years', type: 'repeater', required: false, maxItems: 5 },
    ],
  },
  {
    id: 'employment_history',
    title: 'Section 3 — Employment History',
    description: '3 years for non-CDL drivers, 10 years for CDL holders per §391.21.',
    fields: [
      { name: 'employers',          label: 'Previous Employers',   type: 'repeater', required: true, maxItems: 20,
        helpText: 'Include employer name, address, contact, dates of employment, position held, reason for leaving, and whether subject to FMCSA regs and D&A testing.' },
    ],
  },
  {
    id: 'violations',
    title: 'Section 4 — Record of Violations (past 12 months)',
    description: 'All traffic violations (non-parking) in past 12 months, or certify none.',
    fields: [
      { name: 'has_violations',     label: 'Any traffic violations in past 12 months?', type: 'select', required: true, options: ['Yes', 'No'] },
      { name: 'violations',         label: 'Violation Details',    type: 'repeater', required: false, maxItems: 20,
        helpText: 'Date, location, charge, type of vehicle operated.' },
    ],
  },
  {
    id: 'certifications',
    title: 'Section 5 — Certifications & Acknowledgments',
    description: 'Digital signatures required per §391.21.',
    fields: [
      { name: 'certify_accuracy',   label: 'I certify that all entries on this application are true and complete to the best of my knowledge.', type: 'checkbox', required: true },
      { name: 'da_authorization',    label: 'I authorize this motor carrier to seek information about my drug and alcohol history from previous employers.', type: 'checkbox', required: true },
      { name: 'clearinghouse_consent', label: 'I consent to the motor carrier conducting a pre-employment query of the FMCSA Drug & Alcohol Clearinghouse.', type: 'checkbox', required: true },
      { name: 'digital_signature',   label: 'Digital Signature (type full legal name)', type: 'text', required: true },
      { name: 'signature_date',      label: 'Date',                type: 'date',   required: true },
    ],
  },
  {
    id: 'uploads',
    title: 'Section 6 — Document Uploads',
    description: 'Upload required documents. Your fleet manager will upload remaining items.',
    fields: [
      { name: 'cdl_front',          label: 'CDL / License — Front', type: 'file',  required: true },
      { name: 'cdl_back',           label: 'CDL / License — Back',  type: 'file',  required: true },
      { name: 'med_cert',           label: 'Medical Examiner Certificate (non-CDL drivers)', type: 'file', required: false, helpText: 'Required for non-CDL drivers only.' },
      { name: 'eldt_cert',          label: 'Entry-Level Driver Training Certificate', type: 'file', required: false, helpText: 'Required for CDL holders with less than 1 year experience.' },
    ],
  },
];
