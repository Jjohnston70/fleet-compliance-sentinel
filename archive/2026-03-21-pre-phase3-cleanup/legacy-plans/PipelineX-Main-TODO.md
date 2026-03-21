# PipelineX — Main Build TODO

**Version:** 1.0.0
**Created:** 2026-02-25
**Owner:** Jacob Johnston — True North Data Strategies LLC
**Source Project:** Pipeline Penny (`<REPO_ROOT>\Desktop\pipeline_penny`)
**Target Project:** PipelineX (new repo, new directory)

---

## Build Philosophy

PipelineX is a **new project** that pulls proven, working code from Pipeline Penny. This is not a rename or refactor of Pipeline Penny — it is a clean build with intentional imports. Every phase is independently executable. Every phase includes a prompt with role, context, constraints, deliverables, and outputs. Every phase ends with documentation updates and a manual test checklist.

**Rule of the Root:** Only files required to run, build, deploy, or configure the application live in root. Everything else is one level down.

**Pull Strategy:** For each phase, the prompt specifies exactly which files to pull from Pipeline Penny, what refactoring is needed, and what is built new. If a Pipeline Penny file works as-is, copy it. If it needs changes, the prompt says what changes. If it doesn't exist, the prompt says build it.

**Documentation Contract:** Every phase ends with updates to `docs/user-manual.md`, `docs/developer-manual.md`, and the relevant section of `docs/admin-guide.md`. No phase is complete until docs are updated and committed.

---

## Phase Index

| Phase | Name | Dependencies | Est. Time | Priority |
|-------|------|-------------|-----------|----------|
| 0 | Project Scaffold & Configuration | None | 1 day | CRITICAL |
| 1 | Python Backend Foundation | Phase 0 | 2-3 days | CRITICAL |
| 2 | Electron Shell & React Frontend | Phase 0 | 2-3 days | CRITICAL |
| 3 | Knowledge Base & Vector Store | Phase 1 | 2-3 days | CRITICAL |
| 4 | Multi-Model Adapter Layer | Phase 1 | 3-4 days | HIGH |
| 5 | Memory System | Phase 1 | 3-4 days | HIGH |
| 6 | Skill Package System | Phases 1, 3 | 3-4 days | HIGH |
| 7 | Prompt Library & Scaffold System | Phase 1 | 2-3 days | HIGH |
| 8 | Template Engine | Phases 1, 3 | 2-3 days | MEDIUM |
| 9 | Workflow & SOP Execution Engine | Phases 1, 6 | 3-4 days | MEDIUM |
| 10 | Module Toggle System | Phases 3, 6, 7, 8 | 3-4 days | HIGH |
| 11 | Industry Knowledge Packs | Phases 3, 10 | 5-7 days | MEDIUM |
| 12 | Cross-Platform Electron Builds | Phase 2 | 2-3 days | MEDIUM |
| 13 | Cloud Deployment Tier | Phases 1, 3, 5 | 4-5 days | LOW |
| 14 | Documentation Finalization | All phases | 3-4 days | CRITICAL |

**Critical Path:** 0 → 1 → 2 → 3 → 4 → 6 → 10 (gets you to a demoable product)

---

## Phase 0 — Project Scaffold & Configuration

### Goal

Create the PipelineX repository with clean folder structure, configuration files, and the toggle/config foundation that every other phase builds on. Nothing runs yet — this is structure only.

### What to Pull from Pipeline Penny

- `package.json` → copy and refactor (rename, remove dead scripts, update metadata)
- `tsconfig.json` → copy as-is
- `requirements.txt` → copy and audit (remove unused deps, add missing ones)
- `.gitignore` → copy and expand
- `.env.example` → copy and expand for multi-model keys

### What to Build New

- `pipelinex.config.json` — master platform config
- `models.config.json` — model registry
- `/config/default.json` — default platform settings
- `/config/models/` — per-model config files (stubs)
- `/config/industry/` — industry preset stubs
- `/config/branding/` — client branding config
- `/modules/manifest.json` — module registry
- All folder structure with README.md placeholder files
- `LICENSE` — proprietary license
- `CHANGELOG.md` — version history

### Prompt

```
Role: Senior full-stack architect scaffolding a new governed desktop LLM platform.

Context:
You are creating the PipelineX project from scratch. PipelineX is a governed
knowledge and execution platform built with Electron + React + TypeScript for
the frontend and Python FastAPI for the backend. It supports three deployment
tiers: fully local, local with API connections, and cloud-hosted.

The source project Pipeline Penny exists at <REPO_ROOT>\Desktop\pipeline_penny
and contains working code that will be selectively pulled in later phases.
This phase creates structure only — no running code.

Reference the PipelineX Architecture Blueprint (PipelineX-Architecture-Blueprint.docx)
for the complete folder and file inventory.

Task:
1. Initialize a new git repository for PipelineX.
2. Create the complete folder structure with README.md placeholder files in
   every directory explaining the directory's purpose and what will go there.
3. Pull these files from Pipeline Penny and refactor:
   - package.json → update name to "pipelinex", update description, remove
     dead scripts, keep Electron + React + esbuild deps, add any missing deps
   - tsconfig.json → copy as-is
   - requirements.txt → audit against pipeline_penny's actual imports, remove
     unused packages, add: deepseek-api, google-generativeai, qwen-agent
   - .gitignore → copy and add: /config/branding/*, .env, /memory/store/*,
     /audit/logs/*, *.sqlite, __pycache__
   - .env.example → expand to include: CLAUDE_API_KEY, OPENAI_API_KEY,
     GEMINI_API_KEY, OLLAMA_HOST, DEEPSEEK_API_KEY, DEPLOYMENT_TIER,
     DEFAULT_MODEL, LOG_LEVEL
4. Create these new files:
   - pipelinex.config.json with this structure:
     {
       "version": "1.0.0",
       "deployment_tier": "local",          // local | local-api | cloud
       "default_model": "ollama/llama3.1",
       "fallback_chain": ["ollama/llama3.1", "claude-sonnet"],
       "enabled_modules": [],
       "feature_flags": {
         "memory_enabled": false,
         "multi_model": false,
         "cloud_sync": false,
         "usage_analytics": false
       },
       "ui": {
         "theme": "default",
         "branding": "tnds"
       }
     }
   - models.config.json with entries for: ollama (llama3.1, deepseek, qwen),
     claude (sonnet, opus, haiku), openai (gpt-4o, gpt-4o-mini), gemini
     (pro, flash). Each entry includes: id, provider, model_name, endpoint,
     api_key_env_var, max_tokens, supports_streaming, supports_tools,
     cost_per_1k_input, cost_per_1k_output, is_local, requires_internet
   - /config/default.json with UI defaults: chunk_size, overlap, temperature,
     max_context_window, citation_style
   - /config/models/*.json — one stub per provider (ollama.json, claude.json,
     openai.json, gemini.json, deepseek.json, qwen.json)
   - /config/industry/*.json — stubs for: real-estate, fleet-asset, govcon,
     construction, healthcare, property-mgmt
   - /config/branding/default.json — TNDS brand: logo_path, primary_color
     (#1A3A5C), accent_color (#3D8EB9), company_name, tagline
   - /modules/manifest.json — empty module registry with schema:
     { "modules": [], "schema_version": "1.0" }
   - LICENSE — proprietary license (True North Data Strategies LLC,
     all rights reserved, per-install licensing)
   - CHANGELOG.md — initial entry for v1.0.0 scaffold

5. Create the complete folder tree:
   /src (components/, hooks/, services/, types/, styles/)
   /electron (platform/)
   /api (routes/, agents/, agents/types/, models/, vectorstore/, memory/,
         workflows/, integrations/, utils/)
   /knowledge (core/, industry/, client/, compliance/, csv/,
              agent/workflows/, tools-reference/)
   /skills (with registry.json stub and README.md contract doc)
   /prompts (system/, templates/, testing/, industry/, scaffolds/)
   /memory (store/, index/, types/)
   /templates (proposals/, onboarding/, sops/, forms/, reports/, industry/)
   /modules (each module gets its own folder later)
   /config (models/, industry/, branding/)
   /scripts (testing/)
   /docs
   /audit
   /archive

6. Initialize docs/user-manual.md with:
   - Title, version, table of contents placeholder
   - Section 1: What is PipelineX (2-3 paragraphs)
   - Section 2: Getting Started (placeholder)
   - All remaining sections as headers with "Coming in Phase X" notes

7. Initialize docs/developer-manual.md with:
   - Title, version, table of contents placeholder
   - Section 1: Architecture Overview (reference architecture diagram)
   - Section 2: Project Structure (generated from this phase's folder tree)
   - Section 3: Configuration System (document pipelinex.config.json and
     models.config.json schemas)
   - All remaining sections as headers with "Coming in Phase X" notes

8. Initialize docs/admin-guide.md with:
   - Title, version, table of contents placeholder
   - Section 1: Installation (placeholder)
   - Section 2: Configuration (document all config files from this phase)
   - All remaining sections as headers with "Coming in Phase X" notes

Constraints:
- No running code in this phase — structure, config, and documentation only
- Every folder must have a README.md explaining its purpose
- All config files must be valid JSON with comments removed (use descriptive
  key names instead)
- Follow the Rule of the Root — only build/deploy/config files in root
- Do not include node_modules/, dist/, .env, or any generated files
- All documentation in markdown format
- Use TNDS brand standards: Navy #1A3A5C, Teal #3D8EB9

Deliverables:
- Initialized git repository with complete folder structure
- All root config files created and populated
- All /config files created with proper schemas
- /modules/manifest.json with empty module registry
- /skills/registry.json stub with schema
- /skills/README.md with skill package contract
- docs/user-manual.md initialized
- docs/developer-manual.md initialized
- docs/admin-guide.md initialized
- README.md with project overview
- CHANGELOG.md with initial entry
- LICENSE file

Output:
git add -A
git commit -m "phase-0: project scaffold — folder structure, configs, doc shells"
```

### Manual Test Checklist — Phase 0

- [ ] **Folder structure verification:** Run `tree -L 3 --dirsfirst` from project root. Confirm all directories listed above exist with README.md files.
- [ ] **Root file inventory:** Confirm these files exist in root and ONLY these files: `package.json`, `tsconfig.json`, `requirements.txt`, `.env.example`, `.gitignore`, `pipelinex.config.json`, `models.config.json`, `build.js`, `README.md`, `CHANGELOG.md`, `LICENSE`. No TODO files, no desktop.ini, no stray scripts.
- [ ] **JSON validation:** Open each `.json` file in VS Code. Confirm no red squiggles (syntax errors). Files to check: `pipelinex.config.json`, `models.config.json`, `config/default.json`, `config/branding/default.json`, `modules/manifest.json`, `skills/registry.json`, and every file in `config/models/` and `config/industry/`.
- [ ] **Package.json audit:** Open `package.json`. Confirm name is "pipelinex", not "pipeline-penny" or "lenny". Confirm no dead scripts referencing old paths.
- [ ] **Requirements.txt audit:** Open `requirements.txt`. Confirm it includes: fastapi, uvicorn, faiss-cpu, langchain (or langchain-community), anthropic, openai, google-generativeai. Confirm no packages listed that don't exist on PyPI.
- [ ] **Env example audit:** Open `.env.example`. Confirm all API key placeholders exist for: Claude, OpenAI, Gemini, DeepSeek, Ollama. Confirm DEPLOYMENT_TIER and DEFAULT_MODEL are present.
- [ ] **Models config audit:** Open `models.config.json`. Confirm at least 8 model entries spanning 4+ providers. Each entry must have: id, provider, model_name, endpoint, api_key_env_var, is_local, requires_internet.
- [ ] **Skills contract:** Open `skills/README.md`. Confirm it documents: required files per skill (SKILL.md, contract.json, system.prompt, tests/), naming conventions, trigger pattern format, and the version field requirement.
- [ ] **Module manifest schema:** Open `modules/manifest.json`. Confirm the schema_version field exists and the modules array is empty.
- [ ] **Documentation check:** Open each doc file. Confirm: `docs/user-manual.md` has at least 5 section headers, `docs/developer-manual.md` has at least 6 section headers including Configuration System with actual schema docs, `docs/admin-guide.md` has at least 4 section headers.
- [ ] **Git status:** Run `git log --oneline`. Confirm exactly one commit exists with the Phase 0 message. Run `git status` and confirm clean working tree.
- [ ] **No code test:** Grep the entire project for function definitions: `grep -r "def \|function \|const.*=.*=>" --include="*.py" --include="*.ts" --include="*.tsx" --include="*.js"`. The ONLY results should be in stub/placeholder files. No actual running logic.

---

## Phase 1 — Python Backend Foundation

### Goal

Create the FastAPI backend with proper route structure, the model adapter interface, and core utilities. This is the intelligence layer that every other system calls into. By the end of this phase, the API server starts, responds to health checks, and has stub routes for all endpoints.

### What to Pull from Pipeline Penny

- `knowledge/agent/api.py` → refactor into `api/server.py` + `api/routes/chat.py`
- `knowledge/agent/claude_agent.py` → refactor into `api/agents/qa_agent.py` (extract Claude-specific code into `api/models/claude_adapter.py`)
- `knowledge/agent/skill_router.py` → copy to `api/agents/skill_agent.py`, refactor imports
- Logger patterns from existing code → standardize into `api/utils/logger.py`

### What to Build New

