/**
 * Zod validation schemas for all data models
 * Includes original govcon entities + compliance document generation + intake/maturity
 */
import { z } from "zod";
export declare const OpportunitySchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    title: z.ZodString;
    solicitation_number: z.ZodString;
    agency: z.ZodString;
    sub_agency: z.ZodOptional<z.ZodString>;
    posted_date: z.ZodDate;
    response_deadline: z.ZodDate;
    set_aside_type: z.ZodEnum<["SDVOSB", "VOSB", "8a", "HUBZone", "WOSB", "small_business", "full_open", "sole_source"]>;
    naics_code: z.ZodString;
    naics_description: z.ZodString;
    estimated_value: z.ZodOptional<z.ZodNumber>;
    place_of_performance: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["identified", "evaluating", "bid", "no_bid", "submitted", "awarded", "lost"]>;
    source: z.ZodEnum<["sam_gov", "manual", "referral"]>;
    created_at: z.ZodDefault<z.ZodDate>;
    updated_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    solicitation_number: string;
    agency: string;
    posted_date: Date;
    response_deadline: Date;
    set_aside_type: "SDVOSB" | "VOSB" | "8a" | "HUBZone" | "WOSB" | "small_business" | "full_open" | "sole_source";
    status: "identified" | "evaluating" | "bid" | "no_bid" | "submitted" | "awarded" | "lost";
    naics_code: string;
    naics_description: string;
    description: string;
    source: "sam_gov" | "manual" | "referral";
    created_at: Date;
    updated_at: Date;
    sub_agency?: string | undefined;
    estimated_value?: number | undefined;
    place_of_performance?: string | undefined;
    url?: string | undefined;
}, {
    title: string;
    solicitation_number: string;
    agency: string;
    posted_date: Date;
    response_deadline: Date;
    set_aside_type: "SDVOSB" | "VOSB" | "8a" | "HUBZone" | "WOSB" | "small_business" | "full_open" | "sole_source";
    status: "identified" | "evaluating" | "bid" | "no_bid" | "submitted" | "awarded" | "lost";
    naics_code: string;
    naics_description: string;
    description: string;
    source: "sam_gov" | "manual" | "referral";
    id?: string | undefined;
    sub_agency?: string | undefined;
    estimated_value?: number | undefined;
    place_of_performance?: string | undefined;
    url?: string | undefined;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
}>;
export declare const BidDecisionSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    opportunity_id: z.ZodString;
    decision: z.ZodEnum<["bid", "no_bid"]>;
    score: z.ZodNumber;
    criteria_scores: z.ZodArray<z.ZodObject<{
        criterion: z.ZodString;
        score: z.ZodNumber;
        weight: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        score: number;
        criterion: string;
        weight: number;
        notes?: string | undefined;
    }, {
        score: number;
        criterion: string;
        weight: number;
        notes?: string | undefined;
    }>, "many">;
    decision_date: z.ZodDefault<z.ZodDate>;
    decided_by: z.ZodString;
    rationale: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    opportunity_id: string;
    decision: "bid" | "no_bid";
    score: number;
    criteria_scores: {
        score: number;
        criterion: string;
        weight: number;
        notes?: string | undefined;
    }[];
    decision_date: Date;
    decided_by: string;
    rationale: string;
}, {
    opportunity_id: string;
    decision: "bid" | "no_bid";
    score: number;
    criteria_scores: {
        score: number;
        criterion: string;
        weight: number;
        notes?: string | undefined;
    }[];
    decided_by: string;
    rationale: string;
    id?: string | undefined;
    decision_date?: Date | undefined;
}>;
export declare const ProposalSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    opportunity_id: z.ZodString;
    title: z.ZodString;
    version: z.ZodDefault<z.ZodNumber>;
    status: z.ZodEnum<["drafting", "review", "submitted", "accepted", "rejected"]>;
    submitted_date: z.ZodOptional<z.ZodDate>;
    contract_value: z.ZodOptional<z.ZodNumber>;
    period_of_performance: z.ZodOptional<z.ZodObject<{
        start_date: z.ZodDate;
        end_date: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start_date: Date;
        end_date: Date;
    }, {
        start_date: Date;
        end_date: Date;
    }>>;
    team_members: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    documents: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        name: string;
        url?: string | undefined;
    }, {
        type: string;
        name: string;
        url?: string | undefined;
    }>, "many">>;
    created_at: z.ZodDefault<z.ZodDate>;
    updated_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    status: "submitted" | "drafting" | "review" | "accepted" | "rejected";
    created_at: Date;
    updated_at: Date;
    opportunity_id: string;
    version: number;
    team_members: string[];
    documents: {
        type: string;
        name: string;
        url?: string | undefined;
    }[];
    submitted_date?: Date | undefined;
    contract_value?: number | undefined;
    period_of_performance?: {
        start_date: Date;
        end_date: Date;
    } | undefined;
}, {
    title: string;
    status: "submitted" | "drafting" | "review" | "accepted" | "rejected";
    opportunity_id: string;
    id?: string | undefined;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
    version?: number | undefined;
    submitted_date?: Date | undefined;
    contract_value?: number | undefined;
    period_of_performance?: {
        start_date: Date;
        end_date: Date;
    } | undefined;
    team_members?: string[] | undefined;
    documents?: {
        type: string;
        name: string;
        url?: string | undefined;
    }[] | undefined;
}>;
export declare const OutreachContactSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    agency: z.ZodString;
    office: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    title: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    osdbu: z.ZodDefault<z.ZodBoolean>;
    last_contacted: z.ZodOptional<z.ZodDate>;
    contact_count: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["prospect", "warm", "active", "cold"]>>;
    created_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    agency: string;
    status: "prospect" | "warm" | "active" | "cold";
    created_at: Date;
    name: string;
    email: string;
    osdbu: boolean;
    contact_count: number;
    notes?: string | undefined;
    office?: string | undefined;
    phone?: string | undefined;
    last_contacted?: Date | undefined;
}, {
    title: string;
    agency: string;
    name: string;
    email: string;
    id?: string | undefined;
    status?: "prospect" | "warm" | "active" | "cold" | undefined;
    created_at?: Date | undefined;
    notes?: string | undefined;
    office?: string | undefined;
    phone?: string | undefined;
    osdbu?: boolean | undefined;
    last_contacted?: Date | undefined;
    contact_count?: number | undefined;
}>;
export declare const OutreachActivitySchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    contact_id: z.ZodString;
    activity_type: z.ZodEnum<["email", "phone", "meeting", "event", "linkedin"]>;
    subject: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    follow_up_date: z.ZodOptional<z.ZodDate>;
    completed: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: Date;
    contact_id: string;
    activity_type: "email" | "phone" | "meeting" | "event" | "linkedin";
    subject: string;
    completed: boolean;
    notes?: string | undefined;
    follow_up_date?: Date | undefined;
}, {
    contact_id: string;
    activity_type: "email" | "phone" | "meeting" | "event" | "linkedin";
    subject: string;
    id?: string | undefined;
    created_at?: Date | undefined;
    notes?: string | undefined;
    follow_up_date?: Date | undefined;
    completed?: boolean | undefined;
}>;
export declare const ComplianceItemSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    item_type: z.ZodEnum<["registration", "certification", "renewal", "filing"]>;
    name: z.ZodString;
    description: z.ZodString;
    authority: z.ZodEnum<["SBA", "SAM", "IRS", "state", "VA"]>;
    status: z.ZodEnum<["current", "expiring", "expired", "pending"]>;
    effective_date: z.ZodOptional<z.ZodDate>;
    expiration_date: z.ZodOptional<z.ZodDate>;
    reminder_days_before: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    authority: "SBA" | "SAM" | "IRS" | "state" | "VA";
    id: string;
    status: "pending" | "current" | "expiring" | "expired";
    description: string;
    name: string;
    item_type: "registration" | "certification" | "filing" | "renewal";
    reminder_days_before: number;
    notes?: string | undefined;
    effective_date?: Date | undefined;
    expiration_date?: Date | undefined;
}, {
    authority: "SBA" | "SAM" | "IRS" | "state" | "VA";
    status: "pending" | "current" | "expiring" | "expired";
    description: string;
    name: string;
    item_type: "registration" | "certification" | "filing" | "renewal";
    id?: string | undefined;
    notes?: string | undefined;
    effective_date?: Date | undefined;
    expiration_date?: Date | undefined;
    reminder_days_before?: number | undefined;
}>;
export declare const PipelineMetricsSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    period: z.ZodEnum<["monthly", "quarterly", "annual"]>;
    date: z.ZodDate;
    opportunities_identified: z.ZodDefault<z.ZodNumber>;
    bids_submitted: z.ZodDefault<z.ZodNumber>;
    wins: z.ZodDefault<z.ZodNumber>;
    losses: z.ZodDefault<z.ZodNumber>;
    no_bids: z.ZodDefault<z.ZodNumber>;
    total_bid_value: z.ZodDefault<z.ZodNumber>;
    total_won_value: z.ZodDefault<z.ZodNumber>;
    win_rate: z.ZodDefault<z.ZodNumber>;
    avg_bid_value: z.ZodDefault<z.ZodNumber>;
    created_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    date: Date;
    created_at: Date;
    period: "monthly" | "quarterly" | "annual";
    opportunities_identified: number;
    bids_submitted: number;
    wins: number;
    losses: number;
    no_bids: number;
    total_bid_value: number;
    total_won_value: number;
    win_rate: number;
    avg_bid_value: number;
}, {
    date: Date;
    period: "monthly" | "quarterly" | "annual";
    id?: string | undefined;
    created_at?: Date | undefined;
    opportunities_identified?: number | undefined;
    bids_submitted?: number | undefined;
    wins?: number | undefined;
    losses?: number | undefined;
    no_bids?: number | undefined;
    total_bid_value?: number | undefined;
    total_won_value?: number | undefined;
    win_rate?: number | undefined;
    avg_bid_value?: number | undefined;
}>;
export declare const CompanyRecordSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    company_name: z.ZodString;
    legal_name: z.ZodOptional<z.ZodString>;
    owner_name: z.ZodOptional<z.ZodString>;
    owner_title: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    zip: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    ein: z.ZodOptional<z.ZodString>;
    uei: z.ZodOptional<z.ZodString>;
    cage_code: z.ZodOptional<z.ZodString>;
    duns: z.ZodOptional<z.ZodString>;
    naics_primary: z.ZodOptional<z.ZodString>;
    business_type: z.ZodOptional<z.ZodString>;
    employee_count: z.ZodOptional<z.ZodNumber>;
    annual_revenue: z.ZodOptional<z.ZodNumber>;
    year_founded: z.ZodOptional<z.ZodNumber>;
    certifications: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    security_officer: z.ZodOptional<z.ZodString>;
    privacy_officer: z.ZodOptional<z.ZodString>;
    compliance_officer: z.ZodOptional<z.ZodString>;
    it_contact: z.ZodOptional<z.ZodString>;
    cloud_provider: z.ZodOptional<z.ZodString>;
    data_types_handled: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    frameworks_required: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    federal_contracts: z.ZodDefault<z.ZodBoolean>;
    handles_phi: z.ZodDefault<z.ZodBoolean>;
    handles_pci: z.ZodDefault<z.ZodBoolean>;
    handles_cui: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodDefault<z.ZodDate>;
    updated_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: Date;
    updated_at: Date;
    company_name: string;
    certifications: string[];
    data_types_handled: string[];
    frameworks_required: string[];
    federal_contracts: boolean;
    handles_phi: boolean;
    handles_pci: boolean;
    handles_cui: boolean;
    state?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    legal_name?: string | undefined;
    owner_name?: string | undefined;
    owner_title?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    zip?: string | undefined;
    website?: string | undefined;
    ein?: string | undefined;
    uei?: string | undefined;
    cage_code?: string | undefined;
    duns?: string | undefined;
    naics_primary?: string | undefined;
    business_type?: string | undefined;
    employee_count?: number | undefined;
    annual_revenue?: number | undefined;
    year_founded?: number | undefined;
    security_officer?: string | undefined;
    privacy_officer?: string | undefined;
    compliance_officer?: string | undefined;
    it_contact?: string | undefined;
    cloud_provider?: string | undefined;
}, {
    company_name: string;
    state?: string | undefined;
    id?: string | undefined;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    legal_name?: string | undefined;
    owner_name?: string | undefined;
    owner_title?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    zip?: string | undefined;
    website?: string | undefined;
    ein?: string | undefined;
    uei?: string | undefined;
    cage_code?: string | undefined;
    duns?: string | undefined;
    naics_primary?: string | undefined;
    business_type?: string | undefined;
    employee_count?: number | undefined;
    annual_revenue?: number | undefined;
    year_founded?: number | undefined;
    certifications?: string[] | undefined;
    security_officer?: string | undefined;
    privacy_officer?: string | undefined;
    compliance_officer?: string | undefined;
    it_contact?: string | undefined;
    cloud_provider?: string | undefined;
    data_types_handled?: string[] | undefined;
    frameworks_required?: string[] | undefined;
    federal_contracts?: boolean | undefined;
    handles_phi?: boolean | undefined;
    handles_pci?: boolean | undefined;
    handles_cui?: boolean | undefined;
}>;
export declare const CompliancePackageSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    company_id: z.ZodString;
    package_number: z.ZodNumber;
    package_name: z.ZodString;
    slug: z.ZodString;
    status: z.ZodEnum<["pending", "generating", "complete", "error"]>;
    generated_content: z.ZodOptional<z.ZodString>;
    output_formats: z.ZodDefault<z.ZodArray<z.ZodEnum<["docx", "pdf", "markdown"]>, "many">>;
    generated_at: z.ZodOptional<z.ZodDate>;
    error_message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "pending" | "generating" | "complete" | "error";
    company_id: string;
    package_number: number;
    package_name: string;
    slug: string;
    output_formats: ("docx" | "pdf" | "markdown")[];
    generated_content?: string | undefined;
    generated_at?: Date | undefined;
    error_message?: string | undefined;
}, {
    status: "pending" | "generating" | "complete" | "error";
    company_id: string;
    package_number: number;
    package_name: string;
    slug: string;
    id?: string | undefined;
    generated_content?: string | undefined;
    output_formats?: ("docx" | "pdf" | "markdown")[] | undefined;
    generated_at?: Date | undefined;
    error_message?: string | undefined;
}>;
export declare const IntakeResultSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    company_id: z.ZodString;
    business_type: z.ZodString;
    employee_count: z.ZodNumber;
    handles_phi: z.ZodDefault<z.ZodBoolean>;
    handles_pci: z.ZodDefault<z.ZodBoolean>;
    federal_contracts: z.ZodDefault<z.ZodBoolean>;
    cloud_platform: z.ZodOptional<z.ZodString>;
    frameworks_requested: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    recommended_skills: z.ZodArray<z.ZodObject<{
        skill_id: z.ZodString;
        skill_name: z.ZodString;
        priority: z.ZodEnum<["CRITICAL", "HIGH", "MEDIUM", "LOW"]>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        skill_id: string;
        skill_name: string;
        priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }, {
        skill_id: string;
        skill_name: string;
        priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }>, "many">;
    created_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: Date;
    business_type: string;
    employee_count: number;
    federal_contracts: boolean;
    handles_phi: boolean;
    handles_pci: boolean;
    company_id: string;
    frameworks_requested: string[];
    recommended_skills: {
        skill_id: string;
        skill_name: string;
        priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }[];
    cloud_platform?: string | undefined;
}, {
    business_type: string;
    employee_count: number;
    company_id: string;
    recommended_skills: {
        skill_id: string;
        skill_name: string;
        priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }[];
    id?: string | undefined;
    created_at?: Date | undefined;
    federal_contracts?: boolean | undefined;
    handles_phi?: boolean | undefined;
    handles_pci?: boolean | undefined;
    cloud_platform?: string | undefined;
    frameworks_requested?: string[] | undefined;
}>;
export declare const MaturityTrackerSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    company_id: z.ZodString;
    template_statuses: z.ZodArray<z.ZodObject<{
        template_id: z.ZodString;
        skill_domain: z.ZodString;
        governance_level: z.ZodString;
        status: z.ZodEnum<["not_started", "in_progress", "implemented", "verified"]>;
        notes: z.ZodOptional<z.ZodString>;
        updated_at: z.ZodDefault<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        status: "not_started" | "in_progress" | "implemented" | "verified";
        updated_at: Date;
        template_id: string;
        skill_domain: string;
        governance_level: string;
        notes?: string | undefined;
    }, {
        status: "not_started" | "in_progress" | "implemented" | "verified";
        template_id: string;
        skill_domain: string;
        governance_level: string;
        updated_at?: Date | undefined;
        notes?: string | undefined;
    }>, "many">;
    overall_score: z.ZodDefault<z.ZodNumber>;
    last_scored_at: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    company_id: string;
    template_statuses: {
        status: "not_started" | "in_progress" | "implemented" | "verified";
        updated_at: Date;
        template_id: string;
        skill_domain: string;
        governance_level: string;
        notes?: string | undefined;
    }[];
    overall_score: number;
    last_scored_at?: Date | undefined;
}, {
    company_id: string;
    template_statuses: {
        status: "not_started" | "in_progress" | "implemented" | "verified";
        template_id: string;
        skill_domain: string;
        governance_level: string;
        updated_at?: Date | undefined;
        notes?: string | undefined;
    }[];
    id?: string | undefined;
    overall_score?: number | undefined;
    last_scored_at?: Date | undefined;
}>;
export declare const BidDocumentSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    opportunity_id: z.ZodString;
    document_type: z.ZodEnum<["capability_statement", "technical_approach", "past_performance", "price_proposal", "management_approach", "compliance_matrix", "full_proposal"]>;
    title: z.ZodString;
    content: z.ZodString;
    output_formats: z.ZodDefault<z.ZodArray<z.ZodEnum<["docx", "pdf", "markdown"]>, "many">>;
    status: z.ZodEnum<["draft", "review", "final"]>;
    version: z.ZodDefault<z.ZodNumber>;
    created_at: z.ZodDefault<z.ZodDate>;
    updated_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    status: "review" | "draft" | "final";
    created_at: Date;
    updated_at: Date;
    opportunity_id: string;
    version: number;
    output_formats: ("docx" | "pdf" | "markdown")[];
    document_type: "capability_statement" | "technical_approach" | "past_performance" | "price_proposal" | "management_approach" | "compliance_matrix" | "full_proposal";
    content: string;
}, {
    title: string;
    status: "review" | "draft" | "final";
    opportunity_id: string;
    document_type: "capability_statement" | "technical_approach" | "past_performance" | "price_proposal" | "management_approach" | "compliance_matrix" | "full_proposal";
    content: string;
    id?: string | undefined;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
    version?: number | undefined;
    output_formats?: ("docx" | "pdf" | "markdown")[] | undefined;
}>;
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type BidDecision = z.infer<typeof BidDecisionSchema>;
export type Proposal = z.infer<typeof ProposalSchema>;
export type OutreachContact = z.infer<typeof OutreachContactSchema>;
export type OutreachActivity = z.infer<typeof OutreachActivitySchema>;
export type ComplianceItem = z.infer<typeof ComplianceItemSchema>;
export type PipelineMetrics = z.infer<typeof PipelineMetricsSchema>;
export type CompanyRecord = z.infer<typeof CompanyRecordSchema>;
export type CompliancePackage = z.infer<typeof CompliancePackageSchema>;
export type IntakeResult = z.infer<typeof IntakeResultSchema>;
export type MaturityTracker = z.infer<typeof MaturityTrackerSchema>;
export type BidDocument = z.infer<typeof BidDocumentSchema>;
//# sourceMappingURL=schemas.d.ts.map