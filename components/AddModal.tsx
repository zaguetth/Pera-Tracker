import React, { useState } from 'react';
import { TransactionType, Category, Transaction } from '../types';
import { X } from 'lucide-react';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (t: Omit<Transaction, 'id'>) => void;
}

const CATEGORIES: Category[] = [
  'Housing', 'Food', 'Transpo', 'Load/Data', 'Luho', 
  'Bills', 'Health', 'Salary', 'Side Hustle', 'Investment', 'Other'
];

export const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Food');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      type,
      amount: parseFloat(amount),
      description,
      category,
      date: new Date().toISOString().split('T')[0],
    });
    // Reset
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-6 text-white font-mono uppercase tracking-tight">New Entry</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-4 text-sm font-medium border ${type === 'expense' ? 'bg-rose-950/30 border-rose-500 text-rose-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
            >
              EXPENSE
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-4 text-sm font-medium border ${type === 'income' ? 'bg-emerald-950/30 border-emerald-500 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
            >
              INCOME
            </button>
          </div>

          <div>
            <label className="block text-xs uppercase text-zinc-500 mb-1">Amount (₱)</label>
            <input 
              required
              type="number" 
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none focus:border-indigo-500 font-mono text-lg"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-zinc-500 mb-1">Description</label>
            <input 
              required
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none focus:border-indigo-500"
              placeholder="What is this for?"
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-zinc-500 mb-1">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none focus:border-indigo-500 appearance-none"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c === 'Luho' ? 'Wants/Luxury' : c}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 uppercase tracking-wider transition-colors mt-4"
          >
            Save Record
          </button>
        </form>
      </div>
    </div>
  );
};