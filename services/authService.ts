import { 
  getAuth, 
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { app } from '../config/firebase';

const auth = getAuth(app);

// Google provider with Drive scope for file access
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  accessToken: string | null;
}

/**
 * Sign in with Google using popup flow (original working method)
 * Returns the authenticated user with access token for Drive API
 */
export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    console.log('?? Starting sign-in with popup...');
    console.log('?? Auth domain:', auth.config.authDomain);
    console.log('?? Using provider:', googleProvider.providerId);
    
    // Open popup for Google sign-in
    const result = await signInWithPopup(auth, googleProvider);
    console.log('? Popup sign-in successful:', result.user.email);
    
    // Get the Google Access Token for Drive API calls
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || null;
    
    console.log('?? Access token:', accessToken ? 'YES (' + accessToken.substring(0, 20) + '...)' : 'NO');
    
    if (!accessToken) {
      console.warn('?? No access token received. User may need to re-authenticate for Drive access.');
    }
    
    // Cache the access token for Drive API use
    cacheAccessToken(accessToken);
    
    const user = result.user;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      accessToken
    };
  } catch (error: any) {
    console.error('? Sign-in error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide helpful error messages
    let userMessage = 'Authentication failed';
    if (error.code === 'auth/unauthorized-domain') {
      userMessage = 'This domain is not authorized. Please add it to Firebase Console > Authentication > Settings > Authorized domains';
    } else if (error.code === 'auth/operation-not-allowed') {
      userMessage = 'Google Sign-In is not enabled. Please enable it in Firebase Console > Authentication > Sign-in method';
    } else if (error.code === 'auth/popup-blocked') {
      userMessage = 'Popup was blocked by browser. Please allow popups for this site and try again.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      userMessage = 'Sign-in cancelled. Please try again.';
    } else if (error.message) {
      userMessage = error.message;
    }
    
    throw new Error(userMessage);
  }
};

/**
 * Note: handleRedirectResult is no longer needed with popup flow
 * Keeping this as a no-op for backward compatibility
 */
export const handleRedirectResult = async (): Promise<AuthUser | null> => {
  // Not needed for popup flow - sign-in completes immediately
  console.log('?? Using popup flow - redirect result handling not needed');
  return null;
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    // Clear cached access token on sign out
    cacheAccessToken(null);
  } catch (error: any) {
    console.error('Sign-out error:', error);
    throw new Error(`Sign-out failed: ${error.message}`);
  }
};

/**
 * Listen to authentication state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get the current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Store access token in memory (will be lost on page refresh - user must re-authenticate)
let cachedAccessToken: string | null = null;

/**
 * Cache the access token from sign-in
 */
export const cacheAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Get cached access token for Drive API calls
 * Returns the access token from the last sign-in
 * If null, user needs to sign in again
 */
export const getDriveAccessToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('?? No user signed in');
    return null;
  }
  
  // Return cached token if available
  if (cachedAccessToken) {
    console.log('? Using cached access token');
    return cachedAccessToken;
  }
  
  // If no cached token, user needs to sign in again to get Drive permissions
  console.warn('?? No cached access token - user must sign in again');
  return null;
};

export { auth };
