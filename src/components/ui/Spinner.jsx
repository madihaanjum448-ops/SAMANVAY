import React from 'react';

export default function Spinner({ size = 'md', color = 'cyan', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    cyan: 'border-cyan-500/20 border-t-cyan-500',
    white: 'border-white/20 border-t-white',
    slate: 'border-slate-700 border-t-slate-400',
  };

  return (
    <div
      className={`
        animate-spin rounded-full border-solid
        ${sizeClasses[size] || sizeClasses.md}
        ${colorClasses[color] || colorClasses.cyan}
        ${className}
      `}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
