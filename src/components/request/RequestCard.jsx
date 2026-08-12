import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { RequestStatusBadge, UrgencyBadge } from '../ui/Badge';
import RequestTimeline from './RequestTimeline';

export default function RequestCard({ request, onStatusChange }) {
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
    if (status === 'INITIATED') {
      return (
        <button
          onClick={() => onStatusChange(id, 'ACKNOWLEDGED')}
          className="bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#EA580C] border border-[#FED7AA] text-xs font-bold px-3.5 py-1.5 rounded-md cursor-pointer transition-colors"
        >
          Acknowledge Request
        </button>
      );
    }
    if (status === 'ACKNOWLEDGED') {
      return (
        <button
          onClick={() => onStatusChange(id, 'DEPLOYED')}
          className="bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#EA580C] border border-[#FED7AA] text-xs font-bold px-3.5 py-1.5 rounded-md cursor-pointer transition-colors"
        >
          Dispatch Resources
        </button>
      );
    }
    if (status === 'DEPLOYED') {
      return (
        <button
          onClick={() => onStatusChange(id, 'RESOLVED')}
          className="bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border border-[#DCFCE7] text-xs font-bold px-3.5 py-1.5 rounded-md cursor-pointer transition-colors"
        >
          Mark Resolved
        </button>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col gap-4 fade-in shadow-xs">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 border-b border-[#E5E7EB] pb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#166534]">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#111827] font-mono">{id}</h4>
            <span className="text-[10px] text-[#64748B] font-mono">Created {getFormatTime(createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UrgencyBadge urgency={urgency} />
          <RequestStatusBadge status={status} />
        </div>
      </div>

      {/* From / To Routing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#F7F5EF] border border-[#E5E7EB] p-4 rounded-xl">
        <div>
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">Requesting Agency (From)</span>
          <span 
            className="text-[#111827] font-bold hover:text-[#166534] cursor-pointer"
            onClick={() => navigate(`/agencies/${from}`)}
          >
            {fromName}
          </span>
        </div>
        <div className="border-t md:border-t-0 md:border-l border-[#E5E7EB] pt-2.5 md:pt-0 md:pl-4">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">Assigned Responder (To)</span>
          <span 
            className="text-[#111827] font-bold hover:text-[#166534] cursor-pointer"
            onClick={() => navigate(`/agencies/${to}`)}
          >
            {toName}
          </span>
        </div>
      </div>

      {/* Incident Link */}
      {incidentLabel && (
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Related Incident:</span>
          <span
            onClick={() => incident && navigate(`/incidents/${incident}`)}
            className="text-[#166534] font-bold cursor-pointer hover:underline flex items-center gap-0.5"
          >
            {incidentLabel}
          </span>
        </div>
      )}

      {/* Required items detail */}
      <div>
        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Resources Required</span>
        <div className="text-sm font-extrabold text-[#111827] font-mono bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl px-4 py-2.5">
          {required}
        </div>
      </div>

      {/* Message description */}
      {message && (
        <div>
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Details / Mission Directive</span>
          <p className="text-xs text-[#475569] leading-relaxed bg-[#F7F5EF] border border-[#E5E7EB] rounded-xl p-3.5">
            "{message}"
          </p>
        </div>
      )}

      {/* Progress Timeline in card */}
      <div className="pt-2">
        <RequestTimeline status={status} />
      </div>

      {/* Actions bottom row */}
      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4 mt-1 flex-wrap gap-3">
        <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider font-mono">
          System Log Verified
        </span>
        <div className="flex items-center gap-2">
          {getActionButtons()}
          {incident && (
            <button
              onClick={() => navigate(`/incidents/${incident}`)}
              className="text-xs text-[#374151] hover:text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#CBD5E1] px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer"
            >
              Open Incident Command
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
