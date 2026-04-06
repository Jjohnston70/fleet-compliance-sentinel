import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import { listCommandCenterCatalog } from '@/lib/modules-gateway/persistence';
import { isPlatformAdminUser } from '@/lib/platform-admin';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Command Center Catalog',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
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

function matchesQuery(query: string, values: Array<string | null | undefined>): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return values.some((value) => (value || '').toLowerCase().includes(normalized));
}

function formatLocalDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

export default async function FleetComplianceCommandCenterCatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!isClerkEnabled()) return null;

  const { userId, orgId, sessionClaims } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  const role = resolveOrgRole(sessionClaims);
  const isAdmin = role === 'admin';
  const isPlatformAdmin = isPlatformAdminUser(userId);
  const rows = isAdmin && isPlatformAdmin ? await listCommandCenterCatalog(orgId) : [];
  const moduleOptions = Array.from(new Set(rows.map((row) => row.moduleId))).sort((a, b) => a.localeCompare(b));
  const lastDiscoveredAt = rows.length > 0 ? rows[0].discoveredAt : null;

  const resolved = await searchParams;
  const q = firstParam(resolved.q);
  const moduleFilter = firstParam(resolved.moduleId);
  const filteredRows = rows.filter((row) => {
    if (moduleFilter && moduleFilter !== 'all' && row.moduleId !== moduleFilter) return false;
    return matchesQuery(q, [row.qualifiedName, row.moduleId, row.toolName, row.description]);
  });

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance/command-center" userId={userId}>
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-section">
          <div className="fleet-compliance-section-head">
            <div>
              <p className="fleet-compliance-eyebrow">Command Center</p>
              <h1>Discovered tool catalog</h1>
              <div className="fleet-compliance-breadcrumbs">
                <Link href="/fleet-compliance">Fleet-Compliance</Link>
                <span>/</span>
                <span>Command Center Catalog</span>
              </div>
            </div>
            <div className="fleet-compliance-action-row">
              <Link href="/fleet-compliance/tools" className="btn-primary">
                Open Module Tools
              </Link>
            </div>
          </div>

          <p className="fleet-compliance-subcopy">
            Simple operator view of command-center tools discovered from the latest <code>discover.tools</code> runs.
            Use this page to find the exact qualified tool names before routing calls.
          </p>

          {!isAdmin ? (
            <div className="fleet-compliance-empty-state" style={{ marginTop: '1rem' }}>
              <h3>Admin role required</h3>
              <p>Command-center catalog visibility is restricted to organization admins.</p>
            </div>
          ) : !isPlatformAdmin ? (
            <div className="fleet-compliance-empty-state" style={{ marginTop: '1rem' }}>
              <h3>Platform-admin access required</h3>
              <p>Command Center is reserved for platform-level gateway operations.</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="fleet-compliance-empty-state" style={{ marginTop: '1rem' }}>
              <h3>No command-center catalog data yet</h3>
              <p>
                Run <code>command-center → discover.tools</code> once in Module Tools, then refresh this page.
              </p>
            </div>
          ) : (
            <>
              <div className="fleet-compliance-stats fleet-compliance-stats-compact">
                <article className="fleet-compliance-stat-card">
                  <p className="fleet-compliance-stat-label">Discovered Tools</p>
                  <p className="fleet-compliance-stat-value">{rows.length}</p>
                  <p className="fleet-compliance-stat-note">Persisted in Neon</p>
                </article>
                <article className="fleet-compliance-stat-card">
                  <p className="fleet-compliance-stat-label">Modules</p>
                  <p className="fleet-compliance-stat-value">{moduleOptions.length}</p>
                  <p className="fleet-compliance-stat-note">Tool-providing modules</p>
                </article>
                <article className="fleet-compliance-stat-card">
                  <p className="fleet-compliance-stat-label">Last Discovery</p>
                  <p className="fleet-compliance-stat-value">{lastDiscoveredAt ? formatLocalDate(lastDiscoveredAt) : '-'}</p>
                  <p className="fleet-compliance-stat-note">Most recent catalog sync</p>
                </article>
              </div>

              <form className="fleet-compliance-filter-bar" action="/fleet-compliance/command-center">
                <div className="fleet-compliance-filter-grid">
                  <label className="fleet-compliance-field-stack">
                    <span>Search</span>
                    <input
                      type="search"
                      name="q"
                      defaultValue={q}
                      placeholder="module, tool, qualified name"
                    />
                  </label>
                  <label className="fleet-compliance-field-stack">
                    <span>Module</span>
                    <select name="moduleId" defaultValue={moduleFilter || 'all'}>
                      <option value="all">All modules</option>
                      {moduleOptions.map((moduleId) => (
                        <option key={moduleId} value={moduleId}>
                          {moduleId}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="fleet-compliance-action-row">
                  <button type="submit" className="btn-primary">
                    Apply Filters
                  </button>
                  <Link href="/fleet-compliance/command-center" className="btn-secondary">
                    Reset
                  </Link>
                </div>
              </form>

              {filteredRows.length === 0 ? (
                <div className="fleet-compliance-empty-state" style={{ marginTop: '1rem' }}>
                  <h3>No tools match your filters</h3>
                  <p>Clear filters or run <code>discover.tools</code> again to refresh catalog coverage.</p>
                </div>
              ) : (
                <div className="fleet-compliance-table-wrap" style={{ marginTop: '1rem' }}>
                  <table className="fleet-compliance-table">
                    <thead>
                      <tr>
                        <th>Qualified Name</th>
                        <th>Module</th>
                        <th>Tool</th>
                        <th>Description</th>
                        <th>Discovered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row) => (
                        <tr key={row.qualifiedName}>
                          <td>
                            <code className="fleet-compliance-artifact-path">{row.qualifiedName}</code>
                          </td>
                          <td>{row.moduleId}</td>
                          <td>{row.toolName}</td>
                          <td className="fleet-compliance-table-note">{row.description || '-'}</td>
                          <td className="fleet-compliance-table-note">{formatLocalDate(row.discoveredAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </FleetComplianceErrorBoundary>
  );
}
