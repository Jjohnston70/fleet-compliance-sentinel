import path from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isClerkEnabled } from '@/lib/clerk';
import { canAccessPenny, canBypassPennyRoleByEmail, resolvePennyRole } from '@/lib/penny-access';
import { getModuleCatalog, getOrgModules } from '@/lib/modules';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SkillPackClientFacingRow {
  skill?: unknown;
  gateway_module?: unknown;
  penny_enabled?: unknown;
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toTitleCase(input: string): string {
  return input
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

async function loadPennyEnabledGatewaySkills(): Promise<Map<string, Set<string>>> {
  const map = new Map<string, Set<string>>();
  const skillPacksDir = path.join(process.cwd(), '.claude', 'skill-packs');

  let entries: string[] = [];
  try {
    entries = await readdir(skillPacksDir);
  } catch {
    return map;
  }

  for (const entry of entries) {
    if (!entry.toLowerCase().endsWith('.json')) continue;

    let doc: Record<string, unknown> | null = null;
    try {
      const raw = await readFile(path.join(skillPacksDir, entry), 'utf8');
      doc = asObject(JSON.parse(raw));
    } catch {
      continue;
    }
    if (!doc) continue;

    const skills = asObject(doc.skills);
    const clientFacing = Array.isArray(skills?.client_facing)
      ? skills?.client_facing as unknown[]
      : [];

    for (const rowRaw of clientFacing) {
      const row = asObject(rowRaw) as SkillPackClientFacingRow | null;
      if (!row) continue;
      const skill = typeof row.skill === 'string' ? row.skill.trim() : '';
      const gatewayModule = typeof row.gateway_module === 'string' ? row.gateway_module.trim() : '';
      const pennyEnabled = row.penny_enabled === true;
      if (!skill || !gatewayModule || !pennyEnabled) continue;

      const existing = map.get(gatewayModule) || new Set<string>();
      existing.add(skill);
      map.set(gatewayModule, existing);
    }
  }

  return map;
}

export async function GET() {
  if (!isClerkEnabled()) {
    return NextResponse.json({ ok: false, error: 'Authentication is not configured' }, { status: 503 });
  }

  const { userId, orgId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  const role = resolvePennyRole(sessionClaims, user);
  const hasEmailBypass = canBypassPennyRoleByEmail(user);
  if (!canAccessPenny(role) && !hasEmailBypass) {
    return NextResponse.json({ ok: false, error: 'Insufficient permissions' }, { status: 403 });
  }

  if (!orgId) {
    return NextResponse.json({
      ok: true,
      modes: [
        { id: '', label: 'General Assistant', moduleId: null, moduleName: null },
      ],
    });
  }

  const [catalog, enabledModules, gatewaySkillMap] = await Promise.all([
    getModuleCatalog(),
    getOrgModules(orgId),
    loadPennyEnabledGatewaySkills(),
  ]);

  const enabledSet = new Set(enabledModules);
  const modeById = new Map<string, { id: string; label: string; moduleId: string; moduleName: string }>();
  for (const moduleItem of catalog) {
    if (moduleItem.category !== 'skills') continue;
    if (!enabledSet.has(moduleItem.id)) continue;

    const gatewayModule = typeof moduleItem.metadata?.gatewayModule === 'string'
      ? moduleItem.metadata.gatewayModule.trim()
      : '';
    const moduleSkills = Array.isArray(moduleItem.metadata?.skills)
      ? moduleItem.metadata.skills.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
      : [];

    const preferredSkills = gatewayModule && gatewaySkillMap.has(gatewayModule)
      ? Array.from(gatewaySkillMap.get(gatewayModule) || [])
      : moduleSkills;

    for (const skillId of preferredSkills) {
      if (!skillId || modeById.has(skillId)) continue;
      modeById.set(skillId, {
        id: skillId,
        label: toTitleCase(skillId),
        moduleId: moduleItem.id,
        moduleName: moduleItem.name,
      });
    }
  }

  const modes = [
    { id: '', label: 'General Assistant', moduleId: null, moduleName: null },
    ...Array.from(modeById.values()).sort((a, b) => a.label.localeCompare(b.label)),
  ];

  return NextResponse.json({ ok: true, modes });
}

