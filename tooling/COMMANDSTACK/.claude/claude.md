# CLAUDE.md — Fleet Compliance Sentinel / CommandStack

**Project:** Pipeline Punks — Fleet Compliance Sentinel + Pipeline Penny
**Owner:** Jacob Johnston, True North Data Strategies LLC
**System:** Multi-tenant DOT compliance SaaS + RAG AI assistant
**Last Updated:** 2026-04-04

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

### 2.
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

- "Fix the bug" → reproduce, fix, verify
- "Add validation" → add checks, verify behavior
- "Refactor" → preserve behavior, confirm no regressions

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

- No PII in logs, prompts, or Sentry errors — ever.
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

**What this is:** A production DOT compliance SaaS platform for petroleum and pipeline operators.
Fleet Compliance Sentinel handles driver qualification, telematics, training, and compliance alerts.
Pipeline Penny is the RAG-based AI assistant trained on CFR 49 regulations (25,616 chunks).

**Status:** Production + Active Evolution (see ARCHITECTURE.md for current gaps and roadmap)

**Critical Active Work:**
1. Close feedback loops — knowledge freshness, citation validation, outcome tracking
2. Graph-augmented RAG (Neo4j + LightRAG) — Month 1 build
3. SOC 2 Type I observation window (started March 2026, target June 2026)
4. CommandStack migration decision at Month 3 gate

**Architecture summary:** Next.js 14 (Vercel) → FastAPI (Railway) → Neon Postgres + FAISS → Clerk auth → Datadog audit logs

**Read:** `.claude/ARCHITECTURE.md`, `.claude/SECURITY.md`, `.claude/STACK.md`, `.claude/COMMANDS.md`
