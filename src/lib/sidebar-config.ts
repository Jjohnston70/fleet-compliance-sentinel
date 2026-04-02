/**
 * Sidebar section groups for Fleet-Compliance navigation.
 *
 * Each section defines a collapsible group with navigation items. Items map to
 * module IDs from modules.ts so the sidebar can hide links when a module is
 * disabled for the current org.
 *
 * To add a new sidebar link:
 *   1. Add a new entry to the appropriate section's `items` array.
 *   2. If the link corresponds to a module, set `moduleId` to match the module
 *      catalog ID from modules.ts. Links without a `moduleId` are always shown.
 *   3. Set `adminOnly: true` if the link should only appear for org admins.
 */

export interface SidebarItem {
  /** Display label in the sidebar. */
  label: string;
  /** Route path for the Next.js Link. */
  href: string;
  /** Lucide icon name (matches module catalog). */
  icon?: string;
  /** Module catalog ID. When set, the link hides if that module is disabled. */
  moduleId?: string;
  /** When true, only org admins see this link. */
  adminOnly?: boolean;
}

export interface SidebarSection {
  /** Section header label shown in the sidebar. */
  title: string;
  /** Unique key for localStorage state persistence. */
  key: string;
  /** Whether this section starts expanded on first visit. */
  defaultExpanded: boolean;
  /** When true, the entire section only shows for org admins. */
  adminOnly?: boolean;
  /** Navigation items within this section. */
  items: SidebarItem[];
}

export const SIDEBAR_SECTIONS: readonly SidebarSection[] = [
  {
    title: 'Operations',
    key: 'ops',
    defaultExpanded: true,
    items: [
      { label: 'Dashboard', href: '/fleet-compliance', icon: 'LayoutDashboard' },
      { label: 'Assets', href: '/fleet-compliance/assets', icon: 'Truck' },
      { label: 'Employees', href: '/fleet-compliance/employees', icon: 'Users' },
      { label: 'Dispatch', href: '/fleet-compliance/dispatch', icon: 'Truck', moduleId: 'dispatch' },
      { label: 'Tasks', href: '/fleet-compliance/tasks', icon: 'ListTodo', moduleId: 'tasks' },
      { label: 'Onboarding', href: '/fleet-compliance/onboarding', icon: 'UserPlus', moduleId: 'onboarding' },
    ],
  },
  {
    title: 'Compliance',
    key: 'compliance',
    defaultExpanded: true,
    items: [
      { label: 'Compliance', href: '/fleet-compliance/compliance', icon: 'ShieldCheck' },
      { label: 'DQ Files', href: '/fleet-compliance/dq', icon: 'ClipboardCheck', moduleId: 'dq-files' },
      { label: 'Alerts', href: '/fleet-compliance/alerts', icon: 'Bell' },
      { label: 'Suspense', href: '/fleet-compliance/suspense', icon: 'Clock' },
      { label: 'FMCSA Lookup', href: '/fleet-compliance/fmcsa', icon: 'Search' },
    ],
  },
  {
    title: 'Training',
    key: 'training',
    defaultExpanded: true,
    items: [
      { label: 'Training Hub', href: '/fleet-compliance/training', icon: 'GraduationCap' },
      { label: 'My Training', href: '/fleet-compliance/training/my', icon: 'BookOpen' },
      { label: 'Training Admin', href: '/fleet-compliance/training/manage', icon: 'Settings', adminOnly: true },
      { label: 'Hazmat Reports', href: '/fleet-compliance/training/reports', icon: 'FileBarChart', adminOnly: true },
      { label: 'Courses & Workshops', href: '/fleet-compliance/courses', icon: 'GraduationCap', moduleId: 'training' },
    ],
  },
  {
    title: 'Finance',
    key: 'finance',
    defaultExpanded: false,
    items: [
      { label: 'Financial', href: '/fleet-compliance/financial', icon: 'Wallet', moduleId: 'financial' },
      { label: 'Sales', href: '/fleet-compliance/sales', icon: 'TrendingUp', moduleId: 'sales' },
      { label: 'Proposals', href: '/fleet-compliance/proposals', icon: 'FilePenLine', moduleId: 'proposals' },
      { label: 'Contracts', href: '/fleet-compliance/contracts', icon: 'FileText', moduleId: 'contracts' },
      { label: 'Invoices', href: '/fleet-compliance/invoices', icon: 'ReceiptText', moduleId: 'invoices' },
      { label: 'Realty', href: '/fleet-compliance/realty', icon: 'Home', moduleId: 'realty' },
    ],
  },
  {
    title: 'Intelligence',
    key: 'intel',
    defaultExpanded: false,
    items: [
      { label: 'Email Analytics', href: '/fleet-compliance/email-analytics', icon: 'Mail', moduleId: 'email-analytics' },
      { label: 'Readiness', href: '/fleet-compliance/readiness', icon: 'Gauge', moduleId: 'readiness' },
      { label: 'GovCon', href: '/fleet-compliance/govcon', icon: 'Landmark', moduleId: 'govcon' },
      { label: 'Telematics', href: '/fleet-compliance/telematics', icon: 'MapPinned', moduleId: 'telematics' },
      { label: 'Forecasting', href: '/fleet-compliance/forecasting', icon: 'LineChart', moduleId: 'ml-signals' },
    ],
  },
  {
    title: 'Admin',
    key: 'admin',
    defaultExpanded: false,
    adminOnly: true,
    items: [
      { label: 'Settings', href: '/fleet-compliance/settings/alerts', icon: 'Settings' },
      { label: 'Spend Dashboard', href: '/fleet-compliance/spend', icon: 'DollarSign' },
      { label: 'Import Data', href: '/fleet-compliance/import', icon: 'Upload' },
      { label: 'Command Center', href: '/fleet-compliance/command-center', icon: 'Terminal' },
      { label: 'Module Tools', href: '/fleet-compliance/tools', icon: 'Wrench' },
      { label: 'Penny AI', href: '/penny', icon: 'Bot' },
      { label: 'Module Toggles', href: '/fleet-compliance/dev/modules', icon: 'ToggleRight', adminOnly: true },
    ],
  },
];

/**
 * Given a set of enabled module IDs and a user role, returns the sections that
 * should be visible. Sections with zero visible items are excluded.
 */
export function getVisibleSections(
  enabledModuleIds: Set<string>,
  role: 'admin' | 'member',
): SidebarSection[] {
  return SIDEBAR_SECTIONS.map((section) => {
    if (section.adminOnly && role !== 'admin') return null;

    const visibleItems = section.items.filter((item) => {
      if (item.adminOnly && role !== 'admin') return false;
      if (item.moduleId && !enabledModuleIds.has(item.moduleId)) return false;
      return true;
    });

    if (visibleItems.length === 0) return null;

    return { ...section, items: visibleItems };
  }).filter((s): s is SidebarSection => s !== null);
}
