#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();
const sourceRepo = process.env.RAILWAY_DOCS_REPO_DIR || path.join(repoRoot, 'tmp', 'railway-docs');
const sourceContent = path.join(sourceRepo, 'content');
const outRoot = path.join(repoRoot, 'knowledge', '05_Railway');
const outRawRoot = path.join(outRoot, 'raw');
const outFullRoot = path.join(outRoot, 'full');
const outChunkRoot = path.join(outRoot, 'chunks');
const maxChunkChars = Number(process.env.RAILWAY_CHUNK_MAX_CHARS || 3500);
const minChunkChars = Number(process.env.RAILWAY_CHUNK_MIN_CHARS || 1200);

const includeDirs = ['docs', 'guides'];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function walkFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        out.push(full);
      }
    }
  }
  return out.sort();
}

function cleanYamlValue(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function parseFrontmatter(text) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
  const startStripped = normalized.replace(/^\s+/, '');
  const match = startStripped.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { body: normalized, title: '', description: '' };
  }

  const fm = match[1];
  const body = startStripped.slice(match[0].length);
  const title = cleanYamlValue((fm.match(/^title:\s*(.+)$/m) || [])[1] || '');
  const description = cleanYamlValue((fm.match(/^description:\s*(.+)$/m) || [])[1] || '');

  return { body, title, description };
}

