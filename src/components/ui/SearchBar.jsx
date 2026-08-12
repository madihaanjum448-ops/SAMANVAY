import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({
  placeholder = 'Search...',
  value,
  onChange,
  className = '',
  ...props
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0f1c35] border border-[#1e2a40] rounded-md pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600
        focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
        {...props}
      />
    </div>
  );
}
