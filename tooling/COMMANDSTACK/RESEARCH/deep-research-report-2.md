# Emerging and Adjacent Techniques to Complement Penny’s RAG Assistant and a Graph+RAG Orchestrator Hybrid

## Executive summary

You already have **chunked vector retrieval + an LLM** (classic RAG). You’re adding a **typed relationship graph + orchestrator** (good move). The next wave of improvements for a mid-sized product team is less about “new models” and more about **better retrieval, better routing, better constraints, and better measurement**.

Three techniques consistently deliver the highest ROI *while* you roll out graph+RAG:

1) **Hybrid retrieval + reranking**: run **lexical search (BM25/sparse)** and **dense vector search** together, fuse results (often with **Reciprocal Rank Fusion / RRF**) and optionally rerank a small candidate set with a **cross-encoder reranker** (Sentence Transformers / BGE reranker / MonoT5). This addresses the biggest practical weakness of dense-only retrieval: missing exact identifiers, acronyms, and “needle” facts. Elastic, Weaviate, Pinecone, and Azure AI Search all document hybrid retrieval patterns; RRF is a classic fusion method with strong empirical results. citeturn6search0turn6search1turn6search3turn16search0turn16search4turn16search1turn16search3

2) **Multi-hop retrieval (iterative retrieval + query decomposition)**: for complex questions, retrieve in steps (hop 1 → refine query / subquestion → hop 2), optionally guided by the graph (“depends_on”, “deepens”). This is supported by multi-hop dense retrieval research and adaptable to production via strict budgets and caching. citeturn2search0turn0search2turn12search3

3) **Retrieval-aware evaluation + provenance-first telemetry**: ship the hybrid safely by instrumenting and grading it. Use **RAGAS** (batch) and/or **TruLens** (online feedback) plus **OpenTelemetry** traces so you can prove improvements and detect regressions. Track provenance (graph version, node IDs, chunk IDs) with a simple model or standard like W3C PROV if you want a formal provenance layer. citeturn7search0turn7search4turn7search1turn18search0turn4search2

Beyond those, the next cluster of complementary techniques is worth exploring in parallel depending on your constraints: **hierarchical indexing/summarization (RAPTOR)** for long docs, **HyDE** query expansion, **agentic/tool workflows** (function calling, ReAct, Agents SDK, LangGraph), **memory/personalization layers (MemGPT-style)**, **Text2Cypher/Text2SPARQL** for structured graph querying, **KG embeddings/GNN ranking** for large graphs, **retrieval-augmented fine-tuning (RAFT/LoRA)** for stable domains, and **privacy-preserving retrieval/offline models** when security/offline is a requirement. citeturn2search1turn2search2turn3search3turn4search3turn11search9turn12search1turn10search0turn9search0

Unspecified parts of your stack (not provided) that materially affect implementation choices: **which vector DB**, your **LLM provider**, whether you already have **BM25/full-text search** available, and your current **observability/eval** tooling. The architecture below stays vendor-neutral.

## Baseline hybrid architecture and plug-in points

Your current and proposed hybrid looks like: vector retrieval + static JSON graph + orchestrator + LLM(s), with a UI explorer.

To integrate additional techniques cleanly, treat the orchestrator as the **single control point** that can call specialized modules (“tools”) and log a full trace. This matches modern tool-calling patterns (OpenAI function calling / structured outputs) and agent frameworks. citeturn8search0turn0search3turn5search1turn8search1

```mermaid
flowchart TB
  U[User / UI Explorer] --> ORCH[Orchestrator / Router]

  subgraph Retrieval Layer
    VEC[(Vector DB<br/>HNSW/ANN)]
    LEX[(Lexical Index<br/>BM25 / sparse)]
    RERANK[Reranker<br/>Cross-encoder]
    HYDE[Query Expansion<br/>HyDE]
    MH[Multi-hop Planner<br/>iterative retrieval]
  end

  subgraph Graph Layer
    GJSON[Static JSON Graph<br/>versioned]
    GDB[(Optional Graph DB<br/>Neo4j/RDF)]
    T2Q[Text-to-Graph Query<br/>Text2Cypher/SPARQL]
    GML[Graph ML Ranking<br/>KG embeddings / GNN]
  end

  subgraph LLM + Tools
    LLM[LLM(s)]
    TOOLS[Tool Calling<br/>GraphQuery / VectorSearch / APIs]
    AGENTS[Agent Workflows<br/>ReAct / Agents SDK / LangGraph]
    MEM[Memory Layer<br/>long-term + user profile]
  end

  subgraph Quality & Governance
    EVAL[Eval Harness<br/>RAGAS / TruLens / Evals]
    TEL[Telemetry<br/>OpenTelemetry]
    GOV[Governance<br/>schema + review + provenance]
  end

  ORCH --> MH
  MH --> HYDE
  HYDE --> VEC
  ORCH --> LEX
  ORCH --> VEC
  ORCH --> RERANK

  ORCH --> GJSON
  ORCH --> GDB
  ORCH --> T2Q
  ORCH --> GML

  ORCH --> TOOLS
  TOOLS --> LLM
  ORCH --> AGENTS
  ORCH --> MEM

  ORCH --> EVAL
  ORCH --> TEL
  ORCH --> GOV
```

