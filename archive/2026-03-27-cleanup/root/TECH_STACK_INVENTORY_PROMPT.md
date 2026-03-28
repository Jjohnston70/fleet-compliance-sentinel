# Tech Stack Inventory -- Walkthrough Prompt

**Scope:** True North Data Strategies + Pipeline Punks (PipelineX v2)
**Output:** Two deliverables -- (1) `.xlsx` cost tracker spreadsheet, (2) `.md` quick-reference doc
**Date Created:** 2026-03-27

---

## Context

This prompt walks the operator (Jacob) through a guided inventory of every service, tool, and platform powering TNDS and Pipeline Punks. The goal is a single source of truth for what we pay, where we log in, when things renew, and where brand assets live.

The codebase already references the services listed below. For each one, Jacob confirms or corrects the details, then Claude builds both deliverables.

---

## Instructions for Claude

1. Read this prompt fully before starting.
2. Use the xlsx skill for the spreadsheet and the documentation skill for the markdown doc.
3. Walk Jacob through each category below, one at a time. For each service ask him to confirm or fill in: login URL, login email, plan/tier, monthly cost, annual cost, renewal/billing date, and any notes.
4. After all categories are complete, build the two deliverables.
5. Save the spreadsheet to the workspace as `TNDS_Tech_Stack_Inventory.xlsx`.
6. Save the markdown doc to `docs/TECH_STACK_REFERENCE.md` in the repo.

---

## Spreadsheet Schema (one row per service)

| Column | Description |
|---|---|
| Category | Grouping (Hosting, Auth, Database, etc.) |
| Service | Name of the tool/platform |
| URL | Login or dashboard URL |
| Login Email | Which email account is used |
| Plan / Tier | Free, Pro, Solo, Enterprise, etc. |
| Monthly Cost | Dollar amount (or "included" / "free") |
| Annual Cost | Dollar amount or formula =Monthly*12 |
| Billing Cycle | Monthly / Annual / Usage-based |
| Next Renewal | Date |
| SOC 2 Status | Yes / No / N/A |
| Business Unit | TNDS / Pipeline Punks / Shared |
| Notes | Anything relevant (limits, gotchas, contract terms) |

---

## Known Services to Walk Through

Below is every service detected in the codebase and business operations. Jacob confirms details for each.

### 1. Hosting & Deployment
- **Vercel** -- Frontend, API routes, cron jobs, auto-deploy from GitHub
- **Railway** -- FastAPI backend, 5GB volume for knowledge store
- **Squarespace** -- Domain registrar and DNS (pipelinepunks.com, truenorthstrategyops.com)
- **Google Domains / Cloudflare** -- Confirm if any other DNS providers are in play

### 2. Database & Cache
- **Neon** -- Serverless PostgreSQL (primary data store)
- **Upstash** -- Redis for rate limiting

### 3. Authentication & Identity
- **Clerk** -- Org-scoped auth, RBAC, MFA

### 4. Payments & Billing
- **Stripe** -- Payment processing and subscriptions

### 5. Monitoring & Observability
- **Sentry** -- Error tracking, performance, session replay
- **Datadog** -- Log aggregation (structured audit logs)
- **UptimeRobot** -- Public status page + endpoint monitoring (Solo plan)

### 6. Email & Communications
- **Resend** -- Transactional/compliance email delivery
- **Google Workspace** -- Business email (jacob@truenorthstrategyops.com)

### 7. AI / LLM Providers
- **Anthropic** -- Claude API (primary LLM)
- **OpenAI** -- GPT-4o-mini (secondary LLM)
- **Google AI** -- Gemini 2.5 Flash (optional)
- **Ollama** -- Local/self-hosted (no cost, dev only)

### 8. Version Control & CI/CD
- **GitHub** -- Repo hosting, branch protection, CODEOWNERS, PRs
- **GitHub Actions** -- CI/CD (if applicable, confirm)

### 9. Development Tools
- **Claude Code** -- Agentic coding (CLI)
- **VS Code** -- IDE
- **Cursor / Codex** -- Confirm current status

### 10. External APIs (Regulatory)
- **FMCSA QCMobile API** -- Carrier safety lookups (free/gov)
- **Federal Register API** -- CFR document retrieval (free/gov)

### 11. Business Operations (TNDS-wide)
- **Google Workspace** -- Drive, Sheets, Docs, Calendar, Gmail
- **Google Cloud Platform** -- SDK, any active projects or billing
- **Firebase** -- Any active projects
- **Looker Studio** -- Dashboards/reporting
- **AppSheet** -- No-code apps (if still active)

### 12. Design & Brand
- **Canva** -- If used for design work
- **Any other design tools** -- Figma, Adobe, etc.

### 13. Other / Catch-All
- **Carahsoft** -- VAR reseller path (status?)
- **SBA/SAM.gov** -- VOSB/SDVOSB certification (renewal date?)
- **Any subscriptions not listed above**

---

## Brand Assets Inventory

Collect locations and status of all brand assets. Claude should help Jacob organize these into a `brand/` folder if one does not exist.

### Logos Found in Repo
- `public/PPenny-Logo.png` -- Pipeline Penny logo
- `public/Pipeline Penny logo variations.png` -- Penny variations
- `public/PipelineX-penny.png` -- PipelineX + Penny combo
- `public/Service-Disabled Veteran-Owned-Certified.png` -- SDVOSB badge
- `public/Veteran-Owned Certified.png` -- VOSB badge
- `public/favicon.ico` -- Site favicon
- `public/og-default.png` -- Open Graph default image

### Assets to Collect (Jacob provides)
- [ ] TNDS primary logo (navy/teal brand)
- [ ] TNDS icon/favicon
- [ ] Pipeline Punks logo (if separate from PipelineX)
- [ ] FOB logo (if exists)
- [ ] Built Different Apparel logo
- [ ] Brand font files or font names
- [ ] Any letterhead templates
- [ ] Social media profile images / banners

### Brand Reference (from preferences)
- **Primary Color:** Navy #1a3a5c
- **Accent Color:** Teal #3d8eb9
- **Voice:** Direct, no-fluff, military-influenced clarity
- **Tagline:** "Turning Data into Direction"

---

## Deliverables

### 1. TNDS_Tech_Stack_Inventory.xlsx
- One tab: full inventory with all columns from schema above
- Second tab: monthly/annual cost summary with totals
- Conditional formatting: red for services without SOC 2, green for compliant
- Filter-ready headers

### 2. docs/TECH_STACK_REFERENCE.md
- Grouped by category
- Each service: name, what it does, URL, tier, monthly cost
- Total monthly/annual burn at the bottom
- Brand assets section with file paths
- Last updated date

### 3. Brand Assets Organization
- Create `public/brand/` folder if needed
- Move or copy logos into organized structure
- Document what is missing vs. what exists

---

## Constraints

- Do not store passwords, API keys, or secrets in either deliverable.
- Login email is acceptable. Login URLs are acceptable.
- Flag any service that lacks SOC 2 compliance (per subprocessor registry).
- If Jacob does not know a cost or renewal date, mark it "TBD" -- do not guess.
- All costs in USD.

---

## Execution Order

1. Walk through categories 1-13, collecting details from Jacob
2. Build the spreadsheet
3. Build the markdown reference doc
4. Organize brand assets
5. Final review -- verify totals, flag gaps, confirm nothing is missing
