#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'knowledge', '06_VendorDocs');
const RAW_ROOT = path.join(ROOT, 'raw');
const PACKAGE_ROOT = path.join(ROOT, 'package');
const FULL_ROOT = path.join(PACKAGE_ROOT, 'full');
const CHUNK_ROOT = path.join(PACKAGE_ROOT, 'chunks');
const MANIFEST_PATH = path.join(PACKAGE_ROOT, 'manifest.json');
const README_PATH = path.join(PACKAGE_ROOT, 'README.md');

const MAX_CHUNK_CHARS = Number.parseInt(process.env.VENDOR_PACKAGE_CHUNK_MAX_CHARS || '3200', 10);
const MIN_CHUNK_CHARS = Number.parseInt(process.env.VENDOR_PACKAGE_CHUNK_MIN_CHARS || '1200', 10);
const VENDORS = (process.env.VENDOR_PACKAGE_INCLUDE || 'sentry,datadog,slack')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function walkMarkdownFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        out.push(fullPath);
      }
    }
  }
  return out.sort();
}

function parseFrontmatter(text) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { meta: {}, body: normalized.trim() };

  const body = normalized.slice(match[0].length).trim();
  const metaRaw = match[1];
  const meta = {};
  for (const line of metaRaw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  return { meta, body };
}

