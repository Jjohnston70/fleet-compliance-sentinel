'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import UserManualModal from '@/components/fleet-compliance/UserManualModal';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/fleet-compliance' },
  { label: 'Assets', href: '/fleet-compliance/assets' },
  { label: 'Compliance', href: '/fleet-compliance/compliance' },
  { label: 'Suspense', href: '/fleet-compliance/suspense' },
  { label: 'Alerts', href: '/fleet-compliance/alerts' },
  { label: 'Invoices', href: '/fleet-compliance/invoices' },
  { label: 'Spend Dashboard', href: '/fleet-compliance/spend' },
  { label: 'FMCSA Lookup', href: '/fleet-compliance/fmcsa' },
  { label: 'Telematics', href: '/fleet-compliance/telematics' },
  { label: 'Module Tools', href: '/fleet-compliance/tools' },
  { label: 'Employees', href: '/fleet-compliance/employees' },
  { label: 'Import Data', href: '/fleet-compliance/import' },
  { label: 'Penny AI', href: '/penny' },
  { label: 'Settings', href: '/fleet-compliance/settings/alerts' },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/fleet-compliance') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function FleetComplianceSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const links = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        ...item,
        active: isNavActive(pathname, item.href),
      })),
    [pathname]
  );

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
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`fc-sidebar-link${item.active ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
          <UserManualModal />
        </nav>
      </aside>
    </>
  );
}
