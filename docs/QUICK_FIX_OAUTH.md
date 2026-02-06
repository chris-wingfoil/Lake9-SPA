# Quick Fix: OAuth Security Warning

## ?? Problem
Google Cloud Console shows: **"unconfigured to use secure OAuth flows"**

## ? Solution (5 minutes)

### Step 1: Open OAuth Client Settings
1. Go to: https://console.cloud.google.com/apis/credentials?project=lake9-dev
2. Find your OAuth 2.0 Client ID (created by Firebase)
3. Click the pencil ?? icon to edit

### Step 2: Configure Settings

**Application type:**
```
Select: Web application
```

**Authorized JavaScript origins:**
```
http://localhost:5173
https://lake9-dev.web.app
https://lake9-dev.firebaseapp.com
```

**Authorized redirect URIs:**
```
http://localhost:5173/__/auth/handler
https://lake9-dev.web.app/__/auth/handler
https://lake9-dev.firebaseapp.com/__/auth/handler
```

Click **SAVE** ?

### Step 3: Configure OAuth Consent Screen
1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=lake9-dev
2. Fill in basic info:
   - App name: **Lake9 SPA**
   - Support email: **Your email**
3. Add scopes:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`
4. Add test users (your Google account)
5. Click **SAVE AND CONTINUE**

### Step 4: Test
```bash
npm run dev
```
- Click "Sign In with Google"
- Warning should be gone! ?

---

## ?? Detailed Guide
See: `docs/OAUTH_SECURITY_SETUP.md` for complete explanation

## ?? Why This Matters
- Proper OAuth configuration prevents security vulnerabilities
- Firebase Auth uses secure flows, but OAuth client must be configured
- Ensures proper redirect URI validation
- Enables PKCE for public clients (SPAs)

## ?? Note
Firebase Auth handles security automatically - you just need to configure the OAuth client settings correctly in Google Cloud Console.
