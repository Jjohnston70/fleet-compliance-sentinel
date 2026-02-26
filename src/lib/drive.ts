import { google } from 'googleapis';

interface DriveListResult {
  files: Array<{
    id?: string | null;
    name?: string | null;
    mimeType?: string | null;
    createdTime?: string | null;
    modifiedTime?: string | null;
  }>;
}

interface DriveFileContentResult {
  content: string | null;
  title: string;
  mimeType?: string | null;
  webViewLink?: string | null;
  isGoogleDoc: boolean;
}

function normalizeGoogleDocHtml(rawHtml: string): string {
  const styleBlocks = rawHtml.match(/<style[\s\S]*?<\/style>/gi)?.join('\n') ?? '';
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const content = bodyMatch ? bodyMatch[1] : rawHtml;
  return `${styleBlocks}\n${content}`;
}

function getGoogleAuth() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET
  );

  if (process.env.GOOGLE_DRIVE_REFRESH_TOKEN) {
    auth.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    });
  }

  return auth;
}

function getDriveClient() {
  const auth = getGoogleAuth();
  return google.drive({ version: 'v3', auth });
}

export async function listFilesInFolder(folderId: string): Promise<DriveListResult> {
  if (!folderId || !process.env.GOOGLE_DRIVE_CLIENT_ID) {
    return { files: [] };
  }

  try {
    const drive = getDriveClient();
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime)',
      orderBy: 'modifiedTime desc',
    });

    return { files: response.data.files || [] };
  } catch (error) {
    console.error('Error listing Drive files:', error);
    return { files: [] };
  }
}

export async function getFileContents(fileId: string): Promise<DriveFileContentResult> {
  if (!process.env.GOOGLE_DRIVE_CLIENT_ID) {
    throw new Error('Google Drive API credentials not configured');
  }

  const drive = getDriveClient();
  const metadataResponse = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, webViewLink, createdTime, modifiedTime',
  });

  const file = metadataResponse.data;

  if (file.mimeType === 'application/vnd.google-apps.document') {
    const exportResponse = await drive.files.export(
      {
        fileId,
        mimeType: 'text/html',
      },
      {
        responseType: 'text',
      }
    );

    return {
      content: normalizeGoogleDocHtml(String(exportResponse.data)),
      title: file.name || 'Document',
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
      isGoogleDoc: true,
    };
  }

  return {
    content: null,
    title: file.name || 'File',
    mimeType: file.mimeType,
    webViewLink: file.webViewLink,
    isGoogleDoc: false,
  };
}
