import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Radio, 
  AlertTriangle, 
  Users, 
  Ship, 
  Ambulance, 
  Truck, 
  Plane, 
  Package, 
  Send,
  ArrowLeft,
  X
} from 'lucide-react';
import AuthoritySidebar from '../components/layout/AuthoritySidebar';
import AgencySidebar from '../components/layout/AgencySidebar';
import TopHeader from '../components/layout/TopHeader';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import Dropdown from '../components/ui/Dropdown';
import FormInput from '../components/ui/FormInput';
import Button from '../components/ui/Button';
import { StatusBadge, VerificationBadge } from '../components/ui/Badge';
import { MOCK_AGENCIES, MOCK_INCIDENTS, MOCK_REQUESTS } from '../data/mockData';

export default function AgencyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState('public');
  const [agencies, setAgencies] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [requests, setRequests] = useState([]);
  
  // Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [incidentSelected, setIncidentSelected] = useState('');
  const [resourcesRequired, setResourcesRequired] = useState('');
  const [urgencySelected, setUrgencySelected] = useState('HIGH');
  const [messageText, setMessageText] = useState('');

  // Map Ref
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Sync state
  useEffect(() => {
    const activeRole = localStorage.getItem('samanvay_role') || 'public';
    setRole(activeRole);

    const initData = (key, fallback) => {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    };
    setAgencies(initData('samanvay_agencies', MOCK_AGENCIES));
    setIncidents(initData('samanvay_incidents', MOCK_INCIDENTS));
    setRequests(initData('samanvay_requests', MOCK_REQUESTS));
  }, [id]);

  const agency = agencies.find(a => a.id === id) || MOCK_AGENCIES.find(a => a.id === id) || MOCK_AGENCIES[1];

  // Leaflet Map Init
  useEffect(() => {
    if (!mapContainerRef.current || !agency.coordinates) return;

    const [lat, lng] = agency.coordinates;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView([lat, lng], 13);

    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    const status = agency.status || 'AVAILABLE';
    const statusClasses = {
      AVAILABLE: 'marker-available',
      LIMITED: 'marker-limited',
      DEPLOYED: 'marker-deployed'
    };

    const customIcon = L.divIcon({
      className: 'custom-marker-icon',
      html: `<div class="${statusClasses[status] || 'marker-available'}"></div>`,
      iconSize: [20, 20]
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(map).bindPopup(`<h4 class="text-xs font-bold text-stone-900">${agency.name}</h4>`).openPopup();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [agency]);

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    
    // Determine from Name/ID based on simulation role
    let fromId = 'AG-003';
    let fromName = 'Pune Fire Brigade — Central';
    if (role === 'agency') {
      // simulate from NDRF
      fromId = 'AG-001';
      fromName = 'NDRF Battalion 6';
    } else if (role === 'authority') {
      fromId = 'EOC-PUNE';
      fromName = 'District EOC Control Room';
    }

    const selectedInc = incidents.find(i => i.id === incidentSelected);

    const newRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      from: fromId,
      fromName: fromName,
      to: agency.id,
      toName: agency.name,
      incident: incidentSelected || null,
      incidentLabel: selectedInc ? `${selectedInc.type} — ${selectedInc.location}` : 'General Coordinate Action',
      required: resourcesRequired,
      urgency: urgencySelected,
      message: messageText,
      status: 'INITIATED',
      createdAt: new Date().toISOString(),
      timeline: [
        { status: 'INITIATED', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), done: true },
        { status: 'ACKNOWLEDGED', time: null, done: false },
        { status: 'DEPLOYED', time: null, done: false },
        { status: 'RESOLVED', time: null, done: false },
      ]
    };

    const updated = [newRequest, ...requests];
    localStorage.setItem('samanvay_requests', JSON.stringify(updated));

    // Save to EOC logs
    const storedLogs = localStorage.getItem('samanvay_activity') || '[]';
    const logsList = JSON.parse(storedLogs);
    const newLog = {
      id: Date.now(),
      type: 'request',
      action: 'Request Initiated',
      detail: `${newRequest.id} dispatched from ${fromName} to ${agency.name}`,
      actor: fromName,
      time: 'Just now',
    };
    logsList.unshift(newLog);
    localStorage.setItem('samanvay_activity', JSON.stringify(logsList));

    setIsRequestModalOpen(false);
    navigate('/requests');
  };

  const renderSidebar = () => {
    if (role === 'authority') return <AuthoritySidebar />;
    if (role === 'agency') return <AgencySidebar />;
    return null;
  };

  const resourceIcons = {
    personnel: <Users size={16} />,
    boats: <Ship size={16} />,
    ambulances: <Ambulance size={16} />,
    rescueVehicles: <Truck size={16} />,
    drones: <Plane size={16} />,
    medicalKits: <Package size={16} />
  };

  const resourceLabels = {
    personnel: 'Rescue Personnel Staff',
    boats: 'Inflatable Motor Boats',
    ambulances: 'Medical Ambulances',
    rescueVehicles: 'Tactical Rescue Vehicles',
    drones: 'Search & Surveillance Drones',
    medicalKits: 'Field Medical Kits'
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef] text-stone-700 flex">
      {/* Sidebar navigation */}
      {renderSidebar()}

      {/* Main Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        {role === 'public' ? <Navbar /> : <TopHeader title="Rescue Force Operational Details" />}

        {/* Detail page wrapper */}
        <main className={`p-6 flex-1 overflow-y-auto ${role === 'public' ? 'max-w-4xl mx-auto w-full mt-16' : ''}`}>
          
          {/* Back Navigation */}
          <button 
            onClick={() => navigate('/agencies')}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-teal-700 font-bold uppercase tracking-wider mb-5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Force Registry
          </button>

          {/* Profile Content card */}
          <div className="bg-white border border-stone-200 rounded-lg p-6 flex flex-col gap-6 fade-in shadow-lg">
            
            {/* Header Block */}
            <div className="flex items-start justify-between flex-wrap gap-4 border-b border-stone-200 pb-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded bg-teal-50 border border-teal-300 text-teal-700">
                  <Radio size={24} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 leading-tight">{agency.name}</h1>
                    <VerificationBadge status={agency.verificationStatus} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2 font-mono">
                    <MapPin size={12} className="text-stone-500" />
                    <span>{agency.district}, {agency.state}</span>
                    <span>•</span>
                    <Clock size={12} className="text-stone-500" />
                    <span>Updated {agency.lastUpdated}</span>
                  </div>
                </div>
              </div>
              <StatusBadge status={agency.status} pulse={agency.status === 'AVAILABLE'} />
            </div>

            {/* Profile body Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Details column */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* About Section */}
                <div>
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">Operational Profile</h3>
                  <p className="text-xs text-stone-700 leading-relaxed bg-[#f5f3ef]/40 border border-stone-300 p-3 rounded">
                    {agency.about || 'Verified tactical response group registered under the SAMANVAY system. Dedicated to providing emergency rescue operations and resource mobilization during disasters.'}
                  </p>
                </div>

                {/* Expertise */}
                <div>
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">Tactical Rescue Expertise</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {agency.expertise.map((exp, idx) => (
                      <span key={idx} className="bg-stone-100 text-stone-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-stone-300">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Section (Masked if Public) */}
                <div>
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">Secure Communications Channel</h3>
                  
                  {role === 'public' ? (
                    <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded text-xs text-orange-700 font-mono leading-relaxed">
                      ⚠️ <strong>SECURE COMMUNICATIONS MASKED:</strong> Authorized EOC credentials or tactical agency verification is required to view exact phone lines and operational email routers.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-stone-500 bg-[#f5f3ef]/40 border border-stone-300 p-4 rounded">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-stone-500" />
                        <div>
                          <span className="text-[9px] text-stone-400 block uppercase font-bold">Operational Phone</span>
                          <span className="text-stone-900 font-bold">{agency.phone}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-stone-500" />
                        <div>
                          <span className="text-[9px] text-stone-400 block uppercase font-bold">Secure Email Router</span>
                          <span className="text-stone-900 font-bold">{agency.email}</span>
                        </div>
                      </div>
                      <div className="col-span-1 sm:col-span-2 border-t border-stone-300 pt-2.5 mt-1 flex items-start gap-2">
                        <MapPin size={14} className="text-stone-500 mt-0.5" />
                        <div>
                          <span className="text-[9px] text-stone-400 block uppercase font-bold">HQ Base Street Address</span>
                          <span className="text-stone-900 font-sans">{agency.address}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Map location column */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Base GIS Location</h3>
                <div className="flex-1 min-h-[220px] rounded border border-stone-200 overflow-hidden relative">
                  <div ref={mapContainerRef} className="w-full h-full" />
                </div>
              </div>
            </div>

            {/* Resources inventories Section */}
            <div className="border-t border-stone-200 pt-6">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4">Resource Capacity Allocations</h3>
              
              {role === 'public' ? (
                <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded text-xs text-orange-700 font-mono leading-relaxed">
                  ⚠️ <strong>EXACT ASSETS INVENTORY RESTRICTED:</strong> Public observers can see availability status but cannot view exact staff numbers, boat counts, or medical inventory lists.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.keys(agency.resources || {}).map((key) => {
                    const item = agency.resources[key];
                    const percentage = item.total > 0 ? Math.round((item.available / item.total) * 100) : 0;
                    return (
                      <div key={key} className="bg-[#f5f3ef] border border-stone-300 p-4 rounded flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs text-stone-500">
                          <div className="flex items-center gap-2">
                            <span className="text-teal-700">{resourceIcons[key]}</span>
                            <span className="font-bold text-stone-900 uppercase tracking-wider text-[10px]">{resourceLabels[key] || key}</span>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <span className="text-lg font-bold text-stone-900 font-mono">{item.available} <span className="text-xs text-stone-500">/ {item.total}</span></span>
                          <span className="text-[10px] text-green-700 font-mono font-bold">{percentage}% Available</span>
                        </div>
                        <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-700 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className="border-t border-stone-200 pt-6 flex justify-end gap-3 flex-wrap">
              {role === 'public' ? (
                <button
                  disabled
                  className="bg-white text-stone-400 border border-stone-300 text-xs font-bold px-6 py-3 rounded cursor-not-allowed"
                >
                  Send Assistance Request (EOC Login Required)
                </button>
              ) : (
                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="bg-teal-700 hover:bg-teal-600 text-stone-900 font-bold px-6 py-3 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer "
                >
                  <Send size={13} /> Send Assistance Request
                </button>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Structured assistance request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title={`Request Assistance from ${agency.name}`}
      >
        <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4">
          <Dropdown
            id="req-incident"
            label="Relate to active Incident"
            options={incidents.filter(i => i.status === 'ACTIVE').map(i => ({ value: i.id, label: `${i.id}: ${i.type} — ${i.location}` }))}
            value={incidentSelected}
            onChange={(e) => setIncidentSelected(e.target.value)}
            required
            placeholder="Select Active Incident EOC Log..."
          />

          <FormInput
            id="req-resource"
            label="Required Resources Specification"
            placeholder="e.g. 3 Inflatable Boats, 15 staff personnel"
            value={resourcesRequired}
            onChange={(e) => setResourcesRequired(e.target.value)}
            required
          />

          <Dropdown
            id="req-urgency"
            label="Urgency Level Directive"
            options={['IMMEDIATE', 'HIGH', 'MEDIUM', 'LOW']}
            value={urgencySelected}
            onChange={(e) => setUrgencySelected(e.target.value)}
            required
          />

          <div>
            <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">Details Message Directive</label>
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="e.g. stranded civilians on rooftops in Sector 5 Hadapsar require immediate motorboat evacuation support..."
              className="w-full bg-[#faf9f6] border border-stone-200 focus:border-teal-500 text-xs rounded p-2 text-stone-900 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-200">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsRequestModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Dispatch Request
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
