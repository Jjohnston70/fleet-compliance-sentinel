export interface TrainingModuleMetadata {
  moduleCode: string;
  title: string;
  cfrReference: string;
  phmsaEquivalent: string;
  moduleCategory: 'required' | 'nfpa_awareness' | 'nfpa_operations' | 'supplemental';
  recurrenceCycleYears: number;
}

const REQUIRED_MODULES: TrainingModuleMetadata[] = [
  {
    moduleCode: 'TNDS-HZ-000',
    title: 'Hazardous Materials Regulations Introduction',
    cfrReference: '49 CFR Parts 171-180',
    phmsaEquivalent: 'Module 0.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'TNDS-HZ-001',
    title: 'Hazardous Materials Table',
    cfrReference: '49 CFR 172.101',
    phmsaEquivalent: 'Module 1.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'TNDS-HZ-002',
    title: 'Shipping Papers',
    cfrReference: '49 CFR 172.200-205',
    phmsaEquivalent: 'Module 2.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'TNDS-HZ-003',
    title: 'Packaging Requirements',
    cfrReference: '49 CFR Parts 173/178',
    phmsaEquivalent: 'Module 3.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'TNDS-HZ-004',
    title: 'Marking Requirements',
    cfrReference: '49 CFR 172.300-338',
    phmsaEquivalent: 'Module 4.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'TNDS-HZ-005',
    title: 'Labeling Requirements',
    cfrReference: '49 CFR 172.400-450',
    phmsaEquivalent: 'Module 5.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'TNDS-HZ-006',
    title: 'Placarding Requirements',
    cfrReference: '49 CFR 172.500-560',
    phmsaEquivalent: 'Module 6.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'TNDS-HZ-007a',
    title: 'Carrier Requirements: Highway',
    cfrReference: '49 CFR Parts 177/397',
    phmsaEquivalent: 'Module 7.0a',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'TNDS-HZ-007b',
    title: 'Carrier Requirements: Air',
    cfrReference: '49 CFR Part 175',
    phmsaEquivalent: 'Module 7.0b',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'TNDS-HZ-007c',
    title: 'Carrier Requirements: Rail',
    cfrReference: '49 CFR Part 174',
    phmsaEquivalent: 'Module 7.0c',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'TNDS-HZ-007d',
    title: 'Carrier Requirements: Vessel',
    cfrReference: '49 CFR Part 176',
    phmsaEquivalent: 'Module 7.0d',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'TNDS-HZ-008',
    title: 'Security Requirements',
    cfrReference: '49 CFR 172.800-804',
    phmsaEquivalent: 'Module 8.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
];

const NFPA_AWARENESS_MODULES: TrainingModuleMetadata[] = [
  {
    moduleCode: 'NFPA-AW-01',
    title: 'NFPA 472 Awareness Unit 01: Hazard Recognition',
    cfrReference: 'NFPA 472 (Awareness)',
    phmsaEquivalent: 'NFPA-AW-01',
    moduleCategory: 'nfpa_awareness',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-AW-02',
    title: 'NFPA 472 Awareness Unit 02: Initial Isolation and Protection',
    cfrReference: 'NFPA 472 (Awareness)',
    phmsaEquivalent: 'NFPA-AW-02',
    moduleCategory: 'nfpa_awareness',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-AW-03',
    title: 'NFPA 472 Awareness Unit 03: Notification and Documentation',
    cfrReference: 'NFPA 472 (Awareness)',
    phmsaEquivalent: 'NFPA-AW-03',
    moduleCategory: 'nfpa_awareness',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-AW-04',
    title: 'NFPA 472 Awareness Unit 04: ERG Application Basics',
    cfrReference: 'NFPA 472 (Awareness)',
    phmsaEquivalent: 'NFPA-AW-04',
    moduleCategory: 'nfpa_awareness',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-AW-05',
    title: 'NFPA 472 Awareness Unit 05: Incident Safety and PPE Awareness',
    cfrReference: 'NFPA 472 (Awareness)',
    phmsaEquivalent: 'NFPA-AW-05',
    moduleCategory: 'nfpa_awareness',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-AW-06',
    title: 'NFPA 472 Awareness Unit 06: Public Protection Actions',
    cfrReference: 'NFPA 472 (Awareness)',
    phmsaEquivalent: 'NFPA-AW-06',
    moduleCategory: 'nfpa_awareness',
    recurrenceCycleYears: 3,
  },
];

const NFPA_OPERATIONS_MODULES: TrainingModuleMetadata[] = [
  {
    moduleCode: 'NFPA-OP-01',
    title: 'NFPA 472 Operations Unit 01: Incident Assessment',
    cfrReference: 'NFPA 472 (Operations)',
    phmsaEquivalent: 'NFPA-OP-01',
    moduleCategory: 'nfpa_operations',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-OP-02',
    title: 'NFPA 472 Operations Unit 02: Hazard and Risk Evaluation',
    cfrReference: 'NFPA 472 (Operations)',
    phmsaEquivalent: 'NFPA-OP-02',
    moduleCategory: 'nfpa_operations',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-OP-03',
    title: 'NFPA 472 Operations Unit 03: Defensive Control Options',
    cfrReference: 'NFPA 472 (Operations)',
    phmsaEquivalent: 'NFPA-OP-03',
    moduleCategory: 'nfpa_operations',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-OP-04',
    title: 'NFPA 472 Operations Unit 04: Protective Actions',
    cfrReference: 'NFPA 472 (Operations)',
    phmsaEquivalent: 'NFPA-OP-04',
    moduleCategory: 'nfpa_operations',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-OP-05',
    title: 'NFPA 472 Operations Unit 05: Site Safety Plan Execution',
    cfrReference: 'NFPA 472 (Operations)',
    phmsaEquivalent: 'NFPA-OP-05',
    moduleCategory: 'nfpa_operations',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-OP-06',
    title: 'NFPA 472 Operations Unit 06: PPE Selection and Use',
    cfrReference: 'NFPA 472 (Operations)',
    phmsaEquivalent: 'NFPA-OP-06',
    moduleCategory: 'nfpa_operations',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-OP-07',
    title: 'NFPA 472 Operations Unit 07: Product Control and Containment',
    cfrReference: 'NFPA 472 (Operations)',
    phmsaEquivalent: 'NFPA-OP-07',
    moduleCategory: 'nfpa_operations',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-OP-08',
    title: 'NFPA 472 Operations Unit 08: Decontamination Support',
    cfrReference: 'NFPA 472 (Operations)',
    phmsaEquivalent: 'NFPA-OP-08',
    moduleCategory: 'nfpa_operations',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-OP-09',
    title: 'NFPA 472 Operations Unit 09: Victim and Exposure Management',
    cfrReference: 'NFPA 472 (Operations)',
    phmsaEquivalent: 'NFPA-OP-09',
    moduleCategory: 'nfpa_operations',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-OP-10',
    title: 'NFPA 472 Operations Unit 10: Incident Documentation',
    cfrReference: 'NFPA 472 (Operations)',
    phmsaEquivalent: 'NFPA-OP-10',
    moduleCategory: 'nfpa_operations',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-OP-11',
    title: 'NFPA 472 Operations Unit 11: Multi-Agency Coordination',
    cfrReference: 'NFPA 472 (Operations)',
    phmsaEquivalent: 'NFPA-OP-11',
    moduleCategory: 'nfpa_operations',
    recurrenceCycleYears: 3,
  },
  {
    moduleCode: 'NFPA-OP-12',
    title: 'NFPA 472 Operations Unit 12: Post-Incident Recovery',
    cfrReference: 'NFPA 472 (Operations)',
    phmsaEquivalent: 'NFPA-OP-12',
    moduleCategory: 'nfpa_operations',
    recurrenceCycleYears: 3,
  },
];

const SUPPLEMENTAL_MODULES: TrainingModuleMetadata[] = [
  {
    moduleCode: 'PHMSA-GRANT',
    title: 'PHMSA Hazmat Grant Program Overview',
    cfrReference: '49 CFR 172 Subpart H',
    phmsaEquivalent: 'PHMSA-GRANT',
    moduleCategory: 'supplemental',
    recurrenceCycleYears: 3,
  },
];

const MODULES = Object.fromEntries(
  [...REQUIRED_MODULES, ...NFPA_AWARENESS_MODULES, ...NFPA_OPERATIONS_MODULES, ...SUPPLEMENTAL_MODULES]
    .map((module) => [module.moduleCode, module]),
) as Record<string, TrainingModuleMetadata>;

export function getTrainingModuleMetadata(moduleCode: string): TrainingModuleMetadata {
  return MODULES[moduleCode] || {
    moduleCode,
    title: moduleCode,
    cfrReference: '49 CFR 172 Subpart H',
    phmsaEquivalent: moduleCode,
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  };
}
