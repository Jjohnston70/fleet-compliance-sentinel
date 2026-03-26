#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { load as loadHtml } from 'cheerio';

const OUTPUT_ROOT = path.resolve(process.cwd(), 'knowledge', '06_VendorDocs');
const RAW_ROOT = path.join(OUTPUT_ROOT, 'raw');
const MANIFEST_PATH = path.join(OUTPUT_ROOT, 'manifest.json');
const README_PATH = path.join(OUTPUT_ROOT, 'README.md');

const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.VENDOR_DOCS_TIMEOUT_MS || '30000', 10);
const MAX_PER_VENDOR = Number.parseInt(process.env.VENDOR_DOCS_MAX_PER_VENDOR || '200', 10);
const CONCURRENCY = Math.max(1, Number.parseInt(process.env.VENDOR_DOCS_CONCURRENCY || '6', 10));
const INCLUDE_VENDORS = (process.env.VENDOR_DOCS_INCLUDE || 'sentry,datadog,slack')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const VENDORS = {
  sentry: {
    key: 'sentry',
    displayName: 'Sentry',
    sourceType: 'sitemap',
    sitemapUrl: 'https://docs.sentry.io/sitemap.xml',
    host: 'docs.sentry.io',
  },
  datadog: {
    key: 'datadog',
    displayName: 'Datadog',
    sourceType: 'llms-links',
    llmsUrl: 'https://docs.datadoghq.com/llms.txt',
    host: 'docs.datadoghq.com',
  },
  slack: {
    key: 'slack',
    displayName: 'Slack',
    sourceType: 'markdown-index',
    markdownIndexUrl: 'https://docs.slack.dev/llms-sitemap.md',
    host: 'docs.slack.dev',
  },
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function asInt(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeWhitespace(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function decodeXmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function sanitizePathSegment(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'index';
}

function firstHeading(text) {
  const line = text.split('\n').find((row) => row.trim().startsWith('# '));
  if (!line) return null;
  return line.replace(/^#\s+/, '').trim();
}

function titleFromUrl(url) {
  const parsed = new URL(url);
  const parts = parsed.pathname.split('/').filter(Boolean);
  if (parts.length === 0) return parsed.host;
  const last = parts[parts.length - 1].replace(/\.md$/i, '');
  return last.replace(/[-_]+/g, ' ').trim() || parsed.host;
}

function outputPathForUrl(vendorKey, url) {
  const parsed = new URL(url);
  let pathname = parsed.pathname;
  if (!pathname || pathname === '/') pathname = '/index';
  if (pathname.endsWith('/')) pathname = `${pathname}index`;
  pathname = pathname.replace(/\.md$/i, '');

  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => sanitizePathSegment(segment));

  const outDir = path.join(RAW_ROOT, vendorKey, ...segments.slice(0, -1));
  const outName = `${segments[segments.length - 1] || 'index'}.md`;
  return path.join(outDir, outName);
}

function shouldKeepUrl(rawUrl, vendor) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.host !== vendor.host) return false;
  if (!['http:', 'https:'].includes(parsed.protocol)) return false;

  const pathname = parsed.pathname.toLowerCase();
  if (pathname.startsWith('/_next/')) return false;
  if (pathname.endsWith('.xml')) return false;
  if (pathname.endsWith('.json')) return false;
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg') || pathname.endsWith('.png') || pathname.endsWith('.gif')) return false;
  if (pathname.endsWith('.svg') || pathname.endsWith('.ico') || pathname.endsWith('.woff') || pathname.endsWith('.woff2')) return false;
  if (pathname.endsWith('.pdf') || pathname.endsWith('.zip') || pathname.endsWith('.tar.gz')) return false;

  return true;
}

async function fetchText(url, options = {}) {
  const retries = asInt(options.retries ?? 2, 2);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'user-agent': 'PipelinePennyDocsDownloader/1.0 (+https://www.pipelinepunks.com)',
          accept: 'text/html,application/xml,text/xml,text/plain,text/markdown,*/*',
        },
      });
      clearTimeout(timeout);
      const text = await response.text();
      return {
        ok: response.ok,
        status: response.status,
        contentType: response.headers.get('content-type') || '',
        text,
      };
    } catch (error) {
      clearTimeout(timeout);
      if (attempt >= retries) {
        return {
          ok: false,
          status: 0,
          contentType: '',
          text: '',
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }

  return { ok: false, status: 0, contentType: '', text: '' };
}

function extractLocTags(xmlText) {
  const matches = [...xmlText.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)];
  return matches
    .map((match) => decodeXmlEntities(match[1].trim()))
    .filter(Boolean);
}

