#!/usr/bin/env node
/**
 * Penny Autoresearch Loop
 * Adapts Karpathy's autoresearch pattern for Pipeline Penny's retrieval tuning.
 *
 * The loop:
 *   1. Reads penny-program.md for agent instructions
 *   2. Reads current railway-backend/app/main.py
 *   3. Reads latest eval results from evals/results/latest.json
 *   4. Calls Claude to propose one targeted change to retrieval logic
 *   5. Applies the change to main.py
 *   6. Runs npm run eval:penny
 *   7. Compares score to previous score
 *   8. Commits if improved, reverts if not
 *   9. Logs every iteration to evals/results/autoresearch-log.jsonl
 *   10. Repeats
 *
 * Usage:
 *   node scripts/penny-autoresearch.mjs
 *   node scripts/penny-autoresearch.mjs --max 10
 *
 * Environment:
 *   ANTHROPIC_API_KEY  - Required. Claude API key.
 *   PENNY_API_URL      - Railway backend URL (default: from .env)
 *   PENNY_API_KEY      - API key for Penny backend (default: from .env)
 *
 * True North Data Strategies -- Pipeline Punks / Chief Sentinel
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const MAIN_PY_PATH = path.resolve(REPO_ROOT, 'railway-backend', 'app', 'main.py');
const PROGRAM_MD_PATH = path.resolve(REPO_ROOT, 'evals', 'penny-program.md');
const LATEST_JSON_PATH = path.resolve(REPO_ROOT, 'evals', 'results', 'latest.json');
const LOG_PATH = path.resolve(REPO_ROOT, 'evals', 'results', 'autoresearch-log.jsonl');

// ---------------------------------------------------------------------------
// .env loader (minimal, same pattern as run-penny-evals.mjs)
// ---------------------------------------------------------------------------

function loadDotEnv() {
  const envPath = path.resolve(REPO_ROOT, '.env');
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

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let maxIterations = 20;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--max' && args[i + 1]) {
      maxIterations = parseInt(args[i + 1], 10);
      if (isNaN(maxIterations) || maxIterations < 1) maxIterations = 20;
    }
  }
  return { maxIterations };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function timestamp() {
  return new Date().toISOString();
}

function readFileOrNull(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function readLatestScore() {
  const raw = readFileOrNull(LATEST_JSON_PATH);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    return data.summary || null;
  } catch {
    return null;
  }
}

function scoreString(summary) {
  if (!summary) return '?/?';
  return `${summary.fullPassed}/${summary.total}`;
}

function scoreNumber(summary) {
  if (!summary || !summary.total) return 0;
  return summary.fullPassed;
}

function appendLog(entry) {
  fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n', 'utf8');
}

// ---------------------------------------------------------------------------
// Git helpers -- ONLY operate on railway-backend/
// ---------------------------------------------------------------------------

function gitExec(cmd) {
  return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

function getShortHash() {
  try {
    return gitExec('git rev-parse --short HEAD');
  } catch {
    return 'unknown';
  }
}

function gitCommit(message) {
  try {
    gitExec('git add railway-backend/app/main.py');
    gitExec(`git commit -m "${message.replace(/"/g, '\\"')}"`);
    return getShortHash();
  } catch (err) {
    console.error(`[autoresearch] git commit failed: ${err.message}`);
    return null;
  }
}

function gitRevertLastCommit() {
  try {
    gitExec('git reset --hard HEAD~1');
    return true;
  } catch (err) {
    console.error(`[autoresearch] git revert failed: ${err.message}`);
    return false;
  }
}

function gitHasMainPyChanges() {
  try {
    const diff = gitExec('git diff --name-only railway-backend/app/main.py');
    return diff.length > 0;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Verify the change only touches railway-backend/
// ---------------------------------------------------------------------------

function verifyBoundary(originalMainPy, newMainPy) {
  // The proposed change must only differ in main.py content
  if (originalMainPy === newMainPy) {
    return { ok: false, reason: 'No change was made to main.py' };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Claude API call
// ---------------------------------------------------------------------------

async function callClaude(systemPrompt, userPrompt, retries = 3) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set in environment or .env');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8192,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Claude API ${response.status}: ${text}`);
      }

      const data = await response.json();
      const parts = data.content || [];
      const text = parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text)
        .join('\n');
      return text;
    } catch (err) {
      console.error(`[autoresearch] Claude API attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await sleep(3000 * attempt);
    }
  }
}

// ---------------------------------------------------------------------------
// Run eval
// ---------------------------------------------------------------------------

async function runEval(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[autoresearch] Running eval (attempt ${attempt})...`);
      execSync('npm run eval:penny', {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 120_000, // 2 minute timeout
      });
      return true;
    } catch (err) {
      console.error(`[autoresearch] Eval run attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) return false;
      await sleep(5000);
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Extract new main.py from Claude response
// ---------------------------------------------------------------------------

function extractMainPy(response) {
  // Look for a fenced code block tagged python or main.py
  const patterns = [
    /```(?:python|main\.py)\s*\n([\s\S]*?)```/,
    /```\s*\n([\s\S]*?)```/,
  ];

  for (const pattern of patterns) {
    const match = response.match(pattern);
    if (match && match[1].trim().length > 200) {
      return match[1];
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Extract hypothesis from Claude response
// ---------------------------------------------------------------------------

function extractHypothesis(response) {
  // Look for HYPOTHESIS: line
  const match = response.match(/HYPOTHESIS:\s*(.+)/i);
  if (match) return match[1].trim();

  // Look for CHANGE: line
  const changeMatch = response.match(/CHANGE:\s*(.+)/i);
  if (changeMatch) return changeMatch[1].trim();

  // First non-empty line as fallback
  const lines = response.split('\n').filter((l) => l.trim());
  return lines[0]?.trim().slice(0, 200) || 'unknown change';
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

async function main() {
  loadDotEnv();
  const { maxIterations } = parseArgs();

  console.log('[autoresearch] Penny Autoresearch Loop');
  console.log(`[autoresearch] Max iterations: ${maxIterations}`);
  console.log(`[autoresearch] Repo root: ${REPO_ROOT}`);
  console.log(`[autoresearch] main.py: ${MAIN_PY_PATH}`);
  console.log(`[autoresearch] Log: ${LOG_PATH}`);

  // Verify required files exist
  if (!fs.existsSync(MAIN_PY_PATH)) {
    throw new Error(`main.py not found at ${MAIN_PY_PATH}`);
  }
  if (!fs.existsSync(PROGRAM_MD_PATH)) {
    throw new Error(`penny-program.md not found at ${PROGRAM_MD_PATH}`);
  }

  // Verify API key
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set. Add it to .env or set in environment.');
  }

  // Ensure log file exists
  if (!fs.existsSync(LOG_PATH)) {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.writeFileSync(LOG_PATH, '', 'utf8');
  }

  // Railway warmup -- give the backend time to come alive
  console.log('[autoresearch] Warming up Railway backend (10s)...');
  await sleep(10_000);

  // Run baseline eval
  console.log('[autoresearch] Running baseline eval...');
  const baselineOk = await runEval();
  if (!baselineOk) {
    throw new Error('Baseline eval failed. Fix the eval infrastructure before running autoresearch.');
  }

  const baselineScore = readLatestScore();
  console.log(`[autoresearch] Baseline score: ${scoreString(baselineScore)}`);

  // Read the program instructions
  const programMd = fs.readFileSync(PROGRAM_MD_PATH, 'utf8');

  // Track consecutive failures for stall detection
  let consecutiveFailures = 0;

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[autoresearch] Iteration ${iteration}/${maxIterations}`);
    console.log(`${'='.repeat(60)}`);

    const iterationStart = timestamp();

    // Read current state
    const currentMainPy = fs.readFileSync(MAIN_PY_PATH, 'utf8');
    const currentScore = readLatestScore();

    // Read the autoresearch log for context on what has been tried
    const logContent = readFileOrNull(LOG_PATH) || '';
    const recentLog = logContent.split('\n').filter(Boolean).slice(-10).join('\n');

    // Build the prompt for Claude
    const systemPrompt = `You are an autonomous research agent optimizing Pipeline Penny's retrieval system.
Your ONLY job is to propose ONE targeted change to the Python retrieval code in main.py.

RULES:
- You must output the COMPLETE modified main.py file inside a \`\`\`python code fence.
- Before the code fence, write a line starting with HYPOTHESIS: explaining what you are changing and why.
- Make EXACTLY ONE change per iteration. Do not combine multiple changes.
- Do not modify anything outside of main.py -- no imports of new packages, no file system operations.
- Focus on retrieval scoring parameters, query enrichment, and keyword mappings.
- The eval tests are fixed. You cannot change what passes or fails -- only how well retrieval works.
- If the log shows a change was already tried and failed, do not try the same thing again.`;

    const userPrompt = `# Agent Instructions
${programMd}

# Current main.py
\`\`\`python
${currentMainPy}
\`\`\`

# Current Eval Score
${JSON.stringify(currentScore, null, 2)}

# Recent Experiment Log (last 10 iterations)
${recentLog || '(no previous iterations)'}

# Task
Analyze the current retrieval logic and eval results. Propose ONE targeted change to improve the fullPassed score.
Output HYPOTHESIS: <your hypothesis> on its own line, then the complete modified main.py in a python code fence.`;

    let hypothesis = 'unknown';
    let changeSummary = 'unknown';
    let result = 'error';
    let commitHash = '';
    let scoreAfter = currentScore;

    try {
      // Call Claude for a proposed change
      console.log('[autoresearch] Asking Claude for a change proposal...');
      const response = await callClaude(systemPrompt, userPrompt);

      hypothesis = extractHypothesis(response);
      console.log(`[autoresearch] Hypothesis: ${hypothesis}`);

      // Extract the new main.py
      const newMainPy = extractMainPy(response);
      if (!newMainPy) {
        throw new Error('Claude response did not contain a valid python code block with main.py');
      }

      // Verify boundary -- only main.py changes allowed
      const boundary = verifyBoundary(currentMainPy, newMainPy);
      if (!boundary.ok) {
        throw new Error(`Boundary violation: ${boundary.reason}`);
      }

      // Apply the change
      console.log('[autoresearch] Applying proposed change to main.py...');
      fs.writeFileSync(MAIN_PY_PATH, newMainPy, 'utf8');

      // Delay between eval runs (rate limit respect)
      console.log('[autoresearch] Waiting 5s before eval run...');
      await sleep(5000);

      // Run the eval
      const evalOk = await runEval();
      if (!evalOk) {
        // Eval failed -- revert
        console.log('[autoresearch] Eval run failed. Reverting main.py...');
        fs.writeFileSync(MAIN_PY_PATH, currentMainPy, 'utf8');
        result = 'error';
        changeSummary = `eval runner failed: ${hypothesis}`;
        consecutiveFailures++;
      } else {
        // Read new score
        scoreAfter = readLatestScore();
        const scoreBefore = scoreNumber(currentScore);
        const scoreAfterNum = scoreNumber(scoreAfter);

        console.log(`[autoresearch] Score: ${scoreString(currentScore)} -> ${scoreString(scoreAfter)}`);

        if (scoreAfterNum > scoreBefore) {
          // Improved -- commit
          console.log('[autoresearch] IMPROVED. Committing change.');
          const msg = `eval-loop: ${hypothesis}, score ${scoreString(currentScore)}->${scoreString(scoreAfter)}`;
          commitHash = gitCommit(msg) || '';
          result = 'kept';
          changeSummary = hypothesis;
          consecutiveFailures = 0;
        } else if (scoreAfterNum === scoreBefore) {
          // Same -- revert
          console.log('[autoresearch] No improvement (same score). Reverting.');
          fs.writeFileSync(MAIN_PY_PATH, currentMainPy, 'utf8');
          result = 'reverted';
          changeSummary = `no improvement (same): ${hypothesis}`;
          consecutiveFailures++;
        } else {
          // Worse -- revert
          console.log('[autoresearch] WORSE. Reverting.');
          fs.writeFileSync(MAIN_PY_PATH, currentMainPy, 'utf8');
          result = 'reverted';
          changeSummary = `regression: ${hypothesis}`;
          consecutiveFailures++;
        }
      }
    } catch (err) {
      console.error(`[autoresearch] Iteration ${iteration} error: ${err.message}`);
      // Restore main.py to known good state
      const safeMainPy = readFileOrNull(MAIN_PY_PATH);
      if (!safeMainPy || safeMainPy.length < 100) {
        // main.py is corrupted, try to restore from git
        try {
          gitExec('git checkout HEAD -- railway-backend/app/main.py');
        } catch {
          console.error('[autoresearch] CRITICAL: Could not restore main.py from git');
        }
      }
      result = 'error';
      changeSummary = `error: ${err.message.slice(0, 200)}`;
      consecutiveFailures++;
    }

    // Log the iteration
    const logEntry = {
      timestamp: iterationStart,
      iteration,
      hypothesis,
      change_summary: changeSummary,
      score_before: scoreNumber(currentScore),
      score_after: scoreNumber(scoreAfter),
      score_before_str: scoreString(currentScore),
      score_after_str: scoreString(scoreAfter),
      result,
      commit_hash: commitHash,
    };
    appendLog(logEntry);

    console.log(`[autoresearch] Iteration ${iteration} result: ${result}`);
    console.log(`[autoresearch] Consecutive non-improvements: ${consecutiveFailures}`);

    // Stall warning
    if (consecutiveFailures >= 5) {
      console.log('[autoresearch] WARNING: 5 consecutive failures. Consider stopping and reviewing the log.');
      console.log('[autoresearch] The loop will continue, but results may be diminishing.');
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('[autoresearch] Loop complete.');
  console.log(`[autoresearch] Final score: ${scoreString(readLatestScore())}`);
  console.log(`[autoresearch] Log: ${LOG_PATH}`);
}

main().catch((err) => {
  console.error(`[autoresearch] Fatal: ${err.message}`);
  process.exit(1);
});
