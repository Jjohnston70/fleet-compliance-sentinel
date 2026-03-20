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
