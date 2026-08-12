import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Users, 
  Ship, 
  Ambulance, 
  Plane, 
  ArrowLeft
} from 'lucide-react';
import AuthoritySidebar from '../components/layout/AuthoritySidebar';
import AgencySidebar from '../components/layout/AgencySidebar';
import TopHeader from '../components/layout/TopHeader';
import Navbar from '../components/layout/Navbar';
import { SeverityBadge } from '../components/ui/Badge';
import { MOCK_INCIDENTS, MOCK_AGENCIES } from '../data/mockData';

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState('authority');
  const [incidents] = useState(() => {
    const stored = localStorage.getItem('samanvay_incidents');
    return stored ? JSON.parse(stored) : MOCK_INCIDENTS;
  });
  const [agencies] = useState(() => {
    const stored = localStorage.getItem('samanvay_agencies');
    return stored ? JSON.parse(stored) : MOCK_AGENCIES;
  });

  // Map Ref
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const activeRole = localStorage.getItem('samanvay_role') || 'public';
    setRole(activeRole);
  }, [id]);

  const incident = incidents.find(i => i.id === id) || MOCK_INCIDENTS.find(i => i.id === id) || MOCK_INCIDENTS[0];

  // Leaflet Map Init
  useEffect(() => {
    if (!mapContainerRef.current || !incident.coordinates) return;

    const [lat, lng] = incident.coordinates;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true
    }).setView([lat, lng], 13);

    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    // Plot Incident Marker
    const customIcon = L.divIcon({
      className: 'custom-marker-icon',
      html: `<div class="marker-incident pulse-critical"></div>`,
      iconSize: [20, 20]
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(map).bindPopup(`<h4 class="text-xs font-bold text-[#DC2626]">ALERT: ${incident.type}</h4>`).openPopup();

    // Plot Assigned Agencies
    if (incident.assignedAgencies) {
      incident.assignedAgencies.forEach(agId => {
        const agencyObj = agencies.find(a => a.id === agId);
        if (agencyObj && agencyObj.coordinates) {
          const dotIcon = L.divIcon({
            className: 'custom-marker-icon',
            html: '<div class="marker-available status-pulse"></div>',
            iconSize: [12, 12]
          });
          L.marker(agencyObj.coordinates, { icon: dotIcon }).addTo(map).bindPopup(`<h4 class="text-xs font-mono font-bold text-[#111827]">${agencyObj.name}</h4>`);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [incident, agencies]);

  const renderSidebar = () => {
    if (role === 'authority') return <AuthoritySidebar />;
    if (role === 'agency') return <AgencySidebar />;
    return null;
  };

  const getFormatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
    } catch {
      return 'Active';
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#111827] flex font-sans">
      {/* Sidebar navigation */}
      {renderSidebar()}

      {/* Main Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        {role === 'public' ? <Navbar /> : <TopHeader title="Emergency Command Room" />}

        {/* Outer body wrapper */}
        <main className={`p-6 flex-1 overflow-y-auto ${role === 'public' ? 'max-w-4xl mx-auto w-full mt-16' : ''}`}>
          
          {/* Back Navigation */}
          <button 
            onClick={() => navigate(role === 'public' ? '/' : '/authority/dashboard?tab=incidents')}
            className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#166534] font-bold uppercase tracking-wider mb-5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Command center
          </button>

          {/* Details Dashboard Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 fade-in shadow-xs">
            
            {/* Header row */}
            <div className="flex justify-between items-start border-b border-[#E5E7EB] pb-6 flex-wrap gap-3">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center">
                  <AlertTriangle size={24} className="status-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] leading-tight">
                      {incident.type} — {incident.location}
                    </h1>
                    <SeverityBadge severity={incident.severity} showDot={false} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#64748B] mt-2 font-mono">
                    <MapPin size={14} className="text-[#64748B]" />
                    <span>Pune, India</span>
                    <span>•</span>
                    <Clock size={14} className="text-[#64748B]" />
                    <span>Reported {getFormatTime(incident.createdAt)}</span>
                  </div>
                </div>
              </div>
              <span className={`px-4 py-2 border rounded-lg text-xs font-bold tracking-widest uppercase ${
                incident.status === 'ACTIVE' 
                  ? 'border-[#FECACA] text-[#DC2626] bg-[#FEF2F2]' 
                  : 'border-[#DCFCE7] text-[#166534] bg-[#F0FDF4]'
              }`}>
                ● Status: {incident.status}
              </span>
            </div>

            {/* Split row: Description/Assigned vs Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left specifications */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">Situation Summary</h3>
                  <p className="text-xs text-[#475569] leading-relaxed bg-[#F7F5EF] border border-[#E5E7EB] p-4 rounded-xl">
                    {incident.description}
                  </p>
                </div>

                {/* Assigned list */}
                <div>
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">Mobilized Taskforces</h3>
                  {role === 'public' ? (
                    <div className="bg-[#FFF7ED] border border-[#FED7AA] p-4 rounded-xl text-xs text-[#EA580C] font-mono leading-relaxed">
                      ⚠️ <strong>OPERATIONAL UNITS MASKED:</strong> Vetted security coordinates and precise personnel logs are hidden from observer views. 2 verified units active on-site.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {incident.assignedAgencies && incident.assignedAgencies.map(agId => {
                        const agencyObj = agencies.find(a => a.id === agId);
                        if (!agencyObj) return null;
                        return (
                          <div 
                            key={agId}
                            onClick={() => navigate(`/agencies/${agId}`)}
                            className="p-3.5 bg-[#F7F5EF] border border-[#E5E7EB] hover:border-[#CBD5E1] rounded-xl flex items-center justify-between text-xs cursor-pointer group transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-[#166534] status-pulse"></span>
                              <span className="text-[#111827] font-bold group-hover:text-[#166534] transition-colors">{agencyObj.name}</span>
                            </div>
                            <span className="text-[#64748B] font-mono text-[10px] font-bold uppercase tracking-wider">{agencyObj.type}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Resource Demand lists */}
                {role !== 'public' && incident.requiredResources && (
                  <div>
                    <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-3">Resource Allocation Requirements</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      {incident.requiredResources.personnel > 0 && (
                        <div className="bg-[#F7F5EF] border border-[#E5E7EB] p-3 rounded-xl">
                          <span className="text-[#166534] flex justify-center mb-1"><Users size={16} /></span>
                          <span className="text-sm font-extrabold text-[#111827] font-mono">{incident.requiredResources.personnel}</span>
                          <span className="text-[9px] text-[#64748B] block uppercase font-bold tracking-wider mt-0.5">Staff Needed</span>
                        </div>
                      )}
                      {incident.requiredResources.boats > 0 && (
                        <div className="bg-[#F7F5EF] border border-[#E5E7EB] p-3 rounded-xl">
                          <span className="text-[#166534] flex justify-center mb-1"><Ship size={16} /></span>
                          <span className="text-sm font-extrabold text-[#111827] font-mono">{incident.requiredResources.boats}</span>
                          <span className="text-[9px] text-[#64748B] block uppercase font-bold tracking-wider mt-0.5">Boats Needed</span>
                        </div>
                      )}
                      {incident.requiredResources.ambulances > 0 && (
                        <div className="bg-[#F7F5EF] border border-[#E5E7EB] p-3 rounded-xl">
                          <span className="text-[#166534] flex justify-center mb-1"><Ambulance size={16} /></span>
                          <span className="text-sm font-extrabold text-[#111827] font-mono">{incident.requiredResources.ambulances}</span>
                          <span className="text-[8.5px] text-[#64748B] block uppercase font-bold tracking-wider mt-0.5">Ambulances</span>
                        </div>
                      )}
                      {incident.requiredResources.drones > 0 && (
                        <div className="bg-[#F7F5EF] border border-[#E5E7EB] p-3 rounded-xl">
                          <span className="text-[#166534] flex justify-center mb-1"><Plane size={16} /></span>
                          <span className="text-sm font-extrabold text-[#111827] font-mono">{incident.requiredResources.drones}</span>
                          <span className="text-[8.5px] text-[#64748B] block uppercase font-bold tracking-wider mt-0.5">Surveil Drones</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Map location */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">GIS Incident coordinates</h3>
                <div className="flex-1 min-h-[240px] rounded-xl border border-[#E5E7EB] overflow-hidden relative shadow-2xs">
                  <div ref={mapContainerRef} className="w-full h-full" />
                </div>
              </div>
            </div>

            {/* Response Timeline logs */}
            <div className="border-t border-[#E5E7EB] pt-6">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-6">Disaster Response Lifecycle Timeline</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center items-stretch relative">
                {incident.timeline && incident.timeline.map((step, idx) => {
                  const isDone = step.status === 'done';
                  const isActive = step.status === 'active';

                  return (
                    <div key={idx} className="bg-[#F7F5EF] border border-[#E5E7EB] p-4 rounded-xl flex flex-col justify-between items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs font-bold font-mono ${
                        isDone
                          ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#166534]'
                          : isActive
                          ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626] status-pulse'
                          : 'bg-white border-[#E5E7EB] text-[#64748B]'
                      }`}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                          isActive ? 'text-[#DC2626]' : isDone ? 'text-[#166534]' : 'text-[#64748B]'
                        }`}>
                          {step.event}
                        </span>
                        <span className="text-[9px] font-mono text-[#64748B] block mt-1">{step.time}</span>
                      </div>
                      
                      {role !== 'public' && step.actor && (
                        <span className="text-[9px] text-[#64748B] font-mono mt-1 border-t border-[#E5E7EB] pt-1.5 w-full truncate">
                          {step.actor}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
