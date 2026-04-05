/**
 * Bid Document Service - Generate government contract bid documents
 * Creates capability statements, technical approaches, compliance matrices,
 * and full proposal packages in DOCX/PDF/Markdown
 */

import { BidDocument, Opportunity, CompanyRecord } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";
import { COMPANY_CONFIG, BRAND_COLORS } from "../config/index.js";
import { generateDocumentOutputs, GeneratedDocument } from "./document-generator.js";

type BidDocumentType = BidDocument["document_type"];

/**
 * Template generators for each bid document type
 */
const BID_TEMPLATES: Record<
  BidDocumentType,
  (opp: Opportunity, company: CompanyRecord) => string
> = {
  capability_statement: (opp, company) => `# Capability Statement
## ${company.company_name || COMPANY_CONFIG.name}
### ${company.certifications?.join(", ") || COMPANY_CONFIG.certification}

## Company Overview
${company.company_name || COMPANY_CONFIG.name} is a ${company.business_type || "technology consulting"} firm based in ${company.city || "Colorado Springs"}, ${company.state || "CO"}. Founded in ${company.year_founded || "2024"}, we specialize in data strategy, operational automation, and systems integration for federal, state, and commercial clients.

**Owner:** ${company.owner_name || COMPANY_CONFIG.owner}
**UEI:** ${company.uei || COMPANY_CONFIG.uei}
**CAGE Code:** ${company.cage_code || COMPANY_CONFIG.cageCode}
**Primary NAICS:** ${company.naics_primary || "541512"}
**Employees:** ${company.employee_count || "1-10"}

## Core Competencies
- Data Analytics and Business Intelligence
- Workflow Automation and Process Optimization
- Cloud Infrastructure (Google Cloud, Firebase)
- Custom Software Development (Next.js, TypeScript, Python)
- Federal Compliance (NIST 800-171, CMMC)
- Operational Command Center Design

## Differentiators
- Veteran-owned (20-year Army veteran, Airborne Infantry, Bronze Star)
- SBA-certified VOSB/SDVOSB
- Fixed-scope, fixed-price delivery model
- Small business agility with enterprise-grade standards

## Past Performance
[Past performance narratives to be completed per solicitation requirements]

## Contact Information
${company.owner_name || COMPANY_CONFIG.owner}
${company.phone || COMPANY_CONFIG.phone}
${company.email || COMPANY_CONFIG.email}
${company.website || COMPANY_CONFIG.website}`,

  technical_approach: (opp, company) => `# Technical Approach
## ${opp.title}
### Solicitation: ${opp.solicitation_number}
### Submitted by: ${company.company_name || COMPANY_CONFIG.name}

## 1. Understanding of Requirements
${opp.description}

${company.company_name || COMPANY_CONFIG.name} understands the requirements outlined in solicitation ${opp.solicitation_number} issued by ${opp.agency}${opp.sub_agency ? ` / ${opp.sub_agency}` : ""}. Our approach directly addresses the stated objectives while leveraging our proven expertise in data systems and operational automation.

## 2. Technical Solution
### 2.1 Architecture Overview
[Describe proposed technical architecture]

### 2.2 Technology Stack
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Node.js/Python, REST APIs
- Data: PostgreSQL/Firebase, Analytics pipelines
- Cloud: Google Cloud Platform (FedRAMP authorized)
- Security: NIST 800-171 compliant infrastructure

### 2.3 Implementation Methodology
Phase 1: Discovery and Requirements Validation (Week 1-2)
Phase 2: Architecture and Design (Week 3-4)
Phase 3: Development and Integration (Week 5-8)
Phase 4: Testing and Quality Assurance (Week 9-10)
Phase 5: Deployment and Knowledge Transfer (Week 11-12)

## 3. Quality Assurance
- Automated testing (unit, integration, end-to-end)
- Code review process with documented standards
- User acceptance testing with stakeholder involvement
- Post-deployment monitoring and issue resolution

## 4. Risk Mitigation
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Requirements change | Medium | Medium | Agile sprints with bi-weekly reviews |
| Technical complexity | Low | High | Proven technology stack, POC validation |
| Timeline pressure | Medium | Medium | Parallel workstreams, buffer allocation |

## 5. Key Personnel
[Key personnel qualifications and roles to be specified]`,

  past_performance: (opp, company) => `# Past Performance
## ${company.company_name || COMPANY_CONFIG.name}
### In Response to: ${opp.solicitation_number}

## Relevant Experience
[Document 3-5 relevant past performance references per solicitation instructions]

### Reference Template
**Contract/Project Name:** [Name]
**Client/Agency:** [Agency]
**Contract Number:** [Number]
**Period of Performance:** [Start] - [End]
**Contract Value:** [Value]
**Point of Contact:** [Name, Title, Phone, Email]

**Scope of Work:**
[Brief description of work performed]

**Relevance to Current Solicitation:**
[How this experience directly relates to ${opp.title}]

**Key Outcomes:**
- [Quantifiable result 1]
- [Quantifiable result 2]
- [Quantifiable result 3]`,

  price_proposal: (opp, company) => `# Price Proposal
## ${opp.title}
### Solicitation: ${opp.solicitation_number}
### Submitted by: ${company.company_name || COMPANY_CONFIG.name}

## Pricing Summary
**Estimated Contract Value:** $${(opp.estimated_value || 0).toLocaleString()}
**Pricing Type:** [Firm Fixed Price / Time & Materials / Cost Plus]
**Period of Performance:** [Start Date] through [End Date]

## Cost Breakdown

### Labor Categories
| Category | Hours | Rate | Total |
|----------|-------|------|-------|
| Project Manager | [Hours] | $[Rate] | $[Total] |
| Senior Developer | [Hours] | $[Rate] | $[Total] |
| Developer | [Hours] | $[Rate] | $[Total] |
| QA Analyst | [Hours] | $[Rate] | $[Total] |

### Other Direct Costs
| Item | Quantity | Unit Cost | Total |
|------|----------|-----------|-------|
| Cloud Infrastructure | [Qty] | $[Cost] | $[Total] |
| Software Licenses | [Qty] | $[Cost] | $[Total] |
| Travel (if required) | [Trips] | $[Cost] | $[Total] |

### Summary
| Category | Amount |
|----------|--------|
| Direct Labor | $[Amount] |
| Other Direct Costs | $[Amount] |
| Overhead | $[Amount] |
| G&A | $[Amount] |
| Profit | $[Amount] |
| **Total Proposed Price** | **$[Amount]** |

## Basis of Estimate
[Explain methodology used to develop pricing]

## Assumptions
- [Assumption 1]
- [Assumption 2]
- [Assumption 3]`,

  management_approach: (opp, company) => `# Management Approach
## ${opp.title}
### Solicitation: ${opp.solicitation_number}
### ${company.company_name || COMPANY_CONFIG.name}

## 1. Project Management Methodology
${company.company_name || COMPANY_CONFIG.name} employs a hybrid Agile/Waterfall methodology tailored to federal contracting requirements. This approach provides the structure and documentation required by government oversight while maintaining the flexibility to adapt to evolving requirements.

## 2. Organizational Structure
**Program Manager:** Reports to Contracting Officer Representative (COR)
**Technical Lead:** Manages development team and architecture decisions
**Quality Manager:** Oversees testing, compliance, and deliverable quality

## 3. Communication Plan
- Weekly status reports to COR
- Bi-weekly sprint reviews with stakeholders
- Monthly progress reports per contract requirements
- Ad-hoc issue escalation within 4 business hours

## 4. Risk Management
Risks are identified, assessed, and tracked using a Risk Register reviewed weekly. Each risk includes likelihood, impact, mitigation strategy, and responsible party.

## 5. Quality Control
- Deliverable review checklist before submission
- Peer review for all technical artifacts
- Compliance verification against SOW requirements
- Government acceptance testing support

## 6. Transition Plan
### Phase-In
- Knowledge transfer from incumbent (if applicable)
- System access and credential provisioning
- Baseline documentation review

### Phase-Out
- Complete documentation package
- Knowledge transfer to successor
- Data migration and system handoff
- 30-day post-transition support`,

  compliance_matrix: (opp, company) => `# Compliance Matrix
## ${opp.title}
### Solicitation: ${opp.solicitation_number}
### ${company.company_name || COMPANY_CONFIG.name}

## Instructions
This matrix maps each solicitation requirement to our proposal response location and compliance status.

## Compliance Legend
- **C** = Compliant (fully meets requirement)
- **PC** = Partially Compliant (meets with noted exceptions)
- **NC** = Non-Compliant (does not meet; alternate approach proposed)
- **NA** = Not Applicable

## Requirements Matrix

| Ref | Requirement | Status | Proposal Section | Notes |
|-----|------------|--------|-----------------|-------|
| [SOW 1.0] | [Requirement description] | C | Technical Approach 2.1 | [Notes] |
| [SOW 2.0] | [Requirement description] | C | Technical Approach 2.2 | [Notes] |
| [SOW 3.0] | [Requirement description] | C | Management Approach 3.0 | [Notes] |

## Certifications and Representations
| Requirement | Status | Evidence |
|-------------|--------|----------|
| SAM.gov Registration | Active | UEI: ${company.uei || COMPANY_CONFIG.uei} |
| SDVOSB Certification | ${company.certifications?.includes("SDVOSB") ? "Active" : "Pending"} | SBA Certification |
| NIST 800-171 Compliance | In Progress | SSP on file |
| Insurance Coverage | Active | COI available upon request |

## Set-Aside Eligibility
- Set-Aside Type: ${opp.set_aside_type}
- NAICS Code: ${opp.naics_code} - ${opp.naics_description}
- Size Standard: Meets SBA small business threshold`,

  full_proposal: (opp, company) => `# Full Proposal
## ${opp.title}
### Solicitation: ${opp.solicitation_number}
### Submitted by: ${company.company_name || COMPANY_CONFIG.name}
### Date: ${new Date().toISOString().split("T")[0]}

---

## Volume I: Technical Approach
[See technical_approach document for detailed technical solution]

## Volume II: Management Approach
[See management_approach document for project management details]

## Volume III: Past Performance
[See past_performance document for relevant experience]

## Volume IV: Price Proposal
[See price_proposal document for detailed pricing]

## Appendix A: Compliance Matrix
[See compliance_matrix document for requirement-by-requirement compliance]

## Appendix B: Capability Statement
[See capability_statement document for company overview]

---

## Proposal Summary

**Offeror:** ${company.company_name || COMPANY_CONFIG.name}
**Address:** ${company.address || COMPANY_CONFIG.address}
**UEI:** ${company.uei || COMPANY_CONFIG.uei}
**CAGE:** ${company.cage_code || COMPANY_CONFIG.cageCode}
**NAICS:** ${opp.naics_code} - ${opp.naics_description}
**Set-Aside:** ${opp.set_aside_type}
**Proposed Value:** $${(opp.estimated_value || 0).toLocaleString()}

**Point of Contact:**
${company.owner_name || COMPANY_CONFIG.owner}
${company.phone || COMPANY_CONFIG.phone}
${company.email || COMPANY_CONFIG.email}`,
};