Key baseline realities that affect every “adjacent technique” decision:

- Dense retrieval performance and cost often hinge on ANN indexing (commonly HNSW) and vector library choices; HNSW is a widely used ANN approach for kNN search. citeturn3search0turn3search1  
- Many teams eventually need both a vector index and either lexical search or a sparse retriever; “hybrid search” is broadly documented as combining lexical and semantic retrieval into one ranked list. citeturn6search0turn6search1turn6search3  
- If you adopt a graph DB, property graphs map directly to typed edges and edge metadata; Neo4j documents nodes/relationships/properties as first-class objects. citeturn17search0  

## Highest-priority techniques with runnable parallel experiments

### Hybrid retrieval plus reranking

**What it is**  
Run **two retrieval methods** in parallel—typically **BM25 (keyword)** and **dense vector search (semantic)**—then fuse results (often using **RRF**) and optionally apply a **reranker** to the fused top-N set. citeturn6search0turn6search1turn16search0turn16search1

**Why it helps Penny**  
Dense-only retrieval is great at “meaning,” but it can miss:
- exact part numbers, ticket IDs, error codes, acronyms, and proper nouns
- short-but-critical policy clauses that don’t “embed” strongly

Hybrid retrieval tends to improve recall and relevance because lexical matching catches exact terms while dense catches paraphrases and synonyms. citeturn6search0turn6search1turn6search3  
RRF is a simple, proven fusion algorithm for combining ranked lists from multiple retrieval systems. citeturn16search0turn16search4  
Rerankers (cross-encoders) are widely used as a second stage because they score query+doc pairs directly for relevance, trading compute for accuracy on only the top candidates. citeturn16search1turn16search3

**Where it plugs in**  
Retrieval layer, before the LLM call (or before the “planner” LLM step in your orchestrator).

**Concrete implementation pattern**  
Pick the easiest option based on what you already run:

- If your vector DB already supports hybrid queries:  
  - Weaviate documents hybrid search as vector + keyword search in one query. citeturn6search1  
  - Pinecone documents hybrid search with a single request combining sparse+dense. citeturn6search3  
  - Elastic documents hybrid search approaches for combining lexical and semantic methods. citeturn6search0turn6search16  

- If you have separate systems (common in mid-sized stacks):  
  - Run BM25 query in Elasticsearch/OpenSearch (or any full-text engine).  
  - Run vector query in your vector DB.  
  - Fuse with RRF (simple to implement). citeturn16search0  
  - Optionally rerank top 30–100 results with a cross-encoder (Sentence Transformers supports CrossEncoders; BGE reranker docs describe cross-encoder reranking). citeturn16search1turn16search3  

**Cost/latency/security trade-offs**  
Hybrid retrieval adds extra retrieval work (two fetches), but can *reduce* overall LLM cost if it improves “first answer success” and reduces follow-up turns.

- Latency:
  - BM25 + vector in parallel is usually OK; reranking is the main latency add because a cross-encoder is heavier than embedding similarity.
- Cost:
  - Reranking cost is predictable and bounded because you rerank only top-N.
- Security:
  - No new sensitive surfaces unless you introduce new vendors; the main risk is expanding data access paths. Prefer orchestrator-enforced filters and redaction policies at tool boundaries.

**Maturity/risk**  
High maturity; low conceptual risk. Most “risk” is integration and relevance tuning (weights, top_k).

**Experiment plan (parallel to graph+RAG rollout)**  
Run as shadow + then A/B:

- Assemble 200–500 real Penny questions (de-identified if needed), bucketed into:
  - “exact term” queries (IDs, codes)
  - “paraphrase” queries
  - “policy/procedure” queries
- Implement hybrid retrieval + (optional) reranking behind a feature flag.
- Shadow mode for 1–2 weeks: compute retrieval metrics without showing users the variant.
- A/B test for 2–4 weeks:
  - Variant A: current vector-only retrieval
  - Variant B: hybrid + rerank
