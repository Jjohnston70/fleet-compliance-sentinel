'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Client-facing Module Settings page.
 *
 * Shows org admins which feature modules are available on their plan and lets
 * them enable/disable optional modules. No gateway toggles, no multi-org
 * selector, no developer tooling. Clean client experience.
 *
 * Platform admins still use /fleet-compliance/dev/modules for the full console
 * with multi-org selector and gateway module ACL controls.
 */

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string | null;
  isCore: boolean;
  requiresPlan: string;
}

interface ToggleLogEntry {
  moduleId: string;
  moduleName: string;
  enabled: boolean;
  enabledAt: string;
  enabledBy: string | null;
}

// Modules that are internal/developer-only and should not appear to clients.
// Clients interact with these features through the UI -- they don't need to
// know about the underlying module gateway or ML pipeline infrastructure.
const DEV_ONLY_MODULES = new Set([
  'petroleum-intel',
  'ml-signals',
]);

// Category display names for clean client presentation
const CATEGORY_LABELS: Record<string, string> = {
  fleet: 'Fleet Operations',
  core: 'Core Platform',
  business: 'Business & Finance',
  contracts: 'Contracts & Legal',
  compliance: 'Compliance & Docs',
  skills: 'AI Skills',
  people: 'People & HR',
  petroleum: 'Industry Tools',
};

// Category display order
const CATEGORY_ORDER = [
  'core',
  'fleet',
  'people',
  'compliance',
  'business',
  'contracts',
  'skills',
  'petroleum',
];