- `api/server.py` — FastAPI app with CORS, route mounting, startup/shutdown events
- `api/routes/` — health.py, chat.py, models.py (stubs for: templates.py, skills.py, sops.py, memory.py)
- `api/models/base_adapter.py` — abstract base class for all model adapters
- `api/models/claude_adapter.py` — extracted from claude_agent.py
- `api/models/ollama_adapter.py` — extracted from existing Ollama embedding code
- `api/models/router.py` — model selection logic reading from models.config.json
- `api/utils/logger.py` — structured logging with no PII
- `api/utils/validators.py` — input sanitization
- `api/utils/cost_tracker.py` — token usage and cost logging

### Prompt

```
Role: Senior Python backend engineer building a FastAPI service for a
multi-model LLM platform.

Context:
You are building the Python backend for PipelineX, a governed knowledge and
execution platform. The project scaffold exists from Phase 0 — all folders
and config files are in place. You are now creating the running backend.

Pipeline Penny's backend source lives at:
- <REPO_ROOT>\Desktop\pipeline_penny\knowledge\agent\api.py
  (FastAPI server with chat endpoint, FAISS query, template routing)
- <REPO_ROOT>\Desktop\pipeline_penny\knowledge\agent\claude_agent.py
  (Claude API integration, prompt construction, response parsing)
- <REPO_ROOT>\Desktop\pipeline_penny\knowledge\agent\skill_router.py
  (Skill detection, routing, contract enforcement)

Read all three files completely before writing any code. Understand what
works, what is tightly coupled, and what needs separation.

Task:
1. Create api/server.py:
   - FastAPI app with title "PipelineX API", version from pipelinex.config.json
   - CORS middleware allowing localhost origins (Electron renderer)
   - Mount all route modules
   - Startup event: load pipelinex.config.json and models.config.json into
     app.state, initialize logger
   - Shutdown event: cleanup connections, flush logs
   - Read DEPLOYMENT_TIER from env to set available features

2. Create api/routes/health.py:
   - GET /health → returns: status, version, deployment_tier, models_loaded,
     index_status, memory_status, uptime_seconds

3. Create api/routes/chat.py:
   - POST /chat → accepts: { query, conversation_id?, model_override?,
     include_citations?, skill_mode? }
   - Pull the working chat logic from Pipeline Penny's api.py
   - Replace hardcoded Claude calls with model router calls
   - Return: { response, sources[], model_used, tokens_used, cost,
     processing_ms, skill_used? }

4. Create api/routes/models.py:
   - GET /models → list available models from models.config.json
   - GET /models/active → current default model
   - POST /models/switch → change active model (validates model exists)
   - GET /models/{model_id}/status → check if model is reachable

5. Create stub routes (return 501 Not Implemented):
   - api/routes/templates.py (GET /templates, POST /templates/generate)
   - api/routes/skills.py (GET /skills, POST /skills/execute)
   - api/routes/sops.py (GET /sops, POST /sops/execute)
   - api/routes/memory.py (GET /memory, POST /memory/store, DELETE /memory)

6. Create api/models/base_adapter.py:
   - Abstract base class ModelAdapter with methods:
     async def complete(prompt, system_prompt?, temperature?, max_tokens?)
       → ModelResponse
     async def stream(prompt, system_prompt?, temperature?, max_tokens?)
       → AsyncGenerator[str]
     async def health_check() → bool
     def get_cost(input_tokens, output_tokens) → float
   - ModelResponse dataclass: text, model_id, input_tokens, output_tokens,
     cost, latency_ms

7. Create api/models/claude_adapter.py:
   - Extract Claude-specific code from Pipeline Penny's claude_agent.py
   - Implement ModelAdapter interface
   - Read API key from env, endpoint from config
   - Include proper error handling and retry logic (3 retries with backoff)

8. Create api/models/ollama_adapter.py:
   - Extract Ollama embedding code from Pipeline Penny
   - Implement ModelAdapter interface for both embeddings AND completions
   - Support model switching (llama3.1, deepseek, qwen) via config
   - Health check pings Ollama server

9. Create stub adapters (implement health_check only, complete returns
   NotImplementedError with helpful message):
   - api/models/openai_adapter.py
   - api/models/gemini_adapter.py
   - api/models/deepseek_adapter.py
   - api/models/qwen_adapter.py

10. Create api/models/router.py:
    - Reads models.config.json and pipelinex.config.json
    - route(task_type, preferred_model?) → selects best available model
    - Fallback chain: if primary fails, try next in chain
    - Task type routing: "chat" uses default, "embedding" always uses
      local Ollama, "skill" can override
    - Log every model selection decision

11. Create api/utils/logger.py:
    - Structured JSON logging
    - Log levels: DEBUG, INFO, WARN, ERROR
    - NEVER log PII (query content logged only at DEBUG level)
    - Include: timestamp, level, module, message, metadata{}
    - File output to /audit/logs/ with daily rotation

12. Create api/utils/validators.py:
    - sanitize_query(text) → strip injection attempts, limit length
    - validate_model_id(id) → confirm exists in config
    - validate_config(config_dict, schema) → JSON schema validation

13. Create api/utils/cost_tracker.py:
    - Track per-query: model, input_tokens, output_tokens, cost, timestamp
    - Track per-session: total_cost, total_queries, model_distribution
    - Write to /audit/logs/cost-{date}.json
    - Method: get_usage_summary(period) → aggregated stats

14. Update documentation:
    - docs/developer-manual.md Section: "Backend Architecture"
      Document: server startup, route structure, model adapter interface,
      how to add a new model adapter, router logic, cost tracking
    - docs/developer-manual.md Section: "API Reference"
      Document every endpoint: method, path, request body, response body,
      error codes
    - docs/admin-guide.md Section: "Configuration — Models"
      Document: models.config.json schema, how to add/remove models,
      environment variables required per provider
    - docs/user-manual.md Section: "Switching Models"
      Document: how to change the active model from Settings (placeholder
      for when UI exists)

Constraints:
- All model-specific code MUST go through the adapter interface — no direct
  API calls from routes or agents
- Router MUST read from config files, not hardcoded model lists
- Logger MUST never log query content at INFO level or above
- All routes MUST return consistent response shapes (use Pydantic models)
- Cost tracker MUST NOT block request processing (fire-and-forget or async)
- Every Python file MUST have a module docstring explaining its purpose
- Use Logger.log() equivalent in all files for testing visibility
- requirements.txt must be updated with any new dependencies
- All error responses must include: error_code, message, detail,
  suggested_action

Deliverables:
- api/server.py — running FastAPI server
- api/routes/ — 7 route files (2 functional, 5 stubs)
- api/models/ — base adapter + 2 functional adapters + 4 stubs + router
- api/utils/ — logger, validators, cost_tracker
- Updated docs/developer-manual.md (Backend Architecture + API Reference)
- Updated docs/admin-guide.md (Configuration — Models)
- Updated docs/user-manual.md (Switching Models placeholder)
- Updated requirements.txt

Output:
Test the server starts: cd api && uvicorn server:app --reload --port 8000
Test health endpoint: curl http://localhost:8000/health
Test chat endpoint with Ollama: curl -X POST http://localhost:8000/chat
  -H "Content-Type: application/json"
  -d '{"query": "What is PipelineX?"}'
Test model list: curl http://localhost:8000/models

git add -A
git commit -m "phase-1: FastAPI backend — routes, model adapters, router, utilities"
```

### Manual Test Checklist — Phase 1

- [ ] **Server starts:** Run `cd api && uvicorn server:app --reload --port 8000`. Server starts without errors. Terminal shows: "Uvicorn running on http://127.0.0.1:8000".
- [ ] **Health check:** Open browser to `http://localhost:8000/health`. Response includes: status "ok", version, deployment_tier, uptime_seconds. Response is valid JSON.
- [ ] **API docs auto-generated:** Open `http://localhost:8000/docs`. Swagger UI loads. All routes are listed with request/response schemas.
- [ ] **Model list:** `GET /models` returns at least 8 model entries. Each has: id, provider, model_name, is_local, requires_internet.
- [ ] **Active model:** `GET /models/active` returns the default model from pipelinex.config.json.
- [ ] **Model switch:** `POST /models/switch` with a valid model_id returns success. `GET /models/active` now returns the new model. Switch to an invalid model_id returns 400 error with helpful message.
- [ ] **Chat with Ollama (if running):** `POST /chat` with `{"query": "Hello"}` returns a response with: response text, model_used, tokens_used, processing_ms. If Ollama is not running, returns a clear error with suggested_action "Start Ollama with: ollama serve".
- [ ] **Chat with Claude (if API key set):** Set CLAUDE_API_KEY in .env. `POST /chat` with `{"query": "Hello", "model_override": "claude-sonnet"}`. Returns response with model_used showing Claude.
- [ ] **Fallback chain:** Stop Ollama. Send `POST /chat` with no model_override. Confirm the router tries fallback models. If all fail, returns 503 with list of attempted models.
- [ ] **Stub routes return 501:** Hit each stub route (GET /templates, GET /skills, GET /sops, GET /memory). Each returns 501 with message "Not yet implemented — coming in Phase X".
- [ ] **Cost tracking:** After 3+ chat requests, check `/audit/logs/` for a cost log file. Confirm it contains: model, tokens, cost, timestamp for each request.
- [ ] **Logger output:** Check `/audit/logs/` for application log. Confirm structured JSON entries. Confirm no query text appears at INFO level — only at DEBUG.
- [ ] **Input validation:** `POST /chat` with empty query → 422 error. With query over 10,000 chars → 400 error with "Query too long". With HTML/script tags in query → tags stripped, query still processed.
- [ ] **CORS:** From a browser console on a different origin, attempt `fetch("http://localhost:8000/health")`. Confirm CORS allows localhost origins.
- [ ] **Documentation:** Open docs/developer-manual.md. Confirm "Backend Architecture" section has: startup sequence, route list, adapter interface diagram. Confirm "API Reference" section has every endpoint documented. Open docs/admin-guide.md. Confirm "Configuration — Models" section explains models.config.json.

---

## Phase 2 — Electron Shell & React Frontend

### Goal

Create the Electron desktop application shell with React frontend, tab navigation, and the Settings panel. By the end of this phase, the app launches on Windows, displays tabs, and the Settings tab can read/display configuration from pipelinex.config.json and models.config.json.

### What to Pull from Pipeline Penny

- `electron/main.ts` → copy and refactor (remove lenny references, clean IPC handlers, add platform detection)
- `electron/preload.ts` → copy and refactor (update channel names to pipelinex namespace)
- `src/App.tsx` → DO NOT COPY WHOLE FILE. Extract only: tab navigation pattern, theme/CSS structure. Build components from scratch.
- `src/styles.css` or inline styles → pull the visual theme, refactor to TNDS brand colors

### What to Build New

- `src/App.tsx` — clean, <300 lines, imports tab components
- `src/components/TabNav.tsx` — tab navigation bar
- `src/components/CommandPost.tsx` — chat interface (stub)
- `src/components/SettingsPanel.tsx` — config viewer/editor
- `src/components/ModelSwitcher.tsx` — model selection dropdown
- `src/services/apiClient.ts` — typed HTTP client for FastAPI backend
- `src/services/ipcBridge.ts` — typed IPC wrapper
- `src/hooks/useConfig.ts` — hook for reading pipelinex.config.json
- `src/hooks/useModels.ts` — hook for model list and switching
- `electron/ipc-handlers.ts` — separated from main.ts
- `electron/auto-updater.ts` — stub for future use

### Prompt

