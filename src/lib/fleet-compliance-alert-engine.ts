import type { FleetComplianceSuspenseRecord } from '@/lib/fleet-compliance-data';

export type AlertWindow = 'overdue' | 'due-today' | '7d' | '14d' | '30d' | '90d';

export interface FleetComplianceAlertItem {
  suspenseItemId: string;
  title: string;
  ownerEmail: string;
  dueDate: string;
  severity: string;
  sourceType: string;
  window: AlertWindow;
  daysOut: number;
}

export interface FleetComplianceEmailPayload {
  to: string;
  subject: string;
  html: string;
  items: FleetComplianceAlertItem[];
}

export interface FleetComplianceAlertRunSummary {
  runAt: string;
  itemsEvaluated: number;
  itemsQueued: number;
  emailsSent: number;
  emailsFailed: number;
  dryRun: boolean;
  byWindow: Record<AlertWindow, number>;
  errors: string[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function extractEmail(value: string): string | null {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].toLowerCase() : null;
}

const ALERT_WINDOWS: { window: AlertWindow; minDays: number; maxDays: number }[] = [
  { window: 'overdue', minDays: -Infinity, maxDays: -1 },
  { window: 'due-today', minDays: 0, maxDays: 0 },
  { window: '7d', minDays: 1, maxDays: 7 },
  { window: '14d', minDays: 8, maxDays: 14 },
  { window: '30d', minDays: 15, maxDays: 30 },
  { window: '90d', minDays: 31, maxDays: 90 },
];

function daysUntil(dateText: string, referenceDate: Date): number {
  const due = new Date(`${dateText}T12:00:00-06:00`);
  const diffMs = due.getTime() - referenceDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function classifyWindow(daysOut: number): AlertWindow | null {
  for (const entry of ALERT_WINDOWS) {
    if (daysOut >= entry.minDays && daysOut <= entry.maxDays) {
      return entry.window;
    }
  }
  return null;
}

function windowLabel(window: AlertWindow): string {
  if (window === 'overdue') return 'OVERDUE';
  if (window === 'due-today') return 'Due Today';
  if (window === '7d') return 'Due within 7 days';
  if (window === '14d') return 'Due within 14 days';
  if (window === '30d') return 'Due within 30 days';
  return 'Due within 90 days';
}

function dueLine(item: FleetComplianceAlertItem): string {
  if (item.window === 'overdue') return `${Math.abs(item.daysOut)} days overdue`;
  if (item.window === 'due-today') return 'due today';
  return `due in ${item.daysOut} days (${item.dueDate})`;
}

function buildEmailHtml(ownerEmail: string, items: FleetComplianceAlertItem[], orgName: string): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:${item.window === 'overdue' ? '#dc2626' : item.window === 'due-today' ? '#d97706' : '#111827'}">${escapeHtml(item.title)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;text-transform:capitalize">${escapeHtml(item.severity)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280">${escapeHtml(dueLine(item))}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Fleet-Compliance Compliance Reminder</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <tr>
          <td style="background:#111827;padding:20px 24px">
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700">${escapeHtml(orgName)} — Compliance Reminder</p>
            <p style="margin:4px 0 0;color:#9ca3af;font-size:13px">${items.length} item${items.length !== 1 ? 's' : ''} require attention</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;border-collapse:collapse">
              <thead>
                <tr style="background:#f3f4f6">
                  <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600">Item</th>
                  <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600">Severity</th>
                  <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600">Due</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <p style="margin:20px 0 0;font-size:13px;color:#6b7280">
              Log in to the Fleet-Compliance compliance portal to review and action these items.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 24px;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:12px;color:#9ca3af">This is an automated compliance reminder from ${escapeHtml(orgName)}. Sent to ${escapeHtml(ownerEmail)}.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendEmail(payload: FleetComplianceEmailPayload, apiKey: string): Promise<{ ok: boolean; error?: string }> {
  const fromAddress = process.env.FLEET_COMPLIANCE_ALERT_FROM_EMAIL || 'compliance@fleetcompliance.com';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: String(err) };
  }
}

