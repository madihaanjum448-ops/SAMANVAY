import React from 'react';

export function FormInput({ label, required, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        className={`bg-[#0f1c35] border ${
          error ? 'border-red-500/60' : 'border-[#1e2a40]'
        } rounded-md px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600
        focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20
        transition-colors w-full`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export function FormSelect({ label, required, error, className = '', children, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        className={`bg-[#0f1c35] border ${
          error ? 'border-red-500/60' : 'border-[#1e2a40]'
        } rounded-md px-3 py-2.5 text-sm text-slate-200
        focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20
        transition-colors w-full cursor-pointer`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export function FormTextarea({ label, required, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`bg-[#0f1c35] border ${
          error ? 'border-red-500/60' : 'border-[#1e2a40]'
        } rounded-md px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600
        focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20
        transition-colors w-full resize-none`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export default FormInput;
