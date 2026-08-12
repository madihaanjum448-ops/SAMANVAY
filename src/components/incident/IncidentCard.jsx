import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MapPin, Clock, ArrowRight } from 'lucide-react';
import { SeverityBadge } from '../ui/Badge';

export default function IncidentCard({ incident }) {
  const navigate = useNavigate();
  const { id, type, location, severity, status, createdAt } = incident;

  const getFormatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  const severityColors = {
    CRITICAL: 'border-l-4 border-l-red-500',
    HIGH: 'border-l-4 border-l-orange-500',
    MEDIUM: 'border-l-4 border-l-yellow-500',
    LOW: 'border-l-4 border-l-green-500',
  };

  return (
    <div 
      onClick={() => navigate(`/incidents/${id}`)}
      className={`bg-[#0f1c35] border border-slate-800 rounded p-3 cursor-pointer card-hover flex flex-col justify-between gap-2.5 ${severityColors[severity] || ''} fade-in`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">{id}</span>
          <h4 className="text-sm font-bold text-white hover:text-cyan-400 transition-colors leading-tight mt-0.5">
            {type} — {location}
          </h4>
        </div>
        <SeverityBadge severity={severity} showDot={false} />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-slate-500" />
            <span>{getFormatTime(createdAt)}</span>
          </div>
          <span className="text-slate-600">•</span>
          <span className={`text-[10px] font-bold tracking-widest ${status === 'ACTIVE' ? 'text-red-400' : 'text-green-400'}`}>
            {status}
          </span>
        </div>
        <span className="text-cyan-400 flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
          CMD <ArrowRight size={10} />
        </span>
      </div>
    </div>
  );
}
