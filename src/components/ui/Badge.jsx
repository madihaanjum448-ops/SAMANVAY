import React from 'react';

const severityConfig = {
  CRITICAL: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
  HIGH:     { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  MEDIUM:   { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
  LOW:      { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-400' },
};

const statusConfig = {
  AVAILABLE:    { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-400' },
  LIMITED:      { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
  DEPLOYED:     { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
  OFFLINE:      { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30', dot: 'bg-slate-400' },
  ACTIVE:       { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
  RESOLVED:     { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-400' },
};

const verificationConfig = {
  VERIFIED: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  PENDING:  { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  REJECTED: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
};

const requestConfig = {
  INITIATED:    { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400' },
  ACKNOWLEDGED: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
  DEPLOYED:     { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  RESOLVED:     { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-400' },
};

const urgencyConfig = {
  IMMEDIATE: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  HIGH:      { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  MEDIUM:    { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  LOW:       { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
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
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide bg-blue-500/10 text-blue-300 border border-blue-500/20">
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
    red:    { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
    orange: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-400' },
    yellow: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
    green:  { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-400' },
    blue:   { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400' },
    cyan:   { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
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