- Success metrics:
  - Retrieval: higher judged relevance of top-k chunks (human or LLM-judge with strict rubric)
  - Answer: improved groundedness/faithfulness (RAGAS/TruLens) citeturn7search0turn7search1
  - Business: fewer “I couldn’t find that” responses; fewer follow-up clarifications; shorter resolution time

**Pseudocode sketch: hybrid + RRF + rerank (shadow/A-B ready)**

```python
def rrf_fuse(list_a, list_b, k=60):
    # list_* are lists of doc_ids ordered by rank (best first)
    # RRF score = sum(1 / (k + rank))
    scores = {}
    for lst in [list_a, list_b]:
        for rank, doc_id in enumerate(lst, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores.keys(), key=lambda d: scores[d], reverse=True)

def hybrid_retrieve(query, top_k=20, rerank_top_n=60, use_reranker=True):
    # 1) Retrieve from lexical and vector in parallel (threads/async in real code)
    bm25_docs = bm25_search(query, top_n=rerank_top_n)     # returns list[doc_id]
    vec_docs  = vector_search(query, top_n=rerank_top_n)   # returns list[doc_id]

    # 2) Fuse rankings (RRF)
    fused = rrf_fuse(bm25_docs, vec_docs, k=60)

    # 3) Fetch doc texts/metadata for fused top-N
    candidates = fetch_docs(fused[:rerank_top_n])  # returns list[{id, text, meta}]

    # 4) Optional rerank with cross-encoder
    if use_reranker:
        # cross_encoder_score(query, doc_text) -> float
        scored = [(d["id"], cross_encoder_score(query, d["text"])) for d in candidates]
        scored.sort(key=lambda x: x[1], reverse=True)
        final_ids = [doc_id for doc_id, _ in scored[:top_k]]
    else:
        final_ids = fused[:top_k]

    # 5) Return chunks w/ provenance IDs for the LLM prompt
    return fetch_chunks_for_docs(final_ids)
```

Notes you should enforce in production:
- Keep `rerank_top_n` bounded.
- Log doc IDs only (not raw sensitive text) in telemetry.
- Cache results keyed on `(query_hash, corpus_version)`.

### Multi-hop retrieval with graph-guided query decomposition

**What it is**  
Instead of “retrieve once and answer,” do:
- retrieve → read → generate a refined query/subquestion → retrieve again  
This is grounded in multi-hop dense retrieval research for complex QA. citeturn2search0turn2search16  
It also aligns with tool-using patterns like ReAct (reason + act in steps). citeturn0search2turn0search10  
Self-RAG pushes a similar idea: retrieve on demand and critique generations to avoid unnecessary retrieval or irrelevant contexts. citeturn12search3turn12search15

**Why it helps Penny**  
Many real operational questions are implicitly multi-step:

- “Why did this metric change?” often requires retrieving:
  - definition of metric
  - recent changes in the pipeline
  - a related policy or procedure
- “What’s the process to do X?” often requires retrieving prerequisites and dependencies.

Your typed graph can provide an initial structure (what concepts depend on what), while retrieval provides evidence in each hop.

**Where it plugs in**  
Orchestrator: add a “planner” stage before final answer. The planner chooses whether to do multi-hop and generates the next retrieval query (or graph traversal target).

**Concrete implementation pattern**  
A safe production pattern is “bounded multi-hop”:

- hop budget: 2 (occasionally 3) max
- time budget: e.g., 1.5–2.5 seconds of retrieval time max
- strict stopping rules: stop if hop 2 doesn’t add new high-relevance evidence

You can implement the planner with:
- a small LLM classifier to decide if multi-hop is needed
- a deterministic rule: if initial retrieval confidence is low, do hop 2
- optional graph-driven hinting: if query maps to a node, traverse `depends_on` edges to create subqueries

**Cost/latency/security trade-offs**  
- Latency: increases because you retrieve more than once.
- Cost: increases LLM/tool calls, but can reduce overall conversation turns.
- Risk: “compounding error” (bad hop 1 leads to bad hop 2). Mitigate with:
  - hard budgets
  - query validation and a “no progress” detector

**Maturity/risk**  
Medium maturity—widely used in advanced RAG, but correctness hinges on budgets and evaluation.

**Experiment plan**  
Run it only on a targeted query class first (complex “why/how/compare” questions):

- Build a dataset of 100–300 multi-hop questions (real user logs).
- Baseline: single-hop retrieval.
- Variant: 2-hop retrieval with graph-guided subquestion generation.
- Success metrics:
  - increased “evidence coverage” (more distinct required facts retrieved)
  - improved answer relevance and groundedness (RAG triad / RAGAS) citeturn7search1turn7search0
  - decreased follow-up turns asking for missing context

