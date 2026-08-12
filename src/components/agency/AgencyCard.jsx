import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Users, Ship, Ambulance } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';

export default function AgencyCard({ agency }) {
  const navigate = useNavigate();
  const { id, name, type, district, state, status, verificationStatus, resources, distance, expertise } = agency;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 card-hover flex flex-col justify-between h-full fade-in shadow-xs">
      <div>
        {/* Header: Title and Statuses */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{type}</span>
              {verificationStatus === 'VERIFIED' && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[#166534] font-bold tracking-wide bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#DCFCE7]">
                  <ShieldCheck size={11} />
                  VERIFIED
                </span>
              )}
            </div>
            <h3 
              className="text-sm font-extrabold text-[#111827] leading-snug hover:text-[#166534] cursor-pointer transition-colors" 
              onClick={() => navigate(`/agencies/${id}`)}
            >
              {name}
            </h3>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Distance and Location */}
        <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-3 font-mono">
          <MapPin size={13} className="text-[#64748B]" />
          <span>{district}, {state}</span>
          {distance !== undefined && (
            <>
              <span className="text-[#CBD5E1]">•</span>
              <span className="text-[#166534] font-bold">{distance} km away</span>
            </>
          )}
        </div>

        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {expertise?.slice(0, 3).map((exp, idx) => (
            <span key={idx} className="bg-[#F7F5EF] text-[#475569] text-[10px] px-2 py-0.5 rounded-md font-semibold border border-[#E5E7EB]">
              {exp}
            </span>
          ))}
          {expertise?.length > 3 && (
            <span className="text-[10px] text-[#64748B] font-bold self-center px-1">
              +{expertise.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Resource Indicators & Action */}
      <div className="pt-3.5 border-t border-[#E5E7EB]">
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-[#F7F5EF] border border-[#E5E7EB] rounded-lg p-2">
            <div className="flex items-center justify-center text-[#64748B] mb-1">
              <Users size={14} />
            </div>
            <div className="text-xs font-bold text-[#111827] font-mono">
              {resources?.personnel?.available || 0}
            </div>
            <div className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider">Staff</div>
          </div>

          <div className="bg-[#F7F5EF] border border-[#E5E7EB] rounded-lg p-2">
            <div className="flex items-center justify-center text-[#64748B] mb-1">
              <Ship size={14} />
            </div>
            <div className="text-xs font-bold text-[#111827] font-mono">
              {resources?.boats?.available || 0}
            </div>
            <div className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider">Boats</div>
          </div>

          <div className="bg-[#F7F5EF] border border-[#E5E7EB] rounded-lg p-2">
            <div className="flex items-center justify-center text-[#64748B] mb-1">
              <Ambulance size={14} />
            </div>
            <div className="text-xs font-bold text-[#111827] font-mono">
              {resources?.ambulances?.available || 0}
            </div>
            <div className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider">Ambs</div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/agencies/${id}`)}
          className="w-full text-center bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#DCFCE7] text-[#166534] text-xs font-bold py-2 rounded-lg transition-all cursor-pointer shadow-2xs"
        >
          View Full Profile
        </button>
      </div>
    </div>
  );
}
