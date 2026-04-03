import { InMemoryRepository } from './data/repository.js';
import { StandardApiHandlers } from './api/handlers.js';
import { StandardQueueProcessor } from './hooks/queue-processor.js';
import { StatusReportGenerator } from './reporting/onboarding-status-report.js';
import { AuditReportGenerator } from './reporting/audit-report.js';
// Initialize repository and handlers for tool usage
const repo = new InMemoryRepository();
const handlers = new StandardApiHandlers(repo);
const processor = new StandardQueueProcessor(repo);
const statusReportGen = new StatusReportGenerator(repo);
const auditReportGen = new AuditReportGenerator(repo);
export const TOOLS = [
    {
        name: 'start_onboarding',
        description: 'Start a new onboarding request for employees',
        input_schema: {
            type: 'object',
            properties: {
                client_name: { type: 'string', description: 'Name of the client company' },
                contact_email: { type: 'string', description: 'Contact email for the client' },
                employees: {
                    type: 'array',
                    description: 'List of employees to onboard',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            email: { type: 'string' },
                            department: { type: 'string' },
                            role: { type: 'string' },
                            license_type: { type: 'string' },
                        },
                        required: ['name', 'email', 'department', 'role', 'license_type'],
                    },
                },
            },
            required: ['client_name', 'contact_email', 'employees'],
        },
    },
    {
        name: 'check_onboarding_status',
        description: 'Check the status of an onboarding request',
        input_schema: {
            type: 'object',
            properties: {
                request_id: { type: 'string', description: 'The onboarding request ID' },
            },
            required: ['request_id'],
        },
    },
    {
        name: 'rollback_onboarding',
        description: 'Rollback an onboarding request',
        input_schema: {
            type: 'object',
            properties: {
                request_id: { type: 'string', description: 'The onboarding request ID' },
                reason: { type: 'string', description: 'Reason for rollback' },
            },
            required: ['request_id', 'reason'],
        },
    },
    {
        name: 'get_audit_log',
        description: 'Retrieve audit logs',
        input_schema: {
            type: 'object',
            properties: {
                request_id: { type: 'string', description: 'Filter by request ID' },
                actor: { type: 'string', description: 'Filter by actor' },
            },
            required: [],
        },
    },
    {
        name: 'list_onboarding_requests',
        description: 'List onboarding requests with optional filters',
        input_schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['pending', 'provisioning', 'complete', 'partial', 'failed', 'rolled_back'],
                    description: 'Filter by status',
                },
                mode: { type: 'string', enum: ['test', 'production'], description: 'Filter by mode' },
            },
            required: [],
        },
    },
    {
        name: 'get_queue_status',
        description: 'Get the queue status for an onboarding request',
        input_schema: {
            type: 'object',
            properties: {
                request_id: { type: 'string', description: 'The onboarding request ID' },
            },
            required: ['request_id'],
        },
    },
    {
        name: 'process_next_queue_item',
        description: 'Process the next queued item',
        input_schema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'get_department_config',
        description: 'Get configuration for a department',
        input_schema: {
            type: 'object',
            properties: {
                department: { type: 'string', description: 'Department name' },
            },
            required: ['department'],
        },
    },
    {
        name: 'get_onboarding_status_report',
        description: 'Get onboarding status report',
        input_schema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'get_audit_report',
        description: 'Get audit report',
        input_schema: {
            type: 'object',
            properties: {
                request_id: { type: 'string', description: 'Filter by request ID' },
            },
            required: [],
        },
    },
];
export const toolHandlers = {
    start_onboarding: async (args) => {
        return handlers.startOnboarding(args.client_name, args.contact_email, args.employees);
    },
    check_onboarding_status: async (args) => {
        const status = await handlers.getOnboardingStatus(args.request_id);
        if (!status) {
            throw new Error(`Request ${args.request_id} not found`);
        }
        return status;
    },
    rollback_onboarding: async (args) => {
        return handlers.rollbackOnboarding(args.request_id, args.reason);
    },
    get_audit_log: async (args) => {
        return handlers.getAuditLog({
            requestId: args.request_id,
            actor: args.actor,
        });
    },
    list_onboarding_requests: async (args) => {
        return handlers.listOnboardingRequests({
            status: args.status,
            mode: args.mode,
        });
    },
    get_queue_status: async (args) => {
        return handlers.getQueueStatus(args.request_id);
    },
    process_next_queue_item: async () => {
        const result = await processor.processNextItem();
        if (!result) {
            return { message: 'No queued items to process' };
        }
        return result;
    },
    get_department_config: async (args) => {
        const config = await handlers.getConfig(args.department);
        if (!config) {
            throw new Error(`Config for ${args.department} not found`);
        }
        return config;
    },
    get_onboarding_status_report: async () => {
        return statusReportGen.generate();
    },
    get_audit_report: async (args) => {
        return auditReportGen.generate(args.request_id);
    },
};
export async function executeTool(toolName, args) {
    const handler = toolHandlers[toolName];
    if (!handler) {
        throw new Error(`Unknown tool: ${toolName}`);
    }
    return handler(args);
}
