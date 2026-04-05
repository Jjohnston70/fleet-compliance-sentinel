---
name: prompt-engineering
description: Multi-Armed Bandits prompt engineering methodology for creating, testing, improving, and retiring LLM prompts. Use this skill whenever someone needs to build a new prompt from scratch, fix or improve an underperforming prompt, compare multiple prompt variations, set up prompt testing infrastructure, evaluate which prompt works best, or retire an outdated prompt. Triggers on phrases like "create a prompt", "fix this prompt", "prompt isn't working", "compare prompts", "test prompt variations", "prompt keeps failing", "build prompt arms", or any request to systematically improve LLM output quality.
---

# TNDS Prompt Engineering Skill

Guides TNDS team members through creating, testing, and improving prompts using the Multi-Armed Bandits methodology. No AI/ML expertise required.

Reference files in `references/`:
- `EXAMPLES.md` — Case studies, worksheets, and code samples
- `QUICK-REFERENCE.md` — One-page cheat sheet, decision tree, emergency procedures

---

## Core Methodology: Multi-Armed Bandits

Traditional prompt engineering wastes time: pick a prompt, it breaks, tweak it emotionally, break it again. This "bad prompt tax" cycles forever.

Multi-Armed Bandits solves this by letting the system learn which prompt works best while serving real traffic:

1. **Exploit** — use the best-performing prompt most of the time
2. **Explore** — try alternatives occasionally to improve estimates
3. **Adapt** — continuously adjust as users, tasks, and models change

Keep 10-20% exploration budget active forever. The best prompt drifts as conditions change.

---

## Phase 1: Identify Intent

Determine the path before starting work:

| User wants to... | Path |
|---|---|
| Build something new | Phase 2A |
| Fix or improve existing | Phase 2B |
| Test which works better | Phase 2C |
| Remove old prompt | Phase 2D |

---

## Phase 2A: New Prompt Creation

**Step 1: Ask 3-5 discovery questions**
1. What should this accomplish?
2. What does good output look like?
3. What data/context will be available?
4. Who uses the output and how?
5. What would be a complete failure?

**Step 2: Create 5-8 prompt arms**

Start with these common types:
- **Strict Structured** — force exact format (JSON, schema)
- **Clarify-First** — ask one question if input is ambiguous
- **Evidence-Only** — only use provided sources (RAG-safe)
- **Short Answer** — concise, bullet points, one screen
- **Teaching** — explain step-by-step then summarize
- **Tool-First** — decide if a tool is needed, then act
- **Confidence Score** — flag uncertain outputs for human review

Keep 5-8 arms. You don't need 30.

**Step 3: Define success metrics**

Pick ONE primary metric:
- Task completion rate
- User acceptance rate
- Human review success label

Pick TWO guardrails:
- Hallucination/error flag rate (<2%)
- Format compliance (>98%)
- Safety violations (0%)
- Cost budget (<$0.01/request)
- Latency budget (<2000ms)

Rule: Reward "useful." Punish "confidently wrong." Don't ignore cost.

**Step 4: Document each arm**

```markdown
## Prompt Arm: [Name]
**ID:** [unique-id-v1]
**Created:** [YYYY-MM-DD]
**Use Case:** [when this works best]

**System Prompt:**
[exact text]

**User Prompt:**
[template with {{variables}}]

**Success Criteria:**
- Primary: [metric] > [threshold]
- Guard 1: [metric] > [threshold]
- Guard 2: [metric] < [threshold]

**Known Limitations:**
[what this doesn't handle]
```

**Step 5: Set up logging**

Minimum required fields: `timestamp`, `arm_id`, `primary_metric`, `guardrail_1`, `guardrail_2`, `cost_usd`, `latency_ms`

Storage: Google Sheets for development, BigQuery for production. Always append-only — never delete log data.

Update routing weights daily or hourly, not every request.

---

## Phase 2B: Modify Existing Prompt

