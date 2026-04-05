# Fleet Compliance Sentinel - Architecture & Evolution Strategy

**Version:** 2.0 (World Model Analysis Edition)  
**Last Updated:** April 4, 2026  
**Owner:** Jacob Johnston, True North Data Strategies  
**System:** Pipeline Penny AI Compliance Assistant  
**Status:** Production + Evolution to CommandStack Platform

---

## Document Updates

**v2.0 (2026-04-04):**
- ✅ Added World Model Analysis (LeCun framework)
- ✅ Assessed production system against world model principles
- ✅ Documented critical feedback loop gaps
- ✅ Defined incremental evolution strategy (Option C)
- ✅ Prioritized immediate fixes over 3-month rebuild
- ✅ Added CommandStack migration path with decision gates

**v1.0 (2026-04-04):**
- Initial graph-augmented RAG architecture
- Neo4j integration design
- LightRAG dual-retrieval approach

---

## Executive Summary

### The Discovery

Fleet Compliance Sentinel (FCS) is **production-grade for operations, prototype-grade for AI**. World model analysis reveals:

**Production Strengths (Keep):**
- Real-time telematics integration (world-class state capture)
- Automated compliance alerts (proactive monitoring)
- Training LMS with state transitions (temporal modeling)
- Module gateway with closed feedback loops

**Critical Gaps (Fix Immediately):**
- Knowledge freshness monitoring (2-3 days to implement)
- Citation verification (2 days to implement)
- Outcome tracking system (1 week to implement)
- No validation of Penny's predictions vs. reality

**CommandStack Evolution Path:**
- Graph-augmented RAG adds compliance chain reasoning
- Module system enables multi-vertical expansion
- But doesn't require 3-month rebuild

**Recommended Strategy:** Incremental evolution, not revolutionary rebuild.

---

## Table of Contents

