// app/penny/page.tsx
// Pipeline Penny chat interface - Clerk protected
// Connects to FastAPI backend on Railway (or localhost for dev)
// Role-based: admin = full access, client = scoped

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import PennyChat from './PennyChat';
import { isClerkEnabled } from '@/lib/clerk';
import { canAccessPenny, canBypassPennyRoleByEmail, resolvePennyRole } from '@/lib/penny-access';

export const metadata: Metadata = {
  title: 'Penny AI',
};

export default async function PennyPage() {
  const hasClerk = isClerkEnabled();

  if (!hasClerk) {
    return (
      <div className="penny-container">
        <div className="penny-header">
          <div className="fleet-compliance-breadcrumbs">
            <a href="/fleet-compliance">Fleet-Compliance</a>
            <span>/</span>
            <span>Penny AI</span>
          </div>
          <h1>Pipeline Penny</h1>
          <p>Configure Clerk environment variables to enable protected Penny access.</p>
        </div>
      </div>
    );
  }

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const role = resolvePennyRole(sessionClaims, user);
  const hasEmailBypass = canBypassPennyRoleByEmail(user);

  // Only admin and client roles can access Penny
  if (!canAccessPenny(role) && !hasEmailBypass) {
    return (
      <div className="penny-container">
        <div className="penny-header">
          <div className="fleet-compliance-breadcrumbs">
            <a href="/fleet-compliance">Fleet-Compliance</a>
            <span>/</span>
            <span>Penny AI</span>
          </div>
          <h1>Pipeline Penny</h1>
          <p>Access pending. Your account hasn't been approved for Penny yet.</p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Contact Jacob at{' '}
            <a href="mailto:jacob@truenorthstrategyops.com" style={{ color: 'var(--teal)' }}>
              jacob@truenorthstrategyops.com
            </a>{' '}
            to request access.
          </p>
        </div>
      </div>
    );
  }

  const effectiveRole = canAccessPenny(role) ? role : 'admin';
  const firstName = user?.firstName || 'there';

  return (
    <PennyChat
      userName={firstName}
      userRole={effectiveRole}
    />
  );
}
