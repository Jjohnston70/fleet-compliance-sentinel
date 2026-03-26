'use client';

import { useState, useEffect } from 'react';
import { readSettings, writeSettings, type AlertSettings } from '@/lib/fleet-compliance-local-store';

const DEFAULTS: AlertSettings = {
  orgName: 'Fleet Compliance',
  fromEmail: 'compliance@fleetcompliance.com',
  managerEmail: '',
  thresholdDays: 30,
};

interface Props {
  serverOrgName: string;
  serverFromEmail: string;
  serverResendConfigured: boolean;
}

export default function AlertSettingsForm({
  serverOrgName,
  serverFromEmail,
  serverResendConfigured,
}: Props) {
  const [form, setForm] = useState<AlertSettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readSettings<AlertSettings>('fleet-compliance:settings:alerts');
    setForm(
      stored ?? {
        ...DEFAULTS,
        orgName: serverOrgName || DEFAULTS.orgName,
        fromEmail: serverFromEmail || DEFAULTS.fromEmail,
      }
    );
    setMounted(true);
  }, [serverOrgName, serverFromEmail]);

  function set(field: keyof AlertSettings, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    writeSettings<AlertSettings>('fleet-compliance:settings:alerts', form);
    setSaved(true);
  }

  function copyEnvCmd(name: string, value: string) {
    navigator.clipboard.writeText(`printf '%s' '${value}' | vercel env add ${name} production`);
  }

  if (!mounted) return null;

  return (
    <div>
      {saved && <div className="fleet-compliance-success-banner" style={{ marginBottom: '1.5rem' }}>Alert preferences saved locally.</div>}

      <form onSubmit={handleSubmit} className="fleet-compliance-form-page">
        <fieldset className="fleet-compliance-fieldset">
          <legend>Organization</legend>
          <div className="fleet-compliance-form-grid">
            <label className="fleet-compliance-field-stack">
              <span>Org Name</span>
              <input
                type="text"
                value={form.orgName}
                onChange={(e) => set('orgName', e.target.value)}
                placeholder="Fleet Compliance"
              />
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Alert From Email</span>
              <input
                type="email"
                value={form.fromEmail}
                onChange={(e) => set('fromEmail', e.target.value)}
                placeholder="compliance@yourorg.com"
              />
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Manager / Summary Email</span>
              <input
                type="email"
                value={form.managerEmail}
                onChange={(e) => set('managerEmail', e.target.value)}
                placeholder="manager@yourorg.com"
              />
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Alert Threshold (days)</span>
              <select
                value={form.thresholdDays}
                onChange={(e) => set('thresholdDays', Number(e.target.value))}
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </label>
          </div>
        </fieldset>

        <div className="fleet-compliance-action-row">
          <button type="submit" className="btn-primary">Save Preferences</button>
        </div>
      </form>

      {/* Vercel env var setup */}
      <div className="fleet-compliance-list-card" style={{ marginTop: '2rem' }}>
        <h3>Vercel environment variables</h3>
        <p className="fleet-compliance-table-note" style={{ marginBottom: '1rem' }}>
          These env vars control the live alert engine. Local preferences above are for display only.
          Click <strong>Copy command</strong> to set each value via the Vercel CLI.
        </p>
        <div className="fleet-compliance-table-wrap">
          <table className="fleet-compliance-table">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Current</th>
                <th>Purpose</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>RESEND_API_KEY</code></td>
                <td>
                  {serverResendConfigured
                    ? <span className="fleet-compliance-pill fleet-compliance-pill-active">Set</span>
                    : <span className="fleet-compliance-pill">Not set</span>}
                </td>
                <td className="fleet-compliance-table-note">Required to send emails. Get key at resend.com</td>
                <td>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '2px 10px' }}
                    onClick={() => copyEnvCmd('RESEND_API_KEY', 're_YOUR_KEY_HERE')}
                  >
                    Copy command
                  </button>
                </td>
              </tr>
              <tr>
                <td><code>FLEET_COMPLIANCE_ALERT_FROM_EMAIL</code></td>
                <td className="fleet-compliance-table-note">{serverFromEmail || '(default)'}</td>
                <td className="fleet-compliance-table-note">From address in compliance emails</td>
                <td>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '2px 10px' }}
                    onClick={() => copyEnvCmd('FLEET_COMPLIANCE_ALERT_FROM_EMAIL', form.fromEmail)}
                  >
                    Copy command
                  </button>
                </td>
              </tr>
              <tr>
                <td><code>FLEET_COMPLIANCE_ORG_NAME</code></td>
                <td className="fleet-compliance-table-note">{serverOrgName || '(default)'}</td>
                <td className="fleet-compliance-table-note">Org name in email header</td>
                <td>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '2px 10px' }}
                    onClick={() => copyEnvCmd('FLEET_COMPLIANCE_ORG_NAME', form.orgName)}
                  >
                    Copy command
                  </button>
                </td>
              </tr>
              <tr>
                <td><code>FLEET_COMPLIANCE_CRON_SECRET</code></td>
                <td className="fleet-compliance-table-note">Used by Vercel Cron</td>
                <td className="fleet-compliance-table-note">Secures the cron POST endpoint</td>
                <td>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '2px 10px' }}
                    onClick={() => copyEnvCmd('FLEET_COMPLIANCE_CRON_SECRET', 'YOUR_SECRET_HERE')}
                  >
                    Copy command
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
