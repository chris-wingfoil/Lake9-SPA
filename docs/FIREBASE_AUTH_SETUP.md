# Firebase Authentication Setup Guide

## Step 1: Enable Google Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/project/lake9-dev/authentication/providers)
2. Click on **"Sign-in method"** tab
3. Click **"Google"** provider
4. Toggle **"Enable"** to ON
5. Set **Support email**: (your email)
6. Click **"Save"**

## Step 2: Get Web App Credentials

1. Go to [Project Settings](https://console.firebase.google.com/project/lake9-dev/settings/general)
2. Scroll down to **"Your apps"** section
3. Click the **Web app** icon (</>) if not already added
4. Copy the **firebaseConfig** object

**Update `config/firebase.ts` with your actual values:**
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "lake9-dev.firebaseapp.com",
  projectId: "lake9-dev",
  storageBucket: "lake9-dev.appspot.com",
  messagingSenderId: "839377096508",
  appId: "YOUR_APP_ID"
};
```

## Step 3: Configure Authorized Domains

1. Go to [Authentication Settings](https://console.firebase.google.com/project/lake9-dev/authentication/settings)
2. Scroll to **"Authorized domains"**
3. Ensure these domains are added:
   - ? `lake9-dev.web.app`
   - ? `lake9-dev.firebaseapp.com`
   - ? `localhost` (for development)

## Step 4: Enable Drive API in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/drive.googleapis.com?project=lake9-dev)
2. Click **"Enable"** for Google Drive API
3. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent?project=lake9-dev)
4. Add scopes:
   - ? `https://www.googleapis.com/auth/drive.file` (Create and access files in Drive)
   - ? `https://www.googleapis.com/auth/userinfo.profile` (User profile info)

## Step 5: Test Authentication ?

### All Implementation Complete!

The following has been implemented:

#### Services Created:
- ? `services/authService.ts` - Google Sign-In with Drive scope
- ? `services/encryptionService.ts` - Client-side AES-GCM encryption
- ? `services/driveService.ts` - Google Drive API integration
- ? `services/storageService.ts` - Combined encryption + Drive upload
- ? `contexts/AuthContext.tsx` - React auth state management

#### UI Integration:
- ? `components/Layout.tsx` - Sign In/Out button with user display
- ? `components/ArtPreview.tsx` - "Sync to Google Drive" button with encryption

### Test the Flow:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test Authentication:**
   - Click "Sign In with Google"
   - Authorize Lake9 app
   - Grant Drive API access
   - Verify user info shows in header

3. **Test Drive Sync:**
   - Generate some art
   - Click "Sync to Google Drive"
   - **SAVE THE ENCRYPTION KEY!**
   - Verify file in Google Drive folder: `Lake9_Encrypted_Art`

4. **Verify Privacy:**
   - Open browser DevTools ? Network tab
   - Check Drive upload - data is encrypted JSON
   - Open file in Drive - verify it's unreadable encrypted data

### Privacy Architecture:

```
User Browser ? Encrypt Data ? Upload to User's Drive
     ?              ?                    ?
  Key stays    AES-GCM 256-bit    Encrypted JSON
  in memory      client-side         stored
```

**Privacy Guarantees:**
- ? Encryption keys never leave browser
- ? Server never sees unencrypted data
- ? User owns all data in their Drive
- ? End-to-end encrypted

See `docs/PRIVACY_ARCHITECTURE.md` for detailed documentation.

## Step 6: Production Deployment

1. Run locally: `npm run dev`
2. Click **"Sign In with Google"**
3. Authorize Drive access
4. Verify user info appears in header

## Privacy Architecture

```
User Browser
    ?
[Sign In] ? Firebase Auth ? Google OAuth
    ?
[Access Token] ? Stored in browser (never sent to server)
    ?
[Drive API] ? Direct from browser to user's Drive
    ?
[Encrypted Data] ? Stored in user's Drive (E2E encrypted)
```

**Key Privacy Features:**
- ? Access tokens stay in browser
- ? Server never touches user's Drive
- ? User controls all data
- ? End-to-end encryption
- ? Portable (data lives in user's Drive)

## Troubleshooting

### "Google hasn't verified this app"
- Normal for testing. Click "Advanced" ? "Go to lake9-dev (unsafe)"
- For production, complete OAuth app verification

### "Access blocked: Authorization Error"
- Ensure Drive API is enabled in Google Cloud Console
- Check OAuth consent screen scopes are added

### "This app is blocked"
- Add your email to test users in OAuth consent screen
- Or publish app (requires verification)
