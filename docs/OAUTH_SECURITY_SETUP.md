# OAuth Security Configuration Guide

## Why This Warning Appears

Google Cloud Console shows "unconfigured to use secure OAuth flows" when:
1. OAuth client type isn't set to "Web application"
2. Authorized redirect URIs aren't configured
3. JavaScript origins aren't specified
4. OAuth consent screen is incomplete

## Firebase Auth Security Model

Firebase Authentication for web apps uses **secure OAuth flows** by default:

### What Firebase Does Automatically:
? **Token Exchange:** Handles authorization code flow  
? **Secure Storage:** Manages tokens securely  
? **PKCE Support:** Implements Proof Key for Code Exchange  
? **Token Refresh:** Automatically refreshes expired tokens  

### What You Must Configure:
?? **OAuth Client:** Set up in Google Cloud Console  
?? **Redirect URIs:** Firebase-specific handler paths  
?? **JavaScript Origins:** Your app domains  
?? **Consent Screen:** Scopes and app information  

---

## Step-by-Step Fix

### 1. Find Your OAuth Client

**Option A: Find Existing Firebase Client**
1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials?project=lake9-dev)
2. Look for OAuth 2.0 Client ID created by Firebase
   - Usually named: "Web client (auto created by Google Service)"
   - Client ID starts with your project number
3. Click the pencil icon to edit

**Option B: Create New OAuth Client**
1. Click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth client ID"**
3. Continue with configuration below

---

### 2. Configure OAuth Client Settings

#### Application Type:
```
? Web application
? Desktop app
? Mobile app
```

#### Name:
```
Lake9 SPA Web Client
```

#### Authorized JavaScript Origins:
```
http://localhost:5173
http://localhost:3000
https://lake9-dev.web.app
https://lake9-dev.firebaseapp.com
```

**Why?** Firebase Auth runs in browser and needs to make API calls from these origins.

#### Authorized Redirect URIs:
```
http://localhost:5173/__/auth/handler
http://localhost:3000/__/auth/handler
https://lake9-dev.web.app/__/auth/handler
https://lake9-dev.firebaseapp.com/__/auth/handler
```

**Why?** Firebase Auth uses `/__/auth/handler` to complete OAuth flow securely.

---

### 3. Configure OAuth Consent Screen

#### Basic Information:
| Field | Value |
|-------|-------|
| **User Type** | External (for public) or Internal (Google Workspace) |
| **App Name** | Lake9 SPA |
| **Support Email** | Your email |
| **Developer Contact** | Your email |

#### Scopes to Add:
```
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/userinfo.profile
https://www.googleapis.com/auth/userinfo.email
```

**Scope Descriptions:**
- `drive.file` - Create and access only files created by this app
- `userinfo.profile` - User's name and profile photo
- `userinfo.email` - User's email address

#### Test Users (for External apps):
Add your Google account(s) for testing before app verification.

---

### 4. Update Firebase Config (if needed)

Your `config/firebase.ts` should have the correct OAuth client settings:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // From Firebase Console
  authDomain: "lake9-dev.firebaseapp.com",  // Must match redirect URI domain
  projectId: "lake9-dev",
  storageBucket: "lake9-dev.appspot.com",
  messagingSenderId: "839377096508",
  appId: "YOUR_APP_ID"
};
```

**Important:** `authDomain` must match one of your authorized redirect URI domains.

---

## Security Best Practices

### ? DO:
- Use `Web application` type for browser-based apps
- Add only necessary origins and redirect URIs
- Use HTTPS in production (HTTP localhost OK for dev)
- Request minimal OAuth scopes
- Keep Firebase SDK updated
- Add only trusted test users during development

### ? DON'T:
- Use `Desktop app` or `Mobile app` type for web apps
- Add wildcard redirect URIs (`*`)
- Expose client secrets in browser code (Firebase handles this)
- Request more scopes than needed
- Share OAuth client IDs publicly

---

## Verify Configuration

### Test OAuth Flow:
1. Start your app: `npm run dev`
2. Open browser DevTools ? Network tab
3. Click "Sign In with Google"
4. Check network requests:
   - Should see redirect to `accounts.google.com`
   - Then redirect back to `/__/auth/handler`
   - No errors in console
5. User should be signed in successfully

### Check for Warnings:
1. Open [Google Cloud Console > APIs & Services](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth client
3. Warning should be gone if configured correctly

---

## Understanding the Flows

### What Happens During Sign-In:

```
1. User clicks "Sign In with Google"
   ?
2. Firebase opens popup/redirect to accounts.google.com
   ?
3. User grants permissions
   ?
4. Google redirects to: your-app.com/__/auth/handler
   ?
5. Firebase exchanges authorization code for tokens (server-side)
   ?
6. Firebase returns ID token and access token to browser
   ?
7. Tokens stored securely by Firebase SDK
   ?
8. User is signed in!
```

### Security Features:

**PKCE (Proof Key for Code Exchange):**
- Firebase automatically generates code verifier
- Prevents authorization code interception
- Required for public clients (SPAs)

**Token Security:**
- Access tokens stored in memory only
- ID tokens used for Firebase Authentication
- Refresh tokens managed by Firebase
- Tokens never exposed in URLs

**State Parameter:**
- Firebase includes state parameter
- Prevents CSRF attacks
- Validates redirect came from your app

---

## Common Issues & Solutions

### Issue: "redirect_uri_mismatch"
**Cause:** Redirect URI not in authorized list  
**Fix:** Add exact URI to OAuth client configuration  
**Example:** `http://localhost:5173/__/auth/handler`

### Issue: "access_denied"
**Cause:** User not in test users list (External app)  
**Fix:** Add user email to OAuth consent screen test users

### Issue: "invalid_client"
**Cause:** OAuth client ID mismatch  
**Fix:** Ensure Firebase config has correct client ID

### Issue: "origin_mismatch"
**Cause:** JavaScript origin not authorized  
**Fix:** Add your app's origin to OAuth client

---

## Production Checklist

Before going live:

- [ ] OAuth client configured as "Web application"
- [ ] Production domains added to authorized origins
- [ ] Production redirect URIs added
- [ ] OAuth consent screen completed
- [ ] App logo uploaded (optional but recommended)
- [ ] Privacy policy URL added
- [ ] Terms of service URL added (if applicable)
- [ ] App verification submitted to Google (for public apps)
- [ ] Test users can successfully sign in
- [ ] No security warnings in Google Cloud Console

---

## Additional Resources

- [Firebase Auth Setup](./FIREBASE_AUTH_SETUP.md)
- [Privacy Architecture](./PRIVACY_ARCHITECTURE.md)
- [Google OAuth Best Practices](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth/web/google-signin)

---

**Note:** Firebase Auth handles most OAuth security automatically. You just need to configure the OAuth client settings properly in Google Cloud Console.
