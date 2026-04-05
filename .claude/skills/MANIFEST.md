---
title: "MANIFEST — Skills"
project: LLM-LIBRARY
folder_number: "10"
created: 2026-03-03
updated: 2026-03-04 (fully populated — 28 skills + intake queue)
tags: [manifest, skills, claude, skill-md, automation]
---

# MANIFEST — 10_SKILLS

## Purpose

Claude skill definitions. Each skill gets its own subfolder containing a SKILL.md and optional supporting files. Skills are reusable instruction sets that Claude loads to perform specific tasks with consistent quality.

## Subfolder Structure

```
10_SKILLS/
├── skill-name/
│   ├── SKILL.md          ← Required
│   ├── registry.json     ← Optional: metadata/trigger registry
│   ├── contract.json     ← Optional: I/O contract spec
│   ├── triggers.json     ← Optional: activation trigger list
│   ├── system.prompt     ← Optional: system prompt companion
│   └── (supporting files)
```

## Current Skills

| Skill Folder | Purpose | Stack |
|---|---|---|
| `Armed Bandits/` | Multi-armed bandit prompt engineering optimization | SKILL.md + docs |
| `aro-assessment/` | Agent-Ready Operations scoring framework | Full |
| `bearing-check/` | 8-checkpoint decision validation framework | Partial + build/ |
| `bid-strategist/` | Federal/commercial bid strategy | Full |
| `brand-manager/` | Brand identity and voice management | Full |
| `business-dev-manager/` | Business development strategy | Full |
| `chief-financial-officer/` | CFO-level financial analysis | Full |
| `cloud-engineer/` | Cloud architecture and deployment | Full |
| `context_ingest/` | Penny memory update system for digests | SKILL.md only |
| `copywriter/` | Copywriting and content creation | Full |
| `cyber-security/` | Security auditing and posture review | Full |
| `daily email summaries/` | Daily email intelligence processing | SKILL.md + readme |
| `data-privacy-coach/` | Data privacy guidance and compliance | Full |
| `data-scientist/` | Data analysis and ML interpretation | Full |
| `database-admin/` | Database design and optimization | Full |
| `docgen-command/` | Document generation command module | Full + references/ |
| `documentation/` | TNDS branded documentation creation | Full |
| `email_digest/` | Email digest and summarization | SKILL.md only |
| `financial-analyst/` | Financial modeling and analysis | Full |
| `jacob_voice/` | Writing style capturing Jacob's authentic voice | SKILL.md only |
| `pricing-strategist/` | Pricing strategy and revenue optimization | Full + marketing-strategist/ |
| `proposal-generator/` | Proposal generation command module | Full + references/ |
| `python-programmer/` | Python development expertise | Full |
| `realty-command/` | Real estate automation command module | Full |
| `risk-manager/` | Risk assessment and mitigation | Full |
| `sales-strategist/` | Sales strategy and pipeline management | Full |
| `starter-skill/` | Boilerplate skill template for new skills | SKILL.md only |
| `world-model-mapper/` | Business process gap analysis via world model | Full |

## Intake Queue

| Folder | Purpose |
|---|---|
| `00_skill-intake/` | Staging area — subfolders: compiled/, incoming/, working/ |

## What Does NOT Go Here

- Agent role definitions → 01_AGENT-DEFINITIONS
- System/bootstrap prompts → 11_PROMPTS-AND-INSTRUCTIONS
- Full agent frameworks → 08_AGENT-FRAMEWORKS

## Content Count

- **Total skills:** 28
- **Intake staging:** 1 (00_skill-intake)
- **Last audit:** 2026-03-04
