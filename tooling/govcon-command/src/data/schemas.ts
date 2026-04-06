/**
 * Zod validation schemas for all data models
 */

import { z } from "zod";
import { randomUUID } from "crypto";

const uuidDefault = () => z.string().uuid().optional().default(randomUUID());

export const OpportunitySchema = z.object({
  id: uuidDefault(),
  title: z.string(),
  solicitation_number: z.string(),
  agency: z.string(),
  sub_agency: z.string().optional(),
  posted_date: z.coerce.date(),
  response_deadline: z.coerce.date(),
  set_aside_type: z.enum([
    "SDVOSB",
    "VOSB",
    "8a",
    "HUBZone",
    "WOSB",
    "small_business",
    "full_open",
    "sole_source",
  ]),
  naics_code: z.string(),
  naics_description: z.string(),
  estimated_value: z.number().min(0).optional(),
  place_of_performance: z.string().optional(),
  description: z.string(),
  url: z.string().url().optional(),
  status: z.enum([
    "identified",
    "evaluating",
    "bid",
    "no_bid",
    "submitted",
    "awarded",
    "lost",
  ]),
  source: z.enum(["sam_gov", "manual", "referral"]),
  created_at: z.coerce.date().default(() => new Date()),
  updated_at: z.coerce.date().default(() => new Date()),
});

export const BidDecisionSchema = z.object({
  id: uuidDefault(),
  opportunity_id: z.string().uuid(),
  decision: z.enum(["bid", "no_bid"]),
  score: z.number().min(0).max(100),
  criteria_scores: z.array(
    z.object({
      criterion: z.string(),
      score: z.number().min(0).max(100),
      weight: z.number().min(0).max(1),
      notes: z.string().optional(),
    })
  ),
  decision_date: z.coerce.date().default(() => new Date()),
  decided_by: z.string(),
  rationale: z.string(),
});

export const ProposalSchema = z.object({
  id: uuidDefault(),
  opportunity_id: z.string().uuid(),
  title: z.string(),
  version: z.number().default(1),
  status: z.enum([
    "drafting",
    "review",
    "submitted",
    "accepted",
    "rejected",
  ]),
  submitted_date: z.coerce.date().optional(),
  contract_value: z.number().min(0).optional(),
  period_of_performance: z
    .object({
      start_date: z.coerce.date(),
      end_date: z.coerce.date(),
    })
    .optional(),
  team_members: z.array(z.string()).default([]),
  documents: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        url: z.string().url().optional(),
      })
    )
    .default([]),
  created_at: z.coerce.date().default(() => new Date()),
  updated_at: z.coerce.date().default(() => new Date()),
});

export const OutreachContactSchema = z.object({
  id: uuidDefault(),
  agency: z.string(),
  office: z.string().optional(),
  name: z.string(),
  title: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  osdbu: z.boolean().default(false),
  last_contacted: z.coerce.date().optional(),
  contact_count: z.number().default(0),
  notes: z.string().optional(),
  status: z.enum(["prospect", "warm", "active", "cold"]).default("prospect"),
  created_at: z.coerce.date().default(() => new Date()),
});

export const OutreachActivitySchema = z.object({
  id: uuidDefault(),
  contact_id: z.string().uuid(),
  activity_type: z.enum(["email", "phone", "meeting", "event", "linkedin"]),
  subject: z.string(),
  notes: z.string().optional(),
  follow_up_date: z.coerce.date().optional(),
  completed: z.boolean().default(false),
  created_at: z.coerce.date().default(() => new Date()),
});

export const ComplianceItemSchema = z.object({
  id: uuidDefault(),
  item_type: z.enum(["registration", "certification", "renewal", "filing"]),
  name: z.string(),
  description: z.string(),
  authority: z.enum(["SBA", "SAM", "IRS", "state", "VA"]),
  status: z.enum([
    "current",
    "expiring",
    "expired",
    "pending",
  ]),
  effective_date: z.coerce.date().optional(),
  expiration_date: z.coerce.date().optional(),
  reminder_days_before: z.number().default(30),
  notes: z.string().optional(),
});

export const PipelineMetricsSchema = z.object({
  id: uuidDefault(),
  period: z.enum(["monthly", "quarterly", "annual"]),
  date: z.coerce.date(),
  opportunities_identified: z.number().default(0),
  bids_submitted: z.number().default(0),
  wins: z.number().default(0),
  losses: z.number().default(0),
  no_bids: z.number().default(0),
  total_bid_value: z.number().default(0),
  total_won_value: z.number().default(0),
  win_rate: z.number().min(0).max(1).default(0),
  avg_bid_value: z.number().default(0),
  created_at: z.coerce.date().default(() => new Date()),
});

// TypeScript types inferred from schemas
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type BidDecision = z.infer<typeof BidDecisionSchema>;
export type Proposal = z.infer<typeof ProposalSchema>;
export type OutreachContact = z.infer<typeof OutreachContactSchema>;
export type OutreachActivity = z.infer<typeof OutreachActivitySchema>;
export type ComplianceItem = z.infer<typeof ComplianceItemSchema>;
export type PipelineMetrics = z.infer<typeof PipelineMetricsSchema>;
