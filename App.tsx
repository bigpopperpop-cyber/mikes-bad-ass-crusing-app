
import React, { useState, useEffect } from 'react';
import { Ship, Calendar, Package, Wallet, Menu, X, Plus, Info } from 'lucide-react';
import { CountdownTimer } from './components/CountdownTimer';
import { GiftCardLedger } from './components/GiftCardLedger';
import { PackingChecklist } from './components/PackingChecklist';
import { AIAssistant } from './components/AIAssistant';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'packing'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar Navigation */}
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
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-semibold text-sm">Dashboard</span>
          </button>
          <button 
            onClick={() => { setActiveTab('ledger'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'ledger' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Wallet className="w-5 h-5" />
            <span className="font-semibold text-sm">Gift Card Ledger</span>
          </button>
          <button 
            onClick={() => { setActiveTab('packing'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'packing' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
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

      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Ship className="w-5 h-5 text-blue-400" />
          <span className="font-bold">Cruise 2028</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {activeTab === 'dashboard' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900">Adventure Awaits</h2>
                  <p className="text-slate-500 mt-1">July 2028 • High School Graduation Trip</p>
                </div>
                <div className="flex gap-3">
                   <div className="bg-white shadow-sm border border-slate-200 p-3 rounded-xl flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-lg"><Wallet className="w-4 h-4 text-emerald-600" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Trip Fund</p>
                        <p className="text-sm font-bold text-slate-900 tracking-tight">$0.00</p>
                      </div>
                   </div>
                </div>
              </div>
              
              <CountdownTimer />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">Quick Checklist</h3>
                    <button onClick={() => setActiveTab('packing')} className="text-xs font-semibold text-blue-600 hover:underline">View All</button>
                  </div>
                  <PackingChecklist previewOnly />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">AI Travel Planner</h3>
                  </div>
                  <AIAssistant />
                </div>
              </div>
            </>
          )}

          {activeTab === 'ledger' && (
            <div className="space-y-6">
               <header>
                <h2 className="text-3xl font-extrabold text-slate-900">Gift Card Ledger</h2>
                <p className="text-slate-500 mt-1">Manage and track your Carnival Cruise gift card balances.</p>
              </header>
              <GiftCardLedger />
            </div>
          )}

          {activeTab === 'packing' && (
            <div className="space-y-6">
              <header>
                <h2 className="text-3xl font-extrabold text-slate-900">Packing Checklist</h2>
                <p className="text-slate-500 mt-1">Smart categorization for your documents, clothing, and personal items.</p>
              </header>
              <PackingChecklist />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
