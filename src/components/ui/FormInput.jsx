import React from 'react';

export function FormInput({ label, required, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {label}{required && <span className="text-red-700 ml-1">*</span>}
        </label>
      )}
      <input
        className={`bg-white border ${
          error ? 'border-red-400' : 'border-stone-200'
        } rounded-md px-3 py-2.5 text-sm text-stone-700 placeholder-stone-400
        focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200
        transition-colors w-full`}
        {...props}
      />
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}

export function FormSelect({ label, required, error, className = '', children, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {label}{required && <span className="text-red-700 ml-1">*</span>}
        </label>
      )}
      <select
        className={`bg-white border ${
          error ? 'border-red-400' : 'border-stone-200'
        } rounded-md px-3 py-2.5 text-sm text-stone-700
        focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200
        transition-colors w-full cursor-pointer`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}

export function FormTextarea({ label, required, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {label}{required && <span className="text-red-700 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`bg-white border ${
          error ? 'border-red-400' : 'border-stone-200'
        } rounded-md px-3 py-2.5 text-sm text-stone-700 placeholder-stone-400
        focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200
        transition-colors w-full resize-none`}
        {...props}
      />
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}

export default FormInput;
