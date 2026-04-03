import { z } from 'zod';
import crypto from 'crypto';

// Zod schemas with optional IDs that default to UUID
const uuidSchema = z.string().uuid().optional().default(() => crypto.randomUUID());

// Email Digest schema
export const InsightSchema = z.object({
  type: z.enum(['info', 'warning', 'critical']),
  description: z.string(),
  severity: z.enum(['info', 'warning', 'critical']),
});

export const AnomalySchema = z.object({
  metric: z.string(),
  expected: z.number(),
  actual: z.number(),
  deviation_pct: z.number(),
});

export const CategoryBreakdownSchema = z.record(
  z.object({
    count: z.number().int().nonnegative(),
    pct: z.number().min(0).max(100),
  })
);

export const EmailDigestSchema = z.object({
  id: uuidSchema,
  report_type: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'alert', 'custom']),
  date: z.coerce.date(),
  total_emails_analyzed: z.number().int().nonnegative(),
  urgent_count: z.number().int().nonnegative(),
  categories: CategoryBreakdownSchema,
  insights: z.array(InsightSchema),
  anomalies: z.array(AnomalySchema),
  generated_html: z.string(),
  generated_at: z.coerce.date(),
});

export type EmailDigest = z.infer<typeof EmailDigestSchema>;
export type Insight = z.infer<typeof InsightSchema>;
export type Anomaly = z.infer<typeof AnomalySchema>;

// Digest Config schema
export const ScheduleEntrySchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  day_of_week: z.number().int().min(0).max(6).optional(),
  hour: z.number().int().min(0).max(23),
});

export const RecipientSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  role: z.string(),
});

export const BrandingSchema = z.object({
  primary_color: z.string().default('#0077cc'),
  secondary_color: z.string().default('#333333'),
  accent_color: z.string().default('#ff9900'),
  logo_url: z.string().url().optional(),
});

export const DigestFilterSchema = z.object({
  label_include: z.array(z.string()).optional(),
  label_exclude: z.array(z.string()).optional(),
  sender_vip: z.array(z.string()).optional(),
});

export const DigestConfigSchema = z.object({
  id: z.string().email(), // user_email is the ID
  report_types_enabled: z.array(z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'alert', 'custom'])),
  schedule: z.record(z.string(), ScheduleEntrySchema),
  filters: DigestFilterSchema,
  recipients: z.array(RecipientSchema),
  timezone: z.string().default('America/Denver'),
  branding: BrandingSchema,
});

export type DigestConfig = z.infer<typeof DigestConfigSchema>;
export type ScheduleEntry = z.infer<typeof ScheduleEntrySchema>;
export type Recipient = z.infer<typeof RecipientSchema>;
export type Branding = z.infer<typeof BrandingSchema>;

// Email Metrics schema
export const TopSenderSchema = z.object({
  email: z.string().email(),
  count: z.number().int().positive(),
});

export const EmailMetricsSchema = z.object({
  id: uuidSchema,
  date: z.coerce.date(),
  period_type: z.enum(['daily', 'weekly', 'monthly']),
  total_received: z.number().int().nonnegative(),
  total_sent: z.number().int().nonnegative(),
  avg_response_time_minutes: z.number().nonnegative(),
  unread_count: z.number().int().nonnegative(),
  thread_count: z.number().int().nonnegative(),
  top_senders: z.array(TopSenderSchema),
  category_breakdown: CategoryBreakdownSchema,
  created_at: z.coerce.date(),
});

export type EmailMetrics = z.infer<typeof EmailMetricsSchema>;
export type TopSender = z.infer<typeof TopSenderSchema>;

// Action Items schema
export const ActionItemSchema = z.object({
  id: uuidSchema,
  digest_id: z.string().uuid(),
  email_thread_id: z.string(),
  subject: z.string(),
  sender: z.string().email(),
  description: z.string(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  due_date: z.coerce.date().optional(),
  status: z.enum(['pending', 'completed', 'dismissed']),
  created_at: z.coerce.date(),
});

export type ActionItem = z.infer<typeof ActionItemSchema>;
