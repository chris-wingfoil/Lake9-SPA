/**
 * Client-Side Encryption Service
 * Privacy-first: All encryption happens in the browser
 * Keys never leave the user's device
 */

export interface EncryptedData {
  iv: string; // Initialization vector (base64)
  data: string; // Encrypted data (base64)
  salt: string; // Salt for key derivation (base64)
}

/**
 * Generate a cryptographic key from a password
 * Uses PBKDF2 for secure key derivation
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import password as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive AES-GCM key from password
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 * @param data - Data to encrypt (will be JSON stringified)
 * @param password - User's encryption password (never stored)
 * @returns Encrypted data with IV and salt
 */
export async function encryptData(data: any, password: string): Promise<EncryptedData> {
  try {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive encryption key
    const key = await deriveKey(password, salt);
    
    // Convert data to bytes
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const dataBuffer = encoder.encode(dataString);
    
    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      dataBuffer
    );
    
    // Convert to base64 for storage
    return {
      iv: btoa(String.fromCharCode(...Array.from(new Uint8Array(iv)))),
      data: btoa(String.fromCharCode(...Array.from(new Uint8Array(encryptedBuffer)))),
      salt: btoa(String.fromCharCode(...Array.from(salt)))
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES-GCM
 * @param encryptedData - Encrypted data with IV and salt
 * @param password - User's encryption password
 * @returns Decrypted data (parsed from JSON)
 */
export async function decryptData(encryptedData: EncryptedData, password: string): Promise<any> {
  try {
    // Convert base64 back to Uint8Array
    const iv = new Uint8Array(
      atob(encryptedData.iv).split('').map(c => c.charCodeAt(0))
    );
    const salt = new Uint8Array(
      atob(encryptedData.salt).split('').map(c => c.charCodeAt(0))
    );
    const dataBuffer = new Uint8Array(
      atob(encryptedData.data).split('').map(c => c.charCodeAt(0))
    );
    
    // Derive decryption key
    const key = await deriveKey(password, salt);
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      dataBuffer
    );
    
    // Convert back to string and parse JSON
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data. Wrong password?');
  }
}

/**
 * Generate a secure random password
 * Useful for auto-generating encryption keys
 */
export function generateSecurePassword(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(randomValues)
    .map(x => charset[x % charset.length])
    .join('');
}
