/**
 * build-cfr-index.mjs
 * Builds the CFR chunk index from knowledge/cfr-docs/ markdown files.
 * Usage: npm run build:cfr-index
 */

import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { existsSync, readdirSync } from 'node:fs'

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
const TRAINING_DOCS_DIR = path.join(ROOT, 'knowledge', 'training-content', 'hazmat')
const CFR_INDEX_FILE = path.join(ROOT, 'knowledge', 'cfr-index', 'chunks.json')

console.log('[build-cfr-index] Starting CFR index build...')
console.log(`[build-cfr-index] Source : ${CFR_DOCS_DIR}`)
console.log(`[build-cfr-index] Output : ${CFR_INDEX_FILE}`)

let files = []
if (existsSync(CFR_DOCS_DIR)) {
  files = readdirSync(CFR_DOCS_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.txt'))
} else {
  console.warn('[build-cfr-index] CFR docs directory not found. Continuing without CFR source docs:', CFR_DOCS_DIR)
}

const trainingFiles = existsSync(TRAINING_DOCS_DIR)
  ? readdirSync(TRAINING_DOCS_DIR)
      .filter((f) => f.endsWith('.md') || f.endsWith('.txt'))
      .sort()
  : []

if (files.length === 0) {
  console.warn('[build-cfr-index] No CFR .md/.txt files found in source directory.')
}

if (trainingFiles.length === 0) {
  console.warn('[build-cfr-index] No training fallback files found in:', TRAINING_DOCS_DIR)
}

if (files.length === 0 && trainingFiles.length === 0) {
  if (existsSync(CFR_INDEX_FILE)) {
    console.warn('[build-cfr-index] No source docs found. Keeping existing CFR index file and skipping rebuild.')
    process.exit(0)
  }

  const emptyIndex = new JsonChunkIndex(CFR_INDEX_FILE)
  await emptyIndex.clear()
  console.warn('[build-cfr-index] No source docs found. Created empty CFR index to keep build green.')
  process.exit(0)
}

console.log(`[build-cfr-index] Found ${files.length} CFR files`)
console.log(`[build-cfr-index] Found ${trainingFiles.length} training files`)

const index = new JsonChunkIndex(CFR_INDEX_FILE)
await index.clear()

let chunksWritten = 0

for (const file of files) {
  const filePath = path.join(CFR_DOCS_DIR, file)
  const doc = await ingestFile(filePath, { domainSlug: 'dot-compliance' })
  const recordId = `cfr-${file.replace(/\.(md|txt)$/i, '').replace(/[^a-z0-9-]/gi, '-')}`

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

for (const file of trainingFiles) {
  const filePath = path.join(TRAINING_DOCS_DIR, file)
  const doc = await ingestFile(filePath, { domainSlug: 'dot-compliance' })
  const recordId = `training-${file.replace(/\.(md|txt)$/i, '').replace(/[^a-z0-9-]/gi, '-')}`
  const chunks = await index.addDocument({
    recordId,
    sourceId: `training/${file}`,
    domainSlug: 'dot-compliance',
    document: doc,
    chunking: { maxChunkChars: 1500, overlapChars: 150 },
  })
  chunksWritten += chunks.length
  console.log(`[build-cfr-index] training/${file}: ${chunks.length} chunks`)
}

console.log('')
console.log('[build-cfr-index] Done.')
console.log(`  CFR files indexed      : ${files.length}`)
console.log(`  Training files indexed : ${trainingFiles.length}`)
console.log(`  Chunks written: ${chunksWritten}`)
