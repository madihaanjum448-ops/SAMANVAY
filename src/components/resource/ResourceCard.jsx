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
    <div className="bg-white border border-stone-200 rounded-lg p-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-teal-50 border border-teal-200 text-teal-700">
            {icons[icon] || <Package size={16} />}
          </div>
          <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">{name}</span>
        </div>
        <span className="text-xs font-mono font-bold text-stone-500">
          {available} / {total} Avail
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs mb-3.5 border-y border-stone-200 py-2.5">
        <div>
          <div className="text-stone-500 text-[10px] uppercase font-semibold">Total</div>
          <div className="text-sm font-bold text-stone-900 font-mono">{total}</div>
        </div>
        <div>
          <div className="text-green-600 text-[10px] uppercase font-semibold">Available</div>
          <div className="text-sm font-bold text-green-700 font-mono">{available}</div>
        </div>
        <div>
          <div className="text-red-600 text-[10px] uppercase font-semibold">Deployed</div>
          <div className="text-sm font-bold text-red-700 font-mono">{deployed}</div>
        </div>
      </div>

      {/* Progress Bar of Deployment */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500 mb-1 uppercase tracking-wider">
          <span>Allocation</span>
          <span className={usePercentage > 75 ? 'text-red-700' : 'text-stone-500'}>{usePercentage}% Deployed</span>
        </div>
        <div className="w-full h-1.5 bg-stone-50 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              usePercentage > 75 ? 'bg-red-500' : usePercentage > 40 ? 'bg-orange-500' : 'bg-teal-700'
            }`} 
            style={{ width: `${usePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
