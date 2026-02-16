
import React, { useRef, useState } from 'react';
import { Download, Upload, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';

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
      version: '1.0',
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
    const encoded = btoa(JSON.stringify(data));
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
      
      alert('Data imported successfully! The page will now reload.');
      window.location.reload();
    } catch (err) {
      setImportError('Invalid data format. Please check your backup file.');
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
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900">Data & Portability</h2>
        <p className="text-slate-500 mt-2">Move your cruise plans between your phone, tablet, and computer.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col">
          <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <Download className="text-blue-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Export Data</h3>
          <p className="text-sm text-slate-500 mb-8 flex-1">Save all your gift cards, packing lists, and settings to a file for backup.</p>
          
          <div className="space-y-3">
            <button 
              onClick={handleExportFile}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Download className="w-5 h-5" />
              Download Backup
            </button>
            <button 
              onClick={handleCopyDataString}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
            >
              {copySuccess ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              {copySuccess ? 'Copied Data String!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col">
          <div className="bg-purple-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <Upload className="text-purple-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Import Data</h3>
          <p className="text-sm text-slate-500 mb-8 flex-1">Restore your plans from a backup file or a data string you've copied.</p>
          
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
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
            >
              <Upload className="w-5 h-5" />
              Upload Backup File
            </button>
            <button 
              onClick={() => {
                const str = prompt('Paste your encoded data string here:');
                if (str) {
                  try {
                    const json = JSON.parse(atob(str));
                    processImport(json);
                  } catch (e) {
                    alert('Invalid data string.');
                  }
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Paste Data String
            </button>
          </div>
        </div>
      </div>

      {importError && (
        <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-bold">{importError}</p>
        </div>
      )}

      <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <h4 className="text-lg font-bold mb-2">Security Note</h4>
        <p className="text-slate-400 text-sm leading-relaxed">
          Your backup files contain your gift card numbers and PINs in plain text. 
          Keep your backup files secure and do not share them with anyone you don't trust.
          Data is stored locally on this device and is only moved when you manually use these export/import tools.
        </p>
      </div>
    </div>
  );
};