**Pseudocode sketch: bounded 2-hop retrieval (graph optional)**

```python
def needs_multihop(query, top_chunks):
    # Cheap heuristic: if top chunks are low-scoring or too redundant, try hop 2
    if len(top_chunks) < 5:
        return True
    if avg([c.score for c in top_chunks]) < 0.55:
        return True
    if diversity(top_chunks) < 0.20:
        return True
    return False

def propose_hop2_query(query, top_chunks, graph_node_pack=None):
    # Use an LLM with structured output: {"subquery": "...", "goal": "..."}.
    # Include only safe, minimal context: titles + short snippets + node IDs.
    return llm_generate_subquery(
        question=query,
        evidence_summaries=[(c.title, c.snippet) for c in top_chunks[:4]],
        graph_hints=graph_node_pack  # can be None
    )

def multihop_retrieve(query, graph_version):
    # Hop 1
    graph_node_pack = graph_query_seed(query, graph_version)  # optional, bounded
    hop1 = vector_search(query, top_k=8)

    if not needs_multihop(query, hop1):
        return hop1, {"hops": 1, "hop2_query": None}

    # Hop 2
    hop2_query = propose_hop2_query(query, hop1, graph_node_pack)
    hop2 = vector_search(hop2_query, top_k=8)

    # Merge & dedupe; guard against “no progress”
    merged = dedupe_by_doc_id(hop1 + hop2)
    if not improves_coverage(hop1, merged):
        return hop1, {"hops": 1, "hop2_query": hop2_query, "stopped": "no_progress"}

    return merged[:10], {"hops": 2, "hop2_query": hop2_query}
```

### Retrieval-augmented evaluation and provenance-first architecture

**What it is**  
A disciplined measurement layer that can tell you:
- whether new retrieval/routing methods helped
- whether answers remain grounded in retrieved sources
- where failures come from (retriever vs prompt vs model)

Core practical tools:
- **RAGAS**: reference-free evaluation metrics for RAG pipelines and component-wise metrics (faithfulness, answer relevancy, context precision/recall, etc.). citeturn7search0turn7search4  
- **TruLens**: “RAG triad” checks (context relevance, groundedness, answer relevance) and instrumentation patterns. citeturn7search1turn7search9  
- **OpenAI Evals**: evaluation framework for LLMs/systems; supports custom evals. citeturn7search2turn7search10  
- **OpenTelemetry**: standard traces/metrics/logs so you can tag each step with route decisions, graph_version, chunk IDs, etc. citeturn18search0turn18search8  

If you want a standards-based provenance model, W3C **PROV-DM** defines entities/activities/agents and relationships for provenance tracking. citeturn4search2

**Why it helps Penny**  
This is what prevents “it feels better” from turning into months of guesswork. It also makes your orchestrator and hybrid rollout safe to ship because you can set **release gates**.

**Where it plugs in**  
Across the orchestrator, not inside prompts:

- At each step: log route decision, retrieval IDs, graph node IDs, model used, latency.
- Post-step: run evaluators (async) for online monitoring and batch analysis.

**Cost/latency/security trade-offs**  
- Cost: evaluation uses LLM calls or additional compute if you use LLM-based graders.
- Latency: keep eval out of the critical path (async background).
- Security: avoid logging raw sensitive text; store hashed references + pointers; record only minimal snippets if needed and allowed.

**Maturity/risk**  
High maturity. The risk is “bad evaluation design” (grading the wrong thing). Mitigate with clear rubrics and periodic human checks.

**Experiment plan**  
Implement this as the *first parallel workstream*:

- Create a canonical dataset of:
  - 200 “daily driver” queries
  - 50–100 “hard” queries (multi-hop / policy)
  - expected citation targets when possible
- Run nightly batch eval across:
  - current RAG
  - graph+RAG hybrid
  - any experimental retrieval variants
- Track metric deltas and regressions per route/type.

**Pseudocode sketch: evaluation harness with versioned runs**

```python
def run_eval_suite(run_id, queries, system_variant):
    results = []
    for q in queries:
        resp = system_variant.ask(q)  # returns answer + trace (chunk IDs, node IDs)
        results.append({"query": q, "resp": resp})

    # Batch evaluation (async in production)
    ragas_scores = ragas_evaluate(results)  # faithfulness, answer_relevancy, etc.
    trulens_scores = trulens_evaluate(results)  # context relevance, groundedness, answer relevance

    # Store with provenance
    save_eval_run({
        "run_id": run_id,
        "variant": system_variant.name,
        "graph_version": system_variant.graph_version,
        "retriever_version": system_variant.retriever_version,
        "ragas": ragas_scores,
        "trulens": trulens_scores,
        "timestamp": now_iso(),
    })

    return {"ragas": ragas_scores, "trulens": trulens_scores}
```

