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

    L.marker([lat, lng], { icon: customIcon }).addTo(map).bindPopup(`<h4 class="text-xs font-bold text-red-700">ALERT: ${incident.type}</h4>`).openPopup();

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
          L.marker(agencyObj.coordinates, { icon: dotIcon }).addTo(map).bindPopup(`<h4 class="text-xs font-mono font-bold text-stone-900">${agencyObj.name}</h4>`);
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
    <div className="min-h-screen bg-[#f5f3ef] text-stone-700 flex">
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
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-teal-700 font-bold uppercase tracking-wider mb-5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Command center
          </button>

          {/* Details Dashboard Card */}
          <div className="bg-white border border-stone-200 rounded-lg p-6 flex flex-col gap-6 fade-in shadow-lg">
            
            {/* Header row */}
            <div className="flex justify-between items-start border-b border-stone-200 pb-5 flex-wrap gap-3">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  <AlertTriangle size={24} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 leading-tight">
                      {incident.type} — {incident.location}
                    </h1>
                    <SeverityBadge severity={incident.severity} showDot={false} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2 font-mono">
                    <MapPin size={12} className="text-stone-500" />
                    <span>Pune, India</span>
                    <span>•</span>
                    <Clock size={12} className="text-stone-500" />
                    <span>Reported {getFormatTime(incident.createdAt)}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1.5 border rounded text-xs font-bold tracking-widest uppercase ${
                incident.status === 'ACTIVE' 
                  ? 'border-red-200 text-red-700 bg-red-50' 
                  : 'border-green-200 text-green-700 bg-green-50'
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
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">Situation Summary</h3>
                  <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 border border-stone-200 p-4 rounded">
                    {incident.description}
                  </p>
                </div>

                {/* Assigned list (Mask details if Public) */}
                <div>
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">Mobilized Taskforces</h3>
                  {role === 'public' ? (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded text-xs text-orange-700 font-mono leading-relaxed">
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
                            className="p-3 bg-[#f5f3ef] border border-stone-200 hover:border-stone-300 rounded flex items-center justify-between text-xs cursor-pointer group transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-600 status-pulse"></span>
                              <span className="text-stone-900 font-bold group-hover:text-teal-700 transition-colors">{agencyObj.name}</span>
                            </div>
                            <span className="text-stone-500 font-mono text-[10px] uppercase font-bold tracking-wider">{agencyObj.type}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Resource Demand lists */}
                {role !== 'public' && incident.requiredResources && (
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">Resource Allocation Requirements</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      {incident.requiredResources.personnel > 0 && (
                        <div className="bg-[#f5f3ef] border border-stone-200 p-2.5 rounded">
                          <span className="text-teal-700 flex justify-center mb-1"><Users size={14} /></span>
                          <span className="text-xs font-bold text-stone-900 font-mono">{incident.requiredResources.personnel}</span>
                          <span className="text-[8.5px] text-stone-500 block uppercase font-bold tracking-wider mt-0.5">Staff Needed</span>
                        </div>
                      )}
                      {incident.requiredResources.boats > 0 && (
                        <div className="bg-[#f5f3ef] border border-stone-200 p-2.5 rounded">
                          <span className="text-teal-700 flex justify-center mb-1"><Ship size={14} /></span>
                          <span className="text-xs font-bold text-stone-900 font-mono">{incident.requiredResources.boats}</span>
                          <span className="text-[8.5px] text-stone-500 block uppercase font-bold tracking-wider mt-0.5">Boats Needed</span>
                        </div>
                      )}
                      {incident.requiredResources.ambulances > 0 && (
                        <div className="bg-[#f5f3ef] border border-stone-200 p-2.5 rounded">
                          <span className="text-teal-700 flex justify-center mb-1"><Ambulance size={14} /></span>
                          <span className="text-xs font-bold text-stone-900 font-mono">{incident.requiredResources.ambulances}</span>
                          <span className="text-[8.5px] text-stone-500 block uppercase font-bold tracking-wider mt-0.5">Ambulances</span>
                        </div>
                      )}
                      {incident.requiredResources.drones > 0 && (
                        <div className="bg-[#f5f3ef] border border-stone-200 p-2.5 rounded">
                          <span className="text-teal-700 flex justify-center mb-1"><Plane size={14} /></span>
                          <span className="text-xs font-bold text-stone-900 font-mono">{incident.requiredResources.drones}</span>
                          <span className="text-[8.5px] text-stone-500 block uppercase font-bold tracking-wider mt-0.5">Surveil Drones</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Map location */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">GIS Incident coordinates</h3>
                <div className="flex-1 min-h-[220px] rounded border border-stone-200 overflow-hidden relative">
                  <div ref={mapContainerRef} className="w-full h-full" />
                </div>
              </div>
            </div>

            {/* Response Timeline logs */}
            <div className="border-t border-stone-200 pt-6">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-6">Disaster Response Lifecycle Timeline</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center items-stretch relative">
                {incident.timeline && incident.timeline.map((step, idx) => {
                  const isDone = step.status === 'done';
                  const isActive = step.status === 'active';
                  const isPending = step.status === 'pending';

                  return (
                    <div key={idx} className="bg-[#f5f3ef] border border-stone-200 p-4 rounded flex flex-col justify-between items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold font-mono ${
                        isDone
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : isActive
                          ? 'bg-teal-50 border-cyan-400 text-teal-700 status-pulse '
                          : 'bg-white border-stone-200 text-stone-400'
                      }`}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                          isActive ? 'text-teal-700' : isDone ? 'text-green-700' : 'text-stone-500'
                        }`}>
                          {step.event}
                        </span>
                        <span className="text-[9px] font-mono text-stone-500 block mt-1">{step.time}</span>
                      </div>
                      
                      {role !== 'public' && step.actor && (
                        <span className="text-[8.5px] text-stone-400 font-mono mt-1 border-t border-stone-200 pt-1.5 w-full truncate">
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
