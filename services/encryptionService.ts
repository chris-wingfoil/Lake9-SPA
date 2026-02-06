/**
 * Client-Side Encryption Service
 * Privacy-first: All encryption happens in the browser
 * Keys never leave the user's device
 */

/**
 * Convert Uint8Array to base64 string
 * Processes in chunks to avoid stack overflow with large data
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192; // Process 8KB at a time
  
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode(...Array.from(chunk));
  }
  
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

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
    console.log('?? Starting encryption...');
    
    // Check if Web Crypto API is available
    if (!crypto || !crypto.subtle) {
      throw new Error('Web Crypto API not available. Please use HTTPS or modern browser.');
    }
    console.log('? Web Crypto API available');
    
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    console.log('? Generated salt and IV');
    
    // Derive encryption key
    const key = await deriveKey(password, salt);
    console.log('? Derived encryption key');
    
    // Convert data to bytes
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const dataBuffer = encoder.encode(dataString);
    console.log('? Encoded data:', dataBuffer.length, 'bytes');
    
    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      dataBuffer
    );
    console.log('? Encrypted data:', encryptedBuffer.byteLength, 'bytes');
    
    // Convert to base64 for storage (using chunked conversion to avoid stack overflow)
    const result = {
      iv: uint8ArrayToBase64(new Uint8Array(iv)),
      data: uint8ArrayToBase64(new Uint8Array(encryptedBuffer)),
      salt: uint8ArrayToBase64(salt)
    };
    console.log('? Encryption complete');
    
    return result;
  } catch (error: any) {
    console.error('? Encryption failed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to encrypt data: ${error.message}`);
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
  // Convert base64 back to Uint8Array (using helper to avoid stack overflow)
  const iv = base64ToUint8Array(encryptedData.iv);
  const salt = base64ToUint8Array(encryptedData.salt);
  const dataBuffer = base64ToUint8Array(encryptedData.data);
    
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
