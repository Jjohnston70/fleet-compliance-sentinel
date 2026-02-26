import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { listFilesInFolder } from '@/lib/drive';
import { isClerkEnabled } from '@/lib/clerk';

export const dynamic = 'force-dynamic';

export default async function ResourcesPage() {
  const hasClerk = isClerkEnabled();

  if (!hasClerk) {
    return (
      <main style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ color: 'var(--navy)', marginBottom: '0.75rem' }}>Resources</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Configure Clerk environment variables to enable protected resources.
        </p>
      </main>
    );
  }

  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const publicFolderId = process.env.GOOGLE_DRIVE_PUBLIC_RESOURCES_FOLDER_ID || '';
  const driveFolderLink = process.env.GOOGLE_DRIVE_PUBLIC_RESOURCES_DRIVE_LINK || '';
  const resources = await listFilesInFolder(publicFolderId);

  return (
    <main style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ color: 'var(--navy)', marginBottom: '0.75rem' }}>Resources</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Your team resource library is pulled from Google Drive.
      </p>

      {!publicFolderId && (
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Add `GOOGLE_DRIVE_PUBLIC_RESOURCES_FOLDER_ID` in env vars to load files.
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {driveFolderLink && (
          <a href={driveFolderLink} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Open Drive Folder
          </a>
        )}
        <Link href="/penny" className="btn-primary">
          Back to Penny
        </Link>
      </div>

      <section>
        {resources.files.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {resources.files.map((file) => (
              <Link
                key={file.id}
                href={`/resources/${file.id}`}
                style={{
                  display: 'block',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '0.85rem 1rem',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                }}
              >
                <p style={{ color: 'var(--navy)', fontWeight: 600 }}>{file.name || 'Untitled file'}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {file.mimeType === 'application/vnd.google-apps.document' ? 'Google Doc' : 'File'}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No files found in this resources folder yet.</p>
        )}
      </section>
    </main>
  );
}
