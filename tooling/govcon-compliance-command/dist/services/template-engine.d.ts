/**
 * Template Engine - Handlebars-based rendering for compliance documents
 * Replaces {{PLACEHOLDER}} tokens with company-specific data
 */
import { CompanyRecord } from "../data/schemas.js";
/**
 * Build replacement values from company record
 */
export declare function buildReplacementValues(company: CompanyRecord): Record<string, string>;
/**
 * Render a template string with company data
 * Returns rendered content and list of unresolved placeholders
 */
export declare function renderTemplate(templateContent: string, company: CompanyRecord): {
    rendered: string;
    unresolvedPlaceholders: string[];
};
/**
 * Render a markdown template file loaded from the templates directory
 * Used for the 69+ regulatory templates from compliance-gov-module
 */
export declare function renderMarkdownTemplate(markdownContent: string, company: CompanyRecord): string;
//# sourceMappingURL=template-engine.d.ts.map