```
Role: Senior Electron + React + TypeScript developer building a desktop
application shell.

Context:
You are building the PipelineX desktop application. Phase 0 (scaffold) and
Phase 1 (backend) are complete. The FastAPI server runs on localhost:8000
and responds to /health, /chat, /models, and /models/active.

Pipeline Penny's Electron source lives at:
- <REPO_ROOT>\Desktop\pipeline_penny\electron\main.ts
- <REPO_ROOT>\Desktop\pipeline_penny\electron\preload.ts
- <REPO_ROOT>\Desktop\pipeline_penny\src\App.tsx (2786 lines — DO
  NOT copy this file wholesale. It contains massive duplication from the
  Lenny→Pipeline rename. Extract patterns only.)

Read Pipeline Penny's main.ts and preload.ts fully. These are functional
and mostly clean. App.tsx is a cautionary tale — the new version must be
componentized from the start.

Task:
1. Create electron/main.ts:
   - Pull from Pipeline Penny's version
   - Remove ALL references to "lenny" or "pipeline-penny"
   - Window title: "PipelineX" with version from package.json
   - Spawn Python FastAPI as child process on startup
   - Wait for FastAPI health check before showing window
   - IPC handlers in separate file (electron/ipc-handlers.ts)
   - Platform detection: set paths for win32, darwin, linux
   - Tray icon support (stub — actual icon later)
   - Menu bar with: File (Quit), View (Reload, DevTools), Help (About)

2. Create electron/preload.ts:
   - Pull from Pipeline Penny's version
   - Rename all channels to pipelinex:* namespace
   - Expose: pipelinex:config:read, pipelinex:config:write,
     pipelinex:file:read, pipelinex:file:list,
     pipelinex:knowledge:list, pipelinex:knowledge:read
   - Type-safe contextBridge exposure

3. Create electron/ipc-handlers.ts:
   - All IPC handler registrations extracted from main.ts
   - Config read: reads pipelinex.config.json, returns parsed JSON
   - Config write: validates and writes pipelinex.config.json
   - File read: reads any allowed file path, returns content
   - File list: lists files in a directory with metadata

4. Create electron/platform/paths.ts:
   - Export functions for: getAppDataPath(), getKnowledgePath(),
     getConfigPath(), getAuditPath(), getMemoryPath()
   - Platform-aware: win32 uses %APPDATA%, darwin uses ~/Library,
     linux uses ~/.config
   - In development: use project root paths

5. Create src/App.tsx (<300 lines):
   - Import and render TabNav + active tab component
   - Tabs: Command Post, Knowledge, Templates, Prompts, Skills,
     SOPs, Memory, Settings
   - State: activeTab, config (from useConfig hook)
   - NO business logic in App.tsx — delegates everything to components

6. Create src/components/TabNav.tsx:
   - Horizontal tab bar with TNDS styling (Navy bg, Teal active indicator)
   - Props: tabs[], activeTab, onTabChange
   - Responsive: collapses to hamburger menu below 768px

7. Create src/components/CommandPost.tsx (functional stub):
   - Chat-style interface: message list + input box + send button
   - Calls apiClient.chat(query) on send
   - Displays response with model badge and timing
   - "Command Post" header with TNDS branding
   - Note: Full functionality comes in Phase 3 when knowledge base exists

8. Create src/components/SettingsPanel.tsx:
   - Reads pipelinex.config.json via IPC
   - Displays: deployment tier, default model, enabled modules,
     feature flags, branding
   - ModelSwitcher component for changing active model
   - Feature flag toggles (visual only — actual features in later phases)
   - Save button writes config back via IPC
   - "Changes take effect after restart" warning for certain settings

9. Create src/components/ModelSwitcher.tsx:
   - Dropdown populated from GET /models
   - Shows current active model with green indicator
   - Shows model status (reachable/unreachable) with colored dot
   - On select: calls POST /models/switch, updates UI
   - Groups by provider: Ollama (Local), Claude, OpenAI, Gemini

10. Create src/services/apiClient.ts:
    - Typed HTTP client wrapping fetch()
    - Base URL: http://localhost:8000
    - Methods: health(), chat(query, options?), getModels(),
      switchModel(id), getActiveModel()
    - Error handling: network errors, 4xx, 5xx with typed responses
    - Timeout: 30s default, 120s for chat

11. Create src/services/ipcBridge.ts:
    - Typed wrapper around window.electron (from preload)
    - Methods: readConfig(), writeConfig(data), readFile(path),
      listFiles(dir)
    - TypeScript interfaces for all IPC payloads

12. Create src/hooks/useConfig.ts:
    - Reads config on mount via ipcBridge
    - Returns: { config, loading, error, updateConfig, saveConfig }

13. Create src/hooks/useModels.ts:
    - Fetches model list from API on mount
    - Returns: { models, activeModel, loading, switchModel, refreshStatus }

14. Create stub tab components (render placeholder with tab name and
    "Coming in Phase X" message):
    - src/components/KnowledgeTab.tsx (Phase 3)
    - src/components/TemplatesTab.tsx (Phase 8)
    - src/components/PromptsTab.tsx (Phase 7)
    - src/components/SkillsTab.tsx (Phase 6)
    - src/components/SOPsTab.tsx (Phase 9)
    - src/components/MemoryTab.tsx (Phase 5)

15. Create src/styles/theme.css:
    - CSS custom properties for TNDS brand:
      --color-navy: #1A3A5C; --color-teal: #3D8EB9;
      --color-light-bg: #EDF4F8; --color-dark-text: #2D2D2D;
    - Base typography: Arial/system fonts
    - Tab styling, button styling, input styling, card styling
    - Dark mode support via prefers-color-scheme (stretch goal)

16. Update build.js:
    - Pull from Pipeline Penny's build.js
    - Update entry points to new file locations
    - Ensure esbuild bundles React + TypeScript correctly
    - Output to dist/

17. Update documentation:
    - docs/developer-manual.md Section: "Frontend Architecture"
      Document: component tree, IPC channels, service layer, hooks,
      how to add a new tab
    - docs/developer-manual.md Section: "Electron Configuration"
      Document: main process, preload bridge, platform paths
    - docs/user-manual.md Section: "Getting Started"
      Document: how to launch the app, what each tab does, how to
      change settings, how to switch models
    - docs/admin-guide.md Section: "Installation"
      Document: prerequisites (Node.js, Python, Ollama), setup steps,
      first launch verification

Constraints:
- App.tsx MUST be under 300 lines — all logic in components/hooks/services
- No inline styles — all styling through theme.css or CSS modules
- All IPC channels use pipelinex:* namespace
- All API calls go through apiClient.ts — no raw fetch() in components
- All config reads go through ipcBridge.ts — no raw IPC in components
- Tab components are lazy-loaded (React.lazy + Suspense)
- No localStorage usage — all persistence through config files or API
- Electron window must not show until backend health check passes
- All TypeScript — no .js files in src/

Deliverables:
- electron/main.ts, preload.ts, ipc-handlers.ts, platform/paths.ts
- src/App.tsx + 10 component files + 2 service files + 2 hook files
- src/styles/theme.css
- Updated build.js
- Updated docs (developer-manual, user-manual, admin-guide)
- App launches, shows tabs, Settings tab reads and displays config,
  ModelSwitcher shows available models

Output:
npm install
npm run build
npm start
→ App window opens with "PipelineX" title
→ Tabs visible across top
→ Settings tab shows config and model list
→ Command Post tab shows chat interface (functional if backend running)

git add -A
git commit -m "phase-2: Electron shell — tabs, settings, model switcher, IPC bridge"
```

### Manual Test Checklist — Phase 2

- [ ] **App launches:** Run `npm start`. Electron window opens. Title bar shows "PipelineX" (not "Pipeline Penny", not "Lenny").
- [ ] **No console errors:** Open DevTools (Ctrl+Shift+I / Cmd+Opt+I). Console has zero errors on fresh launch.
- [ ] **Tab navigation:** Click every tab. Each renders its component (stubs show "Coming in Phase X" for unbuilt tabs). Active tab has teal underline/highlight.
- [ ] **Settings tab — config display:** Settings tab shows: deployment tier, default model, feature flags. Values match pipelinex.config.json.
- [ ] **Settings tab — model switcher:** ModelSwitcher dropdown lists all models from models.config.json. Current model has green dot. Models grouped by provider.
- [ ] **Settings tab — model health:** If Ollama is running, local models show green. If not, they show red. If Claude API key is set, Claude models show green.
- [ ] **Settings tab — model switch:** Select a different model from dropdown. Confirm success notification. `GET /models/active` now returns new model. Refresh app — new model persists.
- [ ] **Settings tab — save config:** Toggle a feature flag. Click Save. Close app. Reopen. Confirm toggle persisted.
- [ ] **Command Post — basic chat:** If backend is running, type "Hello" and send. Confirm response appears with model badge and timing indicator.
- [ ] **Command Post — error state:** Stop the backend (`Ctrl+C` on uvicorn). Send a message. Confirm user-friendly error message, not a stack trace.
- [ ] **IPC channels:** In DevTools console, run `window.electron` (or equivalent exposed object). Confirm all pipelinex:* channels are exposed. No lenny:* channels exist.
- [ ] **Window behavior:** Minimize, maximize, restore. Confirm no crashes. Close and reopen — backend child process properly terminates and respawns.
- [ ] **Build output:** Check `dist/` folder. Confirm bundled JS files exist. No TypeScript files leaked to dist.
- [ ] **App.tsx line count:** `wc -l src/App.tsx` shows under 300 lines.
- [ ] **No hardcoded URLs:** `grep -r "localhost:8000" src/` shows only apiClient.ts. No other file has hardcoded backend URLs.
- [ ] **Documentation:** Developer manual has "Frontend Architecture" section with component tree. User manual has "Getting Started" with launch instructions. Admin guide has "Installation" with prerequisites.

---

## Phase 3 — Knowledge Base & Vector Store

### Goal

Create the knowledge ingestion pipeline, FAISS vector store management, and wire the Command Post to answer questions with source citations. By the end, you can drop markdown docs into `/knowledge/core/`, run vectorization, and ask questions through Command Post that return cited answers.

### What to Pull from Pipeline Penny

- `knowledge/agent/` vectorization logic → refactor into `api/vectorstore/`
- `knowledge/core/` TNDS documents (6 markdown files) → copy to `knowledge/core/`
- CSV query path logic → refactor into `api/vectorstore/csv_handler.py`
- FAISS index files → do NOT copy; rebuild from source docs
- Citation formatting logic from claude_agent.py → extract into `api/utils/citation_builder.py`

### What to Build New

- `api/vectorstore/indexer.py` — document chunking and embedding pipeline
- `api/vectorstore/searcher.py` — similarity search with citation extraction
- `api/vectorstore/csv_handler.py` — deterministic CSV query path
- `api/vectorstore/index_manager.py` — index versioning, rebuild triggers
- `scripts/vectorize.py` — CLI script to rebuild FAISS index
- `src/components/KnowledgeTab.tsx` — knowledge base browser with markdown viewer
- `src/components/shared/MarkdownViewer.tsx` — reusable markdown renderer

### Prompt

```
Role: Senior Python engineer building a RAG (Retrieval-Augmented Generation)
pipeline with FAISS vector store and citation system.

Context:
You are building the knowledge base system for PipelineX. Phases 0-2 are
complete — the backend runs, the frontend renders, and the model adapter
layer exists.

Pipeline Penny's working vectorstore code lives at:
- <REPO_ROOT>\Desktop\pipeline_penny\knowledge\agent\ (api.py,
  claude_agent.py — both contain vector search logic mixed with other concerns)
- <REPO_ROOT>\Desktop\pipeline_penny\knowledge\ (6 markdown docs
  that are currently vectorized into 342 chunks)
- Pipeline Penny uses FAISS + Ollama llama3.1 for embeddings

The Pipeline Penny vectorstore works. The issues are:
1. Vectorization logic is mixed into api.py instead of separated
2. No index versioning — rebuild is all-or-nothing
3. CSV path works but is tightly coupled to the chat route
4. Citations reference chunk IDs but don't link back to source docs cleanly

Task:
1. Copy all 6 TNDS markdown docs from Pipeline Penny's knowledge/ to
   the new project's knowledge/core/. Verify content is intact.

2. Create api/vectorstore/indexer.py:
   - Walk knowledge/ directories recursively
   - Chunk markdown files (configurable chunk_size and overlap from
     config/default.json)
   - Generate embeddings via Ollama adapter (from Phase 1)
   - Build FAISS index with metadata: source_file, chunk_index,
     section_heading, doc_type (core/industry/client/compliance)
   - Save index to knowledge/.index/ with version file
   - Support incremental re-indexing (only changed files)
   - Log: total docs, total chunks, indexing time, index size

3. Create api/vectorstore/searcher.py:
   - Load FAISS index from knowledge/.index/
   - search(query, top_k=5, doc_type_filter?) → list of SearchResult
   - SearchResult: text, source_file, section, similarity_score,
     chunk_index
   - Reranking: boost results from same document if multiple chunks match
   - Filter by doc_type for industry/module-specific queries

4. Create api/vectorstore/csv_handler.py:
   - Pull Pipeline Penny's CSV query path logic
   - Detect CSV-answerable questions (numeric aggregation, lookups)
   - Load CSVs from knowledge/csv/
   - Return structured answers with data source citation

5. Create api/vectorstore/index_manager.py:
   - get_index_status() → version, doc_count, chunk_count, last_built,
     size_bytes
   - needs_rebuild() → checks if any source files changed since last build
   - rebuild() → full re-index
   - add_document(path) → incremental add single doc

6. Update api/routes/chat.py:
   - Integrate searcher: query vector store, pass top results as context
     to LLM, get response with citations
   - Citation format: [Source: filename.md, Section: heading]
   - If CSV handler detects a data question, route to CSV path
   - Return sources[] in response with: file, section, relevance_score

7. Create scripts/vectorize.py:
   - CLI script: python scripts/vectorize.py [--full | --incremental]
   - Reads knowledge/ directory, builds index
   - Prints: docs processed, chunks created, time elapsed
   - Can be run standalone or called from Electron startup

8. Create src/components/KnowledgeTab.tsx:
   - File browser showing knowledge/ directory tree
   - Click file → opens in MarkdownViewer
   - Status bar: index version, doc count, chunk count, last built
   - "Rebuild Index" button (calls scripts/vectorize.py via IPC)
   - Filter by: core, industry, client, compliance

9. Create src/components/shared/MarkdownViewer.tsx:
   - Pull rendering logic from Pipeline Penny's Knowledge tab
   - Props: content, fileName, filePath, onClose
   - Renders: headings, code blocks, tables, links, bold/italic
   - No external markdown library if Pipeline Penny's inline parser
     works — otherwise use marked or react-markdown

10. Update Command Post:
    - After getting response from /chat, display citations below response
    - Citations are clickable — open source document in MarkdownViewer
    - Show model used and search result count
    - If no relevant knowledge found, say so clearly instead of hallucinating

11. Update documentation:
    - docs/developer-manual.md Section: "Knowledge Base System"
      Document: directory structure, chunking strategy, embedding pipeline,
      index versioning, search algorithm, citation format, CSV path
    - docs/developer-manual.md Section: "Adding Knowledge Documents"
      Document: file formats supported, naming conventions, where to put
      industry docs vs client docs, how to trigger re-index
    - docs/user-manual.md Section: "Knowledge Base"
      Document: how to browse documents, how citations work, how to add
      new documents, how to rebuild the index
    - docs/admin-guide.md Section: "Knowledge Management"
      Document: directory structure, adding client-specific docs, index
      maintenance, storage requirements

Constraints:
- Embedding model MUST go through the model adapter layer (Ollama adapter)
- Index files live in knowledge/.index/ (gitignored)
- Source documents are version-controlled; index files are NOT
- CSV handler must handle malformed CSVs gracefully (log warning, skip)
- Chunking must preserve section headings for citation accuracy
- Search must work offline (FAISS is local, Ollama embeddings are local)
- MarkdownViewer must be a shared component usable by any tab

Deliverables:
- knowledge/core/ — 6 TNDS markdown docs
- api/vectorstore/ — indexer, searcher, csv_handler, index_manager
- scripts/vectorize.py — CLI indexer
- src/components/KnowledgeTab.tsx — knowledge browser
- src/components/shared/MarkdownViewer.tsx — shared viewer
- Updated CommandPost.tsx — citations and knowledge integration
- Updated api/routes/chat.py — vector search integration
- Updated docs (developer-manual, user-manual, admin-guide)

Output:
python scripts/vectorize.py --full
→ "Indexed 6 documents, 342 chunks, completed in X.Xs"

npm start
→ Command Post: "What is the Direction Protocol?"
→ Response with cited answer referencing direction-protocol.md
→ Knowledge tab shows 6 docs, index status, clickable viewer

git add -A
git commit -m "phase-3: knowledge base — vectorstore, citations, knowledge tab, markdown viewer"
```

