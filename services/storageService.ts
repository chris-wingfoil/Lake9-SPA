/**
 * Privacy-First Storage Service
 * Orchestrates encryption + Drive upload for maximum privacy
 * - Encryption happens client-side only
 * - User's encryption key never leaves browser
 * - Server never sees unencrypted data
 */

import { encryptData, decryptData, generateSecurePassword, EncryptedData } from './encryptionService';
import { 
  uploadEncryptedFile, 
  findOrCreateFolder, 
  getAuthenticatedToken,
  downloadFile,
  listFiles,
  DriveUploadResult 
} from './driveService';
import { AIProcessingResult } from '../types';

const LAKE9_FOLDER_NAME = 'Lake9_Encrypted_Art';

export interface SaveResult {
  driveResult: DriveUploadResult;
  encryptionKey: string;
}

/**
 * Save art result to Google Drive with encryption
 * @param artResult - The AI-generated art result
 * @param encryptionPassword - User's encryption password (optional, auto-generated if not provided)
 * @returns Save result with Drive file info and encryption key
 */
export async function saveArtToPrivateDrive(
  artResult: AIProcessingResult,
  encryptionPassword?: string
): Promise<SaveResult> {
  try {
    // Get authenticated token
    const accessToken = await getAuthenticatedToken();
    
    // Generate encryption password if not provided
    const password = encryptionPassword || generateSecurePassword();
    
    // Encrypt the art result
    console.log('?? Encrypting art data...');
    const encryptedData = await encryptData(artResult, password);
    
    // Find or create Lake9 folder in Drive
    console.log('?? Finding Lake9 folder in Google Drive...');
    const folderId = await findOrCreateFolder(LAKE9_FOLDER_NAME, accessToken);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `lake9_art_${timestamp}.encrypted.json`;
    
    // Upload to Drive
    console.log('?? Uploading encrypted data to Drive...');
    const driveResult = await uploadEncryptedFile(
      fileName,
      encryptedData,
      accessToken,
      folderId
    );
    
    console.log('? Art saved successfully!');
    
    return {
      driveResult,
      encryptionKey: password
    };
  } catch (error) {
    console.error('Failed to save art to Drive:', error);
    throw error;
  }
}

/**
 * Load encrypted art from Google Drive
 * @param fileId - Drive file ID
 * @param encryptionPassword - User's encryption password
 * @returns Decrypted art result
 */
export async function loadArtFromPrivateDrive(
  fileId: string,
  encryptionPassword: string
): Promise<AIProcessingResult> {
  try {
    // Get authenticated token
    const accessToken = await getAuthenticatedToken();
    
    // Download encrypted file
    console.log('?? Downloading from Drive...');
    const encryptedData = await downloadFile(fileId, accessToken);
    
    // Decrypt the data
    console.log('?? Decrypting art data...');
    const artResult = await decryptData(encryptedData, encryptionPassword);
    
    console.log('? Art loaded successfully!');
    return artResult;
  } catch (error) {
    console.error('Failed to load art from Drive:', error);
    throw error;
  }
}

/**
 * List all Lake9 encrypted art files from Google Drive
 */
export async function listSavedArt() {
  try {
    const accessToken = await getAuthenticatedToken();
    const folderId = await findOrCreateFolder(LAKE9_FOLDER_NAME, accessToken);
    return listFiles(accessToken, folderId);
  } catch (error) {
    console.error('Failed to list saved art:', error);
    throw error;
  }
}
