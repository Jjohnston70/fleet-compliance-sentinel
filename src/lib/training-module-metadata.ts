export interface TrainingModuleMetadata {
  moduleCode: string;
  title: string;
  cfrReference: string;
  phmsaEquivalent: string;
  moduleCategory: 'required';
  recurrenceCycleYears: number;
}

const MODULES: Record<string, TrainingModuleMetadata> = {
  'TNDS-HZ-000': {
    moduleCode: 'TNDS-HZ-000',
    title: 'Hazardous Materials Regulations Introduction',
    cfrReference: '49 CFR Parts 171-180',
    phmsaEquivalent: 'Module 0.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  'TNDS-HZ-001': {
    moduleCode: 'TNDS-HZ-001',
    title: 'Hazardous Materials Table',
    cfrReference: '49 CFR 172.101',
    phmsaEquivalent: 'Module 1.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  'TNDS-HZ-002': {
    moduleCode: 'TNDS-HZ-002',
    title: 'Shipping Papers',
    cfrReference: '49 CFR 172.200-205',
    phmsaEquivalent: 'Module 2.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  'TNDS-HZ-003': {
    moduleCode: 'TNDS-HZ-003',
    title: 'Packaging Requirements',
    cfrReference: '49 CFR Parts 173/178',
    phmsaEquivalent: 'Module 3.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  'TNDS-HZ-004': {
    moduleCode: 'TNDS-HZ-004',
    title: 'Marking Requirements',
    cfrReference: '49 CFR 172.300-338',
    phmsaEquivalent: 'Module 4.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  'TNDS-HZ-005': {
    moduleCode: 'TNDS-HZ-005',
    title: 'Labeling Requirements',
    cfrReference: '49 CFR 172.400-450',
    phmsaEquivalent: 'Module 5.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  'TNDS-HZ-006': {
    moduleCode: 'TNDS-HZ-006',
    title: 'Placarding Requirements',
    cfrReference: '49 CFR 172.500-560',
    phmsaEquivalent: 'Module 6.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  'TNDS-HZ-007a': {
    moduleCode: 'TNDS-HZ-007a',
    title: 'Carrier Requirements: Highway',
    cfrReference: '49 CFR Parts 177/397',
    phmsaEquivalent: 'Module 7.0a',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  'TNDS-HZ-007b': {
    moduleCode: 'TNDS-HZ-007b',
    title: 'Carrier Requirements: Air',
    cfrReference: '49 CFR Part 175',
    phmsaEquivalent: 'Module 7.0b',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  'TNDS-HZ-007c': {
    moduleCode: 'TNDS-HZ-007c',
    title: 'Carrier Requirements: Rail',
    cfrReference: '49 CFR Part 174',
    phmsaEquivalent: 'Module 7.0c',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  'TNDS-HZ-007d': {
    moduleCode: 'TNDS-HZ-007d',
    title: 'Carrier Requirements: Vessel',
    cfrReference: '49 CFR Part 176',
    phmsaEquivalent: 'Module 7.0d',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
  'TNDS-HZ-008': {
    moduleCode: 'TNDS-HZ-008',
    title: 'Security Requirements',
    cfrReference: '49 CFR 172.800-804',
    phmsaEquivalent: 'Module 8.0',
    moduleCategory: 'required',
    recurrenceCycleYears: 3,
  },
};

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
