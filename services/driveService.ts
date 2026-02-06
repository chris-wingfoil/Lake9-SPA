/**
 * Client-Side Google Drive Service
 * Privacy-first: Direct upload from browser to user's Drive
 * Server never sees unencrypted data or Drive files
 */

import { getDriveAccessToken } from './authService';
import { EncryptedData } from './encryptionService';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
}

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink?: string;
}

/**
 * Create a folder in Google Drive
 */
export async function createFolder(
  folderName: string,
  accessToken: string
): Promise<string> {
  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };

  const response = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!response.ok) {
    throw new Error(`Failed to create folder: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Find a folder by name (or create if doesn't exist)
 */
export async function findOrCreateFolder(
  folderName: string,
  accessToken: string
): Promise<string> {
  // Search for existing folder
  const searchQuery = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const searchUrl = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name)`;

  const response = await fetch(searchUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to search folders: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Folder doesn't exist, create it
  return createFolder(folderName, accessToken);
}

/**
 * Upload encrypted data to Google Drive
 * @param fileName - Name of the file
 * @param encryptedData - Encrypted data to upload
 * @param accessToken - User's Google OAuth access token
 * @param folderId - Optional folder ID to upload to
 */
export async function uploadEncryptedFile(
  fileName: string,
  encryptedData: EncryptedData,
  accessToken: string,
  folderId?: string
): Promise<DriveUploadResult> {
  try {
    // Convert encrypted data to JSON string
    const fileContent = JSON.stringify(encryptedData);
    const blob = new Blob([fileContent], { type: 'application/json' });

    // Create metadata
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      ...(folderId && { parents: [folderId] })
    };

    // Use multipart upload
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch(
      `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,webViewLink`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: form
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Drive upload failed: ${errorText}`);
    }

    const result = await response.json();
    return {
      fileId: result.id,
      name: result.name,
      webViewLink: result.webViewLink
    };
  } catch (error) {
    console.error('Drive upload error:', error);
    throw new Error('Failed to upload to Google Drive');
  }
}

/**
 * List files in a folder
 */
export async function listFiles(
  accessToken: string,
  folderId?: string
): Promise<DriveFile[]> {
  const query = folderId 
    ? `'${folderId}' in parents and trashed=false`
    : 'trashed=false';
  
  const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,createdTime,modifiedTime)&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to list files: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Download and decrypt a file from Google Drive
 */
export async function downloadFile(
  fileId: string,
  accessToken: string
): Promise<EncryptedData> {
  const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a file from Google Drive
 */
export async function deleteFile(
  fileId: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.statusText}`);
  }
}

/**
 * Helper to get access token and verify user is authenticated
 */
export async function getAuthenticatedToken(): Promise<string> {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('User not authenticated. Please sign in with Google.');
  }
  return token;
}
