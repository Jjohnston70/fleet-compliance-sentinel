import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('module gate audit covers onboarding UI, routes, APIs, and adapters', () => {
  const sidebar = readRepoFile('src/components/fleet-compliance/FleetComplianceSidebar.tsx');
  assert.match(sidebar, /getVisibleSections\(new Set\(enabledModules\), role, isPlatformAdmin\)/);

  const layout = readRepoFile('src/app/fleet-compliance/layout.tsx');
  assert.match(layout, /const enabledModules = await getOrgModules\(orgId\)/);
  assert.match(layout, /<FleetComplianceShell enabledModules=\{enabledModules\} role=\{role\} isPlatformAdmin=\{isPlatformAdmin\}>/);

  const employeeNewPage = readRepoFile('src/app/fleet-compliance/employees/new/page.tsx');
  assert.match(employeeNewPage, /enabledModules\.includes\('onboarding'\)/);
  assert.match(employeeNewPage, /if \(role !== 'admin'\)/);

  const outboxRoute = readRepoFile('src/app/api/fleet-compliance/onboarding/outbox/process/route.ts');
  assert.match(outboxRoute, /processOnboardingOutboxBatch\(\{\s*orgId: context\.orgId,/);

  const onboardingGuards = readRepoFile('src/lib/onboarding/guards.ts');
  assert.match(onboardingGuards, /requireModuleEnabled\(authContext\.orgId, 'onboarding'\)/);

  const trainingAdapter = readRepoFile('src/lib/onboarding/adapters/training-adapter.ts');
  assert.match(trainingAdapter, /!enabledModules\.includes\('training'\)/);

  const taskAdapter = readRepoFile('src/lib/onboarding/adapters/task-adapter.ts');
  assert.match(taskAdapter, /!modules\.includes\('tasks'\)/);

  const intakeService = readRepoFile('src/lib/onboarding/intake-service.ts');
  assert.match(intakeService, /!enabledModules\.includes\('onboarding'\)/);
});
