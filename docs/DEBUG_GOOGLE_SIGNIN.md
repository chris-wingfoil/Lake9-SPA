# Debug Guide: Google Sign-In Issues

## Quick Diagnostics Checklist

Run through these checks to identify the Google sign-in issue:

### 1. Check Firebase Console Configuration

#### ? Is Google Sign-In Enabled?
1. Go to: https://console.firebase.google.com/project/lake9-dev/authentication/providers
2. Verify **Google** provider is **Enabled**
3. Support email should be set

#### ? Are Authorized Domains Configured?
1. Go to: https://console.firebase.google.com/project/lake9-dev/authentication/settings
2. Under **Authorized domains**, verify these exist:
   - ? `localhost`
   - ? `lake9-dev.web.app`
   - ? `lake9-dev.firebaseapp.com`

### 2. Check Google Cloud Console (OAuth Configuration)

#### ? Is Drive API Enabled?
1. Go to: https://console.cloud.google.com/apis/library/drive.googleapis.com?project=lake9-dev
2. Status should show **"API enabled"**

#### ? Is OAuth Client Configured?
1. Go to: https://console.cloud.google.com/apis/credentials?project=lake9-dev
2. Find OAuth 2.0 Client ID (should be created by Firebase)
3. Click on it to edit
4. Verify **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:3000
   https://lake9-dev.web.app
   https://lake9-dev.firebaseapp.com
   ```
5. Verify **Authorized redirect URIs:**
   ```
   http://localhost:5173/__/auth/handler
   http://localhost:3000/__/auth/handler
   https://lake9-dev.web.app/__/auth/handler
   https://lake9-dev.firebaseapp.com/__/auth/handler
   ```

#### ? Is OAuth Consent Screen Configured?
1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=lake9-dev
2. Verify **App name** is set (e.g., "Lake9 SPA")
3. Verify **Support email** is set
4. Check **Scopes** include:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`

#### ? Are Test Users Added? (If app type is "External")
1. In OAuth Consent Screen settings
2. Under **Test users**, add your Google account email

### 3. Browser Console Debugging

#### Check Console Logs:
1. Open browser DevTools (F12)
2. Click "Sign In with Google"
3. Look for these log messages:

**Expected Flow:**
```
?? Starting sign-in redirect...
?? Redirecting to Google...
[Page redirects to Google]
[User signs in and grants permissions]
[Page redirects back]
?? Getting redirect result...
? Got redirect result: your@email.com
?? Access token: YES
?? Auth state changed: Signed in
```

**Common Error Messages:**

##### Error: "auth/unauthorized-domain"
```
Error: This domain (localhost:XXXX) is not authorized to run this operation
```
**Fix:** Add your localhost port to Firebase Authorized domains

##### Error: "auth/popup-blocked"
```
Error: The popup has been blocked by the browser
```
**Fix:** Already using redirect flow (not popups), should not occur

##### Error: "auth/operation-not-allowed"
```
Error: The identity provider configuration is not found
```
**Fix:** Enable Google Sign-In in Firebase Console

##### Error: "redirect_uri_mismatch"
```
Error: The redirect URI in the request does not match
```
**Fix:** Add redirect URIs to OAuth Client configuration

### 4. Common Fixes

#### Fix 1: Clear Cache and Cookies
```powershell
# In browser:
# 1. Open DevTools (F12)
# 2. Right-click refresh button ? "Empty Cache and Hard Reload"
# 3. Go to Application tab ? Clear all storage
```

#### Fix 2: Restart Dev Server
```powershell
# Stop server (Ctrl+C)
npm run dev
# Note the port number (e.g., 5173)
```

