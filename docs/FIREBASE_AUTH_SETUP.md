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

## Step 5: Configure OAuth Client for Secure Flow

**Important:** Firebase Auth requires proper OAuth client configuration for security.

### 5.1 Navigate to Credentials
1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials?project=lake9-dev)
2. Find your OAuth 2.0 Client ID (created by Firebase)
   - Look for client ID starting with your project number
   - Or create new: Click **"+ CREATE CREDENTIALS"** ? **"OAuth client ID"**

### 5.2 Configure OAuth Client
1. **Application type:** Select **"Web application"**
2. **Name:** "Lake9 SPA Web Client" (or keep Firebase default)
3. **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   https://lake9-dev.web.app
   https://lake9-dev.firebaseapp.com
   ```
4. **Authorized redirect URIs:**
   ```
   http://localhost:5173/__/auth/handler
   https://lake9-dev.web.app/__/auth/handler
   https://lake9-dev.firebaseapp.com/__/auth/handler
   ```
5. Click **"Save"**

### 5.3 Configure OAuth Consent Screen
1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent?project=lake9-dev)
2. **User Type:** Select **"External"** (for testing) or **"Internal"** (if using Google Workspace)
3. **Application Information:**
   - App name: **"Lake9 SPA"**
   - Support email: Your email
   - App logo: (optional)
4. **Developer contact:** Your email
5. Click **"Save and Continue"**

### 5.4 Add Scopes
1. Click **"Add or Remove Scopes"**
2. Add these scopes:
   - ? `https://www.googleapis.com/auth/drive.file` - Create and access app files in Drive
   - ? `https://www.googleapis.com/auth/userinfo.profile` - User profile info
   - ? `https://www.googleapis.com/auth/userinfo.email` - User email
3. Click **"Update"** ? **"Save and Continue"**

### 5.5 Add Test Users (for External apps)
1. Click **"Add Users"**
2. Add your Google account email(s) for testing
3. Click **"Save and Continue"**

### 5.6 Review and Publish (Optional)
- For **Testing:** Leave as is, only test users can access
- For **Production:** Complete app verification (required for public use)

**Note:** Firebase Auth handles PKCE automatically for public clients, so the warning should resolve once OAuth client is properly configured.

## Step 6: Test Authentication ?

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

## Step 7: Production Deployment

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

### "OAuth Configuration Warning: Unconfigured to use secure OAuth flows"
This warning appears when OAuth client isn't properly configured. Follow **Step 5** above to:
- Set application type to "Web application"
- Add authorized JavaScript origins
- Add authorized redirect URIs (Firebase uses `/__/auth/handler`)
- Configure OAuth consent screen with proper scopes

**Note:** Firebase Auth automatically uses secure flows (popup/redirect with token exchange), but the OAuth client must be configured correctly.

### "Google hasn't verified this app"
- Normal for testing. Click "Advanced" ? "Go to lake9-dev (unsafe)"
- For production, complete OAuth app verification

### "Access blocked: Authorization Error"
- Ensure Drive API is enabled in Google Cloud Console
- Check OAuth consent screen scopes are added

### "This app is blocked"
- Add your email to test users in OAuth consent screen
- Or publish app (requires verification)
