
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, signIn, signOut } = useAuth();

  const handleAuthClick = async () => {
    try {
      if (user) {
        await signOut();
      } else {
        await signIn();
      }
    } catch (error) {
      console.error('Auth action failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass-effect border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-sky-400 to-indigo-600 rounded-lg shadow-lg shadow-sky-500/20"></div>
            <span className="text-xl font-bold tracking-tight text-white">Lake<span className="text-sky-400">9</span>.com</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Ecosystem</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">B2B SaaS</a>
          </nav>
          <div className="flex gap-4 items-center">
            {user && (
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-8 h-8 rounded-full border-2 border-sky-500"
                  />
                )}
                <span className="text-sm text-slate-300 hidden sm:block">
                  {user.displayName || user.email}
                </span>
              </div>
            )}
            <button 
              onClick={handleAuthClick}
              disabled={loading}
              className="text-sm font-medium px-4 py-2 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : user ? 'Sign Out' : 'Sign In with Google'}
            </button>
            <button className="text-sm font-medium px-4 py-2 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors">
              Docs
            </button>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-12 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Lake9 Development Inc. End-to-End Encrypted Art Processing.</p>
        {user && (
          <p className="mt-2 text-xs text-sky-400 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Connected to Google Drive (End-to-End Encrypted)
          </p>
        )}
      </footer>
    </div>
  );
};
