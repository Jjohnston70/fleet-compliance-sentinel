# Tooling Implementation Guide

**Project:** Fleet-Compliance Sentinel
**Owner:** True North Data Strategies LLC
**Last Updated:** 2026-04-05

---

## What Was Migrated

Three components from the PROMPTS-PACKS-TYPES library were integrated into the FCS platform:

1. **Prompt Governance Control Plane** -- `tooling/prompts/`
2. **Compliance Role System Prompts** -- `.claude/skills/*/system.prompt`
3. **Operational Playbooks** -- `docs/integration/`

---

## 1. Prompt Governance Control Plane

**Location:** `tooling/prompts/`

### What It Is

The control plane is the rule-of-law layer for all LLM execution in FCS. It defines how AI agents behave, what protocols apply, and what limits are enforced. These files are loaded deterministically (selected, not searched) and are never vectorized or embedded.

### Files

| File | What It Does | When You Use It |
|------|-------------|-----------------|
| `prompt.schema.json` | JSON Schema that validates prompt definitions. If a prompt doesn't match this schema, it's rejected before it can enter the system. | When adding or modifying prompts. Run validator against this schema. |
| `prompt-router.json` | Routes prompts to the correct model class. `direction` protocol -> strategy models (reasoning). `command` protocol -> execution models (fast output). | Read by the Module Gateway runner when a skill fires. Determines which LLM class handles the request. |
| `runtime-policy.json` | Enforces token and cost limits per tier: free (800 tokens/$10), low-cost (2000/$50), battle-tested (6000/$250). | Read by the gateway to cap token usage and prevent cost overruns. |
| `prompt-bundles.json` | Groups roles into product bundles: SMB Operator Pack, Revenue Command Pack, Gov Compliance Pack. Used for entitlement checks and plan gating. | Referenced by the module toggle system to determine which skills are included in each plan tier. |
| `prompt-registry.v1.0.0.json` | Immutable source of truth. 21 registered prompts with full metadata. Frozen 2026-02-07. | Read-only reference for all systems. Changes require a new version file. |
| `prompt-registry-map.json` | Maps FCS skill directories to registry entries and gateway modules. Connects the dots between skills, modules, and the control plane. | Used to resolve which registry prompt applies to which skill when the gateway fires. |
| `prompt-validator.ts` | TypeScript function for build-time validation. | Run during CI or before deploying prompt changes. |

### How to Use

**Check if a skill has governance metadata:**
```bash
cat tooling/prompts/prompt-registry-map.json | jq '.mappings[] | select(.skill_dir == "data-privacy-coach")'
```

**Validate a new prompt entry:**
```typescript
import { validatePrompt } from './tooling/prompts/prompt-validator';
validatePrompt(myNewPrompt); // Throws if invalid
```

**Check tier limits before execution:**
```typescript
import policy from './tooling/prompts/runtime-policy.json';
const maxTokens = policy.tiers[skillTier].max_tokens;
```

### Integration Points

The control plane integrates with FCS at three points:

1. **Module Gateway Runner** (`src/lib/modules-gateway/runner.ts`) -- Reads prompt-router and runtime-policy to route and limit skill execution.
2. **Module Toggle System** (`src/lib/modules.ts`) -- Bundle memberships in prompt-bundles.json map to MODULE_SEEDS skill-command entries.
3. **Skill System Prompts** (`.claude/skills/*/system.prompt`) -- Each system.prompt file references its protocol and tier, which must match the registry.

### Adding a New Prompt to the Registry

1. Create the prompt object matching `prompt.schema.json`
2. Validate with `prompt-validator.ts`
3. Create a new registry version file (e.g., `prompt-registry.v1.1.0.json`)
4. Add a mapping in `prompt-registry-map.json`
5. If the prompt belongs in a bundle, update `prompt-bundles.json`
6. Test through the Module Toggle Console

---

## 2. Skill System Prompts

**Location:** `.claude/skills/*/system.prompt`

### What They Are

