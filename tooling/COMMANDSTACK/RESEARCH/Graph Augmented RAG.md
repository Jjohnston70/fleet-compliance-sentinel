# Fleet Compliance Sentinel - Graph-Augmented RAG Architecture
**Version:** 1.0.0  
**Last Updated:** April 4, 2026  
**Owner:** Jacob Johnston, True North Data Strategies  
**System:** Pipeline Penny AI Compliance Assistant

---

## Executive Summary

Fleet Compliance Sentinel uses a **dual-retrieval architecture** combining graph-based relationship mapping with vector semantic search to answer complex DOT compliance questions. This document defines the technical architecture for integrating Neo4j graph database with our existing FAISS/Neon Postgres vector store.

**Core Principle:** Graph answers "what connects to what," vector DB answers "what's the exact text."

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Current Architecture (Baseline)](#current-architecture-baseline)
3. [Target Architecture (Graph-Augmented)](#target-architecture-graph-augmented)
4. [Component Specifications](#component-specifications)
5. [Data Flow](#data-flow)
6. [Implementation Phases](#implementation-phases)
7. [Performance Requirements](#performance-requirements)
8. [Cost Model](#cost-model)
9. [Risk Register](#risk-register)
10. [Success Metrics](#success-metrics)

---

## System Overview

### Mission
Enable Pipeline Penny to answer multi-hop compliance questions that require understanding regulatory relationships, not just keyword matching.

### Example Scenarios

| **Query Type** | **Current Penny (Vector Only)** | **Graph-Augmented Penny** |
|----------------|--------------------------------|---------------------------|
| "What does § 382.211 say?" | ✅ Returns exact text | ✅ Returns exact text + related regulations |
| "What happens if I fail a random drug test?" | ⚠️ Returns § 382.211 text only | ✅ Returns full compliance chain: Test Failure → Driver Removal → Clearinghouse Report → Return-to-Duty Protocol |
| "Show all HazMat requirements for tanker trucks" | ⚠️ Returns scattered chunks | ✅ Returns clustered requirements from graph community |

---

## Current Architecture (Baseline)

### System Diagram
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

### Current Data Model

**Chunk Schema (Neon Postgres)**
```sql
CREATE TABLE knowledge_chunks (
    chunk_id UUID PRIMARY KEY,
    source_file VARCHAR(255),        -- e.g., "CFR_Title49_Part382.md"
    section_reference VARCHAR(100),  -- e.g., "§ 382.211"
    chunk_text TEXT,                 -- 400-600 word chunk
    embedding VECTOR(1536),          -- OpenAI embedding
    metadata JSONB,                  -- {regulation_part, topic_tags, last_updated}
    created_at TIMESTAMP
);
```

**FAISS Index Structure**
- Dimension: 1536 (OpenAI text-embedding-3-small)
- Index Type: IndexFlatIP (Inner Product for cosine similarity)
- Size: ~2,400 chunks (CFR Title 49 Parts 382, 391, 392, 395, 396, 40)
- Disk Size: ~15MB

### Current Performance
- **Query Latency:** 800ms-1.2s (p95)
  - Embedding generation: 150ms
  - FAISS search: 50ms
  - Postgres retrieval: 100ms
  - Claude API call: 500-900ms
- **Accuracy (Manual Eval):** 78% on single-hop questions, 42% on multi-hop questions
- **Monthly Cost:** $120 (Neon Postgres + Railway + Claude API)

---

## Target Architecture (Graph-Augmented)

### System Diagram
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

### Key Architectural Changes

1. **Intent Classifier (Orchestrator)**
   - Determines query type: Relationship (graph), Factual (vector), or Complex (hybrid)
   - Initially: Rule-based pattern matching
   - Future: Fine-tuned classifier model

2. **Neo4j Graph Database**
   - Stores CFR regulatory relationships
   - Enables multi-hop traversal queries
   - Community Edition (Docker container)

3. **Context Merger**
   - Combines graph query results with vector chunks
   - Deduplicates overlapping content
   - Prioritizes based on relevance scores

---

## Component Specifications

### 1. Neo4j Graph Database

**Deployment:**
- **Platform:** Docker container on Railway/Render
- **Version:** Neo4j Community 5.x
- **Resources:** 2GB RAM, 20GB storage
- **Access:** Bolt protocol (port 7687) + HTTP API (port 7474)

**Graph Schema:**
```cypher
// Node Types
(:Regulation {
    section_id: STRING,           // e.g., "§ 382.211"
    title: STRING,
    part: STRING,                 // e.g., "Part 382"
    text_summary: STRING,         // 2-3 sentence overview
    full_text_chunk_id: UUID,     // FK to Neon Postgres chunk
    category: STRING,             // e.g., "Drug Testing", "Driver Qualification"
    last_updated: DATETIME
})

(:ComplianceAction {
    action_id: STRING,
    description: STRING,          // e.g., "Remove driver from safety-sensitive duty"
    timeframe: STRING,            // e.g., "Immediately", "Within 24 hours"
    responsible_party: STRING     // e.g., "Employer", "Driver", "MRO"
})

(:ReportingRequirement {
    report_id: STRING,
    system: STRING,               // e.g., "Clearinghouse", "FMCSA Portal"
    deadline: STRING,
    form_number: STRING
})

(:Vehicle {
    vehicle_type: STRING,         // e.g., "CMV", "Tanker", "HazMat"
    gvwr_class: STRING
})

(:Driver {
    license_class: STRING,        // e.g., "CDL Class A"
    endorsements: [STRING]        // e.g., ["H", "N", "T"]
})

// Relationship Types
(:Regulation)-[:REQUIRES]->(:ComplianceAction)
(:Regulation)-[:TRIGGERS]->(:ReportingRequirement)
(:Regulation)-[:APPLIES_TO]->(:Vehicle)
(:Regulation)-[:GOVERNS]->(:Driver)
(:ComplianceAction)-[:LEADS_TO]->(:ComplianceAction)  // Cascading actions
(:Regulation)-[:SUPERSEDES]->(:Regulation)             // Regulatory updates
(:Regulation)-[:CROSS_REFERENCES]->(:Regulation)       // Related sections
(:Regulation)-[:PART_OF]->(:Regulation)                // Hierarchical structure
```

**Example Graph Structure:**
```cypher
// Random Drug Test Compliance Chain
(§382.211 Random Testing)-[:REQUIRES]->(Random Test Action)
(Random Test Action)-[:IF_POSITIVE]->(Remove Driver Action)
(Remove Driver Action)-[:TRIGGERS]->(Clearinghouse Report)
(Remove Driver Action)-[:REQUIRES]->(Return-to-Duty Protocol)
(Return-to-Duty Protocol)-[:GOVERNED_BY]->(§382.605 RTD Process)
```

**Index Strategy:**
```cypher
CREATE INDEX regulation_section FOR (r:Regulation) ON (r.section_id);
CREATE INDEX regulation_category FOR (r:Regulation) ON (r.category);
CREATE FULLTEXT INDEX regulation_text FOR (r:Regulation) ON EACH [r.title, r.text_summary];
```

---

### 2. Intent Classifier (Orchestrator)

**Purpose:** Route queries to appropriate retrieval pipeline

**Classification Logic (Phase 1 - Rule-Based):**
```python
class IntentClassifier:
    """
    Determines retrieval strategy based on query analysis.
    
    Returns: "graph", "vector", or "hybrid"
    """
    
    GRAPH_TRIGGERS = [
        r"what (happens|triggers|leads to|results in)",
        r"show (all|everything) (related to|connected to)",
        r"what else (do I need|is required)",
        r"cascading|downstream|upstream",
        r"what if",
        r"compliance chain",
        r"relationship between"
    ]
    
    VECTOR_TRIGGERS = [
        r"what (does|is) (§|section|part) \d+",
        r"exact (text|wording|language)",
        r"quote|citation",
        r"specific requirement",
        r"definition of"
    ]
    
    HYBRID_TRIGGERS = [
        r"explain.*and show",
        r"what are all.*requirements",
        r"complete.*compliance",
        r"everything I need to know"
    ]
    
    def classify(self, query: str) -> str:
        query_lower = query.lower()
        
        # Check for explicit hybrid triggers first
        for pattern in self.HYBRID_TRIGGERS:
            if re.search(pattern, query_lower):
                return "hybrid"
        
        # Check for graph triggers
        graph_score = sum(
            1 for pattern in self.GRAPH_TRIGGERS 
            if re.search(pattern, query_lower)
        )
        
        # Check for vector triggers
        vector_score = sum(
            1 for pattern in self.VECTOR_TRIGGERS 
            if re.search(pattern, query_lower)
        )
        
        if graph_score > vector_score:
            return "graph"
        elif vector_score > 0:
            return "vector"
        else:
            # Default to hybrid for ambiguous queries
            return "hybrid"
```

**Phase 2 (LLM-Based Classifier):**
```python
async def llm_classify(query: str) -> str:
    """
    Use Claude Haiku for fast intent classification.
    Fallback to rule-based if API fails.
    """
    prompt = f"""Classify this compliance query into one category:
    - "graph" if asking about relationships, cascading effects, or "what happens if"
    - "vector" if asking for exact regulatory text or specific definitions
    - "hybrid" if asking comprehensive questions requiring both

Query: {query}

Respond with only one word: graph, vector, or hybrid"""

    response = await anthropic_client.messages.create(
        model="claude-haiku-4",
        max_tokens=10,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.content[0].text.strip().lower()
```

---

### 3. Graph Query Pipeline

**Cypher Query Templates:**
```python
class GraphQueryBuilder:
    """Builds Neo4j Cypher queries for common compliance patterns."""
    
    @staticmethod
    def find_compliance_chain(regulation_id: str, max_hops: int = 3) -> str:
        """Find all downstream compliance actions triggered by a regulation."""
        return f"""
        MATCH path = (r:Regulation {{section_id: $regulation_id}})
                     -[:REQUIRES|TRIGGERS|LEADS_TO*1..{max_hops}]->
                     (target)
        RETURN path, target
        ORDER BY length(path)
        """
    
    @staticmethod
    def find_related_regulations(category: str, limit: int = 10) -> str:
        """Find regulations in the same compliance domain."""
        return """
        MATCH (r:Regulation {category: $category})
        OPTIONAL MATCH (r)-[:CROSS_REFERENCES]-(related:Regulation)
        RETURN r, collect(related) as related_regs
        LIMIT $limit
        """
    
    @staticmethod
    def find_vehicle_requirements(vehicle_type: str) -> str:
        """Find all regulations applicable to a vehicle type."""
        return """
        MATCH (v:Vehicle {vehicle_type: $vehicle_type})
              <-[:APPLIES_TO]-(r:Regulation)
        OPTIONAL MATCH (r)-[:REQUIRES]->(action:ComplianceAction)
        RETURN r, collect(action) as actions
        """
    
    @staticmethod
    def find_cascading_violations(violation_type: str) -> str:
        """Find what other violations cascade from an initial violation."""
        return """
        MATCH path = (:ComplianceAction {description: $violation_type})
                     -[:LEADS_TO*1..3]->
                     (downstream:ComplianceAction)
        RETURN path, downstream
        ORDER BY length(path)
        """
```

**Query Execution:**
```python
class GraphRetriever:
    def __init__(self, neo4j_uri: str, neo4j_user: str, neo4j_password: str):
        self.driver = GraphDatabase.driver(
            neo4j_uri, 
            auth=(neo4j_user, neo4j_password)
        )
    
    async def retrieve(self, query: str, params: dict) -> List[dict]:
        """Execute Cypher query and return results."""
        async with self.driver.session() as session:
            result = await session.run(query, params)
            return [record.data() async for record in result]
    
    async def find_regulation_relationships(
        self, 
        regulation_id: str
    ) -> dict:
        """
        Find all relationships for a given regulation.
        
        Returns:
            {
                'regulation': {...},
                'requires': [...],
                'triggers': [...],
                'cross_references': [...]
            }
        """
        query = """
        MATCH (r:Regulation {section_id: $regulation_id})
        OPTIONAL MATCH (r)-[:REQUIRES]->(req:ComplianceAction)
        OPTIONAL MATCH (r)-[:TRIGGERS]->(trig:ReportingRequirement)
        OPTIONAL MATCH (r)-[:CROSS_REFERENCES]-(xref:Regulation)
        RETURN r, 
               collect(DISTINCT req) as requires,
               collect(DISTINCT trig) as triggers,
               collect(DISTINCT xref) as cross_references
        """
        
        results = await self.retrieve(query, {"regulation_id": regulation_id})
        return results[0] if results else {}
```

---

### 4. Vector Query Pipeline (Unchanged)

**Maintains current FAISS + Neon Postgres retrieval:**
```python
class VectorRetriever:
    async def retrieve(self, query: str, top_k: int = 5) -> List[dict]:
        """
        Standard semantic search pipeline.
        
        1. Generate query embedding
        2. FAISS similarity search
        3. Fetch full chunks from Postgres
        """
        # Generate embedding
        embedding = await openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=query
        )
        query_vector = embedding.data[0].embedding
        
        # FAISS search
        distances, indices = faiss_index.search(
            np.array([query_vector]), 
            top_k
        )
        
        # Fetch chunks from Postgres
        chunk_ids = [index_to_chunk_id[idx] for idx in indices[0]]
        chunks = await db.fetch_chunks(chunk_ids)
        
        return [
            {
                "chunk_id": chunk.chunk_id,
                "text": chunk.chunk_text,
                "section": chunk.section_reference,
                "score": float(distances[0][i])
            }
            for i, chunk in enumerate(chunks)
        ]
```

---

### 5. Context Merger

**Purpose:** Combine graph and vector results into unified context window
```python
class ContextMerger:
    """
    Merges graph paths and vector chunks into coherent context.
    Handles deduplication and prioritization.
    """
    
    MAX_CONTEXT_TOKENS = 3000
    
    async def merge(
        self, 
        graph_results: Optional[List[dict]] = None,
        vector_results: Optional[List[dict]] = None
    ) -> str:
        """
        Build context string from both retrieval sources.
        
        Priority:
        1. Graph relationship paths (structured)
        2. Vector chunks (detailed text)
        3. Deduplicate overlapping content
        """
        context_parts = []
        
        # Add graph relationships
        if graph_results:
            graph_context = self._format_graph_results(graph_results)
            context_parts.append(graph_context)
        
        # Add vector chunks
        if vector_results:
            vector_context = self._format_vector_results(vector_results)
            context_parts.append(vector_context)
        
        # Combine and truncate
        full_context = "\n\n---\n\n".join(context_parts)
        return self._truncate_to_token_limit(full_context)
    
    def _format_graph_results(self, results: List[dict]) -> str:
        """
        Format graph paths as structured text.
        
        Example output:
        COMPLIANCE CHAIN: § 382.211 Random Testing
        1. REQUIRES: Conduct unannounced testing (§ 382.305)
        2. IF POSITIVE → Remove driver from safety-sensitive duty (§ 382.211(d))
        3. TRIGGERS: Report to Clearinghouse within 2 business days (§ 382.705)
        4. REQUIRES: Return-to-Duty process (§ 382.605)
        """
        formatted = ["REGULATORY RELATIONSHIPS:\n"]
        
        for path in results:
            if 'path' in path:
                steps = self._extract_path_steps(path['path'])
                formatted.append(self._format_path_steps(steps))
        
        return "\n".join(formatted)
    
    def _format_vector_results(self, results: List[dict]) -> str:
        """
        Format vector chunks with citations.
        
        Example output:
        RELEVANT REGULATIONS:
        
        [§ 382.211] Random Testing
        Employers must conduct random drug and alcohol tests...
        (full chunk text)
        
        [§ 382.705] Clearinghouse Reporting
        An employer must report to the Clearinghouse...
        """
        formatted = ["RELEVANT REGULATIONS:\n"]
        
        for chunk in results:
            formatted.append(
                f"[{chunk['section']}]\n{chunk['text']}\n"
            )
        
        return "\n".join(formatted)
    
    def _truncate_to_token_limit(self, text: str) -> str:
        """Truncate to MAX_CONTEXT_TOKENS using tiktoken."""
        encoding = tiktoken.encoding_for_model("claude-sonnet-4")
        tokens = encoding.encode(text)
        
        if len(tokens) <= self.MAX_CONTEXT_TOKENS:
            return text
        
        # Truncate and add notice
        truncated_tokens = tokens[:self.MAX_CONTEXT_TOKENS - 50]
        truncated_text = encoding.decode(truncated_tokens)
        
        return truncated_text + "\n\n[Context truncated due to length]"
```

---

### 6. LLM Generation (Enhanced Prompt)

**System Prompt for Graph-Augmented Responses:**
```python
SYSTEM_PROMPT = """You are Pipeline Penny, a DOT compliance expert assistant.

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

Be precise, be thorough, keep fleet managers compliant."""

async def generate_response(
    query: str, 
    context: str, 
    chat_history: List[dict] = None
) -> str:
    """Send enriched context to Claude for generation."""
    
    messages = chat_history or []
    messages.append({
        "role": "user",
        "content": f"""CONTEXT:
{context}

QUESTION: {query}

Provide a comprehensive answer using the regulatory relationships and text above."""
    })
    
    response = await anthropic_client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        system=SYSTEM_PROMPT,
        messages=messages
    )
    
    return response.content[0].text
```

---

## Data Flow

### Flow 1: Graph Query (Relationship Question)
User: "What happens if a driver fails a random drug test?"
│
├─→ Intent Classifier → "graph"
│
├─→ Graph Query Builder
│   └─→ Cypher: MATCH (r:Regulation {section_id: "§ 382.211"})
│                -[:REQUIRES|TRIGGERS*1..3]-> (actions)
│
├─→ Neo4j Execution
│   └─→ Returns: [
│         (§ 382.211) -[REQUIRES]-> (Remove Driver),
│         (Remove Driver) -[TRIGGERS]-> (Clearinghouse Report),
│         (Remove Driver) -[REQUIRES]-> (RTD Protocol)
│       ]
│
├─→ Context Merger
│   └─→ Formats as: "COMPLIANCE CHAIN: 1. Remove driver... 2. Report to Clearinghouse... 3. Return-to-Duty..."
│
├─→ LLM Generation (Claude Sonnet 4)
│   └─→ Generates detailed answer with step-by-step chain
│
└─→ Response: "If a driver fails a random drug test, here's the compliance chain:
1. Immediately remove from safety-sensitive duty (§ 382.211(d))
2. Report to Clearinghouse within 2 business days (§ 382.705)
3. Begin Return-to-Duty process (§ 382.605)..."

---

### Flow 2: Vector Query (Factual Question)
User: "What does § 382.211 say about random testing frequency?"
│
├─→ Intent Classifier → "vector"
│
├─→ Vector Query (FAISS + Postgres)
│   └─→ Returns: [
│         {text: "§ 382.211 Random testing... minimum annual rate of 50%...", score: 0.94},
│         {text: "§ 382.305 Testing procedures...", score: 0.81}
│       ]
│
├─→ Context Merger
│   └─→ Formats as: "[§ 382.211] Random testing text...\n[§ 382.305] Testing procedures..."
│
├─→ LLM Generation
│   └─→ Generates answer with exact citations
│
└─→ Response: "§ 382.211 requires employers to conduct random drug tests at a minimum annual rate of 50%..."

---

### Flow 3: Hybrid Query (Complex Question)
User: "Show me all HazMat compliance requirements for tanker trucks"
│
├─→ Intent Classifier → "hybrid"
│
├─┬─→ Graph Query (parallel)
│ │   └─→ Cypher: MATCH (v:Vehicle {vehicle_type: "Tanker"})<-[:APPLIES_TO]-(r:Regulation)
│ │       └─→ Returns: Community of HazMat regulations
│ │
│ └─→ Vector Query (parallel)
│     └─→ FAISS search: "HazMat tanker requirements"
│         └─→ Returns: Top 5 relevant chunks
│
├─→ Context Merger
│   └─→ Combines: Graph community structure + Vector detailed text
│       └─→ Deduplicates overlapping regulations
│
├─→ LLM Generation
│   └─→ Synthesizes comprehensive answer
│
└─→ Response: "HazMat tanker trucks must comply with:
1. Vehicle Requirements: Parts 393, 396 (inspections, maintenance)
2. Driver Requirements: Part 391 (CDL with H+N endorsements), Part 383
3. Placarding: Part 172 (proper HazMat markings)
4. Testing: Part 382 (drug/alcohol screening)
[Full details with citations follow...]"

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
**Goal:** Prove graph retrieval works with manual data

**Deliverables:**
- [ ] Neo4j Docker container deployed
- [ ] 50 manually-created regulation relationships
- [ ] Basic Cypher query templates
- [ ] Intent classifier (rule-based only)
- [ ] End-to-end test: 1 graph query → LLM response

**Success Criteria:**
- Neo4j responds to Cypher queries < 200ms
- Graph results contain expected relationships
- LLM generates coherent answer from graph context

**Risk Mitigation:**
- Keep scope small (HazMat + Drug Testing only)
- Manual validation of all relationships
- Document query patterns that fail

---

### Phase 2: Automation (Weeks 4-6)
**Goal:** Automate graph ingestion from existing chunks

**Deliverables:**
- [ ] Entity extraction pipeline (Claude API)
- [ ] Relationship extraction pipeline
- [ ] Automated Neo4j ingestion script
- [ ] Validation suite (compare manual vs automated)
- [ ] Coverage: All of Parts 382, 391, 395

**Extraction Prompt Template:**
```python
ENTITY_EXTRACTION_PROMPT = """Extract compliance entities and relationships from this CFR regulation text.

Text:
{chunk_text}

Return JSON only:
{{
  "regulations": [
    {{"section_id": "§ 382.211", "title": "Random Testing", "category": "Drug Testing"}}
  ],
  "actions": [
    {{"description": "Conduct random drug test", "timeframe": "Ongoing", "responsible_party": "Employer"}}
  ],
  "relationships": [
    {{"source": "§ 382.211", "type": "REQUIRES", "target": "Conduct random drug test"}}
  ]
}}

Rules:
- Extract only explicit relationships mentioned in text
- Use exact CFR section numbers
- Identify responsible party (Employer, Driver, MRO, etc.)
- Note timeframes where specified"""
```

**Success Criteria:**
- 80% precision on relationship extraction (manual validation)
- 90% recall on major compliance chains
- Full graph ingestion completes in < 2 hours

---

### Phase 3: Integration (Weeks 7-8)
**Goal:** Deploy to production with A/B testing

**Deliverables:**
- [ ] Context merger implementation
- [ ] Hybrid query pipeline
- [ ] Feature flag: `enable_graph_retrieval`
- [ ] A/B test: 50% traffic graph-augmented
- [ ] Monitoring dashboard

**Metrics to Track:**
```python
METRICS = {
    "query_latency_p95": "Graph queries should add < 300ms",
    "answer_quality_score": "User thumbs-up rate > 80%",
    "citation_accuracy": "All CFR citations validated",
    "graph_utilization": "% of queries that use graph retrieval",
    "error_rate": "Graph query failures < 2%"
}
```

**Rollout Strategy:**
1. Week 7: Internal testing only (TNDS team)
2. Week 8 Day 1-3: Beta users (5 friendly fleets)
3. Week 8 Day 4-7: 50% A/B test
4. Week 9: Full rollout if metrics pass

---

### Phase 4: Advanced Features (Weeks 9-12)
**Goal:** Add GraphRAG community detection + HippoRAG personalization

**GraphRAG Features:**
- [ ] Leiden clustering on regulation graph
- [ ] Community summaries (e.g., "Drug Testing Domain Overview")
- [ ] Multi-level hierarchy (Part → Subpart → Section)
- [ ] Marketing content generation

**HippoRAG Features:**
- [ ] Per-tenant query tracking
- [ ] Personalized PageRank scoring
- [ ] Adaptive retrieval weights
- [ ] "Penny learns your fleet's focus" feature

**Success Criteria:**
- Community summaries used in 20% of queries
- Personalization improves answer quality by 15%
- Marketing content generates 10 SEO-optimized pages

---

## Performance Requirements

### Latency Targets

| **Query Type** | **Target p50** | **Target p95** | **Max Acceptable** |
|----------------|----------------|----------------|-------------------|
| Vector Only | 800ms | 1.2s | 2s |
| Graph Only | 600ms | 1.0s | 1.5s |
| Hybrid | 1.2s | 1.8s | 3s |

**Breakdown (Hybrid Query):**
- Intent classification: 50ms (rule-based) / 200ms (LLM-based)
- Graph query: 150ms
- Vector query: 200ms (parallel with graph)
- Context merge: 100ms
- LLM generation: 700ms
- **Total: ~1.2s**

---

### Throughput Requirements

- **Concurrent Users:** 50 (Phase 1), 500 (Phase 4)
- **Queries per Second:** 5 (peak), 1 (average)
- **Neo4j Connections:** 20 connection pool
- **FAISS Index:** In-memory, shared across workers

---

### Accuracy Targets

| **Metric** | **Baseline (Vector Only)** | **Target (Graph-Augmented)** |
|------------|---------------------------|------------------------------|
| Single-hop questions | 78% | 85% |
| Multi-hop questions | 42% | 75% |
| Citation accuracy | 92% | 95% |
| Relationship accuracy | N/A | 80% |

**Measurement Method:**
- Manual evaluation on 100-question test set
- Questions labeled by compliance domain (Drug Testing, Driver Qual, HazMat, etc.)
- Scoring: Correct/Partially Correct/Incorrect
- Monthly re-evaluation

---

## Cost Model

### Current Monthly Costs (Vector Only)
Neon Postgres (Pro):        $50
Railway FastAPI:            $30
Claude API (15K queries):   $40
TOTAL:                     $120/month

### Projected Monthly Costs (Graph-Augmented)
Neon Postgres (Pro):        $50  (unchanged)
Railway FastAPI:            $40  (+$10 for increased compute)
Neo4j (Railway 2GB):        $25  (Docker container)
Claude API (15K queries):   $50  (+$10 for larger context windows)
TOTAL:                     $165/month

**Cost Increase: $45/month (37.5%)**

**Per-Query Cost:**
- Current: $0.008 per query
- Graph-augmented: $0.011 per query
- **Increase: $0.003 per query**

---

### Break-Even Analysis

**Assumption:** Graph-augmented Penny reduces customer support inquiries by 20%

**Current Support Load:**
- 50 support tickets/month × 15 min/ticket = 12.5 hours/month
- Labor cost: $50/hour (Jacob's time)
- **Total support cost: $625/month**

**Projected Savings:**
- 20% reduction = 10 fewer tickets = 2.5 hours saved
- **Savings: $125/month**

**ROI:**
Monthly additional cost:    $45
Monthly support savings:   $125
NET BENEFIT:               +$80/month
Payback period:            Immediate

**Plus intangible benefits:**
- Better user experience → higher retention
- "Relationship-aware AI" marketing differentiator
- Reduced churn from frustrated users

---

## Risk Register

### Technical Risks

| **Risk** | **Probability** | **Impact** | **Mitigation** |
|----------|----------------|-----------|----------------|
| Entity extraction accuracy < 80% | Medium | High | Manual validation + iterative prompt tuning |
| Neo4j performance degrades at scale | Low | Medium | Monitor query times, add indexes, upgrade plan |
| Graph + Vector context exceeds token limits | Medium | Low | Implement smart truncation in Context Merger |
| Intent classifier misroutes queries | High | Medium | Start with conservative rules, add LLM fallback |
| FAISS index corruption during deployment | Low | High | Automated backups, blue-green deployment |

---

### Business Risks

| **Risk** | **Probability** | **Impact** | **Mitigation** |
|----------|----------------|-----------|----------------|
| Users don't value graph features | Low | High | A/B test before full rollout, measure engagement |
| Increased latency hurts UX | Medium | Medium | Set strict performance budgets, cache common queries |
| Maintenance burden too high | Medium | Medium | Automate graph ingestion, build admin dashboard |
| Competitors copy approach quickly | High | Low | Speed to market, build moat with personalization |

---

### Compliance Risks

| **Risk** | **Probability** | **Impact** | **Mitigation** |
|----------|----------------|-----------|----------------|
| Graph relationships are legally incorrect | Low | Critical | Manual review by compliance expert, version control |
| Regulatory updates break graph structure | Medium | High | Automated change detection, quarterly re-ingestion |
| Citation hallucinations increase | Low | High | Force citations from retrieved context only |

---

## Success Metrics

### Phase 1 (Foundation)
- [ ] 50 regulation relationships in Neo4j
- [ ] 10 test queries return correct graph paths
- [ ] End-to-end latency < 2s for graph queries

### Phase 2 (Automation)
- [ ] 500+ regulation relationships auto-extracted
- [ ] Entity extraction precision > 80%
- [ ] Full graph ingestion completes in < 2 hours

### Phase 3 (Integration)
- [ ] A/B test shows graph-augmented answers score 20% higher
- [ ] Query latency p95 < 1.8s for hybrid queries
- [ ] Zero production incidents during rollout

### Phase 4 (Advanced)
- [ ] Community summaries used in 20% of queries
- [ ] Personalization improves repeat-user satisfaction by 15%
- [ ] 10 SEO-optimized compliance guides auto-generated

---

## Appendix A: Query Pattern Examples

### Pattern 1: Compliance Chain Discovery
User Query: "What's the full compliance chain if a driver is convicted of DUI?"
Intent: graph
Graph Query:
MATCH path = (conviction:ComplianceAction {description: "DUI conviction"})
-[:LEADS_TO*1..4]->(downstream)
RETURN path
Expected Graph Result:
DUI Conviction
→ Disqualification from CDL (§ 383.51)
→ Employer notification required (§ 391.23)
→ Driver cannot operate CMV (§ 391.15)
→ Reinstatement process (state-specific)
Vector Supplement: Exact text of § 383.51, § 391.23
Final Answer: Multi-step chain with citations and timeframes

---

### Pattern 2: Domain Clustering
User Query: "Show me everything related to Hours of Service"
Intent: hybrid
Graph Query:
MATCH (category:Regulation {category: "Hours of Service"})
OPTIONAL MATCH (category)-[:CROSS_REFERENCES]-(related)
RETURN category, related
Vector Query: "Hours of Service CFR Part 395"
Expected Result:

Core HOS regulations (Part 395)
Related ELD requirements (§ 395.22)
Record-keeping (§ 395.8)
Exceptions (short-haul, adverse conditions)


---

### Pattern 3: Multi-Hop Reasoning
User Query: "Can I use a driver with a medical cert that expires in 30 days for a 3-week interstate trip?"
Intent: hybrid
Graph Query:
MATCH (driver:Driver)-[:REQUIRES]->(cert:ComplianceAction {description: "Valid medical certificate"})
MATCH (cert)-[:GOVERNED_BY]->(reg:Regulation)
RETURN driver, cert, reg
Vector Query: "medical certificate expiration interstate operations"
Expected Logic:

Graph shows: Interstate Driver → Requires Valid Med Cert → Governed by § 391.45
Vector returns: § 391.45 text on expiration rules
LLM reasons: 30 days > 3 weeks → Certificate valid for entire trip
Answer: Yes, but driver should renew before next assignment


---

## Appendix B: Development Environment Setup

### Local Development
```bash
# Clone repo
git clone https://github.com/pipeline-punks/fleet-compliance-sentinel.git
cd fleet-compliance-sentinel

# Install dependencies
pip install -r requirements.txt
npm install

# Start Neo4j (Docker)
docker run \
  --name penny-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/penny-graph-2026 \
  -v $HOME/neo4j/data:/data \
  neo4j:5.15-community

# Start FastAPI backend
cd backend
uvicorn main:app --reload --port 8000

# Start Next.js frontend
cd ../frontend
npm run dev
```

### Environment Variables
```bash
# .env.local
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=penny-graph-2026

NEON_DATABASE_URL=postgresql://user:pass@neon.tech/penny_db
FAISS_INDEX_PATH=/app/data/faiss_index.bin

ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

ENABLE_GRAPH_RETRIEVAL=true  # Feature flag
INTENT_CLASSIFIER_MODE=rule  # or "llm"
```

---

## Appendix C: Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (unit, integration, e2e)
- [ ] Neo4j data backed up
- [ ] FAISS index validated
- [ ] Performance benchmarks recorded
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented

### Deployment Steps
1. [ ] Deploy Neo4j container to Railway
2. [ ] Run graph ingestion script
3. [ ] Validate graph data (Cypher query samples)
4. [ ] Deploy FastAPI backend (blue-green)
5. [ ] Enable feature flag for 10% traffic
6. [ ] Monitor for 24 hours
7. [ ] Ramp to 50% traffic
8. [ ] Monitor for 48 hours
9. [ ] Full rollout

### Post-Deployment
- [ ] Verify all metrics within targets
- [ ] Review error logs
- [ ] Collect user feedback
- [ ] Document lessons learned
- [ ] Update runbooks

---

## Appendix D: Maintenance Runbook

### Weekly Tasks
- [ ] Review query latency dashboards
- [ ] Check Neo4j disk usage
- [ ] Validate citation accuracy (sample 10 queries)
- [ ] Update graph relationships for new DOT bulletins

### Monthly Tasks
- [ ] Full graph data audit (compare to CFR source)
- [ ] Re-run entity extraction on updated regulations
- [ ] Review intent classifier accuracy (sample 50 queries)
- [ ] Generate compliance domain summaries (GraphRAG)
- [ ] Backup Neo4j database

### Quarterly Tasks
- [ ] Major CFR update ingestion (if applicable)
- [ ] Graph schema review/optimization
- [ ] Performance optimization sprint
- [ ] User satisfaction survey
- [ ] Competitive analysis (check if others have graph RAG)

---

## Document History

| **Version** | **Date** | **Author** | **Changes** |
|-------------|----------|-----------|-------------|
| 1.0.0 | 2026-04-04 | Jacob Johnston | Initial architecture document |

---

**Next Steps:**
1. Review and approve this architecture
2. Set up development environment
3. Begin Phase 1 implementation (Week 1)
4. Schedule weekly architecture review meetings

**Questions/Concerns:**
- Contact: jacob@truenorthstrategyops.com
- GitHub Issues: https://github.com/pipeline-punks/fleet-compliance-sentinel/issues
This architecture document provides:
✅ Complete system design (current + target state)
✅ Detailed component specs (Neo4j schema, query templates, context merger)
✅ Implementation roadmap (4 phases, 12 weeks)
✅ Performance requirements (latency, throughput, accuracy)
✅ Cost model (ROI analysis shows +$80/month net benefit)
✅ Risk register (technical, business, compliance risks)
✅ Success metrics (per phase)
✅ Deployment plan (blue-green rollout with A/B testing)
Ready to execute. Your call on when to start Phase 1.Sonnet 4.5Claude is AI and can make mistakes. Please double-check responses.