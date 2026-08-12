import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Users, Ship, Ambulance } from 'lucide-react';
import { StatusBadge, VerificationBadge } from '../ui/Badge';

export default function AgencyCard({ agency }) {
  const navigate = useNavigate();
  const { id, name, type, district, state, status, verificationStatus, resources, distance, expertise } = agency;

  return (
    <div className="bg-[#0f1c35] border border-slate-800 rounded-lg p-4 card-hover flex flex-col justify-between h-full fade-in">
      <div>
        {/* Header: Title and Statuses */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{type}</span>
              {verificationStatus === 'VERIFIED' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-cyan-400 font-bold tracking-wide bg-cyan-500/5 px-1 py-0.2 rounded border border-cyan-500/10">
                  <ShieldCheck size={10} />
                  VERIFIED
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-white leading-snug hover:text-cyan-400 cursor-pointer transition-colors" onClick={() => navigate(`/agencies/${id}`)}>
              {name}
            </h3>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Distance and Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          <MapPin size={12} className="text-slate-500" />
          <span>{district}, {state}</span>
          {distance !== undefined && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400/90 font-medium font-mono">{distance} km away</span>
            </>
          )}
        </div>

        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {expertise?.slice(0, 3).map((exp, idx) => (
            <span key={idx} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-700/60">
              {exp}
            </span>
          ))}
          {expertise?.length > 3 && (
            <span className="text-[9px] text-slate-500 font-semibold self-center px-1">
              +{expertise.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Resource Indicators & Action */}
      <div className="pt-3.5 border-t border-slate-800/80">
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-slate-900/40 border border-slate-800/40 rounded p-1.5">
            <div className="flex items-center justify-center text-slate-500 mb-1">
              <Users size={12} />
            </div>
            <div className="text-xs font-bold text-slate-200 font-mono">
              {resources?.personnel?.available || 0}
            </div>
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Staff</div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/40 rounded p-1.5">
            <div className="flex items-center justify-center text-slate-500 mb-1">
              <Ship size={12} />
            </div>
            <div className="text-xs font-bold text-slate-200 font-mono">
              {resources?.boats?.available || 0}
            </div>
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Boats</div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/40 rounded p-1.5">
            <div className="flex items-center justify-center text-slate-500 mb-1">
              <Ambulance size={12} />
            </div>
            <div className="text-xs font-bold text-slate-200 font-mono">
              {resources?.ambulances?.available || 0}
            </div>
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Ambs</div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/agencies/${id}`)}
          className="w-full text-center bg-navy-800 hover:bg-navy-700 border border-slate-700 hover:border-cyan-500 text-cyan-400 text-xs font-semibold py-1.5 rounded transition-all cursor-pointer"
        >
          View Full Profile
        </button>
      </div>
    </div>
  );
}
