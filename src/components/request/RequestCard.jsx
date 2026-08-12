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
          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded cursor-pointer transition-colors"
        >
          Acknowledge Request
        </button>
      );
    }
    if (status === 'ACKNOWLEDGED') {
      return (
        <button
          onClick={() => onStatusChange(id, 'DEPLOYED')}
          className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-semibold px-3 py-1.5 rounded cursor-pointer transition-colors"
        >
          Dispatch Resources
        </button>
      );
    }
    if (status === 'DEPLOYED') {
      return (
        <button
          onClick={() => onStatusChange(id, 'RESOLVED')}
          className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-semibold px-3 py-1.5 rounded cursor-pointer transition-colors"
        >
          Mark Resolved
        </button>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5 flex flex-col gap-4 fade-in">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-50 border border-blue-200 text-blue-700">
            <FileText size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-500 font-mono">{id}</h4>
            <span className="text-[10px] text-stone-500 font-medium">Created {getFormatTime(createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UrgencyBadge urgency={urgency} />
          <RequestStatusBadge status={status} />
        </div>
      </div>

      {/* From / To Routing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-stone-50 border border-stone-200 p-3 rounded">
        <div>
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-0.5">Requesting Agency (From)</span>
          <span 
            className="text-stone-900 font-bold hover:text-teal-700 cursor-pointer"
            onClick={() => navigate(`/agencies/${from}`)}
          >
            {fromName}
          </span>
        </div>
        <div className="border-t md:border-t-0 md:border-l border-stone-200 pt-2.5 md:pt-0 md:pl-4">
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-0.5">Assigned Responder (To)</span>
          <span 
            className="text-stone-900 font-bold hover:text-teal-700 cursor-pointer"
            onClick={() => navigate(`/agencies/${to}`)}
          >
            {toName}
          </span>
        </div>
      </div>

      {/* Incident Link */}
      {incidentLabel && (
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Related Incident:</span>
          <span
            onClick={() => incident && navigate(`/incidents/${incident}`)}
            className="text-teal-700 font-semibold cursor-pointer hover:underline flex items-center gap-0.5"
          >
            {incidentLabel}
          </span>
        </div>
      )}

      {/* Required items detail */}
      <div>
        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">Resources Required</span>
        <div className="text-sm font-bold text-stone-900 font-mono bg-teal-50/50 border border-teal-200 rounded px-3 py-2">
          {required}
        </div>
      </div>

      {/* Message description */}
      {message && (
        <div>
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">Details / Mission Directive</span>
          <p className="text-xs text-stone-700 italic font-medium leading-relaxed bg-[#faf9f6] border border-stone-200 rounded p-3">
            "{message}"
          </p>
        </div>
      )}

      {/* Progress Timeline in card */}
      <div className="pt-2">
        <RequestTimeline status={status} />
      </div>

      {/* Actions bottom row */}
      <div className="flex items-center justify-between border-t border-stone-200 pt-4 mt-1 flex-wrap gap-3">
        <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider font-mono">
          Prototype Demo State
        </span>
        <div className="flex items-center gap-2">
          {getActionButtons()}
          {incident && (
            <button
              onClick={() => navigate(`/incidents/${incident}`)}
              className="text-xs text-stone-500 hover:text-stone-900 border border-stone-300 hover:border-stone-400 px-3 py-1.5 rounded font-semibold transition-colors"
            >
              Open Incident Command
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
