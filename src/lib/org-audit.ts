import { ensureOrgScopingTables, getSQL } from '@/lib/fleet-compliance-db';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

export type OrgAuditEventType =
  | 'org.provisioned'
  | 'org.onboarding.completed'
  | 'org.trial.active'
  | 'org.trial.expired'
  | 'org.subscription.checkout_started'
  | 'org.subscription.portal_session_created'
  | 'org.plan.changed'
  | 'org.subscription.status_changed'
  | 'org.subscription.created'
  | 'org.subscription.webhook_received'
  | 'org.offboarding.scheduled'
  | 'org.offboarding.soft_deleted'
  | 'org.offboarding.hard_deleted'
  | 'invoice.pdf_parsed';

export async function recordOrgAuditEvent(input: {
  orgId: string;
  eventType: OrgAuditEventType;
  actorUserId?: string | null;
  actorType?: 'user' | 'system' | 'stripe' | 'cron';
  metadata?: JsonObject;
}) {
  await ensureOrgScopingTables();
  const sql = getSQL();
  await sql`
    INSERT INTO org_audit_events (
      org_id,
      event_type,
      actor_user_id,
      actor_type,
      metadata
    ) VALUES (
      ${input.orgId},
      ${input.eventType},
      ${input.actorUserId ?? null},
      ${input.actorType ?? 'system'},
      ${JSON.stringify(input.metadata ?? {})}::jsonb
    )
  `;
}

export async function recordTrialStateIfChanged(input: {
  orgId: string;
  plan: string;
  isTrialActive: boolean;
  isActive: boolean;
  trialEndsAt: Date | null;
}) {
  await ensureOrgScopingTables();
  const sql = getSQL();

  const nextEvent: OrgAuditEventType =
    input.plan === 'trial' && !input.isActive
      ? 'org.trial.expired'
      : 'org.trial.active';

  const last = await sql`
    SELECT event_type
    FROM org_audit_events
    WHERE org_id = ${input.orgId}
      AND event_type IN ('org.trial.active', 'org.trial.expired')
    ORDER BY occurred_at DESC
    LIMIT 1
  `;

  const lastType = typeof last[0]?.event_type === 'string' ? last[0].event_type : null;
  if (lastType === nextEvent) {
    return;
  }

  await recordOrgAuditEvent({
    orgId: input.orgId,
    eventType: nextEvent,
    actorType: 'system',
    metadata: {
      plan: input.plan,
      isTrialActive: input.isTrialActive,
      isActive: input.isActive,
      trialEndsAt: input.trialEndsAt ? input.trialEndsAt.toISOString() : null,
    },
  });
}
