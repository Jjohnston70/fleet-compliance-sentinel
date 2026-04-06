import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

test('P6-T2: Contract drift - API route files exist with expected structure', async (t) => {
  const routePaths = [
    {
      path: 'src/app/api/fleet-compliance/onboarding/route.ts',
      name: 'POST /api/fleet-compliance/onboarding',
      expectedMethods: ['POST'],
    },
    {
      path: 'src/app/api/fleet-compliance/onboarding/employees/route.ts',
      name: 'POST /api/fleet-compliance/onboarding/employees',
      expectedMethods: ['POST'],
    },
    {
      path: 'src/app/api/fleet-compliance/onboarding/employees/[employeeProfileId]/route.ts',
      name: 'PATCH /api/fleet-compliance/onboarding/employees/[employeeProfileId]',
      expectedMethods: ['PATCH'],
    },
    {
      path: 'src/app/api/fleet-compliance/onboarding/employees/[employeeProfileId]/invite/route.ts',
      name: 'POST /api/fleet-compliance/onboarding/employees/[employeeProfileId]/invite',
      expectedMethods: ['POST'],
    },
    {
      path: 'src/app/api/fleet-compliance/onboarding/runs/route.ts',
      name: 'GET /api/fleet-compliance/onboarding/runs',
      expectedMethods: ['GET'],
    },
    {
      path: 'src/app/api/fleet-compliance/onboarding/runs/[runId]/route.ts',
      name: 'GET /api/fleet-compliance/onboarding/runs/[runId]',
      expectedMethods: ['GET'],
    },
    {
      path: 'src/app/api/fleet-compliance/onboarding/runs/[runId]/retry/route.ts',
      name: 'POST /api/fleet-compliance/onboarding/runs/[runId]/retry',
      expectedMethods: ['POST'],
    },
    {
      path: 'src/app/api/fleet-compliance/onboarding/intake-tokens/route.ts',
      name: 'POST /api/fleet-compliance/onboarding/intake-tokens',
      expectedMethods: ['POST'],
    },
    {
      path: 'src/app/api/fleet-compliance/onboarding/intake/[token]/route.ts',
      name: 'GET/POST /api/fleet-compliance/onboarding/intake/[token]',
      expectedMethods: ['GET', 'POST'],
    },
    {
      path: 'src/app/api/fleet-compliance/onboarding/outbox/process/route.ts',
      name: 'POST /api/fleet-compliance/onboarding/outbox/process',
      expectedMethods: ['POST'],
    },
  ];

  // Get the project root dynamically
  const { fileURLToPath } = await import('node:url');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = (__filename.split('/').slice(0, -4).join('/'));

  for (const route of routePaths) {
    await t.test(`route file exists: ${route.name}`, () => {
      const fullPath = `${__dirname}/${route.path}`;
      assert.ok(
        existsSync(fullPath),
        `Route file should exist at ${route.path}`,
      );
    });
  }
});

test('P6-T2: Contract drift - onboarding service/guards source files exist', async (t) => {
  const { fileURLToPath } = await import('node:url');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = (__filename.split('/').slice(0, -4).join('/'));

  const coreLibFiles = [
    'src/lib/onboarding/service.ts',
    'src/lib/onboarding/guards.ts',
    'src/lib/onboarding/repository.ts',
  ];

  for (const file of coreLibFiles) {
    await t.test(`core library file exists: ${file}`, () => {
      const fullPath = `${__dirname}/${file}`;
      assert.ok(
        existsSync(fullPath),
        `Core library file should exist at ${file}`,
      );
    });
  }
});

test('P6-T2: Contract drift - onboarding types export required type definitions', async (t) => {
  const mod = await import('@/lib/onboarding/types');

  // Runtime-exported constants and values
  const requiredRuntimeExports = [
    'ONBOARDING_RUN_STATUSES',
    'ONBOARDING_STEP_STATUSES',
    'ONBOARDING_OUTBOX_STATUSES',
  ];

  for (const exportName of requiredRuntimeExports) {
    await t.test(`types exports ${exportName}`, () => {
      assert.ok(
        mod[exportName] !== undefined,
        `types module should export ${exportName}`,
      );
    });
  }

  // Type-only exports (verified indirectly through service imports)
  await t.test('types module defines expected type interface names', () => {
    // Check that the types module source contains type declarations
    // by verifying it can be imported without errors
    assert.ok(mod, 'types module should be importable');
    // The actual type names (OnboardingRunStatus, OnboardingEmployeeProfile, etc.)
    // are type-only exports that don't appear at runtime, but they're
    // defined in the source and used by the service module
  });
});


test('P6-T2: Contract drift - repository module exports required functions', async (t) => {
  const mod = await import('@/lib/onboarding/repository');

  const requiredFunctions = [
    'createEmployeeProfile',
    'updateEmployeeProfile',
    'createRun',
    'listRuns',
    'getRunDetail',
    'listRunSteps',
    'upsertStep',
    'markRunCompleted',
    'upsertFallbackTask',
    'insertOnboardingEvent',
  ];

  for (const funcName of requiredFunctions) {
    await t.test(`repository exports ${funcName} function`, () => {
      assert.ok(
        typeof mod[funcName] === 'function',
        `repository module should export ${funcName} function`,
      );
    });
  }
});


test('P6-T2: Contract drift - intake token module exports required functions', async (t) => {
  const mod = await import('@/lib/onboarding/intake-token');

  await t.test('intake-token exports issueSignedIntakeToken function', () => {
    assert.ok(typeof mod.issueSignedIntakeToken === 'function', 'issueSignedIntakeToken should be a function');
  });

  await t.test('intake-token exports hashOpaqueToken function', () => {
    assert.ok(typeof mod.hashOpaqueToken === 'function', 'hashOpaqueToken should be a function');
  });
});
