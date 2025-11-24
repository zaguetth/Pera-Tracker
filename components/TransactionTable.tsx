import React from 'react';
import { Transaction } from '../types';
import { ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-800 text-zinc-500 uppercase text-xs tracking-wider font-mono">
          <tr>
            <th className="pb-3 pl-2">Type</th>
            <th className="pb-3">Description</th>
            <th className="pb-3">Category</th>
            <th className="pb-3">Date</th>
            <th className="pb-3 text-right">Amount</th>
            <th className="pb-3 text-right pr-2">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {transactions.map((t) => (
            <tr key={t.id} className="group hover:bg-zinc-900/50 transition-colors">
              <td className="py-3 pl-2">
                {t.type === 'income' ? (
                  <div className="flex items-center text-emerald-500">
                    <ArrowDownLeft size={16} className="mr-1" />
                    <span className="font-mono">IN</span>
                  </div>
                ) : (
                  <div className="flex items-center text-rose-500">
                    <ArrowUpRight size={16} className="mr-1" />
                    <span className="font-mono">OUT</span>
                  </div>
                )}
              </td>
              <td className="py-3 font-medium text-zinc-300">{t.description}</td>
              <td className="py-3 text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs">
                  {t.category === 'Luho' ? 'Wants' : t.category}
                </span>
              </td>
              <td className="py-3 text-zinc-500 font-mono text-xs">{t.date}</td>
              <td className={`py-3 text-right font-mono font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                {t.type === 'income' ? '+' : '-'}₱{t.amount.toLocaleString()}
              </td>
              <td className="py-3 text-right pr-2">
                <button 
                  onClick={() => onDelete(t.id)}
                  className="text-zinc-600 hover:text-rose-500 transition-colors p-1"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-zinc-600 italic">
                No records yet. Start tracking.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};