### Manual Test Checklist — Phase 3

- [ ] **Vectorization runs:** `python scripts/vectorize.py --full` completes without errors. Output shows doc count, chunk count, and timing.
- [ ] **Index files created:** `knowledge/.index/` directory contains FAISS index files and a version metadata file.
- [ ] **TNDS docs present:** `ls knowledge/core/` shows 6 markdown files. Open each — content is intact, not truncated.
- [ ] **Chat with citations:** In Command Post, ask "What is the Direction Protocol?" Response includes an answer AND at least one citation referencing `direction-protocol.md`.
- [ ] **Citation clickable:** Click a citation in Command Post. MarkdownViewer opens showing the source document scrolled to the relevant section.
- [ ] **Chat relevance:** Ask "What is the price of a Command Center Build?" Response references pricing information from the correct document.
- [ ] **Chat no-knowledge handling:** Ask "What is the capital of France?" Response does NOT hallucinate business knowledge — it either answers from general knowledge or says it couldn't find relevant documents.
- [ ] **CSV query path:** If a sample CSV exists in knowledge/csv/, ask a numeric question about it. Confirm structured data answer, not a hallucinated number.
- [ ] **Knowledge tab — file browser:** Knowledge tab shows directory tree. Core docs visible. Click a file — MarkdownViewer renders it with proper formatting (headings, code blocks, lists).
- [ ] **Knowledge tab — index status:** Status bar shows: index version, document count (6), chunk count (~342), last built timestamp.
- [ ] **Knowledge tab — rebuild:** Click "Rebuild Index" button. Progress indicator shows. Index rebuilds. Status bar updates.
- [ ] **Incremental index:** Add a new markdown file to `knowledge/core/test-doc.md`. Run `python scripts/vectorize.py --incremental`. Confirm chunk count increased. Ask a question about the new doc — it appears in results.
- [ ] **MarkdownViewer shared:** MarkdownViewer component is in `src/components/shared/`. It is NOT duplicated in KnowledgeTab or CommandPost.
- [ ] **Offline test:** Disconnect from internet. Stop any cloud API connections. Chat still works using Ollama for both embeddings and inference. Citations still work.
- [ ] **Documentation:** Developer manual has "Knowledge Base System" section explaining chunking, indexing, and search. User manual has "Knowledge Base" section explaining the tab.

---

## Phase 4 — Multi-Model Adapter Layer

### Goal

Complete all model adapters (OpenAI, Gemini, DeepSeek, Qwen) so the platform can switch between any supported LLM. Includes the model comparison feature and prompt-model compatibility testing.

### What to Pull from Pipeline Penny

- Nothing directly — Phase 1 already extracted the adapter pattern. This phase builds on that.

### What to Build New

- Complete implementations for: openai_adapter.py, gemini_adapter.py, deepseek_adapter.py, qwen_adapter.py
- Model comparison endpoint
- ModelSwitcher enhancements with status monitoring

### Prompt

```
Role: Senior Python engineer implementing LLM provider adapters for a
multi-model platform.

Context:
You are completing the model adapter layer for PipelineX. Phase 1 created
the base adapter interface and functional adapters for Claude and Ollama.
Stub adapters exist for OpenAI, Gemini, DeepSeek, and Qwen.

The adapter interface (api/models/base_adapter.py) requires:
- async complete(prompt, system_prompt?, temperature?, max_tokens?) → ModelResponse
- async stream(prompt, system_prompt?, temperature?, max_tokens?) → AsyncGenerator
- async health_check() → bool
- get_cost(input_tokens, output_tokens) → float

Each adapter reads its config from config/models/{provider}.json and its
API key from environment variables.

Task:
1. Implement api/models/openai_adapter.py:
   - OpenAI API (gpt-4o, gpt-4o-mini)
   - Streaming support via SSE
   - Function calling support (for future skill integration)
   - Proper error handling: rate limits (429), auth errors (401),
     context length errors (400)
   - Cost calculation from config

2. Implement api/models/gemini_adapter.py:
   - Google Generative AI SDK
   - Models: gemini-pro, gemini-flash
   - Streaming support
   - Safety settings passthrough
   - Handle Gemini-specific quota errors

3. Implement api/models/deepseek_adapter.py:
   - DeepSeek API (compatible with OpenAI SDK format)
   - Models: deepseek-chat, deepseek-reasoner
   - Streaming support
   - Cost tracking (DeepSeek is significantly cheaper)

4. Implement api/models/qwen_adapter.py:
   - Qwen via Ollama (local) OR DashScope API (cloud)
   - Adapter detects: if model running in Ollama, use Ollama adapter
     as backend; if not, use DashScope API
   - Models: qwen2.5, qwen2.5-coder

5. Update api/models/router.py:
   - Add model comparison endpoint support
   - Route by capability: some models better for code, some for analysis
   - Add "cost-optimized" routing mode that picks cheapest available model
   - Add "quality-optimized" mode that picks best model for task type
   - Routing preferences configurable in pipelinex.config.json

6. Create api/routes/models.py enhancements:
   - POST /models/compare → send same prompt to 2-3 models, return
     side-by-side responses with timing and cost
   - GET /models/{id}/benchmark → run standard test prompt, return
     latency, token speed, quality score (1-5 based on response coherence)

7. Update src/components/ModelSwitcher.tsx:
   - Real-time status polling (every 30s)
   - Model info tooltip: provider, cost, speed, capabilities
   - "Compare Models" button opens comparison panel
   - Comparison panel: pick 2-3 models, enter prompt, see side-by-side

8. Update documentation:
   - docs/developer-manual.md Section: "Model Adapters"
     Document: how each adapter works, configuration required, how to
     add a new provider adapter, error handling patterns
   - docs/developer-manual.md Section: "Model Router"
     Document: routing logic, fallback chains, cost vs quality modes
   - docs/admin-guide.md Section: "Adding API Keys"
     Document: per-provider setup instructions with links to API
     key pages, .env variable names, testing connectivity
   - docs/user-manual.md Section: "Using Different AI Models"
     Document: what models are available, how to switch, what each
     is good at, cost implications

Constraints:
- All adapters MUST implement the same interface — no provider-specific
  methods leaking into consuming code
- API keys MUST come from environment variables, never hardcoded
- Failed API calls MUST return structured errors, never raw exceptions
- Streaming MUST be optional — callers can use complete() for non-streaming
- Cost tracker MUST be updated for every call regardless of adapter
- Rate limiting: implement client-side rate limiting per provider
- Timeout: 60s for complete(), 120s for stream(), configurable per model

Deliverables:
- 4 completed model adapters (openai, gemini, deepseek, qwen)
- Enhanced model router with cost/quality modes
- Model comparison endpoint and UI
- Updated ModelSwitcher with real-time status and comparison
- Updated docs (developer-manual, admin-guide, user-manual)

Output:
# Test each adapter (requires respective API keys)
curl -X POST http://localhost:8000/chat -d '{"query":"Hello","model_override":"gpt-4o"}'
curl -X POST http://localhost:8000/chat -d '{"query":"Hello","model_override":"gemini-pro"}'
curl -X POST http://localhost:8000/chat -d '{"query":"Hello","model_override":"deepseek-chat"}'

# Test model comparison
curl -X POST http://localhost:8000/models/compare -d '{"prompt":"Explain PipelineX","models":["claude-sonnet","gpt-4o"]}'

git add -A
git commit -m "phase-4: complete model adapters — openai, gemini, deepseek, qwen + comparison"
```

### Manual Test Checklist — Phase 4

- [ ] **OpenAI adapter:** Set OPENAI_API_KEY. `POST /chat` with model_override "gpt-4o" returns response. Cost tracked.
- [ ] **Gemini adapter:** Set GEMINI_API_KEY. `POST /chat` with model_override "gemini-pro" returns response. Cost tracked.
- [ ] **DeepSeek adapter:** Set DEEPSEEK_API_KEY. `POST /chat` with model_override "deepseek-chat" returns response. Cost shows DeepSeek's lower pricing.
- [ ] **Qwen via Ollama:** Pull qwen2.5 in Ollama. `POST /chat` with model_override "qwen2.5" returns response via local Ollama.
- [ ] **Model comparison:** `POST /models/compare` with 2 models returns side-by-side responses with timing and cost for each.
- [ ] **Fallback chain:** Set primary model to one that will fail (wrong API key). Confirm router falls back to next model in chain. Response includes `model_used` showing the fallback model.
- [ ] **Cost-optimized routing:** Set routing mode to "cost-optimized" in config. Send a query. Confirm cheapest available model was selected.
- [ ] **Missing API key handling:** Remove an API key from .env. `GET /models` still lists the model but status shows "unconfigured". Attempting to use it returns helpful error: "API key not set for {provider}. Set {ENV_VAR} in .env".
- [ ] **Rate limiting:** Send 10 rapid requests to the same provider. Confirm client-side rate limiting kicks in — requests are queued, not rejected.
- [ ] **ModelSwitcher UI:** In app, ModelSwitcher shows all models with real-time status (green/red/yellow dots). Click model shows info tooltip.
- [ ] **Comparison panel:** Click "Compare Models" in Settings. Select 2 models. Enter prompt. See side-by-side results with timing/cost.
- [ ] **Documentation:** Admin guide has per-provider setup instructions. User manual explains model selection.

---

## Phase 5 — Memory System

### Goal

Build the persistent memory system that allows PipelineX to remember context across sessions: user preferences, conversation history, tool catalog, agent catalog, and entity memory.

### What to Pull from Pipeline Penny

- Nothing — Pipeline Penny has no memory system. This is entirely new.

### What to Build New

- `api/memory/memory_store.py` — SQLite-backed persistent storage
- `api/memory/memory_index.py` — FAISS index over memory entries for semantic recall
- `api/memory/memory_types.py` — type definitions for memory categories
- `memory/store/` — SQLite database files
- `memory/index/` — memory-specific FAISS index
- `memory/types/` — type configuration
- `memory/tools-catalog.json` — tool registry
- `memory/agents-catalog.json` — agent type registry
- `api/routes/memory.py` — complete implementation
- `src/components/MemoryTab.tsx` — memory browser and management

### Prompt

