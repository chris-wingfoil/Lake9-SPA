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
      const redirectResult = await handleRedirectResult();
      if (redirectResult) {
        setAuthUser(redirectResult);
        console.log('? Sign-in successful via redirect');
      }
    };
    
    checkRedirect();
    
    // Listen to auth state changes
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      // This will redirect the page
      await signInWithGoogle();
      // Note: Code after this won't execute as page redirects
    } catch (error) {
      console.error('Sign-in failed:', error);
      setLoading(false);
      throw error;
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