export class BidDocumentService {
  constructor(private repo: InMemoryRepository) {}

  /**
   * Generate a specific bid document type for an opportunity
   */
  async generateBidDocument(
    opportunityId: string,
    documentType: BidDocumentType,
    companyId?: string,
    formats: ("docx" | "pdf" | "markdown")[] = ["docx", "pdf", "markdown"]
  ): Promise<{
    bidDocument: BidDocument;
    outputs: GeneratedDocument[];
  }> {
    const opp = await this.repo.getOpportunity(opportunityId);
    if (!opp) {
      throw new Error(`Opportunity ${opportunityId} not found`);
    }

    // Get company record or use defaults
    let company: CompanyRecord;
    if (companyId) {
      const found = await this.repo.getCompany(companyId);
      if (!found) throw new Error(`Company ${companyId} not found`);
      company = found;
    } else {
      // Use TNDS defaults
      company = {
        id: "tnds-default",
        company_name: COMPANY_CONFIG.name,
        owner_name: COMPANY_CONFIG.owner,
        phone: COMPANY_CONFIG.phone,
        email: COMPANY_CONFIG.email,
        website: COMPANY_CONFIG.website,
        uei: COMPANY_CONFIG.uei,
        cage_code: COMPANY_CONFIG.cageCode,
        address: COMPANY_CONFIG.address,
        city: "Colorado Springs",
        state: "CO",
        zip: "80909",
        certification: COMPANY_CONFIG.certification,
        certifications: ["VOSB", "SDVOSB"],
        business_type: "Technology Consulting",
        federal_contracts: true,
        handles_phi: false,
        handles_pci: false,
        handles_cui: false,
        data_types_handled: [],
        frameworks_required: [],
        created_at: new Date(),
        updated_at: new Date(),
      } as CompanyRecord;
    }

    // Generate content from template
    const templateFn = BID_TEMPLATES[documentType];
    if (!templateFn) {
      throw new Error(`Unknown document type: ${documentType}`);
    }

    const content = templateFn(opp, company);
    const title = `${documentType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} - ${opp.title}`;
    const slug = `${opp.solicitation_number}_${documentType}`;

    // Store bid document record
    const bidDocument = await this.repo.createBidDocument({
      opportunity_id: opportunityId,
      document_type: documentType,
      title,
      content,
      output_formats: formats,
      status: "draft",
      version: 1,
    });

    // Generate output files
    const outputs = await generateDocumentOutputs(title, slug, content, formats);

    return { bidDocument, outputs };
  }

