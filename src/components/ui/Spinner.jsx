import React from 'react';

export default function Spinner({ size = 'md', color = 'cyan', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    cyan: 'border-teal-200 border-t-teal-600',
    white: 'border-stone-200 border-t-stone-800',
    slate: 'border-stone-300 border-t-stone-500',
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
