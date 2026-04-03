export interface TaxCode {
  code: string;
  schedule: 'C' | 'SE' | 'A' | '1';
  lineNumber: string;
  description: string;
  deductible: boolean;
  category: string;
}

export const TAX_CODES: TaxCode[] = [
  // Schedule C - Business Income & Deductions
  { code: 'GROSS_INCOME', schedule: 'C', lineNumber: '1c', description: 'Gross income', deductible: false, category: 'business_income' },
  { code: 'ADVERTISING', schedule: 'C', lineNumber: '8', description: 'Advertising', deductible: true, category: 'business_expense' },
  { code: 'CAR_EXPENSES', schedule: 'C', lineNumber: '9', description: 'Car and truck expenses', deductible: true, category: 'business_expense' },
  { code: 'COMMISSIONS', schedule: 'C', lineNumber: '10', description: 'Commissions and fees', deductible: true, category: 'business_expense' },
  { code: 'DEPRECIATION', schedule: 'C', lineNumber: '13', description: 'Depreciation', deductible: true, category: 'business_expense' },
  { code: 'INSURANCE', schedule: 'C', lineNumber: '15', description: 'Insurance (business)', deductible: true, category: 'business_expense' },
  { code: 'LEGAL_PROFESSIONAL', schedule: 'C', lineNumber: '17', description: 'Legal and professional services', deductible: true, category: 'business_expense' },
  { code: 'OFFICE_EXPENSE', schedule: 'C', lineNumber: '18', description: 'Office expense', deductible: true, category: 'business_expense' },
  { code: 'RENT_LEASE', schedule: 'C', lineNumber: '20', description: 'Rent or lease', deductible: true, category: 'business_expense' },
  { code: 'REPAIRS_MAINTENANCE', schedule: 'C', lineNumber: '21', description: 'Repairs and maintenance', deductible: true, category: 'business_expense' },
  { code: 'SUPPLIES', schedule: 'C', lineNumber: '22', description: 'Supplies', deductible: true, category: 'business_expense' },
  { code: 'TAXES_LICENSES', schedule: 'C', lineNumber: '23', description: 'Taxes and licenses', deductible: true, category: 'business_expense' },
  { code: 'TRAVEL', schedule: 'C', lineNumber: '24', description: 'Travel', deductible: true, category: 'business_expense' },
  { code: 'MEALS_ENTERTAINMENT', schedule: 'C', lineNumber: '27a', description: 'Meals and entertainment', deductible: true, category: 'business_expense' },
  { code: 'UTILITIES', schedule: 'C', lineNumber: '25', description: 'Utilities', deductible: true, category: 'business_expense' },
  { code: 'WAGES', schedule: 'C', lineNumber: '26', description: 'Wages', deductible: true, category: 'business_expense' },
  { code: 'OTHER_DEDUCTIONS', schedule: 'C', lineNumber: '27b', description: 'Other deductions', deductible: true, category: 'business_expense' },

  // Schedule SE - Self-Employment Tax
  { code: 'SE_TAX', schedule: 'SE', lineNumber: '15', description: 'Self-employment tax', deductible: false, category: 'self_employment_tax' },

  // Schedule A - Itemized Deductions
  { code: 'MEDICAL_DENTAL', schedule: 'A', lineNumber: '1', description: 'Medical and dental expenses', deductible: true, category: 'personal_deduction' },
  { code: 'STATE_LOCAL_TAXES', schedule: 'A', lineNumber: '5', description: 'State and local taxes', deductible: true, category: 'personal_deduction' },
  { code: 'MORTGAGE_INTEREST', schedule: 'A', lineNumber: '8', description: 'Mortgage interest', deductible: true, category: 'personal_deduction' },
  { code: 'CHARITABLE', schedule: 'A', lineNumber: '11', description: 'Charitable contributions', deductible: true, category: 'personal_deduction' },

  // Schedule 1 - Additional Income
  { code: 'INTEREST_INCOME', schedule: '1', lineNumber: '8a', description: 'Interest income', deductible: false, category: 'other_income' },
  { code: 'DIVIDEND_INCOME', schedule: '1', lineNumber: '9a', description: 'Dividend income', deductible: false, category: 'other_income' },
];

export const getTaxCodeByCode = (code: string): TaxCode | undefined => {
  return TAX_CODES.find(tc => tc.code === code);
};

export const getTaxCodesBySchedule = (schedule: string): TaxCode[] => {
  return TAX_CODES.filter(tc => tc.schedule === schedule);
};
