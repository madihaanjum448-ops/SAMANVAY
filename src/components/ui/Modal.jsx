import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Lock body scroll and listen for escape key when open
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${sizes[size] || sizes.md} bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden fade-in`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
            <h2 className="text-base font-semibold text-stone-900 tracking-wide">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Floating close button if no title */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors z-10 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        )}

        {/* Content */}
        <div className="p-6 text-stone-700">{children}</div>
      </div>
    </div>
  );
}
