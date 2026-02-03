
import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { DataUpload } from './components/DataUpload';
import { ArtPreview } from './components/ArtPreview';
import { GeminiProvider } from './services/geminiService';
import { AppState, StockPoint, AIProcessingResult } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [data, setData] = useState<StockPoint[]>([]);
  const [result, setResult] = useState<AIProcessingResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Initializing Manager AI...');

  const handleProcessData = useCallback(async (inputData: StockPoint[]) => {
    setData(inputData);
    setAppState(AppState.PROCESSING);
    
    try {
      const provider = new GeminiProvider();
      
      setLoadingMessage('Manager AI coordinating sub-AIs...');
      // Small simulation for visual feedback
      await new Promise(r => setTimeout(r, 1000));
      
      setLoadingMessage('CurveGen deriving math equations...');
      await new Promise(r => setTimeout(r, 800));

      setLoadingMessage('Doppelganger searching for real-world matches...');
      const artResult = await provider.generateArt(inputData);
      
      setResult(artResult);
      setAppState(AppState.PREVIEW);
    } catch (error) {
      console.error(error);
      alert('AI Processing failed. Please check your API key and try again.');
      setAppState(AppState.UPLOAD);
    }
  }, []);

  const handleReset = () => {
    setAppState(AppState.UPLOAD);
    setResult(null);
    setData([]);
  };

  return (
    <Layout>
      {appState === AppState.UPLOAD && (
        <DataUpload onProcess={handleProcessData} />
      )}

      {appState === AppState.PROCESSING && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-sky-500 rounded-lg blur-xl opacity-50 animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Processing Ecosystem</h2>
          <p className="text-slate-400 animate-pulse font-mono text-sm">{loadingMessage}</p>
        </div>
      )}

      {appState === AppState.PREVIEW && result && (
        <ArtPreview
          result={result}
          originalData={data}
          onReset={handleReset}
        />
      )}
    </Layout>
  );
};

export default App;
