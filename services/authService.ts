import { 
  getAuth, 
  signInWithRedirect,
  getRedirectResult,
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
 * Sign in with Google using redirect flow (no popup, no COOP issues)
 * Returns the authenticated user with access token for Drive API
 */
export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    // Start redirect to Google sign-in
    await signInWithRedirect(auth, googleProvider);
    
    // This will redirect the page - execution stops here
    // Result will be handled by handleRedirectResult() on page load
    return {
      uid: '',
      email: null,
      displayName: null,
      photoURL: null,
      accessToken: null
    };
  } catch (error: any) {
    console.error('Sign-in error:', error);
    throw new Error(`Authentication failed: ${error.message}`);
  }
};

/**
 * Handle redirect result after Google sign-in
 * Call this on app initialization
 */
export const handleRedirectResult = async (): Promise<AuthUser | null> => {
  try {
    const result = await getRedirectResult(auth);
    
    if (!result) {
      return null; // No redirect result (normal page load)
    }
    
    // Get the Google Access Token for Drive API calls
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || null;
    
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
    console.error('Redirect result error:', error);
    return null;
  }
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
