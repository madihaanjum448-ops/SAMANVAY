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
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {label}
          {required && <span className="text-red-700 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center justify-between w-full bg-white border 
            ${error ? 'border-red-400' : isOpen ? 'border-teal-400' : 'border-stone-200'} 
            rounded-md px-3 py-2.5 text-sm transition-colors cursor-pointer text-left
            focus:outline-none focus:ring-1 focus:ring-teal-200 disabled:opacity-40 disabled:cursor-not-allowed
            ${selectedOption ? 'text-stone-700' : 'text-stone-500'}
          `}
        >
          <span>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-stone-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1.5 bg-white border border-stone-200 rounded-md shadow-xl max-h-60 overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-stone-500">No options available</div>
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
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                      }
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={14} className="text-teal-700" />}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-700">{error}</span>}
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
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {label}
          {required && <span className="text-red-700 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          className={`bg-white border ${
            error ? 'border-red-400' : 'border-stone-200'
          } rounded-md px-3 py-2.5 text-sm text-stone-700 appearance-none
          focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200
          transition-colors w-full cursor-pointer pr-10`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
        />
      </div>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}
