import React from 'react';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';
import { AGENCY_TYPES, EXPERTISE_OPTIONS } from '../../data/mockData';

export default function FilterPanel({ filters, onChange, onReset }) {
  const districtOptions = ['Pune', 'Mumbai', 'Delhi', 'Chennai', 'Guwahati', 'Kolkata', 'Bengaluru', 'Ahmedabad'];

  const availabilityOptions = [
    { label: '🟢 Available', value: 'AVAILABLE' },
    { label: '🟡 Limited Availability', value: 'LIMITED' },
    { label: '🔴 Deployed / Busy', value: 'DEPLOYED' },
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col gap-4 fade-in shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#166534]" />
          <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">Search Filters</span>
        </div>
        <button 
          onClick={onReset}
          className="text-[#64748B] hover:text-[#166534] p-1.5 hover:bg-[#F7F5EF] rounded-md transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
        >
          <RefreshCw size={11} />
          Reset
        </button>
      </div>

      {/* Search Query */}
      <div>
        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Agency Name</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          placeholder="Search agency..."
          className="w-full bg-[#F7F5EF] border border-[#E5E7EB] focus:border-[#166534] text-xs rounded-md p-2.5 text-[#111827] placeholder-[#94A3B8] focus:outline-none transition-colors"
        />
      </div>

      {/* Agency Type */}
      <div>
        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Agency Type</label>
        <select
          value={filters.type}
          onChange={(e) => onChange('type', e.target.value)}
          className="w-full bg-[#F7F5EF] border border-[#E5E7EB] focus:border-[#166534] text-xs rounded-md p-2.5 text-[#111827] focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">All Types</option>
          {AGENCY_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Disaster Expertise */}
      <div>
        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Disaster Expertise</label>
        <select
          value={filters.expertise}
          onChange={(e) => onChange('expertise', e.target.value)}
          className="w-full bg-[#F7F5EF] border border-[#E5E7EB] focus:border-[#166534] text-xs rounded-md p-2.5 text-[#111827] focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">All Expertise</option>
          {EXPERTISE_OPTIONS.map(exp => (
            <option key={exp} value={exp}>{exp}</option>
          ))}
        </select>
      </div>

      {/* Availability Status */}
      <div>
        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Availability Status</label>
        <select
          value={filters.availability}
          onChange={(e) => onChange('availability', e.target.value)}
          className="w-full bg-[#F7F5EF] border border-[#E5E7EB] focus:border-[#166534] text-xs rounded-md p-2.5 text-[#111827] focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">All Statuses</option>
          {availabilityOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* District Area */}
      <div>
        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">District Area</label>
        <select
          value={filters.district}
          onChange={(e) => onChange('district', e.target.value)}
          className="w-full bg-[#F7F5EF] border border-[#E5E7EB] focus:border-[#166534] text-xs rounded-md p-2.5 text-[#111827] focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">All Districts</option>
          {districtOptions.map(dist => (
            <option key={dist} value={dist}>{dist}</option>
          ))}
        </select>
      </div>

      {/* Distance Slider */}
      <div>
        <div className="flex justify-between text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
          <span>Max Distance</span>
          <span className="text-[#166534] font-mono font-bold">{filters.distance} km</span>
        </div>
        <input
          type="range"
          min="5"
          max="2500"
          step="5"
          value={filters.distance}
          onChange={(e) => onChange('distance', parseInt(e.target.value))}
          className="w-full h-1 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#166534]"
        />
        <div className="flex justify-between text-[9px] text-[#64748B] font-mono mt-1">
          <span>5 km</span>
          <span>100 km</span>
          <span>1000 km</span>
          <span>2500 km</span>
        </div>
      </div>
    </div>
  );
}
