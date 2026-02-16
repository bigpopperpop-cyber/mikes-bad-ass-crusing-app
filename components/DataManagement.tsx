
import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, Copy, Check, AlertCircle, RefreshCw, Cloud, CloudUpload, CloudDownload, Key } from 'lucide-react';

export const DataManagement: React.FC = () => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [syncId, setSyncId] = useState(() => localStorage.getItem('cruise_sync_id') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(() => localStorage.getItem('cruise_last_sync') || 'Never');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAllData = () => {
    return {
      cruise_departure_date: localStorage.getItem('cruise_departure_date'),
      cruise_projected_cost: localStorage.getItem('cruise_projected_cost'),
      cruise_gift_cards: localStorage.getItem('cruise_gift_cards'),
      cruise_packing_items: localStorage.getItem('cruise_packing_items'),
      version: '1.1',
      timestamp: new Date().toISOString()
    };
  };

  const saveSyncId = (id: string) => {
    const cleanId = id.trim();
    setSyncId(cleanId);
    localStorage.setItem('cruise_sync_id', cleanId);
  };

  const handlePushToCloud = async () => {
    if (!syncId) {
      alert('Please enter a Sync Code first!');
      return;
    }
    setIsSyncing(true);
    try {
      const data = getAllData();
      // Using npoint.io as a simple public JSON bin
      // We use the syncId as part of the bin path or a custom one
      // For simplicity in this demo, we assume the user provides a valid npoint bin ID 
      // or we can generate one. Let's make it a "Cloud Key" system.
      const response = await fetch(`https://api.npoint.io/bins/${syncId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to upload');
      
      const now = new Date().toLocaleString();
      setLastSync(now);
      localStorage.setItem('cruise_last_sync', now);
      alert('Cloud Vault Updated! Your husband can now "Pull" these changes.');
    } catch (err) {
      setImportError('Cloud Sync failed. Ensure your Sync Code is valid or try a new one.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!syncId) {
      alert('Please enter a Sync Code first!');
      return;
    }
    if (!confirm('This will overwrite all data on THIS device with the cloud version. Continue?')) return;
    
    setIsSyncing(true);
    try {
      const response = await fetch(`https://api.npoint.io/bins/${syncId}`);
      if (!response.ok) throw new Error('Failed to download');
      
      const json = await response.json();
      processImport(json, false);
      const now = new Date().toLocaleString();
      setLastSync(now);
      localStorage.setItem('cruise_last_sync', now);
      alert('Data Synced Successfully! Reloading...');
      window.location.reload();
    } catch (err) {
      setImportError('Could not find data for this Sync Code. Check the code and try again.');
    } finally {
      setIsSyncing(false);
    }
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

  const processImport = (json: any, reload = true) => {
    try {
      if (json.cruise_departure_date) localStorage.setItem('cruise_departure_date', json.cruise_departure_date);
      if (json.cruise_projected_cost) localStorage.setItem('cruise_projected_cost', json.cruise_projected_cost);
      if (json.cruise_gift_cards) localStorage.setItem('cruise_gift_cards', json.cruise_gift_cards);
      if (json.cruise_packing_items) localStorage.setItem('cruise_packing_items', json.cruise_packing_items);
      
      if (reload) {
        alert('Data imported successfully! The page will now reload.');
        window.location.reload();
      }
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

  const generateNewSyncId = () => {
    const newId = Math.random().toString(36).substring(2, 10).toUpperCase();
    saveSyncId(newId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Sync & Portability</h2>
        <p className="text-slate-500 mt-2 font-medium">Keep your cruise plans updated across all family devices.</p>
      </div>

      {/* Cloud Sync Section */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Family Cloud Sync</h3>
              <p className="text-slate-400 text-sm font-bold">Live updates for you and your husband</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-3">Your Shared Sync Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white font-mono font-bold focus:border-blue-500 outline-none transition-all"
                      placeholder="ENTER-CODE-HERE"
                      value={syncId}
                      onChange={(e) => saveSyncId(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={generateNewSyncId}
                    className="px-4 bg-slate-800 border-2 border-slate-700 rounded-xl hover:bg-slate-700 transition-colors"
                    title="Generate New ID"
                  >
                    <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-3 font-bold leading-relaxed">
                  Share this code with your husband. He should enter the SAME code on his phone to sync with you.
                </p>
              </div>

              <div className="flex flex-col gap-2 text-xs font-bold text-slate-400 px-2">
                <div className="flex justify-between">
                  <span>Connection Status:</span>
                  <span className={syncId ? 'text-emerald-400' : 'text-orange-400'}>
                    {syncId ? 'Ready to Sync' : 'Code Required'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Cloud Update:</span>
                  <span>{lastSync}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handlePushToCloud}
                disabled={isSyncing || !syncId}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-blue-600 rounded-3xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50 group"
              >
                <CloudUpload className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <span className="block font-black text-sm">Upload to Cloud</span>
                  <span className="text-[10px] font-bold opacity-60">Send my updates</span>
                </div>
              </button>

              <button 
                onClick={handlePullFromCloud}
                disabled={isSyncing || !syncId}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-white/10 border-2 border-white/10 rounded-3xl hover:bg-white/20 transition-all disabled:opacity-50 group"
              >
                <CloudDownload className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <span className="block font-black text-sm text-white">Download Updates</span>
                  <span className="text-[10px] font-bold text-slate-400">Get husband's changes</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col">
          <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <Download className="text-blue-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Manual Export</h3>
          <p className="text-sm text-slate-500 mb-8 flex-1">Save your data as a local file or encoded string for maximum security.</p>
          
          <div className="space-y-3">
            <button 
              onClick={handleExportFile}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <Download className="w-5 h-5" />
              Download .JSON File
            </button>
            <button 
              onClick={handleCopyDataString}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
            >
              {copySuccess ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              {copySuccess ? 'Copied to Clipboard' : 'Copy Data String'}
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col">
          <div className="bg-purple-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <Upload className="text-purple-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Manual Import</h3>
          <p className="text-sm text-slate-500 mb-8 flex-1">Restore your plans from a backup file or a data string you've saved.</p>
          
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

      <div className="bg-blue-50 border-2 border-blue-100 text-blue-900 p-8 rounded-[2rem] relative overflow-hidden">
        <h4 className="text-lg font-black mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          How to Sync with Husband
        </h4>
        <ol className="text-sm space-y-2 list-decimal list-inside font-medium opacity-80">
          <li>Enter a unique code in the <strong>Sync Code</strong> box (e.g., <code>SMITH-CRUISE-2028</code>).</li>
          <li>Click <strong>Upload to Cloud</strong> to save your current data.</li>
          <li>On your husband's phone, open the app and go to this page.</li>
          <li>Tell him to enter the <strong>SAME Sync Code</strong>.</li>
          <li>He clicks <strong>Download Updates</strong> to see your gift cards and lists.</li>
          <li>When he adds a card, he clicks <strong>Upload</strong>, and you click <strong>Download</strong>!</li>
        </ol>
      </div>
    </div>
  );
};