System prompts are the governance identity files for each skill. They define what the skill does, what protocol it follows, what tier it operates at, and what output contract it enforces. Every skill-command module in the toggle system maps to one or more skills, each with its own system.prompt.

### Standard Structure

Every system.prompt follows this format:

```
Governance Rules (11 rules -- apply to every response)
  1. Informational guidance only
  2. Deny legal/tax/investment/medical advice
  3. Mark high-risk guidance as non-binding
  4. Never request/expose credentials or PII
  5. Don't reproduce client-confidential details
  6. Direct, concise, actionable output
  7. Canonical terms, explicit permit/deny
  8. Respect authority boundaries
  9. Enforce cost controls within tier
  10. Professional advice disclaimer
  11. No PII processing

Role Identity
  - Skill name and parent (Pipeline Penny)
  - Role focus (one sentence)
  - Protocol (Direction or Command)
  - Tier (free / low-cost / battle-tested)

Depth Modes
  - full: comprehensive execution
  - quick_pass: rapid triage
  - single: one artifact

Scope Gate
  - SKILL_OUT_OF_SCOPE response for off-topic requests

Output Contract
  - Required section headers (always present)

Role-Specific Rules
  - 3-5 domain-specific constraints
```

### Skills with System Prompts (28 total)

**Client-Facing (gateway-routed):**
- data-privacy-coach, risk-manager, financial-analyst, bid-strategist, grant-proposal-writer, grant-proposal-evaluation, invoice-organizer, file-organizer, realty-command, aro-assessment, docgen-command, proposal-generator, copywriter, marketing-strategist, world-model-mapper

**Operator-Only:**
- cyber-security, cloud-engineer, database-admin, python-programmer, data-scientist, sales-strategist, business-dev-manager, pricing-strategist, chief-financial-officer, brand-manager, documentation

### How to Use

**During a Claude Code session with an agent:** The agent reads the system.prompt to understand its role constraints and output format.

**Through Pipeline Penny:** When a user triggers a skill via Penny, the system.prompt is injected as the system message to the LLM.

**Through the Module Gateway:** When a skill-command module fires, the gateway loads the system.prompt from the skill directory and applies protocol routing and tier limits from the control plane.

### Creating a New System Prompt

1. Copy the governance rules block from an existing system.prompt (all 11 rules are identical across skills)
2. Define: role name, focus, protocol (direction/command), tier
3. Define depth modes (full, quick_pass, single)
4. Define the SKILL_OUT_OF_SCOPE gate
5. Define the output contract (required section headers)
6. Add 3-5 role-specific rules
7. Add a matching entry in `tooling/prompts/prompt-registry-map.json`
8. Run through the skill intake pipeline at `.claude/skills/00_skill-intake/`

---

## 3. Operational Playbooks

**Location:** `docs/integration/`

### What They Are

Playbooks are structured, multi-step operational workflows designed to be executed by Pipeline Penny in a Cowork session or manually by an operator. Each playbook defines MCP tool calls, analysis logic, thresholds, and output formatting.

### Available Playbooks

**compliance-gap-check.md** (FCS-native)
- Weekly or on-demand compliance review
- Checks: driver credentials, vehicle inspections, permits, suspense items, platform errors
- Produces a weighted compliance score (0-100) with GREEN/YELLOW/ORANGE/RED rating
- Creates audit evidence for SOC 2

**sentry-error-triage.md** (adapted from Cowork)
- 6-hour cycle error analysis
- Severity scoring (1-5), root cause categorization, fix recommendations
- Deployment risk assessment (safe to deploy / caution / hold)
- Uses Sentry MCP for all data retrieval

**daily-ops-standup.md** (adapted from Cowork)
- Daily at 8:00 AM MT
- Sentry errors + HubSpot pipeline health + calendar + action items
- Posts to Slack #ops-daily

### How to Run a Playbook

**Option 1: Cowork Session (Recommended)**
1. Open a Cowork session
2. Tell the agent: "Run the compliance gap check playbook"
3. The agent reads `docs/integration/compliance-gap-check.md` and executes each step
4. Results are posted to the specified output destination