## Technique catalog with integration notes and experiment sketches

Below are additional techniques that complement either (a) Penny’s current RAG, or (b) your graph+RAG orchestrator hybrid. Each includes what it is, why it matters, how it plugs in, and a practical experiment outline.

### Hierarchical indexing and knowledge-grounded summarization

**What it is**  
Build higher-level summaries over your chunks so retrieval can return context at different levels of abstraction. **RAPTOR** constructs a tree of embeddings and recursive summaries; at query time it retrieves from different levels to support long-document understanding. citeturn2search1turn2search5  
GraphRAG similarly emphasizes improving “global” questions by building graph-based indices and summaries. citeturn0search0turn0search1

**Why it helps Penny**  
Traditional chunk retrieval can miss the “big picture.” Hierarchical summaries help with questions like “summarize this policy” or “what are the main themes.”

**Integration point**  
Indexing pipeline + retriever. Often implemented as a second index (summary index) in parallel to the chunk index.

**Trade-offs**  
More indexing time/cost (summarization) and storage; often faster query-time for big-picture questions.

**Experiment (4–8 steps)**  
- Choose 50 long documents (policies, manuals).
- Baseline: chunk-only retrieval.
- Variant: chunk index + RAPTOR-like summary tree retrieval.
- Evaluate on summary/global questions; measure groundedness and completeness.

### HyDE query expansion

**What it is**  
Generate a “hypothetical answer document” with an LLM, embed it, and use that embedding to retrieve real documents. HyDE improves retrieval when direct query embeddings are weak. citeturn2search2turn18search3

**Why it helps Penny**  
Helps vague queries, short queries, or ambiguous phrasing.

**Integration point**  
Query rewriting step before vector search (or before hybrid search).

**Trade-offs**  
Extra LLM call; risk of injecting bias; needs careful budgets.

**Experiment**  
- Identify a set of “poor retrieval” queries.
- Run HyDE only when retrieval confidence is low.
- Measure context recall/precision and answer relevance (RAGAS). citeturn7search4

### Late-interaction / “better than bi-encoder” retrieval (ColBERT)

**What it is**  
ColBERT uses token-level embeddings and late interaction (MaxSim) to improve retrieval quality compared to single-vector embeddings. citeturn2search3turn2search7

**Why it helps Penny**  
Better for technical language and queries that require fine-grained token matching while still being semantic.

**Integration point**  
Replace or augment your vector retriever for targeted corpora.

**Trade-offs**  
Bigger index and compute vs standard dense retrieval; may be worth it only for high-value collections.

**Experiment**  
- Stand up ColBERT on one corpus (e.g., product docs).
- Compare retrieval quality vs current embeddings; measure downstream groundedness.

### Retrieval-augmented tool use and agentic workflows

**What it is**  
Let Penny call tools (GraphQuery, VectorSearch, ticket APIs, etc.) rather than “guessing.” This is supported by:
- OpenAI function calling + structured outputs for constrained tool calls citeturn8search0turn0search3  
- ReAct (reason + act in steps for multi-hop problems) citeturn0search2turn0search10  
- Toolformer (models trained to decide when/how to call APIs) citeturn12search0  
- Agent frameworks: LangGraph (workflow/agent patterns) and OpenAI Agents SDK (agentic apps with tools, handoffs, tracing). citeturn5search1turn8search1turn8search4  

**Why it helps Penny**  
This is how you turn Penny from “chatbot” into “operator”: it can execute steps, check sources, and produce traceable work.

**Integration point**  
Orchestrator tool layer + step planner.

**Trade-offs**  
Higher complexity; security requirements go up (tool sandboxing, least privilege).

**Experiment**  
- Start with 2–3 safe read-only tools (GraphQuery, VectorSearch, “GetPolicySnippet”).
- Enforce strict schemas and validation.
- Measure reduction in hallucinations and improved trace completeness.

### Semantic parsing to graph queries

**What it is**  
Translate user questions into formal graph queries:
- Text2Cypher for Neo4j (Neo4j provides practical guidance including schema context + validation loops). citeturn4search3turn4search7  
- Text2SPARQL for RDF stores (SPARQL 1.1 is the W3C standard query language; there’s active research and fine-tuning work on text-to-SPARQL). citeturn11search9turn11search0turn11search2  

**Why it helps Penny**  
When the question is truly structured (“show all processes that depend on X”), query generation can be more precise than embeddings.

