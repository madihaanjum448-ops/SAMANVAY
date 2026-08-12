import React from 'react';

const variants = {
  primary:   'bg-teal-700 hover:bg-teal-600 text-white border-teal-700 hover:border-teal-600',
  secondary: 'bg-transparent hover:bg-stone-100 text-stone-600 border-stone-300 hover:border-stone-400 hover:text-stone-900',
  danger:    'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300',
  success:   'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300',
  ghost:     'bg-transparent hover:bg-stone-100 text-stone-500 hover:text-stone-800 border-transparent',
  outline:   'bg-transparent hover:bg-teal-50 text-teal-700 border-teal-300 hover:border-teal-400',
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
