import React, { useState } from 'react';
import { X } from 'lucide-react';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtName: string;
  currentBalance: number;
  onConfirm: (amount: number, date: string) => void;
}

export const DebtPaymentModal: React.FC<DebtPaymentModalProps> = ({ isOpen, onClose, debtName, currentBalance, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onConfirm(parseFloat(amount), date);
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-2 text-white font-mono uppercase tracking-tight">Make Payment</h2>
        <p className="text-sm text-zinc-400 mb-6">For: <span className="text-white font-bold">{debtName}</span></p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-zinc-500 mb-1">Current Balance</label>
            <p className="text-xl font-mono text-white mb-2">₱{currentBalance.toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-xs uppercase text-zinc-500 mb-1">Payment Amount (₱)</label>
            <input 
              required
              type="number" 
              step="0.01"
              max={currentBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none focus:border-indigo-500 font-mono text-lg"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-zinc-500 mb-1">Date</label>
            <input 
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 uppercase tracking-wider transition-colors mt-4"
          >
            Confirm Payment
          </button>
        </form>
      </div>
    </div>
  );
};