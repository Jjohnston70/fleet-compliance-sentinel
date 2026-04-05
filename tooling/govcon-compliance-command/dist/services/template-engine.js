/**
 * Template Engine - Handlebars-based rendering for compliance documents
 * Replaces {{PLACEHOLDER}} tokens with company-specific data
 */
import Handlebars from "handlebars";
import { PLACEHOLDER_MAP } from "../data/seeds.js";
/**
 * Build replacement values from company record
 */
export function buildReplacementValues(company) {
    const values = {};
    for (const [placeholder, field] of Object.entries(PLACEHOLDER_MAP)) {
        if (field === "_effective_date") {
            values[placeholder] = new Date().toISOString().split("T")[0];
            continue;
        }
        const value = company[field];
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                values[placeholder] = value.join(", ");
            }
            else {
                values[placeholder] = String(value);
            }
        }
        else {
            values[placeholder] = `[${placeholder}]`;
        }
    }
    return values;
}
/**
 * Render a template string with company data
 * Returns rendered content and list of unresolved placeholders
 */
export function renderTemplate(templateContent, company) {
    const values = buildReplacementValues(company);
    const unresolved = [];
    // Register Handlebars helpers
    const hbs = Handlebars.create();
    // Compile and render
    const template = hbs.compile(templateContent, { noEscape: true });
    let rendered = template(values);
    // Check for remaining unresolved placeholders (bracketed format)
    const bracketPattern = /\[([A-Z_]+)\]/g;
    let match;
    while ((match = bracketPattern.exec(rendered)) !== null) {
        if (!unresolved.includes(match[1])) {
            unresolved.push(match[1]);
        }
    }
    return { rendered, unresolvedPlaceholders: unresolved };
}
/**
 * Render a markdown template file loaded from the templates directory
 * Used for the 69+ regulatory templates from compliance-gov-module
 */
export function renderMarkdownTemplate(markdownContent, company) {
    const values = buildReplacementValues(company);
    // Replace [COMPANY_LEGAL_NAME] style tokens used in regulatory templates
    let rendered = markdownContent;
    const tokenMap = {
        "[COMPANY_LEGAL_NAME]": values["LEGAL_NAME"] || values["COMPANY_NAME"] || "[COMPANY_LEGAL_NAME]",
        "[OWNER_NAME]": values["OWNER_NAME"] || "[OWNER_NAME]",
        "[COMPANY_NAME]": values["COMPANY_NAME"] || "[COMPANY_NAME]",
        "[COMPANY_ADDRESS]": values["ADDRESS"] || "[COMPANY_ADDRESS]",
        "[SECURITY_OFFICER]": values["SECURITY_OFFICER"] || "[SECURITY_OFFICER]",
        "[PRIVACY_OFFICER]": values["PRIVACY_OFFICER"] || "[PRIVACY_OFFICER]",
        "[COMPLIANCE_OFFICER]": values["COMPLIANCE_OFFICER"] || "[COMPLIANCE_OFFICER]",
        "[IT_CONTACT]": values["IT_CONTACT"] || "[IT_CONTACT]",
        "[EFFECTIVE_DATE]": values["EFFECTIVE_DATE"] || new Date().toISOString().split("T")[0],
    };
    for (const [token, replacement] of Object.entries(tokenMap)) {
        rendered = rendered.split(token).join(replacement);
    }
    return rendered;
}
//# sourceMappingURL=template-engine.js.map