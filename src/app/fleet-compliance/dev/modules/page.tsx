'use client';

import { useCallback, useEffect, useState } from 'react';

interface OrgOption {
  id: string;
  name: string;
  plan: string;
}

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

export default function DevModulesPage() {
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [planDefaults, setPlanDefaults] = useState<string[]>([]);
  const [recentToggles, setRecentToggles] = useState<ToggleLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const fetchData = useCallback(async (orgId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = orgId
        ? `/api/fleet-compliance/dev/modules?orgId=${encodeURIComponent(orgId)}`
        : '/api/fleet-compliance/dev/modules';
      const res = await fetch(url);
      if (res.status === 401 || res.status === 403) {
        setForbidden(true);
        return;
      }
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Unknown error');
        return;
      }
      setOrgs(data.orgs ?? []);
      setCatalog(data.catalog ?? []);
      setEnabledModules(data.enabledModules ?? []);
      setPlanDefaults(data.planDefaults ?? []);
      setRecentToggles(data.recentToggles ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    if (orgId) {
      fetchData(orgId);
    } else {
      setEnabledModules([]);
      setPlanDefaults([]);
      setRecentToggles([]);
    }
  };

  const handleToggle = async (moduleId: string, currentlyEnabled: boolean) => {
    if (!selectedOrgId) return;
    setToggling(moduleId);
    try {
      const res = await fetch('/api/fleet-compliance/dev/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: selectedOrgId,
          moduleId,
          enabled: !currentlyEnabled,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        await fetchData(selectedOrgId);
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
    if (!confirm('Reset all module overrides to plan defaults for this org?')) return;
    setToggling('__reset__');
    try {
      const res = await fetch('/api/fleet-compliance/dev/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: selectedOrgId, action: 'reset' }),
      });
      const data = await res.json();
      if (data.ok) {
        await fetchData(selectedOrgId);
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
            This page is restricted to platform administrators.
          </p>
        </section>
      </main>
    );
  }

  const enabledSet = new Set(enabledModules);
  const planDefaultSet = new Set(planDefaults);
  const selectedOrg = orgs.find((o) => o.id === selectedOrgId);

  // Group catalog by category
  const categorized = catalog.reduce<Record<string, CatalogItem[]>>((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-hero">
        <p className="fleet-compliance-eyebrow" style={{ color: '#3d8eb9' }}>
          Developer Tools
        </p>
        <h1>Module Toggle Console</h1>
        <p className="fleet-compliance-subcopy">
          Enable or disable modules per organization. Changes take effect immediately.
        </p>
      </section>

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
          >
            x
          </button>
        </div>
      )}

      {/* Org Selector */}
      <section
        className="fleet-compliance-section"
        style={{ marginBottom: '1.5rem' }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label htmlFor="org-select" style={{ fontWeight: 600 }}>
            Organization:
          </label>
          <select
            id="org-select"
            value={selectedOrgId}
            onChange={(e) => handleOrgChange(e.target.value)}
            disabled={loading && orgs.length === 0}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #444',
              background: '#1e293b',
              color: '#fff',
              fontSize: '0.9rem',
              minWidth: '300px',
            }}
          >
            <option value="">-- Select an organization --</option>
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.plan})
              </option>
            ))}
          </select>

          {selectedOrgId && (
            <button
              type="button"
              onClick={handleReset}
              disabled={toggling !== null}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #7a3333',
                background: '#4a1c1c',
                color: '#ffaaaa',
                cursor: toggling ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {toggling === '__reset__' ? 'Resetting...' : 'Reset to Plan Defaults'}
            </button>
          )}
        </div>
        {selectedOrg && (
          <p style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            Plan: <strong style={{ color: '#3d8eb9' }}>{selectedOrg.plan}</strong> | Org
            ID: <code style={{ fontSize: '0.8rem' }}>{selectedOrg.id}</code>
          </p>
        )}
      </section>

      {/* Module Grid */}
      {selectedOrgId && !loading && (
        <section className="fleet-compliance-section">
          {Object.entries(categorized).map(([category, items]) => (
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
                {category}
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
                              Core
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: '0.8rem',
                            color: '#94a3b8',
                            margin: '0.2rem 0 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {mod.description}
                        </p>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: '#64748b',
                            marginTop: '0.25rem',
                          }}
                        >
                          Plan: {mod.requiresPlan}
                          {isPlanDefault && (
                            <span style={{ marginLeft: '0.5rem', color: '#3d8eb9' }}>
                              (plan default)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggle(mod.id, isEnabled)}
                        disabled={mod.isCore || isBeingToggled || toggling !== null}
                        title={
                          mod.isCore
                            ? 'Core modules cannot be disabled'
                            : isEnabled
                              ? 'Click to disable'
                              : 'Click to enable'
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
          ))}
        </section>
      )}

      {/* Loading state */}
      {loading && selectedOrgId && (
        <section className="fleet-compliance-section">
          <p style={{ color: '#94a3b8' }}>Loading module state...</p>
        </section>
      )}

      {/* Recent Toggle Log */}
      {selectedOrgId && recentToggles.length > 0 && (
        <section className="fleet-compliance-section" style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Recent Toggle History
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
                  <th style={{ padding: '0.5rem 0.75rem' }}>State</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>When</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>By</th>
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
                        {entry.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#94a3b8' }}>
                      {entry.enabledAt
                        ? new Date(entry.enabledAt).toLocaleString()
                        : '--'}
                    </td>
                    <td
                      style={{
                        padding: '0.5rem 0.75rem',
                        color: '#64748b',
                        fontSize: '0.75rem',
                      }}
                    >
                      {entry.enabledBy
                        ? entry.enabledBy.substring(0, 12) + '...'
                        : 'system'}
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
