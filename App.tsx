
import React, { useState, useEffect } from 'react';
import { Ship, Calendar, Package, Wallet, Menu, X, Settings2, Save } from 'lucide-react';
import { CountdownTimer } from './components/CountdownTimer';
import { GiftCardLedger } from './components/GiftCardLedger';
import { PackingChecklist } from './components/PackingChecklist';
import { AIAssistant } from './components/AIAssistant';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'packing'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  
  // Persistence for cruise date
  const [departureDate, setDepartureDate] = useState(() => {
    const saved = localStorage.getItem('cruise_departure_date');
    return saved || '2028-07-01';
  });

  // Persistence for projected trip cost
  const [projectedTripCost, setProjectedTripCost] = useState<number>(() => {
    const saved = localStorage.getItem('cruise_projected_cost');
    return saved ? parseFloat(saved) : 5000;
  });

  const [tempDate, setTempDate] = useState(departureDate);

  const saveTripSettings = () => {
    setDepartureDate(tempDate);
    localStorage.setItem('cruise_departure_date', tempDate);
    setIsEditingTrip(false);
  };

  const handleUpdateProjectedCost = (newCost: number) => {
    setProjectedTripCost(newCost);
    localStorage.setItem('cruise_projected_cost', newCost.toString());
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <nav className={`
        fixed inset-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-slate-900 text-white p-6 flex flex-col shadow-2xl
      `}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Ship className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">Cruise 2028</h1>
            <p className="text-xs text-slate-400 font-medium">Family Voyage</p>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Calendar className="w-5 h-5" />
            <span className="font-semibold text-sm">Dashboard</span>
          </button>
          <button onClick={() => { setActiveTab('ledger'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'ledger' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Wallet className="w-5 h-5" />
            <span className="font-semibold text-sm">Gift Card Ledger</span>
          </button>
          <button onClick={() => { setActiveTab('packing'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'packing' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Package className="w-5 h-5" />
            <span className="font-semibold text-sm">Packing List</span>
          </button>
        </div>

        <div className="pt-6 border-t border-slate-800 mt-auto">
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Destination</p>
            <p className="text-sm font-bold text-white uppercase tracking-wider">Carnival Breeze</p>
          </div>
        </div>
      </nav>

      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Ship className="w-5 h-5 text-blue-400" />
          <span className="font-bold">Cruise 2028</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {activeTab === 'dashboard' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900">Adventure Awaits</h2>
                  <p className="text-slate-500 mt-1">Trip Schedule: {new Date(departureDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <button 
                  onClick={() => setIsEditingTrip(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                >
                  <Settings2 className="w-4 h-4" />
                  Edit Trip Date
                </button>
              </div>

              {isEditingTrip && (
                <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-2xl flex flex-col md:flex-row items-end gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Select Departure Date</label>
                    <input 
                      type="date"
                      className="w-full bg-white border-2 border-blue-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold text-slate-900"
                      value={tempDate}
                      onChange={(e) => setTempDate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => setIsEditingTrip(false)}
                      className="flex-1 md:flex-none px-6 py-3 bg-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={saveTripSettings}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                      <Save className="w-4 h-4" />
                      Save Date
                    </button>
                  </div>
                </div>
              )}

              <CountdownTimer targetDateString={departureDate} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">Quick Checklist</h3>
                  <PackingChecklist previewOnly />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">AI Travel Planner</h3>
                  <AIAssistant />
                </div>
              </div>
            </>
          )}
          {activeTab === 'ledger' && (
            <GiftCardLedger 
              projectedTripCost={projectedTripCost} 
              onUpdateProjectedCost={handleUpdateProjectedCost} 
            />
          )}
          {activeTab === 'packing' && <PackingChecklist />}
        </div>
      </main>
    </div>
  );
};

export default App;