```
Role: Senior Python engineer building a persistent memory system for a
desktop LLM platform.

Context:
You are building the memory system for PipelineX. The platform currently
has no memory — every conversation starts fresh. The memory system will:
1. Remember user preferences and conversation context across sessions
2. Maintain a catalog of tools the system knows about
3. Maintain a catalog of agent types and their capabilities
4. Store entity memory (people, companies, projects mentioned)
5. Enable any agent or skill to query memory for relevant context

Memory is stored locally on the user's machine (SQLite + FAISS). In cloud
deployment (Phase 13), this migrates to PostgreSQL + pgvector.

Task:
1. Create api/memory/memory_types.py:
   - Enum MemoryType: EPISODIC (conversations), SEMANTIC (facts),
     PROCEDURAL (how-to), TOOL (capabilities), ENTITY (people/places),
     PREFERENCE (user settings)
   - Dataclass MemoryEntry: id, type, content, metadata{}, created_at,
     accessed_at, access_count, relevance_score, source (which
     conversation/skill created it), tags[]
   - Dataclass ToolEntry: id, name, description, when_to_use, api_endpoint,
     auth_method, provider, category, documentation_url
   - Dataclass AgentEntry: id, name, type, description, capabilities[],
     limitations[], preferred_model, best_for[], configuration{}

2. Create api/memory/memory_store.py:
   - SQLite database at memory/store/pipelinex_memory.db
   - Tables: memories, tools, agents, conversations, preferences
   - CRUD operations for each table
   - store(entry: MemoryEntry) → id
   - recall(query, type_filter?, top_k=5) → list[MemoryEntry]
   - forget(id) → bool (soft delete with tombstone)
   - update_relevance(id, new_score) → updates based on access patterns
   - get_recent(type, limit=10) → most recent entries by type
   - search_by_tags(tags[]) → matching entries
   - Automatic relevance decay: entries accessed less frequently lose score
   - Conversation history: store full exchanges with timestamps

3. Create api/memory/memory_index.py:
   - FAISS index over memory entry content for semantic search
   - Index updates happen async after store operations
   - search(query_embedding, top_k, type_filter?) → memory IDs with scores
   - Rebuild index from SQLite on startup (if index file missing)
   - Index saved to memory/index/

4. Create memory/tools-catalog.json:
   - Pre-populated catalog of tools PipelineX knows about:
     * Ollama — local model serving
     * Claude API — Anthropic inference
     * OpenAI API — GPT inference
     * Gemini API — Google inference
     * FAISS — vector similarity search
     * FastAPI — backend framework
     * Electron — desktop framework
     * HubSpot API — CRM integration
     * Fleetio API — fleet management
     * QuickBooks API — accounting
     * Google Workspace APIs — docs, sheets, drive
     * Zapier — workflow automation
     * Make (Integromat) — workflow automation
   - Each entry: name, description, when_to_use, api_endpoint_pattern,
     auth_method, documentation_url, category (inference/storage/
     integration/automation)

5. Create memory/agents-catalog.json:
   - Pre-populated catalog of agent types:
     * Researcher — finds and synthesizes information, best for open-ended
       questions, uses web search + knowledge base
     * Executor — runs workflows and SOPs, follows step-by-step procedures,
       requires approval at decision points
     * Reviewer — validates outputs against requirements, checks compliance,
       scores quality
     * Coordinator — orchestrates multi-agent workflows, delegates tasks,
       tracks progress
     * Specialist — deep domain expertise (one per industry), uses
       industry-specific knowledge packs
     * Analyst — data analysis, trend detection, report generation,
       works with CSV/structured data
   - Each entry: name, type, description, capabilities[], limitations[],
     preferred_model, best_for[], configuration{}

6. Implement api/routes/memory.py (replace stub from Phase 1):
   - GET /memory → list recent memories with pagination and type filter
   - GET /memory/{id} → single memory entry
   - POST /memory → store new memory entry
   - PUT /memory/{id} → update memory entry
   - DELETE /memory/{id} → soft delete (tombstone)
   - GET /memory/search?q={query}&type={type} → semantic search
   - GET /memory/tools → list tools catalog
   - GET /memory/agents → list agent catalog
   - GET /memory/preferences → user preference entries
   - POST /memory/preferences → store user preference
   - GET /memory/stats → total entries by type, index size, db size

7. Wire memory into chat pipeline:
   - Before sending query to LLM, search memory for relevant context
   - Inject relevant memories into system prompt as context
   - After receiving response, extract and store notable entities
   - Store conversation exchange in episodic memory
   - Update tool/agent access counts when referenced

8. Create src/components/MemoryTab.tsx:
   - Memory browser: list entries by type with search
   - Entry detail view: content, metadata, access history
   - Tools catalog viewer: browse tools with descriptions
   - Agents catalog viewer: browse agent types with capabilities
   - Preference editor: view and edit stored preferences
   - Memory stats: entry count by type, database size, index size
   - "Clear Memory" button with confirmation (soft deletes all)
   - "Export Memory" button → exports to JSON backup
   - "Import Memory" button → imports from JSON backup

9. Update documentation:
   - docs/developer-manual.md Section: "Memory System"
     Document: architecture (SQLite + FAISS), memory types, store/recall
     API, how memory integrates with chat pipeline, how to add new
     memory types, tools catalog schema, agents catalog schema
   - docs/user-manual.md Section: "Memory"
     Document: what the platform remembers, how to view memories, how to
     clear memory, how to export/import, privacy implications
   - docs/admin-guide.md Section: "Memory Management"
     Document: database location, backup procedures, storage requirements,
     how to clear client memory, migration to cloud

Constraints:
- Memory is LOCAL only — never sent to external services
- Soft delete only — hard delete only via admin tool
- Memory search must not block chat responses (async, timeout 500ms)
- SQLite must handle concurrent reads (WAL mode)
- Memory index rebuild must not block app startup (background task)
- Tools and agents catalogs are read-only from the UI (editable via
  JSON files only)
- Export format must be importable on another PipelineX install
- Memory entries must never contain raw API keys or secrets

Deliverables:
- api/memory/ — memory_store, memory_index, memory_types
- memory/store/ — SQLite schema and initialization
- memory/tools-catalog.json — pre-populated tool registry
- memory/agents-catalog.json — pre-populated agent registry
- api/routes/memory.py — complete API implementation
- src/components/MemoryTab.tsx — memory browser and management
- Chat pipeline integration (memory-augmented responses)
- Updated docs (developer-manual, user-manual, admin-guide)

Output:
# Store a memory
curl -X POST http://localhost:8000/memory -d '{"type":"SEMANTIC","content":"Jacob prefers direct communication","tags":["preference","style"]}'

# Search memory
curl http://localhost:8000/memory/search?q=communication+style

# Get tools catalog
curl http://localhost:8000/memory/tools

# Chat with memory context
curl -X POST http://localhost:8000/chat -d '{"query":"How should I communicate with this client?"}'
→ Response should reference the stored communication preference

git add -A
git commit -m "phase-5: memory system — SQLite store, FAISS index, tools/agents catalogs, memory tab"
```

### Manual Test Checklist — Phase 5

- [ ] **Database created:** After first server start, `memory/store/pipelinex_memory.db` exists. SQLite file is valid.
- [ ] **Store memory:** `POST /memory` with a semantic entry returns 201 with an ID.
- [ ] **Recall memory:** `GET /memory/{id}` returns the stored entry with all fields.
- [ ] **Search memory:** Store 5 entries with different content. `GET /memory/search?q={related term}` returns the most relevant entries ranked by score.
- [ ] **Type filtering:** `GET /memory?type=SEMANTIC` returns only semantic entries. `GET /memory?type=TOOL` returns only tool entries.
- [ ] **Memory in chat:** Store a fact ("The client's budget is $50,000"). Ask a question about the client's budget. Response references the stored fact.
- [ ] **Conversation memory:** Have a 3-message conversation. `GET /memory?type=EPISODIC` shows conversation entries.
- [ ] **Tools catalog:** `GET /memory/tools` returns 13+ tool entries. Each has: name, description, when_to_use.
- [ ] **Agents catalog:** `GET /memory/agents` returns 6 agent type entries. Each has: name, capabilities, best_for.
- [ ] **Memory Tab — browser:** MemoryTab shows entries grouped by type. Click an entry to see detail view.
- [ ] **Memory Tab — tools viewer:** Browse tools catalog. Each tool shows description and documentation link.
- [ ] **Memory Tab — export:** Click Export. JSON file downloads with all memory entries.
- [ ] **Memory Tab — import:** Click Import with a previously exported JSON. Entries restored.
- [ ] **Memory Tab — clear:** Click Clear Memory with confirmation. All entries soft-deleted. Stats show 0 active entries.
- [ ] **Relevance decay:** Store an entry. Don't access it for multiple sessions. Its relevance_score should decrease. Access it — score increases.
- [ ] **No secrets in memory:** `grep -r "API_KEY\|sk-\|key_" memory/store/` returns nothing.
- [ ] **Documentation:** Developer manual has "Memory System" section with architecture diagram. User manual has "Memory" section explaining privacy.

---

## Phase 6 — Skill Package System

### Goal

Build the complete skill package system: registry, router, executor, testing framework, and UI. Pull and refactor Pipeline Penny's working bearing-check skill and skill router.

### What to Pull from Pipeline Penny

- `skills/bearing-check/` → copy entire directory
- `skills/registry.json` → copy and update to new schema
- `knowledge/agent/skill_router.py` → refactor into `api/agents/skill_agent.py`

### What to Build New

- `api/agents/skill_agent.py` — skill detection, routing, execution
- `skills/prompt-tester/` — new skill for multi-model prompt testing
- `skills/form-builder/` — new skill for form generation
- Skill testing framework in `scripts/testing/skill_tests.py`
- `src/components/SkillsTab.tsx` — skill browser, runner, and test interface

### Prompt

```
Role: Senior Python engineer building a governed skill execution system
for a desktop LLM platform.

Context:
You are building the skill package system for PipelineX. Pipeline Penny
has a working skill system with one installed skill (bearing-check) and
a skill router with contract enforcement.

Pipeline Penny's skill source:
- <REPO_ROOT>\Desktop\pipeline_penny\skills\bearing-check\ (SKILL.md,
  contract.json, system.prompt)
- <REPO_ROOT>\Desktop\pipeline_penny\skills\registry.json
- <REPO_ROOT>\Desktop\pipeline_penny\knowledge\agent\skill_router.py

The skill router in Pipeline Penny works but has these issues:
1. Path resolution uses fragile parents[2] assumption
2. Trigger matching is unspecified (substring vs regex vs semantic)
3. Error propagation is unclear (does skill_error fall through?)
4. No test runner or validation framework

Task:
1. Copy Pipeline Penny's skills/bearing-check/ to new project. Verify
   SKILL.md, contract.json, and system.prompt are intact and complete.

2. Copy and update skills/registry.json:
   - Add schema_version field
   - Add version field per skill entry
   - Add "dependencies" array per skill
   - Add "compatible_models" array per skill
   - Add "enabled" boolean per skill (for toggle system)
   - bearing-check should be the only registered skill

3. Refactor skill_router.py into api/agents/skill_agent.py:
   - Use config-based path resolution (not parents[2])
   - Implement trigger matching: keyword exact match first, then
     substring match, with confidence score
   - skill_mode options: "auto" (detect from query), "force" (use
     specified skill), "off" (skip skills)
   - On skill error: return skill_error response, log stack trace,
     NEVER fall through silently to RAG
   - Contract enforcement: validate required sections in response,
     strip forbidden phrases, add warnings
   - Return: { response, skill_used, confidence, processing_ms,
     warnings[], contract_violations[] }

4. Create skills/prompt-tester/ (new skill):
   - SKILL.md: description, triggers ("test this prompt", "compare
     prompts", "prompt test", "how does this prompt perform")
   - contract.json: input (prompt text, models to test), output
     (comparison table, scores, recommendations)
   - system.prompt: instructions for running a prompt across multiple
     models and scoring the outputs on: relevance, accuracy, format
     compliance, creativity, safety
   - Execution: takes a prompt, runs it against 2-3 models (using
     model adapter layer), scores each response, returns comparison

5. Create skills/form-builder/ (new skill):
   - SKILL.md: description, triggers ("create a form", "build a
     checklist", "make an intake form", "inspection form")
   - contract.json: input (form description, field requirements),
     output (structured form JSON, printable markdown version)
   - system.prompt: instructions for generating form structures with
     field types, validation rules, conditional logic
   - Execution: generates form schema (JSON) + printable version (MD)

6. Create scripts/testing/skill_tests.py:
   - Test framework for skill validation
   - For each registered skill, verify:
     a. All required files exist (SKILL.md, contract.json, system.prompt)
     b. contract.json is valid JSON with required fields
     c. Trigger patterns are parseable
     d. system.prompt is non-empty
     e. Run a test query and verify response matches contract schema
   - Output: PASS/FAIL per skill per test, summary table
   - Can be run: python scripts/testing/skill_tests.py [--skill=name]

7. Create src/components/SkillsTab.tsx:
   - Skill browser: list registered skills with status (enabled/disabled)
   - Skill detail: click to see SKILL.md rendered in MarkdownViewer
   - Skill runner: select a skill, enter input, execute, see output
   - Skill test runner: button to run skill_tests.py, display results
   - Toggle skill enabled/disabled (updates registry.json)
   - Contract viewer: show contract.json in formatted view

8. Update api/routes/skills.py (replace stub):
   - GET /skills → list registered skills with status
   - GET /skills/{name} → skill detail (SKILL.md content, contract)
   - POST /skills/execute → run a specific skill with input
   - POST /skills/test → run test suite for a skill
   - PUT /skills/{name}/toggle → enable/disable skill

9. Update chat pipeline:
   - If skill_mode is "auto", check query against skill triggers
   - If confidence > threshold (0.7), route to skill instead of RAG
   - Include skill output in response with skill attribution
   - If skill_mode is "force", bypass confidence check

10. Update documentation:
    - docs/developer-manual.md Section: "Skill System"
      Document: skill package contract (required files, naming, schema),
      how to create a new skill, trigger matching algorithm, contract
      enforcement, error handling, testing framework
    - docs/developer-manual.md Section: "Skill Development Guide"
      Document: step-by-step guide to creating a new skill with examples,
      SKILL.md template, contract.json template, system.prompt template,
      testing checklist
    - docs/user-manual.md Section: "Skills"
      Document: what skills are, how to browse them, how to run a skill
      manually, how to toggle skills, how skills integrate with chat
    - docs/admin-guide.md Section: "Skill Management"
      Document: how to install new skills, how to disable skills per
      client, how to update skills, testing after changes

Constraints:
- Every skill MUST have all required files or it fails registration
- Skill execution errors MUST return skill_error, never crash the app
- Skill router MUST use config paths, not relative path assumptions
- Registry.json is the single source of truth for installed skills
- Skills MUST declare their compatible models — if active model isn't
  compatible, warn and suggest switching
- Trigger matching MUST have a confidence threshold — no false positives
- Test framework MUST be runnable from CLI and from UI

Deliverables:
- skills/bearing-check/ — migrated from Pipeline Penny
- skills/prompt-tester/ — new skill
- skills/form-builder/ — new skill
- skills/registry.json — updated schema
- api/agents/skill_agent.py — refactored skill router
- api/routes/skills.py — complete API
- scripts/testing/skill_tests.py — test framework
- src/components/SkillsTab.tsx — skill browser and runner
- Updated docs (developer-manual, user-manual, admin-guide)

Output:
python scripts/testing/skill_tests.py
→ bearing-check: 5/5 PASS
→ prompt-tester: 5/5 PASS
→ form-builder: 5/5 PASS

npm start
→ Skills tab shows 3 skills
→ Run bearing-check with "Should I invest in Bitcoin?" → structured analysis
→ Run prompt-tester with a prompt → multi-model comparison
→ Run form-builder with "client intake form" → form JSON + markdown

git add -A
git commit -m "phase-6: skill system — router, bearing-check, prompt-tester, form-builder, test framework"
```

