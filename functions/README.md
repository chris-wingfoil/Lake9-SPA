# Lake9-SPA Firebase Functions

## Security Configuration

### API Key Protection
- Gemini API key is stored securely in **Firebase Secrets Manager**
- Never exposed to client-side code
- Accessed only by the backend function via `defineSecret('GEMINI_API_KEY')`

### CORS Configuration
- **Callable Functions (`onCall`)** automatically handle CORS
- Firebase restricts calls to **authorized domains only**
- Authorized domains are configured in: [Firebase Console > Authentication > Settings > Authorized domains](https://console.firebase.google.com/project/lake9-dev/authentication/settings)

**Current Authorized Domains:**
- `lake9-dev.web.app`
- `lake9-dev.firebaseapp.com`
- `localhost` (for development)

### Function: `generateArt`
- **Type**: HTTPS Callable Function
- **Region**: us-central1
- **Runtime**: Node.js 20
- **Secrets**: GEMINI_API_KEY
- **Purpose**: Secure proxy for Gemini AI API calls

## Deployment

```bash
# Build functions
cd functions
npm run build

# Deploy functions
cd ..
firebase deploy --only functions

# Deploy everything (functions + hosting)
firebase deploy
```

## Local Development

```bash
# Run emulator
firebase emulators:start

# The function will be available at:
# http://localhost:5001/lake9-dev/us-central1/generateArt
```

## Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Secrets are managed via Firebase** - Use `firebase functions:secrets:set GEMINI_API_KEY`
3. **CORS is auto-handled** - Firebase Callable Functions restrict to authorized domains
4. **Client SDK required** - Must use Firebase SDK to call functions (additional security layer)

## Monitoring

- [Functions Dashboard](https://console.firebase.google.com/project/lake9-dev/functions/list)
- [Logs](https://console.firebase.google.com/project/lake9-dev/functions/logs)
- [Metrics](https://console.firebase.google.com/project/lake9-dev/functions/usage)
