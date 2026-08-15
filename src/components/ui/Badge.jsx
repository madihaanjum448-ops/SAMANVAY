import React from 'react';

const severityConfig = {
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  HIGH:     { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  MEDIUM:   { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  LOW:      { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-600' },
};

const statusConfig = {
  AVAILABLE:    { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-600' },
  LIMITED:      { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  DEPLOYED:     { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  OFFLINE:      { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200', dot: 'bg-stone-400' },
  ACTIVE:       { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-600' },
  RESOLVED:     { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-600' },
};

const verificationConfig = {
  VERIFIED: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  PENDING:  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const requestConfig = {
  INITIATED:        { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  PENDING_APPROVAL: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500' },
  APPROVED:         { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  REJECTED:         { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  ACKNOWLEDGED:     { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  DEPLOYED:         { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  RESOLVED:         { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-600' },
};

const urgencyConfig = {
  IMMEDIATE: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  HIGH:      { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  MEDIUM:    { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  LOW:       { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

export function SeverityBadge({ severity, showDot = true }) {
  const cfg = severityConfig[severity] || severityConfig.LOW;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold tracking-wide border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
      {severity}
    </span>
  );
}

export function StatusBadge({ status, showDot = true, pulse = false }) {
  const cfg = statusConfig[status] || statusConfig.OFFLINE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold tracking-wide border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${pulse ? 'status-pulse' : ''}`} />
      )}
      {status}
    </span>
  );
}

export function VerificationBadge({ status }) {
  const cfg = verificationConfig[status] || verificationConfig.PENDING;
  const icons = { VERIFIED: '✓', PENDING: '⋯', REJECTED: '✕' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold tracking-wide border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span>{icons[status]}</span>
      {status}
    </span>
  );
}

export function RequestStatusBadge({ status, showDot = true }) {
  const cfg = requestConfig[status] || requestConfig.INITIATED;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold tracking-wide border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
      {status}
    </span>
  );
}

export function UrgencyBadge({ urgency }) {
  const cfg = urgencyConfig[urgency] || urgencyConfig.LOW;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {urgency === 'IMMEDIATE' && '⚡ '}{urgency}
    </span>
  );
}

export function TypeBadge({ type }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
      {type}
    </span>
  );
}

export default function Badge({
  children,
  color = 'cyan',
  showDot = false,
  pulse = false,
  className = '',
  ...props
}) {
  const colorMap = {
    red:    { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
    yellow: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    green:  { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-600' },
    blue:   { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    cyan:   { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-600' },
  };

  const cfg = colorMap[color] || colorMap.cyan;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold tracking-wide border
        ${cfg.bg} ${cfg.text} ${cfg.border}
        ${className}
      `}
      {...props}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${pulse ? 'status-pulse' : ''}`} />
      )}
      {children}
    </span>
  );
}
