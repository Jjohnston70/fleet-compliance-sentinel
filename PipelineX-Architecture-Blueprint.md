# PIPELINEX

Full Platform Architecture Blueprint

## Deployment Origin

| Field | Value |
|---|---|
| GitHub Org | Pipeline-Punks |
| Repository | pipeline-punks-pipelinex-v2 |
| Vercel Project | pipeline-punks-pipelinex-v2 |
| Vercel Team | jjohnston70s-projects |
| Production URL | https://www.pipelinepunks.com |
| Deploy Method | Vercel CLI — `vercel --prod` from this folder |
| GitHub CI/CD | Not connected — deploys are manual via CLI |
| Vercel Config | `.vercel/project.json` links this folder to the Vercel project |

The data tooling folder (`tooling/chief-sentinel/`) is part of this repo but is never deployed. It writes generated TypeScript modules into `src/lib/` via `build_chief_imports.py`.

---

From Local Desktop to Cloud-Scale LLM Platform

Version 1.0 — February 2026

True North Data Strategies LLC

*Turning Data into Direction*

> *This document defines every file, folder, and subsystem in the PipelineX platform. It serves as the gap analysis against the current Pipeline Penny codebase and the complete build target for local, API-connected, and cloud deployments.*

## 1. Executive Summary

PipelineX is a governed knowledge and execution platform that starts as a desktop application and scales to cloud deployment. It serves as the delivery vehicle for True North Data Strategies’ Command Protocol services, packaging knowledge bases, automation workflows, prompt libraries, skill packages, and agent capabilities into a toggleable, industry-configurable product.

The platform supports three deployment tiers: fully local (no internet required), local with API connections (HubSpot, Fleetio, QuickBooks, etc.), and cloud-hosted (multi-location access). Each client gets a single repository with modules toggled per user/role.

### 1.1 What PipelineX Does

-   Knowledge-based Q&A with source citations from SOPs, playbooks, regulations, and business documents
-   Prompt testing and categorized skills testing with execution, scoring, and audit trails

-   Automation workflows that execute real business processes (forms, checklists, approvals, notifications)
-   Template generation and routing for proposals, onboarding, compliance docs

-   SOP implementation — not just reading SOPs but executing them step-by-step with approvals and retries
-   Multi-model support: Ollama (DeepSeek, Qwen, Llama), Claude, ChatGPT, Gemini with switchable backends

-   Memory system for persistent context, tool references, agent types, and user preferences
-   Toggleable skill/knowledge/agent packages for rapid industry-specific deployments

-   Cross-platform desktop apps via Electron (Windows, Mac, Linux)

## 2. Root Files — What Lives at /

Only files required to run, build, deploy, or configure the application live in root. Everything else is pushed down one level. This is the “rule of the root” — non-negotiable.

| --- | --- | --- | --- |
| **File**                  | **Format** | **Purpose**                                                                             | **Pipeline Penny Status**                            |
| **package.json**          | JSON       | Node dependencies, scripts, app metadata, Electron build config                         | ✅ EXISTS                                            |
| **package-lock.json**     | JSON       | Locked dependency tree                                                                  | ✅ EXISTS                                            |
| **tsconfig.json**         | JSON       | TypeScript compiler options                                                             | ✅ EXISTS                                            |
| **requirements.txt**      | TXT        | Python dependencies for FastAPI backend, FAISS, LangChain                               | ✅ EXISTS                                            |
| **.env.example**          | ENV        | Template for API keys (Claude, OpenAI, Gemini, Ollama host)                             | ✅ EXISTS — needs expansion for multi-model          |
| **.gitignore**            | TXT        | Git ignore rules                                                                        | ✅ EXISTS                                            |
| **README.md**             | MD         | Project overview, setup instructions, architecture summary                              | ✅ EXISTS — needs update for PipelineX branding      |
| **build.js**              | JS         | Electron build/packaging script                                                         | ✅ EXISTS                                            |
| **pipelinex.config.json** | JSON       | Master platform config: deployment tier, enabled modules, model defaults, feature flags | ❌ MISSING — critical new file                       |
| **models.config.json**    | JSON       | Model registry: available LLMs, endpoints, API keys ref, default/fallback chains        | ❌ MISSING — currently hardcoded in claude_agent.py |
| **LICENSE**               | TXT        | Proprietary license for client installs                                                 | ❌ MISSING                                           |
| **CHANGELOG.md**          | MD         | Version history for client-facing updates                                               | ❌ MISSING                                           |
| **docker-compose.yml**    | YAML       | Container orchestration for cloud deployment tier                                       | ❌ MISSING — Phase 3 (cloud)                         |
| **Dockerfile**            | Docker     | Container image for API server + vector store                                           | ❌ MISSING — Phase 3 (cloud)                         |

