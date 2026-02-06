# Troubleshooting Drive Sync Issues

## Common Issues & Solutions

### ? "No access token available"

**Problem:** The access token from Google sign-in wasn't cached properly.

**Solution:**
1. **Sign out** completely (click "Sign Out" button)
2. **Sign in again** with Google
3. When prompted, **make sure to grant Drive permissions**
4. Try syncing to Drive again

**Why this happens:**
- Page refresh clears the cached access token
- Access token is only obtained during the sign-in flow
- Must re-authenticate after page refresh

---

### ? "Drive upload failed: 403"

**Problem:** Drive API not enabled or OAuth not configured properly.

**Check:**
1. **Drive API enabled?**
   - Go to: https://console.cloud.google.com/apis/library/drive.googleapis.com?project=lake9-dev
   - Click **Enable** if not already enabled

2. **OAuth scopes configured?**
   - Go to: https://console.cloud.google.com/apis/credentials/consent?project=lake9-dev
   - Ensure `https://www.googleapis.com/auth/drive.file` is in scopes

3. **Test user added?**
   - If using External app type, add your email to test users

---

### ? "Failed to sync to Google Drive"

**Debug Steps:**

1. **Open Browser Console** (F12)
2. **Try syncing to Drive**
3. **Check console logs:**
   ```
   ?? Getting access token...
   ? Access token retrieved: YES/NO
   ```

4. **If "NO" - Sign out and sign in again**
5. **If "YES" - Check network tab for API errors**

---

## Step-by-Step Fix

### 1. Clear Everything
```powershell
# Stop dev server (Ctrl+C)
# Clear browser cache and cookies for localhost
```

### 2. Restart Dev Server
```powershell
cd D:\2020_VS\Lake9_SPA_Repo
npm run dev
```

### 3. Fresh Sign-In
1. Open http://localhost:3000
2. Click "Sign Out" if already signed in
3. Click "Sign In with Google"
4. **Important:** When Google asks for permissions:
   - ? Check "See and download all your Google Drive files"
   - OR "Create and access files in Google Drive"
5. Click "Allow"

### 4. Test Drive Sync
1. Generate some art
2. Click "Sync to Google Drive"
3. Should work now! ?

---

## Verify OAuth Configuration

### Check OAuth Client:
1. Go to: https://console.cloud.google.com/apis/credentials?project=lake9-dev
2. Find your OAuth 2.0 Client ID
3. Verify:
   - **Application type:** Web application ?
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` ?
     - `http://localhost:5173` ?
   - **Authorized redirect URIs:**
     - `http://localhost:3000/__/auth/handler` ?
     - `http://localhost:5173/__/auth/handler` ?

### Check OAuth Consent Screen:
1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=lake9-dev
2. Verify scopes include:
   - `https://www.googleapis.com/auth/drive.file` ?
   - `https://www.googleapis.com/auth/userinfo.profile` ?
   - `https://www.googleapis.com/auth/userinfo.email` ?

---

## Console Debugging

### Check Access Token:
Open browser console and run:
```javascript
// Check if signed in
console.log('Signed in:', !!window.firebase?.auth()?.currentUser);

// This won't work directly but helps debug
localStorage.getItem('firebase:authUser')
```

### Expected Console Output (Success):
```
Starting Drive sync...
?? Getting access token...
? Access token retrieved: YES
? Access token retrieved
?? Encrypting art data...
? Encryption complete
?? Finding Lake9 folder in Google Drive...
? Folder ready: abc123xyz
?? Uploading encrypted data to Drive...
? Art saved successfully!
```

### Expected Console Output (Needs Re-Auth):
```
Starting Drive sync...
?? Getting access token...
?? No cached access token - user must sign in again
? Failed to save art to Drive: Error: User not authenticated...
```

---

## Still Not Working?

### 1. Check Network Tab
- Open DevTools ? Network tab
- Try syncing to Drive
- Look for requests to `googleapis.com/drive`
- Check response status:
  - **401:** Authentication failed
  - **403:** Permission denied (Drive API or OAuth issue)
  - **404:** Endpoint not found
  - **500:** Server error

### 2. Verify Firebase Config
Check `config/firebase.ts` has correct values:
```typescript
apiKey: "AIzaSyCYYrVwOSiIGbxosUBAsEmaSgYGoBrchUw" ?
authDomain: "lake9-dev.firebaseapp.com" ?
projectId: "lake9-dev" ?
```

### 3. Try Different Port
If using `localhost:3000`, OAuth might be configured for `:5173`:
```powershell
# Check vite.config.ts or start with specific port
npm run dev -- --port 3000
```

---

## Quick Test Script

Run this in browser console after signing in:
```javascript
// Test if we can get access token
const testAuth = async () => {
  const auth = (await import('./services/authService.js')).getDriveAccessToken;
  const token = await auth();
  console.log('Access Token:', token ? '? FOUND' : '? NOT FOUND');
};
testAuth();
```

---

## Need Help?

1. **Check browser console** - Most errors show there
2. **Check all steps above** - Usually it's OAuth config or re-auth needed
3. **Open GitHub issue** with:
   - Console error messages
   - Network tab screenshots
   - Steps you've tried

**Remember:** Access tokens are only obtained during sign-in. If you refreshed the page, you need to sign in again!
