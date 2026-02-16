
import React, { useState, useMemo, useEffect } from 'react';
import { GiftCard, CashEntry } from '../types';
import { Plus, Trash2, Wallet, CreditCard, DollarSign, Calendar, Globe, CheckCircle, TrendingUp, Target, Receipt, Banknote, Coins, Edit2, Check, X } from 'lucide-react';

interface Props {
  projectedTripCost: number;
  onUpdateProjectedCost: (cost: number) => void;
}

export const GiftCardLedger: React.FC<Props> = ({ projectedTripCost }) => {
  // Gift Card State
  const [cards, setCards] = useState<GiftCard[]>(() => {
    const saved = localStorage.getItem('cruise_gift_cards');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Cash State
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
    const giftCardSpent = cards.reduce((sum, card) => sum + (card.originalBalance - card.currentBalance), 0);
    const cashTotal = cashEntries.reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalSaved = giftCardAvailable + cashTotal;
    const remainingGoal = Math.max(0, projectedTripCost - totalSaved);
    const progressPercent = projectedTripCost > 0 ? Math.min(100, (totalSaved / projectedTripCost) * 100) : 0;

    return { giftCardAvailable, giftCardSpent, cashTotal, totalSaved, remainingGoal, progressPercent };
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Financial Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg"><CreditCard className="w-5 h-5 text-blue-600" /></div>
            <h3 className="font-bold text-slate-800">Gift Cards</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 tabular-nums">
            ${stats.giftCardAvailable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-semibold uppercase tracking-wider">Available in Cards</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-100 p-2 rounded-lg"><Banknote className="w-5 h-5 text-emerald-600" /></div>
            <h3 className="font-bold text-slate-800">Cash Savings</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 tabular-nums">
            ${stats.cashTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-semibold uppercase tracking-wider">Total in Cash</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg"><Wallet className="w-5 h-5 text-purple-600" /></div>
            <h3 className="font-bold text-slate-800">Total Saved</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 tabular-nums">
            ${stats.totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-semibold uppercase tracking-wider">Cash + Cards</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-400 text-sm uppercase tracking-widest">Goal Progress</h3>
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-end gap-2 mb-2">
              <p className="text-3xl font-black text-white">{Math.round(stats.progressPercent)}%</p>
              <p className="text-xs text-slate-500 mb-1 font-bold">of ${projectedTripCost.toLocaleString()}</p>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
              ${stats.remainingGoal.toLocaleString()} remaining
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gift Card Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Gift Card Ledger
            </h3>
            <button 
              onClick={() => setIsAddingCard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Card
            </button>
          </div>

          <div className="bg-white rounded-[2rem] border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {cards.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm font-medium italic">
                  No cards registered yet. Add your AARP, Carnival, or other gift cards here!
                </div>
              ) : (
                cards.map(card => (
                  <div key={card.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg leading-tight">{card.source}</p>
                        <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-tighter">
                          Card ending in ****{card.cardNumber.slice(-4)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:gap-8 bg-slate-50/50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Original</p>
                        <p className="font-bold text-slate-500 tabular-nums">${card.originalBalance.toFixed(2)}</p>
                      </div>

                      <div className="text-right min-w-[100px]">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Current Balance</p>
                        {editingCardId === card.id ? (
                          <div className="flex items-center gap-1">
                            <input 
                              autoFocus
                              type="number"
                              step="0.01"
                              className="w-24 bg-white border-2 border-blue-500 rounded-lg px-2 py-1 text-right font-black text-slate-900 outline-none"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveEdit(card.id);
                                if (e.key === 'Escape') setEditingCardId(null);
                              }}
                            />
                            <button onClick={() => saveEdit(card.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md">
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 group/edit cursor-pointer" onClick={() => startEditing(card)}>
                            <p className="font-black text-slate-900 text-xl tabular-nums">${card.currentBalance.toFixed(2)}</p>
                            <Edit2 className="w-3 h-3 text-slate-300 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => setCards(cards.filter(c => c.id !== card.id))} 
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                        title="Delete Card"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cash Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-600" />
              Cash Savings
            </h3>
            <button 
              onClick={() => setIsAddingCash(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Cash
            </button>
          </div>

          <div className="bg-white rounded-[2rem] border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {cashEntries.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm font-medium italic">
                  No cash entries yet. Track your physical envelope or bank savings here!
                </div>
              ) : (
                cashEntries.map(entry => (
                  <div key={entry.id} className="p-6 flex items-center justify-between hover:bg-slate-50 group">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">{entry.description}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Amount</p>
                        <p className="text-xl font-black text-slate-900 tabular-nums">${entry.amount.toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={() => setCashEntries(cashEntries.filter(e => e.id !== entry.id))} 
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals for adding items */}
      {isAddingCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl scale-in-center border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Register Gift Card</h3>
            <p className="text-slate-400 text-sm font-medium mb-8">Enter your card details to track balances.</p>
            <form onSubmit={handleAddCard} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Vendor / Source</label>
                <input 
                  autoFocus
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 font-bold transition-all"
                  placeholder="e.g. AARP, Amazon, Sam's Club"
                  value={newCard.source}
                  onChange={e => setNewCard({...newCard, source: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Card Number</label>
                  <input 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 font-bold transition-all"
                    placeholder="Last 4-16 digits"
                    value={newCard.cardNumber}
                    onChange={e => setNewCard({...newCard, cardNumber: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">PIN</label>
                  <input 
                    type="password"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 font-bold transition-all"
                    placeholder="Optional PIN"
                    value={newCard.pin}
                    onChange={e => setNewCard({...newCard, pin: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Original Value</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                    <input 
                      type="number" step="0.01"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-8 pr-4 py-4 outline-none focus:border-blue-500 font-black transition-all"
                      placeholder="0.00"
                      value={newCard.originalBalance || ''}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        setNewCard({...newCard, originalBalance: val, currentBalance: val});
                      }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Current Value</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                    <input 
                      type="number" step="0.01"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-8 pr-4 py-4 outline-none focus:border-blue-500 font-black transition-all"
                      placeholder="0.00"
                      value={newCard.currentBalance || ''}
                      onChange={e => setNewCard({...newCard, currentBalance: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAddingCard(false)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">Save Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddingCash && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl scale-in-center border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
              <Banknote className="w-7 h-7 text-emerald-600" />
              Add Cash Savings
            </h3>
            <p className="text-slate-400 text-sm font-medium mb-8">Record physical cash or savings you've put aside.</p>
            <form onSubmit={handleAddCash} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <input 
                  autoFocus
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 font-bold transition-all"
                  placeholder="e.g. Weekly Savings, Tax Refund"
                  value={newCash.description}
                  onChange={e => setNewCash({...newCash, description: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                    <input 
                      type="number" step="0.01"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-8 pr-4 py-4 outline-none focus:border-emerald-500 font-black transition-all"
                      placeholder="0.00"
                      value={newCash.amount || ''}
                      onChange={e => setNewCash({...newCash, amount: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date Added</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 font-bold text-slate-500 transition-all"
                    value={newCash.dateAdded}
                    onChange={e => setNewCash({...newCash, dateAdded: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAddingCash(false)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all">Add Cash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
