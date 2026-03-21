# Penny Autoresearch Program

Agent instructions for the autonomous retrieval optimization loop.

## What Penny Is

Pipeline Penny is a DOT/CFR compliance Q&A assistant for True North Data Strategies.
She answers questions about federal motor carrier safety regulations using a local
knowledge base of chunked 49 CFR documents. The backend is a FastAPI app deployed on
Railway that performs keyword-based retrieval, query enrichment, and LLM answer generation.

## What a Good Answer Looks Like

A good Penny answer:
- Retrieves the correct CFR section(s) in the top 8 search results
- Contains all expected regulatory details (section numbers, time periods, requirements)
- Does NOT contain forbidden phrases like "don't have that information" when the answer IS in the corpus
- Provides complete regulatory guidance, not just a clip-dump of raw text
- Correctly identifies when something is NOT in the knowledge base (for known gaps)

A bad Penny answer:
- Retrieves wrong or loosely-related CFR sections
- Misses key regulatory details that the eval expects
- Says "I don't have that information" when the answer exists in the corpus
- Pulls from the wrong CFR Part entirely

## The Eval

The eval suite is at `evals/penny_eval_questions.json`. Each test case has:
- `query`: The user's natural-language question
- `expected_source_any`: At least one of these must appear in the top retrieved sources
- `expected_answer_all`: ALL of these must appear in the LLM answer text
- `expected_answer_any`: At least ONE of these must appear (if present)
- `forbidden_answer_any`: NONE of these may appear in the answer

The scoring metric is `fullPassed` / `total` from `evals/results/latest.json`.
A test fully passes when BOTH retrieval and answer checks pass.

## CFR Parts in Scope

The knowledge base currently covers these 49 CFR Parts:
- Part 40: DOT Drug and Alcohol Testing Procedures
- Part 360: Fees for Motor Carrier Registration and Insurance
- Part 365: Rules Governing Applications for Operating Authority
- Part 367: Standards for Registration
- Part 382: Controlled Substances and Alcohol Use and Testing
- Part 383: Commercial Driver's License Standards
- Part 384: State Compliance with CDL Program
- Part 387: Minimum Levels of Financial Responsibility
- Part 391: Qualifications of Drivers
- Part 395: Hours of Service of Drivers
- Part 396: Inspection, Repair, and Maintenance
- Part 397: Transportation of Hazardous Materials (KNOWN GAP -- not yet in corpus)

## What You Can Modify

You may ONLY modify `railway-backend/app/main.py`. Within that file, the following
areas are in scope for tuning:

### Retrieval Scoring Weights (in `search_docs_with_scores`)
- `title_score` term weights: currently 25 (text) and 40 (numeric)
- `content_score` term weights: currently 2 (text) and 4 (numeric)
- `citation_score`: title=900, content=180
- `phrase_score`: full query in title=600, title in query=450, bigrams title=50, bigrams content=30
- `section_score`: 120 for docs with section numbers
- `part_score`: match=280, mismatch penalty=-180
- `appendix_penalty`: -240

### Query Enrichment (in `enrich_query_for_search`)
- Add new enrichment rules for query patterns that currently under-retrieve
- Adjust existing enrichment terms to improve precision
- Add new keyword-to-part mappings in `extract_part_terms`

### Search Configuration
- `SEARCH_STOPWORDS`: words removed from search queries
- Content truncation length in `build_context` (currently 4000 chars per doc)
- Default search limit (currently 5 in query endpoint, 8 in debug)

### System Prompt
- `SYSTEM_PROMPT`: instructions to the LLM for answer generation
- Adjustments to improve answer completeness and accuracy

## What You CANNOT Modify

- Do NOT add new imports or dependencies
- Do NOT modify API endpoints, request/response schemas, or authentication
- Do NOT modify the knowledge store read/write logic
- Do NOT modify the LLM provider dispatch (anthropic/openai/gemini/ollama)
- Do NOT modify the general fallback mechanism
- Do NOT touch anything outside `railway-backend/`
- Do NOT touch `src/`, `packages/`, `scripts/`, or anything Clerk-adjacent

## Known Weak Areas to Prioritize

1. **Part 397 Hazmat Routing**: The corpus does not include Part 397 yet. The eval
   expects Penny to correctly identify this as a gap. The enrichment for hazmat
   routing queries currently adds "397.67" and "49 cfr part 397" terms -- ensure
   these do not cause false-positive retrieval from other parts.

2. **Multi-Part Questions**: Questions that require synthesizing across two CFR parts
   (e.g., "as a local driver how many hours can I drive" needs both 395.1 and 395.3)
   can be fragile. The enrichment for these needs to pull in enough context from
   both sections.

3. **Maintenance Record Retention**: Three different retention periods exist across
   396.3 (1 year/6 months), 396.11 (3 months for DVIR), and 396.9 (12 months for
   roadside). The retrieval must distinguish between these correctly based on query
   specificity.

## Strategy Guidance

- Start with scoring weight adjustments -- they have the most direct impact on retrieval
- If scoring changes plateau, move to query enrichment rules
- If enrichment changes plateau, consider system prompt refinements
- Each change should target a SPECIFIC failing test case or strengthen a marginal pass
- Check the autoresearch log before proposing -- do not repeat failed experiments
- Simpler changes are preferred over complex ones (Karpathy's simplicity criterion)
- When the score is already high (e.g., 9/9), focus on making passes MORE robust
  rather than chasing impossible improvements