1. [World Model Analysis](#world-model-analysis)
2. [Production System Assessment](#production-system-assessment)
3. [Current Architecture (Baseline)](#current-architecture-baseline)
4. [Graph-Augmented Architecture](#graph-augmented-architecture)
5. [Feedback Loop Closure Plan](#feedback-loop-closure-plan)
6. [CommandStack Evolution Strategy](#commandstack-evolution-strategy)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Performance Requirements](#performance-requirements)
9. [Risk Register](#risk-register)
10. [Success Metrics](#success-metrics)

---

## World Model Analysis

### Framework Overview

Based on LeCun's world model principles:
- **LLMs learn static knowledge** (what people have said)
- **World models learn dynamic rehearsal** (what happens next when you do something)

Every operational system analyzed through four lenses:
1. **State Space (s_t)** — What matters right now, represented actionably
2. **Action Space (a_t)** — What decisions can actually be made
3. **Transition Function (s_t, a_t → s_{t+1})** — How actions change outcomes
4. **Feedback Loop** — Did the prediction match reality?

### Production System Score: 6.5/10

| Dimension | Score | Current State | Target State |
|-----------|-------|---------------|--------------|
| **State Capture** | 7/10 | Excellent telematics + alerts, missing knowledge freshness | 9/10 with monitoring |
| **Action Mapping** | 8/10 | Strong automation, missing outcome tracking | 8/10 (already good) |
| **Transition Modeling** | 6/10 | Good for training/alerts, poor for compliance chains | 9/10 with graph |
| **Feedback Loops** | 5/10 | Closed for infrastructure, broken for AI | 7/10 with tracking |
| **Physics Grounding** | 6/10 | Date-based triggers solid, regulatory hierarchy implicit | 8/10 with graph |

---

## Production System Assessment

### State Capture Analysis

#### Currently Tracked State (Production)

| Variable | Tracked? | Refresh Rate | Leading/Lagging | Shadow/Reality | Priority Gap |
|----------|----------|--------------|-----------------|----------------|--------------|
| **Assets (Vehicles)** | ✅ Yes | Manual/import | Leading | Reality | ✅ Good |
| **Drivers** | ✅ Yes | Manual/import | Leading | Reality | ✅ Good |
| **Permits** | ✅ Yes | Manual | Leading | Shadow | 🟡 Medium |
| **DQ Files** | ✅ Yes | Manual | Lagging | Shadow | 🟡 Medium |
| **Suspense Items** | ✅ Yes | Manual | Leading | Shadow | 🟡 Medium |
| **Training Records** | ✅ Yes | Automated | Lagging | Reality | ✅ Good |
| **Telematics (GPS/Risk)** | ✅ Yes | Real-time (Verizon Reveal) | Leading | Reality | ✅ **EXCELLENT** |
| **CFR Knowledge Base** | ✅ Yes | Static (25,616 chunks) | Leading | Reality | 🔴 **CRITICAL GAP** |
| **Penny Query/Response** | ✅ Yes | Real-time | Lagging | Shadow | 🟢 Low |
| **User Feedback (thumbs)** | ✅ Yes | Real-time | Lagging | Shadow | 🟢 Low |
| **Compliance Alerts** | ✅ Yes | Daily cron | Leading | Reality | ✅ **EXCELLENT** |
| **Invoice/Spend Tracking** | ✅ Yes | Manual | Lagging | Reality | ✅ Good |
| **Audit Logs (Datadog)** | ✅ Yes | Real-time | Lagging | Reality | ✅ Good |
| **Module Gateway Metrics** | ✅ Yes | Per-request | Lagging | Reality | ✅ Good |
| **Training Assessment Results** | ✅ Yes | Per-completion | Lagging | Reality | ✅ Good |
| **Hazmat Cert Status** | ✅ Yes | Auto-updated | Leading | Reality | ✅ **EXCELLENT** |
| **Citation Accuracy** | ❌ No | N/A | Lagging | Reality | 🔴 **CRITICAL** |
| **Knowledge Freshness** | ❌ No | N/A | Leading | Reality | 🔴 **CRITICAL** |
| **User Action Post-Query** | ❌ No | N/A | Leading | Reality | 🔴 **CRITICAL** |
| **Decision Outcome** | ❌ No | N/A | Lagging | Reality | 🔴 **CRITICAL** |
| **Actual Violations** | ❌ No | N/A | Lagging | Reality | 🔴 **CRITICAL** |
| **Penny Retrieval Quality** | ❌ No | N/A | Lagging | Reality | 🟡 Medium |

#### Production Strengths (World Model Gold Standard)

**1. Real-Time Telematics Integration**
```
State: Vehicle location, speed, harsh braking, idling time
Refresh: Real-time via Verizon Reveal API
Type: REALITY (direct sensor measurement)

Why this is excellent:
✅ Measures actual driver behavior, not reported behavior
✅ Enables predictive risk scoring
✅ Leading indicator (catch violations before they happen)
✅ Closed feedback loop (behavior → score → intervention)

World Model Strength: Observable reality, not shadow metrics
```

**2. Automated Compliance Alerts**
```
State: Medical cert expiration, drug test due dates, inspection overdue
Refresh: Daily cron sweep
Type: REALITY (date-based triggers)

Why this is excellent:
✅ Proactive, not reactive
✅ Prevents violations before they occur
✅ Automated action (email alert) without human intervention
✅ Suspense tracking enables outcome measurement

World Model Strength: Temporal state transitions modeled
```

**3. Training LMS with Auto-Updated Compliance**
```
State: Hazmat certification status per driver
Refresh: Automated on assessment completion
Type: REALITY (actual test results)

Why this is excellent:
✅ Training completion → Compliance record updated automatically
✅ State transition modeled: Uncertified → Trained → Certified → Expired
✅ Feedback loop: Assessment results validate knowledge retention

World Model Strength: Explicit state machine with validation
```

#### Critical Production Gaps

**Gap #1: Knowledge Base Freshness (BROKEN FEEDBACK LOOP)**
```
Current: 25,616 chunks indexed statically
Problem: CFR regulations change, FMCSA issues bulletins
Reality: No detection when indexed knowledge becomes outdated

Production Impact:
  User: "What's the random testing rate?"
  Penny: "50%" (from indexed CFR § 382.211)
  Reality: FMCSA updated to 60% three months ago
  Result: Manager stays at 50% → Violation → Fine

World Model Violation: Static knowledge in dynamic environment
Fix Required: Daily hash comparison of CFR sources
Effort: 2-3 days
Impact: CRITICAL (prevents outdated advice)
```

**Gap #2: Citation Verification (NO VALIDATION)**
```
Current: Penny cites § 382.211, § 391.45, etc.
Assumption: LLM doesn't hallucinate citations
Reality: LLMs frequently hallucinate regulatory citations

Available Data (Unused):
  ✅ 25,616 chunks in vector store
  ✅ Can validate every citation post-generation
  ✅ Can compute confidence score
  ✅ Can flag hallucinations before showing to user

World Model Violation: Predictions without ground truth validation
Fix Required: Post-generation citation check
Effort: 2 days
Impact: HIGH (prevents misinformation)
```

**Gap #3: Outcome Tracking (OPEN LOOP)**
```
Current: Query → Answer → [BLACK BOX]

Production infrastructure exists:
  ✅ Alert engine (can send follow-up emails)
  ✅ Datadog audit logs (can tie query → outcome)
  ✅ Suspense system (can track action completion)

Missing:
  ❌ Did user take the suggested action?
  ❌ Was action successful?
  ❌ Did prediction prevent violation?

World Model Violation: No validation of advice effectiveness
Fix Required: 7-day follow-up email system
Effort: 1 week
Impact: CRITICAL (only way to validate model)
```

**Gap #4: Penny Prediction Validation (BROKEN LOOP)**
```
Current: Penny predicts "If you do X, outcome Y happens"
Feedback: None

Example:
  Penny: "You must remove driver from safety-sensitive duty"
  Missing:
    ❌ Was driver actually removed?
    ❌ Was Clearinghouse report filed?
    ❌ On time (2 business days)?
    ❌ Any violations/fines resulted?

World Model Violation: Predictions never tested against reality
Fix Required: Compliance outcome reporting
Effort: 2 weeks (requires UI + validation workflow)
Impact: CRITICAL (validates compliance chain accuracy)
```

**Gap #5: Actual Violations (NO GROUND TRUTH)**
```
Current: Compliance alerts prevent violations (proactive)
Missing: Record when violations actually occur

Why this matters:
  ❌ Can't validate alert effectiveness
  ❌ Can't validate Penny advice quality
  ❌ Can't identify knowledge gaps
  ❌ Can't measure ROI

World Model Violation: No ground truth for model validation
Fix Required: Violation reporting workflow
Effort: 2 weeks
Impact: HIGH (ultimate success metric)
```

---

### Action Mapping Analysis

#### Decision Inventory (Production)

| Decision | Decision Maker | Trigger Condition | Current Latency | Automation Status |
|----------|----------------|-------------------|-----------------|-------------------|
| **Alert generation** | Cron job | Cert expires <30 days | Daily | ✅ Fully automated |
| **Telematics risk score** | Algorithm | Event detected | Real-time | ✅ Fully automated |
| **Training cert update** | Assessment engine | Test passed ≥80% | <1s | ✅ Fully automated |
| **Penny retrieval** | RAG pipeline | User submits query | <2s | ✅ Fully automated |
| **Module gateway routing** | Gateway orchestrator | Tool invoked | <100ms | ✅ Fully automated |
| **Data import validation** | Import pipeline | XLSX uploaded | <5s | ✅ Fully automated |
| **Compliance record update** | User (manual) | Alert received | Hours-Days | 🟡 Should be semi-automated |
| **Knowledge base update** | Jacob (manual) | CFR changes | ❌ Never | 🔴 Should be auto-detected |
| **Citation validation** | ❌ Not happening | Penny generates response | ❌ N/A | 🔴 Should be automatic |
| **Outcome tracking** | ❌ Not happening | 7 days post-query | ❌ N/A | 🟡 Semi-automated (email) |

#### Strong Action Automation (Keep These)

**1. Compliance Alert Engine (Production Win)**
```
Trigger: Medical cert expires in 14 days
Action: Email to fleet manager (automated)
Latency: 24 hours max (daily cron)
Effectiveness: EXCELLENT (proactive prevention)

World Model Strength:
  State (expiration date) → Prediction (will expire) 
    → Action (alert) → Outcome (manager renews)
  Feedback loop: IF cert renewed → alert worked, ELSE → escalate
```

**2. Training Certification Auto-Update (Production Win)**
```
Trigger: Driver completes hazmat assessment ≥80%
Action: Update compliance record, generate certificate
Latency: <1 second
Effectiveness: EXCELLENT (zero manual work)

World Model Strength:
  State (uncertified) → Action (complete training) 
    → Transition (certified) → Audit trail
  Feedback loop: Assessment score validates knowledge retention
```

**3. Telematics Risk Scoring (Production Win)**
```
Trigger: Verizon Reveal event (harsh brake, speeding, idling)
Action: Calculate risk score, flag high-risk drivers
Latency: Real-time
Effectiveness: EXCELLENT (leading indicator)

World Model Strength:
  Actual behavior measurement (reality, not shadow)
  Enables predictive intervention before violations
```

---

### Transition Modeling Analysis

#### Explicit State Machines (Production)

**Training System (EXCELLENT)**
```
State Machine:
  Uncertified → Enrolled → In Progress → Assessed → Certified → Expired

Triggers:
  Uncertified: No record exists
  Enrolled: Driver assigned to module
  In Progress: Module started
  Assessed: Test completed
  Certified: Score ≥80%
  Expired: 365 days since certification

World Model Strength:
  ✅ Clear state transitions
  ✅ Deterministic triggers
  ✅ Audit trail of all transitions
  ✅ Automated progression
```

**Alert Lifecycle (GOOD)**
```
State Machine:
  Created → Pending → Acknowledged → Resolved → Overdue

Triggers:
  Created: System detects condition (cert expiring)
  Pending: Alert sent to user
  Acknowledged: User clicks notification
  Resolved: User marks complete
  Overdue: Deadline passed without resolution

World Model Strength:
  ✅ Tracks action completion
  ✅ Escalation on overdue
  ✅ Measurable outcomes
```

#### Missing State Machines (Gaps)

**Penny Advice Lifecycle (BROKEN)**
```
Current:
  Query → Answer → [UNKNOWN]

Should Be:
  Query → Answer → Action Taken? → Outcome? → Validated?

Missing States:
  ❌ User acknowledged advice
  ❌ User took suggested action
  ❌ Action completed successfully
  ❌ Prediction was accurate

World Model Gap: No state transitions after response generation
```

**Knowledge Drift (NO MODEL)**
```
Current:
  Indexed → [Assumed Static Forever]

Should Be:
  Indexed → Current → Stale → Deprecated → Re-indexed

Missing States:
  ❌ Knowledge freshness score
  ❌ Staleness detected
  ❌ User warned
  ❌ Re-indexing scheduled

World Model Gap: Static knowledge in dynamic environment
```

---

### Feedback Loop Analysis

#### Production Feedback Loops

| Prediction | Feedback Mechanism | Time to Feedback | Loop Status | Improvement Potential |
|------------|-------------------|------------------|-------------|----------------------|
| **Alert triggers action** | ✅ Suspense resolution tracking | Hours-Days | 🟡 OPEN | Track actual cert renewal |
| **Training improves compliance** | ✅ Assessment scores | Immediate | 🟡 OPEN | Correlate with violations |
| **Telematics predicts risk** | ⚠️ Violation occurred? | Weeks-Months | 🔴 DELAYED | Need violation reporting |
| **Penny citation accuracy** | ❌ None | N/A | 🔴 BROKEN | Post-generation validation |
| **Penny advice effectiveness** | ❌ None | N/A | 🔴 BROKEN | Outcome tracking system |
| **Knowledge freshness** | ❌ None | N/A | 🔴 BROKEN | Regulatory change monitoring |
| **Import validation** | ✅ Error logs | Immediate | ✅ **CLOSED** | Well-functioning |
| **Module gateway performance** | ✅ Latency metrics | Real-time | ✅ **CLOSED** | Well-functioning |

#### Closed Loops (Production Strengths)

**Loop #1: Import Validation (EXCELLENT)**
```
Prediction: "XLSX schema matches expected format"
Action: Parse, validate, save
Feedback: Error count, rollback if invalid
Time to Feedback: <5 seconds
Loop Status: ✅ CLOSED

Result:
  ✅ 13 collection schemas validated
  ✅ Immediate error detection
  ✅ Rollback on failure
  ✅ User sees validation results

World Model Strength: Fast, deterministic, validated
```

**Loop #2: Module Gateway Performance (EXCELLENT)**
```
Prediction: "Tool execution succeeds within latency budget"
Action: Route tool call, execute, track metrics
Feedback: Latency, errors, cost
Time to Feedback: Per-request
Loop Status: ✅ CLOSED

Result:
  ✅ 7-layer enterprise hardening
  ✅ Cost tracking per tool
  ✅ Retry logic on failure
  ✅ Audit logging

World Model Strength: Observable, measurable, tunable
```

#### Broken Loops (Critical Gaps)

**Loop #3: Penny Citation Accuracy (BROKEN)**
```
Prediction: "§ 382.211 says X"
Feedback: ❌ None
Time to Feedback: Never
Loop Status: 🔴 BROKEN

Available Data (Unused):
  ✅ 25,616 chunks in vector store
  ✅ Could validate every citation post-generation
  ✅ Could compute confidence score
  ✅ Could flag hallucinations

Fix Available: YES (straightforward implementation)
Effort: 2 days
Impact: HIGH (prevents misinformation)
```

**Loop #4: Penny Advice Effectiveness (BROKEN)**
```
Prediction: "If you do X, outcome Y happens"
Feedback: ❌ None
Time to Feedback: Never
Loop Status: 🔴 BROKEN

Available Infrastructure (Unused):
  ✅ Alert engine (could send follow-up emails)
  ✅ Datadog audit logs (could tie query → outcome)
  ✅ Suspense system (could track action completion)

Fix Available: YES (but requires user engagement)
Effort: 1 week
Impact: CRITICAL (only way to validate model)
```

---

## Current Architecture (Baseline)

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (Next.js)                 │
│                  https://pipelinepunks.com                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP POST /api/chat
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Railway/Render)                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Query Processing Pipeline                     │  │
│  │  1. Receive user query                               │  │
│  │  2. Generate embedding (OpenAI text-embedding-3)     │  │
│  │  3. FAISS similarity search (top-k=5)                │  │
│  │  4. Retrieve chunks from Neon Postgres               │  │
│  │  5. Build context window (2000 tokens max)           │  │
│  │  6. Send to Claude Sonnet 4 via Anthropic API        │  │
│  │  7. Return generated response                        │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐  ┌─────────────┐  ┌──────────────┐
│   FAISS      │  │    Neon     │  │   Claude     │
│  (Vector     │  │  Postgres   │  │  Sonnet 4    │
│   Index)     │  │  (Chunks)   │  │  (via API)   │
└──────────────┘  └─────────────┘  └──────────────┘

Knowledge Base:
- 25,616 chunks (CFR Title 49 Parts 40, 382, 391, 392, 395, 396)
- Static indexing (no freshness monitoring)
- Vector-only retrieval (no graph relationships)
```

### Current Performance

- **Query Latency:** 800ms-1.2s (p95)
  - Embedding generation: 150ms
  - FAISS search: 50ms
  - Postgres retrieval: 100ms
  - Claude API call: 500-900ms
- **Accuracy:** 78% on single-hop questions, 42% on multi-hop questions
- **Monthly Cost:** $120 (Neon Postgres + Railway + Claude API)

### Current Limitations

**1. No Multi-Hop Reasoning**
```
Query: "What happens if I fail a random drug test?"
Current: Returns § 382.211 text only
Missing: Compliance chain (Remove driver → File Clearinghouse report → RTD process)
```

**2. No Relationship Modeling**
```
Query: "Show all HazMat requirements for tanker trucks"
Current: Returns scattered chunks from vector search
Missing: Graph community of related HazMat regulations
```

**3. No Temporal State**
```
Current: Date-based alerts in Postgres (flat data)
Missing: Temporal relationships in graph (what expires when, what triggers what)
```

---

## Graph-Augmented Architecture

### Target System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (Next.js)                 │
│                  https://pipelinepunks.com                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP POST /api/chat
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Railway/Render)                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Intent Classifier (Orchestrator)              │  │
│  │  Analyzes query → Routes to Graph/Vector/Hybrid      │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│         ┌────────────┼────────────┐                        │
│         ▼            ▼            ▼                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │  Graph   │ │  Vector  │ │  Hybrid  │                  │
│  │  Query   │ │  Query   │ │  Query   │                  │
│  │ Pipeline │ │ Pipeline │ │ Pipeline │                  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘                  │
│       │            │            │                         │
│       └────────────┼────────────┘                         │
│                    │                                       │
│  ┌─────────────────▼──────────────────────────────────┐  │
│  │      Context Merger & LLM Generation               │  │
│  │  - Combines graph paths + vector chunks             │  │
│  │  - Builds enriched context (3000 tokens max)        │  │
│  │  - Sends to Claude Sonnet 4                         │  │
│  └─────────────────┬──────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────────┐
        ▼            ▼            ▼                ▼
┌──────────────┐ ┌─────────────┐ ┌──────────┐ ┌──────────────┐
│    Neo4j     │ │   FAISS     │ │   Neon   │ │   Claude     │
│  (Graph DB)  │ │  (Vector    │ │ Postgres │ │  Sonnet 4    │
│              │ │   Index)    │ │ (Chunks) │ │  (via API)   │
└──────────────┘ └─────────────┘ └──────────┘ └──────────────┘
```

### Neo4j Graph Schema

```cypher
// Node Types

CREATE CONSTRAINT regulation_id IF NOT EXISTS
FOR (r:Regulation) REQUIRE r.section_id IS UNIQUE;

CREATE INDEX regulation_category IF NOT EXISTS
FOR (r:Regulation) ON (r.category);

// Regulation node
(:Regulation {
  section_id: "§ 382.211",
  title: "Random Testing",
  part: "Part 382",
  text_summary: "Employers must conduct random drug and alcohol tests...",
  full_text_chunk_id: UUID,  // FK to Neon Postgres chunk
  category: "Drug Testing",
  tenant_id: "default",
  last_updated: DATETIME
})

// Compliance Action node
(:ComplianceAction {
  action_id: "remove-driver",
  description: "Remove driver from safety-sensitive duty",
  timeframe: "Immediately",
  responsible_party: "Employer",
  tenant_id: "default"
})

// Reporting Requirement node
(:ReportingRequirement {
  report_id: "clearinghouse-report",
  system: "FMCSA Clearinghouse",
  deadline: "Within 2 business days",
  form_number: "N/A",
  tenant_id: "default"
})

// Relationships
(:Regulation)-[:REQUIRES]->(:ComplianceAction)
(:ComplianceAction)-[:TRIGGERS]->(:ReportingRequirement)
(:Regulation)-[:CROSS_REFERENCES]->(:Regulation)
(:Regulation)-[:SUPERSEDES]->(:Regulation)
```

### Intent Classification

```python
class IntentClassifier:
    """Routes queries to appropriate retrieval strategy."""
    
    GRAPH_PATTERNS = [
        r"what (happens|triggers|leads to|results in)",
        r"show (all|everything) (related to|connected to)",
        r"what else (do I need|is required)",
        r"cascading|downstream|upstream",
        r"what if",
        r"compliance chain"
    ]
    
    VECTOR_PATTERNS = [
        r"what (does|is) (§|section|part) \d+",
        r"exact (text|wording|language)",
        r"quote|citation",
        r"specific requirement",
        r"definition of"
    ]
    
    def classify(self, query: str) -> str:
        """Returns 'graph', 'vector', or 'hybrid'"""
        query_lower = query.lower()
        
        graph_score = sum(1 for p in self.GRAPH_PATTERNS if re.search(p, query_lower))
        vector_score = sum(1 for p in self.VECTOR_PATTERNS if re.search(p, query_lower))
        
        if graph_score > vector_score:
            return "graph"
        elif vector_score > 0:
            return "vector"
        else:
            return "hybrid"  # Default for ambiguous queries
```

### Context Merger

```python
class ContextMerger:
    """Combines graph paths and vector chunks."""
    
    MAX_TOKENS = 3000
    
    def merge(self, graph_results=None, vector_results=None) -> str:
        parts = []
        
        # Add graph paths first (higher priority for compliance chains)
        if graph_results:
            parts.append(self._format_graph_paths(graph_results))
        
        # Add vector chunks
        if vector_results:
            parts.append(self._format_vector_chunks(vector_results))
        
        # Deduplicate and truncate
        merged = self._deduplicate("\n\n---\n\n".join(parts))
        return self._truncate(merged, self.MAX_TOKENS)
    
    def _format_graph_paths(self, paths) -> str:
        return "REGULATORY RELATIONSHIPS:\n\n" + \
               "\n\n".join(self._format_path(p) for p in paths)
    
    def _format_vector_chunks(self, chunks) -> str:
        return "RELEVANT REGULATIONS:\n\n" + \
               "\n\n".join(f"[{c.section}]\n{c.text}" for c in chunks)
    
    def _deduplicate(self, text: str) -> str:
        """Remove duplicate regulation citations, keep first occurrence."""
        seen = set()
        return "\n\n".join(
            block for block in text.split("\n\n")
            if not (citation := re.search(r'\[(§.*?)\]', block))
            or citation[1] not in seen and not seen.add(citation[1])
        )
```

---

## Feedback Loop Closure Plan

### Priority 1: Knowledge Freshness Monitoring (Week 1)

**Problem:** CFR regulations change, but knowledge base doesn't auto-update.

**Solution:**
```python
# Add to existing cron jobs (src/lib/cron.ts or similar)

async function checkCFRFreshness() {
  const sources = [
    { id: "cfr-part-382", url: "https://www.ecfr.gov/current/title-49/part-382" },
    { id: "cfr-part-391", url: "https://www.ecfr.gov/current/title-49/part-391" },
    { id: "cfr-part-395", url: "https://www.ecfr.gov/current/title-49/part-395" }
  ];
  
  for (const source of sources) {
    const currentHash = await fetchAndHash(source.url);
    const storedHash = await db.knowledgeFreshness.findUnique({
      where: { source_id: source.id }
    });
    
    if (!storedHash || currentHash !== storedHash.hash) {
      // CFR changed!
      await db.knowledgeFreshness.upsert({
        where: { source_id: source.id },
        update: { 
          hash: currentHash, 
          status: "stale",
          last_changed: new Date() 
        },
        create: { source_id: source.id, hash: currentHash }
      });
      
      // Alert admin
      await sendEmail({
        to: "jacob@truenorthstrategyops.com",
        subject: `CFR Update Detected: ${source.id}`,
        body: `${source.url} changed. Re-index needed.`
      });
      
      // Warn users in Penny responses
      await db.knowledgeWarnings.create({
        data: {
          source_id: source.id,
          message: "⚠️ This regulation may have changed recently. Verify before acting.",
          expires_at: addDays(new Date(), 90)
        }
      });
    }
  }
}

// Schedule daily at 2am
cron.schedule("0 2 * * *", checkCFRFreshness);
```

**Database Schema Addition:**
```sql
CREATE TABLE knowledge_freshness (
  source_id VARCHAR(100) PRIMARY KEY,
  hash VARCHAR(64) NOT NULL,
  status VARCHAR(20) DEFAULT 'current', -- 'current' | 'stale' | 'deprecated'
  last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_changed TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id VARCHAR(100) REFERENCES knowledge_freshness(source_id),
  message TEXT NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Implementation Checklist:**
- [ ] Add database schema (migration)
- [ ] Implement hash comparison function
- [ ] Add cron job to existing alert engine
- [ ] Create admin email template
- [ ] Modify Penny response to include warnings
- [ ] Test with one CFR part
- [ ] Deploy to production

**Timeline:** 2-3 days  
**Impact:** Prevents outdated advice liability

---

### Priority 2: Citation Verification (Week 1)

**Problem:** Penny may cite regulations that don't exist or quote incorrectly.

**Solution:**
```python
# Add to Penny response pipeline (railway-backend/penny.py or similar)

async def validateCitations(response: str, tenant_id: str) -> dict:
    """Validate all CFR citations in Penny's response."""
    
    # Extract citations (§ 382.211, § 391.45, etc.)
    citations = re.findall(r'§\s*\d+\.\d+', response)
    validation_results = []
    
    for citation in citations:
        # Query vector store for cited section
        chunks = await vectorStore.search({
            query: f"section {citation}",
            tenant_id: tenant_id,
            topK: 3
        })
        
        # Check if citation exists in knowledge base
        found = any(chunk.metadata.section_id == citation for chunk in chunks)
        
        if not found:
            validation_results.append({
                "citation": citation,
                "status": "unverified",
                "confidence": 0.0,
                "warning": "Citation not found in knowledge base"
            })
        else:
            # Compute confidence based on chunk similarity
            top_chunk = chunks[0]
            validation_results.append({
                "citation": citation,
                "status": "verified",
                "confidence": top_chunk.score,
                "source": top_chunk.metadata.source_file
            })
    
    # Append warnings for unverified citations
    unverified = [r for r in validation_results if r["status"] == "unverified"]
    if unverified:
        response += "\n\n⚠️ **Citation Warning:** Some cited regulations could not be verified in our knowledge base. Please verify independently before relying on this information."
    
    return {
        "response": response,
        "validation_results": validation_results,
        "unverified_count": len(unverified)
    }
```

**API Integration:**
```python
# Modify chat endpoint
@app.post("/api/penny/chat")
async def penny_chat(request: ChatRequest):
    # ... existing retrieval and generation logic ...
    
    # NEW: Validate citations before returning
    validated = await validateCitations(
        response=penny_response.text,
        tenant_id=request.tenant_id
    )
    
    # Log validation results to Datadog
    await datadog.log({
        "event": "penny_citation_validation",
        "tenant_id": request.tenant_id,
        "query_id": request.query_id,
        "unverified_citations": validated["unverified_count"],
        "validation_results": validated["validation_results"]
    })
    
    return {
        "response": validated["response"],
        "citations": validated["validation_results"],
        "metadata": {
            "citation_confidence": "high" if validated["unverified_count"] == 0 else "medium"
        }
    }
```

**Implementation Checklist:**
- [ ] Add validation function to Penny pipeline
- [ ] Test with 50 historical queries
- [ ] Log validation results to Datadog
- [ ] Add warning banner to UI when unverified citations exist
- [ ] Deploy behind feature flag
- [ ] Monitor false positive rate
- [ ] Full rollout after 1 week

**Timeline:** 2 days  
**Impact:** Prevents hallucinated citations

---

### Priority 3: Outcome Tracking System (Week 2)

**Problem:** No validation that Penny's advice actually helps users.

**Solution:**
```typescript
// Add to Next.js app (src/lib/outcome-tracking.ts)

interface QueryOutcome {
  query_id: string;
  tenant_id: string;
  query_text: string;
  penny_response: string;
  predicted_outcome: string;
  followup_scheduled: Date;
  followup_sent: boolean;
  outcome_reported: boolean;
  outcome_status: "success" | "failure" | "partial" | "unknown" | null;
  outcome_details: string | null;
  prediction_accuracy: number | null;  // 0-1
}

// 1. After Penny response, create tracking record
export async function trackQueryOutcome(
  query: string, 
  response: string, 
  tenantId: string
): Promise<string> {
  
  const tracking = await db.queryOutcomes.create({
    data: {
      query_id: generateId(),
      tenant_id: tenantId,
      query_text: query,
      penny_response: response,
      predicted_outcome: extractPrediction(response),
      followup_scheduled: addDays(new Date(), 7),
      followup_sent: false
    }
  });
  
  return tracking.query_id;
}

// 2. Daily cron: send follow-up emails
export async function sendOutcomeFollowups() {
  const dueForFollowup = await db.queryOutcomes.findMany({
    where: {
      followup_scheduled: { lte: new Date() },
      followup_sent: false
    },
    include: { tenant: true }
  });
  
  for (const record of dueForFollowup) {
    await resend.emails.send({
      from: "Pipeline Penny <penny@pipelinepunks.com>",
      to: record.tenant.email,
      subject: "Quick check-in: Did our compliance advice help?",
      html: renderTemplate("outcome-followup", {
        query: record.query_text,
        prediction: record.predicted_outcome,
        feedback_url: `https://pipelinepunks.com/feedback/${record.query_id}`
      })
    });
    
    await db.queryOutcomes.update({
      where: { id: record.query_id },
      data: { followup_sent: true }
    });
  }
}

// 3. Feedback capture endpoint
// Add to src/app/api/feedback/[query_id]/route.ts
export async function POST(
  request: Request,
  { params }: { params: { query_id: string } }
) {
  const { outcome_status, outcome_details } = await request.json();
  
  const prediction_accuracy = calculateAccuracy(
    outcome_status, 
    outcome_details
  );
  
  await db.queryOutcomes.update({
    where: { id: params.query_id },
    data: {
      outcome_reported: true,
      outcome_status,
      outcome_details,
      prediction_accuracy
    }
  });
  
  return Response.json({ 
    success: true,
    message: "Thanks for the feedback! This helps us improve." 
  });
}
```

**Database Schema:**
```sql
CREATE TABLE query_outcomes (
  query_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  query_text TEXT NOT NULL,
  penny_response TEXT NOT NULL,
  predicted_outcome TEXT,
  
  -- Follow-up tracking
  followup_scheduled TIMESTAMP NOT NULL,
  followup_sent BOOLEAN DEFAULT false,
  
  -- Outcome capture
  outcome_reported BOOLEAN DEFAULT false,
  outcome_status VARCHAR(20), -- 'success' | 'failure' | 'partial' | 'unknown'
  outcome_details TEXT,
  prediction_accuracy DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_outcomes_followup 
ON query_outcomes(followup_scheduled, followup_sent) 
WHERE followup_sent = false;
```

**Email Template:**
```html
<!-- emails/outcome-followup.html -->
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Quick compliance check-in</h2>
  
  <p>Hi there,</p>
  
  <p>Last week you asked Pipeline Penny:</p>
  <blockquote style="background: #f5f5f5; padding: 16px; border-left: 4px solid #0A8EA0;">
    {{ query }}
  </blockquote>
  
  <p>We predicted:</p>
  <blockquote style="background: #f5f5f5; padding: 16px; border-left: 4px solid #0A8EA0;">
    {{ prediction }}
  </blockquote>
  
  <p><strong>Did this advice help you stay compliant?</strong></p>
  
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ feedback_url }}?outcome=success" 
       style="display: inline-block; padding: 12px 24px; margin: 8px; background: #0A8EA0; color: white; text-decoration: none; border-radius: 4px;">
      ✅ Yes, it worked
    </a>
    <a href="{{ feedback_url }}?outcome=partial" 
       style="display: inline-block; padding: 12px 24px; margin: 8px; background: #FFA500; color: white; text-decoration: none; border-radius: 4px;">
      ⚠️ Partially
    </a>
    <a href="{{ feedback_url }}?outcome=failure" 
       style="display: inline-block; padding: 12px 24px; margin: 8px; background: #DC3545; color: white; text-decoration: none; border-radius: 4px;">
      ❌ No, it didn't
    </a>
  </div>
  
  <p style="font-size: 14px; color: #666;">
    This 30-second feedback helps us improve Penny for all fleet managers. Thanks!
  </p>
  
  <p>
    — Pipeline Penny<br>
    <small>True North Data Strategies</small>
  </p>
</div>
```

**Implementation Checklist:**
- [ ] Add database schema (migration)
- [ ] Create outcome tracking service
- [ ] Add cron job for follow-up emails
- [ ] Design email template
- [ ] Create feedback landing page
- [ ] Integrate with existing chat endpoint
- [ ] Test with internal queries
- [ ] Deploy to production
- [ ] Monitor response rate (target: 30%)

**Timeline:** 1 week  
**Impact:** CRITICAL (only way to validate Penny's effectiveness)

---

## CommandStack Evolution Strategy

### Decision Framework: When to Migrate

**Option A: Stay FCS (Improve In Place)**
- Fix feedback loops (Week 1-2)
- Add graph RAG incrementally (Month 1)
- Extract modules gradually (Month 2-3)
- **Keep current codebase and brand**

**Option B: Build CommandStack (3-Month Rebuild)**
- Fresh monorepo structure
- Graph RAG from Day 1
- Module system from Day 1
- **New platform brand and architecture**

**Option C: Incremental Evolution (RECOMMENDED)**
- Fix feedback loops (Week 1-2)
- Add graph RAG to FCS (Month 1)
- Extract Fleet Command module (Month 2)
- **Decision gate at Month 3:** Full rebuild vs continue evolving

### Option C Timeline (Recommended)

#### Month 1: Add Graph Layer to Current FCS

**Week 1-2: Feedback Loop Closure**
- Knowledge freshness monitoring (3 days)
- Citation verification (2 days)
- Outcome tracking system (1 week)
- **Deploy to production, measure baseline**

**Week 3: Graph Infrastructure**
- Deploy Neo4j alongside Neon Postgres
- Extract 100 CFR relationships manually
- Build basic graph queries (compliance chains)
- Test retrieval quality in isolation

**Week 4: Hybrid Retrieval**
- Build intent classifier (rule-based)
- Create context merger
- Add hybrid retriever to Penny pipeline
- A/B test: 50% vector-only, 50% graph-augmented

**Success Criteria:**
- Feedback loops closed (knowledge freshness, citation validation, outcome tracking)
- Graph retrieval working (100+ relationships)
- A/B test shows graph improves answers by >20%

---

#### Month 2: Scale Graph + Measure Impact

**Week 5-6: Full Graph Extraction**
- Automate entity extraction (LLM-based)
- Extract all CFR relationships (500+ regulations)
- Validate 10% sample manually
- Deploy to production (100% traffic)

**Week 7: Outcome Measurement**
- Collect 30-day outcome tracking data
- Measure prediction accuracy vs. baseline
- Analyze which query types benefit most from graph
- Document ROI (violations prevented, time saved)

**Week 8: Module Extraction (Start)**
- Identify Fleet-specific code
- Extract to `modules/fleet-command/`
- Prove module isolation works
- Keep running on current infrastructure

**Success Criteria:**
- Graph extraction >80% precision (validated)
- Outcome tracking shows >30% response rate
- Prediction accuracy improves by >15%
- Fleet module extracted without breaking production

---

#### Month 3: Decision Gate

**Evaluation Criteria:**

| Metric | Target | Gate Decision |
|--------|--------|---------------|
| **Graph accuracy** | >80% precision | If YES → Continue. If NO → Fix extraction |
| **Multi-hop improvement** | >20% better answers | If YES → Continue. If NO → Question value |
| **Outcome tracking data** | >30% response rate | If YES → Continue. If NO → Improve engagement |
| **Module extraction** | Zero production issues | If YES → Continue. If NO → Fix isolation |
| **User feedback** | >80% satisfaction | If YES → Continue. If NO → Address pain points |

**Decision Options:**

**If All Targets Met → Two Paths:**

**Path A: Continue Evolving FCS**
- Extract second module (Realty or Gov)
- Keep current infrastructure
- Brand as "Fleet Compliance Sentinel Platform"
- **Advantage:** No migration pain, proven system
- **Risk:** Technical debt accumulates

**Path B: Migrate to CommandStack**
- Start fresh monorepo
- Copy proven graph RAG architecture
- Copy proven modules
- Launch as multi-vertical platform
- **Advantage:** Clean architecture, platform positioning
- **Risk:** 3-month rebuild, migration complexity

**If Targets Not Met:**
- Document why graph RAG didn't deliver expected value
- Fix specific issues (extraction accuracy, query routing, etc.)
- Re-evaluate after fixes
- **Option to abandon graph RAG if fundamentally flawed**

---

### Migration Checklist (If CommandStack Chosen)

**Week 1-2: Infrastructure Setup**
- [ ] Create `commandstack-platform` monorepo
- [ ] Deploy Neo4j (production-grade)
- [ ] Set up module registry system
- [ ] Migrate proven RAG core from FCS

**Week 3-4: Fleet Command Migration**
- [ ] Extract Fleet Command as first module
- [ ] Copy CFR knowledge base
- [ ] Copy proven graph relationships
- [ ] Test in isolation

**Week 5-6: Production Cutover**
- [ ] Deploy CommandStack to staging
- [ ] Migrate 10% of FCS users (beta)
- [ ] Monitor for issues
- [ ] Gradual rollout to 100%

**Week 7-8: Second Module**
- [ ] Extract Realty or Gov Command
- [ ] Prove multi-module system works
- [ ] Launch CommandStack publicly

**Week 9-12: Optimization**
- [ ] Close remaining feedback loops
- [ ] Optimize performance
- [ ] Build marketing site
- [ ] Full launch

---

## Implementation Roadmap

### Immediate Actions (This Week)

**Monday-Tuesday: Knowledge Freshness Monitoring**
- [ ] Add database schema
- [ ] Implement hash comparison
- [ ] Add cron job
- [ ] Test with one CFR part
- [ ] Deploy to production

**Wednesday-Thursday: Citation Verification**
- [ ] Add validation to Penny pipeline
- [ ] Test with 50 queries
- [ ] Deploy behind feature flag
- [ ] Monitor false positives

**Friday: Outcome Tracking Setup**
- [ ] Design database schema
- [ ] Create email template
- [ ] Plan Week 2 implementation

---

### Week 2-4: Graph RAG Foundation

**Week 2: Neo4j Setup**
- [ ] Deploy Neo4j locally
- [ ] Extract 100 relationships manually
- [ ] Test graph queries
- [ ] Validate relationship quality

**Week 3: Intent Classifier + Context Merger**
- [ ] Build rule-based classifier
- [ ] Create context merger
- [ ] Test hybrid retrieval
- [ ] Measure quality improvement

**Week 4: Production Integration**
- [ ] Add to Penny pipeline
- [ ] A/B test (50/50 split)
- [ ] Collect user feedback
- [ ] Analyze results

---

### Month 2-3: Scale + Decide

**Month 2: Full Graph Extraction**
- Automate entity extraction
- Scale to all CFR parts
- Validate accuracy
- Deploy to 100% traffic

**Month 3: Decision Gate**
- Evaluate against success criteria
- Choose: Continue evolving FCS or Migrate to CommandStack
- Document decision rationale
- Commit to chosen path

---

## Performance Requirements

### Latency Targets (Production)

| **Query Type** | **Current p95** | **Target p95** | **Max Acceptable** |
|----------------|----------------|----------------|-------------------|
| Vector Only | 1.2s | 1.0s | 1.5s |
| Graph Only | N/A | 1.0s | 1.5s |
| Hybrid | N/A | 1.5s | 2.0s |

### Accuracy Targets

| **Metric** | **Current** | **Target (Graph-Augmented)** |
|------------|------------|------------------------------|
| Single-hop questions | 78% | 85% |
| Multi-hop questions | 42% | 75% |
| Citation accuracy | Unknown | 95% (validated) |
| Compliance chain completeness | N/A | 80% |

### Feedback Loop Targets

| **Loop** | **Current Status** | **Target Status** | **Timeline** |
|----------|-------------------|-------------------|--------------|
| Knowledge freshness | 🔴 Broken | ✅ Closed (daily checks) | Week 1 |
| Citation validation | 🔴 Broken | ✅ Closed (post-generation) | Week 1 |
| Outcome tracking | 🔴 Broken | 🟡 Open (30% response rate) | Week 2 |
| Violation reporting | 🔴 Broken | 🟡 Open (manual reporting) | Month 2 |

---

## Risk Register

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Graph extraction accuracy <80%** | Medium | High | Manual validation of 10% sample, iterative prompt tuning |
| **Neo4j performance degrades** | Low | Medium | Monitor query times, add indexes, upgrade if needed |
| **Citation validation false positives** | Medium | Low | Test with diverse queries, tune similarity threshold |
| **Outcome tracking low response rate** | High | Medium | Incentivize feedback, simplify UI, send reminders |
| **Knowledge freshness false alarms** | Medium | Low | Tune hash comparison to ignore minor HTML changes |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Users don't value graph features** | Low | High | A/B test before full rollout, measure engagement |
| **Feedback loop closure reveals accuracy issues** | Medium | High | Better to know than not know, fix systematically |
| **CommandStack migration disrupts users** | Low (if Option C) | High | Incremental evolution avoids this risk |
| **Competitors copy graph RAG** | High | Medium | Speed to market, build moat with outcome data |

---

## Success Metrics

### Week 1 Success Criteria (Feedback Loops)

- [ ] Knowledge freshness monitoring deployed
- [ ] At least one CFR part monitored
- [ ] Citation validation working
- [ ] Tested with 50 queries
- [ ] Zero false negatives (missed hallucinations)

### Month 1 Success Criteria (Graph RAG)

- [ ] Neo4j deployed with 100+ relationships
- [ ] Intent classifier >80% accuracy
- [ ] A/B test shows graph improves answers by >20%
- [ ] Zero production incidents
- [ ] User satisfaction maintained or improved

### Month 2 Success Criteria (Scale)

- [ ] 500+ relationships extracted
- [ ] Extraction accuracy >80% (validated)
- [ ] Outcome tracking data: 30% response rate
- [ ] Multi-hop question accuracy >75%
- [ ] Fleet module extracted successfully

### Month 3 Success Criteria (Decision Gate)

- [ ] All Month 1-2 targets met
- [ ] Clear data on graph RAG ROI
- [ ] Module extraction proven
- [ ] Decision made: Continue FCS evolution or Migrate to CommandStack
- [ ] Roadmap for chosen path documented

---

## Appendix: Key Insights from World Model Analysis

### What FCS Does Well (World Model Perspective)

**1. Real-Time State Capture**
- Telematics integration = actual behavior, not reported behavior
- Training assessments = actual knowledge, not assumed knowledge
- Alert system = proactive state transitions, not reactive

**2. Deterministic State Machines**
- Training lifecycle: Clear states, clear triggers
- Alert lifecycle: Measurable outcomes
- Import validation: Immediate feedback

**3. Infrastructure Observability**
- Module gateway: Closed feedback loop (latency, errors, cost)
- Import pipeline: Closed feedback loop (validation, rollback)
- Audit logging: Complete state history

### What FCS Does Poorly (World Model Perspective)

**1. Broken AI Feedback Loops**
- Penny makes predictions but never checks if correct
- Citations generated but never validated
- Advice given but outcomes unknown

**2. Static Knowledge in Dynamic Environment**
- Regulations change, knowledge base doesn't
- No staleness detection
- No automatic re-indexing

**3. Missing Temporal Modeling**
- Vector search returns static chunks
- No understanding of "what happens next"
- No compliance chain reasoning

### How Graph RAG Addresses Gaps

**1. Explicit Transition Modeling**
```
Graph: (Regulation) -[:REQUIRES]-> (Action) -[:TRIGGERS]-> (Outcome)
Enables: "What happens if..." questions
Result: Multi-hop compliance chains
```

**2. Relationship-Based Retrieval**
```
Vector: Returns chunks matching keywords
Graph: Returns connected compliance requirements
Result: Complete picture, not scattered fragments
```

**3. Temporal State Potential**
```
Future: Graph nodes with timestamps
Enables: "What expires when" proactive alerts
Result: Better than current date-based triggers
```

### What Graph RAG Won't Fix

**1. Feedback Loops**
- Graph retrieval still needs outcome validation
- Citation accuracy still needs post-generation checks
- Knowledge freshness still needs monitoring

**2. Ground Truth**
- Graph relationships are extracted, not validated
- Need manual validation sample
- Need contradiction detection

**3. User Engagement**
- Graph makes better predictions
- But predictions still need user action
- Outcome tracking still required

### The Path Forward

**Short Term (Weeks 1-2):**
- Close feedback loops in current system
- No architectural changes needed
- Immediate liability reduction

**Medium Term (Month 1-2):**
- Add graph RAG incrementally
- Prove value with A/B testing
- Measure actual impact

**Long Term (Month 3+):**
- Decide: Evolve FCS or Migrate to CommandStack
- Base decision on data, not assumptions
- Preserve optionality

---

## Document Control

**Version:** 2.0  
**Status:** Active Architecture Document  
**Next Review:** Week 2 (after feedback loops closed)  
**Owner:** Jacob Johnston, True North Data Strategies LLC  
**Location:** `/docs/ARCHITECTURE.md`

---

**END OF DOCUMENT**

Commercial Stack (Now)          Gov Stack (Future)
────────────────────────        ─────────────
Clerk                            			   GCP Identity Platform
Vercel                     			      Cloud Run + Firebase Hosting
Neon (Postgres)                 		Cloud SQL (Postgres)
Railway (FastAPI)             		  Cloud Run (same FastAPI code)
FAISS                         				  Vertex AI Vector Search
Neo4j [planned]             		   AlloyDB + Apache AGE
Datadog                       			  Cloud Logging + Monitoring
Sentry                        			  Cloud Error Reporting
Resend                       				   SendGrid (Twilio)
Stripe                      				    Stripe (same)
