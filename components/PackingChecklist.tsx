
import React, { useState } from 'react';
import { PackingItem, Category } from '../types';
import { Plus, CheckCircle2, Circle, Trash2, Tag, FileText, Shirt, HeartPulse } from 'lucide-react';

interface Props {
  previewOnly?: boolean;
}

export const PackingChecklist: React.FC<Props> = ({ previewOnly = false }) => {
  const [items, setItems] = useState<PackingItem[]>([
    { id: '1', category: 'Documents', name: 'Passports', quantity: 4, isPacked: false },
    { id: '2', category: 'Clothing', name: 'T-Shirts (The Legend)', quantity: 12345, isPacked: false },
    { id: '3', category: 'Medical/Personal', name: 'Motion Sickness Patches', quantity: 2, isPacked: true },
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<Category>('Clothing');
  const [newItemQty, setNewItemQty] = useState(1);

  const togglePacked = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, isPacked: !item.isPacked } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      const item: PackingItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: newItemName,
        category: newItemCategory,
        quantity: newItemQty,
        isPacked: false,
      };
      setItems([...items, item]);
      setNewItemName('');
      setNewItemQty(1);
    }
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'Documents': return <FileText className="w-4 h-4" />;
      case 'Clothing': return <Shirt className="w-4 h-4" />;
      case 'Medical/Personal': return <HeartPulse className="w-4 h-4" />;
    }
  };

  if (previewOnly) {
    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm divide-y divide-slate-100">
        {items.slice(0, 4).map(item => (
          <div key={item.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.isPacked ? 'bg-slate-100' : 'bg-blue-50 text-blue-600'}`}>
                {getCategoryIcon(item.category)}
              </div>
              <div>
                <p className={`text-sm font-bold ${item.isPacked ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{item.quantity} units</p>
              </div>
            </div>
            {item.isPacked ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-200" />}
          </div>
        ))}
        {items.length > 4 && (
          <p className="text-center pt-3 text-xs font-bold text-blue-600">And {items.length - 4} more items...</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Item Form */}
      <form onSubmit={addItem} className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Item Name</label>
          <input 
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-medium"
            placeholder="What are we packing?"
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
          <select 
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold"
            value={newItemCategory}
            onChange={e => setNewItemCategory(e.target.value as Category)}
          >
            <option value="Documents">Documents</option>
            <option value="Clothing">Clothing</option>
            <option value="Medical/Personal">Medical/Personal</option>
          </select>
        </div>
        <div className="flex gap-2">
           <div className="flex-1">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Qty</label>
            <input 
              type="number"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold"
              value={newItemQty}
              onChange={e => setNewItemQty(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="bg-blue-600 text-white p-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </form>

      {/* Categories List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(['Documents', 'Clothing', 'Medical/Personal'] as Category[]).map(cat => (
          <div key={cat} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-white p-2 rounded-xl">
                {getCategoryIcon(cat)}
              </div>
              <h3 className="text-xl font-black text-slate-900">{cat}</h3>
              <span className="ml-auto bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500">
                {items.filter(i => i.category === cat).length}
              </span>
            </div>

            <div className="space-y-2">
              {items.filter(i => i.category === cat).map(item => (
                <div 
                  key={item.id} 
                  className={`
                    group p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4
                    ${item.isPacked ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}
                  `}
                  onClick={() => togglePacked(item.id)}
                >
                  <div className={`shrink-0 transition-transform ${!item.isPacked && 'group-hover:scale-110'}`}>
                    {item.isPacked ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${item.isPacked ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-wider">
                        {item.quantity.toLocaleString()} units
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {items.filter(i => i.category === cat).length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nothing to pack yet</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
