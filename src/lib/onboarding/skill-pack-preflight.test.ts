import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { runSkillPackPreflight } from '@/lib/onboarding/skill-pack-preflight';

function writeJson(filePath: string, value: unknown): void {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

test('preflight fails for missing skill directories and unresolved gateway mappings', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'skill-pack-preflight-'));
  const skillPacksDir = path.join(root, '.claude', 'skill-packs');
  const skillsDir = path.join(root, '.claude', 'skills');
  const toolingDir = path.join(root, 'tooling');

  mkdirSync(skillPacksDir, { recursive: true });
  mkdirSync(skillsDir, { recursive: true });
  mkdirSync(toolingDir, { recursive: true });

  mkdirSync(path.join(skillsDir, 'existing-skill'), { recursive: true });
  mkdirSync(path.join(toolingDir, 'known-command'), { recursive: true });

  writeJson(path.join(skillPacksDir, 'broken.json'), {
    name: 'broken',
    module_domain: 'fleet-compliance',
    skills: {
      client_facing: [
        { skill: 'missing-skill', gateway_module: 'known-command', penny_enabled: true },
        { skill: 'existing-skill', gateway_module: 'missing-command', penny_enabled: false },
      ],
    },
  });

  const result = runSkillPackPreflight(root);
  assert.equal(result.ok, false);
  assert.equal(result.missingSkillDirectories.length, 1);
  assert.equal(result.unresolvedGatewayMappings.length, 1);
});
