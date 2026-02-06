# ?? Quick Fix: Google Sign-In Not Working

## Try These in Order:

### 1?? Check if Google Sign-In is Enabled (30 seconds)
1. Go to: https://console.firebase.google.com/project/lake9-dev/authentication/providers
2. Find "Google" in the list
3. Make sure it's **Enabled** (toggle should be ON)
4. Click Save if you changed anything

---

### 2?? Check Authorized Domains (1 minute)
1. Go to: https://console.firebase.google.com/project/lake9-dev/authentication/settings
2. Scroll to "Authorized domains"
3. Make sure these are in the list:
   - ? `localhost`
   - ? `lake9-dev.web.app`
   - ? `lake9-dev.firebaseapp.com`
4. If `localhost` is missing, click **Add domain** and add it

---

### 3?? Run the Diagnostic Test (2 minutes)
1. Start your dev server:
   ```powershell
   npm run dev
   ```
2. Open: `http://localhost:5173/test-google-signin.html`
3. Look at the checklist - what's failing?
4. Click "Test Google Sign-In" button
5. Read the error message

---

### 4?? Common Error Messages & Fixes

#### ? "auth/unauthorized-domain"
? Go back to Step 2??, add `localhost`

#### ? "auth/operation-not-allowed"  
? Go back to Step 1??, enable Google Sign-In

#### ? "redirect_uri_mismatch"
? Configure OAuth Client:
1. Go to: https://console.cloud.google.com/apis/credentials?project=lake9-dev
2. Click on your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   http://localhost:5173/__/auth/handler
   ```
4. Add to **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   ```
5. Click Save

#### ? "This app is blocked"
? Configure OAuth Consent Screen:
1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=lake9-dev
2. Complete the form (app name, support email)
3. Add Scopes:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/userinfo.profile`
4. Add your email to Test Users (if External app)
5. Save

---

### 5?? Clear Cache & Try Again (1 minute)
1. In browser: Press `Ctrl+Shift+Delete`
2. Select "All time"
3. Check "Cookies" and "Cached images and files"
4. Click "Clear data"
5. Restart dev server
6. Try sign-in again

---

### 6?? Check Browser Console (30 seconds)
1. Press `F12` to open DevTools
2. Click "Console" tab
3. Click "Sign In with Google"
4. Look for messages starting with ?? or ?
5. Read the error message carefully

---

## Success! ?

You'll know it works when:
1. Click "Sign In with Google"
2. Browser redirects to Google
3. You see permissions request
4. Browser redirects back
5. Your photo/name appears in header
6. Console shows: `? Got redirect result`

---

## Still stuck?

1. Open `test-google-signin.html` in your browser
2. Copy all the console logs
3. Take screenshots of any errors
4. Check `docs/DEBUG_SUMMARY.md` for detailed help
5. Check `docs/DEBUG_GOOGLE_SIGNIN.md` for complete guide

---

## Critical Checklist:

Before asking for help, verify:
- [ ] Google Sign-In is **Enabled** in Firebase Console
- [ ] `localhost` is in **Authorized domains**
- [ ] OAuth Client has redirect URIs configured
- [ ] OAuth Consent Screen is completed
- [ ] Test user is added (if External app)
- [ ] Browser cache is cleared
- [ ] Dev server is running on correct port
- [ ] Browser console shows error code (not just "failed")

---

## The Fastest Fix (Usually):

**80% of issues are one of these:**

1. **Missing `localhost` in authorized domains**
   - Fix: Firebase Console ? Authentication ? Settings ? Add domain

2. **OAuth Client not configured**
   - Fix: Cloud Console ? Credentials ? Add redirect URIs

3. **Missing test user (External app)**
   - Fix: OAuth Consent Screen ? Add your email to test users

**Try these three first!** ?