### Manual Test Checklist — Phase 6

- [ ] **Skill test suite passes:** `python scripts/testing/skill_tests.py` shows all skills passing all tests.
- [ ] **bearing-check works:** In Skills tab, run bearing-check with "Should I hire a marketing agency?" Returns structured 8-checkpoint analysis.
- [ ] **prompt-tester works:** Run prompt-tester with a prompt and 2 models. Returns side-by-side comparison with scores.
- [ ] **form-builder works:** Run form-builder with "Create a new client intake form for a real estate agent." Returns form schema JSON and printable markdown.
- [ ] **Auto-detection in chat:** In Command Post, type "Should I switch to a new CRM?" with skill_mode "auto". Skill agent detects bearing-check trigger, routes to skill, returns attributed output.
- [ ] **Skills tab — browser:** Shows 3 skills. Each shows: name, description, enabled/disabled, compatible models.
- [ ] **Skills tab — detail:** Click bearing-check. SKILL.md renders in MarkdownViewer. Contract shows input/output schema.
- [ ] **Skills tab — toggle:** Disable form-builder. "Create a form" query in Command Post goes to RAG, not skill. Re-enable — skill activates.
- [ ] **Skill error handling:** Temporarily break a skill's system.prompt (rename file). Run skill. Confirm skill_error response, not app crash.
- [ ] **Contract enforcement:** If bearing-check response is missing a required section, confirm warning appears in output.
- [ ] **Registry integrity:** Open skills/registry.json. Confirm each skill has: name, version, enabled, dependencies, compatible_models, triggers.
- [ ] **Documentation:** Developer manual has "Skill Development Guide" with templates. User manual has "Skills" section.

---

## Phase 7 — Prompt Library & Scaffold System

### Goal

Build the organized prompt library with system prompts, templates, testing suites, industry-specific prompts, and prompt scaffolding patterns (chain-of-thought, ReAct, few-shot).

### What to Pull from Pipeline Penny

- `prompts/` directory contents → copy relevant prompts, discard outdated ones

### What to Build New

- Organized prompt library structure
- Prompt scaffold patterns
- Prompt testing system
- `src/components/PromptsTab.tsx`

### Prompt

```
Role: Senior prompt engineer building a governed prompt library and
scaffolding system for a multi-model LLM platform.

Context:
You are building the prompt management system for PipelineX. The platform
supports multiple LLM providers and needs organized, testable, versioned
prompts.

Pipeline Penny has some prompts in <REPO_ROOT>\Desktop\pipeline_penny\prompts\
but they are loosely organized. Pull what is useful, build the rest new.

Task:
1. Audit Pipeline Penny's prompts/ directory. For each file:
   - If it's a working system prompt → copy to prompts/system/
   - If it's a template → copy to prompts/templates/
   - If it's outdated or references Lenny → discard

2. Create prompts/system/:
   - qa.md — system prompt for knowledge-based Q&A with citations
   - skill-executor.md — system prompt for skill execution with
     contract enforcement
   - sop-runner.md — system prompt for SOP step execution
   - template-generator.md — system prompt for document generation
   - analyst.md — system prompt for data analysis and reporting
   - Each must include: role definition, behavioral constraints,
     output format requirements, citation rules, safety guardrails

3. Create prompts/templates/:
   - proposal-intro.md — {{client_name}}, {{industry}}, {{pain_points}}
   - meeting-summary.md — {{date}}, {{attendees}}, {{action_items}}
   - status-report.md — {{project_name}}, {{period}}, {{metrics}}
   - client-email.md — {{recipient}}, {{subject}}, {{context}}
   - compliance-check.md — {{regulation}}, {{process}}, {{findings}}
   - Each template must have: YAML frontmatter with variable definitions,
     required variables, optional variables, example filled version

4. Create prompts/scaffolds/:
   - chain-of-thought.md — step-by-step reasoning scaffold with examples
   - react-pattern.md — Reasoning + Acting pattern for tool-using tasks
   - few-shot-library.md — collection of few-shot examples by task type
   - tree-of-thought.md — branching exploration for complex problems
   - structured-output.md — JSON/schema-constrained output patterns
   - self-consistency.md — multiple reasoning paths with voting
   - Each scaffold: description, when to use, when NOT to use, template
     with slots, 2-3 examples, model compatibility notes

5. Create prompts/testing/:
   - test-suite-qa.json — 10 Q&A test cases with expected output patterns
   - test-suite-skills.json — 5 test cases per skill
   - test-suite-templates.json — 3 test cases per template
   - Test case format: { input, expected_patterns[], forbidden_patterns[],
     model, max_tokens, pass_criteria }

6. Create prompts/industry/ (stubs for Phase 11):
   - real-estate/ — README.md with planned prompts
   - fleet-asset/ — README.md with planned prompts
   - govcon/ — README.md with planned prompts

7. Create scripts/testing/prompt_tests.py:
   - Load test suites from prompts/testing/
   - For each test case: send prompt to specified model, check response
     against expected_patterns and forbidden_patterns
   - Report: PASS/FAIL per test, response time, token usage
   - Summary: pass rate, average latency, total cost

8. Create src/components/PromptsTab.tsx:
   - Prompt browser: organized by category (system, templates, scaffolds)
   - Click prompt → view in MarkdownViewer
   - Template filler: select template, fill variables, preview, copy/execute
   - Scaffold picker: select scaffold, paste user prompt, generate
     scaffolded prompt, copy/execute
   - Test runner: select test suite, run, display results
   - Prompt editor: create/edit prompts with live preview (save to
     prompts/ directory)

9. Update api/routes/ with prompt endpoints:
   - GET /prompts → list all prompts by category
   - GET /prompts/{category}/{name} → single prompt content
   - POST /prompts/fill-template → fill template variables and return
   - POST /prompts/scaffold → apply scaffold pattern to user prompt
   - POST /prompts/test → run test suite

10. Update documentation:
    - docs/developer-manual.md Section: "Prompt System"
      Document: prompt library structure, template variable syntax,
      scaffold patterns, how to add prompts, testing framework
    - docs/user-manual.md Section: "Prompts & Templates"
      Document: how to browse prompts, how to fill templates, how to
      use scaffolds, how to test prompts
    - docs/admin-guide.md Section: "Prompt Management"
      Document: adding custom prompts per client, industry prompt packs

Constraints:
- All prompts in markdown format with YAML frontmatter
- Template variables use {{double_curly}} syntax
- Every system prompt must include safety guardrails section
- Prompt tests must be deterministic where possible (check patterns,
  not exact text)
- Scaffolds must be model-agnostic (work with any supported model)
- Industry prompt stubs are placeholders only — content in Phase 11

Deliverables:
- prompts/system/ — 5 system prompts
- prompts/templates/ — 5 templates with variable support
- prompts/scaffolds/ — 6 scaffold patterns
- prompts/testing/ — test suites
- prompts/industry/ — stubs
- scripts/testing/prompt_tests.py
- src/components/PromptsTab.tsx
- API routes for prompts
- Updated docs

Output:
python scripts/testing/prompt_tests.py
→ QA tests: 9/10 PASS, Skills tests: 14/15 PASS

npm start → Prompts tab shows organized library, template filler works

git add -A
git commit -m "phase-7: prompt library — system prompts, templates, scaffolds, testing framework"
```

### Manual Test Checklist — Phase 7

- [ ] **Prompt test suite runs:** `python scripts/testing/prompt_tests.py` completes with >80% pass rate.
- [ ] **System prompts exist:** `prompts/system/` contains 5 .md files. Each has YAML frontmatter and safety guardrails section.
- [ ] **Templates have variables:** Open `prompts/templates/proposal-intro.md`. Contains {{client_name}} and other variables. Frontmatter lists all variables with types and required/optional.
- [ ] **Scaffolds documented:** Open `prompts/scaffolds/chain-of-thought.md`. Contains: description, when to use, template, examples, model compatibility.
- [ ] **Prompts Tab — browser:** Shows prompts organized by: System, Templates, Scaffolds. Click any prompt → renders in MarkdownViewer.
- [ ] **Template filler:** Select proposal-intro template. Form appears with variable inputs. Fill variables. Preview shows filled template. Copy button works.
- [ ] **Template execution:** Fill template, click Execute. Sends filled prompt to active model. Response appears.
- [ ] **Scaffold picker:** Select chain-of-thought scaffold. Paste a question. See scaffolded prompt. Execute against active model.
- [ ] **Prompt editor:** Create a new prompt via editor. Save. Confirm file appears in prompts/ directory. Shows up in browser.
- [ ] **Documentation:** Developer manual has "Prompt System" section. User manual has "Prompts & Templates" section.

---

## Phase 8 — Template Engine

### Goal

Build the document template system for generating proposals, reports, checklists, and other business documents from templates combined with knowledge base and user input.

### What to Pull from Pipeline Penny

- Template routing logic from `knowledge/agent/api.py`
- Any existing template files from `prompts/` that are actually templates

### What to Build New

- `api/routes/templates.py` — complete implementation
- Template processing engine
- `src/components/TemplatesTab.tsx`
- TNDS proposal templates
- `templates/` directory population

### Prompt

```
Role: Senior backend engineer building a document template engine for a
governed knowledge platform.

Context:
PipelineX needs to generate professional documents: proposals, reports,
checklists, compliance audits, and onboarding packets. Templates combine
structured slots with knowledge base content and LLM-generated text.

Pipeline Penny has basic template routing in its chat endpoint. Pull the
routing pattern but build the engine properly from scratch.

Task:
1. Create template engine in api (new module or utils):
   - Load templates from templates/ directory
   - Variable substitution: {{variable}} → value from input
   - Knowledge injection: {{KB:query}} → runs knowledge search, injects
     top result
   - LLM generation: {{GEN:instruction}} → runs instruction through
     active model, injects response
   - Conditional sections: {{IF:condition}}...{{ENDIF}}
   - Loop sections: {{FOREACH:list}}...{{ENDFOREACH}}
   - Output formats: markdown (default), plain text

2. Populate templates/:
   - templates/proposals/command-center-build.md — TNDS proposal
   - templates/proposals/battle-rhythm-install.md — TNDS proposal
   - templates/proposals/command-partner.md — TNDS proposal
   - templates/onboarding/client-welcome.md — welcome packet
   - templates/onboarding/intake-checklist.md — intake form
   - templates/sops/new-client-sop.md — step-by-step onboarding SOP
   - templates/forms/inspection-checklist.md — generic inspection form
   - templates/reports/weekly-ops.md — weekly operations summary

3. Implement api/routes/templates.py (replace stub):
   - GET /templates → list templates by category
   - GET /templates/{category}/{name} → template content with variable list
   - POST /templates/generate → fill template with inputs + KB + LLM,
     return generated document
   - POST /templates/preview → fill template, return without LLM generation
     (faster, for previewing structure)

4. Create src/components/TemplatesTab.tsx:
   - Template browser by category
   - Template preview (raw markdown with variables highlighted)
   - Template filler: form for required variables, optional variables
   - Generate button: calls /templates/generate, shows loading, displays
     result in MarkdownViewer
   - Download button: save generated document as .md file
   - Template editor: create/edit templates (for admin users)

5. Update documentation:
   - docs/developer-manual.md Section: "Template Engine"
   - docs/user-manual.md Section: "Templates"
   - docs/admin-guide.md Section: "Template Management"

Constraints:
- Templates are markdown files with YAML frontmatter
- Variable syntax must not conflict with markdown formatting
- Knowledge injection must respect the same citation rules as chat
- LLM generation sections must go through the model adapter layer
- Generated documents must be reproducible (same inputs → same structure)
- Templates must work offline (skip {{GEN:}} sections, fill rest)

Deliverables:
- Template processing engine
- 8 populated templates
- api/routes/templates.py — complete implementation
- src/components/TemplatesTab.tsx
- Updated docs

Output:
POST /templates/generate with command-center-build template + client inputs
→ Returns filled proposal document with KB citations and LLM-generated sections

git add -A
git commit -m "phase-8: template engine — processing, TNDS templates, generator, template tab"
```

### Manual Test Checklist — Phase 8

