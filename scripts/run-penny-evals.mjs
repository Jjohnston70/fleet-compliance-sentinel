#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

function normalize(text) {
  return String(text || '').toLowerCase();
}

function containsAll(haystack, needles = []) {
  const lower = normalize(haystack);
  return needles.every((needle) => lower.includes(normalize(needle)));
}

function containsAny(haystack, needles = []) {
  if (!needles.length) return true;
  const lower = normalize(haystack);
  return needles.some((needle) => lower.includes(normalize(needle)));
}

function containsNone(haystack, needles = []) {
  const lower = normalize(haystack);
  return needles.every((needle) => !lower.includes(normalize(needle)));
}

function sourceMatches(sources, expectedAny = []) {
  if (!expectedAny.length) return null;
  const lowerSources = sources.map((source) => normalize(source.title || source));
  return expectedAny.some((expected) => lowerSources.some((source) => source.includes(normalize(expected))));
}

async function postJson(url, body, apiKey) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-Penny-Api-Key': apiKey } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}) ${url}: ${text}`);
  }

  return response.json();
}

function buildMarkdownReport(result) {
  const lines = [
    '# Penny Eval Results',
    '',
    `Generated: \`${result.generatedAt}\``,
    `Target: \`${result.apiUrl}\``,
    '',
    '## Summary',
    '',
    `- Total cases: ${result.summary.total}`,
    `- Retrieval pass: ${result.summary.retrievalPassed}/${result.summary.retrievalChecked}`,
    `- Answer pass: ${result.summary.answerPassed}/${result.summary.total}`,
    `- Full pass: ${result.summary.fullPassed}/${result.summary.total}`,
    '',
    '## Cases',
    '',
  ];

  for (const test of result.tests) {
    lines.push(`### ${test.id}`);
    lines.push('');
    lines.push(`- Query: ${test.query}`);
    lines.push(`- Retrieval: ${test.retrievalStatus}`);
    lines.push(`- Answer: ${test.answerStatus}`);
    if (test.failedChecks.length) {
      lines.push(`- Failed checks: ${test.failedChecks.join(', ')}`);
    }
    if (test.topSources.length) {
      lines.push(`- Top sources: ${test.topSources.join(' | ')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  loadDotEnvIfPresent();

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(scriptDir, '..');
  const apiUrl = (process.env.PENNY_API_URL || 'https://pipeline-punks-v2-production.up.railway.app').replace(/\/$/, '');
  const apiKey = process.env.PENNY_API_KEY || '';
  const evalPath = path.resolve(repoRoot, 'evals', 'penny_eval_questions.json');
  const resultsDir = path.resolve(repoRoot, 'evals', 'results');

  if (!fs.existsSync(evalPath)) {
    throw new Error(`Eval file not found: ${evalPath}`);
  }

  const tests = JSON.parse(fs.readFileSync(evalPath, 'utf8'));
  const results = [];

  for (const test of tests) {
    const debug = await postJson(`${apiUrl}/debug/search`, { query: test.query, limit: 8 }, apiKey);
    const answer = await postJson(
      `${apiUrl}/query`,
      {
        query: test.query,
        allow_general_fallback: false,
      },
      apiKey
    );

    const topSources = Array.isArray(debug.hits) ? debug.hits.map((hit) => hit.title) : [];
    const retrievalPass = sourceMatches(debug.hits || [], test.expected_source_any || []);
    const answerText = answer.answer || '';
    const answerPass =
      containsAll(answerText, test.expected_answer_all || []) &&
      containsAny(answerText, test.expected_answer_any || []) &&
      containsNone(answerText, test.forbidden_answer_any || []);
    const failedChecks = [];

    if (retrievalPass === false) failedChecks.push('retrieval');
    if (!answerPass) failedChecks.push('answer');

    results.push({
      id: test.id,
      category: test.category,
      query: test.query,
      notes: test.notes || '',
      enrichedQuery: debug.enriched_query || test.query,
      topSources,
      answerPreview: String(answerText).slice(0, 500),
      retrievalStatus: retrievalPass === null ? 'skipped' : retrievalPass ? 'pass' : 'fail',
      answerStatus: answerPass ? 'pass' : 'fail',
      failedChecks,
    });
  }

  const retrievalChecked = results.filter((row) => row.retrievalStatus !== 'skipped').length;
  const retrievalPassed = results.filter((row) => row.retrievalStatus === 'pass').length;
  const answerPassed = results.filter((row) => row.answerStatus === 'pass').length;
  const fullPassed = results.filter(
    (row) => (row.retrievalStatus === 'pass' || row.retrievalStatus === 'skipped') && row.answerStatus === 'pass'
  ).length;

  const payload = {
    generatedAt: new Date().toISOString(),
    apiUrl,
    summary: {
      total: results.length,
      retrievalChecked,
      retrievalPassed,
      answerPassed,
      fullPassed,
    },
    tests: results,
  };

  fs.mkdirSync(resultsDir, { recursive: true });
  fs.writeFileSync(path.join(resultsDir, 'latest.json'), JSON.stringify(payload, null, 2));
  fs.writeFileSync(path.join(resultsDir, 'latest.md'), buildMarkdownReport(payload));

  console.log(`Penny evals complete.`);
  console.log(`Retrieval pass: ${retrievalPassed}/${retrievalChecked}`);
  console.log(`Answer pass: ${answerPassed}/${results.length}`);
  console.log(`Full pass: ${fullPassed}/${results.length}`);
  console.log(`Results: ${path.join(resultsDir, 'latest.json')}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
