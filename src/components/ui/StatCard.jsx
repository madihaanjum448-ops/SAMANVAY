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
    cyan:   { icon: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
    red:    { icon: 'text-red-700',  bg: 'bg-red-50',  border: 'border-red-200'  },
    green:  { icon: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
    orange: { icon: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
    blue:   { icon: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    yellow: { icon: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  };

  const c = colorMap[color] || colorMap.cyan;
  const displayTitle = title || label;
  const displayTrend = trend !== undefined ? trend : change;

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-stone-200 rounded-lg p-4 card-hover fade-in ${
        onClick ? 'cursor-pointer hover:border-teal-300' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-md ${c.bg} border ${c.border}`}>
          <span className={`${c.icon}`}>{icon}</span>
        </div>
        {displayTrend !== undefined && (
          <span className={`text-xs font-semibold ${
            parseFloat(displayTrend) > 0 ? 'text-green-700' : parseFloat(displayTrend) < 0 ? 'text-red-700' : 'text-stone-500'
          }`}>
            {parseFloat(displayTrend) > 0 ? `+${displayTrend}` : displayTrend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-stone-900 tracking-tight mb-0.5">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">{displayTitle}</div>
      {sub && <div className="text-xs text-stone-400 mt-1">{sub}</div>}
    </div>
  );
}
