# Claude Code Integration Prompt
# pipeline_x_non_gov → Chief (website-pipeline-punks-pipelinex-v2)
# Run this prompt in Claude Code at the repo root.

---

## PROMPT — PASTE THIS INTO CLAUDE CODE

---

You are integrating the AI engine packages from `pipeline_x_non_gov-main` into this
Next.js project (website-pipeline-punks-pipelinex-v2).

The source backup lives at `./pipeline_x_non_gov-main/` in this repo root.
Empty destination directories already exist at `./packages/tnds-*/`.

Your job is to copy the right source files, rewrite their internal imports,
wire them into the project, and add the integration layer. Do not touch
any existing Chief or Penny code unless explicitly told to below.

---

## REPO CONTEXT

Current stack:
- Next.js 15 on Vercel
- Clerk auth (org-based)
- Neon Postgres via @neondatabase/serverless
- Railway FastAPI backend (Penny chat, CFR knowledge.json)
- Chief module: fleet/DOT compliance pages, Postgres data layer
- Penny: RAG chatbot backed by flat JSON knowledge store on Railway

What we are adding:
- @tnds/types — shared type contracts + path helper
- @tnds/ingest-core — document ingestion (PDF, DOCX, CSV, MD, HTML, TXT, webpage)
- @tnds/retrieval-core — chunking, lexical search, grounded prompt builder
- @tnds/memory-core — knowledge timeline store

These replace/augment Penny's current flat keyword search with proper
chunked retrieval and add the ability to ingest compliance documents
(certs, SOPs, inspection reports) per org.

---

## TASK 1 — COPY AND ADAPT PACKAGE SOURCE FILES

For each package, copy the source from pipeline_x_non_gov-main/packages/
into ./packages/tnds-*/src/index.ts, then make the changes listed below.

### 1a. Copy @tnds/types

SOURCE: ./pipeline_x_non_gov-main/packages/types/src/index.ts
DEST:   ./packages/tnds-types/src/index.ts

After copying, make these changes to the destination file:

1. Replace every occurrence of `@ai-lab/types` with `@tnds/types`
   (there are none in this file, but verify)

2. Replace the entire `resolveAiLabRoot` function and `getAiLabPaths` function
   with this updated version that works in Chief's environment:

```typescript
export function resolveProjectRoot(
  startDir: string = process.cwd(),
  rootMarkerName?: string
): string {
  if (rootMarkerName) {
    let current = path.resolve(startDir);
    while (true) {
      const packageJsonPath = path.join(current, 'package.json');
      if (existsSync(packageJsonPath)) {
        try {
          const parsed = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { name?: string };
          if (parsed.name === rootMarkerName) return current;
        } catch { /* keep searching */ }
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  let current = path.resolve(startDir);
  while (true) {
    const packageJsonPath = path.join(current, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const parsed = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
          name?: string;
          workspaces?: unknown;
        };
        if (parsed.workspaces || parsed.name === 'ai-lab') return current;
      } catch { /* keep searching */ }
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(
        `Could not resolve project root from: ${startDir}. Pass an explicit rootDir to getPaths() instead.`
      );
    }
    current = parent;
  }
}

export function resolveAiLabRoot(startDir: string = process.cwd()): string {
  return resolveProjectRoot(startDir, 'ai-lab');
}

export interface PathConfig {
  rootDir: string;
  dataDir?: string;
  domainsDir?: string;
}

export function getPaths(config: PathConfig): AiLabPaths {
  const { rootDir } = config;
  const dataDir = config.dataDir ?? path.join(rootDir, 'data');
  return {
    rootDir,
    appsDir: path.join(rootDir, 'apps'),
    packagesDir: path.join(rootDir, 'packages'),
    dataDir,
    docsDir: path.join(dataDir, 'docs'),
    knowledgeDir: path.join(dataDir, 'knowledge'),
    indexDir: path.join(dataDir, 'index'),
    graphDir: path.join(dataDir, 'graph'),
    domainsDir: config.domainsDir ?? path.join(rootDir, 'domains'),
    promptsDir: path.join(rootDir, 'prompts'),
    skillsDir: path.join(rootDir, 'skills'),
  };
}

export function getAiLabPaths(startDir: string = process.cwd()): AiLabPaths {
  const rootDir = resolveProjectRoot(startDir);
  return getPaths({ rootDir });
}
```

