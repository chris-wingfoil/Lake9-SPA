import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOut as authSignOut, AuthUser, handleRedirectResult } from '../services/authService';

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result on page load
    const checkRedirect = async () => {
      console.log('?? Checking for redirect result...');
      const redirectResult = await handleRedirectResult();
      if (redirectResult) {
        setAuthUser(redirectResult);
        console.log('? Sign-in successful via redirect', redirectResult);
      } else {
        console.log('?? No redirect result (normal page load)');
      }
    };
    
    checkRedirect();
    
    // Listen to auth state changes
    const unsubscribe = onAuthChange((firebaseUser) => {
      console.log('?? Auth state changed:', firebaseUser ? 'Signed in' : 'Signed out');
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      // This will open a popup and complete immediately (or throw error)
      const result = await signInWithGoogle();
      setAuthUser(result);
      console.log('? Sign-in successful via popup', result);
    } catch (error) {
      console.error('Sign-in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authSignOut();
      setAuthUser(null);
    } catch (error) {
      console.error('Sign-out failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, authUser, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