**Integration point**  
Graph layer query engine (if you move from pure static JSON to a graph DB/RDF store).

**Concrete tooling**  
- Neo4j + Cypher (property graph); Neo4j also supports vector indexes if you want graph+vector in one system. citeturn17search2turn17search0  
- RDF tooling: RDFLib (Python) supports RDF graphs and SPARQL 1.1 queries; Apache Jena ARQ is a SPARQL processor. citeturn19search0turn19search1  

**Trade-offs**  
Schema drift breaks generated queries; requires strong validation and guardrails.

**Experiment**  
- Choose 20–50 “graph-structured” questions.
- Implement Text2Cypher with strict schema prompt and server-side query validation.
- Compare accuracy and explainability vs embedding retrieval.

### Knowledge graph embeddings and link prediction

**What it is**  
Learn vector embeddings of nodes/relations to:
- rank likely missing edges (link prediction)
- rank traversal candidates beyond simple heuristics

Classic KG embedding models include:
- TransE citeturn1search4  
- RotatE citeturn1search1  
- ComplEx citeturn1search6  

Practical libraries:
- PyKEEN (reproducible KG embeddings) citeturn14search2  
- DGL-KE (scalable KG embeddings; supports multiple KGE models) citeturn14search3turn14search7  

**Why it helps Penny**  
If your typed graph grows large, “which node should we traverse next?” becomes a ranking problem. KGE can learn patterns of good traversals and fill in plausible missing connections—but be careful: “plausible” is not “true.”

**Integration point**  
Graph ranking module feeding the orchestrator’s traversal/routing decisions.

**Trade-offs**  
Adds ML training and evaluation requirements; risk of silently introducing wrong edges if you don’t keep provenance/confidence.

**Experiment**  
- Freeze one graph version.
- Train an embedding model for link prediction.
- Use it only for “suggested edges” or traversal ranking, not auto-writing the canonical graph.
- Measure whether suggested edges improve retrieval paths and user outcomes.

### Graph neural networks for traversal/ranking

**What it is**  
Use GNNs to compute node representations and predict relevance, importance, or next-step traversal. Key architectures:
- GraphSAGE (inductive node embeddings) citeturn1search3  
- Graph Attention Networks (GAT) citeturn13search0  
- R-GCN for relational graphs (good fit for typed edges) citeturn13search1  

Tooling:
- PyTorch Geometric citeturn13search2  
- DGL citeturn13search3  

**Why it helps Penny**  
If your graph becomes truly large and messy, heuristics (“expand depends_on depth=2”) can be weak. GNNs can learn to prioritize.

**Integration point**  
Graph ranking module.

**Trade-offs**  
Highest ML complexity in this list; may be premature for mid-sized teams unless graph scale demands it.

**Experiment**  
- Start with a simple supervised task (“predict which nodes users click next” from telemetry).
- Train a lightweight model; compare traversal ranking quality vs heuristics.

### Memory layers and user-personalized graphs

**What it is**  
Store and retrieve:
- long-term user preferences (“role lens”, recurring workflows)
- session summaries and “what we decided”
- personalized graph views

MemGPT proposes “virtual context management,” using hierarchical memory ideas to go beyond context window limits. citeturn3search3  
Generative Agents research demonstrates a pattern of storing experiences, summarizing reflections, and retrieving memories for planning. citeturn15search3  
GraphRAG personalization is emerging; e.g., PersonaAgent with GraphRAG uses community-aware knowledge graphs for persona-aligned prompting. citeturn15search1

**Why it helps Penny**  
Personalization improves usability and reduces repetitive prompting. It’s especially valuable when Penny is an “operations assistant” used daily.

**Integration point**  
Memory module + graph lensing (UI and orchestrator). You can store memory as:
- vector memories (embeddings) for fuzzy recall
- graph memories (typed facts/preferences) for control and explainability

**Trade-offs**  
Privacy risk increases (you are storing user-specific data). Needs strict retention policies, opt-outs, and access controls.

**Experiment**  
- Implement “session summary memory” first (low risk).
- Then add “stable preferences” (role lens defaults).
- Measure return-user satisfaction and reduced repeated instructions.

### Retrieval-augmented fine-tuning and LoRA

**What it is**  
Instead of only prompting with retrieved docs, you also adapt the model to “work better with retrieval.”

- LoRA is a parameter-efficient fine-tuning method that injects low-rank adapters while freezing base model weights. citeturn3search2  
- RAFT (Retrieval Augmented Fine-Tuning) trains the model in “open-book” settings to use retrieved docs better and ignore distractors. citeturn12search1turn12search9  

