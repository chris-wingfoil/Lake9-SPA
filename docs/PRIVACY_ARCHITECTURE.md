# Privacy-First Architecture

## Overview

Lake9 SPA implements a **privacy-first, client-side encryption** architecture that ensures:
- ? **Encryption keys never leave the browser**
- ? **Server never sees unencrypted data**
- ? **User owns and controls all data in their Google Drive**
- ? **Portable - data can be downloaded anytime**

---

## Architecture Flow

```
???????????????????????????????????????????????????????????????
?                         BROWSER                             ?
?                                                             ?
?  1. User Signs In                                          ?
?     ??? Firebase Auth (Google OAuth + Drive scope)        ?
?         ??? Access Token stored in memory (never persisted)?
?                                                             ?
?  2. Generate Art                                           ?
?     ??? Firebase Function (secure proxy to Gemini AI)     ?
?         ??? Returns AI-generated art result                ?
?                                                             ?
?  3. Client-Side Encryption                                 ?
?     ??? Web Crypto API (AES-GCM 256-bit)                  ?
?         ??? Generate random encryption key                 ?
?         ??? Encrypt art data                               ?
?         ??? Key stays in browser memory only               ?
?                                                             ?
?  4. Upload to User's Drive                                 ?
?     ??? Direct browser ? Google Drive API                  ?
?         ??? Using user's OAuth token                       ?
?         ??? Upload encrypted JSON file                     ?
?         ??? Server NEVER sees this data                    ?
?                                                             ?
???????????????????????????????????????????????????????????????
```

---

## Security Components

### 1. **Firebase Authentication**
- **File:** `services/authService.ts`
- **Purpose:** Google OAuth with Drive API scope
- **Scopes:**
  - `https://www.googleapis.com/auth/drive.file` - Access to app-created files only
  - `https://www.googleapis.com/auth/userinfo.profile` - Basic profile info

**Privacy Feature:** Access token stored in memory only, cleared on sign-out

---

### 2. **Client-Side Encryption**
- **File:** `services/encryptionService.ts`
- **Algorithm:** AES-GCM (256-bit)
- **Key Derivation:** PBKDF2 with 100,000 iterations

#### Functions:
- `encryptData(data, password)` - Encrypt data with user's password
- `decryptData(encryptedData, password)` - Decrypt data
- `generateSecurePassword()` - Generate random encryption key

**Privacy Features:**
- Encryption happens entirely in browser
- Password/key never sent to any server
- Random salt and IV for each encryption

#### Encrypted Data Format:
```typescript
{
  iv: string,      // Initialization vector (base64)
  data: string,    // Encrypted data (base64)
  salt: string     // Salt for key derivation (base64)
}
```

---

### 3. **Google Drive Service**
- **File:** `services/driveService.ts`
- **Purpose:** Direct client-to-Drive communication

#### Functions:
- `uploadEncryptedFile()` - Upload encrypted file to Drive
- `downloadFile()` - Download encrypted file from Drive
- `listFiles()` - List user's encrypted files
- `findOrCreateFolder()` - Manage Lake9 folder in Drive

**Privacy Features:**
- Direct browser ? Drive API calls
- No server intermediary
- Files stored in user's own Drive account

---

### 4. **Storage Service (Orchestration)**
- **File:** `services/storageService.ts`
- **Purpose:** Combine encryption + Drive upload

#### Functions:
- `saveArtToPrivateDrive(artResult, password?)` - Encrypt and upload
- `loadArtFromPrivateDrive(fileId, password)` - Download and decrypt
- `listSavedArt()` - List all Lake9 encrypted files

**Privacy Features:**
- All operations happen client-side
- Auto-generates encryption key if not provided
- Returns encryption key to user (must be saved!)

---

## Privacy Guarantees

### What Lake9 CAN'T See:
? User's encryption keys  
? Unencrypted art data  
? Files in user's Google Drive  
? Decrypted content  

### What Lake9 CAN See:
? Firebase Authentication (email, name, photo)  
? API requests to generate art (through Firebase Functions)  
? Usage analytics (if implemented)  

### What Google CAN See:
? Encrypted files in user's Drive  
? Contents of encrypted files (can't decrypt without user's key)  

---

## User Workflow

### Saving Art:
1. User generates art using AI
2. User clicks "Sync to Google Drive"
3. System encrypts data with random key
4. System uploads encrypted file to user's Drive
5. User receives encryption key (MUST SAVE IT!)

### Loading Art:
1. User browses saved files
2. User selects file to load
3. User enters encryption key
4. System downloads encrypted file
5. System decrypts with user's key
6. Art displayed

---

## Security Best Practices

### For Users:
- ? **Save encryption keys securely** (password manager recommended)
- ? **Don't share encryption keys** (even with Lake9 support)
- ?? **Lost keys = lost data** (no recovery possible)

### For Developers:
- ? **Never log encryption keys**
- ? **Never send keys to server**
- ? **Use HTTPS only**
- ? **Validate all inputs**
- ? **Regular security audits**

---

## Future Enhancements

### Planned:
- [ ] Key management with browser local storage (encrypted)
- [ ] Shared encryption (multi-user access)
- [ ] Export/import encryption keys
- [ ] Backup key to user's email (encrypted with password)
- [ ] Progressive Web App (PWA) for offline access

### Under Consideration:
- [ ] Hardware security key support (WebAuthn)
- [ ] Zero-knowledge proof authentication
- [ ] Blockchain-based key recovery

---

## Testing Privacy

### Manual Test:
1. Sign in and generate art
2. Save to Drive with encryption
3. Open browser DevTools ? Network tab
4. Verify no unencrypted data in requests
5. Open Google Drive and view file
6. Verify file is encrypted JSON

### Automated Tests (TODO):
- [ ] Encryption/decryption roundtrip
- [ ] Token management
- [ ] Drive API integration
- [ ] Error handling

---

## Compliance

### GDPR Compliant:
- ? User owns their data
- ? Right to be forgotten (user can delete Drive files)
- ? Data portability (user can export encrypted files)
- ? Transparent data processing

### HIPAA Ready:
- ? End-to-end encryption
- ? Access controls
- ?? Would need additional audit logging for full compliance

---

## Support

For security questions or bug reports:
- GitHub Issues: [Lake9-SPA](https://github.com/chris-wingfoil/Lake9-SPA)
- Email: security@lake9.com (for security vulnerabilities only)

**Remember:** Lake9 support CANNOT help recover lost encryption keys!
