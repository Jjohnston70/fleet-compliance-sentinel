# CLAUDE.md — Fleet-Compliance Sentinel

**Project:** Fleet-Compliance Sentinel (FCS)
**Owner:** Jacob Johnston, True North Data Strategies
**System:** Multi-tenant B2B SaaS for DOT/FMCSA fleet compliance, training LMS, employee onboarding, and operational visibility
**Last Updated:** 2026-04-06

---

## Behavioral Rules (Coding Agent)

These rules govern all code changes, file edits, and implementation decisions.
See `/docs/ARCHITECTURE.md` for system design. See `.claude/SECURITY.md` for hard rules.

---

### 1. Think Before You Code

Do not silently guess.

- State assumptions before implementing.
- If ambiguous, ask. Do not pick an interpretation silently.
- If a simpler solution exists, say so before building the complex one.
- If the request seems wrong or risky, flag it.
- Do not act certain when uncertain.

---

### 2. Keep Solutions Simple

- Solve the requested problem with minimum code.
- No unrequested features, abstractions, or configurability.
- If the solution feels large, step back and simplify.
- Ask: Is this the smallest change that solves the problem?

---

### 3. Stay Strictly Within Scope

- Do not refactor unrelated code.
- Do not rewrite comments or formatting unless the task requires it.
- Match existing style and conventions.
- Mention unrelated problems separately — do not fix them silently.
- Every changed line must be justifiable from the request.

---

### 4. Make Surgical Diffs

- Touch as few files as possible.
- Change as little code as necessary.
- Preserve existing structure unless changing it is required.
- Do not delete pre-existing unused code unless asked.

---

### 5. Work Toward Verifiable Outcomes

Turn requests into clear success criteria:

- "Fix the bug" -> reproduce, fix, verify
- "Add validation" -> add checks, verify behavior
- "Refactor" -> preserve behavior, confirm no regressions

For multi-step tasks, make a short plan with verification points before executing.

---

### 6. Read Before You Write

- Read enough nearby code to understand context before editing.
- Identify local conventions before introducing new patterns.
- Do not infer architecture from one file when others are available.
- If context is missing, say so.

---

### 7. Preserve Intent

- Preserve comments unless clearly outdated by the task.
- Preserve behavior unless the change is meant to alter it.
- Call out any intentional behavior change explicitly.
- Do not make hidden product or design decisions.

---

### 8. Security and Compliance First

See `.claude/SECURITY.md` for the full rule set. Short version:

- No PII in logs, prompts, or error trackers — ever.
- Every database query must include `org_id`.
- No auth bypass, no direct DB access without tenant isolation.
- No credentials in code, comments, or test files.
- Flag any compliance risk immediately — do not proceed.

---

### 9. Ask at the Right Time

Pause and ask if:

- The request is ambiguous in a way that affects implementation.
- The correct behavior is unclear.
- The task requires an architectural or product decision.
- You are choosing between tradeoffs Jacob should approve.

Do not fabricate certainty to stay moving.

---

### 10. Final Check Before Finishing

Confirm before calling done:

- The request was actually addressed.
- The change is no larger than necessary.
- Unrelated code was not modified.
- Assumptions were surfaced.
- Security rules were followed.
- Affected tests or checks were run when possible.

---

## Project Context

**What this is:** Fleet-Compliance Sentinel — a multi-tenant B2B SaaS platform that gives small fleet operators (5-20 vehicles) real-time visibility into DOT/FMCSA compliance, employee credentials, training, dispatch, and financial operations. Built on Next.js 15 App Router with Clerk org-scoped auth, Neon PostgreSQL, Stripe billing, and a modular command architecture. Pipeline Penny AI provides LLM-powered regulatory guidance via Railway FastAPI backend.

**Status:** Production (SOC 2 observation window active since March 24, 2026; Type I eligible June 22, 2026). All 8 SOC 2 phases complete. Module integration sprint complete. Training LMS (B1-B9) complete. Enterprise hardening (A0-A8) complete. Onboarding orchestration live. 6 critical training findings pending resolution before first paying client.

**Critical Active Work:**

- Fix 6 critical training findings (C-1 through C-6) before first paying client
- Complete onboarding Phase 6 release gate (P6-T2 through P6-T4)
- Establish compliance evidence collection cadence
- Prepare for first client onboarding end-to-end

**Architecture summary:** Next.js 15 App Router on Vercel -> Clerk auth -> Neon PostgreSQL (org_id scoped) -> Module gateway (7 hardening layers) -> Railway FastAPI (Penny AI). Stripe billing with 4 tiers. 15+ command modules. Resend for email. Sentry/Datadog/UptimeRobot for monitoring. Upstash Redis for rate limiting.

**Data Source Policy (Effective 2026-04-06):**

- NO demo data, seed data, or synthetic data in production databases.
- The ONLY external data entering the system is via the bulk import functions (`/api/fleet-compliance/import`) or direct user input through the UI.
- Do NOT create test/demo records in database tables. Do NOT seed fake employees, assets, or training data.
- Knowledge base documents (`knowledge/`) are regulatory/reference content and are the exception -- they are not client data.
- Jacob's sandbox org is the permanent testing environment. Do NOT delete it.
- All test data must be clearable via the admin data management API.

**Read:** `.claude/ARCHITECTURE.md`, `.claude/SECURITY.md`, `.claude/STACK.md`, `.claude/COMMANDS.md`

**ALWAYS END WITH A COMMIT MESSAGE FOR USR TO COPY AND NEVER COMMIT UNLESS ASKED**
