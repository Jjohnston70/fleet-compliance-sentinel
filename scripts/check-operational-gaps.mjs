import { readFileSync } from 'node:fs';

const failures = [];

async function checkStatusPage() {
  const url = 'https://status.pipelinepunks.com';
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    if (!response.ok) {
      failures.push(`Status page check failed: ${url} returned HTTP ${response.status}`);
    }
  } catch (error) {
    failures.push(`Status page check failed: ${url} is not reachable (${String(error)})`);
  }
}

function checkRotationSchedule() {
  const schedule = readFileSync('SECURITY_ROTATION.md', 'utf8');
  if (schedule.includes('Not recorded')) {
    failures.push('Security rotation schedule still contains "Not recorded" entries.');
  }
}

function checkRotationExecutionLog() {
  const log = readFileSync('soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md', 'utf8');
  if (log.includes('Pending')) {
    failures.push('Secret rotation execution log contains pending entries.');
  }
}

await checkStatusPage();
checkRotationSchedule();
checkRotationExecutionLog();

if (failures.length > 0) {
  console.error('Operational compliance checks failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Operational compliance checks passed.');
