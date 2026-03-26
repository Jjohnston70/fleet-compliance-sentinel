import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import AlertSettingsForm from '@/components/fleet-compliance/forms/AlertSettingsForm';

export const dynamic = 'force-dynamic';

export default async function AlertSettingsPage() {
  if (!isClerkEnabled()) return null;
  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  const orgName = process.env.FLEET_COMPLIANCE_ORG_NAME ?? '';
  const fromEmail = process.env.FLEET_COMPLIANCE_ALERT_FROM_EMAIL ?? '';
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/alerts">Alerts</Link>
          <span>/</span>
          <span>Settings</span>
        </div>
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Settings</p>
            <h1>Alert email configuration</h1>
          </div>
          <Link href="/fleet-compliance/alerts" className="btn-secondary">Back to Alerts</Link>
        </div>
        <p className="fleet-compliance-subcopy">
          Set your organization name, alert from address, manager summary email, and alert threshold.
          Local preferences are saved in your browser. Use the <strong>Copy command</strong> buttons to
          set the actual Vercel environment variables that control the live alert engine.
        </p>

        <AlertSettingsForm
          serverOrgName={orgName}
          serverFromEmail={fromEmail}
          serverResendConfigured={resendConfigured}
        />
      </section>
    </main>
  );
}

