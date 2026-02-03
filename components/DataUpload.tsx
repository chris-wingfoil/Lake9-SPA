
import React, { useState } from 'react';
import { StockPoint } from '../types';

interface DataUploadProps {
  onProcess: (data: StockPoint[]) => void;
}

export const DataUpload: React.FC<DataUploadProps> = ({ onProcess }) => {
  const [input, setInput] = useState('');

  const generateMockData = () => {
    const mock: StockPoint[] = [];
    let price = 100 + Math.random() * 50;
    for (let i = 0; i < 15; i++) {
      price += (Math.random() - 0.45) * 20;
      mock.push({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        price: parseFloat(price.toFixed(2))
      });
    }
    setInput(JSON.stringify(mock, null, 2));
  };

  const handleProcess = () => {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        onProcess(parsed);
      } else {
        alert("Please provide a valid JSON array of stock points.");
      }
    } catch (e) {
      alert("Invalid JSON format.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 gradient-text">Transform Data into Viral Art</h1>
        <p className="text-slate-400 text-lg">Upload your stock metrics or personal datasets. Our AI hierarchy handles the rest.</p>
      </div>

      <div className="glass-effect rounded-2xl p-6 shadow-2xl">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Dataset (JSON Format)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sky-400 font-mono text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            placeholder='[{"date": "2024-01-01", "price": 120.5}, ...]'
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={generateMockData}
            className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
          >
            Generate Sample Data
          </button>
          <button
            onClick={handleProcess}
            disabled={!input}
            className="flex-1 px-6 py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg shadow-sky-500/20 transition-all"
          >
            Process with Lake9 AI
          </button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="text-sky-400 mb-2 font-bold uppercase text-xs tracking-widest">CurveGen</div>
          <p className="text-slate-400 text-sm">Mathematical derivation of your growth trends.</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="text-indigo-400 mb-2 font-bold uppercase text-xs tracking-widest">Doppelganger</div>
          <p className="text-slate-400 text-sm">Real-world shape matching for viral recognition.</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="text-emerald-400 mb-2 font-bold uppercase text-xs tracking-widest">V-Morph</div>
          <p className="text-slate-400 text-sm">Evolutionary video generation of data volatility.</p>
        </div>
      </div>
    </div>
  );
};
