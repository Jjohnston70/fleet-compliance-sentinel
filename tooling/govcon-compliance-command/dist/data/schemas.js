/**
 * Zod validation schemas for all data models
 * Includes original govcon entities + compliance document generation + intake/maturity
 */
import { z } from "zod";
import { randomUUID } from "crypto";
const uuidDefault = () => z.string().uuid().optional().default(randomUUID());
// ============================================================
// GOVCON PIPELINE ENTITIES (from govcon-command)
// ============================================================
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
    criteria_scores: z.array(z.object({
        criterion: z.string(),
        score: z.number().min(0).max(100),
        weight: z.number().min(0).max(1),
        notes: z.string().optional(),
    })),
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
        .array(z.object({
        name: z.string(),
        type: z.string(),
        url: z.string().url().optional(),
    }))
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
// ============================================================
// COMPLIANCE DOCUMENT GENERATION ENTITIES (from compliance-command)
// ============================================================
export const CompanyRecordSchema = z.object({
    id: uuidDefault(),
    company_name: z.string(),
    legal_name: z.string().optional(),
    owner_name: z.string().optional(),
    owner_title: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
    ein: z.string().optional(),
    uei: z.string().optional(),
    cage_code: z.string().optional(),
    duns: z.string().optional(),
    naics_primary: z.string().optional(),
    business_type: z.string().optional(),
    employee_count: z.number().optional(),
    annual_revenue: z.number().optional(),
    year_founded: z.number().optional(),
    certifications: z.array(z.string()).default([]),
    security_officer: z.string().optional(),
    privacy_officer: z.string().optional(),
    compliance_officer: z.string().optional(),
    it_contact: z.string().optional(),
    cloud_provider: z.string().optional(),
    data_types_handled: z.array(z.string()).default([]),
    frameworks_required: z.array(z.string()).default([]),
    federal_contracts: z.boolean().default(false),
    handles_phi: z.boolean().default(false),
    handles_pci: z.boolean().default(false),
    handles_cui: z.boolean().default(false),
    created_at: z.coerce.date().default(() => new Date()),
    updated_at: z.coerce.date().default(() => new Date()),
});
export const CompliancePackageSchema = z.object({
    id: uuidDefault(),
    company_id: z.string().uuid(),
    package_number: z.number().min(1).max(7),
    package_name: z.string(),
    slug: z.string(),
    status: z.enum(["pending", "generating", "complete", "error"]),
    generated_content: z.string().optional(),
    output_formats: z.array(z.enum(["docx", "pdf", "markdown"])).default([]),
    generated_at: z.coerce.date().optional(),
    error_message: z.string().optional(),
});
// ============================================================
// INTAKE & MATURITY TRACKING ENTITIES (from compliance-gov-module)
// ============================================================
export const IntakeResultSchema = z.object({
    id: uuidDefault(),
    company_id: z.string().uuid(),
    business_type: z.string(),
    employee_count: z.number(),
    handles_phi: z.boolean().default(false),
    handles_pci: z.boolean().default(false),
    federal_contracts: z.boolean().default(false),
    cloud_platform: z.string().optional(),
    frameworks_requested: z.array(z.string()).default([]),
    recommended_skills: z.array(z.object({
        skill_id: z.string(),
        skill_name: z.string(),
        priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
        reason: z.string(),
    })),
    created_at: z.coerce.date().default(() => new Date()),
});
export const MaturityTrackerSchema = z.object({
    id: uuidDefault(),
    company_id: z.string().uuid(),
    template_statuses: z.array(z.object({
        template_id: z.string(),
        skill_domain: z.string(),
        governance_level: z.string(),
        status: z.enum(["not_started", "in_progress", "implemented", "verified"]),
        notes: z.string().optional(),
        updated_at: z.coerce.date().default(() => new Date()),
    })),
    overall_score: z.number().min(0).max(10).default(0),
    last_scored_at: z.coerce.date().optional(),
});
// ============================================================
// BID DOCUMENT ENTITY (new for merged module)
// ============================================================
export const BidDocumentSchema = z.object({
    id: uuidDefault(),
    opportunity_id: z.string().uuid(),
    document_type: z.enum([
        "capability_statement",
        "technical_approach",
        "past_performance",
        "price_proposal",
        "management_approach",
        "compliance_matrix",
        "full_proposal",
    ]),
    title: z.string(),
    content: z.string(),
    output_formats: z.array(z.enum(["docx", "pdf", "markdown"])).default([]),
    status: z.enum(["draft", "review", "final"]),
    version: z.number().default(1),
    created_at: z.coerce.date().default(() => new Date()),
    updated_at: z.coerce.date().default(() => new Date()),
});
//# sourceMappingURL=schemas.js.map