- [ ] **Templates present:** `templates/` has 8+ template files across proposals/, onboarding/, sops/, forms/, reports/.
- [ ] **Variable extraction:** `GET /templates/proposals/command-center-build` returns template content AND a list of required variables.
- [ ] **Template generation:** `POST /templates/generate` with template name and variable values returns a complete filled document.
- [ ] **Knowledge injection:** Template with {{KB:Direction Protocol}} generates with actual knowledge base content injected, with citations.
- [ ] **LLM generation:** Template with {{GEN:Write an executive summary}} generates with model-generated text. Response shows which model was used.
- [ ] **Preview without LLM:** `POST /templates/preview` returns quickly with variables filled but {{GEN:}} sections showing placeholders.
- [ ] **Templates Tab:** Browse templates by category. Click to preview. Fill variables. Generate. View in MarkdownViewer. Download as .md.
- [ ] **Offline mode:** Disconnect internet. Generate a template without {{GEN:}} sections — works. Generate with {{GEN:}} using local Ollama — works.
- [ ] **Documentation:** All three manual sections updated for templates.

---

## Phase 9 — Workflow & SOP Execution Engine

### Goal

Build the workflow execution engine that runs multi-step SOPs with approvals, branching, retries, form generation, checklist tracking, and audit trails.

### What to Pull from Pipeline Penny

- `knowledge/agent/workflows/new_client_onboarding.v1.json` → copy and update
- SOP execution logic from Pipeline Penny → refactor into `api/workflows/`

### What to Build New

- `api/workflows/executor.py` — workflow state machine
- `api/workflows/step_runner.py` — individual step execution
- `api/workflows/approval_handler.py` — approval gates
- `api/routes/sops.py` — complete implementation
- `src/components/SOPsTab.tsx` — SOP browser and runner
- Additional SOP definitions

### Prompt

```
Role: Senior Python engineer building a workflow execution engine with
approval gates, branching logic, and audit trails.

Context:
PipelineX needs to execute SOPs (Standard Operating Procedures) as
multi-step workflows. Pipeline Penny has a working v1 of this with the
new client onboarding workflow.

Pipeline Penny's workflow source:
- knowledge/agent/workflows/new_client_onboarding.v1.json (workflow definition)
- SOP execution logic scattered in api.py and claude_agent.py

The v1 works for linear workflows. PipelineX needs:
- Branching (if/else based on step results)
- Parallel steps
- Form generation at steps requiring user input
- Checklist tracking within steps
- Retry with backoff on failures
- Full audit trail

Task:
1. Create api/workflows/executor.py:
   - Workflow state machine: PENDING → RUNNING → step states →
     COMPLETED | FAILED | PAUSED (waiting for approval)
   - Load workflow definition from JSON
   - Execute steps sequentially or in parallel based on definition
   - Handle branching: evaluate conditions, take correct path
   - Persist state to SQLite (resume after app restart)
   - Emit events for UI updates (via SSE or polling)

2. Create api/workflows/step_runner.py:
   - Execute individual steps by type:
     * "llm_generate" — send prompt to model, store result
     * "form_input" — generate form, pause for user input
     * "checklist" — present checklist, track completion
     * "approval" — pause for user approval
     * "api_call" — call external API (Phase 2 tier only)
     * "file_generate" — create document from template
     * "notification" — log/display notification
   - Each step: input validation, execution, output capture, error handling

3. Create api/workflows/approval_handler.py:
   - Pause workflow at approval gates
   - Store pending approvals in SQLite
   - Resume on approval, abort on rejection
   - Timeout handling: auto-escalate after configurable duration

4. Copy and update onboarding workflow:
   - Pull from Pipeline Penny's new_client_onboarding.v1.json
   - Update to v2 schema with branching and form support
   - Add checklist steps for intake verification

5. Create additional workflow definitions:
   - knowledge/agent/workflows/proposal-generation.v1.json
   - knowledge/agent/workflows/compliance-review.v1.json
   - templates/sops/ — markdown versions for human reading

6. Implement api/routes/sops.py (replace stub):
   - GET /sops → list available workflows
   - GET /sops/{name} → workflow definition and status
   - POST /sops/execute → start a workflow
   - POST /sops/{id}/approve → approve pending step
   - POST /sops/{id}/reject → reject and abort
   - POST /sops/{id}/input → submit form input for a step
   - GET /sops/{id}/status → current execution state with step details
   - GET /sops/history → completed workflow runs with audit data

7. Create src/components/SOPsTab.tsx:
   - SOP browser: list available SOPs with descriptions
   - SOP runner: start SOP, see step-by-step progress
   - Approval interface: approve/reject buttons when paused
   - Form interface: render form for input steps, submit
   - Checklist interface: track checklist items within a step
   - History view: completed runs with timing and outcome
   - Audit trail viewer: every action timestamped

8. Update documentation:
   - docs/developer-manual.md Section: "Workflow Engine"
   - docs/developer-manual.md Section: "Creating Workflows"
   - docs/user-manual.md Section: "Running SOPs"
   - docs/admin-guide.md Section: "Workflow Management"

Constraints:
- Workflow state must persist across app restarts (SQLite)
- Approval timeouts must be configurable per step
- Form inputs must be validated before proceeding
- Audit trail must capture every state change with timestamp and actor
- Parallel steps must not deadlock
- Failed steps retry up to 3 times with exponential backoff
- Workflow definitions are JSON — human-readable SOP versions in markdown

Deliverables:
- api/workflows/ — executor, step_runner, approval_handler
- 3 workflow definitions (onboarding, proposal, compliance)
- api/routes/sops.py — complete implementation
- src/components/SOPsTab.tsx
- Updated docs

Output:
POST /sops/execute -d '{"workflow":"new-client-onboarding","inputs":{"client_name":"Test Co"}}'
→ Workflow starts, progresses through steps
→ Pauses at approval gate
POST /sops/{id}/approve → Continues
→ Completes with audit trail

git add -A
git commit -m "phase-9: workflow engine — executor, approvals, forms, checklists, SOP tab"
```

### Manual Test Checklist — Phase 9

- [ ] **Onboarding SOP runs:** Start the new client onboarding workflow. Steps execute sequentially. Output visible in UI.
- [ ] **Approval gate:** Workflow pauses at approval step. Approve button visible. Click approve — workflow continues.
- [ ] **Rejection:** Start workflow, reject at approval gate. Workflow marks as FAILED/ABORTED. Reason logged.
- [ ] **Form input:** Workflow reaches a form step. Form renders. Fill and submit. Workflow continues with submitted data.
- [ ] **Checklist tracking:** Step with checklist items shows checkboxes. Check items off. Step completes when all checked.
- [ ] **Persistence:** Start a workflow, close the app mid-execution. Reopen. Workflow resumes from where it paused.
- [ ] **Retry on failure:** Simulate a step failure (temporarily disable model). Step retries 3 times. After 3 failures, workflow fails with clear error.
- [ ] **Audit trail:** After completing a workflow, view history. Every step shows: start time, end time, status, actor.
- [ ] **SOPs Tab:** Browse available SOPs. Click to see description. Start button launches execution view.
- [ ] **Documentation:** Developer manual has "Workflow Engine" and "Creating Workflows" sections. User manual has "Running SOPs".

---

## Phase 10 — Module Toggle System

### Goal

Build the system that packages knowledge + skills + prompts + templates into toggleable modules that can be enabled/disabled per client install.

### What to Pull from Pipeline Penny

- Nothing — this is entirely new architecture.

### What to Build New

- Module packaging system
- `modules/manifest.json` — populated with first modules
- `scripts/module-toggle.py` — enable/disable script
- First packaged modules: onboard-command, proposal-command, workspace-command
- Module management UI in Settings

### Prompt

```
Role: Senior platform engineer building a modular feature toggle system
for a configurable LLM platform.

Context:
PipelineX's product model is: one repo per client, modules toggled per
user/role, two included modules per install, everything else is add-ons.
This phase builds the toggle infrastructure.

A module bundles: knowledge docs, skills, prompts, templates, and config
into a single toggleable unit. When a module is enabled:
- Its knowledge docs are added to the vector index
- Its skills are registered in the skill registry
- Its prompts are available in the prompt library
- Its templates are available in the template browser
- Its config overrides are applied

When disabled, all of the above are reversed.

Task:
1. Define module package structure:
   modules/{module-name}/
     config.json — metadata, dependencies, compatible industries, version
     knowledge/ — docs to vectorize when enabled
     skills/ — skill packages to register when enabled
     prompts/ — prompts to add to library when enabled
     templates/ — templates to add when enabled
     README.md — module description and usage

2. Package existing functionality into modules:
   - modules/onboard-command/ — client onboarding (pull from knowledge/,
     skills/, templates/ built in previous phases)
   - modules/proposal-command/ — proposal generation
   - modules/workspace-command/ — workspace tools (knowledge management,
     template browser, basic Q&A)

3. Populate modules/manifest.json:
   - List all modules with: name, version, description, dependencies,
     compatible_industries, default_enabled, price_tier
   - Schema validation for manifest entries

4. Create scripts/module-toggle.py:
   - Enable module: copy knowledge to active index, register skills,
     add prompts and templates to registries, rebuild vector index
   - Disable module: remove knowledge from index, unregister skills,
     remove prompts and templates, rebuild index
   - CLI: python scripts/module-toggle.py enable onboard-command
   - CLI: python scripts/module-toggle.py disable onboard-command
   - CLI: python scripts/module-toggle.py list (show all with status)
   - Validates dependencies before enable/disable

5. Create scripts/client-init.sh:
   - Initialize a new client install from base repo
   - Input: client_name, industry, selected_modules (2 default)
   - Output: configured PipelineX with selected modules enabled,
     branding applied, knowledge indexed
   - Updates pipelinex.config.json with enabled_modules list
   - Runs vectorization for enabled knowledge

6. Create API endpoints:
   - GET /modules → list all modules with status
   - POST /modules/{name}/enable → enable module (triggers re-index)
   - POST /modules/{name}/disable → disable module
   - GET /modules/{name} → module detail and contents

7. Update Settings panel:
   - Module management section: list modules with enable/disable toggles
   - Module detail: click to see README.md, contents, dependencies
   - Enable/disable triggers: re-index notification, restart warning
   - Visual: enabled modules in teal, disabled in gray

8. Update documentation:
   - docs/developer-manual.md Section: "Module System"
     Document: module package structure, manifest schema, toggle logic,
     how to create a new module, dependency management
   - docs/user-manual.md Section: "Modules"
     Document: what modules are, how to see enabled modules
   - docs/admin-guide.md Section: "Module Management"
     Document: how to enable/disable modules per client, how to add
     custom modules, dependency resolution, re-indexing after changes

Constraints:
- Module enable/disable MUST rebuild the vector index
- Module dependencies MUST be resolved before enable
- Disabling a module with dependents MUST warn and require confirmation
- Module contents MUST NOT conflict with other modules (unique skill
  names, unique template names)
- client-init.sh must be idempotent (running twice doesn't break anything)
- Module manifest is the single source of truth — no module exists
  without a manifest entry

Deliverables:
- Module package structure defined and documented
- 3 packaged modules (onboard, proposal, workspace)
- modules/manifest.json populated
- scripts/module-toggle.py
- scripts/client-init.sh
- API endpoints for module management
- Settings panel module management UI
- Updated docs

Output:
python scripts/module-toggle.py list
→ onboard-command: ENABLED
→ proposal-command: ENABLED
→ workspace-command: DISABLED

python scripts/module-toggle.py enable workspace-command
→ "Enabling workspace-command... Knowledge indexed (12 docs), 
   2 skills registered, 3 templates added. Done."

git add -A
git commit -m "phase-10: module toggle system — packaging, manifest, toggle script, client init"
```

### Manual Test Checklist — Phase 10

- [ ] **Module list:** `python scripts/module-toggle.py list` shows all 3 modules with enable/disable status.
- [ ] **Enable module:** Enable workspace-command. Confirm: knowledge docs indexed, skills registered, templates available.
- [ ] **Disable module:** Disable workspace-command. Confirm: knowledge removed from index, skills unregistered, templates removed. Chat queries about workspace topics return "no relevant knowledge found."
- [ ] **Dependency check:** If onboard-command depends on workspace-command, try disabling workspace while onboard is enabled. Confirm warning message.
- [ ] **Client init:** Run `scripts/client-init.sh` with test client name and 2 module selections. Confirm: pipelinex.config.json updated, modules enabled, index built.
- [ ] **Settings UI:** Module management section shows all modules. Toggle buttons work. Status updates after toggle.
- [ ] **Re-index trigger:** After enabling a module, confirm knowledge tab shows increased doc/chunk count.
- [ ] **Module README:** Click module in Settings for detail view. README.md renders correctly.
- [ ] **Manifest validation:** Add a malformed entry to manifest.json. Confirm module-toggle.py rejects it with helpful error.
- [ ] **Documentation:** Developer manual has "Module System" section. Admin guide has "Module Management" with enable/disable instructions.

---

## Phase 11 — Industry Knowledge Packs

### Goal