**Step 1: Diagnose the issue**
1. What's the specific problem?
2. How often does it fail?
3. Can you show a broken example?
4. Was this working before, or always broken?

**Step 2: Identify modification type**

| Type | Symptom | Solution |
|---|---|---|
| Format Fix | Output structure wrong, missing fields | Add format enforcement arm |
| Edge Case | Works for most, fails on specific patterns | Add clarify-first arm |
| Accuracy | Getting facts wrong, hallucinating | Add evidence-only arm |
| Performance | Too slow or expensive | Add short-answer arm |

**Step 3: Create a variant — do NOT edit the existing prompt**
1. Copy the current best arm
2. Make ONE targeted change
3. Give it a new version ID (e.g., `strict-json-v2`)
4. Document what changed and why
5. Add to bandit pool at 5-10% weight
6. Monitor for 1-2 weeks before scaling up

---

## Phase 2C: Evaluate Prompt Performance

**Testing timeline by traffic volume:**

| Traffic | Update Frequency | Duration | Min Sample |
|---|---|---|---|
| High (1000+/day) | Hourly | 3-5 days | 100/arm |
| Medium (100-1000/day) | Daily | 1-2 weeks | 100/arm |
| Low (<100/day) | Weekly | 2-4 weeks | 50/arm |

**Thompson Sampling (3 steps):**
1. Track successes and failures for each arm
2. Draw from Beta(successes+1, failures+1) per arm
3. Select arm with highest sample

See `references/EXAMPLES.md` for Python and Apps Script implementations.

**Making the routing decision:**
- Winner at >60% traffic share consistently → scale to 80%, keep others at 10% each for exploration
- Arms too similar → they may not be different enough; create more distinct variations
- Results unstable → extend testing; check for data or user drift

---

## Phase 2D: Retire a Prompt

**Retire if:**
- Consistently bottom performer for 2+ months
- <5% traffic share for 2+ months
- Replaced by a strictly better approach
- Use case or model deprecated

**Don't retire if:**
- Handles specific edge cases well
- Recent addition still in testing
- Part of active exploration budget

**Retirement process:**
- Week 1: Mark arm as deprecated, reduce weight to 0%
- Week 2: Archive arm definition (keep in docs, remove from routing)
- Week 3+: Final removal, update changelog

---

## Monthly Maintenance

Run this review monthly for all active prompt pools:
1. Review arm performance trends — who's winning, who hasn't been tried?
2. Retire underperformers (bottom 10% consistent over 2+ months)
3. Add new arms based on edge cases discovered in production
4. Document changes with rationale

Keep 5-8 arms active. More than 10 is usually overkill.

---

## TNDS Integration

**Command Center Builds:** Store arm configs in module's `data-command`. Log to `analytics-command` dashboard. Review monthly with module performance.

**Battle Rhythm Installs:** Prompt performance review is a cadence item. Weekly for new deployments, monthly for stable ones.

**Command Partner:** Ongoing optimization support includes monthly arm reviews and adding arms for new edge cases.

---

## Emergency Procedures

**If a prompt breaks production:**
1. Immediately route 100% to last known good arm
2. Mark broken arm deprecated
3. Investigate via logs and examples
4. Create fix variant
5. Test at 10% before scaling back up

**If all arms are failing:**
1. Check if input data format changed
2. Verify metrics calculation is still correct
3. Review recent model updates
4. Fall back to human routing temporarily
5. Create emergency fix arm

---

## Common Mistakes

| Wrong | Right |
|---|---|
| Edit prompt directly | Create a variant, test side-by-side |
| Only track thumbs-up | Add guardrails for hallucination and format |
| Test 20+ arms at once | Start with 5-8 |
| Pick winner after 10 tests | Wait for 100+ requests per arm |
| Set winner to 100% | Keep 10-20% exploration forever |
| Update weights every request | Update daily or hourly |
| Emotional tweak on failure | Create variant, A/B test it |
