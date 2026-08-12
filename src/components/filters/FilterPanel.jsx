import React from 'react';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';
import { AGENCY_TYPES, EXPERTISE_OPTIONS } from '../../data/mockData';

export default function FilterPanel({ filters, onChange, onReset }) {
  const resourceOptions = [
    { label: 'Rescue Boats', value: 'boats' },
    { label: 'Ambulances', value: 'ambulances' },
    { label: 'Personnel / Rescue Staff', value: 'personnel' },
    { label: 'Drones', value: 'drones' },
  ];

  const districtOptions = ['Pune', 'Mumbai', 'Delhi', 'Chennai', 'Guwahati', 'Kolkata', 'Bengaluru', 'Ahmedabad'];

  const availabilityOptions = [
    { label: '🟢 Available', value: 'AVAILABLE' },
    { label: '🟡 Limited Availability', value: 'LIMITED' },
    { label: '🔴 Deployed / Busy', value: 'DEPLOYED' },
  ];

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 flex flex-col gap-4 fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-teal-700" />
          <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Search Filters</span>
        </div>
        <button 
          onClick={onReset}
          className="text-stone-500 hover:text-teal-700 p-1 hover:bg-stone-100 rounded transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
        >
          <RefreshCw size={10} />
          Reset
        </button>
      </div>

      {/* Search Query */}
      <div>
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Agency Name</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          placeholder="Search agency..."
          className="w-full bg-[#faf9f6] border border-stone-300 focus:border-teal-500 text-xs rounded p-2 text-stone-900 placeholder-stone-400 focus:outline-none transition-colors"
        />
      </div>

      {/* Agency Type */}
      <div>
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Agency Type</label>
        <select
          value={filters.type}
          onChange={(e) => onChange('type', e.target.value)}
          className="w-full bg-[#faf9f6] border border-stone-300 focus:border-teal-500 text-xs rounded p-2 text-stone-700 focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">All Types</option>
          {AGENCY_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Disaster Expertise */}
      <div>
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Disaster Expertise</label>
        <select
          value={filters.expertise}
          onChange={(e) => onChange('expertise', e.target.value)}
          className="w-full bg-[#faf9f6] border border-stone-300 focus:border-teal-500 text-xs rounded p-2 text-stone-700 focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">All Expertise</option>
          {EXPERTISE_OPTIONS.map(exp => (
            <option key={exp} value={exp}>{exp}</option>
          ))}
        </select>
      </div>

      {/* Availability Status */}
      <div>
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Availability Status</label>
        <select
          value={filters.availability}
          onChange={(e) => onChange('availability', e.target.value)}
          className="w-full bg-[#faf9f6] border border-stone-300 focus:border-teal-500 text-xs rounded p-2 text-stone-700 focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">All Statuses</option>
          {availabilityOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* District Area */}
      <div>
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">District Area</label>
        <select
          value={filters.district}
          onChange={(e) => onChange('district', e.target.value)}
          className="w-full bg-[#faf9f6] border border-stone-300 focus:border-teal-500 text-xs rounded p-2 text-stone-700 focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">All Districts</option>
          {districtOptions.map(dist => (
            <option key={dist} value={dist}>{dist}</option>
          ))}
        </select>
      </div>

      {/* Distance Slider (Simulated for Pune center) */}
      <div>
        <div className="flex justify-between text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
          <span>Max Distance</span>
          <span className="text-teal-700 font-mono font-semibold">{filters.distance} km</span>
        </div>
        <input
          type="range"
          min="5"
          max="2500"
          step="5"
          value={filters.distance}
          onChange={(e) => onChange('distance', parseInt(e.target.value))}
          className="w-full h-1 bg-[#faf9f6] rounded-lg appearance-none cursor-pointer accent-teal-600"
        />
        <div className="flex justify-between text-[8px] text-stone-400 font-mono mt-1">
          <span>5 km</span>
          <span>100 km</span>
          <span>1000 km</span>
          <span>2500 km</span>
        </div>
      </div>
    </div>
  );
}
