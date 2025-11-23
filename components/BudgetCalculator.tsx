import React, { useState } from 'react';
import { BudgetLineItem } from '../types';
import { suggestItemCost, generateBudgetJustification } from '../services/geminiService';
import { Plus, Trash2, Sparkles, Calculator, ArrowLeft, Loader2 } from 'lucide-react';

interface BudgetCalculatorProps {
  onBack: () => void;
}

export const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({ onBack }) => {
  const [items, setItems] = useState<BudgetLineItem[]>([]);
  const [newItem, setNewItem] = useState({ item: '', quantity: 1, unitPrice: 0 });
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [justification, setJustification] = useState('');
  const [loadingJustification, setLoadingJustification] = useState(false);

  const handleEstimate = async () => {
    if (!newItem.item) return;
    setLoadingEstimate(true);
    const costStr = await suggestItemCost(newItem.item);
    const cost = parseFloat(costStr) || 0;
    setNewItem(prev => ({ ...prev, unitPrice: cost }));
    setLoadingEstimate(false);
  };

  const addItem = () => {
    if (!newItem.item) return;
    const lineItem: BudgetLineItem = {
      id: Date.now().toString(),
      ...newItem,
      total: newItem.quantity * newItem.unitPrice
    };
    setItems([...items, lineItem]);
    setNewItem({ item: '', quantity: 1, unitPrice: 0 });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const generateNarrative = async () => {
    if (items.length === 0) return;
    setLoadingJustification(true);
    const text = await generateBudgetJustification(items);
    setJustification(text);
    setLoadingJustification(false);
  };

  const totalBudget = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
       <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="w-6 h-6 text-amber-500" /> Budget Calculator
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add Item */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Add Line Item</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Item Description</label>
              <input 
                value={newItem.item}
                onChange={(e) => setNewItem({...newItem, item: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., Tarpaulin 4x5ft"
              />
            </div>
            <div className="flex gap-2">
               <div className="w-1/3">
                  <label className="text-xs font-medium text-gray-500">Qty</label>
                  <input 
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
               </div>
               <div className="w-2/3 relative">
                  <label className="text-xs font-medium text-gray-500">Unit Price (PHP)</label>
                  <div className="flex gap-1">
                    <input 
                      type="number"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({...newItem, unitPrice: parseFloat(e.target.value) || 0})}
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button 
                      onClick={handleEstimate}
                      disabled={loadingEstimate || !newItem.item}
                      className="bg-purple-100 text-purple-700 p-2 rounded hover:bg-purple-200 disabled:opacity-50"
                      title="AI Cost Estimate"
                    >
                      {loadingEstimate ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5" />}
                    </button>
                  </div>
               </div>
            </div>
            <button 
              onClick={addItem}
              className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition flex justify-center items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add to Budget
            </button>
          </div>
        </div>

        {/* Center: Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          <h3 className="font-semibold mb-4">Line Items</h3>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b dark:border-gray-700">
                    <td className="px-4 py-3 font-medium">{item.item}</td>
                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">₱{item.unitPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold">₱{item.total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No items added yet.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex justify-between items-center">
            <span className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Grand Total</span>
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">₱{totalBudget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Justification Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
           <h3 className="font-semibold">AI Budget Narrative</h3>
           <button 
             onClick={generateNarrative}
             disabled={items.length === 0 || loadingJustification}
             className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full hover:bg-amber-200 transition flex items-center gap-1 disabled:opacity-50"
           >
             {loadingJustification ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />} Generate Narrative
           </button>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[100px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
           {justification || "Add items and click generate to create a formal justification for this budget proposal."}
        </div>
      </div>
    </div>
  );
};
