import { z } from 'zod';
import { randomUUID } from 'crypto';
// Enums
export var OnboardingStatus;
(function (OnboardingStatus) {
    OnboardingStatus["Pending"] = "pending";
    OnboardingStatus["Provisioning"] = "provisioning";
    OnboardingStatus["Complete"] = "complete";
    OnboardingStatus["Partial"] = "partial";
    OnboardingStatus["Failed"] = "failed";
    OnboardingStatus["RolledBack"] = "rolled_back";
})(OnboardingStatus || (OnboardingStatus = {}));
export var OnboardingMode;
(function (OnboardingMode) {
    OnboardingMode["Test"] = "test";
    OnboardingMode["Production"] = "production";
})(OnboardingMode || (OnboardingMode = {}));
export var QueueActionType;
(function (QueueActionType) {
    QueueActionType["CreateUser"] = "create_user";
    QueueActionType["AssignLicense"] = "assign_license";
    QueueActionType["CreateDrive"] = "create_drive";
    QueueActionType["CreateFolders"] = "create_folders";
    QueueActionType["CreateLabels"] = "create_labels";
    QueueActionType["GenerateDocs"] = "generate_docs";
})(QueueActionType || (QueueActionType = {}));
export var QueueItemStatus;
(function (QueueItemStatus) {
    QueueItemStatus["Queued"] = "queued";
    QueueItemStatus["Processing"] = "processing";
    QueueItemStatus["Complete"] = "complete";
    QueueItemStatus["Failed"] = "failed";
    QueueItemStatus["Skipped"] = "skipped";
})(QueueItemStatus || (QueueItemStatus = {}));
export var DocumentType;
(function (DocumentType) {
    DocumentType["Proposal"] = "proposal";
    DocumentType["MSA"] = "msa";
    DocumentType["SOW"] = "sow";
    DocumentType["Checklist"] = "checklist";
})(DocumentType || (DocumentType = {}));
export var AuditStatus;
(function (AuditStatus) {
    AuditStatus["Success"] = "success";
    AuditStatus["Failure"] = "failure";
    AuditStatus["Rollback"] = "rollback";
})(AuditStatus || (AuditStatus = {}));
// Zod Schemas
export const EmployeeSchema = z.object({
    id: z.string().uuid().optional().default(() => randomUUID()),
    name: z.string().min(1),
    email: z.string().email(),
    department: z.string().min(1),
    role: z.string().min(1),
    license_type: z.string().min(1),
});
export const ErrorLogEntrySchema = z.object({
    message: z.string(),
    step: z.string(),
    timestamp: z.date(),
});
export const OnboardingRequestSchema = z.object({
    id: z.string().uuid().optional().default(() => randomUUID()),
    client_name: z.string().min(1),
    contact_email: z.string().email(),
    employees: z.array(EmployeeSchema),
    status: z.nativeEnum(OnboardingStatus).default(OnboardingStatus.Pending),
    mode: z.nativeEnum(OnboardingMode).default(OnboardingMode.Test),
    created_at: z.date().default(() => new Date()),
    completed_at: z.date().optional(),
    error_log: z.array(ErrorLogEntrySchema).default([]),
});
export const ProvisioningQueueItemSchema = z.object({
    id: z.string().uuid().optional().default(() => randomUUID()),
    request_id: z.string().uuid(),
    employee_email: z.string().email(),
    employee_id: z.string().uuid(),
    action: z.nativeEnum(QueueActionType),
    status: z.nativeEnum(QueueItemStatus).default(QueueItemStatus.Queued),
    retry_count: z.number().int().min(0).default(0),
    result: z.record(z.any()).nullable().default(null),
    created_at: z.date().default(() => new Date()),
    processed_at: z.date().optional(),
});
export const OnboardingConfigSchema = z.object({
    id: z.string().min(1),
    folder_template: z.array(z.string()).default([
        '0-Operations',
        '1-Contracts',
        '2-Deliverables',
        '3-Automations',
        '4-Reports',
        '5-Finance',
        'Templates',
    ]),
    label_template: z.array(z.string()).default([]),
    license_type: z.string().default('standard'),
    document_templates: z.array(z.string()).default([]),
    auto_provision: z.boolean().default(false),
    notification_emails: z.array(z.string().email()).default([]),
});
export const GeneratedDocumentSchema = z.object({
    id: z.string().uuid().optional().default(() => randomUUID()),
    request_id: z.string().uuid(),
    document_type: z.nativeEnum(DocumentType),
    title: z.string().min(1),
    content_url: z.string().url(),
    generated_by: z.enum(['vertex_ai', 'template']).default('template'),
    created_at: z.date().default(() => new Date()),
});
export const AuditLogEntrySchema = z.object({
    id: z.string().uuid().optional().default(() => randomUUID()),
    request_id: z.string().uuid().optional().nullable(),
    action: z.string().min(1),
    actor: z.string().min(1),
    target: z.string().min(1),
    status: z.nativeEnum(AuditStatus),
    details: z.record(z.any()).default({}),
    timestamp: z.date().default(() => new Date()),
});
