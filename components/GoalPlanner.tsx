
import React, { useState } from 'react';
import { Plus, Trash2, DollarSign, Tag, TrendingUp, Info } from 'lucide-react';
import { Expense } from '../types';

interface Props {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

export const GoalPlanner: React.FC<Props> = ({ expenses, setExpenses }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Cruise');

  const totalBudget = expenses.reduce((sum, e) => sum + e.amount, 0);

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      description: desc,
      amount: parseFloat(amount),
      category
    };

    setExpenses([...expenses, newExpense]);
    setDesc('');
    setAmount('');
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900">Trip Goal Planner</h2>
        <p className="text-slate-500 mt-2 font-medium">Break down your expenses to find your total savings goal.</p>
      </div>

      {/* Summary Card */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 text-center md:text-left">
          <p className="text-blue-400 font-black uppercase tracking-widest text-xs mb-1">Total Savings Goal</p>
          <h3 className="text-5xl font-black text-white tabular-nums">
            ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-slate-400 text-sm mt-2 font-medium">Calculated from {expenses.length} budget items</p>
        </div>
        <div className="relative z-10 mt-6 md:mt-0 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Financial Tip</span>
          </div>
          <p className="text-[11px] text-slate-300 max-w-[200px] leading-relaxed">
            Aim to have this amount in gift cards or savings 90 days before departure!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Expense Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm sticky top-8">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Add Budget Item
            </h3>
            <form onSubmit={addExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <input 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="e.g. Excursions"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-9 pr-4 py-3 focus:border-blue-500 outline-none transition-all font-bold"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-9 pr-4 py-3 focus:border-blue-500 outline-none transition-all font-bold appearance-none"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="Cruise">Cruise Core</option>
                    <option value="Travel">Travel/Gas/Hotel</option>
                    <option value="Fun">Fun/Excursions</option>
                    <option value="Misc">Other Expenses</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add to Goal
              </button>
            </form>
          </div>
        </div>

        {/* Expense List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-slate-900">Budget Items</h3>
            <span className="text-xs font-bold text-slate-400 uppercase">{expenses.length} entries</span>
          </div>

          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-bold">No expenses added yet.</p>
                  <p className="text-sm mt-1">Add items like gas, hotel, or fares to see your goal.</p>
                </div>
              ) : (
                expenses.map(exp => (
                  <div key={exp.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${
                        exp.category === 'Cruise' ? 'bg-blue-50 text-blue-600' :
                        exp.category === 'Travel' ? 'bg-emerald-50 text-emerald-600' :
                        exp.category === 'Fun' ? 'bg-purple-50 text-purple-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{exp.description}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{exp.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-lg font-black text-slate-900 tabular-nums">
                        ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <button 
                        onClick={() => removeExpense(exp.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {expenses.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-3xl flex items-start gap-4">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900">Syncing with Gift Card Ledger</p>
                <p className="text-xs text-blue-700 mt-1">
                  This total budget (${totalBudget.toLocaleString()}) is now used as the target in your Gift Card Ledger to track your savings progress automatically.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
