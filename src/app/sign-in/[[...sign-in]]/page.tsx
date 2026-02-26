import { SignIn } from '@clerk/nextjs';
import { isClerkEnabled } from '@/lib/clerk';

export default function SignInPage() {
  const hasClerk = isClerkEnabled();

  if (!hasClerk) {
    return (
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ color: 'var(--navy)', marginBottom: '0.75rem' }}>Sign In Unavailable</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Configure Clerk environment variables to enable authentication.
        </p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: 'calc(100vh - 65px)', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <SignIn />
    </main>
  );
}