async function collectSitemapUrls(startUrl, visited = new Set(), depth = 0) {
  if (visited.has(startUrl) || depth > 6) return [];
  visited.add(startUrl);

  const response = await fetchText(startUrl);
  if (!response.ok) return [];

  const body = response.text;
  const locs = extractLocTags(body);
  if (locs.length === 0) return [];

  const isIndex = /<sitemapindex[\s>]/i.test(body);
  if (!isIndex) {
    return locs;
  }

  const nested = await Promise.all(locs.map((url) => collectSitemapUrls(url, visited, depth + 1)));
  return nested.flat();
}

function extractMarkdownLinks(markdown, host) {
  const out = new Set();
  const linkPattern = /\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/g;
  for (const match of markdown.matchAll(linkPattern)) {
    const url = match[1];
    try {
      const parsed = new URL(url);
      if (parsed.host !== host) continue;
      out.add(`${parsed.origin}${parsed.pathname}`);
    } catch {
      // ignore malformed links
    }
  }
  return [...out];
}

function extractUrlsFromPlainMarkdown(markdown, host) {
  const out = new Set();
  const pattern = /(https?:\/\/[^\s)]+)/g;
  for (const match of markdown.matchAll(pattern)) {
    const url = match[1].replace(/[),.;]+$/, '');
    try {
      const parsed = new URL(url);
      if (parsed.host !== host) continue;
      out.add(`${parsed.origin}${parsed.pathname}`);
    } catch {
      // ignore malformed urls
    }
  }
  return [...out];
}

function parseSentryHtmlToText(html) {
  const $ = loadHtml(html);
  $('script, style, noscript, svg, header, footer, nav').remove();

  const root = $('main').first().length
    ? $('main').first()
    : $('article').first().length
      ? $('article').first()
      : $('body').first();

  const title = root.find('h1').first().text().trim() || $('title').text().trim();
  const text = normalizeWhitespace(root.text() || '');
  return { title: title || null, content: text };
}

function parseDocument(vendor, url, fetched) {
  const lowerUrl = url.toLowerCase();
  const contentType = (fetched.contentType || '').toLowerCase();
  const markdownLike = lowerUrl.endsWith('.md') || contentType.includes('text/markdown') || contentType.includes('text/plain');

  if (markdownLike) {
    const content = normalizeWhitespace(fetched.text);
    const title = firstHeading(content) || titleFromUrl(url);
    return { title, content };
  }

  if (vendor.key === 'sentry') {
    const parsed = parseSentryHtmlToText(fetched.text);
    return {
      title: parsed.title || titleFromUrl(url),
      content: parsed.content,
    };
  }

  const textOnly = normalizeWhitespace(loadHtml(fetched.text).text());
  return {
    title: titleFromUrl(url),
    content: textOnly,
  };
}

function withFrontmatter({ title, vendor, source, fetchedAt, content }) {
  return [
    '---',
    `title: "${String(title).replace(/"/g, '\\"')}"`,
    `vendor: "${vendor}"`,
    `source: "${source}"`,
    `fetched_at: "${fetchedAt}"`,
    '---',
    '',
    content,
    '',
  ].join('\n');
}

async function collectVendorUrls(vendor) {
  if (vendor.sourceType === 'sitemap') {
    return collectSitemapUrls(vendor.sitemapUrl);
  }

  if (vendor.sourceType === 'llms-links') {
    const response = await fetchText(vendor.llmsUrl);
    if (!response.ok) return [];
    return extractMarkdownLinks(response.text, vendor.host);
  }

  if (vendor.sourceType === 'markdown-index') {
    const response = await fetchText(vendor.markdownIndexUrl);
    if (!response.ok) return [];
    return extractUrlsFromPlainMarkdown(response.text, vendor.host);
  }

  return [];
}

