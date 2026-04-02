import path from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

export interface PennyCatalogDocument {
  title: string;
  source?: string;
  category?: string;
}

export interface PennyCatalogCategory {
  name: string;
  count: number;
}

export interface PennyCatalogResponse {
  documents: PennyCatalogDocument[];
  categories: PennyCatalogCategory[];
  knowledge_docs: number;
  source: string;
}

interface CatalogOptions {
  limit?: number;
  pennyApiUrl?: string;
  pennyApiKey?: string;
}

const CFR_DOCS_DIR = path.join(process.cwd(), 'knowledge', 'cfr-docs');
const DEMO_DOCS_DIR = path.join(process.cwd(), 'knowledge', 'data', 'original_content');
const TRAINING_DOCS_DIR = path.join(process.cwd(), 'knowledge', 'training-content', 'hazmat');

function sanitizeLimit(limit: number | undefined, fallback: number): number {
  if (!Number.isFinite(limit)) return fallback;
  return Math.max(1, Math.min(Number(limit), 500));
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(' ');
}

function humanizeCategory(raw: string): string {
  const normalized = raw.toLowerCase();
  if (normalized === '01_realty-command') return 'Realty Command';
  if (normalized === 'hubspot') return 'HubSpot';
  if (normalized === 'tenstreet') return 'Tenstreet';
  if (normalized === 'erg-hazmat') return 'ERG Hazmat';
  if (normalized === 'jj-keller') return 'JJ Keller';
  return titleCase(raw.replace(/^\d+[_-]?/, ''));
}

function humanizeFileStem(stem: string): string {
  const stripped = stem
    .replace(/^cfr-part-\d+[-_]?/i, '')
    .replace(/^part[-_]?/i, '')
    .replace(/^[_-]+|[_-]+$/g, '');
  return titleCase(stripped || stem);
}

