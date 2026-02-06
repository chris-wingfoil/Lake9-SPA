# Allow Popups for Google Sign-In

## Why You Need This:
Google Sign-In uses a popup window. If your browser blocks popups, sign-in will fail.

## Quick Fix:

### Chrome / Edge:
1. Click the **popup blocked icon** in address bar (right side)
2. Click "Always allow popups and redirects from localhost"
3. Click "Done"
4. Try sign-in again

### Firefox:
1. Click the **popup blocked icon** in address bar
2. Click "Options" ? "Allow Popups for localhost"
3. Click "Save"
4. Try sign-in again

### Safari:
1. Safari ? Preferences ? Websites ? Pop-up Windows
2. Find "localhost" in list
3. Change to "Allow"
4. Try sign-in again

## If You Don't See Popup Blocked Icon:

### Test if popups work:
Open browser console (F12) and run:
```javascript
window.open('about:blank', '_blank', 'width=500,height=600');
```

- If popup opens: ? Popups are allowed
- If nothing happens: ? Popups are blocked

### Manually Allow Popups:

#### Chrome / Edge:
1. Click the **?? lock icon** in address bar
2. Click "Site settings"
3. Find "Pop-ups and redirects"
4. Change to "Allow"
5. Reload page and try sign-in

#### Firefox:
1. Click the **?? lock icon** in address bar
2. Click arrow to expand
3. Click "More Information"
4. Go to "Permissions" tab
5. Find "Open pop-up windows"
6. Uncheck "Use Default" and check "Allow"
7. Close and reload page

## Testing:

1. Make sure popups are allowed
2. Run dev server: `npm run dev`
3. Click "Sign In with Google"
4. **Popup should open immediately**
5. Sign in with Google account
6. Popup closes automatically
7. User info appears in app header

## Troubleshooting:

### Popup Opens but Shows Error:
- Not a popup blocker issue
- Check Firebase Console configuration
- Check OAuth Consent Screen setup

### Popup Doesn't Open at All:
- Likely popup blocker
- Check address bar for blocked popup icon
- Follow steps above to allow popups

### Popup Opens Then Immediately Closes:
- Check browser console for error
- Likely OAuth or Firebase configuration issue
- See `docs/REVERTED_TO_POPUP.md` for config checklist

## Browser Console Errors:

### `auth/popup-blocked`
? Follow steps above to allow popups

### `auth/popup-closed-by-user`
? User clicked X on popup (normal behavior)
? Just try sign-in again

### `auth/cancelled-popup-request`
? Popup was opened but request was cancelled
? Might be popup blocker or network issue
? Clear cache and try again

---

**After allowing popups, sign-in should work perfectly!** ??
