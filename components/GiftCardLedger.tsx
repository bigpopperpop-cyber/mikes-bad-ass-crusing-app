
import React, { useState, useMemo, useEffect } from 'react';
import { GiftCard, CashEntry, GiftCardLog, Expense, CreditCardEntry } from '../types';
import { Plus, Trash2, Wallet, CreditCard, DollarSign, Calendar, Globe, CheckCircle, TrendingUp, Target, Receipt, Banknote, Coins, Edit2, Check, X, Eye, EyeOff, Copy, ClipboardCheck, CheckCircle2, History, ChevronDown, ChevronUp, ShoppingCart, Tag, ArrowDownRight, PieChart, BarChart3, CreditCard as CreditCardIcon, FileText, Key, Hash } from 'lucide-react';

interface Props {
  projectedTripCost: number;
  onUpdateProjectedCost: (cost: number) => void;
  expenses: Expense[];
}

export const GiftCardLedger: React.FC<Props> = ({ projectedTripCost, expenses }) => {
  const [cards, setCards] = useState<GiftCard[]>(() => {
    const saved = localStorage.getItem('cruise_gift_cards');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [cashEntries, setCashEntries] = useState<CashEntry[]>(() => {
    const saved = localStorage.getItem('cruise_cash_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [creditEntries, setCreditEntries] = useState<CreditCardEntry[]>(() => {
    const saved = localStorage.getItem('cruise_credit_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isAddingCash, setIsAddingCash] = useState(false);
  const [isAddingCredit, setIsAddingCredit] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [revealedCardIds, setRevealedCardIds] = useState<Set<string>>(new Set());
  const [expandedRegisterId, setExpandedRegisterId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null); 
  const [showBreakdown, setShowBreakdown] = useState(true);
  
  // Register Form State
  const [logFormData, setLogFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    notes: ''
  });

  const [cardFormData, setCardFormData] = useState<Partial<GiftCard>>({
    cardNumber: '', accessCode: '', originalBalance: 0, currentBalance: 0, source: '',
    dateReceived: new Date().toISOString().split('T')[0]
  });

  const [newCash, setNewCash] = useState<Partial<CashEntry>>({
    description: '', amount: 0, dateAdded: new Date().toISOString().split('T')[0]
  });

  const [newCredit, setNewCredit] = useState<Partial<CreditCardEntry>>({
    last4: '', amount: 0, date: new Date().toISOString().split('T')[0], description: '', notes: ''
  });

  useEffect(() => {
    localStorage.setItem('cruise_gift_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('cruise_cash_entries', JSON.stringify(cashEntries));
  }, [cashEntries]);

  useEffect(() => {
    localStorage.setItem('cruise_credit_entries', JSON.stringify(creditEntries));
  }, [creditEntries]);

  const stats = useMemo(() => {
    const activeGiftCardCurrentBalance = cards.reduce((sum, card) => {
      return card.dateCompleted ? sum : sum + card.currentBalance;
    }, 0);
    const cashTotal = cashEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const availableToSpend = activeGiftCardCurrentBalance + cashTotal;

    const totalInitialGiftCards = cards.reduce((sum, card) => sum + card.originalBalance, 0);
    const totalProgressValue = totalInitialGiftCards + cashTotal;
    const progressPercent = projectedTripCost > 0 ? Math.min(100, (totalProgressValue / projectedTripCost) * 100) : 0;
    
    const totalSpentFromCards = cards.reduce((sum, card) => {
      return sum + (card.originalBalance - card.currentBalance);
    }, 0);

    const totalSpentFromCredit = creditEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const grandTotalSpent = totalSpentFromCards + totalSpentFromCredit;

    // Group spending by allocation (description)
    const spendingByAllocation: Record<string, { spent: number; planned: number }> = {};
    
    // Initialize with planned expenses
    expenses.forEach(exp => {
      spendingByAllocation[exp.description] = { spent: 0, planned: exp.amount };
    });

    // Aggregate from card logs
    cards.forEach(card => {
      card.logs?.forEach(log => {
        if (!spendingByAllocation[log.description]) {
          spendingByAllocation[log.description] = { spent: 0, planned: 0 };
        }
        spendingByAllocation[log.description].spent += log.amount;
      });
    });

    // Aggregate from credit card entries
    creditEntries.forEach(entry => {
      if (!spendingByAllocation[entry.description]) {
        spendingByAllocation[entry.description] = { spent: 0, planned: 0 };
      }
      spendingByAllocation[entry.description].spent += entry.amount;
    });

    return { 
      availableToSpend, 
      cashTotal, 
      totalProgressValue, 
      progressPercent, 
      totalSpentOffCards: grandTotalSpent,
      activeGiftCardCurrentBalance,
      spendingByAllocation: Object.entries(spendingByAllocation)
        .sort((a, b) => b[1].spent - a[1].spent)
    };
  }, [cards, cashEntries, creditEntries, projectedTripCost, expenses]);

  const toggleReveal = (id: string) => {
    const newSet = new Set(revealedCardIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setRevealedCardIds(newSet);
  };

  const toggleComplete = (id: string) => {
    setCards(cards.map(card => {
      if (card.id === id) {
        return {
          ...card,
          dateCompleted: card.dateCompleted ? undefined : new Date().toISOString(),
        };
      }
      return card;
    }));
  };

  const addLogEntry = (cardId: string) => {
    if (!logFormData.amount || !logFormData.description) return;
    
    const amount = parseFloat(logFormData.amount);
    
    setCards(cards.map(card => {
      if (card.id === cardId) {
        const newLog: GiftCardLog = {
          id: Math.random().toString(36).substr(2, 9),
          date: logFormData.date,
          amount: amount,
          description: logFormData.description,
          notes: logFormData.notes.trim() || undefined
        };
        const currentLogs = card.logs || [];
        return {
          ...card,
          currentBalance: Math.max(0, card.currentBalance - amount),
          logs: [newLog, ...currentLogs]
        };
      }
      return card;
    }));

    setLogFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      notes: ''
    });
  };

  const removeLogEntry = (cardId: string, logId: string) => {
    if (!window.confirm('Remove this transaction and restore balance?')) return;
    setCards(cards.map(card => {
      if (card.id === cardId) {
        const logToRemove = card.logs?.find(l => l.id === logId);
        const filteredLogs = card.logs?.filter(l => l.id !== logId) || [];
        return {
          ...card,
          currentBalance: card.currentBalance + (logToRemove?.amount || 0),
          logs: filteredLogs
        };
      }
      return card;
    }));
  };

  const handleAddCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCredit.description && newCredit.amount && newCredit.last4) {
      const entry: CreditCardEntry = {
        id: Math.random().toString(36).substr(2, 9),
        last4: newCredit.last4 || '',
        amount: Number(newCredit.amount) || 0,
        date: newCredit.date || '',
        description: newCredit.description || '',
        notes: newCredit.notes?.trim() || undefined
      };
      setCreditEntries([entry, ...creditEntries]);
      setIsAddingCredit(false);
      setNewCredit({ last4: '', amount: 0, date: new Date().toISOString().split('T')[0], description: '', notes: '' });
    }
  };

  const removeCreditEntry = (id: string) => {
    if (window.confirm('Delete this credit card transaction?')) {
      setCreditEntries(creditEntries.filter(e => e.id !== id));
    }
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
          dateReceived: cardFormData.dateReceived || new Date().toISOString().split('T')[0],
          logs: []
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

  const formatPin = (pin: string, revealed: boolean) => {
    if (revealed) return pin;
    return pin.replace(/./g, '•');
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700">
      {/* Financial Summary Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { icon: Wallet, color: 'blue', label: 'Available to Spend', value: stats.availableToSpend, sub: 'Active Cards + Cash' },
          { icon: Banknote, color: 'emerald', label: 'Cash Savings', value: stats.cashTotal, sub: 'Total Stashed Cash' },
          { icon: History, color: 'amber', label: 'Total Spending Logged', value: stats.totalSpentOffCards, sub: 'From Cards & Credit' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 sm:p-7 rounded-[2rem] border-2 border-slate-200 shadow-sm relative overflow-hidden group">
            <div className={`bg-${item.color}-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
              <item.icon className={`w-6 h-6 text-${item.color}-600`} />
            </div>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-3xl font-black text-slate-900 tabular-nums">
              ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-300 font-bold mt-2 uppercase tracking-wide">{item.sub}</p>
          </div>
        ))}

        <div className="bg-slate-900 p-5 sm:p-7 rounded-[2rem] shadow-2xl flex flex-col justify-between border-b-4 border-blue-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Acquisition Goal Progress</h3>
              <div className="bg-blue-600/20 p-1.5 rounded-lg"><Target className="w-4 h-4 text-blue-400" /></div>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <p className="text-4xl font-black text-white">{Math.round(stats.progressPercent)}%</p>
              <p className="text-[10px] text-slate-500 mb-1.5 font-black uppercase tracking-wider">Saved ${stats.totalProgressValue.toLocaleString()}</p>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out" 
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[11px] text-blue-400 font-black uppercase tracking-widest">
                Goal: ${projectedTripCost.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                Used: ${stats.totalSpentOffCards.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Spending Breakdown Summary */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10 animate-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Spending Breakdown</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Combined Results Across All Funds</p>
            </div>
          </div>
          <button 
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl uppercase tracking-widest active-scale"
          >
            {showBreakdown ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>

        {showBreakdown && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.spendingByAllocation.length === 0 ? (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                <BarChart3 className="w-10 h-10 mx-auto text-slate-200 mb-2" />
                <p className="text-sm font-bold text-slate-400">No transactions recorded yet.</p>
              </div>
            ) : (
              stats.spendingByAllocation.map(([name, data]) => {
                const percentOfPlanned = data.planned > 0 ? (data.spent / data.planned) * 100 : 0;
                const isOver = data.planned > 0 && data.spent > data.planned;

                return (
                  <div key={name} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between group hover:bg-white hover:border-blue-200 transition-all">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-slate-900 uppercase tracking-tight truncate leading-tight">{name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Allocation Group</p>
                        </div>
                        <div className={`p-2 rounded-lg ${isOver ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          <Receipt className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="flex items-end gap-2 mb-4">
                        <p className={`text-2xl font-black tabular-nums ${isOver ? 'text-red-600' : 'text-slate-900'}`}>
                          ${data.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        {data.planned > 0 && (
                          <p className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase">of ${data.planned.toLocaleString()} goal</p>
                        )}
                      </div>

                      {data.planned > 0 && (
                        <div className="space-y-2">
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${isOver ? 'bg-red-500' : 'bg-blue-600'}`}
                              style={{ width: `${Math.min(100, percentOfPlanned)}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className={isOver ? 'text-red-500' : 'text-slate-500'}>{Math.round(percentOfPlanned)}% Spent</span>
                            <span className="text-slate-400">
                              {isOver ? `Over by $${(data.spent - data.planned).toFixed(2)}` : `$${(data.planned - data.spent).toFixed(2)} Left`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
        {/* Gift Card Section */}
        <div className="space-y-5">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg"><CreditCardIcon className="w-5 h-5 text-white" /></div>
              Manage Gift Cards
            </h3>
            <button 
              onClick={() => { resetCardForm(); setEditingCardId(null); setIsAddingCard(true); }}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-black rounded-2xl active-scale shadow-lg shadow-blue-900/10 text-sm tracking-wide"
            >
              <Plus className="w-4 h-4" />
              Add Card
            </button>
          </div>

          <div className="space-y-4">
            {cards.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 p-20 text-center text-slate-400 font-bold italic opacity-60">
                <CreditCardIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                Register your cards to start saving.
              </div>
            ) : (
              cards.map(card => {
                const revealed = revealedCardIds.has(card.id);
                const isNumberCopied = copyFeedback === `${card.id}-number`;
                const isCodeCopied = copyFeedback === `${card.id}-code`;
                const isCompleted = !!card.dateCompleted;
                const isExpanded = expandedRegisterId === card.id;

                return (
                  <div key={card.id} className={`bg-white rounded-[2.5rem] border-2 shadow-sm transition-all overflow-hidden ${isCompleted ? 'border-emerald-100 opacity-80' : 'border-slate-200 hover:border-blue-300'}`}>
                    
                    {/* Main Card Content */}
                    <div className={`p-6 sm:p-8 flex flex-col gap-6 ${isCompleted ? 'bg-emerald-50/30' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                          <div className={`p-4 rounded-[1.5rem] border-2 shrink-0 transition-colors ${isCompleted ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <CreditCardIcon className="w-6 h-6" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-black text-xl sm:text-2xl leading-none truncate ${isCompleted ? 'text-emerald-900 line-through decoration-emerald-300' : 'text-slate-900'}`}>{card.source}</p>
                              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(card.dateReceived).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            
                            <div className="space-y-2 mt-4">
                              <div className="flex items-center gap-3">
                                <Hash className="w-4 h-4 text-slate-300 shrink-0" />
                                <button 
                                  onClick={() => copyToClipboard(card.cardNumber, card.id, 'number')}
                                  className={`text-[13px] sm:text-[14px] font-mono font-bold uppercase tracking-widest px-2.5 py-1.5 -ml-1 rounded-xl transition-all text-left flex items-center gap-2 ${isNumberCopied ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
                                  title="Copy Card Number"
                                >
                                  {formatCardNumber(card.cardNumber, revealed)}
                                  {isNumberCopied ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4 opacity-0 lg:group-hover:opacity-100" />}
                                </button>
                              </div>

                              <div className="flex items-center gap-3">
                                <Key className="w-4 h-4 text-slate-300 shrink-0" />
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => copyToClipboard(card.accessCode, card.id, 'code')}
                                    className={`text-[13px] sm:text-[14px] font-mono font-bold uppercase tracking-widest px-2.5 py-1.5 -ml-1 rounded-xl transition-all text-left flex items-center gap-2 ${isCodeCopied ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
                                    title="Copy Access Code"
                                  >
                                    PIN: {formatPin(card.accessCode, revealed)}
                                    {isCodeCopied ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4 opacity-0 lg:group-hover:opacity-100" />}
                                  </button>
                                  <button onClick={() => toggleReveal(card.id)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-300 hover:text-slate-600 transition-colors">
                                    {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button onClick={() => setExpandedRegisterId(isExpanded ? null : card.id)} className={`p-3 rounded-2xl transition-all ${isExpanded ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-blue-50 hover:text-blue-600'}`} title="Open Register">
                            <Receipt className="w-6 h-6" />
                          </button>
                          <button onClick={() => startEditing(card)} className="p-3 text-slate-300 hover:bg-slate-100 hover:text-slate-900 rounded-2xl transition-all"><Edit2 className="w-6 h-6" /></button>
                          <button onClick={() => removeCard(card.id)} className="p-3 text-slate-300 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all"><Trash2 className="w-6 h-6" /></button>
                        </div>
                      </div>

                      {/* Summary Balances at bottom of card */}
                      <div className="flex items-end justify-between pt-6 border-t border-slate-100">
                        <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Original Value</p>
                          <p className="font-bold text-slate-500 text-lg tabular-nums">${card.originalBalance.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCompleted ? 'text-emerald-500' : 'text-blue-600'}`}>Current Balance</p>
                          <p className={`text-3xl font-black tabular-nums tracking-tighter ${isCompleted ? 'text-emerald-700' : 'text-slate-900'}`}>${card.currentBalance.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Integrated Register / Transaction Stream */}
                    {isExpanded && (
                      <div className="bg-slate-50/50 border-t-2 border-slate-100 p-6 sm:p-8 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-xl"><History className="w-4 h-4 text-white" /></div>
                            <h4 className="text-base font-black text-slate-900 uppercase tracking-widest">Digital Register</h4>
                          </div>
                          <button onClick={() => toggleComplete(card.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500 hover:bg-emerald-600 hover:text-white'}`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : null}
                            {isCompleted ? 'Balance Retired' : 'Mark Balance Finished'}
                          </button>
                        </div>

                        {/* Transaction Entry Form */}
                        {!isCompleted && (
                          <div className="bg-white p-6 rounded-[1.75rem] border-2 border-slate-200 shadow-sm mb-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Log New Expenditure</p>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Allocation Item</label>
                                  <div className="relative">
                                    <select 
                                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 appearance-none pr-10"
                                      value={logFormData.description}
                                      onChange={e => setLogFormData({...logFormData, description: e.target.value})}
                                    >
                                      <option value="">Select Purpose...</option>
                                      {expenses.map((exp) => (
                                        <option key={exp.id} value={exp.description}>
                                          {exp.description} (${exp.amount.toLocaleString()})
                                        </option>
                                      ))}
                                      <option value="General Spending">General Spending</option>
                                      <option value="Tips & Gratuities">Tips & Gratuities</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Amount ($)</label>
                                  <input 
                                    type="number" step="0.01"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                                    placeholder="0.00"
                                    value={logFormData.amount}
                                    onChange={e => setLogFormData({...logFormData, amount: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Transaction Date</label>
                                  <input 
                                    type="date"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                                    value={logFormData.date}
                                    onChange={e => setLogFormData({...logFormData, date: e.target.value})}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-3">
                                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Notes (Optional)</label>
                                  <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input 
                                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:border-blue-500"
                                      placeholder="Memo or receipt details..."
                                      value={logFormData.notes}
                                      onChange={e => setLogFormData({...logFormData, notes: e.target.value})}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-end">
                                  <button 
                                    onClick={() => addLogEntry(card.id)}
                                    className="w-full bg-slate-900 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg active-scale flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" /> Log Entry
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Full Transaction History Stream */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ledger History</p>
                          {(!card.logs || card.logs.length === 0) ? (
                            <div className="py-12 text-center bg-slate-100/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                              <ShoppingCart className="w-10 h-10 mx-auto text-slate-200 mb-3" />
                              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No spending recorded yet</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {card.logs.map(log => (
                                <div key={log.id} className="bg-white p-5 rounded-2xl border-2 border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm">
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div className="bg-red-50 p-2.5 rounded-xl text-red-500 border border-red-100 shrink-0">
                                      <ArrowDownRight className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="font-black text-slate-900 text-sm uppercase truncate leading-none">{log.description}</p>
                                        <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                      </div>
                                      {log.notes && (
                                        <p className="text-[10px] font-bold text-slate-500 mt-1 italic line-clamp-1">"{log.notes}"</p>
                                      )}
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">Deducted from {card.source}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <p className="text-lg font-black text-red-600 tabular-nums">-${log.amount.toFixed(2)}</p>
                                    <button onClick={() => removeLogEntry(card.id, log.id)} className="p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Credit & Cash Sidebar-style Column */}
        <div className="space-y-8">
          {/* Credit Card Transactions */}
          <div className="space-y-5">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <div className="bg-orange-600 p-1.5 rounded-lg"><CreditCardIcon className="w-5 h-5 text-white" /></div>
                Card Payments
              </h3>
              <button 
                onClick={() => setIsAddingCredit(true)}
                className="flex items-center gap-2 px-5 py-3 bg-orange-600 text-white font-black rounded-2xl active-scale shadow-lg shadow-orange-900/10 text-sm tracking-wide"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {creditEntries.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-bold italic opacity-60">
                    <CreditCardIcon className="w-10 h-10 mx-auto mb-3 opacity-10" />
                    Log direct credit card charges.
                  </div>
                ) : (
                  creditEntries.map(entry => (
                    <div key={entry.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group relative">
                      <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                        <div className="bg-orange-50 p-3 rounded-xl text-orange-600 border border-orange-100 shrink-0">
                          <CreditCardIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 text-sm uppercase leading-tight truncate">{entry.description}</p>
                          {entry.notes && (
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5 italic line-clamp-1">"{entry.notes}"</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-tighter whitespace-nowrap">Card •••• {entry.last4}</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase whitespace-nowrap">{new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <p className="text-base font-black text-slate-900 tabular-nums">-${entry.amount.toFixed(2)}</p>
                        <button onClick={() => removeCreditEntry(entry.id)} className="p-2 text-slate-200 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Physical Cash Section */}
          <div className="space-y-5">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <div className="bg-emerald-600 p-1.5 rounded-lg"><Banknote className="w-5 h-5 text-white" /></div>
                Physical Cash
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
                  <div className="p-12 text-center text-slate-400 font-bold italic opacity-60">
                    <Banknote className="w-10 h-10 mx-auto mb-3 opacity-10" />
                    Track cash jars.
                  </div>
                ) : (
                  cashEntries.map(entry => (
                    <div key={entry.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors active:bg-slate-100 group relative">
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
                      <div className="flex items-center gap-4 sm:gap-8">
                        <div className="text-right mr-10 sm:mr-0">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">STASHED</p>
                          <p className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums tracking-tight">${entry.amount.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => removeCashEntry(entry.id)} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 sm:static sm:translate-y-0 p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active-scale"
                          aria-label="Remove Cash"
                        >
                          <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Modals */}
      {(isAddingCard || isAddingCash || isAddingCredit) && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300" onClick={() => { setIsAddingCard(false); setIsAddingCash(false); setIsAddingCredit(false); }}>
          <div 
            className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 sm:p-12 max-w-xl w-full shadow-2xl safe-pb animate-in slide-in-from-bottom-8 duration-500 overflow-y-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {isAddingCard ? (
              <>
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-blue-600 p-2.5 rounded-2xl"><CreditCardIcon className="w-7 h-7 text-white" /></div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{editingCardId ? 'Edit Card' : 'Register Card'}</h3>
                </div>
                <p className="text-slate-400 font-bold mb-10">Updating details for local storage.</p>
                <form onSubmit={handleSaveCard} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Vendor / Source</label>
                      <input autoFocus className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-bold transition-all text-lg" placeholder="e.g. Sam's Club" value={cardFormData.source} onChange={e => setCardFormData({...cardFormData, source: e.target.value})} required autoComplete="off" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Full Card Number</label>
                      <input type="text" inputMode="numeric" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-bold transition-all text-lg tracking-widest font-mono" placeholder="Enter all digits" value={cardFormData.cardNumber} onChange={e => setCardFormData({...cardFormData, cardNumber: e.target.value.replace(/\D/g, '')})} required autoComplete="off" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Access Code (PIN)</label>
                      <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-bold transition-all text-lg font-mono" placeholder="e.g. 1234" value={cardFormData.accessCode} onChange={e => setCardFormData({...cardFormData, accessCode: e.target.value})} autoComplete="off" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Date Added</label>
                      <input type="date" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-bold text-slate-500 transition-all text-lg" value={cardFormData.dateReceived} onChange={e => setCardFormData({...cardFormData, dateReceived: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Original Balance ($)</label>
                      <input type="number" step="0.01" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-black transition-all text-lg" placeholder="0.00" value={cardFormData.originalBalance || ''} onChange={e => setCardFormData({...cardFormData, originalBalance: parseFloat(e.target.value) || 0})} required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Current Balance ($)</label>
                      <input type="number" step="0.01" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 font-black transition-all text-lg" placeholder="0.00" value={cardFormData.currentBalance || ''} onChange={e => setCardFormData({...cardFormData, currentBalance: parseFloat(e.target.value) || 0})} required />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setIsAddingCard(false)} className="flex-1 bg-slate-100 py-5 rounded-[1.5rem] font-black text-slate-500 active-scale">Cancel</button>
                    <button type="submit" className="flex-1 bg-blue-600 py-5 rounded-[1.5rem] font-black text-white shadow-2xl shadow-blue-900/20 active-scale">{editingCardId ? 'Update Card' : 'Save Card'}</button>
                  </div>
                </form>
              </>
            ) : isAddingCash ? (
              <>
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-emerald-600 p-2.5 rounded-2xl"><Banknote className="w-7 h-7 text-white" /></div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Add Cash</h3>
                </div>
                <p className="text-slate-400 font-bold mb-10">Record physical savings for the trip.</p>
                <form onSubmit={handleAddCash} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Saving Description</label>
                    <input autoFocus className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 font-bold transition-all text-lg" placeholder="e.g. Weekly Stash" value={newCash.description} onChange={e => setNewCash({...newCash, description: e.target.value})} required autoComplete="off" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Amount ($)</label>
                      <input type="number" step="0.01" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 font-black transition-all text-xl" placeholder="0.00" value={newCash.amount || ''} onChange={e => setNewCash({...newCash, amount: parseFloat(e.target.value) || 0})} required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Date</label>
                      <input type="date" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 font-bold text-slate-500 transition-all text-lg" value={newCash.dateAdded} onChange={e => setNewCash({...newCash, dateAdded: e.target.value})} required />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setIsAddingCash(false)} className="flex-1 bg-slate-100 py-5 rounded-[1.5rem] font-black text-slate-500 active-scale">Cancel</button>
                    <button type="submit" className="flex-1 bg-emerald-600 py-5 rounded-[1.5rem] font-black text-white shadow-2xl shadow-emerald-900/20 active-scale">Save Cash</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-orange-600 p-2.5 rounded-2xl"><CreditCardIcon className="w-7 h-7 text-white" /></div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Credit Payment</h3>
                </div>
                <p className="text-slate-400 font-bold mb-10">Log a transaction paid with a credit card.</p>
                <form onSubmit={handleAddCredit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Budget Allocation</label>
                      <div className="relative">
                        <select 
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-orange-500 font-bold transition-all text-lg appearance-none pr-12"
                          value={newCredit.description}
                          onChange={e => setNewCredit({...newCredit, description: e.target.value})}
                          required
                        >
                          <option value="">Select Category...</option>
                          {expenses.map((exp) => (
                            <option key={exp.id} value={exp.description}>{exp.description}</option>
                          ))}
                          <option value="General Spending">General Spending</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Last 4 Digits</label>
                      <input 
                        type="text" maxLength={4}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-orange-500 font-bold transition-all text-lg"
                        placeholder="0000"
                        value={newCredit.last4}
                        onChange={e => setNewCredit({...newCredit, last4: e.target.value.replace(/\D/g, '')})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Amount ($)</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-orange-500 font-black transition-all text-xl"
                        placeholder="0.00"
                        value={newCredit.amount || ''}
                        onChange={e => setNewCredit({...newCredit, amount: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Transaction Date</label>
                      <input type="date" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 outline-none focus:border-orange-500 font-bold text-slate-500 transition-all text-lg" value={newCredit.date} onChange={e => setNewCredit({...newCredit, date: e.target.value})} required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Notes (Optional)</label>
                      <textarea 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-medium transition-all text-sm resize-none"
                        placeholder="Additional details about this charge..."
                        rows={3}
                        value={newCredit.notes}
                        onChange={e => setNewCredit({...newCredit, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setIsAddingCredit(false)} className="flex-1 bg-slate-100 py-5 rounded-[1.5rem] font-black text-slate-500 active-scale">Cancel</button>
                    <button type="submit" className="flex-1 bg-orange-600 py-5 rounded-[1.5rem] font-black text-white shadow-2xl shadow-orange-900/20 active-scale">Log Payment</button>
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
