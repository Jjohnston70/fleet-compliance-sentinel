/**
 * build-cfr-index.mjs
 * Builds the CFR chunk index from knowledge/cfr-docs/ markdown files.
 * Usage: npm run build:cfr-index
 */

import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { readdirSync } from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// Convert Windows paths to file:// URLs for ESM dynamic import
const ingestUrl = pathToFileURL(
  path.join(ROOT, 'packages/tnds-ingest-core/src/index.ts')
).href

const retrievalUrl = pathToFileURL(
  path.join(ROOT, 'packages/tnds-retrieval-core/src/index.ts')
).href

const { ingestFile } = await import(ingestUrl)
const { JsonChunkIndex } = await import(retrievalUrl)

const CFR_DOCS_DIR = path.join(ROOT, 'knowledge', 'cfr-docs')
const CFR_INDEX_FILE = path.join(ROOT, 'knowledge', 'cfr-index', 'chunks.json')

console.log('[build-cfr-index] Starting CFR index build...')
console.log(`[build-cfr-index] Source : ${CFR_DOCS_DIR}`)
console.log(`[build-cfr-index] Output : ${CFR_INDEX_FILE}`)

let files = []
try {
  files = readdirSync(CFR_DOCS_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.txt'))
} catch {
  console.error('[build-cfr-index] ERROR: CFR docs directory not found:', CFR_DOCS_DIR)
  process.exit(1)
}

if (files.length === 0) {
  console.error('[build-cfr-index] ERROR: No .md or .txt files found in', CFR_DOCS_DIR)
  process.exit(1)
}

console.log(`[build-cfr-index] Found ${files.length} files`)

const index = new JsonChunkIndex(CFR_INDEX_FILE)
await index.clear()

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
    chunking: { maxChunkChars: 1500, overlapChars: 150 },
  })

  chunksWritten += chunks.length
  console.log(`[build-cfr-index] ${file}: ${chunks.length} chunks`)
}

console.log('')
console.log('[build-cfr-index] Done.')
console.log(`  Files indexed : ${files.length}`)
console.log(`  Chunks written: ${chunksWritten}`)