async function downloadVendorDocs(vendor) {
  console.log(`\n[vendor-docs] Collecting URLs for ${vendor.displayName}...`);
  const collected = await collectVendorUrls(vendor);

  const deduped = [...new Set(collected)]
    .map((url) => {
      try {
        const parsed = new URL(url);
        return `${parsed.origin}${parsed.pathname}`;
      } catch {
        return null;
      }
    })
    .filter((url) => Boolean(url) && shouldKeepUrl(url, vendor));

  const limited = MAX_PER_VENDOR > 0 ? deduped.slice(0, MAX_PER_VENDOR) : deduped;
  console.log(
    `[vendor-docs] ${vendor.displayName}: urls_collected=${collected.length}, urls_kept=${limited.length}` +
    `${MAX_PER_VENDOR > 0 ? ` (limit=${MAX_PER_VENDOR})` : ''}`
  );

  const stats = {
    vendor: vendor.key,
    displayName: vendor.displayName,
    sourceType: vendor.sourceType,
    urlsCollected: collected.length,
    urlsKept: limited.length,
    downloaded: 0,
    failed: 0,
    files: [],
    failures: [],
  };

  let index = 0;
  async function worker() {
    while (index < limited.length) {
      const current = index;
      index += 1;
      const url = limited[current];

      let resolvedUrl = url;
      let fetched = await fetchText(url);
      if (!fetched.ok && url.toLowerCase().endsWith('.md')) {
        const fallbackUrls = [
          url.replace(/\.md$/i, '/'),
          url.replace(/\.md$/i, ''),
        ];
        for (const fallbackUrl of fallbackUrls) {
          const fallbackFetch = await fetchText(fallbackUrl);
          if (fallbackFetch.ok) {
            resolvedUrl = fallbackUrl;
            fetched = fallbackFetch;
            break;
          }
        }
      }

      if (!fetched.ok) {
        stats.failed += 1;
        stats.failures.push({ url, status: fetched.status || 0, error: fetched.error || 'request failed' });
        continue;
      }

      const parsedDoc = parseDocument(vendor, resolvedUrl, fetched);
      if (!parsedDoc.content || parsedDoc.content.length < 80) {
        stats.failed += 1;
        stats.failures.push({ url, status: fetched.status || 0, error: 'content too short' });
        continue;
      }

      const outPath = outputPathForUrl(vendor.key, url);
      ensureDir(path.dirname(outPath));
      const rendered = withFrontmatter({
        title: parsedDoc.title || titleFromUrl(url),
        vendor: vendor.key,
        source: resolvedUrl,
        fetchedAt: new Date().toISOString(),
        content: parsedDoc.content,
      });
      fs.writeFileSync(outPath, rendered, 'utf8');

      stats.downloaded += 1;
      stats.files.push(path.relative(process.cwd(), outPath).replace(/\\/g, '/'));
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  console.log(`[vendor-docs] ${vendor.displayName}: downloaded=${stats.downloaded}, failed=${stats.failed}`);
  return stats;
}

function writeReadme(summary) {
  const lines = [
    '# Vendor Docs Knowledge Pack',
    '',
    'Downloaded documentation for Sentry, Datadog, and Slack to support Pipeline Penny ingestion.',
    '',
    `Generated at: ${summary.generated_at}`,
    `Output root: ${summary.output_root}`,
    `Request timeout (ms): ${summary.request_timeout_ms}`,
    `Concurrency: ${summary.concurrency}`,
    `Max pages per vendor: ${summary.max_pages_per_vendor <= 0 ? 'unlimited' : summary.max_pages_per_vendor}`,
    '',
    '## Vendor Totals',
    '',
  ];

  for (const vendor of summary.vendors) {
    lines.push(`- ${vendor.displayName}: downloaded=${vendor.downloaded}, failed=${vendor.failed}, urls_kept=${vendor.urlsKept}`);
  }

  lines.push('');
  lines.push('## Usage');
  lines.push('');
  lines.push('1. Run `npm run docs:vendors` to refresh downloaded docs.');
  lines.push('2. Ingest `knowledge/06_VendorDocs/raw` with your Penny sync flow (categories: `sentry,datadog,slack`).');
  lines.push('');

  fs.writeFileSync(README_PATH, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  ensureDir(RAW_ROOT);

  const selected = INCLUDE_VENDORS
    .map((key) => VENDORS[key])
    .filter(Boolean);

  if (selected.length === 0) {
    throw new Error(`No valid vendors selected. Supported values: ${Object.keys(VENDORS).join(', ')}`);
  }

  const results = [];
  for (const vendor of selected) {
    const vendorResult = await downloadVendorDocs(vendor);
    results.push(vendorResult);
  }

  const summary = {
    generated_at: new Date().toISOString(),
    output_root: path.relative(process.cwd(), OUTPUT_ROOT).replace(/\\/g, '/'),
    request_timeout_ms: REQUEST_TIMEOUT_MS,
    concurrency: CONCURRENCY,
    max_pages_per_vendor: MAX_PER_VENDOR,
    vendors: results,
  };

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  writeReadme(summary);

  console.log('\n[vendor-docs] Complete.');
  for (const vendor of results) {
    console.log(
      `[vendor-docs] ${vendor.displayName}: downloaded=${vendor.downloaded}, failed=${vendor.failed}, urls_kept=${vendor.urlsKept}`
    );
  }
  console.log(`[vendor-docs] Manifest: ${path.relative(process.cwd(), MANIFEST_PATH).replace(/\\/g, '/')}`);
}

main().catch((error) => {
  console.error(`[vendor-docs] Failed: ${error.message || error}`);
  process.exit(1);
});
