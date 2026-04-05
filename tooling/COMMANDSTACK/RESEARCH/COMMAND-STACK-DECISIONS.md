# CommandStack Platform - Strategic Decisions & Implementation Plan
**Date:** April 4, 2026  
**Owner:** Jacob Johnston, True North Data Strategies LLC  
**Decision:** Option B - Parallel Build (Clean Slate, High Quality)  
**Timeline:** 3 months to production-grade platform

---

## Executive Summary

### The Discovery
We discovered that Fleet Compliance Sentinel isn't a niche product — it's the first module of a **multi-tenant business operations AI platform** that was hiding inside fleet-specific branding.

### The Decision
**Build CommandStack from scratch** using parallel development:
- Month 1: Platform foundation + graph-augmented RAG
- Month 2: Fleet Command rebuild as first module
- Month 3: Second module (Realty or Gov Command) to prove modularity

### Why Option B (Parallel Build)?
1. **Graph-augmented RAG from Day 1** — Research shows this is where the industry is going
2. **No technical debt** — Clean architecture supports SOC 2, multi-tenant, and enterprise scale
3. **Higher quality** — Apply all learnings from FCS prototype without compromise
4. **Better positioning** — Launch as platform, not niche tool
5. **Long-term moat** — Competitors can't copy 3 months of architectural decisions in a weekend

### The Opportunity Cost
- **Time:** 3 months vs 2 weeks (Option A)
- **Risk:** Building without revenue vs shipping fast
- **Mitigation:** Keep FCS running for current users, build CommandStack in parallel

---

## Table of Contents

