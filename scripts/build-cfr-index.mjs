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
