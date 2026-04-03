export interface Category {
  id: string;
  name: string;
  parentId?: string;
  taxCode?: string;
  type: 'income' | 'expense' | 'transfer';
  keywords: string[];
  deductiblePct: number; // 0-100
}

export const CATEGORY_SEEDS: Category[] = [
  // Income Categories
  {
    id: 'income-salary',
    name: 'Salary & Wages',
    type: 'income',
    keywords: ['salary', 'wage', 'paycheck'],
    deductiblePct: 0,
  },
  {
    id: 'income-freelance',
    name: 'Freelance & Contract Work',
    type: 'income',
    keywords: ['freelance', 'contract', 'invoiced'],
    deductiblePct: 0,
    taxCode: 'GROSS_INCOME',
  },
  {
    id: 'income-interest',
    name: 'Interest Income',
    type: 'income',
    keywords: ['interest', 'apy'],
    deductiblePct: 0,
    taxCode: 'INTEREST_INCOME',
  },
  {
    id: 'income-dividend',
    name: 'Dividend Income',
    type: 'income',
    keywords: ['dividend'],
    deductiblePct: 0,
    taxCode: 'DIVIDEND_INCOME',
  },

  // Business Expense Categories
  {
    id: 'expense-advertising',
    name: 'Advertising',
    type: 'expense',
    keywords: ['ads', 'advertising', 'marketing', 'facebook ads', 'google ads'],
    deductiblePct: 100,
    taxCode: 'ADVERTISING',
  },
  {
    id: 'expense-car',
    name: 'Car & Transportation',
    type: 'expense',
    keywords: ['car', 'gas', 'fuel', 'vehicle', 'mileage', 'parking', 'tolls'],
    deductiblePct: 100,
    taxCode: 'CAR_EXPENSES',
  },
  {
    id: 'expense-commissions',
    name: 'Commissions & Fees',
    type: 'expense',
    keywords: ['commission', 'fee', 'paypal', 'stripe', 'transaction fee'],
    deductiblePct: 100,
    taxCode: 'COMMISSIONS',
  },
  {
    id: 'expense-insurance',
    name: 'Business Insurance',
    type: 'expense',
    keywords: ['insurance', 'usaa insurance'],
    deductiblePct: 100,
    taxCode: 'INSURANCE',
  },
  {
    id: 'expense-legal',
    name: 'Legal & Professional Services',
    type: 'expense',
    keywords: ['legal', 'attorney', 'accountant', 'bookkeeper', 'consultant'],
    deductiblePct: 100,
    taxCode: 'LEGAL_PROFESSIONAL',
  },
  {
    id: 'expense-office',
    name: 'Office Supplies & Equipment',
    type: 'expense',
    keywords: ['office', 'supplies', 'stationery', 'computer', 'desk', 'chair'],
    deductiblePct: 100,
    taxCode: 'OFFICE_EXPENSE',
  },
  {
    id: 'expense-rent',
    name: 'Rent & Lease',
    type: 'expense',
    keywords: ['rent', 'lease', 'office space'],
    deductiblePct: 100,
    taxCode: 'RENT_LEASE',
  },
  {
    id: 'expense-repairs',
    name: 'Repairs & Maintenance',
    type: 'expense',
    keywords: ['repair', 'maintenance', 'fix', 'service'],
    deductiblePct: 100,
    taxCode: 'REPAIRS_MAINTENANCE',
  },
  {
    id: 'expense-supplies',
    name: 'General Supplies',
    type: 'expense',
    keywords: ['supplies', 'materials', 'stock'],
    deductiblePct: 100,
    taxCode: 'SUPPLIES',
  },
  {
    id: 'expense-taxes',
    name: 'Taxes & Licenses',
    type: 'expense',
    keywords: ['tax', 'license', 'permit'],
    deductiblePct: 100,
    taxCode: 'TAXES_LICENSES',
  },
  {
    id: 'expense-travel',
    name: 'Travel',
    type: 'expense',
    keywords: ['flight', 'hotel', 'airbnb', 'uber', 'lyft', 'travel', 'trip', 'conference'],
    deductiblePct: 100,
    taxCode: 'TRAVEL',
  },
  {
    id: 'expense-meals',
    name: 'Meals & Entertainment',
    type: 'expense',
    keywords: ['restaurant', 'meals', 'lunch', 'dinner', 'food', 'coffee', 'bar'],
    deductiblePct: 50,
    taxCode: 'MEALS_ENTERTAINMENT',
  },
  {
    id: 'expense-utilities',
    name: 'Utilities',
    type: 'expense',
    keywords: ['utilities', 'electric', 'water', 'internet', 'phone', 'wifi'],
    deductiblePct: 100,
    taxCode: 'UTILITIES',
  },
  {
    id: 'expense-wages',
    name: 'Wages & Payroll',
    type: 'expense',
    keywords: ['wages', 'payroll', 'employee'],
    deductiblePct: 100,
    taxCode: 'WAGES',
  },

  // Personal Expense Categories
  {
    id: 'personal-groceries',
    name: 'Groceries',
    type: 'expense',
    keywords: ['grocery', 'supermarket', 'whole foods', 'trader joes'],
    deductiblePct: 0,
  },
  {
    id: 'personal-utilities',
    name: 'Personal Utilities',
    type: 'expense',
    keywords: ['water bill', 'electric bill', 'gas bill'],
    deductiblePct: 0,
  },
  {
    id: 'personal-healthcare',
    name: 'Healthcare',
    type: 'expense',
    keywords: ['doctor', 'pharmacy', 'hospital', 'dental', 'prescription'],
    deductiblePct: 0,
  },
  {
    id: 'personal-entertainment',
    name: 'Entertainment',
    type: 'expense',
    keywords: ['movie', 'netflix', 'hulu', 'spotify', 'concert'],
    deductiblePct: 0,
  },

  // Transfer Categories
  {
    id: 'transfer-internal',
    name: 'Internal Transfer',
    type: 'transfer',
    keywords: ['transfer', 'moved', 'internal'],
    deductiblePct: 0,
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORY_SEEDS.find(c => c.id === id);
};

export const categorizeByKeywords = (description: string, categories: Category[] = CATEGORY_SEEDS): Category | undefined => {
  const lowerDesc = description.toLowerCase();
  
  // Find category with matching keyword
  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  // USAA-specific rules
  if (lowerDesc.includes('usaa')) {
    if (lowerDesc.includes('insurance')) {
      return categories.find(c => c.id === 'expense-insurance');
    }
    if (lowerDesc.includes('transfer') || lowerDesc.includes('move')) {
      return categories.find(c => c.id === 'transfer-internal');
    }
    if (lowerDesc.includes('interest')) {
      return categories.find(c => c.id === 'income-interest');
    }
  }

  return undefined;
};
