
import React, { useRef, useState } from 'react';
import { Download, Upload, Copy, Check, AlertCircle, RefreshCw, FileJson, Link, ShieldAlert } from 'lucide-react';

export const DataManagement: React.FC = () => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAllData = () => {
    return {
      cruise_departure_date: localStorage.getItem('cruise_departure_date'),
      cruise_projected_cost: localStorage.getItem('cruise_projected_cost'),
      cruise_gift_cards: localStorage.getItem('cruise_gift_cards'),
      cruise_packing_items: localStorage.getItem('cruise_packing_items'),
      cruise_expenses: localStorage.getItem('cruise_expenses'),
      version: '1.3',
      timestamp: new Date().toISOString()
    };
  };

  const handleExportFile = () => {
    const data = getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cruise_2028_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyDataString = () => {
    const data = getAllData();
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    navigator.clipboard.writeText(encoded);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const processImport = (json: any) => {
    try {
      if (json.cruise_departure_date) localStorage.setItem('cruise_departure_date', json.cruise_departure_date);
      if (json.cruise_projected_cost) localStorage.setItem('cruise_projected_cost', json.cruise_projected_cost);
      if (json.cruise_gift_cards) localStorage.setItem('cruise_gift_cards', json.cruise_gift_cards);
      if (json.cruise_packing_items) localStorage.setItem('cruise_packing_items', json.cruise_packing_items);
      if (json.cruise_expenses) localStorage.setItem('cruise_expenses', json.cruise_expenses);
      
      alert('Data imported successfully! The page will now reload to apply changes.');
      window.location.reload();
    } catch (err) {
      setImportError('Invalid data format. Please check your backup file or string.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        processImport(json);
      } catch (err) {
        setImportError('Failed to read file. Make sure it is a valid JSON export.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Data & Portability</h2>
        <p className="text-slate-500 mt-2 font-medium">Manage your cruise data and share it between your devices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-sm hover:border-blue-500/50 transition-colors flex flex-col">
          <div className="bg-blue-50 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
            <Download className="text-blue-600 w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3">Backup Data</h3>
          <p className="text-slate-500 mb-8 flex-1 leading-relaxed">
            Download your entire cruise setup including gift cards, budget items, and packing lists to a secure local file.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleExportFile}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
            >
              <FileJson className="w-5 h-5" />
              Download Backup File
            </button>
            <button 
              onClick={handleCopyDataString}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              {copySuccess ? <Check className="w-5 h-5 text-emerald-500" /> : <Link className="w-5 h-5" />}
              {copySuccess ? 'Copied to Clipboard' : 'Copy Data String'}
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-sm hover:border-purple-500/50 transition-colors flex flex-col">
          <div className="bg-purple-50 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
            <Upload className="text-purple-600 w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3">Import Data</h3>
          <p className="text-slate-500 mb-8 flex-1 leading-relaxed">
            Move your plans to a new phone or restore from a backup. This will replace your current data on this device.
          </p>
          <div className="space-y-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".json"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-5 rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 active:scale-[0.98]"
            >
              <Upload className="w-5 h-5" />
              Upload Backup File
            </button>
            <button 
              onClick={() => {
                const str = prompt('Paste your encoded data string here:');
                if (str) {
                  try {
                    const json = JSON.parse(decodeURIComponent(escape(atob(str))));
                    processImport(json);
                  } catch (e) {
                    alert('Invalid data string.');
                  }
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              <RefreshCw className="w-5 h-5" />
              Paste Data String
            </button>
          </div>
        </div>
      </div>

      {importError && (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl flex items-center gap-4 text-red-700 animate-pulse">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="font-bold">{importError}</p>
        </div>
      )}

      <div className="bg-slate-900 text-white p-10 rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex items-start gap-6">
          <div className="bg-orange-500/20 p-4 rounded-2xl">
            <ShieldAlert className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h4 className="text-xl font-black mb-3">Data Security & Privacy</h4>
            