export async function runFleetComplianceAlertSweep(
  suspenseItems: FleetComplianceSuspenseRecord[],
  options: { dryRun?: boolean; referenceDate?: Date; managerEmail?: string } = {}
): Promise<FleetComplianceAlertRunSummary> {
  const referenceDate = options.referenceDate ?? new Date();
  const apiKey = process.env.RESEND_API_KEY;
  const dryRun = options.dryRun ?? !apiKey;
  const orgName = process.env.FLEET_COMPLIANCE_ORG_NAME || 'Fleet Compliance';
  const rawManagerEmail = options.managerEmail || process.env.FLEET_COMPLIANCE_ALERT_EMAIL || '';
  const managerEmail = extractEmail(rawManagerEmail) || '';

  const openItems = suspenseItems.filter((item: FleetComplianceSuspenseRecord) => item.status === 'open');

  // Classify each open item by alert window
  const alertItems: FleetComplianceAlertItem[] = [];
  for (const item of openItems) {
    const daysOut = daysUntil(item.dueDate, referenceDate);
    const window = classifyWindow(daysOut);
    if (!window) continue;
    alertItems.push({
      suspenseItemId: item.suspenseItemId,
      title: item.title,
      ownerEmail: item.ownerEmail,
      dueDate: item.dueDate,
      severity: item.severity,
      sourceType: item.sourceType,
      window,
      daysOut,
    });
  }

  // Group by owner for per-owner emails (skip non-email values)
  const byOwner = new Map<string, FleetComplianceAlertItem[]>();
  for (const item of alertItems) {
    const key = extractEmail(item.ownerEmail);
    if (!key) continue;
    if (!byOwner.has(key)) byOwner.set(key, []);
    byOwner.get(key)!.push(item);
  }

  // Always include manager summary email (only if valid email)
  if (alertItems.length > 0 && managerEmail) {
    byOwner.set(managerEmail, alertItems);
  }

  const emails: FleetComplianceEmailPayload[] = [];
  for (const [ownerEmail, items] of byOwner.entries()) {
    const isManager = ownerEmail === managerEmail;
    const windowCounts = items.reduce<Partial<Record<AlertWindow, number>>>((acc, item) => {
      acc[item.window] = (acc[item.window] ?? 0) + 1;
      return acc;
    }, {});

    const windowParts: string[] = [];
    if (windowCounts.overdue) windowParts.push(`${windowCounts.overdue} overdue`);
    if (windowCounts['due-today']) windowParts.push(`${windowCounts['due-today']} due today`);
    if (windowCounts['7d']) windowParts.push(`${windowCounts['7d']} due this week`);
    if (windowCounts['30d']) windowParts.push(`${windowCounts['30d']} due in 30 days`);
    if (windowCounts['90d']) windowParts.push(`${windowCounts['90d']} due in 90 days`);

    const subject = isManager
      ? `[Fleet-Compliance] Compliance summary: ${items.length} item${items.length !== 1 ? 's' : ''} — ${windowParts.join(', ') || 'review needed'}`
      : `[Fleet-Compliance] Compliance reminder: ${items.length} item${items.length !== 1 ? 's' : ''} need attention`;

    emails.push({
      to: ownerEmail,
      subject,
      html: buildEmailHtml(ownerEmail, items, orgName),
      items,
    });
  }

  const byWindow: Record<AlertWindow, number> = {
    overdue: 0,
    'due-today': 0,
    '7d': 0,
    '14d': 0,
    '30d': 0,
    '90d': 0,
  };
  for (const item of alertItems) {
    byWindow[item.window]++;
  }

  const summary: FleetComplianceAlertRunSummary = {
    runAt: referenceDate.toISOString(),
    itemsEvaluated: openItems.length,
    itemsQueued: alertItems.length,
    emailsSent: 0,
    emailsFailed: 0,
    dryRun,
    byWindow,
    errors: [],
  };

  if (dryRun) {
    summary.emailsSent = 0;
    return summary;
  }

  for (const payload of emails) {
    const result = await sendEmail(payload, apiKey!);
    if (result.ok) {
      summary.emailsSent++;
    } else {
      summary.emailsFailed++;
      summary.errors.push(`Failed to send to ${payload.to}: ${result.error}`);
    }
  }

  return summary;
}

export function previewFleetComplianceAlerts(suspenseItems: FleetComplianceSuspenseRecord[], referenceDate?: Date): {
  alertItems: FleetComplianceAlertItem[];
  byOwner: Record<string, FleetComplianceAlertItem[]>;
  byWindow: Record<AlertWindow, number>;
} {
  const ref = referenceDate ?? new Date();
  const openItems = suspenseItems.filter((item: FleetComplianceSuspenseRecord) => item.status === 'open');

  const alertItems: FleetComplianceAlertItem[] = [];
  for (const item of openItems) {
    const daysOut = daysUntil(item.dueDate, ref);
    const window = classifyWindow(daysOut);
    if (!window) continue;
    alertItems.push({
      suspenseItemId: item.suspenseItemId,
      title: item.title,
      ownerEmail: item.ownerEmail,
      dueDate: item.dueDate,
      severity: item.severity,
      sourceType: item.sourceType,
      window,
      daysOut,
    });
  }

  const byOwner: Record<string, FleetComplianceAlertItem[]> = {};
  for (const item of alertItems) {
    if (!byOwner[item.ownerEmail]) byOwner[item.ownerEmail] = [];
    byOwner[item.ownerEmail].push(item);
  }

  const byWindow: Record<AlertWindow, number> = {
    overdue: 0,
    'due-today': 0,
    '7d': 0,
    '14d': 0,
    '30d': 0,
    '90d': 0,
  };
  for (const item of alertItems) {
    byWindow[item.window]++;
  }

  return { alertItems, byOwner, byWindow };
}
