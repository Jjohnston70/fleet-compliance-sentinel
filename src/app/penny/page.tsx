// app/penny/page.tsx
// Pipeline Penny chat interface - Clerk protected
// Connects to FastAPI backend on Railway (or localhost for dev)
// Role-based: admin = full access, demo = limited, client = scoped

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PennyChat from './PennyChat';
import { isClerkEnabled } from '@/lib/clerk';

// Helper to get user role from Clerk metadata
async function getUserRole() {
  const { sessionClaims } = await auth();
  const metadata = (sessionClaims as any)?.metadata || {};
  return metadata.role || 'member';
}

export default async function PennyPage() {
  const hasClerk = isClerkEnabled();

  if (!hasClerk) {
    return (
      <div className="penny-container">
        <div className="penny-header">
          <h1>Pipeline Penny</h1>
          <p>Configure Clerk environment variables to enable protected Penny access.</p>
        </div>
      </div>
    );
  }

  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const role = await getUserRole();

  // Only admin, demo, and client roles can access Penny
  const allowedRoles = ['admin', 'demo', 'client'];
  if (!allowedRoles.includes(role)) {
    return (
      <div className="penny-container">
        <div className="penny-header">
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

  const isDemo = role === 'demo';
  const firstName = user?.firstName || 'there';

  return (
    <PennyChat
      userName={firstName}
      userRole={role}
      isDemo={isDemo}
    />
  );
}
