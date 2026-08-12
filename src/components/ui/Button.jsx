import React from 'react';

const variants = {
  primary:   'bg-cyan-500 hover:bg-cyan-400 text-slate-900 border-cyan-500 hover:border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.25)] hover:shadow-[0_0_24px_rgba(6,182,212,0.4)]',
  secondary: 'bg-transparent hover:bg-slate-700/60 text-slate-300 border-slate-600 hover:border-slate-500 hover:text-white',
  danger:    'bg-red-500/15 hover:bg-red-500/25 text-red-400 border-red-500/40 hover:border-red-500/60',
  success:   'bg-green-500/15 hover:bg-green-500/25 text-green-400 border-green-500/40 hover:border-green-500/60',
  ghost:     'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-transparent',
  outline:   'bg-transparent hover:bg-cyan-500/10 text-cyan-400 border-cyan-500/40 hover:border-cyan-500/60',
};

const sizes = {
  xs:  'px-2 py-1 text-xs gap-1',
  sm:  'px-3 py-1.5 text-xs gap-1.5',
  md:  'px-4 py-2 text-sm gap-2',
  lg:  'px-5 py-2.5 text-sm gap-2',
  xl:  'px-6 py-3 text-base gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold rounded-[6px] border
        transition-all duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin mr-1.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
}