**Files to REMOVE from Root (Currently Present)**

-   Pipeline_Penny_Verification_Prompt.md — move to docs/
-   TODO-3.md, todo-4.md, todo-5.md, todo-6.md — move to archive/ or docs/planning/

-   desktop.ini — Windows artifact, add to .gitignore
-   Any check_*.py scripts — move to scripts/testing/

-   docs-notes-odoo/ — archive entirely

## 3. Complete Folder Structure

Below is the target folder structure with every folder, subfolder, and file purpose documented. Status indicators: ✅ Exists in Pipeline Penny, ⚠️ Partially exists, ❌ Missing/needs creation.

### 3.1 /src — Application Source Code

The frontend React application and Electron main process.

| --- | --- | --- |
| **Path**            | **Purpose**                                                                                                        | **Status**                                               |
| **src/App.tsx**     | Main React app with tab routing (Command Post, Templates, Prompts, Skills, SOPs, Settings, Memory)                 | ⚠️ EXISTS — has duplicate code, needs refactor per audit |
| **src/main.ts**     | Electron main process — window creation, IPC, Python child process spawn                                           | ✅ EXISTS (in electron/)                                 |
| **src/preload.ts**  | Electron preload script — secure bridge between renderer and main                                                  | ✅ EXISTS (in electron/)                                 |
| **src/components/** | React components: CommandPost, TemplateViewer, SkillRunner, SOPExecutor, SettingsPanel, MemoryPanel, ModelSwitcher | ⚠️ Partially — most logic crammed in App.tsx             |
| **src/hooks/**      | Custom React hooks: useModel, useMemory, useSkills, useKnowledge                                                   | ❌ MISSING                                               |
| **src/services/**   | API client wrappers: modelService.ts, knowledgeService.ts, memoryService.ts                                        | ❌ MISSING — API calls inline in App.tsx                 |
| **src/types/**      | TypeScript interfaces for all data shapes                                                                          | ✅ EXISTS                                                |
| **src/styles/**     | Global CSS/Tailwind config, TNDS brand theme                                                                       | ⚠️ Inline styles exist                                   |

### 3.2 /electron — Electron Main Process

| --- | --- | --- |
| **Path**                     | **Purpose**                                                                      | **Status**                               |
| **electron/main.ts**         | Window creation, menu setup, auto-update, tray icon                              | ✅ EXISTS                                |
| **electron/preload.ts**      | Context bridge API exposure                                                      | ✅ EXISTS                                |
| **electron/ipc-handlers.ts** | IPC message handlers: file ops, Python bridge, model switching                   | ❌ MISSING — handlers mixed into main.ts |
| **electron/auto-updater.ts** | electron-updater config for push updates via repo                                | ❌ MISSING                               |
| **electron/platform/**       | Platform-specific configs: win.ts, mac.ts, linux.ts (paths, notifications, tray) | ❌ MISSING                               |

### 3.3 /api — Python Backend (FastAPI)

The intelligence layer. Handles LLM routing, vector search, skill execution, and workflow orchestration.

| --- | --- | --- |
| **Path**                 | **Purpose**                                                                                                                            | **Status**                                          |
| **api/server.py**        | FastAPI app entry point, CORS, route mounting                                                                                          | ⚠️ EXISTS as src/ Python files, needs restructure   |
| **api/routes/**          | chat.py, templates.py, skills.py, sops.py, memory.py, models.py, health.py                                                             | ❌ MISSING — routes in monolith                     |
| **api/agents/**          | Agent definitions: qa_agent.py, skill_agent.py, sop_agent.py, workflow_agent.py, router_agent.py                                  | ⚠️ claude_agent.py exists, needs multi-agent split |
| **api/agents/types/**    | Agent type templates: researcher, executor, reviewer, coordinator, specialist                                                          | ❌ MISSING                                          |
| **api/models/**          | Model adapters: ollama_adapter.py, claude_adapter.py, openai_adapter.py, gemini_adapter.py, deepseek_adapter.py, qwen_adapter.py | ❌ MISSING — only Claude + Ollama hardcoded         |
| **api/models/router.py** | Model selection logic: route by task type, cost, latency, availability, fallback chains                                                | ❌ MISSING                                          |
| **api/vectorstore/**     | FAISS index management, embedding pipeline, chunk strategy, index versioning                                                           | ✅ EXISTS — functional                              |
| **api/memory/**          | memory_store.py, memory_index.py, memory_types.py — persistent context, tool refs, user prefs, conversation history                 | ❌ MISSING — no memory system yet                   |
| **api/workflows/**       | Workflow engine: executor.py, step_runner.py, approval_handler.py, retry_logic.py                                                   | ⚠️ Basic SOP execution exists                       |
| **api/integrations/**    | External API connectors: hubspot.py, fleetio.py, quickbooks.py, google_workspace.py, zapier.py                                        | ❌ MISSING — Phase 2 (API connections)              |
| **api/utils/**           | Shared utilities: logger.py, validators.py, sanitizer.py, cost_tracker.py                                                             | ❌ MISSING                                          |

### 3.4 /knowledge — Knowledge Base

All document sources that get vectorized and made queryable. This is the brain of the platform.

| --- | --- | --- |
| **Path**                              | **Purpose**                                                                                       | **Status**                             |
| **knowledge/core/**                   | Always-included docs: direction-protocol.md, command-protocol.md, pricing.md, company-overview.md | ✅ EXISTS — 6 TNDS docs vectorized     |
| **knowledge/industry/**               | Industry-specific knowledge packs (toggled per install)                                           | ❌ MISSING                             |
| **knowledge/industry/real-estate/**   | NAR rules, state regs, transaction workflows, commission structures                               | ❌ MISSING                             |
| **knowledge/industry/fleet-asset/**   | DOT regs, FMCSA, OSHA, maintenance schedules, fuel tracking                                       | ❌ MISSING                             |
| **knowledge/industry/govcon/**        | FAR, DFARS, CMMC 2.0, SAM.gov guidance, proposal templates                                        | ❌ MISSING                             |
| **knowledge/industry/construction/**  | OSHA, building codes, IECC, fall protection, silica rules                                         | ❌ MISSING                             |
| **knowledge/industry/healthcare/**    | HIPAA rules, OSHA bloodborne, CMS conditions, state AI disclosure                                 | ❌ MISSING                             |
| **knowledge/industry/property-mgmt/** | State landlord-tenant law, fair housing, security deposit rules                                   | ❌ MISSING                             |
| **knowledge/client/**                 | Client-specific docs: their SOPs, pricing, team info (per-install)                                | ⚠️ concept exists, no formal structure |
| **knowledge/compliance/**             | Regulatory docs shared across industries: OSHA, ADA, state privacy laws                           | ❌ MISSING                             |
| **knowledge/csv/**                    | Structured data files for deterministic query paths                                               | ✅ EXISTS — sample CSV functional      |
| **knowledge/agent/**                  | Agent workflow definitions                                                                        | ✅ EXISTS — onboarding workflow        |
| **knowledge/agent/workflows/**        | JSON workflow definitions for executable SOPs                                                     | ✅ EXISTS                              |
| **knowledge/tools-reference/**        | Memory-accessible tool catalog: what tools exist, when to use them, API refs                      | ❌ MISSING — key for memory system     |

### 3.5 /skills — Skill Packages

Toggleable capability packages. Each skill is a self-contained unit with its own contract, prompt, knowledge, and execution logic.

| --- | --- | --- |
| **Path**                       | **Purpose**                                                                                    | **Status**                                        |
| **skills/registry.json**       | Master registry of all skills: name, version, enabled/disabled, dependencies, trigger patterns | ✅ EXISTS                                         |
| **skills/README.md**           | Skill package contract: required files, naming, testing, deployment rules                      | ❌ MISSING                                        |
| **skills/bearing-check/**      | Decision validation skill: SKILL.md, contract.json, system.prompt, tests/                      | ✅ EXISTS — first skill installed                 |
| **skills/prompt-tester/**      | Run prompts against multiple models, score outputs, compare results                            | ❌ MISSING                                        |
| **skills/template-gen/**       | Template generation from knowledge base: proposals, reports, emails                            | ⚠️ Template routing exists, not packaged as skill |
| **skills/form-builder/**       | Generate and execute forms: intake, checklists, inspections                                    | ❌ MISSING                                        |
| **skills/workflow-runner/**    | Execute multi-step workflows with approvals and branching                                      | ⚠️ SOP execution exists, not packaged             |
| **skills/compliance-checker/** | Check documents/processes against regulatory requirements                                      | ❌ MISSING                                        |
| **skills/data-analyzer/**      | CSV/spreadsheet analysis, trend detection, anomaly flagging                                    | ⚠️ CSV query path exists                          |
| **skills/report-builder/**     | Generate formatted reports from data + knowledge                                               | ❌ MISSING                                        |

> *Skill Package Contract: Every skill folder MUST contain: SKILL.md (description + usage), contract.json (inputs, outputs, triggers, version), system.prompt (LLM instructions), and tests/ (validation cases). No exceptions.*

### 3.6 /prompts — Prompt Library

| --- | --- | --- |
| **Path**               | **Purpose**                                                                               | **Status**                                     |
| **prompts/system/**    | System prompts for each agent type and model combination                                  | ⚠️ Some prompts exist, not organized by type   |
| **prompts/templates/** | Reusable prompt templates with variable slots: {{client_name}}, {{industry}}             | ⚠️ Templates exist, variable system incomplete |
| **prompts/testing/**   | Prompt test suites: input/expected-output pairs for regression testing                    | ❌ MISSING                                     |
| **prompts/industry/**  | Industry-specific prompt packs (toggled with knowledge packs)                             | ❌ MISSING                                     |
| **prompts/scaffolds/** | Prompt scaffolding patterns: chain-of-thought, tree-of-thought, ReAct, few-shot libraries | ❌ MISSING                                     |

### 3.7 /memory — Persistent Memory System

The memory system that persists across sessions and can be referenced by any agent or skill.

| --- | --- | --- |
| **Path**                       | **Purpose**                                                                                                   | **Status**                          |
| **memory/store/**              | Persistent memory storage: user_prefs.json, conversation_history/, tool_catalog.json, entity_memory.json  | ❌ MISSING — no memory system       |
| **memory/index/**              | FAISS or SQLite index for memory search/retrieval                                                             | ❌ MISSING                          |
| **memory/types/**              | Memory type definitions: episodic (conversations), semantic (facts), procedural (how-to), tool (capabilities) | ❌ MISSING                          |
| **memory/tools-catalog.json**  | Registry of all tools the system knows about: name, description, when to use, API endpoint, auth method       | ❌ MISSING — key request from Jacob |
| **memory/agents-catalog.json** | Registry of all agent types: capabilities, best-for, limitations, model preferences                           | ❌ MISSING                          |

### 3.8 /templates — Document Templates

| --- | --- | --- |
| **Path**                  | **Purpose**                                                                 | **Status**                                       |
| **templates/proposals/**  | Proposal templates: command-center.md, battle-rhythm.md, command-partner.md | ⚠️ Some templates exist                          |
| **templates/onboarding/** | Client onboarding checklists, intake forms, welcome packets                 | ⚠️ Onboarding workflow exists                    |
| **templates/sops/**       | Standard operating procedure templates by function                          | ❌ MISSING — SOPs in knowledge, not in templates |
| **templates/forms/**      | Form templates: intake, inspection, checklist, approval                     | ❌ MISSING                                       |
| **templates/reports/**    | Report templates: weekly ops, compliance audit, financial summary           | ❌ MISSING                                       |
| **templates/industry/**   | Industry-specific templates (toggled with industry packs)                   | ❌ MISSING                                       |

### 3.9 /modules — Command Modules (Toggleable Features)

Each module is a self-contained feature pack that can be enabled/disabled per install. Modules bundle knowledge + skills + prompts + templates for a specific capability.

| --- | --- | --- |
| **Path**                           | **Purpose**                                                                        | **Status**                              |
| **modules/manifest.json**          | Master module registry: all available modules, dependencies, compatible industries | ❌ MISSING — critical for toggle system |
| **modules/onboard-command/**       | Client onboarding module: knowledge/, skills/, prompts/, templates/, config.json   | ⚠️ Exists as scattered files            |
| **modules/proposal-command/**      | Proposal generation module                                                         | ⚠️ Exists as scattered files            |
| **modules/workspace-command/**     | Workspace toolkit: file management, calendar, task tracking                        | ❌ MISSING                              |
| **modules/data-command/**          | Data organization and visibility module                                            | ❌ MISSING                              |
| **modules/financial-command/**     | Financial tracking, tax deductions, expense categorization                         | ❌ MISSING                              |
| **modules/compliance-gov-module/** | Government compliance tracking                                                     | ❌ MISSING                              |
| **modules/realty-command/**        | Real estate operations module                                                      | ❌ MISSING                              |
| **modules/asset-command/**         | Fleet and asset tracking module                                                    | ❌ MISSING                              |

> *Module Package Contract: Every module folder contains config.json (metadata, dependencies, compatible industries), knowledge/ (docs to vectorize), skills/ (capabilities to register), prompts/ (system + template prompts), templates/ (document templates), and README.md.*

### 3.10 /scripts — Build, Deploy, and Utility Scripts

| --- | --- | --- |
| **Path**                         | **Purpose**                                                                 | **Status**                              |
| **scripts/setup.sh / setup.ps1** | First-time install: Python venv, pip deps, Ollama models, FAISS index build | ❌ MISSING — manual setup currently     |
| **scripts/build-electron.sh**    | Package Electron for Win/Mac/Linux                                          | ⚠️ build.js exists in root              |
| **scripts/vectorize.py**         | Rebuild FAISS index from knowledge/ directory                               | ✅ EXISTS                               |
| **scripts/module-toggle.py**     | Enable/disable modules: update registry, rebuild index, toggle routes       | ❌ MISSING — critical for product model |
| **scripts/client-init.sh**       | Initialize new client repo: clone base, configure modules, set branding     | ❌ MISSING                              |
| **scripts/deploy-cloud.sh**      | Deploy to cloud (Docker build + push + orchestrate)                         | ❌ MISSING — Phase 3                    |
| **scripts/testing/**             | Test runners: skill tests, prompt regression, integration tests             | ❌ MISSING                              |

### 3.11 /docs — Documentation

| --- | --- | --- |
| **Path**                            | **Purpose**                                                                         | **Status**                  |
| **docs/user-manual.md**             | End-user guide: how to use Command Post, run skills, execute SOPs, manage templates | ✅ EXISTS — needs expansion |
| **docs/developer.md**               | Developer guide: architecture, adding skills, adding models, API reference, testing | ✅ EXISTS — needs expansion |
| **docs/admin-guide.md**             | Admin guide: module management, user setup, deployment tiers, updates, backup       | ❌ MISSING                  |
| **docs/architecture-diagrams.md**   | ASCII and Mermaid architecture diagrams                                             | ✅ EXISTS                   |
| **docs/demo-script.md**             | Demo walkthrough for sales conversations                                            | ✅ EXISTS                   |
| **docs/api-reference.md**           | FastAPI endpoint documentation with request/response examples                       | ❌ MISSING                  |
| **docs/module-catalog.md**          | Complete catalog of all modules with descriptions, pricing, compatibility           | ❌ MISSING                  |
| **docs/skill-development-guide.md** | How to create new skill packages following the contract                             | ❌ MISSING                  |
| **docs/deployment-guide.md**        | Deployment instructions for all three tiers                                         | ❌ MISSING                  |
| **docs/troubleshooting.md**         | Common issues, error codes, support escalation paths                                | ❌ MISSING                  |

### 3.12 /config — Configuration Files

| --- | --- | --- |
| **Path**                | **Purpose**                                                                                     | **Status** |
| **config/default.json** | Default platform settings: UI theme, default model, chunk size, temperature                     | ❌ MISSING |
| **config/models/**      | Per-model configs: ollama.json, claude.json, openai.json, gemini.json, deepseek.json, qwen.json | ❌ MISSING |
| **config/industry/**    | Industry preset configs: real-estate.json, fleet.json, govcon.json, etc.                        | ❌ MISSING |
| **config/branding/**    | Client branding overrides: logo path, colors, company name, tagline                             | ❌ MISSING |

### 3.13 /audit — Audit Trail

| --- | --- | --- |
| **Path**   | **Purpose**                                                                     | **Status**                       |
| **audit/** | Build phase audit files, skill execution logs, SOP run records, compliance logs | ✅ EXISTS — phase audits present |

### 3.14 /archive — Frozen Files

| --- | --- | --- |
| **Path**     | **Purpose**                                                                                    | **Status** |
| **archive/** | Read-only by policy. Completed TODOs, old configs, deprecated files. Original paths preserved. | ✅ EXISTS  |

## 4. Gap Analysis — Pipeline Penny vs. PipelineX Target

### 4.1 Scorecard

| --- | --- | --- | --- | --- |
| --- | --- | --- | --- | --- |
| **System**          | **Target Files** | **Exist** | **Missing** | **Completion** |
| **Root Files**      | 15               | 8         | 7           | 53%            |
| **src/ (Frontend)** | 8                | 4         | 4           | 50%            |
| **electron/**       | 5                | 2         | 3           | 40%            |
| **api/ (Backend)**  | 12               | 3         | 9           | 25%            |
| **knowledge/**      | 14               | 5         | 9           | 36%            |
| **skills/**         | 10               | 2         | 8           | 20%            |
| **prompts/**        | 5                | 2         | 3           | 40%            |
| **memory/**         | 5                | 0         | 5           | 0%             |
| **templates/**      | 6                | 2         | 4           | 33%            |
| **modules/**        | 10               | 0         | 10          | 0%             |
| **config/**         | 4                | 0         | 4           | 0%             |
| **scripts/**        | 7                | 2         | 5           | 29%            |
| **docs/**           | 10               | 4         | 6           | 40%            |
| **TOTAL**           | 111              | 34        | 77          | 31%            |

> *Pipeline Penny is approximately 31% of the way to full PipelineX target. The foundation is solid — core Q&A, vector store, skill system, and SOP execution all work. The biggest gaps are: memory system (0%), module toggle system (0%), config layer (0%), multi-model support, and industry knowledge packs.*

### 4.2 What You Asked About — Am I Missing Anything?

Here’s what you specifically asked about and whether it’s covered:

| --- | --- | --- |
| **Feature You Mentioned**                | **Status** | **Gap Detail**                                                                             |
| **Knowledge-based questions**            | ✅         | Working. Command Post Q&A with citations from vectorized docs.                             |
| **Prompt testing**                       | ❌         | No prompt testing skill. Need: multi-model prompt runner, scoring, comparison UI.          |
| **Categorized skills testing**           | ⚠️         | Skill system exists (bearing-check), but no test runner, no scoring, no categorization.    |
| **Automation workflows**                 | ⚠️         | Basic SOP execution works. No form builder, no checklist engine, no conditional branching. |
| **Templates**                            | ⚠️         | Template routing exists. No template library, no industry templates, no variable system.   |
| **SOPs (knowledge + execution)**         | ⚠️         | Onboarding SOP works end-to-end. No other SOPs built. Forms/checklists not implemented.    |
| **Multi-model (Ollama, DeepSeek, etc.)** | ❌         | Only Claude API + Ollama embeddings. Need model adapter layer and router.                  |
| **Scaffolds**                            | ❌         | No prompt scaffolding. Need: chain-of-thought, ReAct, few-shot library.                    |
| **Memory system**                        | ❌         | No memory system. Need: persistent store, tool catalog, agent catalog, entity memory.      |
| **Toggle packages on/off**               | ❌         | No module toggle. Need: manifest.json, module-toggle.py, config layer.                     |
| **Industry-specific models**             | ❌         | No industry packs. Architecture planned (knowledge/industry/), nothing built.              |
| **Electron (Win/Mac/Linux)**             | ⚠️         | Electron works on Windows. No Mac/Linux testing. No platform-specific configs.             |
| **User manual**                          | ⚠️         | Exists but basic. Needs full rewrite for PipelineX product.                                |
| **Developer manual**                     | ⚠️         | Exists but basic. Needs API reference, skill dev guide, module dev guide.                  |
| **Agent types**                          | ❌         | No agent type system. Need: researcher, executor, reviewer, coordinator, specialist.       |

### 4.3 Things You Didn’t Mention But Need

-   **Authentication/Authorization:** Even local installs need user identity for audit trails. Multi-user installs need role-based access (owner sees financials, HR sees onboarding, front desk sees scheduling).
-   **Auto-updater:** electron-updater to push updates through the repo without manual intervention. Critical for the one-repo-per-client model.

-   **Cost tracking:** When using Claude/OpenAI APIs, track token usage and cost per query. Clients will ask what this is costing.
-   **Backup/restore:** Memory and knowledge stores need backup capability. One bad vectorization shouldn’t require a full rebuild.

-   **Client branding:** Logo, colors, company name injected into the UI and generated documents. Already in your doc standards.
-   **Offline fallback chain:** If Claude API is down, fall through to local Ollama. If Ollama isn’t loaded, degrade to keyword search. Never show the user an error.

-   **Usage analytics (local):** What questions are being asked most? Which skills get used? Which templates? This data informs upsells during Command Partner reviews.
-   **Export/import:** Export knowledge base, memory, and configs as a portable package. Import from one install to another. Critical for the cloud migration tier.

-   **Health check endpoint:** API route that reports system status: models loaded, index size, memory store size, last backup, API connectivity.
-   **Admin dashboard:** Settings tab needs expansion: module management, model selection, API key management, usage stats, backup controls.

## 5. Recommended Build Priority

Based on the gap analysis, here’s the execution order that gets you to a demoable, sellable product fastest:

**Phase 1: Foundation (Weeks 1-2)**

Get the configuration and toggle system working. Everything else builds on this.

-   Create pipelinex.config.json and models.config.json
-   Create /config directory with default.json and model configs

-   Create /modules directory with manifest.json
-   Build module-toggle.py script

-   Refactor api/ from monolith into routes + adapters
-   Clean root (move TODOs, remove desktop.ini, archive odoo)

**Phase 2: Multi-Model (Weeks 2-3)**

Enable model switching so you’re not locked to Claude API.

-   Build model adapter layer: ollama, claude, openai, gemini, deepseek, qwen
-   Build model router with fallback chains

-   Add model switcher to Settings UI
-   Test offline mode with Ollama-only

**Phase 3: Memory System (Weeks 3-4)**

Persistent memory makes the platform feel intelligent across sessions.

-   Build /memory directory structure
-   Implement memory store (SQLite + FAISS hybrid)

-   Create tools-catalog.json and agents-catalog.json
-   Wire memory into Command Post queries

**Phase 4: Module Packaging (Weeks 4-6)**

Package existing capabilities into toggleable modules.

-   Package onboard-command from existing files
-   Package proposal-command from existing files

-   Build workspace-command as new module
-   Build first industry pack: real-estate (for Eric’s wife demo)

**Phase 5: Skill Expansion (Weeks 6-8)**

Build out the skill library for demo impact.

-   prompt-tester skill
-   form-builder skill

-   compliance-checker skill
-   report-builder skill

**Phase 6: Documentation & Polish (Weeks 8-9)**

-   Full user manual rewrite
-   Developer guide with API reference

-   Admin guide
-   Deployment guide for all three tiers

**Phase 7: Cross-Platform & Cloud (Weeks 9-12)**

-   Mac and Linux Electron builds and testing
-   Docker containerization

-   Cloud deployment scripts
-   Auto-updater implementation

## 6. Deployment Tier Architecture

### 6.1 Tier 1: Fully Local (No Internet)

-   Electron desktop app with bundled Python backend
-   Ollama running locally for inference (DeepSeek, Qwen, Llama)

-   FAISS vector store on local disk
-   SQLite for memory and audit

-   No API calls, no telemetry, no external connections
-   Best for: maximum privacy, no internet sites, classified environments

### 6.2 Tier 2: Local + API Connections

-   Same Electron desktop app
-   Adds: Claude API, OpenAI API, Gemini API for inference

-   Adds: HubSpot, Fleetio, QuickBooks, Google Workspace API connections
-   Adds: Zapier/Make webhooks for custom integrations

-   Local FAISS + SQLite still handle memory and knowledge
-   Best for: small businesses wanting AI power with existing tool integration

### 6.3 Tier 3: Cloud-Hosted

-   Docker containers deployed to GCP, AWS, or Vercel
-   PostgreSQL + pgvector replaces FAISS

-   Redis for caching and session management
-   Multi-user with role-based access

-   Web UI replaces Electron (same React frontend, different shell)
-   Best for: multi-location businesses, teams needing shared access

## 7. Pricing Alignment

How this maps to TNDS service offerings:

| --- | --- | --- | --- |
| **Service**               | **PipelineX Scope**                                             | **Price Range**    | **Included Modules** |
| **Command Center Build**  | Install PipelineX + 2 modules + knowledge base build            | $2,500 - $5,000    | 2 (we recommend)     |
| **Battle Rhythm Install** | Add operating cadence modules + SOP automation                  | $2,000 - $4,000    | 2-3 additional       |
| **Command Partner**       | Ongoing: module updates, knowledge refresh, new skills, support | $1,000 - $2,000/mo | All enabled + new    |
| **Additional Module**     | Single module add-on                                            | $500 - $1,500      | +1                   |
| **API Connection**        | Connect external tool (HubSpot, Fleetio, etc.)                  | $300 - $800        | N/A                  |
| **Additional Seat**       | Install on another computer/user in same repo                   | $200 - $500        | Same as repo         |
| **Cloud Migration**       | Move from Tier 1/2 to Tier 3 cloud                              | $3,000 - $7,000    | All existing         |

> *Fixed scope, fixed price. No open-ended projects. No surprise invoices. Every install comes with two modules. Start with one user. Add more when you’re ready. We don’t lock you into anything you don’t need yet.*

## 8. Next Steps

This document is the build target. Every file, folder, and system listed here needs to exist before PipelineX is a complete product. The gap analysis shows Pipeline Penny at 31% completion with a solid foundation.

Recommended immediate actions:

1.  Archive dead files and clean root (1 day)
2.  Create pipelinex.config.json and module manifest (1 day)

3.  Refactor API into routes + adapters (2-3 days)
4.  Build model adapter layer (2-3 days)

5.  Build memory system skeleton (2-3 days)
6.  Package first real industry module for Eric’s wife demo (3-5 days)

Total estimated timeline to MVP (demoable + sellable with 2 industry packs): 8-10 weeks of focused execution.

**Direction Protocol gets you clarity.** Command Protocol gets you control. PipelineX makes it stick.
