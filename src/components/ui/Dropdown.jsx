import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Custom Dropdown Component with rich styling, hover animations,
 * checkmarks, outside click closing, and state synchronization.
 */
export default function Dropdown({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  error,
  required,
  className = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside of the component
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center justify-between w-full bg-[#0f1c35] border 
            ${error ? 'border-red-500/60' : isOpen ? 'border-cyan-500/60' : 'border-[#1e2a40]'} 
            rounded-md px-3 py-2.5 text-sm text-slate-200 transition-colors cursor-pointer text-left
            focus:outline-none focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed
          `}
        >
          <span className={selectedOption ? 'text-slate-200' : 'text-slate-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1.5 bg-[#0f1c35] border border-[#1e2a40] rounded-md shadow-xl max-h-60 overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">No options available</div>
            ) : (
              options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (onChange) onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`
                      flex items-center justify-between w-full px-3 py-2 text-sm text-left transition-colors cursor-pointer
                      ${
                        isSelected
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={14} className="text-cyan-400" />}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

/**
 * Standard Styled native select dropdown component
 */
export function NativeSelect({
  label,
  required,
  error,
  className = '',
  children,
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          className={`bg-[#0f1c35] border ${
            error ? 'border-red-500/60' : 'border-[#1e2a40]'
          } rounded-md px-3 py-2.5 text-sm text-slate-200 appearance-none
          focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20
          transition-colors w-full cursor-pointer pr-10`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
