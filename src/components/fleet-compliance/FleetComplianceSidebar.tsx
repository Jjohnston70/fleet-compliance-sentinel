'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import UserManualModal from '@/components/fleet-compliance/UserManualModal';
import {
  SIDEBAR_SECTIONS,
  getVisibleSections,
  type SidebarSection,
} from '@/lib/sidebar-config';

const STORAGE_KEY = 'fc-sidebar-sections';

function loadSectionState(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore parse errors
  }
  return {};
}

function saveSectionState(state: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/fleet-compliance') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Chevron icon. Points right when collapsed, down when expanded.
 */
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{
        transition: 'transform 0.2s',
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        flexShrink: 0,
      }}
    >
      <path
        d="M5 3L9 7L5 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FleetComplianceSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Section expand/collapse state. Initialized from localStorage defaults.
  const [sectionState, setSectionState] = useState<Record<string, boolean>>(() => {
    const saved = loadSectionState();
    const defaults: Record<string, boolean> = {};
    for (const section of SIDEBAR_SECTIONS) {
      defaults[section.key] =
        section.key in saved ? saved[section.key] : section.defaultExpanded;
    }
    return defaults;
  });

  // For now, show all modules (no org-scoped filtering in the sidebar itself).
  // The sidebar-config's getVisibleSections will be wired to org context in a
  // follow-up when the sidebar receives enabled module IDs from a provider.
  // For this initial deploy, we show all sections/items with role='admin' to
  // avoid breaking the existing navigation. A follow-up task will add the
  // OrgModulesProvider context.
  const visibleSections = useMemo(() => {
    // Build a set of all module IDs from SIDEBAR_SECTIONS so everything is
    // visible by default until the org-modules provider is wired.
    const allModuleIds = new Set<string>();
    for (const section of SIDEBAR_SECTIONS) {
      for (const item of section.items) {
        if (item.moduleId) allModuleIds.add(item.moduleId);
      }
    }
    return getVisibleSections(allModuleIds, 'admin');
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleSection = useCallback((key: string) => {
    setSectionState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveSectionState(next);
      return next;
    });
  }, []);

  return (
    <>
      <button
        type="button"
        className="fc-sidebar-toggle"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Toggle Fleet-Compliance navigation"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? 'Close Menu' : 'Menu'}
      </button>
      {mobileOpen && (
        <button
          type="button"
          className="fc-sidebar-backdrop"
          aria-label="Close Fleet-Compliance navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`fc-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <p className="fc-sidebar-title">FLEET-COMPLIANCE</p>
        <nav aria-label="Fleet-Compliance navigation">
          {visibleSections.map((section) => {
            const expanded = sectionState[section.key] ?? section.defaultExpanded;
            const hasActiveItem = section.items.some((item) =>
              isNavActive(pathname, item.href),
            );

            return (
              <div key={section.key} className="fc-sidebar-section">
                <button
                  type="button"
                  className={`fc-sidebar-section-header${hasActiveItem ? ' has-active' : ''}`}
                  onClick={() => toggleSection(section.key)}
                  aria-expanded={expanded}
                >
                  <ChevronIcon expanded={expanded} />
                  <span>{section.title}</span>
                </button>
                {expanded && (
                  <div className="fc-sidebar-section-items">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`fc-sidebar-link${isNavActive(pathname, item.href) ? ' active' : ''}`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <hr
            style={{
              border: 'none',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              margin: '0.5rem 0',
            }}
          />
          <UserManualModal />
        </nav>
      </aside>
    </>
  );
}