### 1b. Copy @tnds/ingest-core

SOURCE: ./pipeline_x_non_gov-main/packages/ingest-core/src/index.ts
DEST:   ./packages/tnds-ingest-core/src/index.ts

After copying, replace every occurrence of:
  `@ai-lab/types` → `@tnds/types`

### 1c. Copy @tnds/retrieval-core

SOURCE: ./pipeline_x_non_gov-main/packages/retrieval-core/src/index.ts
DEST:   ./packages/tnds-retrieval-core/src/index.ts

After copying, replace every occurrence of:
  `@ai-lab/types` → `@tnds/types`

### 1d. Copy @tnds/memory-core

SOURCE: ./pipeline_x_non_gov-main/packages/memory-core/src/index.ts
DEST:   ./packages/tnds-memory-core/src/index.ts

After copying, replace every occurrence of:
  `@ai-lab/types` → `@tnds/types`

---

## TASK 2 — WRITE PACKAGE.JSON FILES

Write the following package.json into each package directory.
These should already exist from a previous session but overwrite them
to be sure they are correct.

### packages/tnds-types/package.json
```json
{
  "name": "@tnds/types",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

### packages/tnds-ingest-core/package.json
```json
{
  "name": "@tnds/ingest-core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@tnds/types": "*"
  }
}
```

### packages/tnds-retrieval-core/package.json
```json
{
  "name": "@tnds/retrieval-core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@tnds/types": "*"
  }
}
```

### packages/tnds-memory-core/package.json
```json
{
  "name": "@tnds/memory-core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@tnds/types": "*"
  }
}
```

---

## TASK 3 — UPDATE ROOT package.json

Edit `./package.json` to add:

1. A `"workspaces"` field so npm resolves the local packages:
```json
"workspaces": [
  "packages/*"
]
```

2. Add these to `"dependencies"` (local workspace references):
```json
"@tnds/types": "*",
"@tnds/ingest-core": "*",
"@tnds/retrieval-core": "*",
"@tnds/memory-core": "*"
```

3. Add these to `"dependencies"` if not already present
   (required by ingest-core at runtime):
```json
"mammoth": "^1.11.0",
"pdf-parse": "^2.4.5",
"csv-parse": "^6.1.0",
"cheerio": "^1.2.0"
```

Do NOT remove any existing dependencies.
Do NOT change the name, version, scripts, or devDependencies.

---

## TASK 4 — UPDATE tsconfig.json

Edit `./tsconfig.json` to add path aliases so TypeScript resolves
the local packages without needing npm install to complete first.

Add this to `compilerOptions.paths`:
```json
{
  "@tnds/types": ["./packages/tnds-types/src/index.ts"],
  "@tnds/ingest-core": ["./packages/tnds-ingest-core/src/index.ts"],
  "@tnds/retrieval-core": ["./packages/tnds-retrieval-core/src/index.ts"],
  "@tnds/memory-core": ["./packages/tnds-memory-core/src/index.ts"]
}
```

If `compilerOptions.paths` does not exist, create it.
Do not modify any other tsconfig settings.

---

## TASK 5 — CREATE KNOWLEDGE DIRECTORY STRUCTURE

Create these directories if they do not exist:

```
./knowledge/cfr-docs/
./knowledge/cfr-index/
./knowledge/org-data/
./knowledge/timeline/
./knowledge/domains/dot-compliance/skills/
./knowledge/domains/dot-compliance/prompts/
./knowledge/domains/dot-compliance/documents/
./knowledge/domains/dot-compliance/chunks/
./knowledge/domains/dot-compliance/tags/
```

Create `.gitkeep` files in:
- `./knowledge/cfr-index/.gitkeep`
- `./knowledge/org-data/.gitkeep`
- `./knowledge/timeline/.gitkeep`

---

## TASK 6 — CREATE DOT COMPLIANCE DOMAIN MANIFEST

Create `./knowledge/domains/dot-compliance/manifest.json`:

```json
{
  "name": "DOT Compliance",
  "slug": "dot-compliance",
  "version": "1.0.0",
  "description": "Federal Motor Carrier Safety Administration regulations and DOT compliance reference for fleet operators. Covers 49 CFR Parts 40, 382, 383, 387, 391, 395, 396.",
  "enabled": true,
  "defaultSkills": ["dot-compliance"],
  "defaultPrompts": ["compliance-qa/v1"],
  "tags": ["fmcsa", "dot", "cfr-49", "fleet", "driver", "permit", "compliance", "hazmat", "cdl", "hos"]
}
```

---

## TASK 7 — CREATE penny-ingest.ts

Create `./src/lib/penny-ingest.ts`:

```typescript
/**
 * penny-ingest.ts
 *
 * Uses @tnds/ingest-core and @tnds/retrieval-core to build and query
 * a chunked CFR knowledge index for Penny.
 *
 * Replaces the flat keyword search in Railway FastAPI with proper
 * chunked retrieval built server-side in Next.js.
 *
 * Usage:
 *   Build index (run once after updating CFR docs):
 *     node scripts/build-cfr-index.mjs
 *
 *   Query at runtime:
 *     const { groundedPrompt, sources } = await buildPennyContext({ query, orgId })
 */