Build the first industry-specific knowledge packs with regulations, compliance docs, prompts, and templates. Start with real estate (for Eric's wife demo) and fleet/asset.

### What to Pull from Pipeline Penny

- Any industry research notes from docs/ or past conversations

### What to Build New

- knowledge/industry/real-estate/ — populated with source docs
- knowledge/industry/fleet-asset/ — populated with source docs
- Industry-specific prompts, templates, and skills
- Module wrappers: modules/realty-command/, modules/asset-command/

### Prompt

```
Role: Senior knowledge engineer building industry-specific content packs
for a governed LLM platform.

Context:
PipelineX needs industry knowledge packs that turn a generic platform into
an industry-specific assistant. Each pack includes: regulation documents,
compliance checklists, industry-specific prompts, templates, and skills.

The demo-modules document from our earlier work specified 6 target
industries. This phase builds the first two: real estate and fleet/asset.

For real estate: NAR settlement changes, state regulations, transaction
workflows, commission structures, compliance requirements.

For fleet/asset: DOT regulations, FMCSA requirements, OSHA rules,
maintenance schedules, fuel tracking, ELD mandate.

Task:
1. Build knowledge/industry/real-estate/:
   - Source and create markdown documents covering:
     * NAR settlement changes and commission transparency rules
     * Colorado real estate regulations (start state-specific)
     * Transaction workflow (listing to closing)
     * Disclosure requirements
     * Fair housing compliance
     * MLS rules and best practices
   - Create prompts/industry/real-estate/:
     * System prompts for real estate Q&A
     * Templates for listing presentations, buyer consultations
     * Compliance check prompts

2. Build knowledge/industry/fleet-asset/:
   - Source and create markdown documents covering:
     * DOT regulations overview
     * FMCSA ELD mandate requirements
     * OSHA workplace safety (heat illness, PPE, fall protection)
     * Preventive maintenance schedules
     * Fuel tracking and reconciliation
     * CDL requirements and driver compliance
   - Create prompts/industry/fleet-asset/:
     * System prompts for fleet management Q&A
     * Templates for inspection reports, maintenance logs
     * Compliance check prompts

3. Package as modules:
   - modules/realty-command/ with: config.json, knowledge/, skills/,
     prompts/, templates/, README.md
   - modules/asset-command/ with same structure
   - Add both to modules/manifest.json

4. Create industry-specific skills:
   - skills/compliance-checker/ — check a process against industry
     regulations (works with any industry knowledge pack)
   - skills/report-builder/ — generate formatted reports from data

5. Test with real queries:
   - Enable realty-command. Ask: "What changed with NAR commissions?"
   - Enable asset-command. Ask: "What are the FMCSA ELD requirements?"
   - Both should return cited answers from industry knowledge packs

6. Update documentation:
   - docs/developer-manual.md Section: "Industry Knowledge Packs"
   - docs/user-manual.md Section: "Industry Modules"
   - docs/admin-guide.md Section: "Industry Pack Setup"
   - docs/module-catalog.md — new file documenting all modules

Output:
python scripts/module-toggle.py enable realty-command
→ Knowledge indexed, skills registered

Chat: "What are the new commission rules?" → Cited answer from NAR docs

git add -A
git commit -m "phase-11: industry packs — real estate, fleet/asset modules with knowledge, prompts, templates"
```

### Manual Test Checklist — Phase 11

- [ ] **Real estate knowledge loaded:** Enable realty-command. Knowledge tab shows real estate docs. Ask NAR commission question — get cited answer.
- [ ] **Fleet knowledge loaded:** Enable asset-command. Ask FMCSA ELD question — get cited answer from fleet docs.
- [ ] **Industry isolation:** Enable only realty-command. Ask fleet question — no fleet knowledge in results. Enable asset-command — fleet answers appear.
- [ ] **Compliance checker skill:** Run compliance-checker on a sample real estate process. Returns findings against relevant regulations.
- [ ] **Industry templates:** Templates tab shows real estate templates when realty-command enabled. Removed when disabled.
- [ ] **Module catalog:** `docs/module-catalog.md` exists with entries for all modules including the two industry packs.

---

## Phase 12 — Cross-Platform Electron Builds

### Goal

Build and test Electron packages for Windows, macOS, and Linux.

### Prompt

```
Role: Senior Electron build engineer creating cross-platform desktop
application packages.

Context:
PipelineX is an Electron + React + Python FastAPI desktop app. It works
on Windows. This phase creates proper build configurations and packages
for all three major platforms.

Task:
1. Configure electron-builder for multi-platform builds
2. Platform-specific considerations:
   - Windows: installer (.exe), auto-updater, Windows registry
   - macOS: .dmg, code signing (placeholder), notarization (placeholder)
   - Linux: AppImage, .deb, .rpm
3. Python bundling: include Python runtime + deps in each platform package
4. Ollama detection: check if Ollama is installed, prompt to install if not
5. Auto-updater stub: electron-updater configuration for future use
6. Test on each platform (or document testing procedures if cross-platform
   build is from CI)

Deliverables:
- Build configs for all 3 platforms
- electron/platform/ — platform-specific code
- Build scripts in scripts/
- Testing documentation per platform
- Updated docs (installation guide per platform)

git add -A
git commit -m "phase-12: cross-platform builds — Windows, macOS, Linux electron packaging"
```

### Manual Test Checklist — Phase 12

- [ ] **Windows build:** `npm run build:win` produces .exe installer. Install on Windows. App launches, backend starts, all features work.
- [ ] **macOS build:** `npm run build:mac` produces .dmg. Install on macOS. App launches. Python bundled correctly.
- [ ] **Linux build:** `npm run build:linux` produces AppImage. Run on Ubuntu. App launches. All features work.
- [ ] **Ollama detection:** Launch on machine without Ollama. App shows helpful message with install instructions. Launch with Ollama — models detected automatically.
- [ ] **Auto-updater configured:** electron-updater config exists. No errors on startup related to updater (even if no update server configured yet).

---

## Phase 13 — Cloud Deployment Tier

### Goal

Create Docker containerization and cloud deployment scripts for Tier 3 deployment.

### Prompt

```
Role: Senior DevOps engineer containerizing a desktop LLM platform for
cloud deployment.

Context:
PipelineX Tier 3 replaces Electron with a web UI and deploys the FastAPI
backend + vector store as Docker containers. The React frontend stays the
same — only the shell changes (Electron → browser).

Task:
1. Create Dockerfile for API server + vector store
2. Create docker-compose.yml with: api, vector-store, postgres (pgvector),
   redis (caching), nginx (reverse proxy)
3. Create web entry point: serve React app via FastAPI static files or
   separate nginx container
4. PostgreSQL + pgvector migration from SQLite + FAISS
5. Redis for session management and caching
6. Auth layer: basic auth for single-tenant, OAuth for multi-tenant (stubs)
7. Deployment scripts for: GCP Cloud Run, AWS ECS (stubs), Vercel (frontend)
8. Health check and monitoring endpoints
9. Environment configuration for cloud vs local

Deliverables:
- Dockerfile, docker-compose.yml
- Cloud deployment scripts in scripts/
- Migration scripts (SQLite→PostgreSQL, FAISS→pgvector)
- Web entry point for non-Electron deployment
- Updated docs (deployment guide for cloud tier)

git add -A
git commit -m "phase-13: cloud tier — Docker, postgres, redis, web deployment"
```

### Manual Test Checklist — Phase 13

- [ ] **Docker build:** `docker build -t pipelinex .` succeeds.
- [ ] **Docker compose up:** `docker-compose up` starts all services. Health check passes.
- [ ] **Web UI:** Open `http://localhost:3000` in browser. Full PipelineX UI loads. All tabs functional.
- [ ] **PostgreSQL migration:** Data from SQLite migrated correctly. Queries return same results.
- [ ] **Cloud deploy (GCP):** Deploy script runs. App accessible at cloud URL.

---

## Phase 14 — Documentation Finalization

### Goal

Complete all documentation: user manual, developer manual, admin guide, API reference, module catalog, and deployment guide.

### Prompt

```
Role: Senior technical writer completing comprehensive documentation for
a multi-tier LLM platform.

Context:
PipelineX is feature-complete. Every phase has added incremental docs.
This phase reviews, fills gaps, adds examples, and ensures consistency
across all documentation.

Task:
1. docs/user-manual.md — complete all sections:
   - Getting Started, Command Post, Knowledge Base, Models, Memory,
     Skills, Prompts & Templates, SOPs, Settings, Modules, Troubleshooting
   - Each section: what it does, how to use it, screenshots (placeholder
     paths), tips, common issues
   - Reading level: non-technical business owner

2. docs/developer-manual.md — complete all sections:
   - Architecture Overview, Project Structure, Backend (server, routes,
     models, vectorstore, memory, workflows), Frontend (components, hooks,
     services, IPC), Configuration System, Knowledge Base, Skill System,
     Prompt System, Template Engine, Workflow Engine, Module System,
     Testing, Deployment, Contributing
   - Each section: how it works, code examples, how to extend
   - Reading level: developer familiar with Python/TypeScript

3. docs/admin-guide.md — complete all sections:
   - Installation (per platform), Configuration, Model Setup, Knowledge
     Management, Module Management, User Management, Backup & Recovery,
     Monitoring, Troubleshooting, Updates
   - Each section: step-by-step instructions
   - Reading level: technical admin

4. docs/api-reference.md — new file:
   - Every API endpoint: method, path, request schema, response schema,
     error codes, examples with curl commands
   - Generated from FastAPI's OpenAPI schema where possible

5. docs/module-catalog.md — complete:
   - Every module: name, description, included knowledge, skills, templates,
     price tier, compatible industries, dependencies

6. docs/deployment-guide.md — new file:
   - Tier 1: Local setup step-by-step
   - Tier 2: Local + API setup
   - Tier 3: Cloud deployment
   - Per-platform instructions

7. Consistency review:
   - All docs use same terminology
   - All docs reference correct file paths
   - All version numbers match
   - No "Coming in Phase X" placeholders remain
   - All cross-references resolve

Deliverables:
- All 6 documentation files complete
- No placeholder sections remaining
- Consistent terminology and formatting throughout

git add -A
git commit -m "phase-14: documentation complete — user manual, developer manual, admin guide, API reference, module catalog, deployment guide"
```

### Manual Test Checklist — Phase 14

- [ ] **No placeholders:** `grep -r "Coming in Phase\|TODO\|PLACEHOLDER\|TBD" docs/` returns zero results.
- [ ] **Cross-references valid:** Every "see Section X" or "see docs/file.md" reference points to an existing section/file.
- [ ] **User manual completeness:** Table of contents lists all sections. Every section has content (not just headers).
- [ ] **Developer manual completeness:** Every system (backend, frontend, knowledge, skills, prompts, templates, workflows, modules, memory) has its own section with code examples.
- [ ] **Admin guide completeness:** Installation section covers all 3 platforms. Configuration section covers all config files. Module management section has enable/disable instructions.
- [ ] **API reference completeness:** Every route in the FastAPI app has a corresponding entry in api-reference.md with curl example.
- [ ] **Module catalog:** Every module in manifest.json has an entry in module-catalog.md.
- [ ] **Spell check:** Run a spell checker across all docs. Fix any obvious errors.
- [ ] **Fresh-eyes review:** Give docs/user-manual.md to someone unfamiliar with PipelineX. Can they understand what the product does and how to use it from the manual alone?

---

## Appendix A — File Count Summary

| Directory | Target Files | Notes |
|-----------|-------------|-------|
| Root | 12 | Config + build + docs |
| /src | 15+ | Components, hooks, services, types, styles |
| /electron | 5 | Main, preload, IPC, updater, platform |
| /api | 25+ | Server, routes, models, vectorstore, memory, workflows, utils |
| /knowledge | 20+ | Core, industry, client, compliance, CSV, tools-ref |
| /skills | 10+ | Registry, README, 3+ skill packages |
| /prompts | 20+ | System, templates, scaffolds, testing, industry |
| /memory | 5 | Store, index, types, catalogs |
| /templates | 10+ | Proposals, onboarding, SOPs, forms, reports |
| /modules | 15+ | Manifest, 5+ module packages |
| /config | 15+ | Default, models, industry, branding |
| /scripts | 8+ | Setup, build, vectorize, toggle, init, testing |
| /docs | 6 | User, developer, admin, API ref, catalog, deployment |
| /audit | 2+ | Logs directory, audit files |
| **TOTAL** | **~170+** | |

## Appendix B — Pipeline Penny Pull Map

| Pipeline Penny Source | PipelineX Destination | Action |
|----------------------|----------------------|--------|
| package.json | package.json | Copy + refactor |
| tsconfig.json | tsconfig.json | Copy as-is |
| requirements.txt | requirements.txt | Copy + audit |
| .gitignore | .gitignore | Copy + expand |
| .env.example | .env.example | Copy + expand |
| build.js | build.js | Copy + update paths |
| electron/main.ts | electron/main.ts | Copy + refactor |
| electron/preload.ts | electron/preload.ts | Copy + refactor |
| knowledge/agent/api.py | api/server.py + api/routes/chat.py | Split + refactor |
| knowledge/agent/claude_agent.py | api/models/claude_adapter.py + api/agents/qa_agent.py | Split + refactor |
| knowledge/agent/skill_router.py | api/agents/skill_agent.py | Copy + refactor |
| knowledge/core/*.md | knowledge/core/*.md | Copy as-is |
| knowledge/agent/workflows/*.json | knowledge/agent/workflows/*.json | Copy + update schema |
| skills/bearing-check/ | skills/bearing-check/ | Copy as-is |
| skills/registry.json | skills/registry.json | Copy + update schema |
| prompts/*.md (useful ones) | prompts/system/ or prompts/templates/ | Audit + copy |
| src/App.tsx | DO NOT COPY | Extract patterns only |
| src/styles | src/styles/theme.css | Extract theme only |

---

**End of TODO**

*Direction Protocol gets you clarity. Command Protocol gets you control. PipelineX makes it stick.*

*Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com*