function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitByHeading(content) {
  const lines = content.split('\n');
  const sections = [];
  let current = [];

  for (const line of lines) {
    if (/^#{1,6}\s+/.test(line) && current.length > 0) {
      sections.push(current.join('\n').trim());
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) sections.push(current.join('\n').trim());
  return sections.filter(Boolean);
}

function splitLargeSection(section) {
  if (section.length <= MAX_CHUNK_CHARS) return [section];

  const paragraphs = section.split(/\n\n+/);
  const out = [];
  let buffer = '';

  for (const para of paragraphs) {
    const candidate = buffer ? `${buffer}\n\n${para}` : para;
    if (candidate.length <= MAX_CHUNK_CHARS) {
      buffer = candidate;
      continue;
    }

    if (buffer) out.push(buffer.trim());

    if (para.length <= MAX_CHUNK_CHARS) {
      buffer = para;
      continue;
    }

    let idx = 0;
    while (idx < para.length) {
      out.push(para.slice(idx, idx + MAX_CHUNK_CHARS).trim());
      idx += MAX_CHUNK_CHARS;
    }
    buffer = '';
  }

  if (buffer.trim()) out.push(buffer.trim());
  return out.filter(Boolean);
}

function chunkContent(content) {
  const sections = splitByHeading(content);
  const chunks = [];
  let buffer = '';

  for (const section of sections) {
    const pieces = splitLargeSection(section);
    for (const piece of pieces) {
      const candidate = buffer ? `${buffer}\n\n${piece}` : piece;
      const canAppend = candidate.length <= MAX_CHUNK_CHARS;
      const shouldSplit = buffer.length >= MIN_CHUNK_CHARS;
      if (!canAppend && shouldSplit) {
        chunks.push(buffer.trim());
        buffer = piece;
        continue;
      }
      if (!canAppend && !shouldSplit && buffer) {
        chunks.push(buffer.trim());
        buffer = piece;
        continue;
      }
      buffer = candidate;
    }
  }

  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks;
}

function renderFullDoc({ title, vendor, source, fetchedAt, body }) {
  return [
    `# ${title}`,
    '',
    `Source: ${source || 'n/a'}`,
    `Vendor: ${vendor}`,
    `Fetched At: ${fetchedAt || 'n/a'}`,
    '',
    '---',
    '',
    body,
    '',
  ].join('\n');
}

function renderChunkDoc({ title, vendor, source, relativePath, total, index, body }) {
  return [
    `# ${title} (Chunk ${index}/${total})`,
    '',
    `Source: ${source || 'n/a'}`,
    `Vendor: ${vendor}`,
    `Original Path: ${relativePath.replace(/\\/g, '/')}`,
    `Chunk: ${index}/${total}`,
    '',
    '---',
    '',
    body,
    '',
  ].join('\n');
}

function chunkFileName(filePath, index) {
  const base = path.basename(filePath, '.md');
  return `${base}__chunk-${String(index).padStart(3, '0')}.md`;
}

function writeReadme(manifest) {
  const lines = [
    '# Vendor Docs Package',
    '',
    'Pre-chunked removable package for Pipeline Penny.',
    'This package is inert until you explicitly ingest `chunks/`.',
    '',
    `Generated at: ${manifest.generated_at}`,
    `Chunk config: min=${manifest.min_chunk_chars}, max=${manifest.max_chunk_chars}`,
    '',
    '## Contents',
    '',
    '- `full/`: full vendor docs with source metadata',
    '- `chunks/`: Penny-ready chunk files by vendor',
    '- `manifest.json`: package metadata and counts',
    '',
    '## Activate (Ingest Only When Needed)',
    '',
    'Use your existing sync flow and point it at this package:',
    '',
    '```powershell',
    `$env:KNOWLEDGE_ROOT="${path.join('knowledge', '06_VendorDocs', 'package', 'chunks').replace(/\\/g, '\\\\')}"`,
    '$env:KNOWLEDGE_CATEGORIES="sentry,datadog,slack"',
    '# Optional: replace remote KB with this package',
    '# $env:KNOWLEDGE_REPLACE="true"',
    'npm run sync:knowledge',
    '```',
    '',
    '## Remove',
    '',
    'Delete `knowledge/06_VendorDocs/package` to remove the package completely.',
    '',
    '## Optional Archive',
    '',
    '```powershell',
    'Compress-Archive -Path "knowledge/06_VendorDocs/package/*" -DestinationPath "knowledge/06_VendorDocs/vendor-docs-package.zip" -Force',
    '```',
    '',
  ];

  fs.writeFileSync(README_PATH, `${lines.join('\n')}\n`, 'utf8');
}

function main() {
  if (!fs.existsSync(RAW_ROOT)) {
    throw new Error(`Raw vendor docs not found: ${RAW_ROOT}. Run npm run docs:vendors first.`);
  }

  ensureDir(FULL_ROOT);
  ensureDir(CHUNK_ROOT);

  const manifest = {
    generated_at: new Date().toISOString(),
    source_raw_root: path.relative(process.cwd(), RAW_ROOT).replace(/\\/g, '/'),
    package_root: path.relative(process.cwd(), PACKAGE_ROOT).replace(/\\/g, '/'),
    min_chunk_chars: MIN_CHUNK_CHARS,
    max_chunk_chars: MAX_CHUNK_CHARS,
    vendors: [],
    totals: {
      full_docs: 0,
      chunk_docs: 0,
    },
  };

  for (const vendor of VENDORS) {
    const vendorRawRoot = path.join(RAW_ROOT, vendor);
    if (!fs.existsSync(vendorRawRoot)) {
      console.log(`[vendor-package] Skipping missing vendor raw docs: ${vendor}`);
      continue;
    }

    const files = walkMarkdownFiles(vendorRawRoot);
    const vendorStats = {
      vendor,
      source_files: files.length,
      full_docs: 0,
      chunk_docs: 0,
      avg_chunks_per_doc: 0,
    };

    for (const filePath of files) {
      const rel = path.relative(vendorRawRoot, filePath);
      const raw = fs.readFileSync(filePath, 'utf8');
      const { meta, body } = parseFrontmatter(raw);

      const title = (meta.title || path.basename(filePath, '.md')).trim();
      const source = (meta.source || '').trim();
      const fetchedAt = (meta.fetched_at || '').trim();
      const cleaned = cleanText(body);
      if (!cleaned) continue;

      const fullOutPath = path.join(FULL_ROOT, vendor, rel);
      ensureDir(path.dirname(fullOutPath));
      fs.writeFileSync(
        fullOutPath,
        renderFullDoc({ title, vendor, source, fetchedAt, body: cleaned }),
        'utf8'
      );
      vendorStats.full_docs += 1;
      manifest.totals.full_docs += 1;

      const chunks = chunkContent(cleaned);
      for (let i = 0; i < chunks.length; i += 1) {
        const chunkIndex = i + 1;
        const chunkName = chunkFileName(rel, chunkIndex);
        const chunkOutPath = path.join(CHUNK_ROOT, vendor, path.dirname(rel), chunkName);
        ensureDir(path.dirname(chunkOutPath));
        fs.writeFileSync(
          chunkOutPath,
          renderChunkDoc({
            title,
            vendor,
            source,
            relativePath: path.join(vendor, rel),
            total: chunks.length,
            index: chunkIndex,
            body: chunks[i],
          }),
          'utf8'
        );
      }

      vendorStats.chunk_docs += chunks.length;
      manifest.totals.chunk_docs += chunks.length;
    }

    vendorStats.avg_chunks_per_doc =
      vendorStats.full_docs > 0
        ? Number((vendorStats.chunk_docs / vendorStats.full_docs).toFixed(2))
        : 0;
    manifest.vendors.push(vendorStats);
    console.log(
      `[vendor-package] ${vendor}: source=${vendorStats.source_files}, full=${vendorStats.full_docs}, chunks=${vendorStats.chunk_docs}`
    );
  }

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  writeReadme(manifest);
  console.log(
    `[vendor-package] Complete: full_docs=${manifest.totals.full_docs}, chunk_docs=${manifest.totals.chunk_docs}`
  );
  console.log(`[vendor-package] Package root: ${path.relative(process.cwd(), PACKAGE_ROOT).replace(/\\/g, '/')}`);
}

try {
  main();
} catch (error) {
  console.error(`[vendor-package] Failed: ${error.message || error}`);
  process.exit(1);
}

