import React from 'react';

export default function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 border border-stone-200 rounded px-3 py-2 text-xs">
      <h5 className="font-semibold text-stone-500 mb-2 uppercase tracking-wider text-[10px]">Map Legend</h5>
      <div className="space-y-1.5 font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-available"></span>
          <span className="text-stone-600">Available Agency</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-limited"></span>
          <span className="text-stone-600">Limited Status</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-deployed"></span>
          <span className="text-stone-600">Deployed / Active Mission</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-blue-500 border border-blue-600 rotate-45 transform w-2 h-2 mx-0.5"></span>
          <span className="text-stone-600">Active Incident</span>
        </div>
      </div>
    </div>
  );
}