function sanitizeMarkdown(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let skippingMdxBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^import\s.+from\s.+;?$/.test(trimmed) || /^export\s+/.test(trimmed)) {
      continue;
    }

    if (!skippingMdxBlock && /^<([A-Z][A-Za-z0-9]*)\b/.test(trimmed) && !trimmed.includes('</')) {
      if (!trimmed.endsWith('/>')) {
        skippingMdxBlock = true;
      }
      continue;
    }

    if (skippingMdxBlock) {
      if (trimmed.endsWith('/>') || /^<\/[A-Z][A-Za-z0-9]*>$/.test(trimmed)) {
        skippingMdxBlock = false;
      }
      continue;
    }

    let next = line;

    // Convert inline HTML links to markdown links.
    next = next.replace(/<a\s+[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // Remove remaining HTML tags.
    next = next.replace(/<[^>]+>/g, '');

    out.push(next);
  }

  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

function titleFromContent(content, fallbackName) {
  const heading = content.split('\n').find((line) => line.startsWith('# '));
  if (heading) return heading.slice(2).trim();
  return fallbackName.replace(/[-_]+/g, ' ').replace(/\.md$/i, '').trim();
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

function splitLargeSection(section, maxCharsPerChunk) {
  if (section.length <= maxCharsPerChunk) return [section];
  const paragraphs = section.split(/\n\n+/);
  const out = [];
  let buffer = '';

  for (const para of paragraphs) {
    const candidate = buffer ? `${buffer}\n\n${para}` : para;
    if (candidate.length <= maxCharsPerChunk) {
      buffer = candidate;
      continue;
    }
    if (buffer) out.push(buffer.trim());
    if (para.length <= maxCharsPerChunk) {
      buffer = para;
      continue;
    }

    // Hard split very large paragraphs.
    let idx = 0;
    while (idx < para.length) {
      out.push(para.slice(idx, idx + maxCharsPerChunk).trim());
      idx += maxCharsPerChunk;
    }
    buffer = '';
  }
  if (buffer) out.push(buffer.trim());
  return out.filter(Boolean);
}

function chunkContent(content) {
  const sections = splitByHeading(content);
  const chunks = [];
  let buffer = '';

  for (const section of sections) {
    const pieces = splitLargeSection(section, maxChunkChars);
    for (const piece of pieces) {
      const candidate = buffer ? `${buffer}\n\n${piece}` : piece;
      const canAppend = candidate.length <= maxChunkChars;
      const shouldSplit = buffer.length >= minChunkChars;
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

function sourceUrl(commit, relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  return `https://github.com/railwayapp/docs/blob/${commit}/content/${normalized}`;
}

function prepare() {
  if (!fs.existsSync(sourceContent)) {
    throw new Error(`Railway docs source not found: ${sourceContent}`);
  }

  const commit = execSync('git rev-parse HEAD', { cwd: sourceRepo, encoding: 'utf8' }).trim();
  ensureDir(outRawRoot);
  ensureDir(outFullRoot);
  ensureDir(outChunkRoot);

  const manifest = {
    generated_at: new Date().toISOString(),
    source_repo: 'https://github.com/railwayapp/docs',
    source_commit: commit,
    source_dir: sourceContent,
    max_chunk_chars: maxChunkChars,
    min_chunk_chars: minChunkChars,
    documents: 0,
    chunks: 0,
    by_section: {},
  };

  for (const section of includeDirs) {
    const sectionDir = path.join(sourceContent, section);
    if (!fs.existsSync(sectionDir)) continue;

    const files = walkFiles(sectionDir);
    manifest.by_section[section] = { documents: files.length, chunks: 0 };

    for (const fullPath of files) {
      const relFromContent = path.relative(sourceContent, fullPath);
      const relNoExt = relFromContent.replace(/\.md$/i, '');
      const raw = fs.readFileSync(fullPath, 'utf8');
      const parsed = parseFrontmatter(raw);
      let normalized = sanitizeMarkdown(parsed.body);
      if (!normalized) continue;

      if (parsed.title && !normalized.startsWith('# ')) {
        const desc = parsed.description ? `${parsed.description}\n\n` : '';
        normalized = `# ${parsed.title}\n\n${desc}${normalized}`;
      }

      const fallbackName = path.basename(fullPath);
      const title = parsed.title || titleFromContent(normalized, fallbackName);

      const rawOutPath = path.join(outRawRoot, relFromContent);
      ensureDir(path.dirname(rawOutPath));
      fs.writeFileSync(rawOutPath, `${normalized}\n`, 'utf8');

      const fullOutPath = path.join(outFullRoot, relFromContent);
      ensureDir(path.dirname(fullOutPath));
      const fullDoc = [
        `Title: ${title}`,
        `Source: ${sourceUrl(commit, relFromContent)}`,
        `Original Path: ${relFromContent.replace(/\\/g, '/')}`,
        `Section: ${section}`,
        '',
        '---',
        '',
        normalized,
        '',
      ].join('\n');
      fs.writeFileSync(fullOutPath, fullDoc, 'utf8');

      const chunks = chunkContent(normalized);
      const chunkCount = chunks.length;

      for (let i = 0; i < chunkCount; i += 1) {
        const index = String(i + 1).padStart(3, '0');
        const chunkBody = chunks[i];
        const chunkName = `${path.basename(relNoExt)}__chunk-${index}.md`;
        const chunkOutPath = path.join(outChunkRoot, path.dirname(relFromContent), chunkName);
        ensureDir(path.dirname(chunkOutPath));

        const content = [
          `# ${title} (Chunk ${i + 1}/${chunkCount})`,
          '',
          `Source: ${sourceUrl(commit, relFromContent)}`,
          `Original Path: ${relFromContent.replace(/\\/g, '/')}`,
          `Section: ${section}`,
          `Chunk: ${i + 1}/${chunkCount}`,
          '',
          '---',
          '',
          chunkBody,
          '',
        ].join('\n');

        fs.writeFileSync(chunkOutPath, content, 'utf8');
      }

      manifest.documents += 1;
      manifest.chunks += chunkCount;
      manifest.by_section[section].chunks += chunkCount;
    }
  }

  const readme = [
    '# Railway Docs Knowledge Pack',
    '',
    'Generated from the official Railway docs repository.',
    '',
    `- Source repo: ${manifest.source_repo}`,
    `- Source commit: ${manifest.source_commit}`,
    `- Generated at: ${manifest.generated_at}`,
    `- Documents: ${manifest.documents}`,
    `- Chunks: ${manifest.chunks}`,
    `- Chunk sizing: min=${manifest.min_chunk_chars}, max=${manifest.max_chunk_chars}`,
    '',
    '## Structure',
    '',
    '- `raw/`: sanitized markdown per source document',
    '- `full/`: polished full-document markdown with source metadata',
    '- `chunks/`: chunked markdown files ready for ingestion',
    '- `manifest.json`: generation metadata and counts',
    '',
    '## Ingest into Penny',
    '',
    'Use `chunks/` as your category directory in the knowledge sync flow.',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(outRoot, 'README.md'), `${readme}\n`, 'utf8');
  fs.writeFileSync(path.join(outRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`Prepared Railway docs pack: documents=${manifest.documents}, chunks=${manifest.chunks}`);
  console.log(`Output: ${outRoot}`);
}

prepare();
