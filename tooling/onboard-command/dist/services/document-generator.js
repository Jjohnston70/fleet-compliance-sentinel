import { DocumentType } from '../data/schema.js';
const TEMPLATES = {
    [DocumentType.Proposal]: `
PROPOSAL

Client: {{CLIENT_NAME}}
Contact: {{CONTACT_EMAIL}}
Date: {{DATE}}

OVERVIEW
This proposal outlines the onboarding process for {{EMPLOYEE_COUNT}} employees.

SCOPE
- User creation and configuration
- License assignment
- Drive and folder structure setup
- Email label configuration
- Documentation generation

TIMELINE
- Onboarding Start: {{DATE}}
- Estimated Completion: {{COMPLETION_DATE}}

DELIVERABLES
{{#EMPLOYEES}}
- {{NAME}} ({{EMAIL}}) - {{DEPARTMENT}} - {{ROLE}}
{{/EMPLOYEES}}

NEXT STEPS
1. Client approval
2. Onboarding initiation
3. Weekly status updates
4. Final verification
`,
    [DocumentType.MSA]: `
MASTER SERVICE AGREEMENT

Effective Date: {{DATE}}
Client: {{CLIENT_NAME}}
Contact: {{CONTACT_EMAIL}}

1. SERVICES
Onboarding services for {{EMPLOYEE_COUNT}} employees into Google Workspace.

2. DELIVERABLES
- User provisioning
- License management
- Workspace configuration
- Documentation

3. TIMELINE
Service completion targeted for {{COMPLETION_DATE}}.

4. SUPPORT
Post-onboarding support available for 30 days.

5. TERMS
Standard service terms apply.
`,
    [DocumentType.SOW]: `
STATEMENT OF WORK

Project: Google Workspace Onboarding
Client: {{CLIENT_NAME}}
Contact: {{CONTACT_EMAIL}}
Date: {{DATE}}

OBJECTIVES
Provision {{EMPLOYEE_COUNT}} employees into Google Workspace with full configuration.

SCOPE OF WORK
1. User Creation
   - Create accounts for each employee
   - Set up recovery options

2. License Assignment
   - Apply appropriate license types
   - Configure license features

3. Drive and Folders
   - Create shared drives
   - Establish folder structure:
{{#FOLDERS}}
   - {{FOLDER}}
{{/FOLDERS}}

4. Email Configuration
   - Set up email labels
   - Configure forwarding as needed

5. Documentation
   - Generate onboarding documentation
   - Provide user checklists

TIMELINE
- Start Date: {{DATE}}
- Expected Completion: {{COMPLETION_DATE}}
- Final Verification: {{VERIFICATION_DATE}}

ASSUMPTIONS
- Client provides employee list with required information
- Client has Google Workspace domain
`,
    [DocumentType.Checklist]: `
ONBOARDING CHECKLIST

Client: {{CLIENT_NAME}}
Date: {{DATE}}

PRE-ONBOARDING
☐ Employee information verified
☐ Department assignments confirmed
☐ License types assigned
☐ Manager notifications sent

ONBOARDING EXECUTION
{{#EMPLOYEES}}
Employee: {{NAME}} ({{EMAIL}})
Department: {{DEPARTMENT}}
Role: {{ROLE}}

☐ User account created
☐ License assigned
☐ Google Drive created
☐ Folders created:
  {{#FOLDERS}}☐ {{FOLDER}}
  {{/FOLDERS}}
☐ Email labels configured
☐ Documentation generated
☐ Welcome email sent

{{/EMPLOYEES}}

POST-ONBOARDING
☐ All users confirmed active
☐ Shared drives accessible
☐ Email working correctly
☐ Documentation delivered
☐ User training scheduled
☐ 30-day check-in scheduled
`,
};
export class StandardDocumentGenerator {
    constructor(repo) {
        this.repo = repo;
    }
    async generateDocument(requestId, type, data) {
        const request = await this.repo.getRequest(requestId);
        if (!request) {
            throw new Error(`Request ${requestId} not found`);
        }
        const template = TEMPLATES[type];
        if (!template) {
            throw new Error(`Unknown document type: ${type}`);
        }
        // Enrich data with request information
        const enrichedData = {
            CLIENT_NAME: request.client_name,
            CONTACT_EMAIL: request.contact_email,
            EMPLOYEE_COUNT: request.employees.length,
            DATE: new Date().toISOString().split('T')[0],
            COMPLETION_DATE: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            VERIFICATION_DATE: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            EMPLOYEES: request.employees,
            FOLDERS: data.folders || [],
            ...data,
        };
        const content = this.renderTemplate(template, enrichedData);
        // In a real scenario, this would be uploaded to Cloud Storage
        const contentUrl = `gs://onboarding-docs/${requestId}/${type}-${Date.now()}.txt`;
        return this.repo.createDocument({
            request_id: requestId,
            document_type: type,
            title: `${type} - ${request.client_name}`,
            content_url: contentUrl,
            generated_by: 'template',
        });
    }
    renderTemplate(template, data) {
        let result = template;
        // Simple variable replacement {{VAR_NAME}}
        result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return String(data[key] || match);
        });
        // Simple list iteration {{#ARRAY}}...{{/ARRAY}}
        result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
            const items = data[key];
            if (!Array.isArray(items)) {
                return '';
            }
            return items
                .map((item) => {
                let itemContent = content;
                // Replace simple variable refs within list items
                if (typeof item === 'object' && item !== null) {
                    itemContent = itemContent.replace(/\{\{(\w+)\}\}/g, (m, k) => {
                        return String(item[k] || m);
                    });
                }
                else {
                    itemContent = itemContent.replace(/\{\{(\w+)\}\}/, item);
                }
                return itemContent;
            })
                .join('');
        });
        return result;
    }
}
