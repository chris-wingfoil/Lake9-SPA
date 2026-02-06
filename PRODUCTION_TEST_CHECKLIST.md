# Production Sign-In Test Checklist

## ?? Your Live App: https://lake9-dev.web.app

---

## Quick Test (2 minutes):

### 1. Open Live Site
```
https://lake9-dev.web.app
```

### 2. Test Sign-In
1. Click **"Sign In with Google"**
2. Allow popups if blocked
3. Sign in with Google account
4. Grant permissions
5. Verify user info appears in header

### Expected Result:
- ? Popup opens
- ? Google sign-in works
- ? Popup closes
- ? User photo/name in header
- ? Console shows success logs

---

## If Sign-In Fails:

### Error: "auth/unauthorized-domain"

**Quick Fix:**
1. Go to: https://console.firebase.google.com/project/lake9-dev/authentication/settings
2. Scroll to "Authorized domains"
3. Verify these exist:
   - ? `lake9-dev.web.app`
   - ? `lake9-dev.firebaseapp.com`
4. If missing, click "Add domain" and add them
5. Wait 1-2 minutes
6. Try sign-in again

### Error: Popup blocked

**Quick Fix:**
1. Click popup blocked icon in browser address bar
2. Allow popups for `lake9-dev.web.app`
3. Try sign-in again

### Error: OAuth error / "redirect_uri_mismatch"

**Quick Fix:**
1. Go to: https://console.cloud.google.com/apis/credentials?project=lake9-dev
2. Click your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins:**
   ```
   https://lake9-dev.web.app
   https://lake9-dev.firebaseapp.com
   ```
4. Click Save
5. Wait 1-2 minutes
6. Try sign-in again

---

## Test Art Generation:

1. Sign in (if not already)
2. Upload stock data or use Google Drive
3. Click "Process"
4. Verify AI generates art
5. Check console for any errors

---

## Test Drive Sync:

1. Sign in with Google
2. Generate some art
3. Click "Sync to Google Drive"
4. Save encryption key popup
5. Check Google Drive for folder: `Lake9_Encrypted_Art`
6. Verify encrypted file exists

---

## Console Logs to Check:

Open browser DevTools (F12) ? Console:

**Good signs:**
```
?? Starting sign-in with popup...
? Popup sign-in successful: your@email.com
?? Access token: YES
?? Auth state changed: Signed in
```

**Bad signs:**
```
? Sign-in error: auth/...
```

Copy the error code and check the fix guide above.

---

## Browser Compatibility:

Test on:
- ? Chrome/Edge (latest)
- ? Firefox (latest)
- ? Safari (latest)

All should support popup authentication.

---

## Mobile Testing:

On mobile devices:
- Popup becomes a redirect (handled by Firebase Auth automatically)
- Should still work fine
- Test on iPhone Safari and Android Chrome

---

## Performance Check:

Open DevTools ? Network tab:
- Check page load time
- Verify assets load from Firebase CDN
- Check for any 404 errors

---

## Firebase Console Monitoring:

### Check Function Logs:
1. Go to: https://console.firebase.google.com/project/lake9-dev/functions
2. Click on `generateArt` function
3. Click "Logs" tab
4. Test art generation
5. Verify logs show successful execution

### Check Authentication Users:
1. Go to: https://console.firebase.google.com/project/lake9-dev/authentication/users
2. After signing in, verify your user appears
3. Check user UID, email, sign-in method

### Check Hosting:
1. Go to: https://console.firebase.google.com/project/lake9-dev/hosting
2. Verify latest deployment timestamp
3. Check deployment history

---

## Success Criteria:

You're good to go if:
- [x] Live site loads
- [x] Sign-in popup opens
- [x] Google authentication works
- [x] User info displays after sign-in
- [x] Art generation works
- [x] Drive sync works (if testing)
- [x] No console errors
- [x] Mobile testing passed

---

## Need Help?

Check these docs:
- **Deployment Summary:** `DEPLOYMENT_COMPLETE.md`
- **Sign-In Debug:** `docs/DEBUG_GOOGLE_SIGNIN.md`
- **OAuth Setup:** `docs/OAUTH_SECURITY_SETUP.md`
- **Drive Troubleshooting:** `docs/TROUBLESHOOTING_DRIVE.md`

---

**Test now: https://lake9-dev.web.app** ??