export default function ModuleSettingsPage() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [planDefaults, setPlanDefaults] = useState<string[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [orgPlan, setOrgPlan] = useState('');
  const [orgName, setOrgName] = useState('');
  const [recentToggles, setRecentToggles] = useState<ToggleLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/fleet-compliance/dev/modules');
      if (res.status === 401 || res.status === 403) {
        setForbidden(true);
        return;
      }
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Unknown error');
        return;
      }
      setCatalog(data.catalog ?? []);
      setEnabledModules(data.enabledModules ?? []);
      setPlanDefaults(data.planDefaults ?? []);
      setRecentToggles((data.recentToggles ?? []).slice(0, 10));
      setSelectedOrgId(typeof data.selectedOrgId === 'string' ? data.selectedOrgId : '');
      // Resolve org info from the org list
      const orgs = data.orgs ?? [];
      const selectedId = data.selectedOrgId;
      const org = orgs.find((o: { id: string }) => o.id === selectedId);
      if (org) {
        setOrgPlan(org.plan);
        setOrgName(org.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = async (moduleId: string, currentlyEnabled: boolean) => {
    if (!selectedOrgId) return;
    setToggling(moduleId);
    try {
      const res = await fetch('/api/fleet-compliance/dev/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: selectedOrgId, moduleId, enabled: !currentlyEnabled }),
      });
      const data = await res.json();
      if (data.ok) {
        await fetchData();
      } else {
        setError(data.error ?? 'Toggle failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Toggle failed');
    } finally {
      setToggling(null);
    }
  };

  const handleReset = async () => {
    if (!selectedOrgId) return;
    if (!confirm('Reset all module settings to your plan defaults?')) return;
    setToggling('__reset__');
    try {
      const res = await fetch('/api/fleet-compliance/dev/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: selectedOrgId, action: 'reset' }),
      });
      const data = await res.json();
      if (data.ok) {
        await fetchData();
      } else {
        setError(data.error ?? 'Reset failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setToggling(null);
    }
  };

  if (forbidden) {
    return (
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-hero">
          <h1>Access Denied</h1>
          <p className="fleet-compliance-subcopy">
            Module settings are only available to organization administrators.
          </p>
        </section>
      </main>
    );
  }

  // Filter out dev-only modules for the client view
  const clientCatalog = catalog.filter((mod) => !DEV_ONLY_MODULES.has(mod.id));
  const enabledSet = new Set(enabledModules);
  const planDefaultSet = new Set(planDefaults);

  // Group by category in display order
  const categorized = clientCatalog.reduce<Record<string, CatalogItem[]>>((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const sortedCategories = CATEGORY_ORDER.filter((cat) => categorized[cat]?.length > 0);
  // Add any categories not in the order list
  Object.keys(categorized).forEach((cat) => {
    if (!sortedCategories.includes(cat)) sortedCategories.push(cat);
  });

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-hero">
        <p className="fleet-compliance-eyebrow" style={{ color: '#3d8eb9' }}>
          Settings
        </p>
        <h1>Feature Modules</h1>
        <p className="fleet-compliance-subcopy">
          Control which features are active for your organization. Core modules are always
          enabled. Optional modules can be turned on or off based on your needs.
        </p>
      </section>

      {/* Plan info bar */}
      {orgPlan && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(26, 58, 92, 0.3)',
            border: '1px solid rgba(61, 142, 185, 0.2)',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Your plan: </span>
            <strong style={{ color: '#3d8eb9', textTransform: 'capitalize' }}>
              {orgPlan}
            </strong>
            {orgName && (
              <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '1rem' }}>
                {orgName}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleReset}
            disabled={toggling !== null}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#94a3b8',
              cursor: toggling ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
            }}
          >
            {toggling === '__reset__' ? 'Resetting...' : 'Reset to Plan Defaults'}
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#4a1c1c',
            border: '1px solid #7a3333',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#ffaaaa',
            marginBottom: '1rem',
          }}
        >
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: '#ffaaaa',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
            aria-label="Dismiss error"
          >
            x
          </button>
        </div>
      )}

      {/* Module Grid */}
      {!loading && (
        <section className="fleet-compliance-section">
          {sortedCategories.map((category) => {
            const items = categorized[category];
            if (!items?.length) return null;

            return (
              <div key={category} style={{ marginBottom: '1.5rem' }}>
                <h3
                  style={{
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    color: '#94a3b8',
                    marginBottom: '0.75rem',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    paddingBottom: '0.4rem',
                  }}
                >
                  {CATEGORY_LABELS[category] || category}
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  {items.map((mod) => {
                    const isEnabled = enabledSet.has(mod.id);
                    const isPlanDefault = planDefaultSet.has(mod.id);
                    const isBeingToggled = toggling === mod.id;

                    return (
                      <div
                        key={mod.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          background: isEnabled
                            ? 'rgba(61, 142, 185, 0.08)'
                            : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isEnabled ? 'rgba(61,142,185,0.3)' : 'rgba(255,255,255,0.06)'}`,
                          opacity: isBeingToggled ? 0.6 : 1,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                              {mod.name}
                            </span>
                            {mod.isCore && (
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  background: '#1a3a5c',
                                  color: '#7bb8d9',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}
                              >
                                Always On
                              </span>
                            )}
                            {isPlanDefault && !mod.isCore && (
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  background: 'rgba(61, 142, 185, 0.15)',
                                  color: '#3d8eb9',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}
                              >
                                Included
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: '0.8rem',
                              color: '#94a3b8',
                              margin: '0.2rem 0 0',
                            }}
                          >
                            {mod.description}
                          </p>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggle(mod.id, isEnabled)}
                          disabled={!selectedOrgId || mod.isCore || isBeingToggled || toggling !== null}
                          title={
                            mod.isCore
                              ? 'This feature is always enabled'
                              : isEnabled
                                ? 'Click to turn off'
                                : 'Click to turn on'
                          }
                          style={{
                            position: 'relative',
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            border: 'none',
                            background: isEnabled ? '#3d8eb9' : '#374151',
                            cursor: mod.isCore || toggling !== null ? 'not-allowed' : 'pointer',
                            flexShrink: 0,
                            transition: 'background 0.2s',
                          }}
                          aria-label={`Toggle ${mod.name}`}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: isEnabled ? '22px' : '2px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: '#fff',
                              transition: 'left 0.2s',
                            }}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {loading && (
        <section className="fleet-compliance-section">
          <p style={{ color: '#94a3b8' }}>Loading your module settings...</p>
        </section>
      )}

      {/* Recent Changes */}
      {recentToggles.length > 0 && (
        <section className="fleet-compliance-section" style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Recent Changes
          </h3>
          <div
            style={{
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    textAlign: 'left',
                  }}
                >
                  <th style={{ padding: '0.5rem 0.75rem' }}>Module</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Status</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Changed</th>
                </tr>
              </thead>
              <tbody>
                {recentToggles.map((entry, i) => (
                  <tr
                    key={`${entry.moduleId}-${entry.enabledAt}-${i}`}
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      {entry.moduleName}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span
                        style={{
                          color: entry.enabled ? '#4ade80' : '#f87171',
                          fontWeight: 600,
                        }}
                      >
                        {entry.enabled ? 'On' : 'Off'}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#94a3b8' }}>
                      {entry.enabledAt
                        ? new Date(entry.enabledAt).toLocaleString()
                        : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
