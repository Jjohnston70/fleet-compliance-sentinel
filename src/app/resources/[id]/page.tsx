import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getFileContents } from '@/lib/drive';
import { isClerkEnabled } from '@/lib/clerk';

export const dynamic = 'force-dynamic';

interface ResourcePageProps {
  params: Promise<{ id: string }>;
}

export default async function ResourceDetailPage({ params }: ResourcePageProps) {
  const hasClerk = isClerkEnabled();

  if (!hasClerk) {
    return (
      <main style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ color: 'var(--navy)', marginBottom: '0.75rem' }}>Resource Viewer Unavailable</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Configure Clerk environment variables to view protected resources.
        </p>
      </main>
    );
  }

  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const { id } = await params;

  try {
    const file = await getFileContents(id);

    return (
      <main style={{ maxWidth: '980px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <Link href="/resources" className="btn-secondary">
            Back to Resources
          </Link>
        </div>

        <h1 style={{ color: 'var(--navy)', marginBottom: '0.5rem' }}>{file.title}</h1>
        {file.mimeType && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {file.mimeType}
          </p>
        )}

        {file.isGoogleDoc && file.content ? (
          <article className="doc-content" dangerouslySetInnerHTML={{ __html: file.content }} />
        ) : (
          <section
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '1.25rem',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              This file can&apos;t be rendered inline in the app.
            </p>
            {file.webViewLink && (
              <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Open in Google Drive
              </a>
            )}
          </section>
        )}
      </main>
    );
  } catch {
    return (
      <main style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ color: 'var(--navy)', marginBottom: '0.75rem' }}>Resource Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          This resource could not be loaded. It may have been removed or your Drive settings may be incomplete.
        </p>
        <Link href="/resources" className="btn-primary">
          Back to Resources
        </Link>
      </main>
    );
  }
}
