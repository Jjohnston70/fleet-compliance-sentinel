import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getOrgModules } from '@/lib/modules';
import { enqueueOutboxEvent } from '@/lib/onboarding/repository';
import type { OnboardingEmployeeProfile } from '@/lib/onboarding/types';

interface NotificationTemplate {
  templateKey: string;
  subject: string;
  html: string;
}

export interface NotificationQueueResult {
  status: 'completed' | 'skipped' | 'failed';
  reason: 'queued' | 'no_recipient' | 'error';
  queuedCount?: number;
  message?: string;
}

export interface NotificationSendResult {
  status: 'completed' | 'failed';
  reason: 'sent' | 'provider_error' | 'invalid_payload' | 'missing_config';
  retryable: boolean;
  message?: string;
}

export interface NotificationAdapterDependencies {
  getModules(orgId: string): Promise<string[]>;
  enqueue(input: {
    orgId: string;
    runId: string;
    dedupeKey: string;
    payload: Record<string, unknown>;
  }): Promise<void>;
  sendEmail(input: {
    to: string;
    cc?: string[];
    subject: string;
    html: string;
  }): Promise<void>;
}

const TEMPLATE_DIR = path.join(
  process.cwd(),
  'tooling',
  'onboarding',
  'notification-templates',
);

const DEFAULT_TEMPLATES: Record<string, NotificationTemplate> = {
  'employee-onboarding-completed': {
    templateKey: 'employee-onboarding-completed',
    subject: 'Onboarding completed for {{employeeFullName}}',
    html: '<p>Hello {{recipientName}},</p><p>Onboarding is complete for <strong>{{employeeFullName}}</strong>.</p><p>Run ID: {{runId}}</p><p>Regards,<br/>Fleet Compliance Sentinel</p>',
  },
  'employee-onboarding-started': {
    templateKey: 'employee-onboarding-started',
    subject: 'Onboarding started for {{employeeFullName}}',
    html: '<p>Hello {{recipientName}},</p><p>Onboarding has started for <strong>{{employeeFullName}}</strong>.</p><p>Run ID: {{runId}}</p><p>Regards,<br/>Fleet Compliance Sentinel</p>',
  },
};

function renderTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_match, key: string) => values[key] ?? '');
}

function loadTemplate(templateKey: string): NotificationTemplate {
  const filePath = path.join(TEMPLATE_DIR, `${templateKey}.json`);
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as NotificationTemplate;
    if (parsed && parsed.subject && parsed.html) return parsed;
  } catch {
    // Fall back to in-code defaults when files are unavailable.
  }
  return DEFAULT_TEMPLATES[templateKey] ?? DEFAULT_TEMPLATES['employee-onboarding-completed'];
}

function parseCc(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean);
}

async function sendEmail(input: {
  to: string;
  cc?: string[];
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('MISSING_CONFIG: RESEND_API_KEY is not configured');
  }

  const from = process.env.ONBOARDING_NOTIFICATIONS_FROM?.trim() || 'Fleet Compliance <onboarding@updates.fleet-compliance.local>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      cc: input.cc && input.cc.length > 0 ? input.cc : undefined,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`PROVIDER_ERROR: resend ${response.status}: ${body.slice(0, 240)}`);
  }
}

const DEFAULT_DEPS: NotificationAdapterDependencies = {
  getModules: getOrgModules,
  async enqueue(input) {
    await enqueueOutboxEvent({
      orgId: input.orgId,
      runId: input.runId,
      eventType: 'onboarding.notification.send',
      dedupeKey: input.dedupeKey,
      payload: input.payload,
    });
  },
  sendEmail,
};

export async function queueOnboardingNotification(input: {
  orgId: string;
  runId: string;
  employee: OnboardingEmployeeProfile;
  templateKey: 'employee-onboarding-completed' | 'employee-onboarding-started';
}, deps: NotificationAdapterDependencies = DEFAULT_DEPS): Promise<NotificationQueueResult> {
  const recipient = input.employee.workEmail?.trim() || '';
  if (!recipient) {
    return {
      status: 'skipped',
      reason: 'no_recipient',
      message: 'Employee profile has no work email for notification delivery',
    };
  }

  const enabledModules = await deps.getModules(input.orgId);
  const analyticsCopy = process.env.ONBOARDING_ANALYTICS_COPY_EMAIL?.trim() || '';
  const cc = enabledModules.includes('email-analytics') && analyticsCopy ? [analyticsCopy] : [];

  await deps.enqueue({
    orgId: input.orgId,
    runId: input.runId,
    dedupeKey: `notify:${input.runId}:${input.templateKey}:${recipient.toLowerCase()}`,
    payload: {
      orgId: input.orgId,
      runId: input.runId,
      templateKey: input.templateKey,
      to: recipient,
      cc,
      employeeFirstName: input.employee.firstName,
      employeeLastName: input.employee.lastName,
      employeeProfileId: input.employee.id,
    },
  });

  return {
    status: 'completed',
    reason: 'queued',
    queuedCount: 1,
  };
}

export async function processNotificationEvent(
  payload: Record<string, unknown>,
  deps: NotificationAdapterDependencies = DEFAULT_DEPS,
): Promise<NotificationSendResult> {
  const to = typeof payload.to === 'string' ? payload.to.trim() : '';
  const templateKey = typeof payload.templateKey === 'string' ? payload.templateKey.trim() : '';
  const runId = typeof payload.runId === 'string' ? payload.runId : '';
  const firstName = typeof payload.employeeFirstName === 'string' ? payload.employeeFirstName : '';
  const lastName = typeof payload.employeeLastName === 'string' ? payload.employeeLastName : '';
  const cc = parseCc(payload.cc);

  if (!to || !templateKey || !runId) {
    return {
      status: 'failed',
      reason: 'invalid_payload',
      retryable: false,
      message: 'Missing to/templateKey/runId in notification payload',
    };
  }

  const employeeFullName = `${firstName} ${lastName}`.trim() || 'Employee';
  const recipientName = firstName || 'there';
  const template = loadTemplate(templateKey);
  const values = {
    employeeFullName,
    recipientName,
    runId,
  };

  try {
    await deps.sendEmail({
      to,
      cc,
      subject: renderTemplate(template.subject, values),
      html: renderTemplate(template.html, values),
    });
    return {
      status: 'completed',
      reason: 'sent',
      retryable: false,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const missingConfig = message.includes('MISSING_CONFIG');
    return {
      status: 'failed',
      reason: missingConfig ? 'missing_config' : 'provider_error',
      retryable: !missingConfig,
      message,
    };
  }
}
