
import React, { useState } from 'react';
import { AIProcessingResult, StockPoint } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { saveArtToPrivateDrive } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';

interface ArtPreviewProps {
  result: AIProcessingResult;
  originalData: StockPoint[];
  onReset: () => void;
}

export const ArtPreview: React.FC<ArtPreviewProps> = ({ result: artResult, originalData, onReset }) => {
const { user } = useAuth();
const [isSaving, setIsSaving] = useState(false);
const [saveSuccess, setSaveSuccess] = useState(false);
const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

  const handleDriveSync = async () => {
    if (!user) {
      alert('Please sign in with Google to sync to Drive');
      return;
    }

    try {
      setIsSaving(true);
      setSaveSuccess(false);
      
      console.log('Starting Drive sync...');
      const saveResult = await saveArtToPrivateDrive(artResult);
      
      setEncryptionKey(saveResult.encryptionKey);
      setSaveSuccess(true);
      
      // Show success message
      alert(
        `✅ Saved to Google Drive!\n\n` +
        `📁 File: ${saveResult.driveResult.name}\n` +
        `🔐 Encryption Key: ${saveResult.encryptionKey}\n\n` +
        `⚠️ IMPORTANT: Save this encryption key! You'll need it to decrypt your art later.`
      );
    } catch (error: any) {
      console.error('Drive sync failed:', error);
      
      // Show detailed error message
      let errorMessage = 'Failed to sync to Google Drive.\n\n';
      
      if (error.message?.includes('not authenticated')) {
        errorMessage += '❌ Authentication Error\n\nPlease sign out and sign in again to grant Drive access.';
      } else if (error.message?.includes('No access token')) {
        errorMessage += '❌ No Access Token\n\nPlease sign out and sign in again to grant Google Drive permissions.';
      } else if (error.message?.includes('403') || error.message?.includes('Drive upload failed')) {
        errorMessage += '❌ Drive API Error\n\nMake sure:\n1. Google Drive API is enabled in Google Cloud Console\n2. You granted Drive permissions during sign-in\n3. OAuth scopes are configured correctly';
      } else {
        errorMessage += `Error: ${error.message || 'Unknown error'}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Visual Art */}
        <div className="w-full lg:w-2/3 space-y-8">
          <div className="glass-effect rounded-3xl overflow-hidden shadow-2xl group">
            <div className="relative">
              <img
                src={artResult.imageUrls[0]}
                alt="AI Generated Doppelganger"
                className="w-full h-auto object-cover min-h-[400px] transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/20">
                  AI Generated Art
                </span>
                <span className="px-3 py-1 bg-sky-500/50 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/20">
                  User Owned
                </span>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">Object Doppelganger: <span className="text-sky-400">{artResult.doppelgangerPrompt.split(',')[0]}</span></h2>
              <p className="text-slate-400 leading-relaxed">{artResult.visualNarrative}</p>
            </div>
          </div>

          <div className="glass-effect rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400"></div>
              Original Data Visualization
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={originalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={{ fill: '#38bdf8', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Ecosystem Actions */}
        <div className="w-full lg:w-1/3 space-y-6 sticky top-24">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 shadow-xl border border-slate-700">
            <h3 className="text-xl font-bold mb-4">Manager AI Summary</h3>
            <p className="text-slate-300 mb-6 italic">"{artResult.summary}"</p>
            
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-black/20 rounded-xl border border-slate-700/50">
                <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Math Derivation (CurveGen)</span>
                <code className="text-sky-300 font-mono text-sm">{artResult.mathExpression}</code>
              </div>
              <div className="p-4 bg-black/20 rounded-xl border border-slate-700/50">
                <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Processing Status</span>
                <span className="text-emerald-400 text-sm flex items-center gap-2">
                   <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Optimized & Secure
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={handleDriveSync}
                disabled={isSaving || !user}
                className={`w-full py-4 ${
                  saveSuccess 
                    ? 'bg-emerald-600 hover:bg-emerald-500' 
                    : 'bg-indigo-600 hover:bg-indigo-500'
                } text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Encrypting & Syncing...
                  </>
                ) : saveSuccess ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Saved to Drive!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Sync to Google Drive
                  </>
                )}
              </button>
              
              {encryptionKey && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-xs font-bold text-amber-400 mb-1">🔑 Encryption Key:</p>
                  <code className="text-xs text-amber-300 break-all font-mono">{encryptionKey}</code>
                  <p className="text-xs text-amber-400 mt-2">Save this key to decrypt your art later!</p>
                </div>
              )}
              
              <button className="w-full py-4 border border-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold transition-all">
                Export 3D Model (.3dm)
              </button>
            </div>
          </div>

          <div className="p-6 glass-effect rounded-3xl border border-sky-500/20">
            <h4 className="font-semibold text-sky-400 mb-2 italic">Future: Tiered Biz Ops</h4>
            <p className="text-xs text-slate-400">Scale this art directly into an operational ecosystem. Hire a Sales AI or Accounting AI based on your growth trends.</p>
          </div>

          <button
            onClick={onReset}
            className="w-full py-3 text-slate-500 hover:text-white transition-colors text-sm font-medium"
          >
            ← Upload New Dataset
          </button>
        </div>
      </div>
    </div>
  );
};
