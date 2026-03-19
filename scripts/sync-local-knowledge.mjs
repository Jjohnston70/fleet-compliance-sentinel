#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function loadDotEnvIfPresent() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function walkMarkdownFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
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
  return out;
}

function stripFrontmatter(text) {
  if (!text.startsWith('---\n')) return text;
  const end = text.indexOf('\n---\n', 4);
  if (end === -1) return text;
  return text.slice(end + 5);
}

function inferTitle(text, filePath) {
  const heading = text.split(/\r?\n/).find((line) => line.trim().startsWith('# '));
  if (heading) return heading.replace(/^#\s+/, '').trim().slice(0, 200);
  return path.basename(filePath, '.md').replace(/[_-]+/g, ' ').trim().slice(0, 200);
}

function clampTitle(value) {
  return value.trim().slice(0, 250);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function trimLeadingBoilerplate(text) {
  const lines = text.split(/\r?\n/);
  const startIndex = lines.findIndex((line) =>
    /^(##\s+Subpart|####\s+(§|Appendix|Supplement|Part)|###\s+Subpart)/.test(line.trim())
  );

  if (startIndex <= 0) return text.trim();
  return lines.slice(startIndex).join('\n').trim();
}

function splitLargeSection(baseTitle, heading, body, maxChars) {
  const chunks = [];
  const paragraphs = body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  let current = '';
  let partNumber = 1;

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push({
        title: clampTitle(`${baseTitle} :: ${heading}${partNumber > 1 ? ` (Part ${partNumber})` : ''}`),
        content: `# ${baseTitle}\n\n## ${heading}\n\n${current}`.trim(),
        heading,
        partNumber,
      });
      partNumber += 1;
    }

    if (paragraph.length <= maxChars) {
      current = paragraph;
      continue;
    }

    let offset = 0;
    while (offset < paragraph.length) {
      const slice = paragraph.slice(offset, offset + maxChars).trim();
      if (!slice) break;
      chunks.push({
        title: clampTitle(`${baseTitle} :: ${heading}${partNumber > 1 ? ` (Part ${partNumber})` : ''}`),
        content: `# ${baseTitle}\n\n## ${heading}\n\n${slice}`.trim(),
        heading,
        partNumber,
      });
      partNumber += 1;
      offset += maxChars;
    }
    current = '';
  }

  if (current) {
    chunks.push({
      title: clampTitle(`${baseTitle} :: ${heading}${partNumber > 1 ? ` (Part ${partNumber})` : ''}`),
      content: `# ${baseTitle}\n\n## ${heading}\n\n${current}`.trim(),
      heading,
      partNumber,
    });
  }

  return chunks;
}

function chunkMarkdownDocument(rawText, filePath, maxChars) {
  const stripped = stripFrontmatter(rawText).trim();
  const cleaned = trimLeadingBoilerplate(stripped);
  const baseTitle = inferTitle(stripped, filePath);
  const lines = cleaned.split(/\r?\n/);
  const sections = [];
  let currentHeading = '';
  let currentLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isSectionHeading = /^(##\s+Subpart|####\s+(§|Appendix|Supplement|Part)|###\s+Subpart)/.test(trimmed);
    if (isSectionHeading) {
      if (currentHeading && currentLines.length > 0) {
        sections.push({
          heading: currentHeading,
          body: currentLines.join('\n').trim(),
        });
      }
      currentHeading = trimmed.replace(/^#+\s+/, '').trim();
      currentLines = [];
      continue;
    }
    if (currentHeading) {
      currentLines.push(line);
    }
  }

  if (currentHeading && currentLines.length > 0) {
    sections.push({
      heading: currentHeading,
      body: currentLines.join('\n').trim(),
    });
  }

  if (sections.length === 0) {
    const fallbackContent =
      cleaned.length > maxChars
        ? `${cleaned.slice(0, maxChars)}\n\n[Content truncated for demo sync at ${maxChars} chars.]`
        : cleaned;
    return [
      {
        title: baseTitle,
        content: fallbackContent,
        sourceSuffix: '',
      },
    ];
  }

  const chunked = [];
  for (const section of sections) {
    for (const chunk of splitLargeSection(baseTitle, section.heading, section.body, maxChars)) {
      chunked.push({
        title: chunk.title,
        content: chunk.content,
        sourceSuffix: `#${slugify(section.heading)}${chunk.partNumber > 1 ? `-part-${chunk.partNumber}` : ''}`,
      });
    }
  }
  return chunked;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

async function main() {
  loadDotEnvIfPresent();

  const apiUrl = process.env.PENNY_API_URL || 'https://pipeline-punks-v2-production.up.railway.app';
  const apiKey = process.env.PENNY_API_KEY;
  const root = process.env.KNOWLEDGE_ROOT || 'C:\\Users\\truenorth\\Desktop\\pipeline_penny\\knowledge\\data\\original_content';
  const categoriesRaw = process.env.KNOWLEDGE_CATEGORIES || '02_TNDS-Protocols,04_Realty';
  const batchSize = Number(process.env.KNOWLEDGE_BATCH_SIZE || 20);
  const maxChars = Number(process.env.KNOWLEDGE_MAX_CHARS || 18000);
  const limit = Number(process.env.KNOWLEDGE_FILE_LIMIT || 200);
  const replaceMode = ['1', 'true', 'yes', 'on'].includes((process.env.KNOWLEDGE_REPLACE || '').trim().toLowerCase());

  if (!apiKey) {
    console.error('Missing PENNY_API_KEY. Set it in env or .env before running.');
    process.exit(1);
  }
  if (!fs.existsSync(root)) {
    console.error(`Knowledge root not found: ${root}`);
    process.exit(1);
  }

  const categories = categoriesRaw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (categories.length === 0) {
    console.error('No categories selected. Set KNOWLEDGE_CATEGORIES.');
    process.exit(1);
  }

  const selectedFiles = [];
  for (const category of categories) {
    const categoryPath = path.join(root, category);
    if (!fs.existsSync(categoryPath)) {
      console.warn(`Skipping missing category path: ${categoryPath}`);
      continue;
    }
    const files = walkMarkdownFiles(categoryPath);
    selectedFiles.push(...files);
  }

  const finalFiles = selectedFiles
    .filter((file) => !file.toLowerCase().endsWith('readme.md'))
    .sort()
    .slice(0, limit);

  if (finalFiles.length === 0) {
    console.error('No markdown files found to sync.');
    process.exit(1);
  }

  const docs = finalFiles.flatMap((filePath) => {
    const raw = fs.readFileSync(filePath, 'utf8');
    const sourceBase = path.relative(root, filePath).replace(/\\/g, '/');

    return chunkMarkdownDocument(raw, filePath, maxChars).map((doc) => ({
      title: doc.title,
      content: doc.content,
      source: `${sourceBase}${doc.sourceSuffix || ''}`,
    }));
  });

  console.log(`Preparing sync: files=${docs.length}, categories=${categories.join(', ')}, api=${apiUrl}`);

  let inserted = 0;
  let updated = 0;
  let ingested = 0;

  if (replaceMode) {
    const response = await fetch(`${apiUrl}/replace`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Penny-Api-Key': apiKey,
        'X-User-Role': 'admin',
      },
      body: JSON.stringify({ documents: docs }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Replace failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    ingested = Number(data.replaced_with || 0);
    inserted = Number(data.replaced_with || 0);
    updated = 0;
    console.log(
      `Knowledge base replaced: received=${data.received ?? 0}, deduped=${data.deduped ?? 0}, knowledge_docs=${data.knowledge_docs ?? 'n/a'}`
    );
  } else {
  for (const batch of chunkArray(docs, batchSize)) {
    const response = await fetch(`${apiUrl}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Penny-Api-Key': apiKey,
        'X-User-Role': 'admin',
      },
      body: JSON.stringify({ documents: batch }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ingest failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    ingested += Number(data.ingested || 0);
    inserted += Number(data.inserted || 0);
    updated += Number(data.updated || 0);
    console.log(
      `Batch synced: ingested=${data.ingested ?? 0}, inserted=${data.inserted ?? 0}, updated=${data.updated ?? 0}, total_docs=${data.knowledge_docs ?? 'n/a'}`
    );
  }
  }

  const statusResponse = await fetch(`${apiUrl}/status`, {
    headers: { 'X-Penny-Api-Key': apiKey },
  });
  const status = statusResponse.ok ? await statusResponse.json() : { knowledge_docs: 'unknown' };

  console.log(
    `Done. ingested=${ingested}, inserted=${inserted}, updated=${updated}, knowledge_docs=${status.knowledge_docs ?? 'unknown'}`
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
