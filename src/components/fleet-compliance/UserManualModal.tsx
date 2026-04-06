'use client';

import { useState, useEffect, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Section data – every feature in Fleet-Compliance Sentinel         */
/* ------------------------------------------------------------------ */
const SECTIONS: { id: string; title: string; group?: string; content: string[] }[] = [
  /* ── Getting Started ─────────────────────────────────────────────── */
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: [
      'Fleet-Compliance Sentinel is your single control center for DOT and FMCSA fleet compliance. It tracks drivers, vehicles, permits, inspections, maintenance, training, and regulatory deadlines across your entire fleet operation so nothing falls through the cracks.',
      'The system consolidates driver qualification files, permit management, compliance calendars, suspense items, telematics integration, training delivery, financial tracking, and AI-powered guidance all in one platform.',
      'After signing in through the Clerk portal, new organizations are guided through a one-time onboarding wizard. The wizard collects your company name, primary contact information, fleet size, address, and primary DOT concern. Once onboarding completes you land on the Dashboard.',
      'The sidebar on the left is your primary navigation. Modules are organized into six groups: Operations, Compliance, Training, Finance, Intelligence, and Admin. Some modules are admin-only and appear only to members with admin role. On mobile, tap "Menu" to expand the sidebar.',
      'Module visibility is configurable per organization. Admins can enable or disable modules from Admin > Feature Modules so each organization sees only the capabilities relevant to their operation.',
      'For a comprehensive guide with detailed step-by-step instructions and examples, see the standalone USER_MANUAL.md at the project root.',
    ],
  },
  {
    id: 'org-onboarding',
    title: 'Organization Onboarding',
    group: 'Operations',
    content: [
      'The Onboarding module guides new organizations through initial setup on first login. The wizard is a one-time process that cannot be repeated once completed.',
      'Step 1 - Company Information: Enter your company name, primary contact name and email, phone number, and business address.',
      'Step 2 - Fleet Profile: Specify your fleet size (estimated number of vehicles), primary DOT concern (compliance, safety, cost, or reporting), and operation type (for-hire, private, or mixed).',
      'Step 3 - Confirmation: Review your choices and submit to activate your organization. You will be assigned an intake token that links to your organization record for audit and verification purposes.',
      'After onboarding completes, you are directed to the Dashboard. If your organization needs to update onboarding information later, use the Settings page or contact support.',
      'Once onboarding is complete, begin importing fleet data using the Import Data module to populate your assets, employees, permits, and compliance records.',
    ],
  },
  {
    id: 'employee-onboarding',
    title: 'Employee Onboarding & Intake Tokens',
    group: 'Operations',
    content: [
      'New employees joining your fleet operation can be registered through the Employees module. Each employee is assigned a unique intake token that tracks their onboarding journey and compliance readiness.',
      'The Employees module stores: full name, status (Active, Inactive, Terminated), contact info, CDL details (number, state, expiry, endorsements), medical card expiry, TSA/TWIC clearance, drug test schedule, and Motor Vehicle Record (MVR) date.',
      'Intake tokens are used to track: initial document collection, background check completion, training assignment, certification verification, and compliance verification before first dispatch.',
      'Employee records feed directly into the Compliance module, Training Hub, and Pipeline Penny context. Your AI assistant always has current driver information when answering regulatory questions.',
      'Add employees individually using the "Add Employee" form, or import in bulk through Admin > Import Data. Employee records support soft-delete with restore capability and maintain a full audit trail.',
      'For bulk onboarding, download the Import Data template, fill in employee rows with name, status, contact info, CDL details, and clearance dates, then upload and commit the batch.',
    ],
  },

  /* ── OPERATIONS GROUP ────────────────────────────────────────────── */
  {
    id: 'dashboard',
    title: 'Dashboard',
    group: 'Operations',
    content: [
      'The Dashboard is your operational command post. At the top you see four headline metrics: Tracked Assets, Driver Records, Open Suspense Items, and Permit Records. These numbers refresh automatically after imports or record changes.',
      'Below the headline metrics are three snapshot cards. The Assets card shows total units, items due for service soon, and units on maintenance hold. The Compliance card shows active drivers, medical cards expiring within 60 days, and permit deadlines within 120 days. The Suspense card shows open items, items due within 7 days, and high-severity count.',
      'A module status grid displays cards for each integrated module with status badges so you can see at a glance which capabilities are online. The data coverage table shows row counts per collection, updated after every import.',
      'The FMCSA snapshot card shows your most recent carrier lookup result if one has been saved.',
    ],
  },
  {
    id: 'assets',
    title: 'Assets',
    group: 'Operations',
    content: [
      'The Assets module is your fleet inventory register. It tracks vehicles, trailers, fuel cubes, storage tanks, and equipment with full lifecycle data: VIN, year, make, model, mileage, assigned driver, location, and maintenance status.',
      'From the Assets list you can search by any field, filter by category or status, and sort by column. Click any row to open the asset detail page with a read-only snapshot of that unit.',
      'To add a new asset, click "Add Asset" and fill in the required fields (Asset ID, Name, Category). Optional fields include VIN, year, make, model, mileage, assigned driver, location, and notes.',
      'Assets support soft-delete with full audit trail. Deleted assets can be restored from the detail page if needed. A maintenance hold flag lets you mark units as temporarily out of service without deleting them.',
      'For bulk additions, use the Import Data module to upload assets from an Excel template.',
    ],
  },
  {
    id: 'employees',
    title: 'Employees',
    group: 'Operations',
    content: [
      'The Employees module is your driver profile registry. Each employee record stores: full name, status (Active/Inactive/Terminated), contact info (phone, email, address), CDL details (number, state, expiry, endorsements), medical card expiry, TSA/TWIC clearance, drug test schedule, and MVR record date.',
      'Add employees individually using the "Add Employee" form, or import in bulk through the Import Data module. Employee records support soft-delete with restore capability and maintain a full audit trail.',
      'Employee data feeds directly into the Compliance module and Pipeline Penny\'s fleet context, so your AI assistant always has current driver information when answering regulatory questions.',
    ],
  },
  {
    id: 'dispatch',
    title: 'Dispatch',
    group: 'Operations',
    content: [
      'The Dispatch module provides fleet dispatch management and vehicle assignment tracking. Use it to schedule drivers to assets, log trip assignments, and track vehicle checkout/return events.',
      'Dispatch records link employees to assets with timestamps, notes, and location data. This module integrates with the Activity Log so all dispatch events appear in the fleet operational timeline.',
      'This module is enabled per-organization through Feature Modules.',
    ],
  },
  {
    id: 'tasks',
    title: 'Tasks',
    group: 'Operations',
    content: [
      'The Tasks module is a lightweight task management system for operational to-do items that are not compliance-related (for compliance deadlines, use Suspense Items instead).',
      'Create tasks with a title, description, assignee, priority, and due date. Tasks can be filtered by status (open, in-progress, completed) and priority level.',
      'This module is enabled per-organization through Feature Modules.',
    ],
  },
  {
    id: 'onboarding',
    title: 'Onboarding',
    group: 'Operations',
    content: [
      'The Onboarding module guides new organizations through initial setup. It collects your company name, primary contact information, fleet size, address, and primary DOT concern.',
      'After onboarding completes, the system provisions your organization record and you are directed to the Dashboard. Onboarding status is tracked per-organization and cannot be repeated once completed.',
      'If your organization needs to update onboarding information later, use the Settings page or contact support.',
    ],
  },

  /* ── COMPLIANCE GROUP ────────────────────────────────────────────── */
  {
    id: 'compliance',
    title: 'Compliance Tracking',
    group: 'Compliance',
    content: [
      'The Compliance module combines driver qualification tracking and permit/license management into one view. Use the scope toggle at the top to switch between Drivers Only, Permits Only, or Both.',
      'Driver Compliance Records Track: CDL number, state, expiration, and endorsements (Hazmat, Passenger, Tanker); medical card expiration per 49 CFR Part 391.41; Motor Vehicle Record (MVR) dates; drug and alcohol testing status per 49 CFR Part 382; and TSA/TWIC clearance status.',
      'Driver Statuses: Active, Inactive, On Leave, Terminated. Click any driver row to open their full qualification profile and detailed compliance history.',
      'Permit & License Records Track: permit type, jurisdiction (state or federal), expiration date, renewal cadence (annual, biennial, custom), authority status (common carrier, contract, broker), issue date, last renewal date, owner email, filing deadline, and notes.',
      'Search & Filter: Find records by driver name, permit type, owner, agency, or state. Use these controls to isolate records requiring action.',
      'Automatic Suspense Generation: All compliance items with approaching deadlines automatically generate suspense items that feed into the Alerts engine. Expiring CDLs (180 days), medical cards (60 days), and permits (120 days) trigger alerts automatically.',
    ],
  },
  {
    id: 'dq-files',
    title: 'DQ Files (Driver Qualification)',
    group: 'Compliance',
    content: [
      'The DQ Files module provides a structured view of Driver Qualification files as required by 49 CFR Part 391. Each driver\'s DQ file consolidates all mandatory documents in one place: application for employment, road test certificate, annual MVR review, medical examiner\'s certificate, driving record inquiries, and annual review of driving record.',
      'DQ file status is shown per driver with completeness indicators. Missing or expired documents are flagged with severity levels that feed directly into the Suspense Items and Alerts engine.',
      'Use this module during DOT audits to quickly pull a complete driver qualification file for any employee. The consolidated view ensures you can verify compliance at a glance without searching across multiple sections.',
      'This module is enabled per-organization through Feature Modules.',
    ],
  },
  {
    id: 'alerts',
    title: 'Alerts & Notifications',
    group: 'Compliance',
    content: [
      'The Alerts engine runs a daily automated sweep at 08:00 UTC via a scheduled cron job. It scans all open suspense items, groups them by owner email, and sends color-coded compliance reminder emails.',
      'Alert windows: Overdue (red) for items past due, Due Today (orange), 7-Day Warning (yellow), 14-Day Warning, and 30-Day Warning. Each owner receives one consolidated email listing all their items by severity.',
      'A manager summary email goes to the configured manager address with a full list across all owners.',
      'The Alerts page lets you preview alert content before it sends (dry-run mode) and manually trigger the alert sweep using the "Run Alerts" button. A 25-hour dead-man switch prevents duplicate sends.',
      'Alert configuration is managed under Settings: organization name (used in email subject lines), from email address, manager email, and threshold windows. Emails are delivered through the Resend API.',
    ],
  },
  {
    id: 'suspense',
    title: 'Suspense Items',
    group: 'Compliance',
    content: [
      'Suspense items are compliance tasks that require action. Think of them as your regulatory to-do list with teeth — every item has a severity level, due date, owner, and audit trail.',
      'Each suspense item includes: title, description, due date, severity (Critical, High, Medium, Low), alert window (overdue, due-today, 7-day, 14-day, 30-day), owner email, source type (driver CDL, medical card, permit, vehicle inspection, maintenance, activity), source record ID (linked to the originating record), resolution status (open, resolved, snoozed), and notes.',
      'Suspense items can be created manually from the "New Suspense Item" form, or they are auto-generated when you import fleet data with approaching deadlines.',
      'To resolve an item, click "Resolve" on its detail page. You must enter resolution notes. The system records who resolved it, when, and what notes were provided — creating a permanent audit trail for compliance documentation.',
      'Filter the suspense queue by severity, alert state, status, or source type to focus on what matters most right now.',
    ],
  },
  {
    id: 'fmcsa',
    title: 'FMCSA Carrier Lookup',
    group: 'Compliance',
    content: [
      'Pull live carrier safety data from the federal FMCSA QCMobile API by entering a USDOT number. Results include carrier identity (legal name, DBA, address, operation type), operating authority status (common, contract, broker), BASIC safety scores (Safety, Fitness, Crash Indicator, Hours of Service, Driver Fitness, Hazmat), safety rating, out-of-service rates, cargo carried, and violation history.',
      'Lookup results can be saved as compliance snapshots for your records. Saved snapshots appear on the Dashboard FMCSA card and provide a historical record of carrier safety data over time — useful for audits and DOT inspections.',
    ],
  },

  /* ── TRAINING GROUP ──────────────────────────────────────────────── */
  {
    id: 'training-hub',
    title: 'Training Hub',
    group: 'Training',
    content: [
      'The Training Hub is the landing page for the built-in compliance training LMS. It shows available training courses, completion status, and upcoming certification deadlines for your organization.',
      'Training content is authored from authoritative sources: Emergency Response Guidebook (ERG 2024), CFR Parts (FMCSA/PHMSA regulations), and DOT training requirements. Content is delivered as slide-based presentations with embedded assessments.',
      'From the Training Hub, employees can browse available courses, see their completion progress, and launch training sessions. Admins can view organization-wide training status and identify employees with overdue or upcoming certifications.',
    ],
  },
  {
    id: 'my-training',
    title: 'My Training',
    group: 'Training',
    content: [
      'The My Training page shows your personal training dashboard. It lists all courses assigned to you, your progress in each, assessment scores, and earned certificates.',
      'Active courses show a progress bar and a "Continue" button to resume where you left off. Completed courses show your score, completion date, and a link to download your certificate.',
      'Courses with expiring certifications are flagged with warnings so you can re-certify before the deadline. Expiring training certifications also appear as Suspense Items in the compliance workflow.',
    ],
  },
  {
    id: 'training-admin',
    title: 'Training Admin',
    group: 'Training',
    content: [
      'Training Admin is an admin-only page for managing the training program. It provides tools to assign courses to employees, set due dates, review assessment results, and manage the training module catalog.',
      'The admin view includes: organization-wide completion metrics, per-employee training status, course assignment management, and the ability to configure passing score thresholds for each course.',
      'Training completions automatically update the hazmat training compliance records in the database, ensuring that DQ files and compliance tracking stay current without manual data entry.',
    ],
  },
  {
    id: 'hazmat-reports',
    title: 'Hazmat Training Reports',
    group: 'Training',
    content: [
      'The Hazmat Training Reports page (admin-only) provides detailed compliance reporting for hazmat-endorsed drivers. It tracks initial training, refresher training (required every 3 years under 49 CFR Part 172.704), and certification expiration dates.',
      'Reports can be filtered by employee, training type, completion status, and date range. Export options allow you to generate compliance documentation for DOT audits.',
      'The module covers 12 required PHMSA modules, 6 NFPA Awareness modules, 12 NFPA Operations modules, and supplemental training — 31 total training modules.',
    ],
  },
  {
    id: 'courses',
    title: 'Courses & Workshops',
    group: 'Training',
    content: [
      'The Courses & Workshops page lists the full catalog of available training content. Each course card shows the title, description, estimated duration, required CFR references, and whether a certificate is issued on completion.',
      'Courses use a slide-based delivery format with embedded multiple-choice and scenario-based assessments. You must achieve the passing score threshold to earn a completion certificate.',
      'This module is enabled per-organization through Feature Modules.',
    ],
  },

  /* ── FINANCE GROUP ───────────────────────────────────────────────── */
  {
    id: 'financial',
    title: 'Financial Overview',
    group: 'Finance',
    content: [
      'The Financial module provides a high-level view of your fleet financial operations. It consolidates data from Invoices, Spend Dashboard, and Sales into a unified financial summary.',
      'Key metrics include total spend, revenue tracking, profit margins, and cost-per-mile or cost-per-asset breakdowns when sufficient data is available.',
      'This module is enabled per-organization through Feature Modules.',
    ],
  },
  {
    id: 'sales',
    title: 'Sales',
    group: 'Finance',
    content: [
      'The Sales module provides sales analytics, CSV import capability, and revenue forecasting. It tracks products, customers, and sales records with full reporting.',
      'Core features include: 5 KPI calculations (revenue, deal size, conversion, profit, margin), time-series trend data (daily/weekly/monthly/quarterly), period-over-period comparison, top product rankings, and channel breakdown analysis.',
      'Import sales data from CSV files with automatic field mapping and validation. The module supports up to 10,000 rows per import with batch processing.',
      'Revenue forecasting uses moving average projections. Forecasts can be saved and compared against actual results over time.',
      'This module is enabled per-organization through Feature Modules.',
    ],
  },
  {
    id: 'proposals',
    title: 'Proposals',
    group: 'Finance',
    content: [
      'The Proposals module supports generation and tracking of business proposals. Create proposals from templates, track their status through the pipeline, and manage revisions.',
      'This module is enabled per-organization through Feature Modules.',
    ],
  },
  {
    id: 'contracts',
    title: 'Contracts',
    group: 'Finance',
    content: [
      'The Contracts module tracks active contracts, renewal dates, and contract terms. It helps ensure fleet service agreements and vendor contracts stay current.',
      'This module is enabled per-organization through Feature Modules.',
    ],
  },
  {
    id: 'invoices',
    title: 'Invoices',
    group: 'Finance',
    content: [
      'The Invoices module tracks maintenance invoices with full vendor, amount, category, and asset linkage. The invoice register shows a sortable table with Invoice ID, Vendor, Date, Category, Linked Asset, and Amount.',
      'Add invoices manually using the form, or upload a PDF invoice for automatic parsing. The PDF parser extracts vendor name, invoice number, date, amounts, and line items (parts, labor, shop supplies, tax) from 12 supported fleet maintenance vendors.',
      'After PDF parsing, extracted fields are pre-filled in the form for your review. You can override any field before saving. Invoices can be linked to specific assets in your fleet for per-unit cost tracking.',
      'Invoice categories include: Maintenance, Permits, Fuel, Insurance, and Other. These categories feed directly into the Spend Dashboard for financial visibility.',
    ],
  },
  {
    id: 'realty',
    title: 'Realty',
    group: 'Finance',
    content: [
      'The Realty module tracks real estate and facility-related compliance for fleet operations — yard locations, terminal leases, storage facilities, and environmental permits tied to physical locations.',
      'This module is enabled per-organization through Feature Modules.',
    ],
  },

  /* ── INTELLIGENCE GROUP ──────────────────────────────────────────── */
  {
    id: 'email-analytics',
    title: 'Email Analytics',
    group: 'Intelligence',
    content: [
      'The Email Analytics module provides visibility into compliance email communications. Track alert delivery success rates, open rates, and response patterns to ensure your team is receiving and acting on compliance notifications.',
      'This module is enabled per-organization through Feature Modules.',
    ],
  },
  {
    id: 'readiness',
    title: 'Readiness',
    group: 'Intelligence',
    content: [
      'The Readiness module provides a compliance readiness score for your fleet operation. It evaluates data completeness across all compliance categories — driver qualifications, permits, vehicle inspections, maintenance records, and training status — to give you a single readiness metric.',
      'Use this as a preparation tool before DOT audits or carrier reviews to identify gaps in your compliance posture.',
      'This module is enabled per-organization through Feature Modules.',
    ],
  },
  {
    id: 'govcon',
    title: 'GovCon & Compliance',
    group: 'Intelligence',
    content: [
      'The GovCon & Compliance module manages the full federal contracting lifecycle: opportunity tracking from SAM.gov, weighted bid/no-bid decisions (7 criteria, 14 weight points), outreach contact management, and pipeline reporting with win-loss analysis.',
      'It generates 7 compliance document packages (Internal Policy, Security Handbook, Data Privacy, GovCon, Google Partner, Business Ops, CMMC/FedRAMP) in DOCX, PDF, and Markdown. Includes an intake wizard that maps business profiles to compliance skill domains, governance-weighted maturity scoring (0-10 scale), and bid document generation (capability statements, technical approaches, full proposals).',
      'Backed by 216 regulatory templates covering NIST 800-53, NIST 800-171, CMMC, SOC 2, FedRAMP, HIPAA, PCI DSS, GDPR, CCPA, and ISO 27001.',
      'This module is enabled per-organization through Feature Modules.',
    ],
  },
  {
    id: 'telematics',
    title: 'Telematics',
    group: 'Intelligence',
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

  /* ── ADMIN GROUP ─────────────────────────────────────────────────── */
  {
    id: 'settings',
    title: 'Settings',
    group: 'Admin',
    content: [
      'The Settings page manages your alert engine configuration and organization preferences. Set your organization name (used in email subject lines), the "from" email address for alert delivery, the manager summary email address, and alert threshold windows.',
      'Configuration values are stored locally in the browser for preview purposes. For production delivery, the same values must be set as Vercel environment variables. Copy-to-clipboard buttons are provided for each setting to make this easy.',
      'Admin users can manage team member access and role assignments through the Clerk dashboard integration.',
    ],
  },
  {
    id: 'spend',
    title: 'Spend Dashboard',
    group: 'Admin',
    content: [
      'The Spend Dashboard gives you monthly financial visibility across your entire fleet operation. The main view shows a trend line chart of total spend by month and a category breakdown (Maintenance, Permits, Fuel, Insurance, Other).',
      'Key monthly metrics include: total invoices processed, largest vendor by spend, and category percentage split.',
      'Click any asset row to drill into per-asset spending — see exactly how much each vehicle, trailer, or piece of equipment is costing you month over month. This per-unit view helps identify high-maintenance assets that may need replacement.',
    ],
  },
  {
    id: 'import',
    title: 'Import Data',
    group: 'Admin',
    content: [
      'The Import Data module supports bulk upload of fleet records from Excel files. It validates data across 13 collection types: Drivers, Assets Master, Vehicles & Equipment, Permits & Licenses, Employees, Storage Tanks, Maintenance Schedule, Activity Log, Maintenance Tracker, Invoices, Maintenance Line Items, Colorado Contacts, and Emergency Contacts.',
      'Import workflow: (1) Download the XLSX template with pre-built sheets and validation hints. (2) Fill in your data following the column headers and format notes. (3) Upload your completed file (CSV or XLSX). (4) The system parses and validates every row against the collection schema. (5) Review flagged rows — errors are highlighted with explanations. (6) Approve or reject individual rows. (7) Commit approved rows to the database.',
      'Validation rules enforce: required fields per collection, date format (YYYY-MM-DD), email format, status enumerations (Active/Inactive/etc.), category enumerations, and no duplicate primary keys.',
      'Every import batch gets a UUID. If something goes wrong, use the Rollback button to undo the entire batch in one click. Import history is tracked locally so you can review past uploads.',
    ],
  },
  {
    id: 'command-center',
    title: 'Command Center',
    group: 'Admin',
    content: [
      'The Command Center Catalog is a platform-admin page with a browsable directory of discovered tools across the module gateway. It shows each tool\'s name, module, description, and available actions in a simple table view.',
      'Use the Command Center to understand what capabilities are available before running module actions through Module Tools. This is designed for non-technical users who want to browse available tools without dealing with JSON payloads.',
      'The Command Center integrates with the tool discovery service, search service, and router service to provide real-time status and capability information.',
    ],
  },
  {
    id: 'module-tools',
    title: 'Module Tools',
    group: 'Admin',
    content: [
      'Module Tools is a platform-admin operator panel for running integrated backend modules directly from the UI. It connects to the Module Gateway — a unified execution layer that orchestrates four integrated tooling modules.',
      'Available modules: ML-EIA Petroleum Intel (energy market analysis and price forecasting with 9 actions), ML-Signal Stack (multi-source business signal processing with 8 actions), PaperStack (document generation, conversion, and inspection with 13 actions), and Command Center (tool discovery and routing hub with 13 actions). Total: 43 gateway actions.',
      'To run a module action: select the module from the catalog dropdown, choose an action, configure arguments using the JSON editor, set a timeout, choose dry-run or live mode, and click Execute. Each run gets a unique correlation ID for tracking.',
      'The run history panel shows all recent executions with status (queued, running, success, fail), output preview (stdout/stderr), error detail, result payload, and generated artifacts.',
      'All module actions are restricted to a fixed allowlist — no arbitrary shell execution is possible. Platform-admin authentication is required for all Module Tools operations.',
      'The module gateway is undergoing 7-layer enterprise hardening: tool registry, schema validation, execution sandbox, retry manager, token/cost attribution, audit logging, and tenant isolation.',
    ],
  },
  {
    id: 'penny',
    title: 'Pipeline Penny (AI Assistant)',
    group: 'Admin',
    content: [
      'Pipeline Penny is a document-grounded compliance assistant that searches the live CFR corpus (13 Parts including Part 172 and Part 397), ERG handbook content, and indexed knowledge folders.',
      'Penny automatically receives server-side context about your fleet: active drivers, assets, permits, and open suspense items. This means Penny can answer questions like "Which of my drivers have medical cards expiring this month?" or "What are my current high-severity compliance gaps?"',
      'Choose your preferred LLM provider from the chat interface: Anthropic Claude (default), OpenAI GPT-4o-mini, Google Gemini 2.5 Flash, or Ollama for fully local/private processing. Each provider offers multiple model options.',
      'Penny includes security hardening: 6 injection defense rules on every query, keyword-based fast-reject filtering, sanitized markdown output, and OWASP LLM Top 10 compliance. Driver data is anonymized (IDs only, no PII sent to LLM providers).',
      'The Penny sidebar shows the currently indexed catalog with category counts and document titles. Each response includes source citations so operators can verify answers against the original CFR text. A backend health indicator shows connection status.',
      'Rate limiting: 20 queries per 60 seconds per user. Use the helper question buttons for quick starts, or type your own question.',
    ],
  },
  {
    id: 'module-toggles',
    title: 'Feature Modules',
    group: 'Admin',
    content: [
      'The Feature Modules page (admin-only, under Admin > Feature Modules) lets you enable or disable individual modules for your organization. This controls which sidebar links and features are visible to your team.',
      'Toggle modules on or off based on your fleet operation needs. Changes take effect immediately — disabled modules are hidden from the sidebar and their routes are inaccessible.',
      'This allows each organization to have a tailored experience without unnecessary modules cluttering the interface. Default module states are configured at the platform level.',
      'The Developer Module Console at /fleet-compliance/dev/modules is platform-admin only and includes multi-tenant controls plus module gateway ACL management.',
    ],
  },

  /* ── PLATFORM SECTIONS ───────────────────────────────────────────── */
  {
    id: 'security',
    title: 'Data Security & Compliance',
    content: [
      'All data is encrypted in transit (TLS) and at rest. Organization data is fully isolated — no tenant can access another tenant\'s records. Telematics credentials are encrypted using pgcrypto.',
      'The platform is SOC 2 Type I audit-ready with 73 evidence artifacts across 9 control domains. Comprehensive audit logging covers: organization lifecycle events, data access, record changes, import/export operations, and administrative actions.',
      'PII protection: driver data sent to AI providers is anonymized (IDs only). Sentry error reporting includes PII scrubbing with an 8-key deny-list. No fleet data is used to train AI models.',
      'Authentication is handled by Clerk with org-scoped RBAC. Two roles: admin (full CRUD, import/rollback, alert configuration, module tools) and member (read access, create suspense items). Subscription state enforcement (trial, active, past due, canceled) is managed through Stripe with automatic access gating.',
      'Security headers include: HSTS (2-year max-age), CSP (default-src self), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, and Permissions-Policy (camera, microphone, geolocation disabled).',
      'OWASP ZAP penetration testing baseline: 59 PASS, 8 WARN, 0 FAIL. All API endpoints use parameterized SQL queries (100% injection prevention). Content Security Policy violation reporting is active.',
    ],
  },
  {
    id: 'billing',
    title: 'Subscription & Billing',
    content: [
      'Fleet-Compliance Sentinel uses Stripe for subscription management. New organizations start with a 30-day trial period. A trial countdown banner appears in the app showing days remaining.',
      'When the trial expires, access is gated until a subscription is activated. Use the "Subscribe" or "Upgrade" buttons to start a paid plan through the Stripe checkout flow.',
      'Manage your subscription, update payment methods, or view invoices through the Stripe Customer Portal (accessible from the app). Subscription states include: trial, active, past_due, and canceled.',
      'If a subscription is canceled, a 30-day grace period applies during which records are soft-deleted. After 60 days total, records are permanently removed. The offboarding lifecycle is fully automated and tracked in the audit log.',
    ],
  },
  /* ── SKILLS & TOOLS GROUP ─────────────────────────────────────────── */
  {
    id: 'skills-overview',
    title: 'Skills & Tools',
    group: 'Skills & Tools',
    content: [
      'Fleet-Compliance Sentinel includes a library of AI-powered skills accessible through Pipeline Penny. Skills are specialized capabilities that analyze your data, assess risks, generate documents, and provide expert guidance on demand. Module Tools remains a platform-admin diagnostics surface.',
      'Available skills depend on your organization\'s plan tier and which modules your admin has enabled. Skills appear in Pipeline Penny\'s tool menu and can also be triggered by asking Penny directly (for example: "Run a risk assessment" or "Check our privacy compliance").',
      'Each skill is designed to produce structured, actionable output following consistent quality standards. Results include citations, scoring matrices, or step-by-step recommendations depending on the skill type.',
    ],
  },
  {
    id: 'skill-readiness',
    title: 'AI Readiness Assessment',
    group: 'Skills & Tools',
    content: [
      'The AI Readiness Assessment (ARO) evaluates your organization\'s preparedness for AI and automation adoption across six dimensions: Data Maturity, Process Readiness, Technology Stack, Team Capability, Governance, and Change Management.',
      'Each dimension is scored on a 1-5 scale with specific criteria. The assessment produces a composite readiness score, identifies gaps, and generates prioritized recommendations for improvement.',
      'Use this skill when evaluating new technology investments, planning digital transformation initiatives, or benchmarking your operational maturity. Ask Penny: "Run an AI readiness assessment" or "How ready are we for automation?"',
    ],
  },
  {
    id: 'skill-risk-manager',
    title: 'Risk Manager',
    group: 'Skills & Tools',
    content: [
      'The Risk Manager skill identifies, scores, and tracks operational risks using a structured probability-impact matrix. It generates risk registers with severity ratings, mitigation strategies, and owner assignments.',
      'Risk categories include: regulatory compliance, operational disruption, financial exposure, technology failure, personnel, and reputational. Each risk gets a composite score and recommended response (avoid, mitigate, transfer, or accept).',
      'Ask Penny: "What are our top risks?" or "Run a risk assessment on our compliance posture" to activate this skill.',
    ],
  },
  {
    id: 'skill-privacy-coach',
    title: 'Data Privacy Coach',
    group: 'Skills & Tools',
    content: [
      'The Data Privacy Coach provides guidance on HIPAA, SOC 2, GDPR, CCPA/CPRA, GLBA, PCI, and state privacy law compliance. It reviews your data handling practices and identifies gaps against regulatory requirements.',
      'The coach can assess specific scenarios (storing driver medical records, sharing data with vendors, handling breach notifications) and provide step-by-step remediation guidance with regulatory citations.',
      'Ask Penny: "Are we HIPAA compliant for driver medical records?" or "What privacy requirements apply to our fleet data?" to get targeted compliance guidance.',
    ],
  },
  {
    id: 'skill-financial-analyst',
    title: 'Financial Analyst',
    group: 'Skills & Tools',
    content: [
      'The Financial Analyst skill performs data analysis on your financial records including trend detection, KPI tracking, variance analysis, and cost optimization identification.',
      'It works with your invoice data, spend records, and budget information to surface patterns, flag anomalies, and generate executive-ready financial summaries.',
      'Ask Penny: "Analyze our spending trends" or "What are our top cost drivers this quarter?" to activate financial analysis.',
    ],
  },
  {
    id: 'skill-bid-strategist',
    title: 'Bid Strategist (GovCon)',
    group: 'Skills & Tools',
    content: [
      'The Bid Strategist evaluates federal contracting opportunities and produces structured bid/no-bid decisions. It analyzes solicitations against your capabilities, past performance, pricing competitiveness, and win probability.',
      'The skill generates opportunity scorecards, competitive positioning analysis, and go/no-go recommendation memos. It covers SAM.gov opportunities, GSA schedules, and agency-specific procurement vehicles.',
      'This skill is available when the GovCon module is enabled. Ask Penny: "Evaluate this opportunity" or "Should we bid on this RFP?"',
    ],
  },
  {
    id: 'skill-grant-writer',
    title: 'Grant Proposal Writer (GovCon)',
    group: 'Skills & Tools',
    content: [
      'The Grant Proposal Writer drafts complete grant proposals for federal, state, local, and nonprofit funding applications. It handles SAMHSA, VA, DOL, community foundations (El Pomar, Pikes Peak), and state agencies (CDHS).',
      'The skill produces: need statements, program designs, budget narratives, logic models, evaluation plans, sustainability plans, and SF-424 content. Each section follows funder-specific formatting and compliance requirements.',
      'This skill is available when the GovCon module is enabled. Ask Penny: "Draft a grant proposal for [funder]" or "Write a need statement for our veteran services program."',
    ],
  },
  {
    id: 'skill-grant-evaluator',
    title: 'Grant Proposal Evaluator (GovCon)',
    group: 'Skills & Tools',
    content: [
      'The Grant Proposal Evaluator reviews draft proposals against funder scoring criteria, compliance requirements, and best practices. It identifies gaps, scores sections, and provides specific improvement recommendations.',
      'The evaluation covers: 2 CFR 200 compliance, funder-specific rubrics, narrative strength, budget alignment, evidence quality, and competitive positioning. Results include a scored rubric and prioritized action items.',
      'This skill is available when the GovCon module is enabled. Ask Penny: "Evaluate this grant proposal" or "Score our SAMHSA application."',
    ],
  },
  {
    id: 'skill-realty',
    title: 'Realty Operations',
    group: 'Skills & Tools',
    content: [
      'The Realty Operations skill provides Colorado and U.S. real estate regulation guidance, transaction compliance checking, and property operations support.',
      'It covers: Colorado Real Estate Commission rules, fair housing compliance, disclosure requirements, contract review, and transaction timeline management.',
      'This skill is available when the Realty module is enabled. Ask Penny: "What are the disclosure requirements for this property?" or "Review this transaction for compliance."',
    ],
  },
  {
    id: 'keyboard',
    title: 'Tips & Shortcuts',
    content: [
      'Press Escape to close this manual or any modal dialog.',
      'On mobile, tap "Menu" in the top-left to expand the navigation sidebar. It auto-closes when you navigate to a new page.',
      'Download the Import Data template to ensure your Excel data matches the expected format before uploading. This prevents most validation errors.',
      'Use the Alerts preview (dry-run) mode to see exactly what emails will be sent before triggering a live run. Verify your configuration is correct before going live.',
      'Suspense items linked to source records (driver CDL, medical card, permit) include a direct link back to the originating record for quick reference.',
      'Save FMCSA snapshots from lookups — they appear on your Dashboard card and provide a historical record over time, useful for audits.',
      'Use Pipeline Penny for quick regulatory lookups — ask about specific CFR parts or your fleet data and get cited, verifiable answers.',
      'Feature Modules (Admin) lets you customize which modules appear in the sidebar for your team, hiding clutter and keeping navigation focused.',
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    content: [
      'Import Fails with Validation Errors: (1) Download template and verify column headers match exactly. (2) Check date format — must be YYYY-MM-DD. (3) Check email format — must contain @. (4) Check status/category enumerations — use exact values like "Active", "Inactive". (5) Ensure no duplicate primary keys. (6) Upload smaller batches under 1,000 rows to isolate issues.',
      'Alerts Not Sending: Go to Admin > Settings and verify organization name, from email address, manager email, and alert threshold windows are configured. Click "Preview Alerts" (dry-run) to see what would be sent. Verify suspense items exist and are due within configured thresholds. Verify organization has active subscription (not trial expired).',
      'Suspense Items Not Auto-Generating: During import, the system auto-creates suspense items for CDLs expiring within 180 days, medical cards within 60 days, permits within 120 days, and vehicle inspections within 90 days. Verify the data you are importing has these fields populated and dates are in the future.',
      'Telematics Data Not Syncing: Go to Intelligence > Telematics and check last sync timestamp — should be within 24 hours. Verify telematics credentials are configured (admin-only). If incorrect, re-enter them — credentials are encrypted at rest.',
      'Pipeline Penny Not Responding: Check the backend health indicator in the Penny sidebar. If offline (red), the backend service is down — try again in a few minutes. Verify you have not exceeded rate limit (20 queries per 60 seconds). Try a different LLM provider if current one times out.',
      'Module Not Appearing in Sidebar: Go to Admin > Feature Modules and verify the module is toggled on. Verify your plan tier includes the module (Trial: core only; Starter: core + telematics, financial, sales; Pro: everything). Verify your role can access the module (some are admin-only). Refresh the page.',
      'Clerk/SSO Not Working: Verify you have a Clerk organization configured. Verify your email is invited to the Clerk org with correct role. Clear browser cookies and sign out completely. Sign in again via the Clerk login modal.',
      'Training Certificate Not Downloaded: Go to Training > My Training and find the completed course. Look for "Download Certificate" link. If missing, the course may not be marked complete yet. If progress shows 100% but certificate unavailable, re-take the final assessment.',
    ],
  },
  {
    id: 'support',
    title: 'Support',
    content: [
      'Fleet-Compliance Sentinel is built and maintained by True North Data Strategies LLC.',
      'Phone: 555-555-5555',
      'Email: jacob@truenorthstrategyops.com',
      'Website: truenorthstrategyops.com',
      'Company Status: SBA-certified VOSB/SDVOSB. Service-Disabled Veteran-Owned Small Business.',
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
  let lastGroup = '';
  return (
    <nav className="manual-toc" aria-label="Manual table of contents">
      <p className="manual-toc-heading">Contents</p>
      {sections.map((s, i) => {
        const groupLabel = s.group && s.group !== lastGroup ? s.group : null;
        if (s.group) lastGroup = s.group;
        return (
          <div key={s.id}>
            {groupLabel && (
              <p className="manual-toc-group">{groupLabel}</p>
            )}
            <button
              type="button"
              className={`manual-toc-item${s.id === activeId ? ' active' : ''}`}
              onClick={() => onSelect(s.id)}
            >
              <span className="manual-toc-num">{String(i + 1).padStart(2, '0')}</span>
              {s.title}
            </button>
          </div>
        );
      })}
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
          role="dialog"
          aria-modal="true"
          aria-label="User Manual"
        >
          <button
            type="button"
            className="manual-overlay-dismiss"
            aria-label="Close manual"
            onClick={() => setOpen(false)}
          />
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
            .manual-overlay {
              position: fixed;
            }
            .manual-overlay-dismiss {
              position: absolute;
              inset: 0;
              border: none;
              background: transparent;
              cursor: default;
            }
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
            .manual-toc-group {
              font-size: 0.65rem;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              opacity: 0.4;
              padding: 10px 16px 4px;
              margin: 0;
              border-top: 1px solid rgba(255,255,255,0.06);
              color: #3d8eb9;
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

