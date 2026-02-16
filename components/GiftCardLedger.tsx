
import React, { useState, useMemo, useEffect } from 'react';
import { GiftCard } from '../types';
import { Plus, Trash2, Wallet, CreditCard, DollarSign, Calendar, Globe, CheckCircle, TrendingUp, Target, Receipt } from 'lucide-react';

interface Props {
  projectedTripCost: number;
  onUpdateProjectedCost: (cost: number) => void;
}

export const GiftCardLedger: React.FC<Props> = ({ projectedTripCost, onUpdateProjectedCost }) => {
  const [cards, setCards] = useState<GiftCard[]>(() => {
    const saved = localStorage.getItem('cruise_gift_cards');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newCard, setNewCard] = useState<Partial<GiftCard>>({
    cardNumber: '',
    pin: '',
    originalBalance: 0,
    currentBalance: 0,
    source: '',
    dateReceived: new Date().toISOString().split('T')[0],
    dateCompleted: '',
  });

  useEffect(() => {
    localStorage.setItem('cruise_gift_cards', JSON.stringify(cards));
  }, [cards]);

  const stats = useMemo(() => {
    const totalAvailable = cards.reduce((sum, card) => sum + card.currentBalance, 0);
    const totalOriginal = cards.reduce((sum, card) => sum + card.originalBalance, 0);
    const totalSpent = totalOriginal - totalAvailable;
    const remainingGoal = Math.max(0, projectedTripCost - totalAvailable);
    const progressPercent = Math.min(100, (totalAvailable / projectedTripCost) * 100);

    return { totalAvailable, totalSpent, remainingGoal, progressPercent };
  }, [cards, projectedTripCost]);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCard.cardNumber && newCard.pin && newCard.source && newCard.dateReceived) {
      const card: GiftCard = {
        id: Math.random().toString(36).substr(2, 9),
        cardNumber: newCard.cardNumber || '',
        pin: newCard.pin || '',
        originalBalance: Number(newCard.originalBalance) || 0,
        currentBalance: Number(newCard.currentBalance) || 0,
        source: newCard.source || '',
        dateReceived: newCard.dateReceived || '',
        dateCompleted: newCard.dateCompleted || undefined,
      };
      setCards([...cards, card]);
      setNewCard({ 
        cardNumber: '', 
        pin: '', 
        originalBalance: 0, 
        currentBalance: 0, 
        source: '', 
        dateReceived: new Date().toISOString().split('T')[0],
        dateCompleted: '' 
      });
      setIsAdding(false);
    }
  };

  const removeCard = (id: string) => {
    if (confirm('Remove this card from the ledger?')) {
      setCards(cards.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
            <h3 className="font-bold text-slate-800">Total Available</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 tabular-nums">
            ${stats.totalAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-semibold uppercase tracking-wider">Ready to spend</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Receipt className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg"><DollarSign className="w-5 h-5 text-orange-600" /></div>
            <h3 className="font-bold text-slate-800">Total Spent</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 tabular-nums">
            ${stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-semibold uppercase tracking-wider">Applied to trip</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg"><Target className="w-5 h-5 text-purple-600" /></div>
            <h3 className="font-bold text-slate-800">Goal Gap</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 tabular-nums">
            ${stats.remainingGoal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-semibold uppercase tracking-wider">Remaining for trip</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-400 text-sm uppercase tracking-widest">Savings Progress</h3>
              <button 
                onClick={() => setIsEditingGoal(true)}
                className="text-blue-400 text-[10px] font-black uppercase hover:text-blue-300 transition-colors"
              >
                Edit Target
              </button>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <p className="text-3xl font-black text-white">{Math.round(stats.progressPercent)}%</p>
              <p className="text-xs text-slate-500 mb-1 font-bold">of ${projectedTripCost.toLocaleString()}</p>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Goal Editor Modal */}
      {isEditingGoal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-6">Update Trip Budget</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Projected Trip Cost</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="number"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-4 focus:border-blue-500 outline-none transition-all font-black text-2xl"
                    value={projectedTripCost}
                    onChange={(e) => onUpdateProjectedCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <button 
                onClick={() => setIsEditingGoal(false)}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all"
              >
                Save Target Cost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Card Button & Main List */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-900">Card Inventory</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="font-bold uppercase tracking-wider text-xs">Register Card</span>
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">New Card Entry</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Source (Store/Site)</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    autoFocus
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-9 pr-4 py-3 focus:border-blue-500 outline-none transition-all font-medium"
                    placeholder="e.g. Amazon, Carnival.com, AARP"
                    value={newCard.source}
                    onChange={e => setNewCard({...newCard, source: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Card Number</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all font-medium"
                    placeholder="6006..."
                    value={newCard.cardNumber}
                    onChange={e => setNewCard({...newCard, cardNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">PIN</label>
                  <input 
                    required
                    type="password"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all font-medium"
                    placeholder="****"
                    value={newCard.pin}
                    onChange={e => setNewCard({...newCard, pin: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date Received</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date"
                      required
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-9 pr-4 py-3 focus:border-blue-500 outline-none transition-all font-medium"
                      value={newCard.dateReceived}
                      onChange={e => setNewCard({...newCard, dateReceived: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date Completed (Optional)</label>
                  <div className="relative">
                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-9 pr-4 py-3 focus:border-blue-500 outline-none transition-all font-medium"
                      value={newCard.dateCompleted}
                      onChange={e => setNewCard({...newCard, dateCompleted: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Orig. Balance</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number"
                      step="0.01"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-9 pr-4 py-3 focus:border-blue-500 outline-none transition-all font-medium"
                      placeholder="0.00"
                      value={newCard.originalBalance || ''}
                      onChange={e => setNewCard({...newCard, originalBalance: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Curr. Balance</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number"
                      step="0.01"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-9 pr-4 py-3 focus:border-blue-500 outline-none transition-all font-medium"
                      placeholder="0.00"
                      value={newCard.currentBalance || ''}
                      onChange={e => setNewCard({...newCard, currentBalance: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all mt-6">
                Save Gift Card
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Source & Timeline</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Card Details</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Balances</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cards.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center opacity-40">
                    <CreditCard className="w-12 h-12 mb-4" />
                    <p className="font-bold text-slate-500">No gift cards tracked yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              cards.map(card => (
                <tr key={card.id} className={`hover:bg-slate-50 transition-colors group ${card.dateCompleted ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase tracking-wider">
                        {card.source}
                      </span>
                      {card.dateCompleted && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" /> Done
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col text-[11px] font-bold text-slate-400 space-y-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Received: {new Date(card.dateReceived).toLocaleDateString()}
                      </span>
                      {card.dateCompleted && (
                        <span className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle className="w-3 h-3" /> Finished: {new Date(card.dateCompleted).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 font-mono tracking-tighter">
                      **** **** **** {card.cardNumber.slice(-4)}
                    </p>
                    <p className="text-xs text-slate-400 font-semibold">PIN: {card.pin.replace(/./g, '*')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase">Orig: ${card.originalBalance.toFixed(2)}</span>
                      <span className={`font-black ${card.currentBalance > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        Rem: ${card.currentBalance.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => removeCard(card.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