**Option 2: Scheduled Task**
1. Use the schedule skill to create a recurring task
2. Point it at the playbook file
3. Define the cron schedule (e.g., "Every Monday at 9:00 AM MT")

**Option 3: Manual Execution**
1. Read the playbook
2. Execute each MCP tool call manually
3. Apply the analysis logic
4. Fill in the report template

### Creating a New Playbook

Use this template:

```markdown
# [Playbook Name]

**Trigger:** [Schedule or on-demand]
**Duration:** [Estimate]
**Output:** [Destination]

---

## Objective
[What this playbook accomplishes]

---

## Step 1: [Action Name]

**Tool:** [MCP tool name]
**Action:** [Specific action]

**Parameters:**
[JSON block]

**Analysis:**
[What to look for, thresholds, flags]

**Output Format:**
[Structured output template]

---

## Step N: Generate Report
[Report template]

---

## Step N+1: Post Results
[Where to send, conditional logic]
```

### Playbook Ideas for Future Development

- **audit-readiness-scan.md** -- Pre-audit checklist against SOC 2 or DOT requirements
- **regulatory-deadline-triage.md** -- Scan for upcoming regulatory deadlines across all data
- **vendor-risk-review.md** -- Assess vendor compliance posture from invoice and contract data
- **incident-response.md** -- Step-by-step incident response for security or compliance events
- **monthly-compliance-report.md** -- Full monthly report for leadership review

---

## Directory Structure After Migration

```
tooling/
  prompts/                         # Prompt governance control plane
    README.md                      # Control plane documentation
    prompt.schema.json             # Prompt validation schema
    prompt-router.json             # Direction/Command routing
    runtime-policy.json            # Tier token/cost limits
    prompt-bundles.json            # Role bundle definitions
    prompt-registry.v1.0.0.json    # Immutable v1.0.0 registry (21 prompts)
    prompt-registry-map.json       # FCS skill <-> registry mapping (15 entries)
    prompt-validator.ts            # TypeScript validator
  skills/                          # (Pre-existing) Client-facing skill wrappers
    README.md
    [15 skill directories]

docs/integration/
  PLAYBOOKS_README.md              # Playbook documentation
  compliance-gap-check.md          # FCS-native compliance review
  sentry-error-triage.md           # Error analysis (from Cowork)
  daily-ops-standup.md             # Daily standup (from Cowork)
  OPERATIONS_RUNBOOK.md            # (Pre-existing) Gateway operations
  MODULE_GATEWAY_CONTRACT.md       # (Pre-existing) Gateway API contract

.claude/skills/
    [38 skill directories, each now with system.prompt]
    MANIFEST.md
    SKILLS-README.md
    00_skill-intake/
```

---

## What Was NOT Migrated (and Why)

| Asset | Location | Why It Stays |
|-------|----------|-------------|
| 296 role prompt files | Desktop/PROMPTS-PACKS-TYPES/roles/ | Product asset for Pipeline Punks, not FCS infrastructure |
| 34 industry packs | Desktop/PROMPTS-PACKS-TYPES/packs/ | General-purpose library, only GovCon pack is FCS-relevant |
| 13 functional types | Desktop/PROMPTS-PACKS-TYPES/types/ | Cross-cutting groupings, not needed for FCS execution |
| Prompt-1, -2, -3 iterations | Desktop/PROMPTS-PACKS-TYPES/Prompt-*/ | Historical versions, current files are canonical |
| prompt-formatter-handoff.md | Desktop/PROMPTS-PACKS-TYPES/Prompt-1/ | One-time conversion tool, job complete |
| HubSpot pipeline playbook | coworker.zip | Sales-specific, not compliance-relevant (adapt if needed later) |
| prompt-registry.json (mutable) | Desktop/PROMPTS-PACKS-TYPES/prompt-jsons/ | Superseded by immutable v1.0.0 -- only frozen versions migrate |

---

## Contact

Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
True North Data Strategies LLC | SBA-certified VOSB/SDVOSB