  /**
   * Generate a full bid package (all document types) for an opportunity
   */
  async generateFullBidPackage(
    opportunityId: string,
    companyId?: string,
    formats: ("docx" | "pdf" | "markdown")[] = ["docx", "pdf", "markdown"]
  ): Promise<{
    documents: Array<{
      type: BidDocumentType;
      bidDocument: BidDocument;
      outputs: GeneratedDocument[];
    }>;
    summary: { total: number; generated: number };
  }> {
    const documentTypes: BidDocumentType[] = [
      "capability_statement",
      "technical_approach",
      "past_performance",
      "price_proposal",
      "management_approach",
      "compliance_matrix",
      "full_proposal",
    ];

    const documents = [];
    for (const docType of documentTypes) {
      const result = await this.generateBidDocument(
        opportunityId,
        docType,
        companyId,
        formats
      );
      documents.push({
        type: docType,
        bidDocument: result.bidDocument,
        outputs: result.outputs,
      });
    }

    return {
      documents,
      summary: {
        total: documentTypes.length,
        generated: documents.length,
      },
    };
  }

  /**
   * List bid documents for an opportunity
   */
  async listBidDocuments(opportunityId: string): Promise<BidDocument[]> {
    return this.repo.listBidDocumentsByOpportunity(opportunityId);
  }

  /**
   * Get a specific bid document
   */
  async getBidDocument(id: string): Promise<BidDocument | null> {
    return this.repo.getBidDocument(id);
  }
}
