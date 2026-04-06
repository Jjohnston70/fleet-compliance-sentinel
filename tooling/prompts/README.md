# Prompt Governance Control Plane

**Source:** PROMPTS-PACKS-TYPES/prompt-jsons/
**Migrated:** 2026-04-05
**Owner:** True North Data Strategies

## Purpose

This folder is the **control plane** for the FCS LLM execution system. It contains authoritative configuration and system-level instructions that determine how AI agents behave, what protocols apply, and what limits are enforced before any skills are executed or knowledge is retrieved.

These files are **rules of operation**, not prompts for retrieval. They are loaded deterministically and injected as system-level instructions.

## Files

| File | Purpose | Used By |
|------|---------|---------|
| `prompt.schema.json` | JSON Schema validation for prompt definitions. Prevents malformed prompts from entering the system. Fail-fast by design. | Prompt validator, CI pipeline |
| `prompt-router.json` | Deterministic routing rules: `direction` protocol -> strategy models, `command` protocol -> execution models. Ensures reasoning and execution models are not mixed. | Module Gateway runner |
| `runtime-policy.json` | Enforcement limits: max tokens per tier, monthly cost ceilings. Acts as safety and budget governor. Three tiers: free (800 tokens/$10), low-cost (2000/$50), battle-tested (6000/$250). | Gateway execution engine |
| `prompt-bundles.json` | Curated role bundles for entitlement, product packaging, and UI role selection. Three packs: SMB Operator, Revenue Command, Gov Compliance. | Module toggle system, plan gating |
| `prompt-registry.v1.0.0.json` | Immutable v1.0.0 source of truth. 21 registered prompts with full metadata: role, tier, category, protocol, intent, system_prompt, variables, constraints, output_bias, tags. Frozen 2026-02-07. | All systems (read-only) |
| `prompt-validator.ts` | TypeScript validation function. Validates Prompt interface: id, role, tier, category, protocol, intent, system_prompt. | Build-time validation |

## Integration with FCS

### Module Gateway

The prompt-router and runtime-policy files integrate with the Module Gateway execution engine at `src/lib/modules-gateway/runner.ts`. When a skill-command module fires:

1. Gateway loads the skill's registry entry from `prompt-registry.v1.0.0.json`
2. Router selects strategy or execution model based on protocol
3. Runtime policy enforces token limits based on the skill's tier
4. Bundle membership determines whether the org's plan includes this skill

### Module Toggle System

The `prompt-bundles.json` maps to MODULE_SEEDS in `src/lib/modules.ts`:

| Bundle | FCS Module IDs |
|--------|---------------|
| `Gov_Compliance_Pack` | skill-compliance-command, skill-readiness-command, skill-financial-command |
| `Revenue_Command_Pack` | skill-proposal-command, skill-govcon-command |
| `SMB_Operator_Pack` | (future: ops-command module) |

### Tier Mapping to Plan Tiers

| Prompt Tier | FCS Plan Tier | Max Tokens | Cost Ceiling |
|-------------|---------------|------------|-------------|
| free | trial | 800 | $10/mo |
| low-cost | starter | 2,000 | $50/mo |
| battle-tested | pro/enterprise | 6,000 | $250/mo |

## Direction vs Command Protocol

The TNDS protocol model splits LLM invocation into two modes:

**Direction Protocol** (reasoning/strategy): Used for analysis, assessment, planning. Routes to strategy-class models (higher reasoning capability, longer context). Maps to Direction Protocol sales stages: Identify, Assess, Map, Chart.

**Command Protocol** (execution/delivery): Used for direct output generation, step-by-step execution, code generation. Routes to execution-class models (faster, structured output). Maps to Command Protocol services: Command Center Build, Battle Rhythm Install, Command Partner.

## Runtime Rules

- Files in this folder are **never embedded** or vectorized
- Files are **always loaded deterministically** (selected, not searched)
- The v1.0.0 registry is **immutable** -- changes require a version bump
- Changes require explicit freeze and version increment

## Adding a New Prompt

1. Create the prompt entry following `prompt.schema.json`
2. Validate with `prompt-validator.ts`
3. Add to a new versioned registry file (e.g., `prompt-registry.v1.1.0.json`)
4. If bundled, update `prompt-bundles.json`
5. Map to an FCS skill-command module in `src/lib/modules.ts`
6. Test through the Module Toggle Console at `/fleet-compliance/dev/modules`
