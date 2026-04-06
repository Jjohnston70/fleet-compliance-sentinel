# Fleet-Compliance Sentinel User Manual

## Table of Contents

- [What Fleet-Compliance Sentinel Does](#what-fleet-compliance-sentinel-does)
- [Current Status (April 2026)](#current-status-april-2026)
- [Before You Start](#before-you-start)
- [Getting Started](#getting-started)
- [Dashboard Overview](#dashboard-overview)
- [Operations](#operations)
  - [Assets](#assets)
  - [Employees](#employees)
  - [Dispatch](#dispatch)
  - [Tasks](#tasks)
  - [Onboarding](#onboarding)
- [Compliance Tracking](#compliance-tracking)
  - [Compliance Module](#compliance-module)
  - [DQ Files (Driver Qualification)](#dq-files-driver-qualification)
  - [Suspense Items](#suspense-items)
  - [Alerts & Notifications](#alerts--notifications)
  - [FMCSA Carrier Lookup](#fmcsa-carrier-lookup)
- [Training Hub](#training-hub)
  - [Training Overview](#training-overview)
  - [My Training](#my-training)
  - [Training Administration](#training-administration)
  - [Hazmat Training Reports](#hazmat-training-reports)
  - [Courses & Workshops](#courses--workshops)
- [Finance & Business](#finance--business)
  - [Financial Overview](#financial-overview)
  - [Sales Analytics](#sales-analytics)
  - [Invoices](#invoices)
  - [Proposals](#proposals)
  - [Contracts](#contracts)
  - [Realty](#realty)
- [Intelligence & Analytics](#intelligence--analytics)
  - [Email Analytics](#email-analytics)
  - [Readiness Scoring](#readiness-scoring)
  - [GovCon & Compliance](#govcon--compliance)
  - [Telematics](#telematics)
- [Import Data](#import-data)
- [Pipeline Penny AI Assistant](#pipeline-penny-ai-assistant)
- [Module Tools & Skills](#module-tools--skills)
- [Command Center](#command-center)
- [Settings & Configuration](#settings--configuration)
  - [Alert Configuration](#alert-configuration)
  - [Feature Modules](#feature-modules)
  - [Spend Dashboard](#spend-dashboard)
- [Billing & Plans](#billing--plans)
- [Sidebar Navigation](#sidebar-navigation)
- [Tips & Shortcuts](#tips--shortcuts)
- [Troubleshooting](#troubleshooting)
- [Safety & Compliance](#safety--compliance)
- [Support](#support)

---

## What Fleet-Compliance Sentinel Does

Fleet-Compliance Sentinel is your single control center for DOT and FMCSA fleet compliance. It tracks drivers, vehicles, permits, inspections, maintenance, training, and regulatory deadlines across your entire fleet operation so nothing falls through the cracks.

The system consolidates driver qualification files, permit management, compliance calendars, suspense items, telematics integration, training delivery, financial tracking, and AI-powered guidance all in one platform. You get daily automated alerts, searchable compliance history, DQ file consolidation for audits, real-time risk scoring, and on-demand expert skill assistance.

## Current Status (April 2026)

- **Platform Version**: Production
- **Authentication**: Clerk SAML/SSO with org-scoped RBAC
- **Database**: PostgreSQL with real-time encryption
- **Core Tiers**: Trial (30 days), Starter, Pro, Enterprise
- **Audit Status**: SOC 2 Type I audit-ready (73 evidence artifacts)
- **Support Provider**: True North Data Strategies LLC

## Before You Start

1. You need a Clerk organization and org admin credentials to set up the platform.
2. Ensure your team members have a Clerk identity. Invite team members using their email address from the Clerk dashboard.
3. Two roles exist: `admin` (full CRUD, import, configuration, alert management) and `member` (read-only, can create suspense items).
4. Use a modern browser: Chrome, Firefox, Safari, or Edge (latest versions). Mobile browsers are supported but full-width screens are recommended for data tables.
5. Your subscription plan determines which modules are visible. Trial organizations see core operations and compliance tracking; Starter and Pro plans unlock additional intelligence and automation features.

## Getting Started

After signing in through the Clerk portal, new organizations are guided through a one-time onboarding wizard:

1. **Company Information**: Enter your company name, primary contact (name, email, phone), and address.
2. **Fleet Profile**: Specify fleet size, primary DOT concern (compliance, safety, cost, reporting), and operation type (for-hire, private, or mixed).
3. **Confirmation**: Review your choices and submit to activate your organization.

Once onboarding completes, you land on the **Dashboard** — your operational command post.

The sidebar on the left is your primary navigation. Modules are organized into six groups: **Operations**, **Compliance**, **Training**, **Finance**, **Intelligence**, and **Admin**. Some modules are admin-only and appear only to members with the admin role. On mobile, tap "Menu" to expand the sidebar.

Module visibility is configurable per organization. Admins can enable or disable modules from **Admin > Feature Modules** so each organization sees only the capabilities relevant to their operation.

## Dashboard Overview

The Dashboard is your command post. At the top you see four headline metrics:

- **Tracked Assets**: Total vehicles, trailers, equipment, tanks.
- **Driver Records**: Total active employees.
- **Open Suspense Items**: Compliance tasks awaiting action.
- **Permit Records**: Active permits and licenses.

These numbers refresh automatically after imports or record changes.

Below the headlines are three snapshot cards:

**Assets Card**: Shows total units, items due for service soon, and units on maintenance hold. Click through to drill into assets needing attention.

**Compliance Card**: Shows active drivers, medical cards expiring within 60 days, and permit deadlines within 120 days. Click through to the Compliance module for full details.

**Suspense Card**: Shows open items, items due within 7 days, and high-severity count. Click to jump to the Suspense Items module.

A **Module Status Grid** displays cards for each integrated module with status badges so you can see at a glance which capabilities are online.

A **Data Coverage Table** shows row counts per collection, updated after every import. This helps you understand what data is loaded and when the last sync occurred.

An **FMCSA Snapshot Card** shows your most recent carrier lookup result if one has been saved from the FMCSA Lookup module.

## Operations

### Assets

The Assets module is your fleet inventory register. It tracks vehicles, trailers, fuel cubes, storage tanks, and equipment with full lifecycle data: VIN, year, make, model, mileage, assigned driver, location, and maintenance status.

**Browsing Assets**:
1. Open **Operations > Assets**.
2. The table shows all assets by category (Vehicle, Trailer, Tank, Equipment, Other).
3. Use the search box to find by Asset ID, VIN, or name.
4. Use filters to narrow by category or status (Active, Maintenance Hold, Deleted).
5. Click column headers to sort by any field.
6. Click any row to open the asset detail page with a read-only snapshot.

**Adding an Asset Manually**:
1. Click "Add Asset".
2. Fill in required fields: Asset ID, Name, Category.
3. Optional fields: VIN, year, make, model, mileage, assigned driver, location, notes.
4. Click Save. The asset is added to the inventory immediately.

**Bulk Import**: Use the **Import Data** module to upload assets from an Excel template in bulk.

**Asset Soft-Delete**: Assets can be soft-deleted with full audit trail. Deleted assets can be restored from the detail page if needed. A maintenance hold flag lets you mark units as temporarily out of service without deleting them.

### Employees

The Employees module is your driver profile registry. Each employee record stores:

- **Identity**: Full name, status (Active, Inactive, Terminated)
- **Contact**: Phone, email, address
- **CDL Details**: CDL number, state, expiry, endorsements (Hazmat, Passenger, Tanker)
- **Medical**: Card expiry (required per 49 CFR Part 391.41)
- **Clearances**: TSA/TWIC status, drug test schedule
- **Records**: Motor Vehicle Record (MVR) date

**Adding Employees Manually**:
1. Click **Operations > Employees**.
2. Click "Add Employee".
3. Fill in name, contact info, and status.
4. Add CDL details: number, state, expiry, endorsements.
5. Add medical card expiry and clearance dates.
6. Click Save. The employee is created immediately.

**Bulk Import**: Use **Admin > Import Data** to upload employee records from the template in bulk.

**Employee Data Flow**: Employee records feed directly into the Compliance module and Pipeline Penny's fleet context, so your AI assistant always has current driver information when answering regulatory questions.

**Soft-Delete with Audit Trail**: Employees can be marked as Inactive or Terminated. The full edit history is maintained in the audit log.

### Dispatch

The Dispatch module provides fleet dispatch management and vehicle assignment tracking. Use it to schedule drivers to assets, log trip assignments, and track vehicle checkout/return events.

**Dispatch Records Link**: Employees to assets with timestamps, notes, and location data. This module integrates with the Activity Log so all dispatch events appear in the fleet operational timeline.

**Available When**: Dispatch is enabled per-organization through **Admin > Feature Modules**.

### Tasks

The Tasks module is a lightweight task management system for operational to-do items that are not compliance-related. For compliance deadlines, use **Suspense Items** instead.

**Creating Tasks**:
1. Click **Operations > Tasks**.
2. Click "New Task".
3. Enter title, description, assignee, priority, and due date.
4. Click Save.

**Managing Tasks**: Filter tasks by status (open, in-progress, completed) and priority level. Click any task to edit or mark complete.

**Available When**: Tasks is enabled per-organization through **Admin > Feature Modules**.

### Onboarding

The Onboarding module guides new organizations through initial setup. It collects company name, primary contact information, fleet size, address, and primary DOT concern.

**First-Time Setup**: New organizations are automatically guided through onboarding on first login. The wizard steps you through company details and fleet profile.

**Onboarding Status**: Tracked per-organization and cannot be repeated once completed. If your organization needs to update onboarding information later, use the **Settings** page or contact support.

**After Completion**: Once onboarding completes, you are directed to the Dashboard and can begin importing fleet data.

## Compliance Tracking

### Compliance Module

The Compliance module combines driver qualification tracking and permit/license management into one view.

**Using the Compliance View**:
1. Click **Compliance > Compliance**.
2. Use the scope toggle at the top to switch between:
   - **Drivers Only**: View driver CDL, medical, endorsements, and status.
   - **Permits Only**: View permits, licenses, renewal dates, and jurisdiction.
   - **Both**: See both in a unified view.

**Driver Compliance Records Track**:
- **CDL**: Number, state, expiration, and endorsements (Hazmat, Passenger, Tanker)
- **Medical Card**: Expiration per 49 CFR Part 391.41
- **Motor Vehicle Record (MVR)**: Date of last review
- **Drug & Alcohol Testing**: Status per 49 CFR Part 382
- **TSA/TWIC Clearance**: Status and expiry

**Driver Statuses**: Active, Inactive, On Leave, Terminated. Click any driver row to open their full qualification profile.

**Permit & License Records Track**:
- **Permit Type**: Authority type (common carrier, contract, broker, other)
- **Jurisdiction**: State or federal
- **Expiration Date**: Renewal deadline
- **Renewal Cadence**: Annual, biennial, or custom
- **Filing Deadline**: When renewal paperwork must be submitted
- **Owner Email**: Contact for renewal notifications
- **Issue Date & Last Renewal**: Audit trail

**Search & Filter**: Find records by driver name, permit type, owner, agency, or state.

**Automatic Suspense Generation**: All compliance items with approaching deadlines automatically generate suspense items that feed into the Alerts engine.

### DQ Files (Driver Qualification)

The DQ Files module provides a structured view of Driver Qualification files as required by 49 CFR Part 391. Each driver's DQ file consolidates all mandatory documents in one place:

- Application for employment
- Road test certificate
- Annual MVR review
- Medical examiner's certificate
- Driving record inquiries
- Annual review of driving record

**DQ File Status**: Shown per driver with completeness indicators. Missing or expired documents are flagged with severity levels that feed directly into the Suspense Items and Alerts engine.

**Using DQ Files During Audits**:
1. Click **Compliance > DQ Files**.
2. Find the driver's file by name or ID.
3. Click to open the file detail page.
4. Review all consolidated documents at a glance.
5. Print or download the full file for the DOT inspector.

**Available When**: DQ Files is enabled per-organization through **Admin > Feature Modules**.

### Suspense Items

Suspense items are compliance tasks that require action. Think of them as your regulatory to-do list with teeth — every item has a severity level, due date, owner, and audit trail.

**Suspense Item Anatomy**:
- **Title & Description**: What needs to be done.
- **Due Date**: When action is required.
- **Severity**: Critical, High, Medium, Low.
- **Alert Window**: Overdue, Due Today, 7-Day, 14-Day, 30-Day Warning.
- **Owner Email**: Who is responsible.
- **Source**: Driver CDL, medical card, permit, vehicle inspection, maintenance, activity (linked to originating record).
- **Resolution Status**: Open, Resolved, Snoozed.
- **Resolution Notes**: Audit trail of actions taken.

**Creating Suspense Items Manually**:
1. Click **Compliance > Suspense**.
2. Click "New Suspense Item".
3. Enter title, description, due date, severity, and owner email.
4. Select source type (or leave blank for manual items).
5. Click Save. The item is queued for the alerts engine.

**Auto-Generated Items**: Suspense items are created automatically when you import fleet data with approaching deadlines (expiring CDLs, medical cards, permits, vehicle inspections).

**Resolving Items**:
1. Open **Compliance > Suspense**.
2. Click any open item.
3. Click "Resolve".
4. Enter resolution notes describing action taken.
5. Click Confirm. The system records who resolved it, when, and what notes were provided — creating a permanent audit trail for compliance documentation.

**Filtering the Queue**: Filter by severity, alert state, status, or source type to focus on what matters most right now.

### Alerts & Notifications

The Alerts engine runs a daily automated sweep at 08:00 UTC via a scheduled cron job. It scans all open suspense items, groups them by owner email, and sends color-coded compliance reminder emails.

**Alert Windows & Colors**:
- **Overdue (Red)**: Items past due date.
- **Due Today (Orange)**: Items due on current date.
- **7-Day Warning (Yellow)**: Items due within 7 days.
- **14-Day Warning**: Items due within 14 days.
- **30-Day Warning**: Items due within 30 days.

**Email Distribution**: Each owner receives one consolidated email listing all their items by severity. A manager summary email goes to the configured manager address with a full list across all owners.

**Preview Before Sending**:
1. Click **Compliance > Alerts**.
2. Click "Preview Alerts" (dry-run mode).
3. Review what will be sent to each owner and the manager.
4. If satisfied, click "Run Alerts" to send live.

**Manual Triggers**: Use the "Run Alerts" button to manually trigger the alert sweep outside the scheduled 08:00 UTC run.

**Dead-Man Switch**: A 25-hour dead-man switch prevents duplicate sends to the same person in a rolling 24-hour window.

**Configuration**: Alerts are managed under **Admin > Settings**:
- Organization name (used in email subject lines)
- From email address (who the alerts come from)
- Manager email address (receives summary)
- Threshold windows (customize 7-day, 14-day, 30-day thresholds)
- Delivery method: Emails are delivered through the Resend API.

### FMCSA Carrier Lookup

Pull live carrier safety data from the federal FMCSA QCMobile API by entering a USDOT number.

**Running a Lookup**:
1. Click **Compliance > FMCSA Lookup**.
2. Enter a USDOT number (9 digits).
3. Click "Search".
4. Wait for results from the live federal API.

**Results Include**:
- **Carrier Identity**: Legal name, DBA, address, operation type
- **Operating Authority**: Status (common, contract, broker)
- **BASIC Safety Scores**: Safety, Fitness, Crash Indicator, Hours of Service, Driver Fitness, Hazmat
- **Safety Rating**: Current rating
- **Out-of-Service Rates**: Percentage of inspections resulting in out-of-service
- **Cargo Carried**: Types of freight authorized
- **Violation History**: Summary of recent violations

**Saving Snapshots**: Lookup results can be saved as compliance snapshots for your records. Saved snapshots appear on the Dashboard FMCSA card and provide a historical record of carrier safety data over time — useful for audits and DOT inspections.

## Training Hub

### Training Overview

The Training Hub is the landing page for the built-in compliance training LMS. It shows available training courses, completion status, and upcoming certification deadlines for your organization.

**Training Content**: Authored from authoritative sources: Emergency Response Guidebook (ERG 2024), CFR Parts (FMCSA/PHMSA regulations), and DOT training requirements. Content is delivered as slide-based presentations with embedded assessments.

**From the Training Hub**:
1. Employees can browse available courses.
2. See your personal completion progress.
3. Launch training sessions.
4. View earned certificates and expiration dates.

**Admin View** (Admins only):
- View organization-wide training status.
- Identify employees with overdue or upcoming certifications.
- Assign courses to employees.
- Set due dates and passing score thresholds.

### My Training

The My Training page shows your personal training dashboard.

**Your Dashboard Shows**:
- All courses assigned to you.
- Your progress in each course (percentage complete).
- Assessment scores earned.
- Earned certificates and download links.

**Active Courses**: Show a progress bar and a "Continue" button to resume where you left off.

**Completed Courses**: Show your score, completion date, and a link to download your certificate.

**Expiring Training**: Courses with expiring certifications are flagged with warnings so you can re-certify before the deadline. Expiring training certifications also appear as Suspense Items in the compliance workflow.

### Training Administration

Training Admin is an admin-only page for managing the training program.

**Admin Tools**:
- Assign courses to employees.
- Set due dates and completion requirements.
- Review assessment results and scores.
- Configure passing score thresholds per course.
- View organization-wide completion metrics.
- Track per-employee training status.

**Automatic Compliance Updates**: Training completions automatically update the hazmat training compliance records in the database, ensuring that DQ files and compliance tracking stay current without manual data entry.

**Available When**: Training Admin is visible only to org admins under **Training > Training Admin**.

### Hazmat Training Reports

The Hazmat Training Reports page (admin-only) provides detailed compliance reporting for hazmat-endorsed drivers.

**What It Tracks**:
- Initial hazmat training dates.
- Refresher training (required every 3 years under 49 CFR Part 172.704).
- Certification expiration dates.
- Module completions (12 required PHMSA modules, 6 NFPA Awareness, 12 NFPA Operations, supplemental — 31 total modules).

**Filtering & Export**: Reports can be filtered by employee, training type, completion status, and date range. Export options allow you to generate compliance documentation for DOT audits.

**Available When**: Admin-only page under **Training > Hazmat Reports**.

### Courses & Workshops

The Courses & Workshops page lists the full catalog of available training content.

**Course Card Information**:
- Title and description
- Estimated duration
- Required CFR references
- Whether a certificate is issued on completion

**Course Format**: Slide-based delivery with embedded multiple-choice and scenario-based assessments. You must achieve the passing score threshold to earn a completion certificate.

**Available When**: Courses & Workshops is enabled per-organization through **Admin > Feature Modules**.

## Finance & Business

### Financial Overview

The Financial module provides a high-level view of your fleet financial operations. It consolidates data from Invoices, Spend Dashboard, and Sales into a unified financial summary.

**Key Metrics**:
- Total spend
- Revenue tracking
- Profit margins
- Cost-per-mile or cost-per-asset breakdowns when sufficient data is available

**Available When**: Enabled per-organization through **Admin > Feature Modules**.

### Sales Analytics

The Sales module provides sales analytics, CSV import capability, and revenue forecasting.

**Core Features**:
- **5 KPI Calculations**: Revenue, deal size, conversion, profit, margin
- **Time-Series Trends**: Daily, weekly, monthly, quarterly data
- **Period-over-Period Comparison**: Compare current vs. prior periods
- **Top Product Rankings**: See what moves volume
- **Channel Breakdown**: Analyze by sales channel

**Importing Sales Data**:
1. Click **Finance > Sales**.
2. Click "Import Sales CSV".
3. Upload a CSV file with headers: Date, Product, Region, SalesRep, Channel, Revenue, UnitsSold, COGS.
4. Aliases supported: Qty (for UnitsSold), Sales Price (for Revenue).
5. The system validates and processes up to 10,000 rows per import with automatic batch processing.

**Forecasting**:
- Revenue forecasting uses moving average projections.
- Forecasts can be saved and compared against actual results over time.

**Available When**: Enabled per-organization through **Admin > Feature Modules**.

### Invoices

The Invoices module tracks maintenance invoices with full vendor, amount, category, and asset linkage.

**Invoice Register**:
1. Click **Finance > Invoices**.
2. The table shows: Invoice ID, Vendor, Date, Category, Linked Asset, Amount.
3. Use search to find by invoice number, vendor, or asset.
4. Sort by any column.

**Adding Invoices Manually**:
1. Click "Add Invoice".
2. Enter vendor name, date, amount, and category.
3. Optionally link to a specific asset for per-unit cost tracking.
4. Click Save.

**PDF Invoice Parsing**:
1. Click "Upload PDF".
2. Select a PDF invoice from 12 supported fleet maintenance vendors.
3. The PDF parser extracts: vendor name, invoice number, date, amounts, line items (parts, labor, shop supplies, tax).
4. Pre-filled fields appear in the form for your review.
5. Override any field if the parser missed something.
6. Click Save. The invoice is added with extracted data.

**Invoice Categories**: Maintenance, Permits, Fuel, Insurance, Other. These feed directly into the Spend Dashboard for financial visibility.

**Available When**: Invoices is enabled per-organization through **Admin > Feature Modules**.

### Proposals

The Proposals module supports generation and tracking of business proposals.

**Features**:
- Create proposals from templates.
- Track status through the pipeline.
- Manage revisions.

**Available When**: Enabled per-organization through **Admin > Feature Modules**.

### Contracts

The Contracts module tracks active contracts, renewal dates, and contract terms. It helps ensure fleet service agreements and vendor contracts stay current.

**Available When**: Enabled per-organization through **Admin > Feature Modules**.

### Realty

The Realty module tracks real estate and facility-related compliance for fleet operations — yard locations, terminal leases, storage facilities, and environmental permits tied to physical locations.

**Available When**: Enabled per-organization through **Admin > Feature Modules**.

## Intelligence & Analytics

### Email Analytics

The Email Analytics module provides visibility into compliance email communications. Track alert delivery success rates, open rates, and response patterns to ensure your team is receiving and acting on compliance notifications.

**Available When**: Enabled per-organization through **Admin > Feature Modules**.

### Readiness Scoring

The Readiness module provides a compliance readiness score for your fleet operation. It evaluates data completeness across all compliance categories — driver qualifications, permits, vehicle inspections, maintenance records, and training status — to give you a single readiness metric.

**Use Cases**:
- Preparation tool before DOT audits or carrier reviews.
- Identify gaps in your compliance posture.
- Benchmark your readiness over time.

**Available When**: Enabled per-organization through **Admin > Feature Modules**.

### GovCon & Compliance

The GovCon & Compliance module manages the full federal contracting lifecycle:

**Opportunity Tracking**: Find opportunities from SAM.gov.

**Bid Decisions**: Weighted bid/no-bid decisions using 7 criteria and 14 weight points.

**Contact Management**: Outreach contact database and engagement tracking.

**Pipeline Reporting**: Win-loss analysis and opportunity metrics.

**Compliance Document Generation**: 7 compliance document packages (Internal Policy, Security Handbook, Data Privacy, GovCon, Google Partner, Business Ops, CMMC/FedRAMP) in DOCX, PDF, and Markdown formats.

**Intake Wizard**: Maps business profiles to compliance skill domains with governance-weighted maturity scoring (0-10 scale).

**Bid Package Generation**: Capability statements, technical approaches, and full proposals.

**Regulatory Backing**: 216 regulatory templates covering NIST 800-53, NIST 800-171, CMMC, SOC 2, FedRAMP, HIPAA, PCI DSS, GDPR, CCPA, and ISO 27001.

**Available When**: Pro plan and above. Enabled per-organization through **Admin > Feature Modules**.

### Telematics

The Telematics module displays real-time fleet risk scores from your connected telematics provider (currently supporting Verizon Connect Reveal).

**Vehicle Risk Table**: Shows vehicle number, make/model/year, numeric risk score, risk level (HIGH/MEDIUM/LOW), last seen timestamp, 7-day GPS event count, and associated exception flags.

**Driver Risk Table**: Shows driver name, HOS/ELD status, risk score, risk level, and associated flags.

**Summary Stats**:
- Total vehicles and drivers tracked.
- Risk level distribution (HIGH/MEDIUM/LOW counts).
- Top flags (most common risk signals).
- Last sync timestamp.

**Risk Level Color Coding**:
- **HIGH (Red)**: Risky driving behavior, GPS violations, or HOS breaches.
- **MEDIUM (Orange)**: Monitored alerting; warrants attention.
- **LOW (Green)**: Compliant operations.

**Sync Schedule**: Telematics data syncs automatically once daily at 02:00 UTC. The sync pulls vehicle rosters, driver rosters, GPS events, HOS logs, and DVIR records from Verizon Reveal.

**Demo Mode**: Available for evaluation purposes.

**Credentials**: Telematics credentials are encrypted at rest using pgcrypto and are never exposed to the frontend.

**Available When**: Starter plan and above. Enabled per-organization through **Admin > Feature Modules**.

## Import Data

The Import Data module supports bulk upload of fleet records from Excel files.

**Supported Collections** (13 total):
1. Drivers
2. Assets Master
3. Vehicles & Equipment
4. Permits & Licenses
5. Employees
6. Storage Tanks
7. Maintenance Schedule
8. Activity Log
9. Maintenance Tracker
10. Invoices
11. Maintenance Line Items
12. Colorado Contacts
13. Emergency Contacts

**Import Workflow**:

1. **Download Template**: Click "Download Template" on the Import Data page. This XLSX file has pre-built sheets and validation hints for each collection.

2. **Fill Your Data**: Open the template in Excel and fill in your records following the column headers and format notes. Leave optional columns blank if not applicable.

3. **Upload File**: Return to Import Data and click "Upload" to select your completed CSV or XLSX file.

4. **System Parses & Validates**: The system parses every row against the collection schema. Validation rules enforce:
   - Required fields per collection
   - Date format (YYYY-MM-DD)
   - Email format (user@domain.com)
   - Status enumerations (Active, Inactive, Terminated, etc.)
   - Category enumerations
   - No duplicate primary keys

5. **Review Flagged Rows**: Errors are highlighted with explanations. You can correct inline or reject rows.

6. **Approve/Reject Rows**: Click on any flagged row to review details. Check "Approve" to include it in the commit, or leave unchecked to skip.

7. **Commit Approved Rows**: Click "Commit Import". All approved rows are written to the database and suspense items are auto-generated for items with approaching deadlines.

**Import Metadata**:
- Every import batch gets a UUID for tracking.
- Import history is displayed so you can review past uploads.
- Use the "Rollback" button to undo an entire batch in one click if something went wrong.

**Example: Uploading Employees**

1. Download template.
2. Fill in employee rows: Name, Status, Phone, Email, Address, CDL#, CDL State, CDL Expiry, Endorsements, Medical Expiry, TSA/TWIC, Drug Test Date, MVR Date.
3. Save as CSV or XLSX.
4. Upload to Import Data.
5. System validates. Any missing required fields are flagged.
6. Review and correct flagged rows.
7. Click Commit. Employees are added and any with expiring medical cards within 60 days automatically get suspense items created.

## Pipeline Penny AI Assistant

Pipeline Penny is a document-grounded compliance assistant that searches the live CFR corpus (13 Parts including Part 172 and Part 397), ERG handbook content, and indexed knowledge folders.

**What Penny Knows**:
- **CFR Content**: All 13 DOT compliance parts including driver qualification (Part 391), hours of service (Part 395), vehicle maintenance (Part 396), hazardous materials (Parts 172, 173, 397).
- **ERG 2024**: Emergency Response Guidebook for hazmat incident response.
- **Your Fleet Data**: Server-side context about active drivers, assets, permits, and open suspense items.

**Fleet Context Examples**:
- "Which of my drivers have medical cards expiring this month?" (Penny knows your driver roster)
- "What are my current high-severity compliance gaps?" (Penny knows your suspense items)
- "Do I have any hazmat-endorsed drivers?" (Penny knows your driver records)

**Using Pipeline Penny**:
1. Click **Admin > Penny AI** or navigate to `/penny`.
2. Ask a question in the chat box.
3. Penny responds with citations showing which source documents informed the answer.
4. Use the sidebar to browse the indexed catalog and understand what knowledge is available.

**Choosing Your LLM Provider**:
- Click the settings gear icon.
- Select your preferred provider and model:
  - **Anthropic Claude** (default): claude-sonnet-4-6, claude-opus-4-6, claude-3-haiku
  - **OpenAI**: gpt-4o-mini, gpt-4o, gpt-4.1-mini
  - **Google Gemini**: gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-pro
  - **Ollama**: llama3.1, deepseek-coder-v2, qwen2.5 (fully local/private processing)
- Your setting is saved in browser storage per session.

**Helper Questions**:
- "What's available in your knowledge base right now?"
- "Summarize the ERG 2024 handbook for initial hazmat response."
- "What documents should a hazmat driver carry in the truck?"
- "What is the 150 air-mile radius exemption under DOT rules?"
- "Summarize driver qualification requirements in Part 391."
- "What does Part 395 say about hours of service recordkeeping?"
- "What maintenance requirements are covered in Part 396?"

**Security & Privacy**:
- **Injection Defense**: 6 injection defense rules on every query to protect against prompt injection attacks.
- **Fast-Reject Filtering**: Keyword-based filtering blocks known injection patterns.
- **Sanitized Output**: Markdown is cleaned to prevent XSS vulnerabilities.
- **OWASP Compliance**: Compliant with OWASP LLM Top 10 security framework.
- **PII Protection**: Driver data sent to LLM providers is anonymized (IDs only, no names or personal information).
- **No Training Data**: No fleet data is used to train AI models.

**Rate Limiting**: 20 queries per 60 seconds per user.

**Backend Status**: A health indicator shows connection status to the Penny backend service.

## Module Tools & Skills

Module Tools is a platform-admin operator panel for running integrated backend modules directly from the UI. It connects to the Module Gateway — a unified execution layer that orchestrates integrated tooling modules.

**Available Modules**:
1. **ML-EIA Petroleum Intel**: Energy market analysis and price forecasting (9 actions)
2. **ML-Signal Stack**: Multi-source business signal processing (8 actions)
3. **PaperStack**: Document generation, conversion, and inspection (13 actions)
4. **Command Center**: Tool discovery and routing hub (13 actions)

**Total**: 43 gateway actions available.

**Running a Module Action**:
1. Platform admins click **Admin > Module Tools**.
2. Select the module from the catalog dropdown.
3. Choose an action from the list.
4. Configure arguments using the JSON editor.
5. Set a timeout (how long to wait for results).
6. Choose dry-run mode (test without side effects) or live mode (execute).
7. Click "Execute". Each run gets a unique correlation ID for tracking.

**Run History**:
- Shows all recent executions.
- Displays status: queued, running, success, fail.
- Output preview (stdout/stderr).
- Error detail if execution failed.
- Result payload (JSON response).
- Generated artifacts (files created by the action).

**Security**:
- All module actions are restricted to a fixed allowlist — no arbitrary shell execution is possible.
- Platform-admin authentication is required for all Module Tools operations.
- The module gateway is undergoing 7-layer enterprise hardening: tool registry, schema validation, execution sandbox, retry manager, token/cost attribution, audit logging, and tenant isolation.

**Available Skills** (via Pipeline Penny):
- **ARO Assessment**: AI readiness scoring across 6 dimensions
- **Risk Manager**: Operational risk identification and prioritization
- **Data Privacy Coach**: HIPAA, SOC 2, GDPR, CCPA compliance guidance
- **Financial Analyst**: Invoice analysis, spend trends, anomaly detection
- **Bid Strategist**: Federal contracting go/no-go decisions
- **Grant Proposal Writer**: Federal and nonprofit grant writing
- **Grant Proposal Evaluator**: Proposal gap analysis and scoring

Ask Penny directly to activate any skill, e.g. "Run a risk assessment" or "Evaluate this grant proposal."

## Command Center

The Command Center Catalog is a platform-admin page that provides a browsable directory of discovered tools across the module gateway. It shows each tool's name, module, description, and available actions in a simple table view.

**Using the Command Center**:
1. Platform admins click **Admin > Command Center**.
2. Browse available tools by module.
3. Click any tool to see description and actions.
4. Use the search box to find tools by name.

**Purpose**: Designed for non-technical users who want to browse available tools and capabilities without dealing with JSON payloads or API documentation.

**Integration**: Integrates with the tool discovery service, search service, and router service to provide real-time status and capability information.

## Settings & Configuration

### Alert Configuration

The Settings page manages your alert engine configuration and organization preferences.

**Configuration Values**:
- **Organization Name**: Used in alert email subject lines
- **From Email Address**: Who alerts come from
- **Manager Summary Email**: Who receives the all-team summary
- **Alert Threshold Windows**: Customize 7-day, 14-day, 30-day warning thresholds

**Local vs. Production**:
- Configuration values are stored locally in the browser for preview purposes.
- For production delivery, the same values must be set as Vercel environment variables.
- Copy-to-clipboard buttons are provided for each setting to make it easy to move to production.

**Team Access** (Clerk Integration):
- Manage team member access and role assignments through the Clerk dashboard integration.
- Invite new team members by email.
- Assign admin or member roles.

### Feature Modules

The Feature Modules page (admin-only) lets you enable or disable individual modules for your organization.

**Using Feature Modules**:
1. Click **Admin > Feature Modules**.
2. Browse all available modules organized by category.
3. Toggle each module on or off.
4. Changes take effect immediately.

**What Happens When Toggled**:
- **Off**: Module is hidden from the sidebar and its routes are inaccessible.
- **On**: Module appears in the sidebar and team members can access it.

**Why Use Toggles**: Allows each organization to have a tailored experience without unnecessary modules cluttering the interface. Default module states are configured at the platform level by plan tier.

**Developer Console**: `/fleet-compliance/dev/modules` is reserved for platform admins and includes multi-tenant selection plus module gateway ACL controls.

### Spend Dashboard

The Spend Dashboard gives you monthly financial visibility across your entire fleet operation.

**Main View**:
- A trend line chart showing total spend by month.
- Category breakdown (Maintenance, Permits, Fuel, Insurance, Other).

**Key Monthly Metrics**:
- Total invoices processed in the month
- Largest vendor by spend
- Category percentage split

**Per-Asset Drill-Down**:
1. Click any asset row.
2. See spending for that specific vehicle, trailer, or piece of equipment.
3. View month-over-month cost history.

**Use Case**: Identify high-maintenance assets that may need replacement or repair strategy adjustment.

## Billing & Plans

Fleet-Compliance Sentinel uses Stripe for subscription management.

**Trial Period**:
- New organizations start with a **30-day trial**.
- A trial countdown banner appears in the app showing days remaining.
- Full access to core features: fleet compliance, driver tracking, permit management, alerts, basic training.

**When Trial Expires**:
- Access is gated until a subscription is activated.
- Use the "Subscribe" or "Upgrade" buttons to start a paid plan.
- Stripe checkout flow handles payment.

**Plan Tiers**:

**Starter Plan**:
- Core compliance, dispatch, invoices, proposals
- Telematics integration, readiness scoring
- Financial analytics, sales tracking
- Compliance skills and tools
- Price: $X/month (configured in Stripe)

**Pro Plan**:
- Everything in Starter, plus:
- Advanced training platform and hazmat reporting
- GovCon and federal contracting module
- Petroleum intelligence and forecasting
- Contract management and realty operations
- Email analytics
- All skills including bid strategist and grant writer
- Price: $X/month (configured in Stripe)

**Enterprise**:
- Custom configuration and support
- All modules and features
- Contact sales for pricing

**Managing Subscription**:
- Use the "Manage Subscription" link in the app.
- Opens the Stripe Customer Portal where you can:
  - Update payment methods
  - View invoices
  - Change plans
  - Cancel subscription

**Subscription States**:
- **Trial**: 30-day trial period, full access
- **Active**: Paid subscription, all features active
- **Past Due**: Payment failed, limited access until resolved
- **Canceled**: Subscription ended, 30-day grace period applies before deletion

**Offboarding Lifecycle**:
- If a subscription is canceled, a 30-day grace period applies during which records are soft-deleted.
- After 60 days total, records are permanently removed.
- The offboarding lifecycle is fully automated and tracked in the audit log.

## Sidebar Navigation

The sidebar is your primary navigation hub. It's organized into six collapsible sections plus an admin section.

**Operations** (Always expanded by default)
- Dashboard
- Assets
- Employees
- Dispatch (if enabled)
- Tasks (if enabled)
- Onboarding

**Compliance** (Always expanded by default)
- Compliance
- DQ Files (if enabled)
- Alerts
- Suspense
- FMCSA Lookup

**Training** (Collapsed by default)
- Training Hub
- My Training
- Training Admin (admin-only)
- Hazmat Reports (admin-only)
- Courses & Workshops (if enabled)

**Finance** (Collapsed by default)
- Financial (if enabled)
- Sales (if enabled)
- Proposals (if enabled)
- Contracts (if enabled)
- Invoices (if enabled)
- Realty (if enabled)

**Intelligence** (Collapsed by default)
- Email Analytics (if enabled)
- Readiness (if enabled)
- GovCon & Compliance (if enabled)
- Telematics (if enabled)

**Skills & Tools** (Collapsed by default)
- Readiness Skills
- Compliance Skills
- Financial Skills
- GovCon Skills
- Realty Skills
- Proposal Skills
- Asset Skills

**Admin** (Collapsed by default, admin-only)
- Settings
- Spend Dashboard
- Import Data
- Feature Modules
- Penny AI
- Command Center (platform admin only)
- Module Tools (platform admin only)
- Developer Module Console (platform admin only)

**Mobile**: On mobile, tap "Menu" to expand the sidebar. It auto-closes when you navigate to a new page.

**Collapsible Groups**: Click section headers to expand/collapse and save your preference in browser storage.

**Role-Based Visibility**: Links that are admin-only or behind module toggles are automatically hidden based on your role and plan.

## Tips & Shortcuts

- **Escape Key**: Press Escape to close this manual or any modal dialog.
- **Mobile Menu**: On mobile, tap "Menu" in the top-left to expand the navigation sidebar.
- **Import Template**: Download the Import Data template to ensure your Excel data matches the expected format before uploading. This prevents most validation errors.
- **Alert Dry-Run**: Use the Alerts preview (dry-run) mode to see exactly what emails will be sent before triggering a live run. Verify your configuration is correct before going live.
- **Suspense Links**: Suspense items linked to source records (driver CDL, medical card, permit) include a direct link back to the originating record for quick reference.
- **FMCSA History**: Save FMCSA snapshots from lookups — they appear on your Dashboard card and provide a historical record over time, useful for audits.
- **Penny for Lookups**: Use Pipeline Penny for quick regulatory lookups — ask about specific CFR parts or your fleet data and get cited, verifiable answers.
- **Module Customization**: Feature Modules (Admin) lets you customize which modules appear in the sidebar for your team, hiding clutter and keeping navigation focused.

## Troubleshooting

**Import Fails with Validation Errors**

1. Download the template again and verify column headers exactly match your file.
2. Check date format — must be YYYY-MM-DD (e.g., 2026-04-06).
3. Check email format — must contain @ and domain (e.g., user@company.com).
4. Check status/category enumerations — use exact values like "Active", "Inactive", "Maintenance", etc.
5. Ensure no duplicate primary keys (e.g., two drivers with same CDL#).
6. Upload smaller batches (under 1,000 rows) to isolate issues.

**Alerts Not Sending**

1. Go to **Admin > Settings** and verify:
   - Organization name is set
   - From email address is configured
   - Manager email is correct
   - Alert threshold windows are reasonable
2. Click "Preview Alerts" (dry-run) to see what would be sent.
3. Check that suspense items exist and are due within configured thresholds.
4. Verify organization has an active subscription (not trial expired).
5. Check email logs in Resend dashboard for delivery issues.

**Suspense Items Not Auto-Generating**

1. During import, the system auto-creates suspense items for:
   - CDLs expiring within 180 days
   - Medical cards expiring within 60 days
   - Permits expiring within 120 days
   - Vehicle inspections expiring within 90 days
2. Verify the data you're importing has these fields populated.
3. Verify the dates are in the future (not past).
4. Check that the import committed successfully (not rolled back).

**Telematics Data Not Syncing**

1. Go to **Intelligence > Telematics**.
2. Check last sync timestamp — should be within 24 hours.
3. Verify telematics credentials are configured in settings (admin-only).
4. If credentials are incorrect, re-enter them — they are encrypted at rest.
5. Contact Verizon Reveal support if the API is down.

**Pipeline Penny Not Responding**

1. Check the backend health indicator (small dot in Penny sidebar).
2. If offline (red), the backend service is down — try again in a few minutes.
3. Verify you have not exceeded the rate limit (20 queries per 60 seconds).
4. Try a different LLM provider if the current one times out.
5. Clear browser cache and reload `/penny` page.

**Module Not Appearing in Sidebar**

1. Go to **Admin > Feature Modules**.
2. Verify the module is toggled on.
3. Verify your plan tier includes the module:
   - Trial: Core only (fleet compliance, onboarding)
   - Starter: Core + telematics, financial, sales, invoices, dq-files, readiness, proposals, tasks
   - Pro: Everything
4. Verify your role can access the module (some are admin-only).
5. Refresh the page — sidebar updates may take a moment.

**Clerk/SSO Not Working**

1. Verify you have a Clerk organization configured.
2. Verify your email is invited to the Clerk org with the correct role.
3. Clear browser cookies and sign out completely.
4. Sign in again via the Clerk login modal.
5. If issue persists, contact Clerk support or your Clerk org admin.

**Training Certificate Not Downloaded**

1. Go to **Training > My Training**.
2. Find the completed course.
3. Look for "Download Certificate" link.
4. If link is missing, the course may not be marked complete yet — check progress bar.
5. If progress shows 100%, but certificate is not available, re-take the final assessment.

## Safety & Compliance

**Data Security**:
- All data is encrypted in transit (TLS) and at rest using PostgreSQL encryption.
- Organization data is fully isolated — no tenant can access another tenant's records.
- Telematics credentials are encrypted using pgcrypto and never exposed to the frontend.

**Audit Readiness**:
- SOC 2 Type I audit-ready with 73 evidence artifacts across 9 control domains.
- Comprehensive audit logging covers: organization lifecycle events, data access, record changes, import/export operations, and administrative actions.

**PII Protection**:
- Driver data sent to AI providers (Pipeline Penny) is anonymized (IDs only, no PII).
- Sentry error reporting includes PII scrubbing with an 8-key deny-list.
- No fleet data is used to train AI models.

**Authentication & Authorization**:
- Handled by Clerk with org-scoped RBAC.
- Two roles: admin (full CRUD, import/rollback, alert configuration, module tools) and member (read access, create suspense items).
- Subscription state enforcement (trial, active, past due, canceled) is managed through Stripe with automatic access gating.

**Security Headers**:
- HSTS (2-year max-age): Enforces HTTPS
- CSP (default-src self): Blocks external scripts and frames
- X-Frame-Options DENY: Prevents clickjacking
- X-Content-Type-Options nosniff: Blocks MIME-type sniffing
- Referrer-Policy strict-origin-when-cross-origin: Controls referrer leakage
- Permissions-Policy: Camera, microphone, geolocation disabled

**Penetration Testing**:
- OWASP ZAP baseline: 59 PASS, 8 WARN, 0 FAIL
- All API endpoints use parameterized SQL queries (100% injection prevention)
- Content Security Policy violation reporting is active

**Compliance Standards**:
- Meets OWASP ASVS requirements for web application security
- Compliant with GDPR data handling (data isolation, encryption, audit logs)
- Supports SOC 2, HIPAA, and PCI DSS compliance for regulated industries

**Best Practices**:
- Keep API keys and tokens in `.env` only — never commit them to git.
- Validate citations for high-impact decisions — always check original source documents.
- Approval-gated steps should be reviewed before execution — do not auto-approve.
- Save FMCSA snapshots periodically to build compliance history for audits.
- Use dry-run mode before running live alerts to verify configuration.

## Support

Fleet-Compliance Sentinel is built and maintained by True North Data Strategies LLC.

For questions, support, or feature requests:

**Phone**: 555-555-5555

**Email**: jacob@truenorthstrategyops.com

**Website**: truenorthstrategyops.com

**Company Status**: SBA-certified VOSB/SDVOSB. Service-Disabled Veteran-Owned Small Business.

---

**Last Updated**: April 2026

**User Manual Version**: 1.0

**For Current Status, Modules & Pricing**: Visit the Dashboard or contact support.

