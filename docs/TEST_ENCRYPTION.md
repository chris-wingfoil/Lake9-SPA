# Quick Encryption Test

## Test if Web Crypto API Works

### Option 1: Open Test Page

1. Open `test-encryption.html` in your browser
2. Make sure you're on `http://localhost` (not file://)
3. Click "Test Encryption" button
4. Check if all tests pass

### Option 2: Browser Console Test

Open your browser console (F12) and paste:

```javascript
// Test if crypto is available
console.log('crypto.subtle:', !!crypto.subtle);

// Quick encryption test
async function quickTest() {
  try {
    const data = { test: 'hello' };
    const password = 'test123';
    
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encoder = new TextEncoder();
    const pwBuffer = encoder.encode(password);
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw', pwBuffer, 'PBKDF2', false, ['deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );
    
    console.log('? Encryption works!', encrypted.byteLength, 'bytes');
    return true;
  } catch (e) {
    console.error('? Encryption failed:', e);
    return false;
  }
}

quickTest();
```

## Common Issues

### ? "crypto.subtle is undefined"

**Cause:** Not on secure context (HTTPS or localhost)

**Solution:**
- ? `http://localhost` - OK
- ? `http://127.0.0.1` - OK
- ? `http://192.168.x.x` - NOT OK (use HTTPS)
- ? `file:///` - NOT OK

### ? "The operation is insecure"

**Cause:** HTTP (not localhost)

**Solution:** Use localhost or enable HTTPS

### ? Browser doesn't support Web Crypto

**Solution:** Update browser to latest version

---

## What to Check

1. **URL in browser:** Should be `http://localhost:3000` or `http://localhost:5173`
2. **Browser version:** Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
3. **Console errors:** Check F12 console for specific errors

If encryption test passes but Drive sync still fails, it's an authentication/Drive API issue, not encryption!
