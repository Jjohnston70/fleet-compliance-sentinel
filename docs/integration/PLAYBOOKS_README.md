# FCS Operational Playbooks

**Source:** Adapted from PROMPTS-PACKS-TYPES/coworker.zip playbook patterns
**Created:** 2026-04-05
**Owner:** True North Data Strategies

## Purpose

Playbooks are structured, multi-step operational workflows that Pipeline Penny or a Cowork session can execute on a schedule or on-demand. Each playbook defines the objective, tools required, step-by-step MCP actions, analysis logic, and output format.

## Playbooks

| Playbook | Trigger | Duration | Output |
|----------|---------|----------|--------|
| `compliance-gap-check.md` | Weekly or on-demand | ~10 min | Compliance gap report |
| `sentry-error-triage.md` | Every 6 hours or on-demand | ~10 min | Error analysis + fix recommendations |
| `daily-ops-standup.md` | Daily 8:00 AM MT | ~5 min | Ops status to Slack |

## How Playbooks Work

Each playbook follows this structure:

1. **Header** -- trigger schedule, duration estimate, output destination
2. **Objective** -- what the playbook accomplishes
3. **Steps** -- sequential MCP tool calls with parameters, analysis instructions, and output format
4. **Report Template** -- structured output format for the results
5. **Post Actions** -- where to send results (Slack, file, dashboard)

## Running a Playbook

**On-demand (Cowork):** Open a Cowork session, paste the playbook content, and tell the agent to execute it.

**Scheduled (Cowork):** Use the schedule skill to create a recurring task that triggers the playbook.

**Manual reference:** Read the playbook and execute each step manually using the indicated MCP tools.

## Creating New Playbooks

1. Copy the template structure from an existing playbook
2. Define the objective and success criteria
3. Map each step to a specific MCP tool action with exact parameters
4. Include analysis logic (what to look for, thresholds, categories)
5. Define the output format and post-action destinations
6. Test manually before scheduling
