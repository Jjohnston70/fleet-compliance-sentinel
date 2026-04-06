import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { getKnownGatewayModuleIds, getKnownModuleIds } from '@/lib/modules';

interface SkillPackClientFacingSkill {
  skill?: unknown;
  gateway_module?: unknown;
  penny_enabled?: unknown;
}

interface SkillPackDoc {
  name?: unknown;
  module_domain?: unknown;
  skills?: {
    client_facing?: SkillPackClientFacingSkill[];
  };
}

export interface SkillPackPreflightResult {
  ok: boolean;
  checkedFiles: string[];
  missingSkillDirectories: string[];
  unresolvedGatewayMappings: string[];
  unresolvedModuleDomains: string[];
}

function safeReadJson(filePath: string): SkillPackDoc | null {
  try {
    const raw = readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as SkillPackDoc;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function getSkillPackFiles(rootDir: string): string[] {
  const packsDir = path.join(rootDir, '.claude', 'skill-packs');
  if (!existsSync(packsDir)) return [];
  return readdirSync(packsDir)
    .filter((entry) => entry.toLowerCase().endsWith('.json'))
    .map((entry) => path.join(packsDir, entry))
    .sort((a, b) => a.localeCompare(b));
}

export function runSkillPackPreflight(rootDir = process.cwd()): SkillPackPreflightResult {
  const knownModuleIds = new Set(getKnownModuleIds());
  const knownGatewayModules = new Set(getKnownGatewayModuleIds());
  const skillRoot = path.join(rootDir, '.claude', 'skills');
  const skillPackFiles = getSkillPackFiles(rootDir);

  const missingSkillDirectories: string[] = [];
  const unresolvedGatewayMappings: string[] = [];
  const unresolvedModuleDomains: string[] = [];

  for (const filePath of skillPackFiles) {
    const doc = safeReadJson(filePath);
    const basename = path.basename(filePath);
    if (!doc) {
      missingSkillDirectories.push(`${basename}: invalid JSON`);
      continue;
    }

    const moduleDomain = typeof doc.module_domain === 'string' ? doc.module_domain.trim() : '';
    if (moduleDomain && !knownModuleIds.has(moduleDomain)) {
      unresolvedModuleDomains.push(`${basename}: module_domain='${moduleDomain}' is not a known module ID`);
    }

    const clientFacing = Array.isArray(doc.skills?.client_facing) ? doc.skills?.client_facing : [];
    for (const row of clientFacing) {
      const skillName = typeof row.skill === 'string' ? row.skill.trim() : '';
      const gatewayModule = typeof row.gateway_module === 'string' ? row.gateway_module.trim() : '';

      if (skillName) {
        const skillDir = path.join(skillRoot, skillName);
        if (!existsSync(skillDir)) {
          missingSkillDirectories.push(`${basename}: skill='${skillName}' is missing at .claude/skills/${skillName}`);
        }
      }

      if (gatewayModule) {
        const gatewayToolingDir = path.join(rootDir, 'tooling', gatewayModule);
        const resolves = knownGatewayModules.has(gatewayModule) || existsSync(gatewayToolingDir);
        if (!resolves) {
          unresolvedGatewayMappings.push(
            `${basename}: gateway_module='${gatewayModule}' is unresolved (not in module mapping and tooling/${gatewayModule} missing)`,
          );
        }
      }
    }
  }

  const ok = missingSkillDirectories.length === 0 && unresolvedGatewayMappings.length === 0;
  return {
    ok,
    checkedFiles: skillPackFiles.map((entry) => path.relative(rootDir, entry).replace(/\\/g, '/')),
    missingSkillDirectories,
    unresolvedGatewayMappings,
    unresolvedModuleDomains,
  };
}
