# Penny Eval Strategy

This document captures the current evaluation approach for Pipeline Penny and why it matches the best practices that are actually documented by major platform vendors.

## Best-Practice Baseline

The current guidance is consistent across the official sources reviewed on March 18, 2026:

- OpenAI recommends grounding answers in your data, optimizing chunking/indexing/retrieval, and running evals before deployment. Source: [OpenAI Knowledge Retrieval blueprint](https://openai.com/solutions/blueprints/knowledge-retrieval/)
- Anthropic recommends comprehensive project content, descriptive filenames, grouping related content together, and referencing specific documents by name to improve retrieval. Source: [Anthropic RAG for projects](https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects)
- Microsoft recommends evaluating RAG in two layers:
  - process evaluation for retrieval quality
  - system evaluation for groundedness, relevance, and response completeness
  Sources: [RAG evaluators](https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-evaluators/rag-evaluators), [Observability in Generative AI](https://learn.microsoft.com/en-us/azure/foundry/concepts/observability)

## What That Means For Penny

For this stack, the right order of operations is:

1. Fix corpus coverage first.
2. Fix chunking and retrieval ranking next.
3. Add repeatable evals for retrieval and final answers.
4. Track failures over time.
5. Only consider fine-tuning after retrieval quality is stable.

That is why Penny now uses:

- CFR section chunking instead of whole-part retrieval
- query enrichment for common compliance phrasing
- retrieval ranking tuned toward exact CFR parts and section citations
- a gold-question eval set with pass/fail checks

## Current Eval Scope

The current local harness covers two layers:

1. Retrieval checks
- Calls Penny backend `POST /debug/search`
- Confirms the expected source section appears in the ranked hits

2. Answer checks
- Calls Penny backend `POST /query`
- Confirms the final answer contains expected answer markers

This is intentionally simple and deterministic. It does not depend on an LLM-as-judge yet, which keeps it cheap and repeatable while the corpus and ranking are still moving quickly.

## Current Files

- Eval dataset: [evals/penny_eval_questions.json](./evals\penny_eval_questions.json)
- Eval runner: [scripts/run-penny-evals.mjs](./scripts\run-penny-evals.mjs)
- Latest results:
  - [latest.json](./evals\results\latest.json)
  - [latest.md](./evals\results\latest.md)
- Retrieval debug endpoint: [main.py](./railway-backend\app\main.py)

## How To Run

From the website repo root:

```powershell
npm run eval:penny
```

This uses `PENNY_API_URL` and `PENNY_API_KEY` from `.env`.

If the backend key only exists in Railway service env, use:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-penny-evals-railway.ps1
```

## Recommended Next Extensions

Once the current retrieval quality is stable, the next best-practice upgrades are:

1. Add more gold questions, especially edge cases and known failures.
2. Add query-level expected retrieved document IDs or section titles.
3. Add a judge-based groundedness pass for final answers.
4. Evaluate sampled production traffic, not just hand-written tests.
5. Add missing CFR coverage, especially Part 397 for hazmat routing questions.

## What Is Not Implemented Yet

- No automated groundedness judge yet
- No completeness judge against long-form ground truth yet
- No production traffic sampling dashboard yet
- No CI gate yet

Those are good later steps, but they are not the right first step while corpus coverage and retrieval are still being corrected.

