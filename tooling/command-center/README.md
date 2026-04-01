# TNDS Command Center

A lightweight, standalone TypeScript service that acts as the integration glue for all 14 TNDS command modules. Provides unified tool discovery, routing, health checks, and a master registry so the LLM (or any consumer) can discover and call any module's tools through one interface.

## Architecture

The Command Center follows a 6-layer architecture pattern:

```
command-center/
  src/
    data/           # Registry schema, in-memory store
    services/       # Core services (registry, router, discovery, health, search)
    api/            # REST-style API handlers
    hooks/          # Health monitor, auto-discovery hooks
    config/         # Central config, module manifest
    reporting/      # System dashboard, usage analytics
  tests/            # Vitest unit tests
  src/tools.ts      # LLM-facing meta-tools
```

## Services

### Registry Service
Core module registration, deregistration, status updates, and metadata management.

- Register modules with their tools
- Deregister modules
- Get module info and statistics
- Update module status and health
- Filter modules by classification

### Router Service
Tool routing: given a tool name, find which module owns it and route the call.

- Route by fully-qualified name (module.tool_name)
- Route by unqualified name (with ambiguity detection)
- Validate parameters against tool schema
- Handle parameter type checking

### Discovery Service
Auto-discovery: scan modules directory, parse tool definitions, normalize to unified format.

- Normalize tool definitions from various export patterns
- Auto-discover modules from manifest
- Support re-scanning on demand

### Health Service
Health checking and monitoring across all registered modules.

- Check individual module health
- Check all modules in parallel
- Aggregate health into system-wide report
- Track health history

### Search Service
Full-text search across tool names and descriptions.

- Search tools by keyword
- Filter by module, classification, or tags
- Return ranked results
- Get classifications with counts

## LLM Meta-Tools

The Command Center exports these meta-tools for LLM use:

- **discover_modules** — List all registered modules with status and tool counts
- **discover_tools** — List all available tools across all modules (with optional filtering)
- **search_tools** — Search tools by keyword across all modules
- **get_tool_schema** — Get the full parameter schema for a specific tool
- **route_tool_call** — Execute a tool by qualified name with parameters
- **get_system_status** — Health check across all modules
- **get_module_detail** — Detailed info about a specific module
- **get_classifications** — List all module classifications with counts
- **get_system_dashboard** — System-wide aggregate metrics
- **get_tool_usage_stats** — Tool usage statistics and error rates

## The 14 Registered Modules

1. **realty-command** (Operations) — Real estate CRM — leads, properties, deals, contacts
2. **sales-command** (Finance) — Sales pipeline — products, customers, records, KPIs, forecasts
3. **compliance-command** (Operations) — Compliance tracking — frameworks, packages, checklists
4. **task-command** (Operations) — Task management — departments, users, categories, tasks
5. **contract-command** (Operations) — Contract lifecycle — parties, contracts, milestones
6. **proposal-command** (Finance) — Proposal generation — templates, pricing, DOCX output
7. **asset-command** (Logistics) — Fleet/asset management — vehicles, maintenance, fuel
8. **readiness-command** (Intelligence) — AI readiness assessment — scoring, recommendations
9. **financial-command** (Finance) — Financial center — transactions, tax, budgets, bank imports
10. **email-command** (Intelligence) — Email analytics — digests, anomaly detection, metrics
11. **onboard-command** (Operations) — Workspace provisioning — onboarding workflows, queue
12. **dispatch-command** (Operations) — HVAC dispatch — requests, drivers, trucks, routing
13. **govcon-command** (Planning) — Federal contracting — opportunities, bid decisions
14. **training-command** (Operations) — Training platform — courses, enrollments, certifications

## Getting Started

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

### Development

```bash
npm run dev
```

### Type Checking

```bash
npm run typecheck
```

### Testing

```bash
npm test
npm run test:watch
```

### Build

```bash
npm run build
```

## Usage Example

```typescript
import { COMMAND_CENTER_TOOLS, toolHandlers, initializeCommandCenter } from './src/tools.js';

// Initialize the Command Center
await initializeCommandCenter();

// Use a meta-tool
const result = await toolHandlers.discover_modules({});

// Search for tools
const searchResults = await toolHandlers.search_tools({
  query: 'property',
  classification: 'Operations',
});

// Route a tool call
const execution = await toolHandlers.route_tool_call({
  qualifiedName: 'realty-command.add_property',
  parameters: { name: 'Downtown Condo', address: '123 Main St' },
});
```

## Data Model

### RegisteredModule
```typescript
{
  id: string;
  displayName: string;
  version: string;
  description: string;
  classification: 'Operations' | 'Finance' | 'Intelligence' | 'Planning' | 'Infrastructure' | 'Logistics';
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  toolCount: number;
  tools: ToolDefinition[];
  health: ModuleHealth;
  baseUrl?: string;
  registeredAt: number;
  updatedAt: number;
}
```

### ToolDefinition
```typescript
{
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}
```

### ToolInvocation
```typescript
{
  id: string;
  toolId: string;              // fully-qualified: "module.tool_name"
  moduleId: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  status: 'success' | 'error' | 'timeout';
  durationMs: number;
  invokedAt: number;
  errorMessage?: string;
}
```

## Branding

Navy: `#1a3a5c`
Teal: `#3d8eb9`

## Testing Strategy

Tests are organized by service:

- **registry-service.test.ts** — Module registration, deregistration, status updates
- **router-service.test.ts** — Qualified/unqualified routing, ambiguity handling, validation
- **discovery-service.test.ts** — Module scanning, tool normalization
- **health-service.test.ts** — Health checks, aggregation
- **search-service.test.ts** — Keyword search, filtering, rankings
- **integration.test.ts** — End-to-end scenarios with multiple modules

Run all tests:

```bash
npx vitest run
```

Watch mode:

```bash
npx vitest
```

## Architecture Decisions

1. **In-Memory Registry** — No database needed; this is a routing/discovery layer. Data loaded at startup.
2. **Fully-Qualified Names** — Prevent ambiguity. Format: "module-name.tool_name"
3. **Normalized Tool Definitions** — All tools converge to a standard schema regardless of module export pattern.
4. **Modular Services** — Each service has a single responsibility. Easy to test and extend.
5. **Zod Validation** — TypeScript + Zod for runtime schema validation.
6. **Repository Pattern** — InMemoryRegistry is isolated from services, testable in isolation.

## Future Enhancements

- Persisted health history (metrics)
- Tool usage trending and forecasting
- Module dependency graph
- Rate limiting and quotas per module
- Tool versioning and deprecation
- WebSocket support for real-time tool discovery
- GraphQL API layer
- OpenAPI/Swagger documentation generation

## License

True North Data Strategies
