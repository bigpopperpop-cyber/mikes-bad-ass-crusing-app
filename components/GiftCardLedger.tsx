
import React, { useState, useMemo, useEffect } from 'react';
import { GiftCard, CashEntry } from '../types';
import { Plus, Trash2, Wallet, CreditCard, DollarSign, Calendar, Globe, CheckCircle, TrendingUp, Target, Receipt, Banknote, Coins, Edit2, Check, X, Eye, EyeOff, Copy, ClipboardCheck } from 'lucide-react';

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
  const [revealedCardIds, setRevealedCardIds] = useState<Set<string>>(new Set());
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null); 
  
  const [cardFormData, setCardFormData] = useState<Partial<GiftCard>>({
    cardNumber: '', accessCode: '', originalBalance: 0, currentBalance: 0, source: '',
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

  const toggleReveal = (id: string) => {
    const newSet = new Set(revealedCardIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setRevealedCardIds(newSet);
  };

  const copyToClipboard = (text: string, id: string, type: 'number' | 'code') => {
    navigator.clipboard.writeText(text);
    const feedbackKey = `${id}-${type}`;
    setCopyFeedback(feedbackKey);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardFormData.cardNumber && cardFormData.source) {
      if (editingCardId) {
        setCards(cards.map(c => c.id === editingCardId ? { ...c, ...cardFormData } as GiftCard : c));
        setEditingCardId(null);
      } else {
        const card: GiftCard = {
          id: Math.random().toString(36).substr(2, 9),
          cardNumber: cardFormData.cardNumber || '',
          accessCode: cardFormData.accessCode || '',
          originalBalance: Number(cardFormData.originalBalance) || 0,
          currentBalance: Number(cardFormData.currentBalance) || 0,
          source: cardFormData.source || '',
          dateReceived: cardFormData.dateReceived || '',
        };
        setCards([...cards, card]);
      }
      setIsAddingCard(false);
      resetCardForm();
    }
  };

  const resetCardForm = () => {
    setCardFormData({ 
      cardNumber: '', accessCode: '', originalBalance: 0, currentBalance: 0, source: '', 
      dateReceived: new Date().toISOString().split('T')[0] 
    });
  };

  const startEditing = (card: GiftCard) => {
    setCardFormData({ ...card });
    setEditingCardId(card.id);
    setIsAddingCard(true);
  };

  const removeCard = (id: string) => {
    if (window.confirm('Are you sure you want to remove this gift card? This action cannot be undone.')) {
      setCards(cards.filter(c => c.id !== id));
      const newSet = new Set(revealedCardIds);
      newSet.delete(id);
      setRevealedCardIds(newSet);
    }
  };

  const removeCashEntry = (id: string) => {
    if (window.confirm('Are you sure you want to delete this cash entry?')) {
      setCashEntries(cashEntries.filter(e => e.id !== id));
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

  const formatCardNumber = (num: string, revealed: boolean) => {
    if (revealed) return num.match(/.{1,4}/g)?.join(' ') || num;
    const last4 = num.slice(-4);
    const masked = num.slice(0, -4).replace(/./g, '•');
    const fullMasked = masked + last4;
    return fullMasked.match(/.{1,4}/g)?.join(' ') || fullMasked;
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700">
      {/* Financial Summary Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { icon: CreditCard, color: 'blue', label: 'Gift Cards', value: stats.giftCardAvailable },
          { icon: Banknote, color: 'emerald', label: 'Cash Savings', value: stats.cashTotal },
          { icon: Wallet, color: 'purple', label: 'Total Funds', value: stats.totalSaved },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 sm:p-7 rounded-[2rem] border-2 border-slate-200 shadow-sm relative overflow-hidden">
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
              onClick={() => { resetCardForm(); setEditingCardId(null); setIsAddingCard(true); }}
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
                cards.map(card => {
                  const revealed = revealedCardIds.has(card.id);
                  const isNumberCopied = copyFeedback === `${card.id}-number`;
                  const isCodeCopied = copyFeedback === `${card.id}-code`;

                  return (
                    <div key={card.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between transition-colors active:bg-slate-50 relative group">
                      <div className="flex items-start gap-5 mb-5 sm:mb-0">
                        <div className="bg-slate-50 p-4 rounded-[1.25rem] text-slate-400 border border-slate-100 shrink-0">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 text-xl leading-none">{card.source}</p>
                          <div className="flex items-center gap-2 mt-2 group/num relative">
                            <button 
                              onClick={() => copyToClipboard(card.cardNumber, card.id, 'number')}
                              className={`text-[13px] font-mono font-bold uppercase tracking-wider px-2 py-1 -ml-2 rounded-lg transition-all text-left flex items-center gap-2 ${isNumberCopied ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
                              title="Click to copy card number"
                            >
                              {formatCardNumber(card.cardNumber, revealed)}
                              {isNumberCopied ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-0 group-hover/num:opacity-100" />}
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleReveal(card.id); }}
                              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-colors shrink-0"
                              title={revealed ? "Hide code" : "Show code"}
                            >
                              {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          {card.accessCode && (
                            <div className="flex items-center gap-2 mt-1">
                               <button 
                                 onClick={() => copyToClipboard(card.accessCode, card.id, 'code')}
                                 className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 -ml-2 rounded flex items-center gap-1.5 transition-all ${isCodeCopied ? 'bg-emerald-50 text-emerald-600' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
                                 title="Click to copy Access Code"
                               >
                                 Access Code: {revealed ? card.accessCode : '••••'}
                                 {isCodeCopied && <Check className="w-3 h-3" />}
                               </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 border-t border-slate-50 pt-5 sm:pt-0 sm:border-0">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Initial</p>
                          <p className="font-bold text-slate-400 tabular-nums">${card.originalBalance.toFixed(2)}</p>
                        </div>

                        <div className="text-right min-w-[120px]">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Current</p>
                          <p className="font-black text-slate-900 text-2xl tabular-nums tracking-tight">${card.currentBalance.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => startEditing(card)} 
                            className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active-scale"
                            title="Edit full card details"
                          >
                            <Edit2 className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => removeCard(card.id)} 
                            className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active-scale"
                            title="Remove Card"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
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
                  <div key={entry.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors active:bg-slate-100 group">
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
                        onClick={() => removeCashEntry(entry.id)} 
                        className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active-scale"
                        aria-label="Remove Cash"
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

      {/* Modern Modals */}
      {(isAddingCard || isAddingCash) && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300" onClick={() => { setIsAddingCard(false); setIsAddingCash(false); }}>
          <div 
            className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 sm:p-12 max-w-xl w-full shadow-2xl safe-pb animate-in slide-in-from-bottom-8 duration-500"
            onClick={e => e.stopPropagation()}
          >
            {isAddingCard ? (
              <>
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-blue-600 p-2.5 rounded-2xl"><CreditCard className="w-7 h-7 text-white" /></div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{editingCardId ? 'Edit Card' : 'Register Card'}</h3>
                </div>
                <p className="text-slate-400 font-bold mb-10">Updating details for local storage.</p>
                <form onSubmit={handleSaveCard} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Vendor / Source</label>
                      <input 
                        autoFocus
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-bold transition-all text-lg"
                        placeholder="e.g. AARP, Amazon, Sam's Club"
                        value={cardFormData.source}
                        onChange={e => setCardFormData({...cardFormData, source: e.target.value})}
                        required
                        autoComplete="off"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Full Card Number</label>
                      <input 
                        type="text"
                        inputMode="numeric"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-bold transition-all text-lg tracking-widest font-mono"
                        placeholder="Enter all digits"
                        value={cardFormData.cardNumber}
                        onChange={e => setCardFormData({...cardFormData, cardNumber: e.target.value.replace(/\D/g, '')})}
                        required
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Access Code</label>
                      <input 
                        type="text"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-bold transition-all text-lg font-mono"
                        placeholder="e.g. 1234"
                        value={cardFormData.accessCode}
                        onChange={e => setCardFormData({...cardFormData, accessCode: e.target.value})}
                        autoComplete="off"
                      />
                    </div>
                    <div className="hidden sm:block"></div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Original Balance ($)</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-black transition-all text-lg"
                        placeholder="0.00"
                        value={cardFormData.originalBalance || ''}
                        onChange={e => setCardFormData({...cardFormData, originalBalance: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Current Balance ($)</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-black transition-all text-lg"
                        placeholder="0.00"
                        value={cardFormData.currentBalance || ''}
                        onChange={e => setCardFormData({...cardFormData, currentBalance: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setIsAddingCard(false)} className="flex-1 bg-slate-100 py-5 rounded-[1.5rem] font-black text-slate-500 active-scale">Cancel</button>
                    <button type="submit" className="flex-1 bg-blue-600 py-5 rounded-[1.5rem] font-black text-white shadow-2xl shadow-blue-900/20 active-scale">
                      {editingCardId ? 'Update Card' : 'Save Card'}
                    </button>
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
                      autoComplete="off"
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
                        onChange={e => setNewCash({...newCash, amount: parseFloat(e.target.value) || 0})}
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
