'use client';

import { useState, useEffect, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Section data – every feature in Fleet-Compliance Sentinel         */
/* ------------------------------------------------------------------ */
const SECTIONS: { id: string; title: string; content: string[] }[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: [
      'Fleet-Compliance Sentinel is your single-pane-of-glass for DOT/FMCSA fleet compliance. It tracks drivers, vehicles, permits, inspections, maintenance, invoices, and regulatory deadlines so nothing falls through the cracks.',
      'After signing in through the secure Clerk portal, new organizations are guided through a one-time onboarding wizard that sets your company name, primary contact, and initial fleet data. Once onboarding completes you land on the Dashboard.',
      'The sidebar on the left is your primary navigation. It lists every module: Dashboard, Assets, Compliance, Suspense, Alerts, Invoices, Spend Dashboard, FMCSA Lookup, Telematics, Module Tools, Employees, Import Data, Penny AI, and Settings. On mobile, tap "Menu" to expand the sidebar.',
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    content: [
      'The Dashboard is your operational command post. At the top you see four headline metrics: Tracked Assets, Driver Records, Open Suspense Items, and Permit Records. These numbers refresh automatically after imports or record changes.',
      'Below the headline metrics are three snapshot cards. The Assets card shows total units, items due for service soon, and units on maintenance hold. The Compliance card shows active drivers, medical cards expiring within 60 days, and permit deadlines within 120 days. The Suspense card shows open items, items due within 7 days, and high-severity count.',
      'A module status grid displays cards for each integrated module (12 total) with status badges so you can see at a glance which capabilities are online. The data coverage table shows row counts per collection, updated after every import.',
      'The FMCSA snapshot card shows your most recent carrier lookup result if one has been saved.',
    ],
  },
  {
    id: 'assets',
    title: 'Assets',
    content: [
      'The Assets module is your fleet inventory register. It tracks vehicles, trailers, fuel cubes, storage tanks, and equipment with full lifecycle data: VIN, year, make, model, mileage, assigned driver, location, and maintenance status.',
      'From the Assets list you can search by any field, filter by category or status, and sort by column. Click any row to open the asset detail page with a read-only snapshot of that unit.',
      'To add a new asset, click "Add Asset" and fill in the required fields (Asset ID, Name, Category). Optional fields include VIN, year, make, model, mileage, assigned driver, location, and notes.',
      'Assets support soft-delete with full audit trail. Deleted assets can be restored from the detail page if needed. A maintenance hold flag lets you mark units as temporarily out of service without deleting them.',
      'For bulk additions, use the Import Data module to upload assets from an Excel template.',
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance Tracking',
    content: [
      'The Compliance module combines driver qualification tracking and permit/license management into one view. Use the scope toggle at the top to switch between Drivers Only, Permits Only, or Both.',
      'Driver compliance records track: CDL number, state, expiration, and endorsements (hazmat, passenger, tanker); medical card expiration per 49 CFR Part 391.41; Motor Vehicle Record (MVR) dates; drug and alcohol testing status per 49 CFR Part 382; and TSA/TWIC clearance status.',
      'Driver statuses include Active, Inactive, On Leave, and Terminated. Click any driver row to open their full qualification profile.',
      'Permit and license records track: permit type, jurisdiction (state or federal), expiration date, renewal cadence (annual, biennial, or custom), authority status (common, contract, broker), issue date, last renewal date, owner email, filing deadline, and notes.',
      'Search and filter controls let you find records by driver name, permit type, owner, agency, or state. All compliance items with approaching deadlines automatically generate suspense items that feed into the Alerts engine.',
    ],
  },
  {
    id: 'employees',
    title: 'Employees',
    content: [
      'The Employees module is your driver profile registry. Each employee record stores: full name, status (Active/Inactive/Terminated), contact info (phone, email, address), CDL details (number, state, expiry, endorsements), medical card expiry, TSA/TWIC clearance, drug test schedule, and MVR record date.',
      'Add employees individually using the "Add Employee" form, or import in bulk through the Import Data module. Employee records support soft-delete with restore capability and maintain a full audit trail.',
      'Employee data feeds directly into the Compliance module and Pipeline Penny\'s fleet context, so your AI assistant always has current driver information when answering regulatory questions.',
    ],
  },
  {
    id: 'suspense',
    title: 'Suspense Items',
    content: [
      'Suspense items are compliance tasks that require action. Think of them as your regulatory to-do list with teeth — every item has a severity level, due date, owner, and audit trail.',
      'Each suspense item includes: title, description, due date, severity (Critical, High, Medium, Low), alert window (overdue, due-today, 7-day, 14-day, 30-day), owner email, source type (driver CDL, medical card, permit, vehicle inspection, maintenance, activity), source record ID (linked to the originating record), resolution status (open, resolved, snoozed), and notes.',
      'Suspense items can be created manually from the "New Suspense Item" form, or they are auto-generated when you import fleet data with approaching deadlines.',
      'To resolve an item, click "Resolve" on its detail page. You must enter resolution notes. The system records who resolved it, when, and what notes were provided — creating a permanent audit trail for compliance documentation.',
      'Filter the suspense queue by severity, alert state, status, or source type to focus on what matters most right now.',
    ],
  },
  {
    id: 'alerts',
    title: 'Alerts & Notifications',
    content: [
      'The Alerts engine runs a daily automated sweep at 08:00 UTC via a scheduled cron job. It scans all open suspense items, groups them by owner email, and sends color-coded compliance reminder emails.',
      'Alert windows: Overdue (red) for items past due, Due Today (orange), 7-Day Warning (yellow), 14-Day Warning, and 30-Day Warning. Each owner receives one consolidated email listing all their items by severity.',
      'A manager summary email goes to the configured manager address with a full list across all owners.',
      'The Alerts page lets you preview alert content before it sends (dry-run mode) and manually trigger the alert sweep using the "Run Alerts" button. A 25-hour dead-man switch prevents duplicate sends.',
      'Alert configuration is managed under Settings: organization name (used in email subject lines), from email address, manager email, and threshold windows. Emails are delivered through the Resend API.',
    ],
  },
  {
    id: 'invoices',
    title: 'Invoices',
    content: [
      'The Invoices module tracks maintenance invoices with full vendor, amount, category, and asset linkage. The invoice register shows a sortable table with Invoice ID, Vendor, Date, Category, Linked Asset, and Amount.',
      'Add invoices manually using the form, or upload a PDF invoice for automatic parsing. The PDF parser extracts vendor name, invoice number, date, amounts, and line items (parts, labor, shop supplies, tax) from 12 supported fleet maintenance vendors.',
      'After PDF parsing, extracted fields are pre-filled in the form for your review. You can override any field before saving. Invoices can be linked to specific assets in your fleet for per-unit cost tracking.',
      'Invoice categories include: Maintenance, Permits, Fuel, Insurance, and Other. These categories feed directly into the Spend Dashboard for financial visibility.',
    ],
  },
  {
    id: 'spend',
    title: 'Spend Dashboard',
    content: [
      'The Spend Dashboard gives you monthly financial visibility across your entire fleet operation. The main view shows a trend line chart of total spend by month and a category breakdown (Maintenance, Permits, Fuel, Insurance, Other).',
      'Key monthly metrics include: total invoices processed, largest vendor by spend, and category percentage split.',
      'Click any asset row to drill into per-asset spending — see exactly how much each vehicle, trailer, or piece of equipment is costing you month over month. This per-unit view helps identify high-maintenance assets that may need replacement.',
    ],
  },
  {
    id: 'fmcsa',
    title: 'FMCSA Carrier Lookup',
    content: [
      'Pull live carrier safety data from the federal FMCSA QCMobile API by entering a USDOT number. Results include carrier identity (legal name, DBA, address, operation type), operating authority status (common, contract, broker), BASIC safety scores (Safety, Fitness, Crash Indicator, Hours of Service, Driver Fitness, Hazmat), safety rating, out-of-service rates, cargo carried, and violation history.',
      'Lookup results can be saved as compliance snapshots for your records. Saved snapshots appear on the Dashboard FMCSA card and provide a historical record of carrier safety data over time — useful for audits and DOT inspections.',
    ],
  },
  {
    id: 'telematics',
    title: 'Telematics',
    content: [
      'The Telematics module displays real-time fleet risk scores from your connected telematics provider (currently supporting Verizon Connect Reveal).',
      'The Vehicle Risk Table shows: vehicle number, make/model/year, numeric risk score, risk level (HIGH/MEDIUM/LOW), last seen timestamp, 7-day GPS event count, and associated exception flags.',
      'The Driver Risk Table shows: driver name, HOS/ELD status, risk score, risk level, and associated flags.',
      'Summary stats display: total vehicles, total drivers, risk level distribution (HIGH/MEDIUM/LOW counts), top flags (most common risk signals), and last sync timestamp.',
      'Risk levels are color-coded: HIGH (red) indicates risky driving behavior, GPS violations, or HOS breaches; MEDIUM (orange) indicates monitored alerting; LOW (green) indicates compliant operations.',
      'Telematics data syncs automatically once daily at 02:00 UTC. The sync pulls vehicle rosters, driver rosters, GPS events, HOS logs, and DVIR records from Verizon Reveal. A demo mode is available for evaluation purposes.',
      'Telematics credentials are encrypted at rest using pgcrypto and are never exposed to the frontend.',
    ],
  },
  {
    id: 'module-tools',
    title: 'Module Tools (Admin)',
    content: [
      'Module Tools is an admin-only operator panel for running integrated backend modules directly from the UI. It connects to the Module Gateway — a unified execution layer that orchestrates four integrated tooling modules.',
      'Available modules: ML-EIA Petroleum Intel (energy market analysis and price forecasting), ML-Signal Stack (multi-source business signal processing), PaperStack (document generation, conversion, and inspection), and Command Center (tool discovery and routing hub).',
      'To run a module action: select the module from the catalog dropdown, choose an action, configure arguments using the JSON editor, set a timeout, choose dry-run or live mode, and click Execute. Each run gets a unique correlation ID for tracking.',
      'The run history panel shows all recent executions with status (queued, running, success, fail), output preview (stdout/stderr), error detail, result payload, and generated artifacts.',
      'All module actions are restricted to a fixed allowlist — no arbitrary shell execution is possible. Admin role authentication is required for all Module Tools operations.',
    ],
  },
  {
    id: 'import',
    title: 'Import Data',
    content: [
      'The Import Data module supports bulk upload of fleet records from Excel files. It validates data across 13 collection types: Drivers, Assets Master, Vehicles & Equipment, Permits & Licenses, Employees, Storage Tanks, Maintenance Schedule, Activity Log, Maintenance Tracker, Invoices, Maintenance Line Items, Colorado Contacts, and Emergency Contacts.',
      'Import workflow: (1) Download the XLSX template with pre-built sheets and validation hints. (2) Fill in your data following the column headers and format notes. (3) Upload your completed file (CSV or XLSX). (4) The system parses and validates every row against the collection schema. (5) Review flagged rows — errors are highlighted with explanations. (6) Approve or reject individual rows. (7) Commit approved rows to the database.',
      'Validation rules enforce: required fields per collection, date format (YYYY-MM-DD), email format, status enumerations (Active/Inactive/etc.), category enumerations, and no duplicate primary keys.',
      'Every import batch gets a UUID. If something goes wrong, use the Rollback button to undo the entire batch in one click. Import history is tracked locally so you can review past uploads.',
    ],
  },
  {
    id: 'penny',
    title: 'Pipeline Penny (AI Assistant)',
    content: [
      'Pipeline Penny is a document-grounded assistant that now searches the live CFR corpus (including Part 172 and Part 397), ERG handbook content, and indexed demo knowledge folders (Realty Command, HubSpot, Tenstreet, JJ Keller, and other local categories discovered at build time).',
      'Penny automatically receives server-side context about your fleet: active drivers, assets, permits, and open suspense items. This means Penny can answer questions like "Which of my drivers have medical cards expiring this month?" or "What are my current high-severity compliance gaps?"',
      'Choose your preferred LLM provider from the chat interface: Anthropic Claude (default), OpenAI GPT-4o-mini, Google Gemini 2.5 Flash, or Ollama for fully local/private processing. Each provider offers multiple model options.',
      'Penny includes security hardening: 6 injection defense rules on every query, keyword-based fast-reject filtering, sanitized markdown output, and OWASP LLM Top 10 compliance. Driver data is anonymized (IDs only, no PII sent to LLM providers).',
      'The Penny sidebar shows the currently indexed catalog with category counts and document titles, and each response still includes sources so operators can verify answers. A backend health indicator shows connection status (online/offline/checking). Rate limiting is set at 20 queries per 60 seconds per user.',
      'Use the helper question buttons for quick starts, or type your own question. Penny cites source documents in every response so you can verify answers against the original CFR text.',
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    content: [
      'The Settings page (accessible under Settings in the sidebar) manages your alert engine configuration. Set your organization name (used in email subject lines), the "from" email address for alert delivery, the manager summary email address, and alert threshold windows.',
      'Configuration values are stored locally in the browser for preview purposes. For production delivery, the same values must be set as Vercel environment variables. Copy-to-clipboard buttons are provided for each setting to make this easy.',
      'Admin users can manage team member access and role assignments through the Clerk dashboard integration.',
    ],
  },
  {
    id: 'security',
    title: 'Data Security & Compliance',
    content: [
      'All data is encrypted in transit (TLS) and at rest. Organization data is fully isolated — no tenant can access another tenant\'s records. Telematics credentials are encrypted using pgcrypto.',
      'The platform is SOC 2 Type I audit-ready with comprehensive audit logging covering: organization lifecycle events, data access, record changes, import/export operations, and administrative actions.',
      'PII protection: driver data sent to AI providers is anonymized (IDs only). Sentry error reporting includes PII scrubbing. No fleet data is used to train AI models.',
      'Authentication is handled by Clerk with org-scoped RBAC. Subscription state enforcement (trial, active, past due, canceled) is managed through Stripe integration with automatic access gating.',
      'Content Security Policy violation reporting is active. All API endpoints enforce authentication and role-based authorization.',
    ],
  },
  {
    id: 'billing',
    title: 'Subscription & Billing',
    content: [
      'Fleet-Compliance Sentinel uses Stripe for subscription management. New organizations start with a trial period. A trial countdown banner appears in the app showing days remaining.',
      'When the trial expires, access is gated until a subscription is activated. Use the "Subscribe" or "Upgrade" buttons to start a paid plan through the Stripe checkout flow.',
      'Manage your subscription, update payment methods, or view invoices through the Stripe Customer Portal (accessible from the app). Subscription states include: trial, active, past_due, and canceled.',
      'If a subscription is canceled, a grace period applies before data offboarding begins. The offboarding lifecycle includes: soft-delete of records, then hard-delete after a configured retention period.',
    ],
  },
  {
    id: 'keyboard',
    title: 'Tips & Shortcuts',
    content: [
      'Press Escape to close this manual or any modal dialog.',
      'On mobile, tap "Menu" in the top-left to expand the navigation sidebar. It auto-closes when you navigate to a new page.',
      'Use the Import Data template download to ensure your Excel data matches the expected format before uploading. This prevents most validation errors.',
      'The Alerts preview (dry-run) mode lets you see exactly what emails will be sent before triggering a live run. Use this to verify your configuration is correct.',
      'Suspense items linked to source records (driver CDL, medical card, permit) include a direct link back to the originating record for quick reference.',
      'FMCSA snapshots saved from lookups appear on your Dashboard card — save one after each DOT audit or carrier review to build a compliance history.',
    ],
  },
  {
    id: 'support',
    title: 'Support',
    content: [
      'Fleet-Compliance Sentinel is built and maintained by True North Data Strategies. For questions, support, or feature requests:',
      'Phone: 555-555-5555',
      'Email: jacob@truenorthstrategyops.com',
      'SBA-certified VOSB/SDVOSB.',
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Table of Contents                                                  */
/* ------------------------------------------------------------------ */
function TableOfContents({
  sections,
  activeId,
  onSelect,
}: {
  sections: typeof SECTIONS;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="manual-toc" aria-label="Manual table of contents">
      <p className="manual-toc-heading">Contents</p>
      {sections.map((s, i) => (
        <button
          key={s.id}
          type="button"
          className={`manual-toc-item${s.id === activeId ? ' active' : ''}`}
          onClick={() => onSelect(s.id)}
        >
          <span className="manual-toc-num">{String(i + 1).padStart(2, '0')}</span>
          {s.title}
        </button>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function UserManualModal() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`manual-section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <button
        type="button"
        className="fc-sidebar-link"
        onClick={() => setOpen(true)}
        style={{ cursor: 'pointer', border: 'none', background: 'none', textAlign: 'left', width: '100%' }}
      >
        User Manual
      </button>

      {open && (
        <div
          className="manual-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="User Manual"
        >
          <div className="manual-modal manual-modal--wide">
            {/* Header */}
            <div className="manual-header">
              <div>
                <h2 style={{ margin: 0 }}>Fleet-Compliance Sentinel</h2>
                <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: '0.85rem' }}>
                  User Manual &mdash; True North Data Strategies
                </p>
              </div>
              <button
                type="button"
                className="manual-close"
                onClick={() => setOpen(false)}
                aria-label="Close manual"
              >
                X
              </button>
            </div>

            {/* Body: TOC + Content */}
            <div className="manual-body manual-body--split">
              <TableOfContents
                sections={SECTIONS}
                activeId={activeSection}
                onSelect={scrollToSection}
              />

              <div className="manual-content">
                {SECTIONS.map((section, idx) => (
                  <section
                    key={section.id}
                    id={`manual-section-${section.id}`}
                    className="manual-section"
                  >
                    <h3>
                      <span className="manual-section-num">{String(idx + 1).padStart(2, '0')}</span>
                      {section.title}
                    </h3>
                    {section.content.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </section>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="manual-footer">
              <span>True North Data Strategies</span>
              <span style={{ opacity: 0.6 }}>|</span>
              <a href="tel:555-555-5555">555-555-5555</a>
              <span style={{ opacity: 0.6 }}>|</span>
              <a href="mailto:jacob@truenorthstrategyops.com">jacob@truenorthstrategyops.com</a>
            </div>
          </div>

          {/* Scoped styles */}
          <style>{`
            .manual-modal--wide {
              max-width: 960px;
              width: 95vw;
              max-height: 90vh;
              display: flex;
              flex-direction: column;
            }
            .manual-body--split {
              display: flex;
              flex: 1;
              min-height: 0;
              overflow: hidden;
            }
            /* Table of Contents */
            .manual-toc {
              width: 220px;
              min-width: 220px;
              border-right: 1px solid rgba(255,255,255,0.08);
              overflow-y: auto;
              padding: 12px 0;
              flex-shrink: 0;
            }
            .manual-toc-heading {
              font-size: 0.7rem;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              opacity: 0.5;
              padding: 0 16px;
              margin: 0 0 8px;
            }
            .manual-toc-item {
              display: flex;
              align-items: center;
              gap: 8px;
              width: 100%;
              padding: 6px 16px;
              border: none;
              background: none;
              color: inherit;
              font-size: 0.8rem;
              text-align: left;
              cursor: pointer;
              opacity: 0.7;
              transition: opacity 0.15s, background 0.15s;
            }
            .manual-toc-item:hover {
              opacity: 1;
              background: rgba(255,255,255,0.04);
            }
            .manual-toc-item.active {
              opacity: 1;
              background: rgba(61,142,185,0.12);
              border-left: 2px solid #3d8eb9;
            }
            .manual-toc-num {
              font-size: 0.7rem;
              opacity: 0.4;
              font-variant-numeric: tabular-nums;
            }
            /* Content area */
            .manual-content {
              flex: 1;
              overflow-y: auto;
              padding: 16px 24px 32px;
            }
            .manual-section {
              margin-bottom: 28px;
              padding-bottom: 20px;
              border-bottom: 1px solid rgba(255,255,255,0.06);
            }
            .manual-section:last-child {
              border-bottom: none;
            }
            .manual-section h3 {
              display: flex;
              align-items: center;
              gap: 10px;
              margin: 0 0 12px;
              font-size: 1.05rem;
            }
            .manual-section-num {
              font-size: 0.75rem;
              opacity: 0.35;
              font-variant-numeric: tabular-nums;
            }
            .manual-section p {
              margin: 0 0 10px;
              line-height: 1.6;
              font-size: 0.9rem;
              opacity: 0.88;
            }
            .manual-section p:last-child {
              margin-bottom: 0;
            }
            /* Footer */
            .manual-footer {
              display: flex;
              align-items: center;
              gap: 12px;
              justify-content: center;
              padding: 10px 16px;
              border-top: 1px solid rgba(255,255,255,0.08);
              font-size: 0.78rem;
              opacity: 0.6;
              flex-shrink: 0;
            }
            .manual-footer a {
              color: #3d8eb9;
              text-decoration: none;
            }
            .manual-footer a:hover {
              text-decoration: underline;
            }
            /* Mobile responsive */
            @media (max-width: 700px) {
              .manual-body--split {
                flex-direction: column;
              }
              .manual-toc {
                width: 100%;
                min-width: unset;
                max-height: 160px;
                border-right: none;
                border-bottom: 1px solid rgba(255,255,255,0.08);
              }
              .manual-content {
                padding: 12px 16px 24px;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
