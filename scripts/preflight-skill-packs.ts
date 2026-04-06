import { runSkillPackPreflight } from '@/lib/onboarding/skill-pack-preflight';

function printLines(title: string, lines: string[]): void {
  if (lines.length === 0) return;
  console.error(`${title}:`);
  for (const line of lines) {
    console.error(`  - ${line}`);
  }
}

const result = runSkillPackPreflight(process.cwd());

console.log(
  JSON.stringify(
    {
      checkedFiles: result.checkedFiles,
      missingSkillDirectories: result.missingSkillDirectories.length,
      unresolvedGatewayMappings: result.unresolvedGatewayMappings.length,
      unresolvedModuleDomains: result.unresolvedModuleDomains.length,
    },
    null,
    2,
  ),
);

if (result.unresolvedModuleDomains.length > 0) {
  printLines('module_domain mapping warnings', result.unresolvedModuleDomains);
}

if (!result.ok) {
  printLines('missing skill directories', result.missingSkillDirectories);
  printLines('unresolved gateway mappings', result.unresolvedGatewayMappings);
  process.exitCode = 1;
} else {
  console.log('Skill-pack preflight: OK');
}
