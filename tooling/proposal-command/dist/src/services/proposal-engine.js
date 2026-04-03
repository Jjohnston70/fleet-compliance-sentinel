/**
 * Proposal Engine - Template Rendering & Document Generation
 * Renders proposal templates with client data and line items
 */
import Handlebars from 'handlebars';
import { CONFIG } from '../config';
export class ProposalEngine {
    /**
     * Generate complete proposal document from template + data
     */
    static generateProposal(data) {
        const templateData = this.buildTemplateContext(data);
        // Render all sections
        const sections = data.template.sections
            .sort((a, b) => a.order - b.order)
            .map(section => {
            const compiled = Handlebars.compile(section.contentTemplate);
            return compiled(templateData);
        })
            .join('\n\n');
        // Build cover page
        const cover = this.renderCoverPage(data);
        // Build pricing section
        const pricing = this.renderPricingSection(data);
        // Build terms section
        const terms = this.renderTermsSection(data);
        // Assemble complete document
        return `${cover}\n\n${sections}\n\n${pricing}\n\n${terms}`;
    }
    /**
     * Build Handlebars context with all available placeholders
     */
    static buildTemplateContext(data) {
        const { proposal, lineItems, pricingSummary } = data;
        return {
            // Client information
            CLIENT_COMPANY: data.clientCompany,
            CLIENT_NAME: data.clientName,
            CLIENT_EMAIL: data.clientEmail,
            // Project information
            PROJECT_TITLE: proposal.title,
            PROJECT_DESCRIPTION: data.projectDescription,
            SERVICE_TYPE: proposal.serviceType,
            TIMELINE: data.timeline,
            // Proposal metadata
            PROPOSAL_NUMBER: proposal.proposalNumber,
            PROPOSAL_DATE: this.formatDate(proposal.createdAt),
            PROPOSAL_ID: proposal.id,
            VALID_UNTIL: this.formatDate(proposal.validUntil),
            // Pricing information
            SUBTOTAL: this.formatCurrency(pricingSummary.subtotal),
            TAX_RATE: `${pricingSummary.taxRate}%`,
            TAX_AMOUNT: this.formatCurrency(pricingSummary.taxAmount),
            DISCOUNT_PERCENT: `${pricingSummary.discountPercent}%`,
            DISCOUNT_AMOUNT: this.formatCurrency(pricingSummary.discountAmount),
            TOTAL_VALUE: this.formatCurrency(pricingSummary.total),
            // Company branding
            COMPANY_NAME: CONFIG.BRANDING.NAME,
            COMPANY_WEBSITE: CONFIG.BRANDING.WEBSITE,
            COMPANY_PHONE: CONFIG.BRANDING.PHONE,
            COMPANY_ADDRESS: CONFIG.BRANDING.ADDRESS,
            PRIMARY_COLOR: CONFIG.BRANDING.PRIMARY_COLOR,
            SECONDARY_COLOR: CONFIG.BRANDING.SECONDARY_COLOR,
            // Line items as formatted table
            LINE_ITEMS: lineItems,
            LINE_ITEMS_HTML: this.renderLineItemsTable(lineItems),
            // Notes
            NOTES: proposal.notes || 'N/A',
        };
    }
    /**
     * Render proposal cover page
     */
    static renderCoverPage(data) {
        return `
# PROPOSAL

## ${data.proposal.title}

**Prepared for:**  
${data.clientCompany}  
${data.clientName}  

**Prepared by:**  
${CONFIG.BRANDING.NAME}  
${CONFIG.BRANDING.PHONE}  
${CONFIG.BRANDING.WEBSITE}  

**Date:** ${this.formatDate(data.proposal.createdAt)}  
**Proposal ID:** ${data.proposal.proposalNumber}  
**Valid Until:** ${this.formatDate(data.proposal.validUntil)}  
    `;
    }
    /**
     * Render pricing section with line items and summary
     */
    static renderPricingSection(data) {
        const { lineItems, pricingSummary } = data;
        const lineItemsTable = lineItems
            .map(item => `| ${item.description} | ${item.quantity} | $${item.unitPrice.toFixed(2)} | $${item.total.toFixed(2)} |`)
            .join('\n');
        return `
## Investment & Pricing

| Description | Qty | Unit Price | Total |
|---|---|---|---|
${lineItemsTable}
| **SUBTOTAL** | | | **$${pricingSummary.subtotal.toFixed(2)}** |
| Tax (${pricingSummary.taxRate}%) | | | **$${pricingSummary.taxAmount.toFixed(2)}** |
${pricingSummary.discountPercent > 0 ? `| Discount (${pricingSummary.discountPercent}%) | | | **-$${pricingSummary.discountAmount.toFixed(2)}** |` : ''}
| **TOTAL** | | | **$${pricingSummary.total.toFixed(2)}** |

### Payment Terms
- 50% upon project initiation
- 25% at midpoint milestone
- 25% upon project completion

**Valid until:** ${this.formatDate(data.proposal.validUntil)}
    `;
    }
    /**
     * Render terms & conditions section
     */
    static renderTermsSection(data) {
        return `
## Terms & Conditions

${data.template.defaultTerms}

---

**Signature Block**

Client: _________________________ Date: _______

Company: ________________________ Date: _______

${CONFIG.BRANDING.NAME}

Authorized Representative: _________ Date: _______
    `;
    }
    /**
     * Render line items as HTML table for email
     */
    static renderLineItemsTable(lineItems) {
        const rows = lineItems
            .map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.description}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.total.toFixed(2)}</td>
      </tr>
    `)
            .join('');
        return `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: ${CONFIG.BRANDING.PRIMARY_COLOR}; color: white;">
          <th style="padding: 8px; text-align: left;">Description</th>
          <th style="padding: 8px; text-align: center;">Qty</th>
          <th style="padding: 8px; text-align: right;">Unit Price</th>
          <th style="padding: 8px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    `;
    }
    /**
     * Format date as MM/DD/YYYY
     */
    static formatDate(date) {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${month}/${day}/${year}`;
    }
    /**
     * Format number as USD currency
     */
    static formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }
}
