import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'amber' }) {
  const colorClasses = {
    amber: 'text-amber-500 bg-amber-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    violet: 'text-violet-500 bg-violet-500/10',
    rose: 'text-rose-500 bg-rose-500/10',
    slate: 'text-slate-400 bg-slate-500/10',
  };

  return (
    <div className="glass-panel rounded-3xl p-6 hover:bg-slate-900/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5 hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">{title}</p>
          <p className="text-3xl font-light text-slate-100">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "text-xs mt-2",
              trend > 0 ? "text-emerald-500" : "text-rose-500"
            )}>
              {trend > 0 ? '+' : ''}{trend}% from last week
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
            colorClasses[color]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}