#### Fix 3: Update Firebase Config
Verify `config/firebase.ts` has correct values from Firebase Console:
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCYYrVwOSiIGbxosUBAsEmaSgYGoBrchUw",
  authDomain: "lake9-dev.firebaseapp.com",  // ? Must match!
  projectId: "lake9-dev",
  storageBucket: "lake9-dev.firebasestorage.app",
  messagingSenderId: "839377096508",
  appId: "1:839377096508:web:85509167012e4ca3871839"
};
```

#### Fix 4: Re-authenticate with Fresh Permissions
1. Sign out completely
2. Clear browser cache
3. Sign in again
4. **Important:** When Google prompts for permissions, make sure to:
   - ? Allow access to Google Drive
   - ? Allow profile information
   - ? Click "Allow" (not "Deny")

### 5. Test Sign-In Step by Step

#### Test 1: Basic Sign-In
```javascript
// In browser console after page loads:
console.log('Auth initialized:', !!getAuth());
```

#### Test 2: Trigger Sign-In
1. Click "Sign In with Google" button
2. Should redirect to Google sign-in page
3. If error appears immediately ? Check console logs

#### Test 3: After Redirect Back
1. After signing in at Google, you'll be redirected back
2. Check console for redirect result logs
3. User info should appear in header

### 6. Manual Test Commands

Run these in browser console to debug:

```javascript
// Check if Firebase is initialized
console.log('Firebase app:', app);

// Check auth instance
import { getAuth } from 'firebase/auth';
const auth = getAuth();
console.log('Auth:', auth);
console.log('Current user:', auth.currentUser);

// Check if user is signed in
console.log('Signed in:', !!auth.currentUser);
```

### 7. Network Tab Debugging

1. Open DevTools ? Network tab
2. Click "Sign In with Google"
3. Look for requests to:
   - `identitytoolkit.googleapis.com` - Firebase Auth API
   - `accounts.google.com` - Google sign-in
   - `securetoken.googleapis.com` - Token exchange

**Check for HTTP errors:**
- **400**: Bad request - usually config issue
- **401**: Unauthorized - API key or OAuth issue
- **403**: Forbidden - Missing permissions or scopes
- **404**: Not found - Wrong endpoint or project ID

### 8. Verify Environment

#### Check Dev Server Port:
When you run `npm run dev`, note the port (usually 5173 or 3000)

#### Update OAuth Client if Port Changed:
If your dev server uses a different port, add it to OAuth Client:
1. Go to OAuth Client settings in Google Cloud Console
2. Add `http://localhost:YOUR_PORT` to Authorized JavaScript origins
3. Add `http://localhost:YOUR_PORT/__/auth/handler` to Authorized redirect URIs

---

## Still Not Working?

### Collect Debug Information:

1. **Browser Console Logs**
   - Copy all error messages
   - Look for red error text

2. **Network Tab**
   - Check for failed requests
   - Copy error response bodies

3. **Firebase Console Errors**
   - Go to: https://console.firebase.google.com/project/lake9-dev/authentication/users
   - Check if any error banners appear

4. **Current Configuration**
   - Take screenshot of OAuth Client settings
   - Take screenshot of Firebase Authorized domains
   - Take screenshot of OAuth Consent Screen scopes

### Common Root Causes:

1. **OAuth Client not configured** ? Follow Step 2 above
2. **Missing test user** ? Add your email to test users (if External app)
3. **Wrong redirect URI** ? Must match exactly including port
4. **Drive API not enabled** ? Enable in Google Cloud Console
5. **Cached auth state** ? Clear browser cache completely
6. **App in review mode** ? Add yourself as test user

---

## Quick Fix Script

Run this to reset everything:

```powershell
# Stop dev server
# Press Ctrl+C

# Clear node modules and reinstall (optional, if dependencies issue)
# rm -r node_modules
# npm install

# Restart dev server
npm run dev

# In browser:
# 1. Clear all cookies and cache for localhost
# 2. Go to Application tab ? Storage ? Clear site data
# 3. Refresh page
# 4. Try sign-in again
```

---

## Success Criteria

You'll know it's working when you see:

1. ? Click "Sign In with Google"
2. ? Redirects to Google sign-in page
3. ? Shows permissions request (Drive access)
4. ? Redirects back to your app
5. ? User photo and name appear in header
6. ? Console shows "Auth state changed: Signed in"
7. ? Console shows "Access token: YES"

---

## Additional Resources

- [Firebase Auth Setup](./FIREBASE_AUTH_SETUP.md)
- [OAuth Security Setup](./OAUTH_SECURITY_SETUP.md)
- [Drive Troubleshooting](./TROUBLESHOOTING_DRIVE.md)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth/web/google-signin)
- [OAuth 2.0 Debugging](https://developers.google.com/identity/protocols/oauth2/web-server#handlingresponse)
