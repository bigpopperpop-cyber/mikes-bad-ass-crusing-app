
import React, { useState, useMemo, useEffect } from 'react';
import { GiftCard, CashEntry } from '../types';
import { Plus, Trash2, Wallet, CreditCard, DollarSign, Calendar, Globe, CheckCircle, TrendingUp, Target, Receipt, Banknote, Coins } from 'lucide-react';

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
    const progressPercent = Math.min(100, (totalSaved / projectedTripCost) * 100);

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
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Gift Card Ledger
            </h3>
            <button 
              onClick={() => setIsAddingCard(true)}
              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {cards.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm italic">No cards registered</div>
              ) : (
                cards.map(card => (
                  <div key={card.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-900">{card.source}</p>
                      <p className="text-xs font-mono text-slate-400">****{card.cardNumber.slice(-4)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-black text-slate-900">${card.currentBalance.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Balance</p>
                      </div>
                      <button onClick={() => setCards(cards.filter(c => c.id !== card.id))} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
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
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-600" />
              Cash Savings
            </h3>
            <button 
              onClick={() => setIsAddingCash(true)}
              className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {cashEntries.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm italic">No cash entries yet</div>
              ) : (
                cashEntries.map(entry => (
                  <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-900">{entry.description}</p>
                      <p className="text-xs text-slate-400">{new Date(entry.dateAdded).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-black text-emerald-600">${entry.amount.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Added</p>
                      </div>
                      <button onClick={() => setCashEntries(cashEntries.filter(e => e.id !== entry.id))} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Register Gift Card</h3>
            <form onSubmit={handleAddCard} className="space-y-4">
              <input 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold"
                placeholder="Source (e.g. AARP, Amazon)"
                value={newCard.source}
                onChange={e => setNewCard({...newCard, source: e.target.value})}
                required
              />
              <input 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold"
                placeholder="Card Number"
                value={newCard.cardNumber}
                onChange={e => setNewCard({...newCard, cardNumber: e.target.value})}
                required
              />
              <input 
                type="password"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold"
                placeholder="PIN"
                value={newCard.pin}
                onChange={e => setNewCard({...newCard, pin: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" step="0.01"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold"
                  placeholder="Original Balance"
                  value={newCard.originalBalance || ''}
                  onChange={e => setNewCard({...newCard, originalBalance: parseFloat(e.target.value)})}
                  required
                />
                <input 
                  type="number" step="0.01"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold"
                  placeholder="Current Balance"
                  value={newCard.currentBalance || ''}
                  onChange={e => setNewCard({...newCard, currentBalance: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAddingCard(false)} className="flex-1 bg-slate-100 py-4 rounded-xl font-bold text-slate-600">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 py-4 rounded-xl font-bold text-white shadow-lg">Save Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddingCash && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Banknote className="w-7 h-7 text-emerald-600" />
              Add Cash Savings
            </h3>
            <form onSubmit={handleAddCash} className="space-y-4">
              <input 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold"
                placeholder="Description (e.g. Weekly Savings)"
                value={newCash.description}
                onChange={e => setNewCash({...newCash, description: e.target.value})}
                required
              />
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="number" step="0.01"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-emerald-500 font-bold"
                  placeholder="Amount"
                  value={newCash.amount || ''}
                  onChange={e => setNewCash({...newCash, amount: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <input 
                type="date"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold text-slate-500"
                value={newCash.dateAdded}
                onChange={e => setNewCash({...newCash, dateAdded: e.target.value})}
                required
              />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAddingCash(false)} className="flex-1 bg-slate-100 py-4 rounded-xl font-bold text-slate-600">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 py-4 rounded-xl font-bold text-white shadow-lg">Add Cash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