**Why it helps Penny**  
If Penny repeatedly answers the same kinds of questions, fine-tuning can:
- improve instruction following for your domain
- improve citation discipline
- reduce sensitivity to irrelevant retrieved chunks

**Integration point**  
Model layer (LLM selection). Often combined with orchestrator routing: use fine-tuned model only for narrow domains.

**Trade-offs**  
Higher ML ops overhead; evaluation burden; risk of degrading generality.

**Experiment**  
- Start with a small fine-tune targeting one narrow class (“policy Q&A with citations”).
- Use RAFT-style training examples with distractors.
- A/B test against prompting-only baseline.

### Governance and constraints for graph + data quality

**What it is**  
Use schema validation and graph constraints so your graph doesn’t rot.

- JSON Schema provides standard structure validation (latest metaschema 2020-12). citeturn18search1  
- If you move to RDF, SHACL validates RDF graphs against constraints. citeturn4search0turn4search8  
- RDF 1.1 defines the underlying RDF data model. citeturn4search1  

**Why it helps Penny**  
Typed graphs only stay useful when the definitions and edge semantics stay consistent.

**Integration point**  
Governance pipeline (pre-merge checks) + versioning.

**Experiment**  
- Add CI validation for graph JSON schema.
- Add required fields: owner, last_reviewed_at, confidence.
- Measure drift rate and stale-node count.

### Local LLMs and offline serving

**What it is**  
Run models locally/on-prem for cost, privacy, or offline mode:

- llama.cpp runs LLM inference locally and uses the GGUF format. citeturn10search0  
- Ollama provides a developer-friendly local runtime for models. citeturn10search1  
- vLLM is a high-throughput serving engine for LLM inference. citeturn10search2turn10search14  

**Why it helps Penny**  
For regulated environments or cost-sensitive deployments, local inference can be a differentiator.

**Integration point**  
Model router in orchestrator: choose “local model” for offline/low-sensitivity tasks or as fallback.

**Trade-offs**  
Quality may lag frontier APIs; you own hardware and deployment complexity.

**Experiment**  
- Route “graph explorer explainers” to a local model first (low risk).
- Compare user satisfaction and cost; keep evidence retrieval unchanged.

### Privacy-preserving retrieval

**What it is**  
Techniques to reduce data exposure during retrieval/inference:
- PIR (Private Information Retrieval) hides which item you queried from the server (often too expensive for real-time RAG at scale). citeturn9search0turn9search12  
- Privacy-preserving similarity search over encrypted vectors (research exists, often heavy). citeturn9search1  
- Local differential privacy approaches for RAG (active research). citeturn9search6  
- Confidential computing enclaves: protect data “in use” during compute; Azure and Google Cloud provide overviews for confidential AI approaches. citeturn9search3turn9search7  

**Why it helps Penny**  
If Penny handles sensitive client data, privacy-preserving architecture can become a product requirement.

**Integration point**  
Infra layer (compute + storage), not prompts.

**Trade-offs**  
High complexity and latency/cost; typically phased in for high-sensitivity tenants.

**Experiment**  
- Start with pragmatic controls:
  - tenant-isolated indexes
  - strict ACL filters at retriever
  - redaction at ingestion
- Only later evaluate enclave-based inference for the highest sensitivity workflows.

## Prioritization for a mid-sized product team

The table below ranks techniques by **expected impact** vs **implementation cost/risk** for a mid-sized team shipping Penny + a graph+RAG orchestrator. “Impact” assumes your current system is dense chunked retrieval + LLM, and you’re adding typed graph navigation.

| Priority | Technique | Expected impact | Cost / risk | Maturity | Best first use-case |
|---|---|---|---|---|---|
| Top | Hybrid retrieval (BM25+sparse + vectors) + fusion (RRF) | High | Low–Med | High | Tech docs, policies, exact identifiers citeturn6search0turn16search0 |
| Top | Reranking (cross-encoder / BGE reranker / MonoT5) | High | Med | High | Reduce irrelevant chunks; “better citations” citeturn16search1turn16search3turn16search18 |
| Top | Evaluation harness (RAGAS/TruLens/Evals) + OTel tracing | High | Low–Med | High | Safe rollout + regression prevention citeturn7search0turn7search1turn7search2turn18search0 |
| High | Multi-hop retrieval (iterative) + graph-guided decomposition | High | Med | Med | Complex “why/how/compare” questions citeturn2search0turn0search2 |
| High | Tool calling for GraphQuery/VectorSearch + safe APIs | Med–High | Med | High | Traceable workflows, action-taking citeturn8search0turn0search3turn0search2 |
| Medium | RAPTOR / hierarchical summaries | Med–High | Med | Med | Long documents, “global” questions citeturn2search1 |
| Medium | HyDE query expansion | Medium | Med | Med | Short/vague queries, low recall citeturn2search2turn18search3 |
| Medium | Memory + personalization layer (session summaries → profile) | Medium | Med (privacy) | Med | Repeat users, role-based lensing citeturn3search3turn15search3 |
| Later | Text2Cypher / Text2SPARQL | Medium | Med–High | Med | Structured graph questions citeturn4search3turn11search9 |
| Later | RAFT + LoRA fine-tuning | Medium | High | Med | Stable domains, strict style/citations citeturn12search1turn3search2 |
| Later | KG embeddings / GNN ranking | Medium | High | Med | Large evolving graphs, traversal ranking citeturn1search4turn13search1 |
| Specialized | Privacy-preserving retrieval / confidential inference | Medium–High (if required) | High | Experimental–Med | Regulated/high-sensitivity tenants citeturn9search0turn9search3turn9search6 |
| Specialized | Local/offline LLMs | Medium | Med | High | Offline mode, cost reduction citeturn10search0turn10search2 |

