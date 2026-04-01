/**
 * build-demo-index.mjs
 * Builds demo knowledge chunk index from vendor and Realty Command docs.
 * Usage: tsx scripts/build-demo-index.mjs
 */

import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { existsSync, readdirSync, statSync } from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const ingestUrl = pathToFileURL(
  path.join(ROOT, 'packages/tnds-ingest-core/src/index.ts')
).href

const retrievalUrl = pathToFileURL(
  path.join(ROOT, 'packages/tnds-retrieval-core/src/index.ts')
).href

const { ingestFile } = await import(ingestUrl)
const { JsonChunkIndex } = await import(retrievalUrl)

const DEMO_ROOT = path.join(ROOT, 'knowledge', 'data', 'original_content')
const DEMO_INDEX_FILE = path.join(ROOT, 'knowledge', 'demo-index', 'chunks.json')
const DEMO_DOMAIN = 'demo-docs'
const DEMO_CATEGORIES = ['01_realty-command', 'hubspot', 'tenstreet']
const MAX_FILE_BYTES = 2_000_000

function walkDocs(rootDir) {
  const out = []
  const stack = [rootDir]
  while (stack.length > 0) {
    const current = stack.pop()
    const entries = readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(full)
        continue
      }
      if (!entry.isFile()) continue
      const lower = entry.name.toLowerCase()
      if (lower.endsWith('.md') || lower.endsWith('.txt')) {
        out.push(full)
      }
    }
  }
  return out
}

function toRecordId(relativePath) {
  return `demo-${relativePath.replace(/\.(md|txt)$/i, '').replace(/[^a-z0-9-]/gi, '-')}`
}

console.log('[build-demo-index] Starting demo index build...')
console.log(`[build-demo-index] Source : ${DEMO_ROOT}`)
console.log(`[build-demo-index] Output : ${DEMO_INDEX_FILE}`)

const index = new JsonChunkIndex(DEMO_INDEX_FILE)
await index.clear()

if (!existsSync(DEMO_ROOT)) {
  console.warn('[build-demo-index] Demo docs root not found. Skipping.')
  process.exit(0)
}

const files = []
const skippedFiles = []
for (const category of DEMO_CATEGORIES) {
  const categoryPath = path.join(DEMO_ROOT, category)
  if (!existsSync(categoryPath)) {
    console.warn(`[build-demo-index] Missing category: ${categoryPath}`)
    continue
  }
  const categoryFiles = walkDocs(categoryPath).filter(
    (filePath) => path.basename(filePath).toLowerCase() !== 'readme.md',
  )
  for (const filePath of categoryFiles) {
    const stat = statSync(filePath)
    if (stat.size > MAX_FILE_BYTES) {
      skippedFiles.push({
        filePath,
        bytes: stat.size,
      })
      continue
    }
    files.push(filePath)
  }
}

if (files.length === 0) {
  console.warn('[build-demo-index] No demo files found. Index cleared.')
  process.exit(0)
}

let chunksWritten = 0

for (const filePath of files) {
  const rel = path.relative(DEMO_ROOT, filePath).replace(/\\/g, '/')
  const doc = await ingestFile(filePath, { domainSlug: DEMO_DOMAIN })
  const chunks = await index.addDocument({
    recordId: toRecordId(rel),
    sourceId: `demo/${rel}`,
    domainSlug: DEMO_DOMAIN,
    document: doc,
    chunking: { maxChunkChars: 1800, overlapChars: 180 },
  })
  chunksWritten += chunks.length
  console.log(`[build-demo-index] ${rel}: ${chunks.length} chunks`)
}

console.log('')
console.log('[build-demo-index] Done.')
console.log(`  Files indexed : ${files.length}`)
console.log(`  Chunks written: ${chunksWritten}`)
if (skippedFiles.length > 0) {
  console.log(`  Files skipped : ${skippedFiles.length} (size > ${MAX_FILE_BYTES} bytes)`)
  for (const skipped of skippedFiles) {
    const rel = path.relative(DEMO_ROOT, skipped.filePath).replace(/\\/g, '/')
    console.log(`    - ${rel} (${skipped.bytes} bytes)`)
  }
}
