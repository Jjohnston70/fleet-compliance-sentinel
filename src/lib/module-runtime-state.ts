import { getSQL } from '@/lib/fleet-compliance-db';

type ModuleRuntimeId = 'dispatch-command' | 'govcon-compliance-command' | 'dq-files' | 'proposal-command';

let ensuredTable = false;
let warnedUnavailable = false;

async function ensureModuleRuntimeStateTable() {
  if (ensuredTable) return true;

  try {
    const sql = getSQL();
    await sql`
      CREATE TABLE IF NOT EXISTS fleet_module_runtime_state (
        org_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        state JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (org_id, module_id)
      )
    `;
    ensuredTable = true;
    return true;
  } catch (error) {
    if (!warnedUnavailable) {
      warnedUnavailable = true;
      console.warn('[module-runtime-state] persistence unavailable, falling back to in-memory runtime only:', error);
    }
    return false;
  }
}

export async function loadModuleRuntimeState(
  orgId: string,
  moduleId: ModuleRuntimeId,
): Promise<Record<string, unknown> | null> {
  const ready = await ensureModuleRuntimeStateTable();
  if (!ready) return null;

  try {
    const sql = getSQL();
    const rows = await sql`
      SELECT state
      FROM fleet_module_runtime_state
      WHERE org_id = ${orgId}
        AND module_id = ${moduleId}
      LIMIT 1
    `;
    const state = rows[0]?.state;
    if (!state || typeof state !== 'object') return null;
    return state as Record<string, unknown>;
  } catch (error) {
    console.error('[module-runtime-state] failed loading state', { orgId, moduleId, error });
    return null;
  }
}

export async function saveModuleRuntimeState(
  orgId: string,
  moduleId: ModuleRuntimeId,
  state: Record<string, unknown>,
): Promise<void> {
  const ready = await ensureModuleRuntimeStateTable();
  if (!ready) return;

  try {
    const sql = getSQL();
    await sql`
      INSERT INTO fleet_module_runtime_state (org_id, module_id, state, updated_at)
      VALUES (${orgId}, ${moduleId}, ${JSON.stringify(state)}::jsonb, NOW())
      ON CONFLICT (org_id, module_id)
      DO UPDATE SET
        state = EXCLUDED.state,
        updated_at = NOW()
    `;
  } catch (error) {
    console.error('[module-runtime-state] failed saving state', { orgId, moduleId, error });
  }
}
