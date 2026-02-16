
import React, { useState, useMemo } from 'react';
import { GiftCard } from '../types';
import { Plus, Trash2, Wallet, CreditCard, DollarSign } from 'lucide-react';

export const GiftCardLedger: React.FC = () => {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCard, setNewCard] = useState<Partial<GiftCard>>({
    cardNumber: '',
    pin: '',
    originalBalance: 0,
    currentBalance: 0,
  });

  const totalFund = useMemo(() => {
    return cards.reduce((sum, card) => sum + card.currentBalance, 0);
  }, [cards]);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCard.cardNumber && newCard.pin) {
      const card: GiftCard = {
        id: Math.random().toString(36).substr(2, 9),
        cardNumber: newCard.cardNumber || '',
        pin: newCard.pin || '',
        originalBalance: Number(newCard.originalBalance) || 0,
        currentBalance: Number(newCard.currentBalance) || 0,
      };
      setCards([...cards, card]);
      setNewCard({ cardNumber: '', pin: '', originalBalance: 0, currentBalance: 0 });
      setIsAdding(false);
    }
  };

  const removeCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg"><Wallet className="w-5 h-5 text-blue-600" /></div>
            <h3 className="font-bold text-slate-800">Total Fund</h3>
          </div>
          <p className="text-4xl font-black text-slate-900 tabular-nums">
            ${totalFund.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-semibold">Consolidated Gift Card Balance</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg"><CreditCard className="w-5 h-5 text-indigo-600" /></div>
            <h3 className="font-bold text-slate-800">Active Cards</h3>
          </div>
          <p className="text-4xl font-black text-slate-900 tabular-nums">{cards.length}</p>
          <p className="text-xs text-slate-400 mt-2 font-semibold">Physical & Digital Assets</p>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 p-6 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors flex flex-col items-center justify-center text-white group"
        >
          <div className="bg-white/20 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold uppercase tracking-wider text-sm">Add New Gift Card</span>
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Add Card</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><Trash2 className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Card Number</label>
                <input 
                  autoFocus
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

      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Card Details</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Original</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Remaining</th>
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
                <tr key={card.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 font-mono tracking-tighter">
                      **** **** **** {card.cardNumber.slice(-4)}
                    </p>
                    <p className="text-xs text-slate-400 font-semibold">PIN: {card.pin.replace(/./g, '*')}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-500">${card.originalBalance.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="font-black text-emerald-600">${card.currentBalance.toFixed(2)}</span>
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
