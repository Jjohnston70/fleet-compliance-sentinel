/**
 * LLM Tool Definitions
 * Define tools for Claude/LLM integration with the proposal command
 */
export const toolHandlers = {
    generate_proposal: async (params) => ({ action: 'generate_proposal', ...params }),
    get_proposal: async (params) => ({ action: 'get_proposal', ...params }),
    list_proposals: async (params) => ({ action: 'list_proposals', ...params }),
    update_proposal_status: async (params) => ({ action: 'update_proposal_status', ...params }),
    update_proposal: async (params) => ({ action: 'update_proposal', ...params }),
    mark_proposal_sent: async (params) => ({ action: 'mark_proposal_sent', ...params }),
    mark_proposal_viewed: async (params) => ({ action: 'mark_proposal_viewed', ...params }),
    mark_proposal_accepted: async (params) => ({ action: 'mark_proposal_accepted', ...params }),
    mark_proposal_declined: async (params) => ({ action: 'mark_proposal_declined', ...params }),
    mark_proposal_expired: async (params) => ({ action: 'mark_proposal_expired', ...params }),
    get_proposal_activity: async (params) => ({ action: 'get_proposal_activity', ...params }),
    render_proposal_document: async (params) => ({ action: 'render_proposal_document', ...params }),
};
export const PROPOSAL_COMMAND_TOOLS = [
    {
        name: 'generate_proposal',
        description: 'Create a new proposal for a client with line items and pricing',
        parameters: {
            type: 'object',
            properties: {
                clientId: { type: 'string', description: 'Client UUID' },
                templateId: { type: 'string', description: 'Template ID (e.g., tpl-web-dev, tpl-data-command)' },
                title: { type: 'string', description: 'Proposal title' },
                description: { type: 'string', description: 'Proposal description' },
                totalAmount: { type: 'number', description: 'Total proposal amount in dollars' },
                validityDays: { type: 'number', description: 'Number of days the proposal is valid (default: 30)' },
            },
            required: ['clientId', 'templateId', 'title', 'description', 'totalAmount'],
        },
    },
    {
        name: 'get_proposal',
        description: 'Retrieve a proposal by its ID',
        parameters: {
            type: 'object',
            properties: {
                proposalId: { type: 'string', description: 'Proposal UUID' },
            },
            required: ['proposalId'],
        },
    },
    {
        name: 'list_proposals',
        description: 'List proposals with optional filters by client, status, or date range',
        parameters: {
            type: 'object',
            properties: {
                clientId: { type: 'string', description: 'Filter by client UUID' },
                status: { type: 'string', enum: ['draft', 'generated', 'sent', 'viewed', 'accepted', 'declined', 'expired'], description: 'Filter by status' },
                fromDate: { type: 'string', description: 'Filter from date (ISO 8601)' },
                toDate: { type: 'string', description: 'Filter to date (ISO 8601)' },
            },
        },
    },
    {
        name: 'update_proposal_status',
        description: 'Update the status of a proposal (e.g., mark as sent, viewed, accepted)',
        parameters: {
            type: 'object',
            properties: {
                proposalId: { type: 'string', description: 'Proposal UUID' },
                status: { type: 'string', enum: ['draft', 'generated', 'sent', 'viewed', 'accepted', 'declined', 'expired'], description: 'New status' },
                reason: { type: 'string', description: 'Optional reason (used for declined status)' },
            },
            required: ['proposalId', 'status'],
        },
    },
    {
        name: 'update_proposal',
        description: 'Update proposal fields like title, description, or amount',
        parameters: {
            type: 'object',
            properties: {
                proposalId: { type: 'string', description: 'Proposal UUID' },
                title: { type: 'string', description: 'Updated title' },
                description: { type: 'string', description: 'Updated description' },
                totalAmount: { type: 'number', description: 'Updated total amount' },
            },
            required: ['proposalId'],
        },
    },
    {
        name: 'mark_proposal_sent',
        description: 'Mark a proposal as sent to the client',
        parameters: {
            type: 'object',
            properties: {
                proposalId: { type: 'string', description: 'Proposal UUID' },
            },
            required: ['proposalId'],
        },
    },
    {
        name: 'mark_proposal_viewed',
        description: 'Mark a proposal as viewed by the client',
        parameters: {
            type: 'object',
            properties: {
                proposalId: { type: 'string', description: 'Proposal UUID' },
            },
            required: ['proposalId'],
        },
    },
    {
        name: 'mark_proposal_accepted',
        description: 'Mark a proposal as accepted by the client',
        parameters: {
            type: 'object',
            properties: {
                proposalId: { type: 'string', description: 'Proposal UUID' },
            },
            required: ['proposalId'],
        },
    },
    {
        name: 'mark_proposal_declined',
        description: 'Mark a proposal as declined by the client with an optional reason',
        parameters: {
            type: 'object',
            properties: {
                proposalId: { type: 'string', description: 'Proposal UUID' },
                reason: { type: 'string', description: 'Reason for decline' },
            },
            required: ['proposalId'],
        },
    },
    {
        name: 'mark_proposal_expired',
        description: 'Mark a proposal as expired',
        parameters: {
            type: 'object',
            properties: {
                proposalId: { type: 'string', description: 'Proposal UUID' },
            },
            required: ['proposalId'],
        },
    },
    {
        name: 'get_proposal_activity',
        description: 'Get the activity/audit trail history for a proposal',
        parameters: {
            type: 'object',
            properties: {
                proposalId: { type: 'string', description: 'Proposal UUID' },
            },
            required: ['proposalId'],
        },
    },
    {
        name: 'render_proposal_document',
        description: 'Render a proposal into a formatted document using Handlebars templates',
        parameters: {
            type: 'object',
            properties: {
                proposalId: { type: 'string', description: 'Proposal UUID' },
                format: { type: 'string', enum: ['html', 'docx'], description: 'Output format (default: html)' },
            },
            required: ['proposalId'],
        },
    },
];
