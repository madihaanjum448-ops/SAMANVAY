import React from 'react';

export default function StatCard({
  icon,
  label,
  title,
  value,
  sub,
  trend,
  change,
  color = 'cyan',
  onClick,
}) {
  const colorMap = {
    cyan:   { icon: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    red:    { icon: 'text-red-400',  bg: 'bg-red-500/10',  border: 'border-red-500/20'  },
    green:  { icon: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    orange: { icon: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    blue:   { icon: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    yellow: { icon: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  };

  const c = colorMap[color] || colorMap.cyan;
  const displayTitle = title || label;
  const displayTrend = trend !== undefined ? trend : change;

  return (
    <div
      onClick={onClick}
      className={`bg-[#0f1c35] border border-[#1e2a40] rounded-lg p-4 card-hover fade-in ${
        onClick ? 'cursor-pointer hover:border-cyan-500/40' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-md ${c.bg} border ${c.border}`}>
          <span className={`${c.icon}`}>{icon}</span>
        </div>
        {displayTrend !== undefined && (
          <span className={`text-xs font-semibold ${
            parseFloat(displayTrend) > 0 ? 'text-green-400' : parseFloat(displayTrend) < 0 ? 'text-red-400' : 'text-slate-500'
          }`}>
            {parseFloat(displayTrend) > 0 ? `+${displayTrend}` : displayTrend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white tracking-tight mb-0.5">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{displayTitle}</div>
      {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
    </div>
  );
}