function buildCfrTitle(filePath: string, fileName: string): string {
  try {
    const firstLine = readFileSync(filePath, 'utf8').split('\n', 1)[0]?.trim();
    const headingMatch = firstLine.match(/^#\s*49\s*CFR\s*Part\s*(\d+)\s*[—-]\s*(.+)$/i);
    if (headingMatch) {
      const part = Number.parseInt(headingMatch[1], 10);
      const partLabel = Number.isFinite(part) ? String(part) : headingMatch[1];
      return `Part ${partLabel} - ${headingMatch[2].trim()}`;
    }
  } catch {
    // Fall back to filename-derived title if file cannot be read.
  }

  const partMatch = fileName.match(/cfr-part-(\d+)-/i);
  const part = partMatch?.[1] ? String(Number.parseInt(partMatch[1], 10)) : undefined;
  const stem = fileName.replace(/\.(md|txt)$/i, '');
  const partPrefix = part ? `Part ${part} - ` : '';
  return `${partPrefix}${humanizeFileStem(stem)}`;
}

function walkDocs(rootDir: string): string[] {
  const files: string[] = [];
  if (!existsSync(rootDir)) return files;
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      const lower = entry.name.toLowerCase();
      if (lower.endsWith('.md') || lower.endsWith('.txt')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function sortDocs(docs: PennyCatalogDocument[]): PennyCatalogDocument[] {
  return docs.sort((a, b) => {
    const catA = (a.category || '').toLowerCase();
    const catB = (b.category || '').toLowerCase();
    if (catA !== catB) return catA.localeCompare(catB);
    if (catA === 'cfr parts') {
      const partA = a.title.match(/^Part\s+(\d+)/i);
      const partB = b.title.match(/^Part\s+(\d+)/i);
      if (partA && partB) {
        const nA = Number.parseInt(partA[1], 10);
        const nB = Number.parseInt(partB[1], 10);
        if (Number.isFinite(nA) && Number.isFinite(nB) && nA !== nB) {
          return nA - nB;
        }
      }
      if (partA && !partB) return -1;
      if (!partA && partB) return 1;
    }
    return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
  });
}

function buildCategories(docs: PennyCatalogDocument[]): PennyCatalogCategory[] {
  const counts = new Map<string, number>();
  for (const doc of docs) {
    const category = doc.category?.trim() || 'General';
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function buildLocalPennyCatalog(limit: number | undefined): PennyCatalogResponse {
  const safeLimit = sanitizeLimit(limit, 200);
  const documents: PennyCatalogDocument[] = [];

  if (existsSync(CFR_DOCS_DIR)) {
    const cfrFiles = readdirSync(CFR_DOCS_DIR)
      .filter((name) => (name.endsWith('.md') || name.endsWith('.txt')) && name !== 'INDEX.md')
      .sort();
    for (const file of cfrFiles) {
      const filePath = path.join(CFR_DOCS_DIR, file);
      documents.push({
        title: buildCfrTitle(filePath, file),
        source: file,
        category: 'CFR Parts',
      });
    }
  }

  if (existsSync(TRAINING_DOCS_DIR)) {
    const trainingFiles = readdirSync(TRAINING_DOCS_DIR)
      .filter((name) => name.endsWith('.md') || name.endsWith('.txt'))
      .sort();
    for (const file of trainingFiles) {
      const stem = file.replace(/\.(md|txt)$/i, '');
      const title = titleCase(stem.replace(/^TNDS-HZ-[^-]+-?/i, '').replace(/-/g, ' '));
      documents.push({
        title: title || stem,
        source: `training/${file}`,
        category: 'Training Modules',
      });
    }
  }

  if (existsSync(DEMO_DOCS_DIR)) {
    const demoFiles = walkDocs(DEMO_DOCS_DIR);
    for (const filePath of demoFiles) {
      const rel = path.relative(DEMO_DOCS_DIR, filePath).replace(/\\/g, '/');
      if (!rel || rel.startsWith('.')) continue;
      const firstSegment = rel.split('/')[0] || 'demo';
      const category = humanizeCategory(firstSegment);
      const stem = path.basename(filePath).replace(/\.(md|txt)$/i, '');
      documents.push({
        title: humanizeFileStem(stem),
        source: `demo/${rel}`,
        category,
      });
    }
  }

  const deduped: PennyCatalogDocument[] = [];
  const seen = new Set<string>();
  for (const doc of sortDocs(documents)) {
    const key = `${(doc.source || '').toLowerCase()}|${doc.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(doc);
  }

  const categories = buildCategories(deduped);
  return {
    documents: deduped.slice(0, safeLimit),
    categories,
    knowledge_docs: deduped.length,
    source: 'local-knowledge-catalog',
  };
}

function normalizeBackendDocument(input: unknown): PennyCatalogDocument | null {
  if (!input || typeof input !== 'object') return null;
  const doc = input as Record<string, unknown>;
  const title = typeof doc.title === 'string' ? doc.title.trim() : '';
  if (!title) return null;
  const source = typeof doc.source === 'string' ? doc.source.trim() : undefined;
  const category = typeof doc.category === 'string' ? doc.category.trim() : undefined;
  return {
    title,
    source,
    category: category || 'General',
  };
}

async function fetchBackendCatalog(
  pennyApiUrl: string,
  pennyApiKey: string,
  limit: number,
): Promise<PennyCatalogDocument[]> {
  const res = await fetch(`${pennyApiUrl}/catalog?limit=${limit}`, {
    headers: pennyApiKey ? { 'X-Penny-Api-Key': pennyApiKey } : {},
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Backend catalog fetch failed with status ${res.status}`);
  }
  const data = (await res.json()) as { documents?: unknown[] };
  const rawDocs = Array.isArray(data.documents) ? data.documents : [];
  return rawDocs
    .map((item) => normalizeBackendDocument(item))
    .filter((item): item is PennyCatalogDocument => Boolean(item));
}

export async function buildMergedPennyCatalog(options: CatalogOptions = {}): Promise<PennyCatalogResponse> {
  const safeLimit = sanitizeLimit(options.limit, 200);
  const pennyApiUrl = options.pennyApiUrl || process.env.PENNY_API_URL || 'http://localhost:8000';
  const pennyApiKey = options.pennyApiKey ?? process.env.PENNY_API_KEY ?? '';
  const localCatalog = buildLocalPennyCatalog(safeLimit);

  try {
    const backendDocs = await fetchBackendCatalog(pennyApiUrl, pennyApiKey, safeLimit);
    if (backendDocs.length === 0) {
      return localCatalog;
    }

    const mergedDocs: PennyCatalogDocument[] = [];
    const seen = new Set<string>();
    for (const doc of [...backendDocs, ...localCatalog.documents]) {
      const key = `${(doc.source || '').toLowerCase()}|${doc.title.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      mergedDocs.push(doc);
    }

    const sorted = sortDocs(mergedDocs);
    return {
      documents: sorted.slice(0, safeLimit),
      categories: buildCategories(sorted),
      knowledge_docs: sorted.length,
      source: 'merged-catalog',
    };
  } catch {
    return localCatalog;
  }
}
