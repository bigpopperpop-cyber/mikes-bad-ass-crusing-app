import React, { useState, useMemo, useEffect } from 'react';
import { GiftCard, CashEntry } from '../types';
import { Plus, Trash2, Wallet, CreditCard, DollarSign, Calendar, Globe, CheckCircle, TrendingUp, Target, Receipt, Banknote, Coins, Edit2, Check, X } from 'lucide-react';

interface Props {
  projectedTripCost: number;
  onUpdateProjectedCost: (cost: number) => void;
}

export const GiftCardLedger: React.FC<Props> = ({ projectedTripCost }) => {
  const [cards, setCards] = useState<GiftCard[]>(() => {
    const saved = localStorage.getItem('cruise_gift_cards');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [cashEntries, setCashEntries] = useState<CashEntry[]>(() => {
    const saved = localStorage.getItem('cruise_cash_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isAddingCash, setIsAddingCash] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  const [newCard, setNewCard] = useState<Partial<GiftCard>>({
    cardNumber: '', pin: '', originalBalance: 0, currentBalance: 0, source: '',
    dateReceived: new Date().toISOString().split('T')[0]
  });

  const [newCash, setNewCash] = useState<Partial<CashEntry>>({
    description: '', amount: 0, dateAdded: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    localStorage.setItem('cruise_gift_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('cruise_cash_entries', JSON.stringify(cashEntries));
  }, [cashEntries]);

  const stats = useMemo(() => {
    const giftCardAvailable = cards.reduce((sum, card) => sum + card.currentBalance, 0);
    const cashTotal = cashEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalSaved = giftCardAvailable + cashTotal;
    const remainingGoal = Math.max(0, projectedTripCost - totalSaved);
    const progressPercent = projectedTripCost > 0 ? Math.min(100, (totalSaved / projectedTripCost) * 100) : 0;

    return { giftCardAvailable, cashTotal, totalSaved, remainingGoal, progressPercent };
  }, [cards, cashEntries, projectedTripCost]);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCard.cardNumber && newCard.pin && newCard.source) {
      const card: GiftCard = {
        id: Math.random().toString(36).substr(2, 9),
        cardNumber: newCard.cardNumber || '',
        pin: newCard.pin || '',
        originalBalance: Number(newCard.originalBalance) || 0,
        currentBalance: Number(newCard.currentBalance) || 0,
        source: newCard.source || '',
        dateReceived: newCard.dateReceived || '',
      };
      setCards([...cards, card]);
      setIsAddingCard(false);
      setNewCard({ cardNumber: '', pin: '', originalBalance: 0, currentBalance: 0, source: '', dateReceived: new Date().toISOString().split('T')[0] });
    }
  };

  const startEditing = (card: GiftCard) => {
    setEditingCardId(card.id);
    setEditValue(card.currentBalance.toString());
  };

  const saveEdit = (id: string) => {
    const val = parseFloat(editValue);
    if (isNaN(val)) return;
    setCards(cards.map(c => c.id === id ? { ...c, currentBalance: val } : c));
    setEditingCardId(null);
  };

  const handleAddCash = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCash.description && newCash.amount) {
      const entry: CashEntry = {
        id: Math.random().toString(36).substr(2, 9),
        description: newCash.description || '',
        amount: Number(newCash.amount) || 0,
        dateAdded: newCash.dateAdded || '',
      };
      setCashEntries([...cashEntries, entry]);
      setIsAddingCash(false);
      setNewCash({ description: '', amount: 0, dateAdded: new Date().toISOString().split('T')[0] });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700">
      {/* Financial Summary Dashboard - Fluid Grid for iPads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { icon: CreditCard, color: 'blue', label: 'Gift Cards', value: stats.giftCardAvailable, sub: 'Available' },
          { icon: Banknote, color: 'emerald', label: 'Cash Savings', value: stats.cashTotal, sub: 'Total In Hand' },
          { icon: Wallet, color: 'purple', label: 'Total Funds', value: stats.totalSaved, sub: 'Combined' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 sm:p-7 rounded-[2rem] border-2 border-slate-200 shadow-sm relative overflow-hidden active-scale">
            <div className={`bg-${item.color}-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-5`}>
              <item.icon className={`w-6 h-6 text-${item.color}-600`} />
            </div>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-3xl font-black text-slate-900 tabular-nums">
              ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}

        <div className="bg-slate-900 p-5 sm:p-7 rounded-[2rem] shadow-2xl flex flex-col justify-between border-b-4 border-blue-600">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Goal Progress</h3>
              <div className="bg-blue-600/20 p-1.5 rounded-lg"><Target className="w-4 h-4 text-blue-400" /></div>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <p className="text-4xl font-black text-white">{Math.round(stats.progressPercent)}%</p>
              <p className="text-[10px] text-slate-500 mb-1.5 font-black uppercase tracking-wider">of ${projectedTripCost.toLocaleString()}</p>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out" 
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-blue-400 font-black uppercase tracking-widest">
              ${stats.remainingGoal.toLocaleString()} to go
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
        {/* Gift Card Section */}
        <div className="space-y-5">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg"><CreditCard className="w-5 h-5 text-white" /></div>
              Gift Cards
            </h3>
            <button 
              onClick={() => setIsAddingCard(true)}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-black rounded-2xl active-scale shadow-lg shadow-blue-900/10 text-sm tracking-wide"
            >
              <Plus className="w-4 h-4" />
              Add Card
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {cards.length === 0 ? (
                <div className="p-16 text-center text-slate-400 font-bold italic opacity-60">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  Register your cards to start saving.
                </div>
              ) : (
                cards.map(card => (
                  <div key={card.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between transition-colors active:bg-slate-50 relative">
                    <div className="flex items-center gap-5 mb-5 sm:mb-0">
                      <div className="bg-slate-50 p-4 rounded-[1.25rem] text-slate-400 border border-slate-100">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-xl leading-none">{card.source}</p>
                        <p className="text-xs font-mono font-bold text-slate-400 mt-2 uppercase tracking-tight">
                          ENDING IN ****{card.cardNumber.slice(-4)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 border-t border-slate-50 pt-5 sm:pt-0 sm:border-0">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Initial</p>
                        <p className="font-bold text-slate-400 tabular-nums">${card.originalBalance.toFixed(2)}</p>
                      </div>

                      <div className="text-right min-w-[120px]">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Current</p>
                        {editingCardId === card.id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              autoFocus
                              type="number"
                              step="0.01"
                              className="w-28 bg-blue-50 border-2 border-blue-500 rounded-xl px-3 py-2 text-right font-black text-slate-900 outline-none text-lg"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveEdit(card.id);
                                if (e.key === 'Escape') setEditingCardId(null);
                              }}
                            />
                            <button onClick={() => saveEdit(card.id)} className="p-2 bg-emerald-500 text-white rounded-xl active-scale">
                              <Check className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-3 cursor-pointer group" onClick={() => startEditing(card)}>
                            <p className="font-black text-slate-900 text-2xl tabular-nums tracking-tight">${card.currentBalance.toFixed(2)}</p>
                            <div className="p-2 bg-slate-50 rounded-lg group-active:bg-blue-100 transition-colors">
                              <Edit2 className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => setCards(cards.filter(c => c.id !== card.id))} 
                        className="p-3 text-slate-300 hover:text-red-500 active-scale"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cash Section */}
        <div className="space-y-5">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <div className="bg-emerald-600 p-1.5 rounded-lg"><Banknote className="w-5 h-5 text-white" /></div>
              Cash Funds
            </h3>
            <button 
              onClick={() => setIsAddingCash(true)}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white font-black rounded-2xl active-scale shadow-lg shadow-emerald-900/10 text-sm tracking-wide"
            >
              <Plus className="w-4 h-4" />
              Add Cash
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {cashEntries.length === 0 ? (
                <div className="p-16 text-center text-slate-400 font-bold italic opacity-60">
                  <Banknote className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  Track physical savings or change jars.
                </div>
              ) : (
                cashEntries.map(entry => (
                  <div key={entry.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors active:bg-slate-100">
                    <div className="flex items-center gap-5">
                      <div className="bg-emerald-50 p-4 rounded-[1.25rem] text-emerald-600 border border-emerald-100">
                        <Banknote className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg leading-tight">{entry.description}</p>
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-black uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(entry.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">SAVED</p>
                        <p className="text-2xl font-black text-slate-900 tabular-nums tracking-tight">${entry.amount.toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={() => setCashEntries(cashEntries.filter(e => e.id !== entry.id))} 
                        className="p-3 text-slate-300 hover:text-red-500 active-scale"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern High-Performance Modals Optimized for iOS */}
      {(isAddingCard || isAddingCash) && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
          <div 
            className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 sm:p-12 max-w-xl w-full shadow-2xl safe-pb animate-in slide-in-from-bottom-8 duration-500"
            onClick={e => e.stopPropagation()}
          >
            {isAddingCard ? (
              <>
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-blue-600 p-2.5 rounded-2xl"><CreditCard className="w-7 h-7 text-white" /></div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Register Card</h3>
                </div>
                <p className="text-slate-400 font-bold mb-10">Safe and secure local storage only.</p>
                <form onSubmit={handleAddCard} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Vendor / Source</label>
                      <input 
                        autoFocus
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-bold transition-all text-lg"
                        placeholder="e.g. AARP, Amazon, Sam's Club"
                        value={newCard.source}
                        onChange={e => setNewCard({...newCard, source: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Card Number (Last 4)</label>
                      <input 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-bold transition-all text-lg"
                        placeholder="****"
                        value={newCard.cardNumber}
                        onChange={e => setNewCard({...newCard, cardNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">PIN Code</label>
                      <input 
                        type="password"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-bold transition-all text-lg"
                        placeholder="Optional"
                        value={newCard.pin}
                        onChange={e => setNewCard({...newCard, pin: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Original $</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-black transition-all text-lg"
                        placeholder="0.00"
                        value={newCard.originalBalance || ''}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setNewCard({...newCard, originalBalance: val, currentBalance: val});
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Current $</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-black transition-all text-lg"
                        placeholder="0.00"
                        value={newCard.currentBalance || ''}
                        onChange={e => setNewCard({...newCard, currentBalance: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setIsAddingCard(false)} className="flex-1 bg-slate-100 py-5 rounded-[1.5rem] font-black text-slate-500 active-scale">Cancel</button>
                    <button type="submit" className="flex-1 bg-blue-600 py-5 rounded-[1.5rem] font-black text-white shadow-2xl shadow-blue-900/20 active-scale">Save Card</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-emerald-600 p-2.5 rounded-2xl"><Banknote className="w-7 h-7 text-white" /></div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Add Cash</h3>
                </div>
                <p className="text-slate-400 font-bold mb-10">Record physical savings for the trip.</p>
                <form onSubmit={handleAddCash} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Saving Description</label>
                    <input 
                      autoFocus
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 font-bold transition-all text-lg"
                      placeholder="e.g. Weekly Stash, Piggy Bank"
                      value={newCash.description}
                      onChange={e => setNewCash({...newCash, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Amount ($)</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 font-black transition-all text-xl"
                        placeholder="0.00"
                        value={newCash.amount || ''}
                        onChange={e => setNewCash({...newCash, amount: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Date</label>
                      <input 
                        type="date"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 font-bold text-slate-500 transition-all text-lg"
                        value={newCash.dateAdded}
                        onChange={e => setNewCash({...newCash, dateAdded: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setIsAddingCash(false)} className="flex-1 bg-slate-100 py-5 rounded-[1.5rem] font-black text-slate-500 active-scale">Cancel</button>
                    <button type="submit" className="flex-1 bg-emerald-600 py-5 rounded-[1.5rem] font-black text-white shadow-2xl shadow-emerald-900/20 active-scale">Save Cash</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};