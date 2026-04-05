import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import ModuleGatewayPanel from '@/components/fleet-compliance/ModuleGatewayPanel';
import { getModuleCatalog, getOrgModules, type ModuleCatalogItem } from '@/lib/modules';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Module Tools',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const SKILL_FILTER_TO_MODULE_ID: Record<string, string> = {
  readiness: 'skill-readiness-command',
  compliance: 'skill-compliance-command',
  financial: 'skill-financial-command',
  govcon: 'skill-govcon-command',
  realty: 'skill-realty-command',
  proposal: 'skill-proposal-command',
  asset: 'skill-asset-command',
};

const SKILL_SORT_ORDER = Object.values(SKILL_FILTER_TO_MODULE_ID);

const SKILL_PROMPT_EXAMPLES: Record<string, string[]> = {
  'skill-readiness-command': [
    'Run an AI readiness assessment for my operation.',
    'Build a risk register from our current controls.',
  ],
  'skill-compliance-command': [
    'Check our privacy compliance gaps for SOC 2 and HIPAA.',
    'Generate a remediation checklist for GDPR/CCPA risks.',
  ],
  'skill-financial-command': [
    'Analyze spend trends and flag unusual expense movement.',
    'Organize these invoice records and summarize key variances.',
  ],
  'skill-govcon-command': [
    'Evaluate this opportunity and recommend bid/no-bid.',
    'Score this grant narrative and identify weak sections.',
  ],
  'skill-realty-command': [
    'Review this transaction workflow for compliance risks.',
    'Generate a checklist for property operations controls.',
  ],
  'skill-proposal-command': [
    'Draft a proposal outline from this scope statement.',
    'Turn these notes into a polished executive summary.',
  ],
  'skill-asset-command': [
    'Organize these files into a clean taxonomy.',
    'Suggest folder naming standards for this document set.',
  ],
};

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] || '') : (value || '');
}

function skillMetadataList(moduleItem: ModuleCatalogItem): string[] {
  const rawSkills = moduleItem.metadata?.skills;
  if (!Array.isArray(rawSkills)) return [];
  return rawSkills
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    .map((entry) => entry.trim());
}

function normalizeRole(value: unknown): 'admin' | 'member' {
  if (typeof value !== 'string') return 'member';
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return 'member';
  const parts = trimmed.split(':').filter(Boolean);
  const canonical = parts.length > 0 ? parts[parts.length - 1] : trimmed;
  return canonical === 'admin' ? 'admin' : 'member';
}

function resolveOrgRole(sessionClaims: any): 'admin' | 'member' {
  const candidates = [
    sessionClaims?.org_role,
    sessionClaims?.orgRole,
    sessionClaims?.o?.rol,
  ];

  for (const candidate of candidates) {
    const role = normalizeRole(candidate);
    if (role === 'admin') return role;
  }
  return 'member';
}

export default async function FleetComplianceToolsPage({ searchParams }: { searchParams: SearchParams }) {
  if (!isClerkEnabled()) return null;

  const { userId, orgId, sessionClaims } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  const role = resolveOrgRole(sessionClaims);
  const isAdmin = role === 'admin';

  const resolved = await searchParams;
  const requestedSkill = firstParam(resolved.skill).trim().toLowerCase();
  const requestedSkillModuleId = requestedSkill ? SKILL_FILTER_TO_MODULE_ID[requestedSkill] : '';

  const [catalog, enabledModules] = await Promise.all([
    getModuleCatalog(),
    getOrgModules(orgId),
  ]);

  const enabledSet = new Set(enabledModules);

  const allVisibleSkillModules = catalog
    .filter((item) => item.category === 'skills' && enabledSet.has(item.id))
    .sort((a, b) => {
      const aIndex = SKILL_SORT_ORDER.indexOf(a.id);
      const bIndex = SKILL_SORT_ORDER.indexOf(b.id);
      const aSort = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const bSort = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      if (aSort !== bSort) return aSort - bSort;
      return a.name.localeCompare(b.name);
    });

  const visibleSkillModules = requestedSkillModuleId
    ? allVisibleSkillModules.filter((item) => item.id === requestedSkillModuleId)
    : allVisibleSkillModules;

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance/tools" userId={userId}>
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-hero">
          <p className="fleet-compliance-eyebrow">Skills & Module Tools</p>
          <h1>Operator tools panel</h1>
          <div className="fleet-compliance-breadcrumbs">
            <Link href="/fleet-compliance">Fleet-Compliance</Link>
            <span>/</span>
            <span>Module Tools</span>
          </div>
          <p className="fleet-compliance-subcopy">
            Launch skill workflows through Penny and run gateway module actions from one shared control panel.
          </p>
        </section>

        <section className="fleet-compliance-section">
          <div className="fleet-compliance-section-head">
            <div>
              <p className="fleet-compliance-eyebrow">Skills</p>
              <h2>Available skill groups</h2>
            </div>
            <div className="fleet-compliance-action-row">
              <Link href="/fleet-compliance/tools" className="btn-secondary">Show All</Link>
              <Link href="/penny" className="btn-primary">Open Penny</Link>
            </div>
          </div>

          {requestedSkill && !requestedSkillModuleId ? (
            <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
              <strong>Skill filter not recognized:</strong> {requestedSkill}
            </div>
          ) : null}

          {visibleSkillModules.length === 0 ? (
            <div className="fleet-compliance-empty-state" style={{ marginTop: '1rem' }}>
              <h3>No enabled skill modules</h3>
              <p>
                Your organization currently has no skill modules enabled for this filter. Ask an admin to enable skill
                modules in Module Toggles.
              </p>
            </div>
          ) : (
            <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {visibleSkillModules.map((moduleItem) => {
                const skillList = skillMetadataList(moduleItem);
                const prompts = SKILL_PROMPT_EXAMPLES[moduleItem.id] || [];

                return (
                  <article key={moduleItem.id} className="fleet-compliance-list-card">
                    <h3>{moduleItem.name}</h3>
                    <p className="fleet-compliance-table-note">{moduleItem.description}</p>
                    {skillList.length > 0 ? (
                      <p className="fleet-compliance-table-note" style={{ marginTop: '0.5rem' }}>
                        Tools: {skillList.join(', ')}
                      </p>
                    ) : null}
                    {prompts.length > 0 ? (
                      <div style={{ marginTop: '0.65rem' }}>
                        <p className="fleet-compliance-table-note" style={{ marginBottom: '0.25rem' }}>
                          Try asking Penny:
                        </p>
                        {prompts.map((prompt) => (
                          <p key={prompt} className="fleet-compliance-table-note" style={{ margin: '0.2rem 0' }}>
                            "{prompt}"
                          </p>
                        ))}
                      </div>
                    ) : null}
                    <div className="fleet-compliance-action-row" style={{ marginTop: '0.8rem' }}>
                      <Link href="/penny" className="btn-secondary">Open in Penny</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {isAdmin ? (
          <ModuleGatewayPanel />
        ) : (
          <section className="fleet-compliance-section">
            <div className="fleet-compliance-empty-state" style={{ marginTop: 0 }}>
              <h3>Admin-only module gateway</h3>
              <p>
                Direct module execution controls are restricted to organization admins. Skills above remain available
                through Penny for permitted users.
              </p>
            </div>
          </section>
        )}
      </main>
    </FleetComplianceErrorBoundary>
  );
}
