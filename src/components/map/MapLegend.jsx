import React from 'react';

export default function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-navy-950/90 border border-slate-800 rounded px-3 py-2 text-xs backdrop-blur-md">
      <h5 className="font-semibold text-gray-400 mb-2 uppercase tracking-wider text-[10px]">Map Legend</h5>
      <div className="space-y-1.5 font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-available"></span>
          <span className="text-gray-300">Available Agency</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-limited"></span>
          <span className="text-gray-300">Limited Status</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-deployed"></span>
          <span className="text-gray-300">Deployed / Active Mission</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-blue-500 border border-blue-600 rotate-45 transform w-2 h-2 mx-0.5"></span>
          <span className="text-gray-300">Active Incident</span>
        </div>
      </div>
    </div>
  );
}
