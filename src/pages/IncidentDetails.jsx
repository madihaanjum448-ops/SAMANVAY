import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Users, 
  Radio, 
  ChevronRight, 
  Activity, 
  ShieldAlert, 
  CheckCircle,
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
  const [incidents, setIncidents] = useState([]);
  const [agencies, setAgencies] = useState([]);

  // Map Ref
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const activeRole = localStorage.getItem('samanvay_role') || 'public';
    setRole(activeRole);

    const initData = (key, fallback) => {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    };

    setIncidents(initData('samanvay_incidents', MOCK_INCIDENTS));
    setAgencies(initData('samanvay_agencies', MOCK_AGENCIES));
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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    // Plot Incident Marker (Red diamond or pulse)
    const customIcon = L.divIcon({
      className: 'custom-marker-icon',
      html: `<div class="marker-incident pulse-critical"></div>`,
      iconSize: [20, 20]
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(map).bindPopup(`<h4 class="text-xs font-bold text-red-400">ALERT: ${incident.type}</h4>`).openPopup();

    // Plot Assigned Agencies as small dots
    if (incident.assignedAgencies) {
      incident.assignedAgencies.forEach(agId => {
        const agencyObj = agencies.find(a => a.id === agId);
        if (agencyObj && agencyObj.coordinates) {
          const dotIcon = L.divIcon({
            className: 'custom-marker-icon',
            html: '<div class="marker-available status-pulse"></div>',
            iconSize: [12, 12]
          });
          L.marker(agencyObj.coordinates, { icon: dotIcon }).addTo(map).bindPopup(`<h4 class="text-xs font-mono font-bold text-white">${agencyObj.name}</h4>`);
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
    <div className="min-h-screen bg-navy-900 text-slate-200 flex">
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
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 font-bold uppercase tracking-wider mb-5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Command center
          </button>

          {/* Details Dashboard Card */}
          <div className="bg-[#0f1c35] border border-slate-800 rounded-lg p-6 flex flex-col gap-6 fade-in shadow-2xl">
            
            {/* Header row */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-5 flex-wrap gap-3">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded">
                  <AlertTriangle size={24} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                      {incident.type} — {incident.location}
                    </h1>
                    <SeverityBadge severity={incident.severity} showDot={false} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-mono">
                    <MapPin size={12} className="text-slate-500" />
                    <span>Pune, India</span>
                    <span>•</span>
                    <Clock size={12} className="text-slate-500" />
                    <span>Reported {getFormatTime(incident.createdAt)}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1.5 border rounded text-xs font-bold tracking-widest uppercase ${
                incident.status === 'ACTIVE' 
                  ? 'border-red-500/30 text-red-400 bg-red-500/10' 
                  : 'border-green-500/30 text-green-400 bg-green-500/10'
              }`}>
                🔴 Status: {incident.status}
              </span>
            </div>

            {/* Split row: Description/Assigned vs Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left specifications */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Situation Summary</h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-navy-900/40 border border-slate-850 p-4 rounded">
                    {incident.description}
                  </p>
                </div>

                {/* Assigned list (Mask details if Public) */}
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Mobilized Taskforces</h3>
                  {role === 'public' ? (
                    <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded text-xs text-orange-400 font-mono leading-relaxed">
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
                            className="p-3 bg-navy-900 border border-slate-850 hover:border-slate-700/60 rounded flex items-center justify-between text-xs cursor-pointer group transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500 status-pulse"></span>
                              <span className="text-white font-bold group-hover:text-cyan-400 transition-colors">{agencyObj.name}</span>
                            </div>
                            <span className="text-slate-500 font-mono text-[10px] uppercase font-bold tracking-wider">{agencyObj.type}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Resource Demand lists */}
                {role !== 'public' && incident.requiredResources && (
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Resource Allocation Requirements</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      {incident.requiredResources.personnel > 0 && (
                        <div className="bg-navy-900 border border-slate-850 p-2.5 rounded">
                          <span className="text-cyan-400 flex justify-center mb-1"><Users size={14} /></span>
                          <span className="text-xs font-bold text-white font-mono">{incident.requiredResources.personnel}</span>
                          <span className="text-[8.5px] text-slate-500 block uppercase font-bold tracking-wider mt-0.5">Staff Needed</span>
                        </div>
                      )}
                      {incident.requiredResources.boats > 0 && (
                        <div className="bg-navy-900 border border-slate-850 p-2.5 rounded">
                          <span className="text-cyan-400 flex justify-center mb-1"><Ship size={14} /></span>
                          <span className="text-xs font-bold text-white font-mono">{incident.requiredResources.boats}</span>
                          <span className="text-[8.5px] text-slate-500 block uppercase font-bold tracking-wider mt-0.5">Boats Needed</span>
                        </div>
                      )}
                      {incident.requiredResources.ambulances > 0 && (
                        <div className="bg-navy-900 border border-slate-850 p-2.5 rounded">
                          <span className="text-cyan-400 flex justify-center mb-1"><Ambulance size={14} /></span>
                          <span className="text-xs font-bold text-white font-mono">{incident.requiredResources.ambulances}</span>
                          <span className="text-[8.5px] text-slate-500 block uppercase font-bold tracking-wider mt-0.5">Ambulances</span>
                        </div>
                      )}
                      {incident.requiredResources.drones > 0 && (
                        <div className="bg-navy-900 border border-slate-850 p-2.5 rounded">
                          <span className="text-cyan-400 flex justify-center mb-1"><Plane size={14} /></span>
                          <span className="text-xs font-bold text-white font-mono">{incident.requiredResources.drones}</span>
                          <span className="text-[8.5px] text-slate-500 block uppercase font-bold tracking-wider mt-0.5">Surveil Drones</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Map location */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">GIS Incident coordinates</h3>
                <div className="flex-1 min-h-[220px] rounded border border-slate-800 overflow-hidden relative">
                  <div ref={mapContainerRef} className="w-full h-full" />
                </div>
              </div>
            </div>

            {/* Response Timeline logs */}
            <div className="border-t border-slate-800 pt-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Disaster Response Lifecycle Timeline</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center items-stretch relative">
                {incident.timeline && incident.timeline.map((step, idx) => {
                  const isDone = step.status === 'done';
                  const isActive = step.status === 'active';
                  const isPending = step.status === 'pending';

                  return (
                    <div key={idx} className="bg-navy-900 border border-slate-850 p-4 rounded flex flex-col justify-between items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold font-mono ${
                        isDone
                          ? 'bg-green-500/10 border-green-500 text-green-400'
                          : isActive
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 status-pulse shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                          : 'bg-[#0f1c35] border-slate-800 text-slate-600'
                      }`}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                          isActive ? 'text-cyan-400' : isDone ? 'text-green-400' : 'text-slate-500'
                        }`}>
                          {step.event}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 block mt-1">{step.time}</span>
                      </div>
                      
                      {role !== 'public' && step.actor && (
                        <span className="text-[8.5px] text-slate-600 font-mono mt-1 border-t border-slate-850 pt-1.5 w-full truncate">
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