1. [Strategic Context](#strategic-context)
2. [Research Foundation](#research-foundation)
3. [Domain Architecture](#domain-architecture)
4. [Brand Hierarchy](#brand-hierarchy)
5. [Technical Architecture](#technical-architecture)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Financial Projections](#financial-projections)
8. [Risk Register](#risk-register)
9. [Success Criteria](#success-criteria)
10. [Decision Log](#decision-log)

---

## Strategic Context

### What We Started With
**Question:** "Should we add graph-augmented RAG to Fleet Compliance Sentinel?"

**Documents reviewed:**
1. Graph-augmented RAG research paper (LightRAG, GraphRAG, HippoRAG)
2. Deep research report on retrieval systems
3. Domain discussion on business architecture
4. CommandStack naming and structure proposal

### What We Discovered

**Fleet Compliance Sentinel has platform-level architecture:**
- Multi-tenant database design
- Module gateway system
- RAG retrieval pipeline
- Model provider abstraction
- Tenant-aware context
- Industry overlay concept
- Shared package structure

**But it's branded and positioned as:**
- Single-purpose fleet compliance tool
- Niche DOT regulation assistant
- Vertical SaaS product

**The truth:**
> "You didn't build Fleet Compliance Sentinel. You built CommandStack — a multi-tenant business operations AI platform. Fleet Command is just your first module."

---

## Research Foundation

### Graph-Augmented RAG (Critical Technical Decision)

**Research findings:**

1. **LightRAG** (Recommended architecture)
   - Dual-level retrieval (specific entities + abstract concepts)
   - 40% faster than GraphRAG
   - Incremental update support
   - Production-ready implementation exists
   - **Decision: Use LightRAG architecture as base**

2. **GraphRAG** (Selective use)
   - Hierarchical community detection (Leiden clustering)
   - Good for domain summaries and marketing content
   - Expensive (high token usage)
   - **Decision: Use for offline analysis only, not real-time queries**

3. **HippoRAG** (Advanced moat feature)
   - Personalized PageRank for tenant-specific learning
   - Adaptive retrieval based on usage patterns
   - Synonym/paraphrase handling
   - **Decision: Phase 3 feature after multi-tenant usage data exists**

### Why Graph-Augmented RAG Matters

**Example: DOT Compliance Query**

**Current vector-only approach:**
```
User: "What happens if a driver fails a random drug test?"
System: Returns § 382.211 text only
Problem: Doesn't show compliance chain
```

**Graph-augmented approach:**
```
User: "What happens if a driver fails a random drug test?"
System: 
  1. Graph query: Find compliance chain
     § 382.211 → Remove Driver → Clearinghouse Report → RTD Protocol
  2. Vector query: Get exact regulatory text
  3. Merge: Present chain + citations
Result: Complete compliance roadmap with timeframes
```

**Research validates:**
- 30-40% improvement on multi-hop questions
- Better handling of "what triggers what" queries
- Enables domain clustering (show all HazMat requirements together)

### Implementation Complexity

**From research:**
- LightRAG architecture: 4-6 weeks to MVP
- Entity extraction: 80% precision achievable with LLM-based extraction
- Neo4j performance: Sub-200ms for typical compliance chains
- Cost increase: ~$45/month for graph database hosting

**Decision: Build it from Day 1**

Why spend time building vector-only platform, then retrofitting graph later? Graph RAG isn't an add-on — it's a core retrieval strategy that affects:
- Database schema (graph relationships)
- Query routing (intent classification)
- Context merging (how graph paths + vector chunks combine)
- Module contracts (how modules declare relationships)

**Building it Day 1 = Do the work once.**

---

## Domain Architecture

### The Accidental Ecosystem

Jacob didn't buy random domains — he built a **full-stack business ecosystem**:

```
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS ECOSYSTEM                         │
└─────────────────────────────────────────────────────────────┘

1. NextGenERP.dev (Lead Engine)
   Role: SEO traffic, ERP-confused buyers
   Content: Comparison directory, quiz, starter kits
   Monetization: Affiliate revenue, paid guides, lead capture
   Exits to: TNDS consulting

2. TNDS - truenorthstrategyops.com (Authority/Services)
   Role: Consulting, implementation, trust anchor
   Content: Services, case studies, capability statement
   Monetization: Consulting revenue, implementation projects
   Exits to: CommandStack platform

3. CommandStack - [NEW DOMAIN] (Platform)
   Role: SaaS delivery, multi-tenant AI platform
   Content: Product site, module catalog, login, docs
   Monetization: Module subscriptions, usage-based pricing
   Exits to: Customer retention, expansion revenue

4. Pipeline Punks - pipelinepunks.com (Innovation Lab)
   Role: Education, builder brand, experiments
   Content: Dev tutorials, demos, learning content
   Monetization: Community engagement, talent pipeline
   Exits to: Developer ecosystem, open source

5. FOB - truenorthfob.org (Mission Engine)
   Role: Veteran/youth support, impact platform
   Content: 45-day cohort, 4 pillars, 14 modules
   Monetization: Donations, grants, partner revenue
   Exits to: Social impact, brand halo effect
```

### Cross-Domain Strategy

**Lead Flow:**
```
NextGenERP (SEO) 
  → "Which ERP fits you?" quiz
  → Result: "You need custom automation"
  → CTA: "Talk to TNDS experts"
  
TNDS (Consulting)
  → Discovery: Client needs operations AI
  → Proposal: CommandStack implementation
  → Contract: $5K-15K setup + $2K/month platform
  
CommandStack (Platform)
  → Module selection: Fleet + Realty + Gov
  → Usage grows, expand to more modules
  → Retention: Customer gets value, stays
  
Pipeline Punks (Community)
  → Write case study of implementation
  → Publish tutorial on module customization
  → Generate SEO traffic → back to NextGenERP
```

**This is a moat.** Competitors have one engine. You have five feeding each other.

---

## Brand Hierarchy

### External Brand Structure

**LEVEL 1: Company**
- **True North Data Strategies LLC**
- Role: Corporate parent, authority, trust anchor
- Domain: truenorthstrategyops.com
- Positioning: "Turning Data into Direction"
- Audience: Gov buyers, enterprise, partners

**LEVEL 2: Platform**
- **CommandStack**
- Role: Product brand, SaaS platform, AI operating system
- Domain: commandstack.com (TO BE REGISTERED)
- Positioning: "Business AI Operating System"
- Tagline: "Base AI + Command Modules + Industry Overlays"
- Audience: Small business owners (5-20 employees)

**LEVEL 3: AI Assistant**
- **Pipeline Penny** (default persona)
- Role: AI interface layer, customizable assistant
- Personality: Military-influenced, direct, outcomes-focused
- Tenant customization: Allow renaming (Realty Rachel, Gov Grace, Fleet Frank)
- Audience: End users interacting with platform

**LEVEL 4: Vertical Modules**
- **Fleet Command** — DOT compliance, driver management, vehicle tracking
- **Realty Command** — Property management, lease tracking, tenant compliance
- **Gov Command** — Federal contracting, FAR/DFARS, CMMC readiness
- **Training Command** — Curriculum delivery, certification tracking, cohort management

### Internal Technical Naming

**Core Engine:**
- **Pipeline X** — Internal name for core AI orchestration engine
- Not customer-facing, used in technical documentation

**Orchestration Layer:**
- **Command Center** — Module gateway, routing, tenant management
- Internal architecture component

**Retrieval System:**
- **RAG Core** — Graph + Vector hybrid retrieval
- Package name: `@commandstack/rag-core`

**Module System:**
- **Command SDK** — Module contract interface
- Package name: `@commandstack/command-sdk`

### Why This Hierarchy Works

1. **Separation of concerns**
   - Company (TNDS) ≠ Product (CommandStack)
   - Platform (CommandStack) ≠ Modules (Fleet Command)
   - AI persona (Penny) is configurable, not brand-locked

2. **Scalability**
   - Add new modules without changing platform brand
   - Sell platform to businesses who don't need fleet
   - White-label option: Tenant can rebrand assistant

3. **Market positioning**
   - TNDS = Authority (consulting, implementation)
   - CommandStack = Innovation (AI platform, SaaS)
   - Modules = Solutions (industry-specific value)

4. **Exit strategy**
   - Platform business = 4-6x ARR multiple
   - Niche tool = 2-3x ARR multiple
   - Platform positioning doubles valuation

---

## Technical Architecture

### Platform Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  CommandStack Platform                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Apps Layer                                 │ │
│  │  - marketing/ (Product website)                         │ │
│  │  - app/ (Main SaaS shell)                              │ │
│  │  - docs/ (Trust center, API docs)                       │ │
│  │  - admin/ (Tenant management console)                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Services Layer                             │ │
│  │  - api-gateway/ (Request routing)                       │ │
│  │  - ai-orchestrator/ (Model selection, tool policy)      │ │
│  │  - ingestion-service/ (Document processing)             │ │
│  │  - retrieval-service/ (Graph + Vector queries)          │ │
│  │  - worker-service/ (Async jobs, scheduling)             │ │
│  │  - audit-service/ (Compliance audit trail)              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Packages Layer                             │ │
│  │  - ui/ (Shared component library)                       │ │
│  │  - types/ (TypeScript type definitions)                 │ │
│  │  - auth/ (Authentication utilities)                     │ │
│  │  - audit/ (Structured logging)                          │ │
│  │  - rag-core/ (Graph + Vector retrieval)                 │ │
│  │  - model-router/ (Claude/OpenAI/Gemini/Ollama)          │ │
│  │  - command-sdk/ (Module contract interface)             │ │
│  │  - tenant-sdk/ (Multi-tenant config)                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Modules Layer                              │ │
│  │                                                          │ │
│  │  Base Commands (Every tenant gets these):               │ │
│  │    - proposal-command/                                  │ │
│  │    - contract-command/                                  │ │
│  │    - invoice-command/                                   │ │
│  │    - task-command/                                      │ │
│  │    - document-command/                                  │ │
│  │    - email-command/                                     │ │
│  │    - onboard-command/                                   │ │
│  │    - readiness-command/                                 │ │
│  │                                                          │ │
│  │  Industry Modules (Install on demand):                  │ │
│  │    - fleet-command/ (DOT compliance)                    │ │
│  │    - realty-command/ (Property management)              │ │
│  │    - gov-command/ (Federal contracting)                 │ │
│  │    - training-command/ (Curriculum delivery)            │ │
│  │    - compliance-command/ (Advanced compliance)          │ │
│  │                                                          │ │
│  │  Experimental:                                          │ │
│  │    - ml-eia/ (Economic impact analysis)                 │ │
│  │    - signal-stack/ (Business forecasting)               │ │
│  │    - paperstack/ (Document intelligence)                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Repository Structure

```
commandstack-platform/
├── apps/
│   ├── marketing/              # CommandStack product website
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── index.tsx           # Homepage
│   │   │   │   ├── modules/            # Module catalog
│   │   │   │   ├── pricing/            # Pricing tiers
│   │   │   │   └── docs/               # Trust center
│   │   │   ├── components/
│   │   │   └── styles/
│   │   └── package.json
│   │
│   ├── app/                    # Main SaaS application shell
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── chat/               # AI chat interface
│   │   │   │   ├── modules/            # Module management
│   │   │   │   ├── settings/           # Tenant settings
│   │   │   │   └── analytics/          # Usage analytics
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── contexts/
│   │   └── package.json
│   │
│   ├── docs/                   # Documentation site
│   │   ├── content/
│   │   │   ├── api/                    # API reference
│   │   │   ├── guides/                 # User guides
│   │   │   ├── security/               # Security docs
│   │   │   └── compliance/             # Compliance docs
│   │   └── package.json
│   │
│   └── admin/                  # Internal admin console
│       ├── src/
│       │   ├── pages/
│       │   │   ├── tenants/            # Tenant management
│       │   │   ├── modules/            # Module deployment
│       │   │   ├── monitoring/         # System health
│       │   │   └── analytics/          # Platform analytics
│       │   └── components/
│       └── package.json
│
├── packages/
│   ├── ui/                     # Shared UI component library
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Card/
│   │   │   │   └── Chat/
│   │   │   └── themes/
│   │   └── package.json
│   │
│   ├── types/                  # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── tenant.ts
│   │   │   ├── module.ts
│   │   │   ├── assistant.ts
│   │   │   └── retrieval.ts
│   │   └── package.json
│   │
│   ├── auth/                   # Authentication utilities
│   │   ├── src/
│   │   │   ├── jwt.ts
│   │   │   ├── rbac.ts
│   │   │   └── session.ts
│   │   └── package.json
│   │
│   ├── audit/                  # Structured audit logging
│   │   ├── src/
│   │   │   ├── logger.ts
│   │   │   ├── events.ts
│   │   │   └── storage.ts
│   │   └── package.json
│   │
│   ├── rag-core/               # Graph + Vector retrieval system
│   │   ├── src/
│   │   │   ├── retrievers/
│   │   │   │   ├── VectorRetriever.ts
│   │   │   │   ├── GraphRetriever.ts
│   │   │   │   └── HybridRetriever.ts
│   │   │   ├── intent/
│   │   │   │   └── IntentClassifier.ts
│   │   │   ├── context/
│   │   │   │   └── ContextMerger.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── model-router/           # LLM provider abstraction
│   │   ├── src/
│   │   │   ├── providers/
│   │   │   │   ├── ClaudeProvider.ts
│   │   │   │   ├── OpenAIProvider.ts
│   │   │   │   ├── GeminiProvider.ts
│   │   │   │   └── OllamaProvider.ts
│   │   │   ├── router.ts
│   │   │   └── fallback.ts
│   │   └── package.json
│   │
│   ├── command-sdk/            # Module contract interface
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── Module.ts
│   │   │   │   ├── Tool.ts
│   │   │   │   └── KnowledgeSource.ts
│   │   │   ├── ModuleRegistry.ts
│   │   │   └── ModuleLoader.ts
│   │   └── package.json
│   │
│   └── tenant-sdk/             # Multi-tenant utilities
│       ├── src/
│       │   ├── TenantConfig.ts
│       │   ├── FeatureFlags.ts
│       │   ├── ModuleBindings.ts
│       │   └── Permissions.ts
│       └── package.json
│
├── services/
│   ├── api-gateway/            # Request routing service
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── chat.ts
│   │   │   │   ├── modules.ts
│   │   │   │   └── tenants.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── ratelimit.ts
│   │   │   │   └── logging.ts
│   │   │   └── server.ts
│   │   └── package.json
│   │
│   ├── ai-orchestrator/        # AI orchestration service
│   │   ├── src/
│   │   │   ├── orchestrator.ts
│   │   │   ├── tool-executor.ts
│   │   │   ├── prompt-builder.ts
│   │   │   └── response-parser.ts
│   │   └── package.json
│   │
│   ├── ingestion-service/      # Document ingestion service
│   │   ├── src/
│   │   │   ├── parsers/
│   │   │   │   ├── pdf.ts
│   │   │   │   ├── docx.ts
│   │   │   │   └── markdown.ts
│   │   │   ├── chunker.ts
│   │   │   ├── embedder.ts
│   │   │   └── indexer.ts
│   │   └── package.json
│   │
│   ├── retrieval-service/      # Retrieval coordination service
│   │   ├── src/
│   │   │   ├── retrieval-coordinator.ts
│   │   │   ├── reranker.ts
│   │   │   └── cache.ts
│   │   └── package.json
│   │
│   ├── worker-service/         # Async job processing
│   │   ├── src/
│   │   │   ├── jobs/
│   │   │   │   ├── document-ingestion.ts
│   │   │   │   ├── graph-ingestion.ts
│   │   │   │   └── analytics.ts
│   │   │   └── worker.ts
│   │   └── package.json
│   │
│   └── audit-service/          # Audit trail service
│       ├── src/
│       │   ├── event-collector.ts
│       │   ├── evidence-store.ts
│       │   └── compliance-reporter.ts
│       └── package.json
│
├── modules/
│   ├── base/
│   │   ├── proposal-command/
│   │   │   ├── module.json
│   │   │   ├── README.md
│   │   │   ├── tools.ts
│   │   │   ├── schemas.ts
│   │   │   ├── handlers.ts
│   │   │   ├── permissions.ts
│   │   │   ├── knowledge-sources.ts
│   │   │   └── tests/
│   │   │
│   │   ├── contract-command/
│   │   ├── invoice-command/
│   │   ├── task-command/
│   │   ├── document-command/
│   │   ├── email-command/
│   │   ├── onboard-command/
│   │   └── readiness-command/
│   │
│   ├── industry/
│   │   ├── fleet-command/
│   │   │   ├── module.json
│   │   │   ├── README.md
│   │   │   ├── tools/
│   │   │   │   ├── compliance-check.ts
│   │   │   │   ├── regulation-search.ts
│   │   │   │   └── violation-cascade.ts
│   │   │   ├── schemas/
│   │   │   ├── handlers/
│   │   │   ├── permissions.ts
│   │   │   ├── assistant-config.ts
│   │   │   ├── knowledge/
│   │   │   │   ├── cfr-title-49/
│   │   │   │   └── fmcsa-guidance/
│   │   │   ├── graph/
│   │   │   │   ├── schema.cypher
│   │   │   │   └── queries.ts
│   │   │   └── tests/
│   │   │
│   │   ├── realty-command/
│   │   │   ├── module.json
│   │   │   ├── knowledge/
│   │   │   │   ├── dora-california/
│   │   │   │   └── property-management/
│   │   │   └── assistant-config.ts
│   │   │
│   │   ├── gov-command/
│   │   │   ├── module.json
│   │   │   ├── knowledge/
│   │   │   │   ├── far-regulations/
│   │   │   │   ├── dfars-supplements/
│   │   │   │   └── cmmc-requirements/
│   │   │   └── assistant-config.ts
│   │   │
│   │   ├── training-command/
│   │   └── compliance-command/
│   │
│   └── experimental/
│       ├── ml-eia/
│       ├── signal-stack/
│       └── paperstack/
│
├── knowledge/
│   ├── core/                   # Platform-level knowledge
│   │   ├── platform-help/
│   │   ├── workflows/
│   │   └── templates/
│   │
│   ├── industry/               # Industry-specific corpora
│   │   ├── fleet/
│   │   ├── realty/
│   │   ├── gov/
│   │   └── training/
│   │
│   ├── tenants/                # Customer private knowledge
│   │   └── {tenant-id}/
│   │       ├── documents/
│   │       ├── sops/
│   │       └── forms/
│   │
│   └── indexes/                # Vector and graph indexes
│       ├── faiss/
│       └── neo4j/
│
├── infra/
│   ├── vercel/                 # Vercel deployment configs
│   │   ├── marketing.json
│   │   ├── app.json
│   │   └── docs.json
│   │
│   ├── railway/                # Railway deployment configs
│   │   ├── api-gateway.toml
│   │   ├── ai-orchestrator.toml
│   │   └── neo4j.toml
│   │
│   ├── neon/                   # Neon Postgres migrations
│   │   ├── migrations/
│   │   └── seeds/
│   │
│   ├── firebase/               # Firebase config
│   │   ├── firestore.rules
│   │   └── storage.rules
│   │
│   └── observability/          # Monitoring and logging
│       ├── datadog/
│       └── sentry/
│
├── docs/
│   ├── architecture/
│   │   ├── OVERVIEW.md
│   │   ├── GRAPH-RAG.md
│   │   ├── MODULE-SYSTEM.md
│   │   └── MULTI-TENANT.md
│   │
│   ├── operations/
│   │   ├── DEPLOYMENT.md
│   │   ├── MONITORING.md
│   │   └── INCIDENT-RESPONSE.md
│   │
│   ├── security/
│   │   ├── RBAC.md
│   │   ├── DATA-PROTECTION.md
│   │   └── AUDIT-TRAIL.md
│   │
│   ├── compliance/
│   │   ├── SOC2.md
│   │   ├── GDPR.md
│   │   └── HIPAA.md
│   │
│   └── product/
│       ├── MODULE-DEVELOPMENT.md
│       ├── API-REFERENCE.md
│       └── CUSTOMIZATION.md
│
├── tooling/
│   ├── migrations/
│   │   ├── migrate-fcs-data.ts
│   │   └── seed-base-modules.ts
│   │
│   ├── scripts/
│   │   ├── ingest-knowledge.ts
│   │   ├── build-graph.ts
│   │   └── validate-modules.ts
│   │
│   └── local-dev/
│       ├── docker-compose.yml
│       └── setup.sh
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-production.yml
│   │   └── deploy-staging.yml
│   └── CODEOWNERS
│
├── turbo.json                  # Turborepo config
├── package.json                # Root package.json
├── tsconfig.json               # Base TypeScript config
└── README.md                   # Platform overview
```

### Key Architectural Decisions

**1. Monorepo Structure**
- **Tool:** Turborepo
- **Why:** Shared packages, atomic deploys, consistent tooling
- **Trade-off:** More complex setup vs cleaner dependencies

**2. Graph Database**
- **Tool:** Neo4j Community Edition
- **Why:** Native graph queries, Cypher language, proven scale
- **Deployment:** Docker on Railway
- **Cost:** ~$25/month

**3. Vector Database**
- **Tool:** Neon Postgres with pgvector + FAISS for in-memory index
- **Why:** Existing investment, good performance, managed service
- **Cost:** ~$50/month

**4. LLM Providers**
- **Primary:** Claude Sonnet 4 (quality)
- **Fallback:** OpenAI GPT-4 (reliability)
- **Cost-sensitive:** Gemini Flash (speed + price)
- **Local:** Ollama (regulated deployments)

**5. Module Contract**
Every module exposes:
```typescript
interface Module {
  id: string;
  name: string;
  version: string;
  category: "base" | "industry" | "experimental";
  tools: Tool[];
  knowledgeSources: KnowledgeSource[];
  assistantConfig?: AssistantConfig;
  permissions: Permission[];
  dependencies?: string[];
}
```

**6. Multi-Tenant Isolation**
- **Database:** Row-level security in Postgres
- **Storage:** Tenant-scoped Firebase buckets
- **Graph:** Tenant labels in Neo4j
- **Cache:** Tenant-prefixed Redis keys
- **API:** JWT-based tenant resolution

---

## Implementation Roadmap

### Month 1: Platform Foundation + Graph RAG

**Goal:** Production-ready platform core with graph-augmented retrieval

#### Week 1: Scaffolding & Database Setup

**Day 1-2: Repository Setup**
```bash
# Create monorepo
npx create-turbo@latest commandstack-platform
cd commandstack-platform

# Install dependencies
npm install

# Setup Git
git init
git add .
git commit -m "Initial CommandStack platform scaffold"
git remote add origin https://github.com/pipeline-punks/commandstack-platform.git
git push -u origin main
```

**Deliverables:**
- [ ] Turborepo configured with workspaces
- [ ] Base package structure created
- [ ] TypeScript configs in place
- [ ] ESLint + Prettier configured
- [ ] GitHub repo created with CODEOWNERS

**Day 3-4: Database Infrastructure**
```bash
# Deploy Neo4j
docker run --name commandstack-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/commandstack-2026 \
  -v ~/neo4j/data:/data \
  neo4j:5.15-community

# Setup Neon Postgres
# Via Neon console, create database: commandstack-production

# Run migrations
npx prisma migrate dev --name init
```

**Deliverables:**
- [ ] Neo4j running locally and on Railway
- [ ] Neon Postgres database provisioned
- [ ] Prisma schema defined
- [ ] Initial migrations applied
- [ ] Connection pooling configured

**Day 5-7: RAG Core Package**

Build `packages/rag-core/` with:

```typescript
// packages/rag-core/src/retrievers/VectorRetriever.ts
export class VectorRetriever implements Retriever {
  async retrieve(query: string, tenantId: string): Promise<RetrievalResult> {
    // 1. Generate embedding
    const embedding = await this.embedder.embed(query);
    
    // 2. FAISS similarity search
    const indices = await this.faissIndex.search(embedding, this.topK);
    
    // 3. Fetch chunks from Postgres
    const chunks = await this.db.chunks.findMany({
      where: {
        id: { in: indices },
        tenantId: tenantId
      }
    });
    
    return { chunks, type: "vector" };
  }
}

// packages/rag-core/src/retrievers/GraphRetriever.ts
export class GraphRetriever implements Retriever {
  async retrieve(query: string, tenantId: string): Promise<RetrievalResult> {
    // 1. Extract entities from query
    const entities = await this.entityExtractor.extract(query);
    
    // 2. Build Cypher query
    const cypherQuery = this.queryBuilder.build(entities);
    
    // 3. Execute against Neo4j
    const paths = await this.neo4j.run(cypherQuery, { tenantId });
    
    return { paths, type: "graph" };
  }
}

// packages/rag-core/src/retrievers/HybridRetriever.ts
export class HybridRetriever implements Retriever {
  constructor(
    private vector: VectorRetriever,
    private graph: GraphRetriever,
    private classifier: IntentClassifier
  ) {}
  
  async retrieve(query: string, tenantId: string): Promise<RetrievalResult> {
    // 1. Classify intent
    const intent = this.classifier.classify(query);
    
    // 2. Route to appropriate retriever(s)
    if (intent === "vector") {
      return this.vector.retrieve(query, tenantId);
    } else if (intent === "graph") {
      return this.graph.retrieve(query, tenantId);
    } else {
      // Hybrid: parallel retrieval
      const [vectorResult, graphResult] = await Promise.all([
        this.vector.retrieve(query, tenantId),
        this.graph.retrieve(query, tenantId)
      ]);
      
      // 3. Merge results
      return this.merger.merge(vectorResult, graphResult);
    }
  }
}
```

**Deliverables:**
- [ ] VectorRetriever implementation
- [ ] GraphRetriever implementation  
- [ ] HybridRetriever orchestration
- [ ] IntentClassifier (rule-based)
- [ ] ContextMerger implementation
- [ ] Unit tests for each retriever

---

#### Week 2: Intent Classification & Context Merging

**Day 8-10: Intent Classifier**

```typescript
// packages/rag-core/src/intent/IntentClassifier.ts
export class IntentClassifier {
  private graphPatterns = [
    /what (happens|triggers|leads to|results in)/i,
    /show (all|everything) (related to|connected to)/i,
    /what else (do I need|is required)/i,
    /cascading|downstream|upstream/i,
    /what if/i,
    /compliance chain/i
  ];
  
  private vectorPatterns = [
    /what (does|is) (§|section|part) \d+/i,
    /exact (text|wording|language)/i,
    /quote|citation/i,
    /specific requirement/i,
    /definition of/i
  ];
  
  classify(query: string): "graph" | "vector" | "hybrid" {
    const graphScore = this.graphPatterns.filter(p => p.test(query)).length;
    const vectorScore = this.vectorPatterns.filter(p => p.test(query)).length;
    
    if (graphScore > vectorScore) return "graph";
    if (vectorScore > 0) return "vector";
    return "hybrid";
  }
}
```

**Deliverables:**
- [ ] Rule-based intent classifier
- [ ] Pattern library for common query types
- [ ] Classification accuracy tests (100-query test set)
- [ ] Fallback to hybrid for ambiguous queries

**Day 11-14: Context Merger**

```typescript
// packages/rag-core/src/context/ContextMerger.ts
export class ContextMerger {
  private maxTokens = 3000;
  
  merge(
    vectorResult?: RetrievalResult,
    graphResult?: RetrievalResult
  ): string {
    const parts: string[] = [];
    
    // Add graph paths first (higher priority)
    if (graphResult?.paths) {
      parts.push(this.formatGraphPaths(graphResult.paths));
    }
    
    // Add vector chunks
    if (vectorResult?.chunks) {
      parts.push(this.formatVectorChunks(vectorResult.chunks));
    }
    
    // Deduplicate and truncate
    const merged = this.deduplicate(parts.join("\n\n---\n\n"));
    return this.truncate(merged, this.maxTokens);
  }
  
  private formatGraphPaths(paths: GraphPath[]): string {
    return "REGULATORY RELATIONSHIPS:\n\n" + 
      paths.map(p => this.formatPath(p)).join("\n\n");
  }
  
  private formatVectorChunks(chunks: Chunk[]): string {
    return "RELEVANT REGULATIONS:\n\n" +
      chunks.map(c => `[${c.section}]\n${c.text}`).join("\n\n");
  }
  
  private deduplicate(text: string): string {
    // Remove duplicate regulation citations
    // Keep first occurrence
    const seen = new Set<string>();
    return text.split("\n\n").filter(block => {
      const citation = block.match(/\[(§.*?)\]/)?.[1];
      if (!citation) return true;
      if (seen.has(citation)) return false;
      seen.add(citation);
      return true;
    }).join("\n\n");
  }
  
  private truncate(text: string, maxTokens: number): string {
    const encoding = tiktoken.encoding_for_model("claude-sonnet-4");
    const tokens = encoding.encode(text);
    
    if (tokens.length <= maxTokens) return text;
    
    const truncated = encoding.decode(tokens.slice(0, maxTokens - 50));
    return truncated + "\n\n[Context truncated due to length]";
  }
}
```

**Deliverables:**
- [ ] Context merger with deduplication
- [ ] Token-aware truncation
- [ ] Graph path formatting
- [ ] Vector chunk formatting
- [ ] Citation preservation logic

---

#### Week 3: Graph Schema & Entity Extraction

**Day 15-17: Neo4j Graph Schema**

```cypher
// infra/neo4j/schema.cypher

// Node types
CREATE CONSTRAINT regulation_id IF NOT EXISTS
FOR (r:Regulation) REQUIRE r.section_id IS UNIQUE;

CREATE INDEX regulation_category IF NOT EXISTS
FOR (r:Regulation) ON (r.category);

CREATE FULLTEXT INDEX regulation_text IF NOT EXISTS
FOR (r:Regulation) ON EACH [r.title, r.text_summary];

// Regulation node
CREATE (r:Regulation {
  section_id: "§ 382.211",
  title: "Random Testing",
  part: "Part 382",
  text_summary: "Employers must conduct random drug and alcohol tests...",
  full_text_chunk_id: "uuid-here",
  category: "Drug Testing",
  tenant_id: "default",
  last_updated: datetime()
});

// Compliance Action node
CREATE (a:ComplianceAction {
  action_id: "remove-driver",
  description: "Remove driver from safety-sensitive duty",
  timeframe: "Immediately",
  responsible_party: "Employer",
  tenant_id: "default"
});

// Reporting Requirement node
CREATE (rr:ReportingRequirement {
  report_id: "clearinghouse-report",
  system: "FMCSA Clearinghouse",
  deadline: "Within 2 business days",
  form_number: "N/A",
  tenant_id: "default"
});

// Relationships
CREATE (r)-[:REQUIRES]->(a);
CREATE (a)-[:TRIGGERS]->(rr);
```

**Deliverables:**
- [ ] Graph schema definition
- [ ] Node type constraints
- [ ] Relationship types defined
- [ ] Indexes created
- [ ] Tenant isolation via labels

**Day 18-21: Entity Extraction Pipeline**

```typescript
// services/ingestion-service/src/entity-extractor.ts
export class EntityExtractor {
  async extract(chunk: Chunk, tenantId: string): Promise<GraphEntities> {
    const prompt = `Extract compliance entities from this regulation text.

Text:
${chunk.text}

Return JSON only:
{
  "regulations": [
    {"section_id": "§ 382.211", "title": "Random Testing", "category": "Drug Testing"}
  ],
  "actions": [
    {"description": "Conduct random drug test", "timeframe": "Ongoing", "responsible_party": "Employer"}
  ],
  "relationships": [
    {"source": "§ 382.211", "type": "REQUIRES", "target": "Conduct random drug test"}
  ]
}`;

    const response = await this.llm.generate({
      model: "claude-sonnet-4",
      prompt,
      temperature: 0.1,
      maxTokens: 1000
    });
    
    const entities = JSON.parse(this.cleanJsonResponse(response));
    
    // Validate entities
    await this.validator.validate(entities);
    
    return entities;
  }
  
  private cleanJsonResponse(response: string): string {
    // Strip markdown code fences
    return response.replace(/```json\n?|\n?```/g, "").trim();
  }
}
```

**Deliverables:**
- [ ] Entity extraction prompt template
- [ ] JSON response parser
- [ ] Entity validation logic
- [ ] Batch processing for knowledge base
- [ ] Error handling and retry logic

---

#### Week 4: Module System & Base Commands

**Day 22-24: Module SDK**

```typescript
// packages/command-sdk/src/types/Module.ts
export interface Module {
  id: string;
  name: string;
  version: string;
  category: "base" | "industry" | "experimental";
  
  tools: Tool[];
  knowledgeSources: KnowledgeSource[];
  assistantConfig?: AssistantConfig;
  permissions: Permission[];
  dependencies?: string[];
  
  // Lifecycle hooks
  onInstall?: (tenantId: string) => Promise<void>;
  onEnable?: (tenantId: string) => Promise<void>;
  onDisable?: (tenantId: string) => Promise<void>;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  parameters: ToolParameter[];
  handler: (params: any, context: ToolContext) => Promise<any>;
}

export interface KnowledgeSource {
  id: string;
  type: "markdown" | "pdf" | "docx" | "api";
  path: string;
  indexing: {
    chunkSize: number;
    overlap: number;
    enableGraph: boolean;
  };
}

export interface AssistantConfig {
  name: string;
  role: string;
  systemPrompt: string;
  retrievalStrategy: "vector" | "graph" | "hybrid";
  responseFormat: {
    includeCitations: boolean;
    includeComplianceChain?: boolean;
    includeTimeframes?: boolean;
  };
}

// packages/command-sdk/src/ModuleRegistry.ts
export class ModuleRegistry {
  private modules = new Map<string, Module>();
  
  async register(module: Module): Promise<void> {
    // Validate module
    await this.validator.validate(module);
    
    // Store in registry
    this.modules.set(module.id, module);
    
    // Register tools
    await this.toolRegistry.register(module.tools);
    
    // Index knowledge sources
    await this.indexKnowledge(module.knowledgeSources);
  }
  
  async enableForTenant(
    moduleId: string, 
    tenantId: string
  ): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) throw new Error(`Module ${moduleId} not found`);
    
    // Call lifecycle hook
    if (module.onEnable) {
      await module.onEnable(tenantId);
    }
    
    // Update tenant config
    await this.db.tenantModules.create({
      data: { tenantId, moduleId, enabled: true }
    });
  }
  
  async getEnabledModules(tenantId: string): Promise<Module[]> {
    const bindings = await this.db.tenantModules.findMany({
      where: { tenantId, enabled: true }
    });
    
    return bindings.map(b => this.modules.get(b.moduleId)!);
  }
}
```

**Deliverables:**
- [ ] Module interface definition
- [ ] ModuleRegistry implementation
- [ ] Module validation logic
- [ ] Tenant-module binding system
- [ ] Lifecycle hooks (install/enable/disable)

**Day 25-28: Base Command Modules**

Create starter modules:

```typescript
// modules/base/proposal-command/module.json
{
  "id": "proposal-command",
  "name": "Proposal Command",
  "version": "1.0.0",
  "category": "base",
  "description": "Generate professional business proposals",
  
  "tools": [
    {
      "id": "generate-proposal",
      "name": "Generate Proposal",
      "description": "Create a business proposal from requirements",
      "parameters": [
        {"name": "client", "type": "string", "required": true},
        {"name": "scope", "type": "string", "required": true},
        {"name": "budget", "type": "number", "required": false}
      ]
    }
  ],
  
  "knowledgeSources": [
    {
      "id": "proposal-templates",
      "type": "markdown",
      "path": "./knowledge/templates",
      "indexing": {
        "chunkSize": 400,
        "overlap": 50,
        "enableGraph": false
      }
    }
  ],
  
  "permissions": [
    "create:proposals",
    "read:templates"
  ]
}
```

**Deliverables:**
- [ ] proposal-command module
- [ ] contract-command module
- [ ] invoice-command module
- [ ] task-command module
- [ ] document-command module
- [ ] All modules tested in isolation

---

### Month 2: Fleet Command Rebuild

**Goal:** Extract best of FCS, rebuild as CommandStack module with graph RAG

#### Week 5: Knowledge Base Migration

**Day 29-31: CFR Regulation Extraction**

```bash
# Extract CFR content from FCS repo
cd fleet-compliance-sentinel-v1-archive
tar -czf cfr-knowledge-base.tar.gz knowledge/cfr-title-49/

# Move to CommandStack
cd ../commandstack-platform
tar -xzf ../fleet-compliance-sentinel-v1-archive/cfr-knowledge-base.tar.gz \
  -C modules/industry/fleet-command/knowledge/

# Validate markdown files
node tooling/scripts/validate-knowledge.ts \
  --module fleet-command \
  --source cfr-title-49
```

**Deliverables:**
- [ ] CFR Title 49 Parts 40, 382, 391, 395, 396 copied
- [ ] FMCSA guidance documents copied
- [ ] Knowledge source metadata updated
- [ ] Chunk validation passed

**Day 32-35: Graph Relationship Ingestion**

```typescript
// tooling/scripts/ingest-graph.ts
async function ingestFleetGraph() {
  // 1. Load CFR chunks
  const chunks = await loadChunks("modules/industry/fleet-command/knowledge");
  
  // 2. Extract entities per chunk
  for (const chunk of chunks) {
    const entities = await entityExtractor.extract(chunk, "fleet-command");
    
    // 3. Create nodes in Neo4j
    await createGraphNodes(entities);
    
    // 4. Create relationships
    await createGraphRelationships(entities.relationships);
  }
  
  // 5. Validate graph structure
  const validation = await validateGraph();
  console.log(`Created ${validation.nodeCount} nodes, ${validation.relationshipCount} relationships`);
}

async function createGraphNodes(entities: GraphEntities) {
  // Create Regulation nodes
  for (const reg of entities.regulations) {
    await neo4j.run(`
      MERGE (r:Regulation {section_id: $section_id, tenant_id: $tenant_id})
      SET r.title = $title,
          r.category = $category,
          r.last_updated = datetime()
    `, {
      section_id: reg.section_id,
      title: reg.title,
      category: reg.category,
      tenant_id: "fleet-command"
    });
  }
  
  // Create ComplianceAction nodes
  for (const action of entities.actions) {
    await neo4j.run(`
      MERGE (a:ComplianceAction {
        action_id: $action_id, 
        tenant_id: $tenant_id
      })
      SET a.description = $description,
          a.timeframe = $timeframe,
          a.responsible_party = $responsible_party
    `, action);
  }
}
```

**Deliverables:**
- [ ] Entity extraction completed (500+ regulations)
- [ ] Graph nodes created in Neo4j
- [ ] Relationships established
- [ ] Graph validation passed (80% precision target)

---

#### Week 6: Fleet Tools & Assistant Config

**Day 36-38: Fleet-Specific Tools**

```typescript
// modules/industry/fleet-command/tools/compliance-check.ts
export const complianceCheckTool: Tool = {
  id: "compliance-check",
  name: "Compliance Check",
  description: "Check if a driver or vehicle meets DOT compliance requirements",
  
  parameters: [
    {
      name: "entityType",
      type: "enum",
      values: ["driver", "vehicle"],
      required: true
    },
    {
      name: "checks",
      type: "array",
      items: "string",
      description: "Specific compliance checks to run (e.g., 'medical-cert', 'hours-of-service')"
    }
  ],
  
  handler: async (params, context) => {
    const { entityType, checks } = params;
    const { tenantId } = context;
    
    // Query graph for compliance requirements
    const requirements = await graphRetriever.retrieve(
      `Show all ${entityType} compliance requirements`,
      tenantId
    );
    
    // Run specific checks
    const results = await runComplianceChecks(
      entityType,
      checks,
      requirements
    );
    
    return {
      compliant: results.every(r => r.passed),
      checks: results,
      recommendations: generateRecommendations(results)
    };
  }
};

// modules/industry/fleet-command/tools/violation-cascade.ts
export const violationCascadeTool: Tool = {
  id: "violation-cascade",
  name: "Violation Cascade",
  description: "Show what downstream violations or requirements cascade from an initial violation",
  
  parameters: [
    {
      name: "violation",
      type: "string",
      required: true,
      description: "Initial violation (e.g., 'failed drug test', 'expired medical cert')"
    }
  ],
  
  handler: async (params, context) => {
    const { violation } = params;
    const { tenantId } = context;
    
    // Graph query for cascading violations
    const cascadeQuery = `
      MATCH path = (action:ComplianceAction {description: $violation})
                   -[:LEADS_TO*1..3]->
                   (downstream)
      RETURN path
      ORDER BY length(path)
    `;
    
    const result = await neo4j.run(cascadeQuery, { 
      violation,
      tenantId 
    });
    
    return {
      initialViolation: violation,
      cascade: formatCascadePath(result),
      totalImpact: calculateImpact(result)
    };
  }
};
```

**Deliverables:**
- [ ] compliance-check tool
- [ ] regulation-search tool
- [ ] violation-cascade tool
- [ ] driver-qualification tool
- [ ] vehicle-inspection tool
- [ ] Tool tests with graph queries

**Day 39-42: Pipeline Penny Configuration**

```typescript
// modules/industry/fleet-command/assistant-config.ts
export const pipelinepennyConfig: AssistantConfig = {
  name: "Pipeline Penny",
  role: "DOT compliance expert assistant",
  
  systemPrompt: `You are Pipeline Penny, a DOT compliance expert assistant.

You have access to TWO types of information:
1. REGULATORY RELATIONSHIPS: Graph-based compliance chains showing how regulations connect
2. RELEVANT REGULATIONS: Exact regulatory text from CFR Title 49

When answering:
- If relationships are provided, explain the compliance chain step-by-step
- Always cite specific CFR sections (e.g., § 382.211)
- Distinguish between "what the regulation says" vs "what happens next"
- For cascading violations, show the full chain with timeframes
- If information is incomplete, say so explicitly

Response format for compliance chain questions:
1. Direct answer to the question
2. Step-by-step compliance chain (if applicable)
3. Specific regulatory citations
4. Timeframes and responsible parties
5. Related considerations or warnings

Be precise, be thorough, keep fleet managers compliant.`,
  
  retrievalStrategy: "hybrid", // Always use graph + vector
  
  responseFormat: {
    includeCitations: true,
    includeComplianceChain: true,
    includeTimeframes: true
  },
  
  tools: [
    "compliance-check",
    "regulation-search",
    "violation-cascade",
    "driver-qualification",
    "vehicle-inspection"
  ]
};
```

**Deliverables:**
- [ ] Penny system prompt finalized
- [ ] Retrieval strategy configured (hybrid)
- [ ] Response format defined
- [ ] Tool bindings configured
- [ ] Prompt tested with 20 sample queries

---

#### Week 7: Integration & Testing

**Day 43-45: Wire Fleet Command into Platform**

```typescript
// services/api-gateway/src/routes/chat.ts
import { ModuleRegistry } from "@commandstack/command-sdk";
import { HybridRetriever } from "@commandstack/rag-core";
import { ModelRouter } from "@commandstack/model-router";

app.post("/api/chat", async (req, res) => {
  const { tenantId, message, chatHistory } = req.body;
  
  // 1. Get enabled modules for tenant
  const modules = await moduleRegistry.getEnabledModules(tenantId);
  
  // 2. Get assistant config (from Fleet Command if enabled)
  const assistantConfig = modules
    .find(m => m.assistantConfig)
    ?.assistantConfig || defaultAssistantConfig;
  
  // 3. Retrieve context (graph + vector)
  const retriever = new HybridRetriever(
    vectorRetriever,
    graphRetriever,
    intentClassifier
  );
  const context = await retriever.retrieve(message, tenantId);
  
  // 4. Collect available tools
  const tools = modules.flatMap(m => m.tools);
  
  // 5. Generate response
  const response = await modelRouter.generate({
    model: "claude-sonnet-4",
    systemPrompt: assistantConfig.systemPrompt,
    messages: [...chatHistory, { role: "user", content: message }],
    context,
    tools,
    maxTokens: 2000
  });
  
  // 6. Log for audit
  await auditService.log({
    tenantId,
    action: "chat",
    input: message,
    output: response,
    modules: modules.map(m => m.id),
    timestamp: new Date()
  });
  
  res.json({ response });
});
```

**Deliverables:**
- [ ] Chat endpoint with module support
- [ ] Hybrid retrieval integration
- [ ] Tool execution system
- [ ] Audit logging
- [ ] Error handling

**Day 46-49: End-to-End Testing**

**Test scenarios:**

1. **Factual query (vector-only)**
   ```
   Query: "What does § 382.211 say about random testing frequency?"
   Expected: Exact text from CFR with citation
   Validation: Citation accuracy, text correctness
   ```

2. **Relationship query (graph-only)**
   ```
   Query: "What happens if a driver fails a random drug test?"
   Expected: Compliance chain from graph
   Validation: Path completeness, timeframe accuracy
   ```

3. **Complex query (hybrid)**
   ```
   Query: "Show me all HazMat requirements for tanker trucks"
   Expected: Graph community + vector chunks
   Validation: Coverage, deduplication, formatting
   ```

4. **Tool execution**
   ```
   Query: "Check if this driver is compliant for interstate operations"
   Expected: Compliance check tool invoked with results
   Validation: Tool parameters correct, results accurate
   ```

5. **Multi-turn conversation**
   ```
   Query 1: "What's required for medical certification?"
   Query 2: "How often does it need to be renewed?"
   Expected: Context carried forward, follow-up understood
   Validation: Conversation coherence
   ```

**Deliverables:**
- [ ] 50-query test set executed
- [ ] All test scenarios passed
- [ ] Performance benchmarks recorded
- [ ] Bug fixes deployed
- [ ] Documentation updated

---

### Month 3: Second Module + Production Launch

**Goal:** Prove modularity with second vertical, deploy to production

#### Week 9-10: Realty Command Module

**Why Realty Command second?**
1. Different domain than fleet (proves modularity)
2. Jacob has real estate knowledge (faster build)
3. Simpler compliance than gov contracting (lower risk)
4. Graph use case clear (property ownership chains, lease relationships)

**Day 50-56: Knowledge Base**

```bash
# Acquire realty knowledge
mkdir -p modules/industry/realty-command/knowledge

# Sources:
# - DORA (California Dept of Real Estate)
# - Property management best practices
# - Lease agreement templates
# - Tenant screening requirements

# Chunk and index
node tooling/scripts/ingest-knowledge.ts \
  --module realty-command \
  --source knowledge/
```

**Graph schema additions:**

```cypher
// Property nodes
CREATE (p:Property {
  property_id: "prop-123",
  address: "123 Main St",
  type: "residential",
  tenant_id: "realty-tenant"
});

// Lease nodes
CREATE (l:Lease {
  lease_id: "lease-456",
  start_date: date("2024-01-01"),
  end_date: date("2025-01-01"),
  monthly_rent: 2000.00,
  tenant_id: "realty-tenant"
});

// Tenant nodes (different from platform tenants)
CREATE (t:PropertyTenant {
  tenant_id: "renter-789",
  name: "John Smith",
  tenant_id: "realty-tenant"
});

// Relationships
CREATE (l)-[:FOR_PROPERTY]->(p);
CREATE (t)-[:HAS_LEASE]->(l);
```

**Deliverables:**
- [ ] DORA regulations indexed
- [ ] Property management knowledge indexed
- [ ] Graph schema extended for realty
- [ ] 200+ realty-specific graph nodes created

**Day 57-63: Realty Tools & Assistant**

```typescript
// modules/industry/realty-command/tools/lease-compliance.ts
export const leaseComplianceTool: Tool = {
  id: "lease-compliance",
  name: "Lease Compliance Check",
  description: "Check if a lease agreement meets legal requirements",
  
  parameters: [
    { name: "state", type: "string", required: true },
    { name: "propertyType", type: "string", required: true },
    { name: "leaseTerms", type: "object", required: true }
  ],
  
  handler: async (params, context) => {
    // Graph query for state-specific requirements
    const requirements = await graphRetriever.retrieve(
      `Show lease requirements for ${params.state} ${params.propertyType}`,
      context.tenantId
    );
    
    // Check compliance
    const compliance = checkLeaseCompliance(
      params.leaseTerms,
      requirements
    );
    
    return {
      compliant: compliance.passed,
      issues: compliance.issues,
      recommendations: compliance.recommendations
    };
  }
};

// modules/industry/realty-command/assistant-config.ts
export const realtyRachelConfig: AssistantConfig = {
  name: "Realty Rachel", // Different persona
  role: "Property management compliance expert",
  
  systemPrompt: `You are Realty Rachel, a property management compliance expert.

You help property managers stay compliant with state regulations, manage leases, and handle tenant relationships.

Key areas:
- Lease compliance (state-specific requirements)
- Tenant screening and fair housing
- Property maintenance obligations
- Security deposit handling
- Eviction procedures

Always cite specific regulations and provide practical guidance.`,
  
  retrievalStrategy: "hybrid",
  
  responseFormat: {
    includeCitations: true,
    includeComplianceChain: false, // Different from Fleet
    includeTimeframes: true
  },
  
  tools: [
    "lease-compliance",
    "tenant-screening",
    "maintenance-schedule",
    "security-deposit-calculator"
  ]
};
```

**Deliverables:**
- [ ] lease-compliance tool
- [ ] tenant-screening tool
- [ ] maintenance-schedule tool
- [ ] Realty Rachel assistant config
- [ ] Module registered and tested

---

#### Week 11: Multi-Module Testing

**Day 64-66: Module Switching Tests**

Test scenarios:
1. Tenant with Fleet Command only
2. Tenant with Realty Command only
3. Tenant with both Fleet + Realty
4. Switching modules mid-conversation

**Validation:**
- Module isolation (fleet tools not available in realty tenant)
- Context separation (fleet knowledge not leaked to realty)
- Assistant persona switching
- Tool routing correctness

**Deliverables:**
- [ ] Multi-module test suite
- [ ] Isolation validation
- [ ] Performance under multi-module load
- [ ] Bug fixes deployed

**Day 67-70: Production Deployment Prep**

```bash
# Deploy to production
vercel deploy --prod apps/marketing
vercel deploy --prod apps/app

# Deploy services
railway deploy services/api-gateway
railway deploy services/ai-orchestrator

# Deploy Neo4j
railway deploy infra/neo4j

# Run smoke tests
npm run test:smoke:production
```

**Deliverables:**
- [ ] Production environment configured
- [ ] DNS pointed to commandstack.com
- [ ] SSL certificates installed
- [ ] Monitoring dashboards live
- [ ] Smoke tests passed

---

#### Week 12: Launch & Documentation

**Day 71-73: Documentation**

Create:
- [ ] User guides (how to use Fleet Command, Realty Command)
- [ ] API documentation (for future module developers)
- [ ] Trust center content (security, compliance, privacy)
- [ ] Module development guide
- [ ] Architecture diagrams

**Day 74-77: Soft Launch**

**Beta users:**
- 3 fleet companies (existing FCS users migrated)
- 2 property management companies (new realty users)

**Monitoring:**
- Query latency (target: p95 < 1.8s)
- Error rate (target: < 2%)
- User satisfaction (thumbs up/down)
- Module usage distribution

**Day 78-84: Iterate & Stabilize**

- Fix bugs reported by beta users
- Optimize slow queries
- Improve prompt quality based on feedback
- Add missing features
- Prepare for public launch

---

## Financial Projections

### Development Costs (3 Months)

**Jacob's time:**
- 3 months × 160 hours/month = 480 hours
- Opportunity cost: $50/hour (consulting rate)
- **Total: $24,000** (foregone consulting revenue)

**Infrastructure:**
- Neo4j hosting: $25/month × 3 = $75
- Neon Postgres: $50/month × 3 = $150
- Railway hosting: $40/month × 3 = $120
- Vercel Pro: $20/month × 3 = $60
- Domain registration: $12
- **Total: $417**

**LLM API costs (development):**
- Entity extraction: ~$200
- Testing/iteration: ~$300
- **Total: $500**

**Grand total: ~$25K** (mostly opportunity cost)

---

### Revenue Model

**Pricing Structure:**

```
CommandStack Base Platform: $99/month
  - Up to 5 users
  - Base command modules (proposal, contract, invoice, task, document)
  - 1,000 AI queries/month
  - Standard support

Industry Module Add-Ons:
  Fleet Command:    +$199/month (DOT compliance, driver management)
  Realty Command:   +$149/month (Property management, lease compliance)
  Gov Command:      +$249/month (Federal contracting, FAR/DFARS)
  Training Command: +$99/month  (Curriculum delivery, certification tracking)

Enterprise:
  Custom pricing for 20+ users, unlimited queries, dedicated support
```

**Year 1 Projections (Conservative):**

| Month | Customers | MRR | ARR Run Rate |
|-------|-----------|-----|--------------|
| 4 (Launch) | 5 | $1,490 | $17,880 |
| 6 | 10 | $2,980 | $35,760 |
| 9 | 20 | $5,960 | $71,520 |
| 12 | 35 | $10,430 | $125,160 |

**Assumptions:**
- 5 customers at launch (FCS migration + beta)
- 30% month-over-month growth (conservative for B2B SaaS)
- 70% take 1 module, 30% take 2+ modules
- Average revenue per customer: $298/month

**Break-even analysis:**
- Monthly operating costs: $165 (infrastructure) + $500 (LLM API) = $665
- Break-even customers: 3 (at $298 average)
- **Break-even: Month 4 (at launch)**

---

### Exit Value Comparison

**Scenario A: Fleet Compliance Sentinel (current)**
- Positioning: Niche vertical SaaS
- ARR potential: $150K (fleet compliance market)
- Exit multiple: 2-3x ARR
- **Exit value: $300K-450K**

**Scenario B: CommandStack Platform**
- Positioning: Horizontal AI platform
- ARR potential: $500K+ (multiple verticals)
- Exit multiple: 4-6x ARR
- **Exit value: $2M-3M**

**Value created by repositioning: $1.5M-2.5M**

---

## Risk Register

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Graph extraction accuracy < 80% | Medium | High | Manual validation, iterative prompt tuning, 80% threshold is achievable per research |
| Neo4j performance degrades at scale | Low | Medium | Monitor query times, add indexes, horizontal scaling if needed |
| Module isolation bugs (data leakage) | Medium | Critical | Extensive multi-tenant testing, row-level security, audit all queries |
| LLM API costs exceed budget | Medium | Medium | Implement caching, use Gemini for simple queries, monitor token usage |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| FCS users churn during migration | Low | High | Run both platforms in parallel, migrate slowly, offer migration discount |
| Second module (Realty) doesn't validate modularity | Low | Critical | Thorough testing, document any module-specific hacks, refactor if needed |
| 3-month timeline slips | Medium | Medium | Built-in buffer, MVP definition clear, cut scope if needed (not quality) |
| Competitors launch similar platform | Low | Medium | Speed to market, file provisional patent on graph RAG architecture |

### Financial Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Can't sustain 3 months without revenue | Low | Critical | Keep TNDS consulting active, lean operating budget, emergency consulting available |
| Customer acquisition slower than projected | Medium | Medium | NextGenERP funnel already exists, TNDS client base as warm leads |
| Infrastructure costs higher than estimated | Low | Low | Monitor usage, optimize before scaling, most costs are variable |

---

## Success Criteria

### Month 1 Success Criteria

**Platform Foundation:**
- [ ] Monorepo builds without errors
- [ ] Neo4j + Neon Postgres deployed and accessible
- [ ] RAG Core package: all 3 retrievers working
- [ ] Intent classifier: 80% accuracy on test set
- [ ] Context merger: proper deduplication + truncation
- [ ] Module SDK: can register and load modules
- [ ] Base commands: 3+ modules created and tested

**Technical Metrics:**
- Graph query latency: < 200ms (p95)
- Vector query latency: < 200ms (p95)
- Context merge latency: < 100ms
- End-to-end query: < 1.5s (p95)

**Deliverables:**
- [ ] Architecture documentation complete
- [ ] All code reviewed and merged to main
- [ ] CI/CD pipeline functional
- [ ] Local development environment setup documented

---

### Month 2 Success Criteria

**Fleet Command Module:**
- [ ] CFR knowledge base ingested (Parts 40, 382, 391, 395, 396)
- [ ] Graph: 500+ regulation nodes created
- [ ] Graph: 1000+ relationships established
- [ ] Entity extraction: 80% precision validated
- [ ] 5 fleet-specific tools implemented and tested
- [ ] Pipeline Penny config finalized
- [ ] 50-query test set: 85% pass rate

**Quality Metrics:**
- Single-hop questions: 85% accuracy
- Multi-hop questions: 75% accuracy
- Citation accuracy: 95%
- Compliance chain completeness: 80%

**Migration:**
- [ ] FCS data migrated to CommandStack
- [ ] Existing users able to access via new platform
- [ ] Feature parity with FCS achieved
- [ ] Zero data loss during migration

---

### Month 3 Success Criteria

**Realty Command Module:**
- [ ] Realty knowledge base ingested
- [ ] Graph: 200+ realty nodes created
- [ ] 4 realty-specific tools implemented
- [ ] Realty Rachel assistant config validated
- [ ] Module switch testing: 100% isolation verified

**Multi-Module Validation:**
- [ ] Tenant with Fleet only: works
- [ ] Tenant with Realty only: works
- [ ] Tenant with both: works, no cross-contamination
- [ ] Module enabling/disabling: seamless

**Production Launch:**
- [ ] commandstack.com live
- [ ] 5+ paying customers
- [ ] p95 latency < 1.8s in production
- [ ] Error rate < 2%
- [ ] User satisfaction > 80% thumbs up

**Documentation:**
- [ ] User guides published
- [ ] API docs published
- [ ] Trust center live (security, compliance, privacy)
- [ ] Module development guide published

---

## Decision Log

### Decision #1: Option B (Parallel Build)
**Date:** April 4, 2026  
**Decision:** Build CommandStack from scratch (Option B) instead of surgical extraction (Option A)  
**Rationale:**
- Graph-augmented RAG from Day 1 (no retrofit pain)
- Clean architecture supports SOC 2, multi-tenant, enterprise scale
- Higher quality, no technical debt
- Better long-term positioning

**Trade-offs accepted:**
- 3 months vs 2 weeks timeline
- No revenue during build (mitigated by keeping TNDS consulting active)
- Higher initial complexity

**Committed by:** Jacob Johnston

---

### Decision #2: Platform Brand = CommandStack
**Date:** April 4, 2026  
**Decision:** New platform domain commandstack.com (to be registered)  
**Rationale:**
- Clear separation from niche products (Fleet Compliance Sentinel)
- Positions as horizontal platform, not vertical tool
- Supports multi-module strategy
- Higher exit valuation (4-6x vs 2-3x)

**Trade-offs accepted:**
- Need to market new brand (vs leveraging Pipeline Punks awareness)
- Domain registration cost ($12)

**Committed by:** Jacob Johnston

---

### Decision #3: Graph RAG Architecture = LightRAG
**Date:** April 4, 2026  
**Decision:** Use LightRAG dual-retrieval architecture as base  
**Rationale:**
- Research shows 40% faster than GraphRAG
- Incremental update support (don't rebuild entire graph for new docs)
- Production implementations exist (proven approach)
- 30-40% improvement on multi-hop questions

**Trade-offs accepted:**
- Additional complexity vs vector-only
- $45/month infrastructure cost increase
- Neo4j learning curve

**Committed by:** Jacob Johnston

---

### Decision #4: Second Module = Realty Command
**Date:** April 4, 2026  
**Decision:** Build Realty Command as second module (not Gov Command)  
**Rationale:**
- Different domain than fleet (proves modularity)
- Jacob has domain knowledge (faster build)
- Simpler compliance than federal contracting (lower risk)
- Clear graph use case (property chains, lease relationships)

**Trade-offs accepted:**
- Smaller market than Gov Command initially
- Less synergy with TNDS gov contracting focus

**Committed by:** Jacob Johnston

---

### Decision #5: Base Commands Included by Default
**Date:** April 4, 2026  
**Decision:** Every tenant gets base commands (proposal, contract, invoice, task, document) included in platform subscription  
**Rationale:**
- Demonstrates platform value immediately
- Differentiates from "just another AI chatbot"
- Creates stickiness before industry modules
- Allows testing module system with low-risk commands

**Trade-offs accepted:**
- More initial development (8 modules vs 0)
- Can't charge separately for base commands

**Committed by:** Jacob Johnston

---

### Decision #6: Penny = Default, Customizable Personas
**Date:** April 4, 2026  
**Decision:** Keep Pipeline Penny as default, allow tenant-specific rebranding  
**Rationale:**
- Penny brand has recognition from FCS
- Customization prevents persona lock-in
- Supports white-label future
- Each module can suggest persona (Realty Rachel, Gov Grace)

**Trade-offs accepted:**
- Complexity in managing multiple assistant configs
- Potential brand dilution if tenants all rename

**Committed by:** Jacob Johnston

---

### Decision #7: 3-Month Timeline Non-Negotiable
**Date:** April 4, 2026  
**Decision:** Ship production platform by end of Month 3, no extensions  
**Rationale:**
- Prevents scope creep
- Forces MVP discipline
- Market window (competitors will catch up)
- Jacob's financial runway

**Trade-offs accepted:**
- Features will be cut if timeline pressured
- Quality over features (better to ship fewer modules well)

**Committed by:** Jacob Johnston

---

### Decision #8: Keep FCS Running During Build
**Date:** April 4, 2026  
**Decision:** Archive FCS repo but keep deployed for existing users  
**Rationale:**
- Can't go dark for 3 months if paying users exist
- Reduces migration pressure
- Allows gradual cutover
- Fallback if CommandStack build fails

**Trade-offs accepted:**
- Maintaining two codebases temporarily
- Potential confusion for users during transition

**Committed by:** Jacob Johnston

---

## Immediate Next Actions

### This Weekend (April 5-6, 2026)

**Saturday:**
- [ ] Register commandstack.com or commandstack.io domain
- [ ] Create commandstack-platform GitHub repo
- [ ] Archive fleet-compliance-sentinel repo with README
- [ ] Set up Turborepo monorepo structure
- [ ] Install dependencies and configure tooling

**Sunday:**
- [ ] Deploy Neo4j Docker container locally
- [ ] Create Neon Postgres database
- [ ] Set up base package structure
- [ ] Create placeholder modules/ directory
- [ ] Write initial ARCHITECTURE.md

---

### Week 1 (April 7-13, 2026)

**Monday-Tuesday:**
- [ ] Build VectorRetriever (copy from FCS, strip fleet coupling)
- [ ] Build GraphRetriever (Neo4j Cypher queries)
- [ ] Build IntentClassifier (rule-based)

**Wednesday-Thursday:**
- [ ] Build HybridRetriever (orchestration)
- [ ] Build ContextMerger (deduplication + truncation)
- [ ] Unit tests for all retrievers

**Friday:**
- [ ] Module SDK interfaces defined
- [ ] ModuleRegistry implementation started
- [ ] Review week, adjust plan if needed

---

### Month 1 Checkpoint (April 30, 2026)

**Expected state:**
- ✅ Platform foundation complete
- ✅ RAG Core with graph + vector working
- ✅ Module system functional
- ✅ 3 base command modules created
- ✅ Neo4j graph schema defined
- ✅ Entity extraction pipeline working

**Go/No-Go Decision:**
- If platform foundation is solid → Proceed to Month 2 (Fleet Command rebuild)
- If major issues remain → Extend Month 1, compress Month 2
- If fundamental architecture broken → Pivot to Option A (surgical extraction)

---

### Month 2 Checkpoint (May 31, 2026)

**Expected state:**
- ✅ Fleet Command module complete
- ✅ CFR knowledge base ingested
- ✅ Graph relationships established
- ✅ Pipeline Penny working with hybrid retrieval
- ✅ 50-query test set passing at 85%
- ✅ FCS users migrated

**Go/No-Go Decision:**
- If Fleet Command proves modularity → Proceed to Month 3 (Realty + launch)
- If module isolation issues → Fix before Month 3
- If quality below target → Extend testing, delay launch

---

### Month 3 Checkpoint (June 30, 2026)

**Expected state:**
- ✅ Realty Command module live
- ✅ Multi-module testing passed
- ✅ Production deployment complete
- ✅ commandstack.com live
- ✅ 5+ paying customers
- ✅ Documentation published

**Success Criteria:**
- Platform validation: 2 modules prove architecture
- Revenue validation: Customers paying for modules
- Technical validation: Performance + quality targets met
- Market validation: Users prefer CommandStack over FCS

**Post-Launch:**
- Continue TNDS consulting (revenue stability)
- Market CommandStack via NextGenERP funnel
- Build Gov Command (Month 4-5)
- Pursue SOC 2 Type I certification (Month 6+)

---

## Appendix: Key Documents Reference

### Research Foundation
1. **Graph-Augmented RAG Research Paper**
   - LightRAG architecture (dual-level retrieval)
   - GraphRAG community detection
   - HippoRAG personalization
   - Performance benchmarks

2. **Deep Research Report**
   - Retrieval system comparison
   - Implementation guidance
   - Production considerations

### Strategic Planning
3. **Domain Discussion Document**
   - Business ecosystem mapping
   - NextGenERP funnel strategy
   - Cross-domain synergies

4. **CommandStack Naming Document**
   - Brand hierarchy
   - Module structure
   - Base model LLM design
   - Repository layout

### Architecture
5. **Graph-Augmented RAG Architecture (Previous)**
   - Neo4j schema design
   - Cypher query templates
   - Intent classification logic
   - Context merging strategy
   - Performance requirements

---

## Commitment Statement

**I, Jacob Johnston, commit to:**

1. **Building CommandStack platform** using Option B (parallel build, 3-month timeline)

2. **Registering commandstack.com** domain this weekend (April 5-6, 2026)

3. **Following the implementation roadmap** with monthly checkpoints

4. **Maintaining quality standards:**
   - 80% graph extraction precision
   - 85% query accuracy on test sets
   - < 1.8s p95 latency in production

5. **Shipping on schedule:**
   - Month 1: Platform foundation
   - Month 2: Fleet Command module
   - Month 3: Realty Command + production launch

6. **Making go/no-go decisions** at each monthly checkpoint based on objective criteria

7. **Pivoting if necessary** but defaulting to completing the plan

**This is not an experiment. This is a commitment to execution.**

---

**Signed (Digitally):**  
Jacob Johnston  
True North Data Strategies LLC  
April 4, 2026

---

## Document Control

**Version:** 1.0.0  
**Status:** Active Decision Record  
**Next Review:** May 1, 2026 (Month 1 Checkpoint)  
**Archived:** No  
**Location:** `/commandstack-platform/docs/decisions/COMMAND-STACK-DECISIONS.md`

---

**END OF DOCUMENT**
