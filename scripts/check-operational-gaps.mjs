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
  const schedule = readFileSync('soc2-evidence/access-control/SECURITY_ROTATION.md', 'utf8');
  const requiredRotated = [
    'CLERK_SECRET_KEY',
    'DATABASE_URL',
    'PENNY_API_KEY',
    'FLEET_COMPLIANCE_CRON_SECRET',
    'SENTRY_AUTH_TOKEN',
  ];

  for (const secret of requiredRotated) {
    const row = schedule
      .split('\n')
      .find((line) => line.includes(`\`${secret}\``));
    if (!row) {
      failures.push(`Security rotation schedule is missing required secret: ${secret}`);
      continue;
    }
    if (row.includes('Not recorded')) {
      failures.push(`Security rotation schedule shows no rotation date for required secret: ${secret}`);
    }
  }
}

function checkRotationExecutionLog() {
  const log = readFileSync('soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md', 'utf8');
  if (log.includes('Pending')) {
    failures.push('Secret rotation execution log contains pending entries.');
  }
  const requiredLogged = [
    'CLERK_SECRET_KEY',
    'DATABASE_URL',
    'PENNY_API_KEY',
    'FLEET_COMPLIANCE_CRON_SECRET',
    'SENTRY_AUTH_TOKEN',
    'REVEAL_USERNAME',
    'REVEAL_PASSWORD',
    'REVEAL_APP_ID',
    'TELEMATICS_CRON_SECRET',
  ];
  for (const secret of requiredLogged) {
    if (!log.includes(secret)) {
      failures.push(`Secret rotation execution log missing required rotation entry: ${secret}`);
    }
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
