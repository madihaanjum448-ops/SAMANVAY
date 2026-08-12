import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { RequestStatusBadge, UrgencyBadge } from '../ui/Badge';
import RequestTimeline from './RequestTimeline';

export default function RequestCard({ request, onStatusChange, currentRole = 'authority' }) {
  const navigate = useNavigate();
  const { id, from, fromName, to, toName, incident, incidentLabel, required, urgency, message, status, createdAt } = request;

  const getFormatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  const getActionButtons = () => {
    // If viewing as SDRF or EOC, let them simulate acknowledgment/dispatch
    if (status === 'INITIATED') {
      return (
        <button
          onClick={() => onStatusChange(id, 'ACKNOWLEDGED')}
          className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-semibold px-3 py-1.5 rounded cursor-pointer transition-colors"
        >
          Acknowledge Request
        </button>
      );
    }
    if (status === 'ACKNOWLEDGED') {
      return (
        <button
          onClick={() => onStatusChange(id, 'DEPLOYED')}
          className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold px-3 py-1.5 rounded cursor-pointer transition-colors"
        >
          Dispatch Resources
        </button>
      );
    }
    if (status === 'DEPLOYED') {
      return (
        <button
          onClick={() => onStatusChange(id, 'RESOLVED')}
          className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-semibold px-3 py-1.5 rounded cursor-pointer transition-colors"
        >
          Mark Resolved
        </button>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0f1c35] border border-slate-800 rounded-lg p-5 flex flex-col gap-4 fade-in">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800/60 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <FileText size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 font-mono">{id}</h4>
            <span className="text-[10px] text-slate-500 font-medium">Created {getFormatTime(createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UrgencyBadge urgency={urgency} />
          <RequestStatusBadge status={status} />
        </div>
      </div>

      {/* From / To Routing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-900/35 border border-slate-800/40 p-3 rounded">
        <div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Requesting Agency (From)</span>
          <span 
            className="text-white font-bold hover:text-cyan-400 cursor-pointer"
            onClick={() => navigate(`/agencies/${from}`)}
          >
            {fromName}
          </span>
        </div>
        <div className="border-t md:border-t-0 md:border-l border-slate-800/80 pt-2.5 md:pt-0 md:pl-4">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Assigned Responder (To)</span>
          <span 
            className="text-white font-bold hover:text-cyan-400 cursor-pointer"
            onClick={() => navigate(`/agencies/${to}`)}
          >
            {toName}
          </span>
        </div>
      </div>

      {/* Incident Link */}
      {incidentLabel && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Related Incident:</span>
          <span
            onClick={() => incident && navigate(`/incidents/${incident}`)}
            className="text-cyan-400 font-semibold cursor-pointer hover:underline flex items-center gap-0.5"
          >
            {incidentLabel}
          </span>
        </div>
      )}

      {/* Required items detail */}
      <div>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Resources Required</span>
        <div className="text-sm font-bold text-white font-mono bg-cyan-500/5 border border-cyan-500/10 rounded px-3 py-2">
          {required}
        </div>
      </div>

      {/* Message description */}
      {message && (
        <div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Details / Mission Directive</span>
          <p className="text-xs text-slate-300 italic font-medium leading-relaxed bg-[#0a1020] border border-slate-800/40 rounded p-3">
            "{message}"
          </p>
        </div>
      )}

      {/* Progress Timeline in card */}
      <div className="pt-2">
        <RequestTimeline status={status} />
      </div>

      {/* Actions bottom row */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-1 flex-wrap gap-3">
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-mono">
          Prototype Demo State
        </span>
        <div className="flex items-center gap-2">
          {getActionButtons()}
          {incident && (
            <button
              onClick={() => navigate(`/incidents/${incident}`)}
              className="text-xs text-slate-400 hover:text-white border border-slate-700/60 hover:border-slate-600 px-3 py-1.5 rounded font-semibold transition-colors"
            >
              Open Incident Command
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
