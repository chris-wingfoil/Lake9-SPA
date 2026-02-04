
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      </footer>
    </div>
  );
};
