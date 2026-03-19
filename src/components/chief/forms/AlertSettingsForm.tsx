'use client';

import { useState, useEffect } from 'react';
import { readSettings, writeSettings, type AlertSettings } from '@/lib/chief-local-store';

const DEFAULTS: AlertSettings = {
  orgName: 'Example Fleet Co',
  fromEmail: 'compliance@examplefleetco.com',
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
    const stored = readSettings<AlertSettings>('chief:settings:alerts');
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
    writeSettings<AlertSettings>('chief:settings:alerts', form);
    setSaved(true);
  }

  function copyEnvCmd(name: string, value: string) {
    navigator.clipboard.writeText(`printf '%s' '${value}' | vercel env add ${name} production`);
  }

  if (!mounted) return null;

  return (
    <div>
      {saved && <div className="chief-success-banner" style={{ marginBottom: '1.5rem' }}>Alert preferences saved locally.</div>}

      <form onSubmit={handleSubmit} className="chief-form-page">
        <fieldset className="chief-fieldset">
          <legend>Organization</legend>
          <div className="chief-form-grid">
            <label className="chief-field-stack">
              <span>Org Name</span>
              <input
                type="text"
                value={form.orgName}
                onChange={(e) => set('orgName', e.target.value)}
                placeholder="Example Fleet Co"
              />
            </label>
            <label className="chief-field-stack">
              <span>Alert From Email</span>
              <input
                type="email"
                value={form.fromEmail}
                onChange={(e) => set('fromEmail', e.target.value)}
                placeholder="compliance@yourorg.com"
              />
            </label>
            <label className="chief-field-stack">
              <span>Manager / Summary Email</span>
              <input
                type="email"
                value={form.managerEmail}
                onChange={(e) => set('managerEmail', e.target.value)}
                placeholder="manager@yourorg.com"
              />
            </label>
            <label className="chief-field-stack">
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

        <div className="chief-action-row">
          <button type="submit" className="btn-primary">Save Preferences</button>
        </div>
      </form>

      {/* Vercel env var setup */}
      <div className="chief-list-card" style={{ marginTop: '2rem' }}>
        <h3>Vercel environment variables</h3>
        <p className="chief-table-note" style={{ marginBottom: '1rem' }}>
          These env vars control the live alert engine. Local preferences above are for display only.
          Click <strong>Copy command</strong> to set each value via the Vercel CLI.
        </p>
        <div className="chief-table-wrap">
          <table className="chief-table">
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
                    ? <span className="chief-pill chief-pill-active">Set</span>
                    : <span className="chief-pill">Not set</span>}
                </td>
                <td className="chief-table-note">Required to send emails. Get key at resend.com</td>
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
                <td><code>CHIEF_ALERT_FROM_EMAIL</code></td>
                <td className="chief-table-note">{serverFromEmail || '(default)'}</td>
                <td className="chief-table-note">From address in compliance emails</td>
                <td>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '2px 10px' }}
                    onClick={() => copyEnvCmd('CHIEF_ALERT_FROM_EMAIL', form.fromEmail)}
                  >
                    Copy command
                  </button>
                </td>
              </tr>
              <tr>
                <td><code>CHIEF_ORG_NAME</code></td>
                <td className="chief-table-note">{serverOrgName || '(default)'}</td>
                <td className="chief-table-note">Org name in email header</td>
                <td>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '2px 10px' }}
                    onClick={() => copyEnvCmd('CHIEF_ORG_NAME', form.orgName)}
                  >
                    Copy command
                  </button>
                </td>
              </tr>
              <tr>
                <td><code>CHIEF_CRON_SECRET</code></td>
                <td className="chief-table-note">Used by Vercel Cron</td>
                <td className="chief-table-note">Secures the cron POST endpoint</td>
                <td>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '2px 10px' }}
                    onClick={() => copyEnvCmd('CHIEF_CRON_SECRET', 'YOUR_SECRET_HERE')}
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
