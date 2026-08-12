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
        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-stone-200 rounded-md pl-9 pr-4 py-2 text-sm text-stone-700 placeholder-stone-400
        focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200 transition-colors"
        {...props}
      />
    </div>
  );
}
