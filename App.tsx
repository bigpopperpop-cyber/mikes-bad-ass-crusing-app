import React, { useState, useEffect, useMemo } from 'react';
import { Ship, Calendar, Package, Wallet, Menu, X, Settings2, Save, Database, Target, Banknote } from 'lucide-react';
import { CountdownTimer } from './components/CountdownTimer';
import { GiftCardLedger } from './components/GiftCardLedger';
import { PackingChecklist } from './components/PackingChecklist';
import { AIAssistant } from './components/AIAssistant';
import { DataManagement } from './components/DataManagement';
import { GoalPlanner } from './components/GoalPlanner';
import { Expense } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'packing' | 'settings' | 'goal'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  
  const [departureDate, setDepartureDate] = useState(() => {
    const saved = localStorage.getItem('cruise_departure_date');
    return saved || '2028-07-01';
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('cruise_expenses');
    return saved ? JSON.parse(saved) : [
      { id: '1', description: 'Cruise Fare (Final Balance)', amount: 3500, category: 'Cruise' },
      { id: '2', description: 'Pre-Cruise Hotel', amount: 250, category: 'Travel' },
      { id: '3', description: 'Gas & Parking', amount: 150, category: 'Travel' }
    ];
  });

  const projectedTripCost = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const [tempDate, setTempDate] = useState(departureDate);

  useEffect(() => {
    localStorage.setItem('cruise_expenses', JSON.stringify(expenses));
    localStorage.setItem('cruise_projected_cost', projectedTripCost.toString());
  }, [expenses, projectedTripCost]);

  const saveTripSettings = () => {
    setDepartureDate(tempDate);
    localStorage.setItem('cruise_departure_date', tempDate);
    setIsEditingTrip(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      {/* Sidebar - Enhanced for iPad */}
      <nav className={`
        fixed inset-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out
        w-full sm:w-72 lg:w-64 bg-slate-900 text-white p-6 flex flex-col shadow-2xl safe-pl safe-pt
      `}>
        <div className="flex items-center justify-between mb-10 px-2 lg:block">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/20">
              <Ship className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight">Cruise 2028</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Family Voyage</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 bg-slate-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-1 flex-1 overflow-y-auto pr-2 -mr-2">
          {[
            { id: 'dashboard', icon: Calendar, label: 'Dashboard' },
            { id: 'goal', icon: Target, label: 'Trip Goal Planner' },
            { id: 'ledger', icon: Wallet, label: 'Trip Funds & Cash' },
            { id: 'packing', icon: Package, label: 'Packing List' },
            { id: 'settings', icon: Database, label: 'Settings & Data' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }} 
              className={`
                w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all active-scale
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
              `}
            >
              <tab.icon className="w-5 h-5 shrink-0" />
              <span className="font-bold text-sm tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-800 mt-auto safe-pb">
          <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Destination</p>
            <p className="text-sm font-black text-white uppercase tracking-wider">Carnival Breeze</p>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Header */}
      <div className="lg:hidden bg-slate-900 text-white flex justify-between items-center sticky top-0 z-40 safe-pt shadow-xl">
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Ship className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight">Cruise 2028</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-4 px-6 active-scale"
        >
          <Menu className="w-7 h-7" />
        </button>
      </div>

      {/* Backdrop for iPad Portrait / Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto safe-pb lg:safe-pt">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8 lg:space-y-10">
          {activeTab === 'dashboard' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="safe-pl">
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Adventure Awaits</h2>
                  <p className="text-slate-500 mt-1 font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Trip Schedule: {new Date(departureDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <button 
                  onClick={() => setIsEditingTrip(true)}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-600 font-black text-sm active-scale shadow-sm transition-all hover:border-blue-500 hover:text-blue-600 safe-pr"
                >
                  <Settings2 className="w-4 h-4" />
                  Edit Date
                </button>
              </div>

              {isEditingTrip && (
                <div className="bg-white border-2 border-blue-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-end gap-5 shadow-xl shadow-blue-900/5 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-black text-blue-600 uppercase tracking-widest mb-2.5">Select Departure Date</label>
                    <input 
                      type="date"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 font-bold text-slate-900 text-lg"
                      value={tempDate}
                      onChange={(e) => setTempDate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => setIsEditingTrip(false)}
                      className="flex-1 md:flex-none px-6 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl active-scale"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={saveTripSettings}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl active-scale shadow-lg shadow-blue-200"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              )}

              <CountdownTimer targetDateString={departureDate} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-900">Packing Progress</h3>
                  </div>
                  <PackingChecklist previewOnly />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-900">Cruise Assistant</h3>
                  </div>
                  <AIAssistant />
                </div>
              </div>
            </>
          )}
          {activeTab === 'goal' && (
            <GoalPlanner expenses={expenses} setExpenses={setExpenses} />
          )}
          {activeTab === 'ledger' && (
            <GiftCardLedger 
              projectedTripCost={projectedTripCost} 
              onUpdateProjectedCost={() => {}} 
            />
          )}
          {activeTab === 'packing' && <PackingChecklist />}
          {activeTab === 'settings' && <DataManagement />}
        </div>
      </main>
    </div>
  );
};

export default App;