## Metrics, experimentation cadence, and a three-month roadmap

### Metrics to track

Use a small set of “always-on” metrics so every experiment is comparable:

Quality (system)
- **Groundedness / faithfulness**: do answers actually match retrieved context (RAGAS “faithfulness” and related metrics; TruLens groundedness). citeturn7search0turn7search1  
- **Context relevance/precision**: are retrieved chunks relevant to the question (TruLens context relevance; RAGAS context precision/recall). citeturn7search1turn7search4  
- **Answer relevance**: does the answer address the question (TruLens answer relevance; RAGAS answer relevancy). citeturn7search1turn7search4  

Reliability (orchestrator)
- Route distribution (% routed to graph-only vs rag-only vs hybrid vs multi-hop)
- Tool error rate and fallback rate
- “No evidence” responses rate

Performance and cost
- p50/p95 latency by route
- tokens in/out by route
- retrieval time split (BM25 vs vector vs rerank)
- cache hit rates

Traceability/provenance
- citation coverage: % paragraphs with chunk_id/node_id references
- provenance completeness: graph_version recorded, chunk IDs recorded
If you want a formal provenance model, PROV-DM defines a standard conceptual model for provenance. citeturn4search2

Observability
- Adopt OTel traces/metrics/logs so you can correlate user outcomes with route decisions and versions. citeturn18search0turn18search8

### Experiment cadence and stopping rules

Cadence (practical default)
- Two-week experiment cycles:
  - Week 1: ship behind a flag + shadow evaluation
  - Week 2: A/B rollout + decision

Sample sizes (rules of thumb)
- Offline eval first: 200–500 queries per variant (balanced across query types)
- Online A/B: aim for at least 1,000–5,000 queries per variant if you can (depends heavily on traffic). If traffic is low, run longer rather than shipping underpowered tests.

Stopping rules
- Ship if:
  - groundedness improves (or stays flat) AND
  - answer relevance improves AND
  - p95 latency stays within your SLO budget
- Abort or roll back if:
  - groundedness drops beyond a pre-set threshold for 2 consecutive days
  - tool errors spike
  - p95 latency exceeds SLO by a large margin

### Three-month experiment roadmap

Month focus and sequencing below assumes you are concurrently rolling out the graph+RAG orchestrator hybrid.

Month one
- Implement evaluation + telemetry baseline (RAGAS/TruLens + OTel). citeturn7search0turn7search1turn18search0  
- Ship hybrid retrieval (BM25+sparse + vectors) + RRF fusion; then add reranker. citeturn6search0turn16search0turn16search1  

Month two
- Add bounded multi-hop retrieval for the “complex” query bucket; optionally use graph edges to propose hop-2 subqueries. citeturn2search0turn0search2  
- Pilot HyDE on low-confidence retrieval queries only. citeturn2search2turn18search3  
- Add governance checks for graph JSON (schema validation, owners, review dates). citeturn18search1  

Month three
- Tool-use expansion: implement a small set of safe tools (GraphQuery, VectorSearch, read-only business APIs) and add agent workflow support (LangGraph or Agents SDK) for multi-step tasks. citeturn8search0turn5search1turn8search1turn0search2  
- If your domain is stable and high-volume, start a limited RAFT/LoRA pilot for one narrow skill (e.g., “policy answers with citations”). citeturn12search1turn3search2  
- If offline/privacy is required: route graph-explainer flows to a local LLM prototype (llama.cpp or vLLM). citeturn10search0turn10search2  

This sequencing intentionally front-loads the highest ROI and de-risks everything else by making evaluation and telemetry foundational.

