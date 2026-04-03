import { z } from 'zod';
import { randomUUID } from 'crypto';

// Base schemas
const uuidSchema = z.string().uuid().optional().default(() => randomUUID());

// Transaction
export const TransactionSchema = z.object({
  id: uuidSchema,
  date: z.date(),
  description: z.string(),
  amount: z.number().int(), // cents
  categoryId: z.string(),
  accountId: z.string(),
  entity: z.enum(['personal', 'business']).or(z.string()),
  taxRelevant: z.boolean().default(false),
  taxCode: z.string().optional(),
  receiptUrl: z.string().optional(),
  importSource: z.enum(['manual', 'usaa_csv', 'ent_json']).default('manual'),
  importBatchId: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// Account
export const AccountSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  type: z.enum(['checking', 'savings', 'credit', 'investment']),
  institution: z.string(),
  lastFour: z.string().length(4),
  balance: z.number().int(), // cents
  entity: z.enum(['personal', 'business']).or(z.string()),
  active: z.boolean().default(true),
});

export type Account = z.infer<typeof AccountSchema>;

// Category
export const CategorySchema = z.object({
  id: uuidSchema,
  name: z.string(),
  parentId: z.string().optional(),
  taxCode: z.string().optional(),
  type: z.enum(['income', 'expense', 'transfer']),
  keywords: z.array(z.string()),
  deductiblePct: z.number().min(0).max(100).int(),
});

export type Category = z.infer<typeof CategorySchema>;

// Tax Item
export const TaxItemSchema = z.object({
  id: uuidSchema,
  year: z.number().int(),
  categoryId: z.string(),
  amount: z.number().int(), // cents
  deductibleAmount: z.number().int(), // cents
  entity: z.enum(['personal', 'business']).or(z.string()),
  schedule: z.enum(['C', 'SE', 'A', '1']),
  lineNumber: z.string(),
});

export type TaxItem = z.infer<typeof TaxItemSchema>;

// Budget
export const BudgetSchema = z.object({
  id: uuidSchema,
  categoryId: z.string(),
  month: z.string(), // YYYY-MM
  planned: z.number().int(), // cents
  actual: z.number().int(), // cents
  entity: z.enum(['personal', 'business']).or(z.string()),
});

export type Budget = z.infer<typeof BudgetSchema>;

// Recurring Payment
export const RecurringPaymentSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  amount: z.number().int(), // cents
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'annual']),
  nextDate: z.date(),
  accountId: z.string(),
  categoryId: z.string(),
  entity: z.enum(['personal', 'business']).or(z.string()),
  active: z.boolean().default(true),
});

export type RecurringPayment = z.infer<typeof RecurringPaymentSchema>;

// Import Batch
export const ImportBatchSchema = z.object({
  id: uuidSchema,
  source: z.enum(['usaa_csv', 'ent_json', 'other']),
  filename: z.string(),
  rowCount: z.number().int(),
  importedCount: z.number().int(),
  skippedCount: z.number().int(),
  errorCount: z.number().int(),
  importedAt: z.date().default(() => new Date()),
  importedBy: z.string(),
});

export type ImportBatch = z.infer<typeof ImportBatchSchema>;

// Audit Log
export const AuditLogSchema = z.object({
  id: uuidSchema,
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  before: z.record(z.unknown()).optional(),
  after: z.record(z.unknown()).optional(),
  actor: z.string(),
  timestamp: z.date().default(() => new Date()),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;
