/**
 * Static manifest of all 14 TNDS modules with metadata
 */

export interface ModuleManifestEntry {
  id: string;
  displayName: string;
  classification: 'Operations' | 'Finance' | 'Intelligence' | 'Planning' | 'Infrastructure' | 'Logistics';
  description: string;
  version: string;
}

export const MODULE_MANIFEST: ModuleManifestEntry[] = [
  {
    id: 'realty-command',
    displayName: 'Realty Command',
    classification: 'Operations',
    description: 'Real estate CRM — leads, properties, deals, contacts',
    version: '1.0.0',
  },
  {
    id: 'sales-command',
    displayName: 'Sales Command',
    classification: 'Finance',
    description: 'Sales pipeline — products, customers, records, KPIs, forecasts',
    version: '1.0.0',
  },
  {
    id: 'compliance-command',
    displayName: 'Compliance Command',
    classification: 'Operations',
    description: 'Compliance tracking — frameworks, packages, checklists, templates',
    version: '1.0.0',
  },
  {
    id: 'task-command',
    displayName: 'Task Command',
    classification: 'Operations',
    description: 'Task management — departments, users, categories, tasks, comments',
    version: '1.0.0',
  },
  {
    id: 'contract-command',
    displayName: 'Contract Command',
    classification: 'Operations',
    description: 'Contract lifecycle — parties, contracts, milestones, amendments, alerts',
    version: '1.0.0',
  },
  {
    id: 'proposal-command',
    displayName: 'Proposal Command',
    classification: 'Finance',
    description: 'Proposal generation — templates, pricing, DOCX output, activity tracking',
    version: '1.0.0',
  },
  {
    id: 'asset-command',
    displayName: 'Asset Command',
    classification: 'Logistics',
    description: 'Fleet/asset management — vehicles, maintenance, fuel, credentials, inspections',
    version: '1.0.0',
  },
  {
    id: 'readiness-command',
    displayName: 'Readiness Command',
    classification: 'Intelligence',
    description: 'AI readiness assessment — scoring engine, recommendations, templates',
    version: '1.0.0',
  },
  {
    id: 'financial-command',
    displayName: 'Financial Command',
    classification: 'Finance',
    description: 'Financial center — transactions, tax, budgets, bank imports, recurring payments',
    version: '1.0.0',
  },
  {
    id: 'email-command',
    displayName: 'Email Command',
    classification: 'Intelligence',
    description: 'Email analytics — digests, anomaly detection, action items, metrics',
    version: '1.0.0',
  },
  {
    id: 'onboard-command',
    displayName: 'Onboard Command',
    classification: 'Operations',
    description: 'Workspace provisioning — onboarding workflows, queue processing, rollback',
    version: '1.0.0',
  },
  {
    id: 'dispatch-command',
    displayName: 'Dispatch Command',
    classification: 'Operations',
    description: 'HVAC dispatch — requests, drivers, trucks, routing, SLA monitoring',
    version: '1.0.0',
  },
  {
    id: 'govcon-command',
    displayName: 'GovCon Command',
    classification: 'Planning',
    description: 'Federal contracting — opportunities, bid decisions, outreach, compliance',
    version: '1.0.0',
  },
  {
    id: 'training-command',
    displayName: 'Training Command',
    classification: 'Operations',
    description: 'Training platform — courses, enrollments, workshops, certifications',
    version: '1.0.0',
  },
];
