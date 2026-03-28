#!/usr/bin/env node
/**
   * ops-check.mjs — Phase 8 SOC2 Operational Evidence Checker
   *
   * Usage:  node scripts/ops-check.mjs
   *         npm run compliance:ops-check
   *
   * Checks that all required Phase 8 evidence files exist and are non-empty.
   * Exits 0 on PASS, 1 on FAIL.
   */

import { existsSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const REQUIRED_EVIDENCE = [
    // Task 1 — Secret Rotation
  {
        path: 'soc2-evidence/access-control/SECURITY_ROTATION.md',
        label: 'Secret rotation registry (canonical)',
  },
  {
        path: 'soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md',
        label: 'Secret rotation execution log',
  },

    // Task 2 — Status Page
  {
        path: 'soc2-evidence/monitoring/UPTIMEROBOT_STATUS_PAGE.md',
        label: 'UptimeRobot status page evidence',
  },

    // Task 3 — Branch Protection
  {
        path: '.github/CODEOWNERS',
        label: 'CODEOWNERS file (canonical)',
  },
  {
        path: 'soc2-evidence/change-management/BRANCH_PROTECTION_AND_CODEOWNERS_VERIFICATION.md',
        label: 'Branch protection + CODEOWNERS verification doc',
  },

    // Task 4 — ZAP Scan
  {
        path: 'soc2-evidence/penetration-testing/ZAP_BASELINE_ATTEMPT_2026-03-25.md',
        label: 'OWASP ZAP baseline scan evidence',
  },

    // Task 5 — Clerk Cleanup
  {
        path: 'soc2-evidence/access-control/test-data-cleanup-2026-03-25.md',
        label: 'Clerk test org deletion record',
  },
  ];

let pass = true;
const results = [];

for (const { path: relPath, label } of REQUIRED_EVIDENCE) {
    const fullPath = resolve(ROOT, relPath);
    const exists = existsSync(fullPath);
    const nonEmpty = exists && statSync(fullPath).size > 0;

  if (!exists) {
        results.push({ status: 'FAIL', label, relPath, reason: 'FILE NOT FOUND' });
        pass = false;
  } else if (!nonEmpty) {
        results.push({ status: 'FAIL', label, relPath, reason: 'FILE IS EMPTY' });
        pass = false;
  } else {
        results.push({ status: 'PASS', label, relPath, reason: '' });
  }
}

// Print results
console.log('\n========================================');
console.log('  SOC2 Phase 8 Ops Evidence Check');
console.log('  Run: ' + new Date().toISOString());
console.log('========================================\n');

for (const r of results) {
    const icon = r.status === 'PASS' ? '[PASS]' : '[FAIL]';
    const line = r.reason ? `${icon} ${r.label}  — ${r.reason}  (${r.relPath})` : `${icon} ${r.label}`;
    console.log(line);
}

console.log('\n----------------------------------------');
const failCount = results.filter(r => r.status === 'FAIL').length;
const passCount = results.filter(r => r.status === 'PASS').length;
console.log(`  Result: ${passCount} passed, ${failCount} failed out of ${results.length} checks`);

if (pass) {
    console.log('  STATUS: ALL CHECKS PASSED');
    console.log('========================================\n');
    process.exit(0);
} else {
    console.log('  STATUS: CHECKS FAILED — fix gaps above and re-run');
    console.log('========================================\n');
    process.exit(1);
}
