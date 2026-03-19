import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import AlertSettingsForm from '@/components/chief/forms/AlertSettingsForm';

export const dynamic = 'force-dynamic';

export default async function AlertSettingsPage() {
  if (!isClerkEnabled()) return null;
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const orgName = process.env.CHIEF_ORG_NAME ?? '';
  const fromEmail = process.env.CHIEF_ALERT_FROM_EMAIL ?? '';
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-breadcrumbs">
          <Link href="/chief">Chief</Link>
          <span>/</span>
          <Link href="/chief/alerts">Alerts</Link>
          <span>/</span>
          <span>Settings</span>
        </div>
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Settings</p>
            <h1>Alert email configuration</h1>
          </div>
          <Link href="/chief/alerts" className="btn-secondary">Back to Alerts</Link>
        </div>
        <p className="chief-subcopy">
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
