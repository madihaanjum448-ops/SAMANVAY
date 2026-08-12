import React from 'react';
import { Users, Ship, Ambulance, Truck, Plane, Package } from 'lucide-react';

const icons = {
  Users: <Users size={16} />,
  Ship: <Ship size={16} />,
  Ambulance: <Ambulance size={16} />,
  Truck: <Truck size={16} />,
  Plane: <Plane size={16} />,
  Package: <Package size={16} />,
};

export default function ResourceCard({ resource }) {
  const { name, total, available, deployed, icon } = resource;
  const usePercentage = total > 0 ? Math.round((deployed / total) * 100) : 0;

  return (
    <div className="bg-[#0f1c35] border border-slate-800 rounded-lg p-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
            {icons[icon] || <Package size={16} />}
          </div>
          <span className="text-xs font-semibold text-white uppercase tracking-wider">{name}</span>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400">
          {available} / {total} Avail
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs mb-3.5 border-y border-slate-800/40 py-2.5">
        <div>
          <div className="text-slate-500 text-[10px] uppercase font-semibold">Total</div>
          <div className="text-sm font-bold text-white font-mono">{total}</div>
        </div>
        <div>
          <div className="text-green-500 text-[10px] uppercase font-semibold">Available</div>
          <div className="text-sm font-bold text-green-400 font-mono">{available}</div>
        </div>
        <div>
          <div className="text-red-500 text-[10px] uppercase font-semibold">Deployed</div>
          <div className="text-sm font-bold text-red-400 font-mono">{deployed}</div>
        </div>
      </div>

      {/* Progress Bar of Deployment */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
          <span>Allocation</span>
          <span className={usePercentage > 75 ? 'text-red-400' : 'text-slate-400'}>{usePercentage}% Deployed</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              usePercentage > 75 ? 'bg-red-500' : usePercentage > 40 ? 'bg-orange-500' : 'bg-cyan-500'
            }`} 
            style={{ width: `${usePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
