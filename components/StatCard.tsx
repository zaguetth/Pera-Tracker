import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean; // true = good (green), false = bad (red). For debt, up is bad.
  icon: React.ReactNode;
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendUp, icon, colorClass = "text-white" }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-none shadow-sm hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">{label}</p>
          <h3 className={`text-2xl font-mono font-bold ${colorClass}`}>{value}</h3>
        </div>
        <div className="p-2 bg-zinc-950 rounded border border-zinc-800 text-zinc-400">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center text-xs font-mono">
          <span className={trendUp ? 'text-emerald-500' : 'text-rose-500'}>
            {trend}
          </span>
          <span className="text-zinc-600 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
};
