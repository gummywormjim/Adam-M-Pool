import { getAccessToken } from './googleAuth';

export interface DriveBackupFile {
  id: string;
  name: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  mimeType?: string;
  description?: string;
}

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

/**
 * List HabitVault backup files from user's Google Drive
 */
export const listHabitVaultDriveBackups = async (): Promise<DriveBackupFile[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive. Please sign in.');
  }

  const query = encodeURIComponent("name contains 'HabitVault' and trashed = false");
  const fields = encodeURIComponent('files(id,name,size,createdTime,modifiedTime,mimeType,description)');
  const url = `${DRIVE_API_URL}?q=${query}&fields=${fields}&orderBy=modifiedTime desc&pageSize=20`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Google Drive list failed (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return (data.files || []) as DriveBackupFile[];
};

/**
 * Upload a new encrypted HabitVault backup to Google Drive
 */
export const uploadBackupToGoogleDrive = async (
  backupJson: string,
  customTitle?: string
): Promise<DriveBackupFile> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive. Please sign in.');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = customTitle || `HabitVault_Backup_${timestamp}.json`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: `HabitVault Encrypted Vault Backup created on ${new Date().toLocaleString()}`,
  };

  const boundary = '-------HabitVaultMultipartBoundary' + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    backupJson +
    closeDelimiter;

  const res = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Google Drive upload failed (${res.status}): ${errorBody}`);
  }

  return (await res.json()) as DriveBackupFile;
};

/**
 * Download a backup file's content from Google Drive
 */
export const downloadBackupFromGoogleDrive = async (fileId: string): Promise<string> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive. Please sign in.');
  }

  const res = await fetch(`${DRIVE_API_URL}/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to download file from Google Drive (${res.status}): ${errorBody}`);
  }

  return await res.text();
};

/**
 * Delete a backup file from Google Drive
 * CAUTION: Destructive operation - MUST be confirmed by user dialog first!
 */
export const deleteFileFromGoogleDrive = async (fileId: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive. Please sign in.');
  }

  const res = await fetch(`${DRIVE_API_URL}/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const errorBody = await res.text();
    throw new Error(`Failed to delete file from Google Drive (${res.status}): ${errorBody}`);
  }
};

/**
 * Upload a text or markdown summary report to Google Drive
 */
export const uploadReportToGoogleDrive = async (
  reportContent: string,
  title: string
): Promise<DriveBackupFile> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive. Please sign in.');
  }

  const fileName = `HabitVault_Report_${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
  const metadata = {
    name: fileName,
    mimeType: 'text/plain',
    description: `HabitVault Financial & Recovery Report: ${title}`,
  };

  const boundary = '-------HabitVaultMultipartReport' + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    reportContent +
    closeDelimiter;

  const res = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Google Drive report upload failed (${res.status}): ${errorBody}`);
  }

  return (await res.json()) as DriveBackupFile;
};
