# activeContext.md — Current Work State

**Last Updated:** 2026-04-04
**Update this file at the start of every session.**

---

## What We're Working On Right Now

### Immediate Priority (Week 1-2) — Feedback Loop Closure

Three critical loops are broken. Fix these before any new architecture work:

| Task | Description | Effort | Status |
|------|------------|--------|--------|
| Knowledge freshness monitoring | Daily hash comparison of CFR sources, alert when content changes | 2-3 days | NOT STARTED |
| Citation validation | Post-generation check — validate every CFR citation Penny produces against FAISS vector store before showing to user | 2 days | NOT STARTED |
| Outcome tracking | 7-day follow-up email after Penny answers — "Did you take the recommended action?" | 1 week | NOT STARTED |

### Month 1 — Graph-Augmented RAG

After feedback loops are closed:
- Deploy Neo4j locally → extract 100 CFR relationships → test graph queries
- Build intent classifier (simple vs. multi-hop routing)
- Wire LightRAG dual-retrieval into Penny pipeline
- A/B test (50/50 split) — measure improvement before full rollout

### Running in Parallel — CommandStack Platform

Separate build, 3-month timeline:
- Month 1: Platform core + graph RAG foundation
- Month 2: Fleet Command as first module
- Month 3: Realty Command + launch at commandstack.com
- Decision gate at Month 3: Evolve FCS independently or migrate to CommandStack

---

## Recent Decisions

| Decision | Rationale | Date |
|---------|-----------|------|
| Option C — incremental evolution, not rebuild | Close feedback loops fast, add graph RAG incrementally, decide at Month 3 gate | 2026-04-04 |
| Knowledge freshness before graph RAG | Broken loops are a liability now. Graph RAG is an enhancement. Fix liability first. | 2026-04-04 |
| CommandStack parallel build (Option B) | 3-month timeline, Fleet Command as first module, commandstack.com | Per COMMAND-STACK-DECISIONS.md |

---

## Current Blockers

_Update this section when blockers arise or are cleared._

- None known as of 2026-04-04

---

## Active Files (What's Being Modified)

_Update this when you start working on a specific area._

- None active — session starting fresh

---

## Session Notes

_Drop quick notes here during work sessions. Clear at start of next major phase._

- ARCHITECTURE.md v2.0 completed — World Model analysis done, gaps documented, roadmap set
- .claude/ folder being built out — this is part of that effort

---

## What's Done (This Phase)

- [x] World Model analysis of FCS — scored 6.5/10, gaps documented
- [x] ARCHITECTURE.md v2.0 written
- [x] SpecKit system reviewed — available for structured spec workflow
- [x] .claude/ folder scaffolded with behavioral rules, security, architecture, stack, commands

---

## What's Next (After Current Tasks)

1. Close all three feedback loops (knowledge freshness, citation validation, outcome tracking)
2. Verify feedback loops with 50-query test suite
3. Deploy Neo4j locally for graph extraction
4. Extract 100 CFR 382 relationships manually
5. Build rule-based intent classifier
6. Wire into Penny pipeline for A/B test