import path from 'node:path'
import { readdirSync } from 'node:fs'
import { ingestFile } from '@tnds/ingest-core'
import { JsonChunkIndex, buildGroundedPrompt } from '@tnds/retrieval-core'

// CFR source markdown files — output of cfr_dot_scraper.py
const CFR_DOCS_DIR = path.join(process.cwd(), 'knowledge', 'cfr-docs')

// CFR chunk index — built by scripts/build-cfr-index.mjs
const CFR_INDEX_FILE = path.join(process.cwd(), 'knowledge', 'cfr-index', 'chunks.json')

// Per-org document chunks — built when orgs upload compliance docs
const ORG_DATA_ROOT = path.join(process.cwd(), 'knowledge', 'org-data')

/**
 * Builds the CFR chunk index from markdown files in knowledge/cfr-docs/.
 * Run once at setup and whenever CFR docs are refreshed from the scraper.
 * Output: knowledge/cfr-index/chunks.json
 */
export async function buildCfrIndex(): Promise<{ chunksWritten: number; filesIndexed: number }> {
  const index = new JsonChunkIndex(CFR_INDEX_FILE)
  await index.clear()

  let files: string[] = []
  try {
    files = readdirSync(CFR_DOCS_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.txt'))
  } catch {
    console.warn('[penny-ingest] CFR docs directory not found:', CFR_DOCS_DIR)
    return { chunksWritten: 0, filesIndexed: 0 }
  }

  let chunksWritten = 0

  for (const file of files) {
    const filePath = path.join(CFR_DOCS_DIR, file)
    const doc = await ingestFile(filePath, { domainSlug: 'dot-compliance' })
    const recordId = `cfr-${file.replace(/\.(md|txt)$/, '').replace(/[^a-z0-9-]/gi, '-')}`

    const chunks = await index.addDocument({
      recordId,
      sourceId: file,
      domainSlug: 'dot-compliance',
      document: doc,
      chunking: {
        maxChunkChars: 1500,
        overlapChars: 150,
      },
    })

    chunksWritten += chunks.length
    console.log(`[penny-ingest] Indexed ${file}: ${chunks.length} chunks`)
  }

  console.log(`[penny-ingest] CFR index complete. ${chunksWritten} chunks across ${files.length} files.`)
  return { chunksWritten, filesIndexed: files.length }
}

/**
 * Ingests an org-specific compliance document into that org's private chunk index.
 * Call this when a user uploads a certificate, SOP, inspection report, etc.
 *
 * Supported file types: PDF, DOCX, CSV, MD, TXT, HTML
 */
export async function ingestOrgDocument(params: {
  orgId: string
  filePath: string
  domainSlug?: string
}): Promise<{ chunksWritten: number; recordId: string }> {
  const orgIndexFile = path.join(ORG_DATA_ROOT, params.orgId, 'chunks.json')
  const index = new JsonChunkIndex(orgIndexFile)

  const doc = await ingestFile(params.filePath, {
    domainSlug: params.domainSlug ?? `org-${params.orgId}`,
  })

  const recordId = `org-${params.orgId}-${path.basename(params.filePath)}-${Date.now()}`

  const chunks = await index.addDocument({
    recordId,
    sourceId: path.basename(params.filePath),
    domainSlug: params.domainSlug ?? `org-${params.orgId}`,
    document: doc,
    chunking: {
      maxChunkChars: 1200,
      overlapChars: 120,
    },
  })

  return { chunksWritten: chunks.length, recordId }
}

/**
 * Searches CFR index and optionally org-specific index.
 * Returns a grounded prompt ready to send to the LLM on Railway.
 *
 * This moves retrieval from Railway FastAPI into Next.js so:
 * - Org data never leaves the server raw
 * - CFR context is always current from the local index
 * - Railway only handles LLM inference, not retrieval
 */
export async function buildPennyContext(params: {
  query: string
  orgId?: string
  topK?: number
}): Promise<{ groundedPrompt: string; sources: string[] }> {
  const topK = params.topK ?? 5

  // Search CFR knowledge base
  const cfrIndex = new JsonChunkIndex(CFR_INDEX_FILE)
  const cfrChunks = await cfrIndex.search({
    query: params.query,
    topK,
    domainSlug: 'dot-compliance',
  })

  // Search org-specific documents if orgId provided
  let orgChunks: typeof cfrChunks = []
  if (params.orgId) {
    try {
      const orgIndexFile = path.join(ORG_DATA_ROOT, params.orgId, 'chunks.json')
      const orgIndex = new JsonChunkIndex(orgIndexFile)
      orgChunks = await orgIndex.search({
        query: params.query,
        topK: 3,
      })
    } catch {
      // No org-specific documents yet — normal for new orgs
    }
  }

  // Org-specific chunks first (more relevant), CFR chunks second (regulatory context)
  const allChunks = [...orgChunks, ...cfrChunks].slice(0, topK + 3)

  const groundedPrompt = buildGroundedPrompt({
    question: params.query,
    chunks: allChunks,
    instruction:
      'You are Pipeline Penny, a DOT compliance assistant for True North Data Strategies. ' +
      'Answer ONLY from the context chunks provided. ' +
      'Cite the specific CFR part and section when referencing regulations. ' +
      'If the answer is not in the context, say clearly: ' +
      "'I don't have that information in the current knowledge base.'",
  })

  const sources = [...new Set(allChunks.map((c) => c.sourceId))]

  return { groundedPrompt, sources }
}
```

---

## TASK 8 — CREATE chief-knowledge-timeline.ts

Create `./src/lib/chief-knowledge-timeline.ts`:

```typescript
/**
 * chief-knowledge-timeline.ts
 *
 * Uses @tnds/memory-core to maintain a compliance event timeline.
 * Records permit renewals, driver updates, imports, audits, and
 * document ingestions per org.
 *
 * Enables Penny to answer:
 *   "What changed in our compliance status this month?"
 *   "When was our IRP permit last renewed?"
 */

import path from 'node:path'
import { createKnowledgeStore } from '@tnds/memory-core'

const TIMELINE_FILE = path.join(process.cwd(), 'knowledge', 'timeline', 'records.json')

export type ComplianceEventType =
  | 'permit_renewed'
  | 'driver_updated'
  | 'import_completed'
  | 'audit_run'
  | 'document_ingested'
  | 'suspense_resolved'
  | 'asset_updated'

export function getComplianceTimeline() {
  return createKnowledgeStore(TIMELINE_FILE)
}

/**
 * Record a compliance event. Call this after any significant
 * compliance action — import, renewal, audit, document upload.
 */
export async function recordComplianceEvent(params: {
  orgId: string
  eventType: ComplianceEventType
  title: string
  content: string
  sourceId: string
  tags?: string[]
}): Promise<void> {
  const store = getComplianceTimeline()
  await store.saveRecord({
    domainSlug: `org-${params.orgId}`,
    sourceType: 'txt',
    sourceId: params.sourceId,
    title: params.title,
    content: params.content,
    tags: [params.eventType, `org-${params.orgId}`, ...(params.tags ?? [])],
    metadata: {
      orgId: params.orgId,
      eventType: params.eventType,
    },
  })
}

/**
 * Get compliance events for an org within an optional date range.
 */
export async function getOrgComplianceHistory(params: {
  orgId: string
  fromDate?: string
  toDate?: string
  limit?: number
}) {
  const store = getComplianceTimeline()
  return store.listRecords({
    domainSlug: `org-${params.orgId}`,
    fromDate: params.fromDate,
    toDate: params.toDate,
    limit: params.limit ?? 50,
  })
}

/**
 * Get a timeline summary grouped by day for an org.
 * Used for "what changed this month" Penny queries.
 */
export async function getOrgTimelineSummary(params: {
  orgId: string
  fromDate?: string
  toDate?: string
}) {
  const store = getComplianceTimeline()
  return store.summarizeTimeline({
    domainSlug: `org-${params.orgId}`,
    fromDate: params.fromDate,
    toDate: params.toDate,
  })
}
```

---

## TASK 9 — CREATE build-cfr-index.mjs SCRIPT

Create `./scripts/build-cfr-index.mjs`:

```javascript
/**
 * build-cfr-index.mjs
 *
 * Builds the CFR chunk index from markdown files in knowledge/cfr-docs/.
 * Run this after updating CFR docs from cfr_dot_scraper.py.
 *
 * Usage:
 *   node scripts/build-cfr-index.mjs
 *
 * Output:
 *   knowledge/cfr-index/chunks.json
 */

import { buildCfrIndex } from '../src/lib/penny-ingest.js'

console.log('[build-cfr-index] Starting CFR index build...')

try {
  const result = await buildCfrIndex()
  console.log(`[build-cfr-index] Complete.`)
  console.log(`  Files indexed: ${result.filesIndexed}`)
  console.log(`  Chunks written: ${result.chunksWritten}`)
  console.log(`  Output: knowledge/cfr-index/chunks.json`)
} catch (err) {
  console.error('[build-cfr-index] Failed:', err)
  process.exit(1)
}
```

---

## TASK 10 — ADD SCRIPT TO package.json

Add this to the `"scripts"` section of `./package.json`:

```json
"build:cfr-index": "node scripts/build-cfr-index.mjs"
```

---

## TASK 11 — UPDATE .gitignore

Add these lines to `./.gitignore` if not already present:

```
# TNDS Knowledge Runtime (generated at build/runtime, not committed)
knowledge/cfr-index/
knowledge/org-data/
knowledge/timeline/

# Non-gov source backup (in repo for integration only, not deployed)
pipeline_x_non_gov-main/
```

The `pipeline_x_non_gov-main/` entry is critical — it prevents the entire
backup repo from being committed to git or deployed to Vercel.

---

## TASK 12 — VERIFY BUILD PASSES

After completing all tasks above:

1. Run `npm install` from the repo root to resolve workspace packages
2. Run `npm run build` to verify no TypeScript errors
3. If build fails due to missing dependencies (mammoth, pdf-parse, csv-parse,
   cheerio), add them to package.json dependencies and re-run npm install
4. Fix any TypeScript import errors in the new files — the most likely issue
   is the `ingestFile` import path or the `JsonChunkIndex` constructor

Report the final build status. If READY, the integration is complete.

---

## CONSTRAINTS

- Do NOT modify any existing file in src/app/, src/components/, or src/lib/
  except to ADD the two new lib files (penny-ingest.ts and chief-knowledge-timeline.ts)
- Do NOT modify railway-backend/ or any Python files
- Do NOT modify vercel.json
- Do NOT remove any existing package.json dependencies
- Do NOT commit pipeline_x_non_gov-main/ to git
- The packages/ directory source files are the source of truth going forward —
  do NOT reference pipeline_x_non_gov-main/ in any import
- All imports in src/lib/penny-ingest.ts and src/lib/chief-knowledge-timeline.ts
  must use the @tnds/* package names, not relative paths into packages/

---

## DEFINITION OF DONE

- [ ] packages/tnds-types/src/index.ts exists with updated path resolver
- [ ] packages/tnds-ingest-core/src/index.ts exists with @tnds/types imports
- [ ] packages/tnds-retrieval-core/src/index.ts exists with @tnds/types imports
- [ ] packages/tnds-memory-core/src/index.ts exists with @tnds/types imports
- [ ] All four packages/*/package.json files are correct
- [ ] Root package.json has workspaces field and @tnds/* dependencies
- [ ] tsconfig.json has @tnds/* path aliases
- [ ] knowledge/cfr-docs/ directory exists (empty until CFR files copied in)
- [ ] knowledge/domains/dot-compliance/manifest.json exists
- [ ] src/lib/penny-ingest.ts exists
- [ ] src/lib/chief-knowledge-timeline.ts exists
- [ ] scripts/build-cfr-index.mjs exists
- [ ] .gitignore excludes pipeline_x_non_gov-main/ and knowledge runtime dirs
- [ ] npm run build passes with no errors

---

Jacob Johnston | True North Data Strategies LLC
jacob@truenorthstrategyops.com | 555-555-5555
