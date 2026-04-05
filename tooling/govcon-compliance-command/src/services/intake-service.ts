/**
 * Intake Wizard Service - Maps business profile to recommended compliance skills
 * Ported from compliance-gov-module intake logic
 */

import { IntakeResult, CompanyRecord } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";
import { COMPLIANCE_SKILL_DOMAINS } from "../config/index.js";

interface SkillRecommendation {
  skill_id: string;
  skill_name: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  reason: string;
}

export class IntakeService {
  constructor(private repo: InMemoryRepository) {}

  /**
   * Run the intake wizard for a company
   * Analyzes business profile and recommends compliance skill domains
   */
  async runIntake(companyId: string): Promise<IntakeResult> {
    const company = await this.repo.getCompany(companyId);
    if (!company) {
      throw new Error(`Company ${companyId} not found`);
    }

    const recommendations: SkillRecommendation[] = [];
    const added = new Set<string>();

    const addSkill = (
      skillId: string,
      priority: SkillRecommendation["priority"],
      reason: string
    ) => {
      if (added.has(skillId)) {
        // Upgrade priority if new recommendation is higher
        const existing = recommendations.find((r) => r.skill_id === skillId);
        const priorityRank = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        if (
          existing &&
          priorityRank[priority] > priorityRank[existing.priority]
        ) {
          existing.priority = priority;
          existing.reason = reason;
        }
        return;
      }
      added.add(skillId);
      const domain = COMPLIANCE_SKILL_DOMAINS.find((d) => d.id === skillId);
      recommendations.push({
        skill_id: skillId,
        skill_name: domain?.name || skillId,
        priority,
        reason,
      });
    };

    // Foundation skills (always included)
    addSkill("security-governance", "CRITICAL", "Foundation security governance required for all organizations");
    addSkill("internal-compliance", "CRITICAL", "Baseline security policies and procedures required");

    // Conditional: PHI handling
    if (company.handles_phi) {
      addSkill("data-handling-privacy", "HIGH", "Handles PHI - HIPAA compliance required");
      addSkill("contracts-risk-assurance", "HIGH", "BAA and DPA requirements for PHI");
    }

    // Conditional: PCI handling
    if (company.handles_pci) {
      addSkill("data-handling-privacy", "HIGH", "Handles PCI data - data protection controls required");
    }

    // Conditional: Federal contracts
    if (company.federal_contracts) {
      addSkill("government-contracting", "HIGH", "Federal contracting requires FAR/DFARS compliance");
      addSkill("contracts-risk-assurance", "HIGH", "Government contract risk management required");
    }

    // Conditional: CUI handling
    if (company.handles_cui) {
      addSkill("government-contracting", "CRITICAL", "CUI handling requires NIST 800-171 compliance");
      addSkill("cloud-platform-security", "HIGH", "CUI in cloud requires platform security controls");
    }

    // Conditional: Cloud platform
    if (company.cloud_provider) {
      const provider = company.cloud_provider.toLowerCase();
      if (["google", "aws", "azure", "gcp"].some((p) => provider.includes(p))) {
        addSkill("cloud-platform-security", "MEDIUM", `Cloud platform (${company.cloud_provider}) security configuration required`);
      }
    }

    // Framework-based recommendations
    const frameworks = company.frameworks_required.map((f) => f.toLowerCase());

    if (frameworks.some((f) => f.includes("nist"))) {
      addSkill("government-contracting", "HIGH", "NIST framework compliance required");
      addSkill("compliance-research", "MEDIUM", "NIST framework research and guidance");
    }

    if (frameworks.some((f) => f.includes("hipaa"))) {
      addSkill("data-handling-privacy", "HIGH", "HIPAA compliance required");
      addSkill("contracts-risk-assurance", "HIGH", "HIPAA BAA requirements");
    }

    if (frameworks.some((f) => f.includes("soc") || f.includes("iso"))) {
      addSkill("compliance-audit", "HIGH", "SOC 2/ISO 27001 audit preparation required");
    }

    if (frameworks.some((f) => f.includes("fedramp") || f.includes("cmmc"))) {
      addSkill("government-contracting", "CRITICAL", "FedRAMP/CMMC compliance required");
      addSkill("cloud-platform-security", "HIGH", "Cloud security for FedRAMP/CMMC");
    }

    if (frameworks.some((f) => f.includes("gdpr") || f.includes("ccpa"))) {
      addSkill("data-handling-privacy", "HIGH", "Privacy regulation compliance required");
    }

    // Support skills (always add at lower priority)
    addSkill("business-operations", "MEDIUM", "Operational compliance and quality management");
    addSkill("compliance-usage", "LOW", "Usage guides and reference documentation");

    // Sort by priority (CRITICAL first)
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    recommendations.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    // Store intake result
    const intakeResult = await this.repo.createIntakeResult({
      company_id: companyId,
      business_type: company.business_type || "unknown",
      employee_count: company.employee_count || 0,
      handles_phi: company.handles_phi,
      handles_pci: company.handles_pci,
      federal_contracts: company.federal_contracts,
      cloud_platform: company.cloud_provider,
      frameworks_requested: company.frameworks_required,
      recommended_skills: recommendations,
    });

    return intakeResult;
  }

  /**
   * Get previous intake result for a company
   */
  async getIntakeResult(companyId: string): Promise<IntakeResult | null> {
    return this.repo.getIntakeResultByCompany(companyId);
  }
}
