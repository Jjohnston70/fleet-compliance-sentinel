# Penny Autoresearch Loop

Automated retrieval optimization for Pipeline Penny, adapted from
[Karpathy's autoresearch](https://github.com/karpathy/autoresearch) pattern.

The loop gives an AI agent (Claude) the current retrieval config, eval results,
and a program file describing what to optimize. The agent proposes one change,
the eval runs, and the result is kept or discarded based on score improvement.

## How to Run

```bash
# Default: up to 20 iterations
node scripts/penny-autoresearch.mjs

# Custom max iterations
node scripts/penny-autoresearch.mjs --max 10
```

### Prerequisites

1. `ANTHROPIC_API_KEY` must be set in `.env` or environment (used for the agent loop)
2. `PENNY_API_URL` and `PENNY_API_KEY` must be set in `.env` (used for eval runs)
3. The Railway backend must be running and accessible
4. `evals/penny-program.md` must exist (the agent's instruction file)

## What Happens Each Iteration

1. Reads `evals/penny-program.md` for agent instructions
2. Reads current `railway-backend/app/main.py`
3. Reads `evals/results/latest.json` for the current score
4. Calls Claude (claude-sonnet-4-20250514) to propose one targeted change
5. Writes the modified `main.py`
6. Runs `npm run eval:penny` against the live Railway backend
7. Reads the new score from `evals/results/latest.json`
8. If improved: `git commit` with a descriptive message including scores
9. If same or worse: revert `main.py` to the previous version
10. Logs the iteration to `evals/results/autoresearch-log.jsonl`

## Reading the Log

Each line in `autoresearch-log.jsonl` is a JSON object:

```json
{
  "timestamp": "2026-03-21T...",
  "iteration": 1,
  "hypothesis": "raise citation title score from 900 to 1100",
  "change_summary": "raise citation title score from 900 to 1100",
  "score_before": 9,
  "score_after": 9,
  "score_before_str": "9/9",
  "score_after_str": "9/9",
  "result": "kept|reverted|error",
  "commit_hash": "abc1234"
}
```

Fields:
- `result`: `kept` (committed), `reverted` (score did not improve), `error` (eval or agent failure)
- `commit_hash`: populated only when `result` is `kept`
- `score_before` / `score_after`: integer count of fully passing tests

## When the Loop Stalls

If you see 5+ consecutive `reverted` results with no improvements:

1. Review the log to see what has been tried
2. Check if the current score is already at maximum (all tests passing)
3. Consider adding new eval test cases to expose weak areas
4. Consider expanding the knowledge corpus (e.g., adding Part 397)
5. Review `evals/penny-program.md` and add new guidance for the agent
6. Try running with a fresh log: back up and clear `autoresearch-log.jsonl`

## Boundary Rule

The autoresearch loop ONLY modifies files inside `railway-backend/`.
Specifically, it only writes to `railway-backend/app/main.py`.

It will NEVER touch:
- `src/` (Next.js frontend)
- `packages/` (shared packages)
- `scripts/` (build and eval scripts -- except itself)
- `evals/penny_eval_questions.json` (the test cases are fixed)
- Anything Clerk-adjacent or auth-related

## Architecture

```
scripts/penny-autoresearch.mjs   -- Main loop runner
evals/penny-program.md           -- Agent instruction file (human-edited)
evals/penny_eval_questions.json  -- Fixed eval test cases (DO NOT MODIFY)
evals/results/latest.json        -- Latest eval results (written by eval runner)
evals/results/autoresearch-log.jsonl -- Iteration log (appended by loop)
railway-backend/app/main.py      -- The ONLY file the agent modifies
scripts/run-penny-evals.mjs      -- Eval runner (unchanged, used by the loop)
```

## Design Choices

- **Single file to modify.** The agent only touches `main.py`. This keeps scope
  manageable and diffs reviewable.
- **Fixed eval suite.** The test cases do not change during the loop. The agent
  must improve retrieval quality to pass them, not game the tests.
- **One change per iteration.** Each iteration makes exactly one change so that
  improvements (or regressions) can be attributed to a specific hypothesis.
- **Git-integrated.** Every improvement is committed with a descriptive message
  including before/after scores. Failed hypotheses are reverted and logged.
- **Rate-limited.** Minimum 5-second delay between eval runs to respect the
  Penny API. 10-second warmup before the first eval for Railway cold starts.

True North Data Strategies -- Pipeline Punks / Chief Sentinel
