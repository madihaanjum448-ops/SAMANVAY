import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users,
  Activity, 
  Ship, 
  Ambulance, 
  Truck, 
  Plane, 
  Radio, 
  Edit,
  Shield,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileSpreadsheet,
  AlertTriangle,
  Building2,
  Maximize2,
  BarChart2,
  Package
} from 'lucide-react';
import AgencySidebar from '../../components/layout/AgencySidebar';
import TopHeader from '../../components/layout/TopHeader';
import MapView from '../../components/map/MapView';
import MapLegend from '../../components/map/MapLegend';
import { UrgencyBadge, RequestStatusBadge, SeverityBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Dropdown from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';
import { 
  MOCK_AGENCIES, 
  MOCK_INCIDENTS, 
  MOCK_REQUESTS 
} from '../../data/mockData';
import { api } from '../../services/api';

export default function AgencyDashboard() {
  const navigate = useNavigate();
  const agencyId = 'AG-002'; // Logged-in agency: SDRF UNIT 01

  // Local state synced with backend API
  const [agencies, setAgencies] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [tempStatus, setTempStatus] = useState('');

  // Load from Backend API
  useEffect(() => {
    async function loadData() {
      try {
        const [agenciesData, incidentsData, requestsData] = await Promise.all([
          api.agencies.getAll(),
          api.incidents.getAll(),
          api.requests.getAll()
        ]);
        if (agenciesData?.length) setAgencies(agenciesData);
        if (incidentsData?.length) setIncidents(incidentsData);
        if (requestsData?.length) setRequests(requestsData);
      } catch (err) {
        console.error('Failed to load agency data from API:', err);
      }
    }
    loadData();
  }, []);

  const syncState = (key, data, setter) => {
    setter(data);
    localStorage.setItem(key, JSON.stringify(data));
  };

  const currentAgency = agencies.find(a => a.id === agencyId) || MOCK_AGENCIES[1];

  // Resource variables
  const res = currentAgency.resources || {};

  const handleStatusChangeSubmit = (e) => {
    e.preventDefault();
    const updated = agencies.map(a => 
      a.id === agencyId ? { ...a, status: tempStatus, lastUpdated: 'Just now' } : a
    );
    syncState('samanvay_agencies', updated, setAgencies);
    setShowStatusModal(false);

    // Push into activity logs
    const storedLogs = localStorage.getItem('samanvay_activity') || '[]';
    const logsList = JSON.parse(storedLogs);
    const newLog = {
      id: Date.now(),
      type: 'system',
      action: 'Status Updated',
      detail: `SDRF Unit 01 changed status to ${tempStatus}`,
      actor: 'SDRF Unit 01 dispatcher',
      time: 'Just now',
    };
    logsList.unshift(newLog);
    localStorage.setItem('samanvay_activity', JSON.stringify(logsList));
  };

  const handleRequestStatusChange = (reqId, newStatus) => {
    const updated = requests.map(r => {
      if (r.id === reqId) {
        const timeKey = newStatus === 'ACKNOWLEDGED' ? 'acknowledgedAt' : newStatus === 'DEPLOYED' ? 'deployedAt' : 'resolvedAt';
        return {
          ...r,
          status: newStatus,
          [timeKey]: new Date().toISOString(),
          timeline: r.timeline.map(t => t.status === newStatus ? { ...t, done: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) } : t)
        };
      }
      return r;
    });
    syncState('samanvay_requests', updated, setRequests);

    // Push to EOC Activity logs
    const storedLogs = localStorage.getItem('samanvay_activity') || '[]';
    const logsList = JSON.parse(storedLogs);
    const reqCode = requests.find(r => r.id === reqId)?.id || 'Request';
    const newLog = {
      id: Date.now(),
      type: 'request',
      action: `Request ${newStatus}`,
      detail: `${reqCode} updated to ${newStatus} by SDRF Unit 01`,
      actor: 'SDRF Unit 01 dispatcher',
      time: 'Just now',
    };
    logsList.unshift(newLog);
    localStorage.setItem('samanvay_activity', JSON.stringify(logsList));
  };

  const incomingRequests = requests.filter(r => r.to === agencyId && r.status !== 'RESOLVED');

  // Active missions where this agency is assigned
  const activeMissions = incidents.filter(i => i.status === 'ACTIVE' && i.assignedAgencies?.includes(agencyId));
  const activeIncidentsAll = incidents.filter(i => i.status === 'ACTIVE');
  const criticalIncidentsCount = activeIncidentsAll.filter(i => i.severity === 'CRITICAL').length;
  const verifiedAgenciesCount = agencies.filter(a => a.verificationStatus === 'VERIFIED').length || 10;
  const deployedMissionsCount = activeMissions.length;

  const statusColors = {
    AVAILABLE: 'text-[#166534] bg-[#F0FDF4] border-[#DCFCE7]',
    LIMITED: 'text-[#EA580C] bg-[#FFF7ED] border-[#FED7AA]',
    DEPLOYED: 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]',
    OFFLINE: 'text-[#64748B] bg-[#F8FAFC] border-[#E2E8F0]',
  };

  // Build Map Markers for Live Incident Map
  const getMapMarkers = () => {
    const list = [];
    
    // Verified Agencies
    agencies.filter(a => a.verificationStatus === 'VERIFIED').forEach(a => {
      list.push({
        id: a.id,
        name: a.name,
        type: 'agency',
        agencyType: a.type,
        status: a.status,
        coordinates: a.coordinates,
        district: a.district,
        state: a.state,
        resources: a.resources
      });
    });

    // Active Incidents
    incidents.filter(i => i.status === 'ACTIVE').forEach(i => {
      list.push({
        id: i.id,
        name: i.type,
        type: 'incident',
        incidentType: i.type,
        severity: i.severity,
        coordinates: i.coordinates,
        location: i.location,
        description: i.description,
        time: i.createdAt ? new Date(i.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Active'
      });
    });

    return list;
  };

  // Resource progress bars data
  const resourceReadinessItems = [
    { key: 'staff', label: 'RESCUE STAFF', avail: res.personnel?.available || 32, total: res.personnel?.total || 50, icon: <Users size={14} className="text-[#166534]" /> },
    { key: 'ambulances', label: 'AMBULANCES', avail: res.ambulances?.available || 3, total: res.ambulances?.total || 5, icon: <Ambulance size={14} className="text-[#DC2626]" /> },
    { key: 'boats', label: 'RESCUE BOATS', avail: res.boats?.available || 7, total: res.boats?.total || 10, icon: <Ship size={14} className="text-[#0284C7]" /> },
    { key: 'trucks', label: 'RESCUE TRUCKS', avail: res.rescueVehicles?.available || 2, total: res.rescueVehicles?.total || 4, icon: <Truck size={14} className="text-[#D97706]" /> },
    { key: 'drones', label: 'SEARCH DRONES', avail: res.drones?.available || 2, total: res.drones?.total || 3, icon: <Plane size={14} className="text-[#7C3AED]" /> },
    { key: 'medical', label: 'MEDICAL KITS', avail: res.medicalKits?.available || 18, total: res.medicalKits?.total || 25, icon: <Package size={14} className="text-[#166534]" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#0F172A] flex font-sans text-xs">
      {/* Sidebar Navigation */}
      <AgencySidebar />

      {/* Main Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Compact EOC Command Header */}
        <TopHeader title="Rescue Agency Dispatch Terminal" />

        {/* Dashboard Main Content */}
        <main className="p-4 md:p-6 flex-1 overflow-y-auto space-y-5">
          
          {/* TOP AGENCY BRAND & AVAILABILITY STATUS BOARD */}
          <div className="bg-white border border-[#CBD5E1] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xs font-mono">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-none bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#166534]">
                <Radio size={20} className="status-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-bold text-[#0F172A] tracking-wider uppercase">{currentAgency.name}</h1>
                  <span className="inline-flex items-center gap-1 text-[9px] text-[#166534] bg-[#F0FDF4] px-2 py-0.5 border border-[#DCFCE7] font-bold">
                    ✓ VERIFIED DISPATCH UNIT
                  </span>
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>HQ: SHIVAJINAGAR, PUNE</span>
                  <span>•</span>
                  <span>LAST SYNC: {currentAgency.lastUpdated || '1 min ago'}</span>
                  <span>•</span>
                  <span className="text-[#166534] font-bold">TACTICAL NETWORK ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Availability status actions */}
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 border text-[11px] font-bold uppercase tracking-wider ${statusColors[currentAgency.status] || ''}`}>
                ● STATUS: {currentAgency.status}
              </div>
              
              <button
                onClick={() => {
                  setTempStatus(currentAgency.status);
                  setShowStatusModal(true);
                }}
                className="bg-[#166534] hover:bg-[#14532D] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 transition-colors cursor-pointer"
              >
                Update Status
              </button>
            </div>
          </div>

          {/* COMPACT OPERATIONAL KPI STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono">
            
            {/* KPI 1: Active Incidents */}
            <div className="bg-white border border-[#CBD5E1] border-l-4 border-l-[#0F172A] p-3.5 flex flex-col justify-between shadow-2xs">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">ACTIVE INCIDENTS</span>
                <div className="w-6 h-6 rounded bg-[#F8FAFC] border border-[#CBD5E1] flex items-center justify-center text-[#0F172A]">
                  <AlertTriangle size={14} />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#0F172A] tracking-tight">{activeIncidentsAll.length}</span>
                <span className="text-[10px] font-bold text-[#0F172A] bg-[#F8FAFC] px-1.5 py-0.5 border border-[#CBD5E1]">
                  PUNE SECTOR
                </span>
              </div>
              <div className="mt-2 text-[10px] text-[#64748B] flex items-center justify-between border-t border-[#E2E8F0] pt-1.5">
                <span>SECTOR LOGS</span>
                <span className="text-[#0F172A] font-bold">MONITORING</span>
              </div>
            </div>

            {/* KPI 2: Critical Incidents */}
            <div className="bg-white border border-[#CBD5E1] border-l-4 border-l-[#DC2626] p-3.5 flex flex-col justify-between shadow-2xs">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">CRITICAL INCIDENTS</span>
                <div className="w-6 h-6 rounded bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626]">
                  <ShieldAlert size={14} />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#DC2626] tracking-tight">{criticalIncidentsCount}</span>
                <span className="text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 border border-[#FECACA]">
                  PRIORITY ACTION
                </span>
              </div>
              <div className="mt-2 text-[10px] text-[#64748B] flex items-center justify-between border-t border-[#E2E8F0] pt-1.5">
                <span>HIGH SEVERITY</span>
                <span className="text-[#DC2626] font-bold">CRITICAL</span>
              </div>
            </div>

            {/* KPI 3: Available Forces */}
            <div className="bg-white border border-[#CBD5E1] border-l-4 border-l-[#166534] p-3.5 flex flex-col justify-between shadow-2xs">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">AVAILABLE TEAMS</span>
                <div className="w-6 h-6 rounded bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#166534]">
                  <Users size={14} />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#166534] tracking-tight">{res.personnel?.available || 32}</span>
                <span className="text-[10px] font-bold text-[#166534] bg-[#F0FDF4] px-1.5 py-0.5 border border-[#DCFCE7]">
                  {verifiedAgenciesCount} UNITS ONLINE
                </span>
              </div>
              <div className="mt-2 text-[10px] text-[#64748B] flex items-center justify-between border-t border-[#E2E8F0] pt-1.5">
                <span>SDRF STAFF</span>
                <span className="text-[#166534] font-bold">READY</span>
              </div>
            </div>

            {/* KPI 4: Deployed Dispatches */}
            <div className="bg-white border border-[#CBD5E1] border-l-4 border-l-[#0284C7] p-3.5 flex flex-col justify-between shadow-2xs">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">DEPLOYED MISSIONS</span>
                <div className="w-6 h-6 rounded bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
                  <Truck size={14} />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#0284C7] tracking-tight">{deployedMissionsCount}</span>
                <span className="text-[10px] font-bold text-[#0284C7] bg-[#F0F9FF] px-1.5 py-0.5 border border-[#BAE6FD]">
                  IN THE FIELD
                </span>
              </div>
              <div className="mt-2 text-[10px] text-[#64748B] flex items-center justify-between border-t border-[#E2E8F0] pt-1.5">
                <span>ASSIGNED OPERATIVES</span>
                <span className="text-[#0284C7] font-bold">ACTIVE</span>
              </div>
            </div>

          </div>

          {/* CENTRAL AREA: LARGE INTERACTIVE MAP (VISUAL CENTERPIECE) & RIGHT-SIDE CRITICAL INCIDENT PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Large Interactive Central GIS Incident Map */}
            <div className="lg:col-span-8 bg-white border border-[#CBD5E1] p-4 flex flex-col h-[520px] relative shadow-2xs">
              {/* Map Header Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0] flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#166534] status-pulse" />
                    <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">LIVE INCIDENT MAP</h2>
                  </div>
                  <p className="text-[10px] text-[#64748B] font-mono mt-0.5">
                    Real-time tactical GIS view • Pune EOC Grid Ref: 18.5204° N, 73.8567° E
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] text-[10px] font-mono font-bold px-2 py-1">
                    {getMapMarkers().length} ENTITIES ON MAP
                  </span>
                  <button 
                    onClick={() => navigate('/authority/dashboard?tab=map')}
                    className="bg-[#166534] hover:bg-[#14532D] text-white flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 transition-colors cursor-pointer font-mono"
                  >
                    <Maximize2 size={12} /> Maximize GIS
                  </button>
                </div>
              </div>
              
              {/* Map Canvas */}
              <div className="flex-1 relative border border-[#CBD5E1] bg-[#F1F5F9]">
                <MapView markers={getMapMarkers()} />
                <MapLegend />
              </div>
            </div>

            {/* Right-Side Critical Incident Panel */}
            <div className="lg:col-span-4 bg-white border border-[#CBD5E1] p-4 flex flex-col h-[520px] justify-between shadow-2xs">
              <div>
                <div className="flex justify-between items-center pb-2.5 border-b border-[#E2E8F0] mb-3 font-mono">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-[#DC2626]" />
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">CRITICAL INCIDENT PANEL</h3>
                  </div>
                  <span className="bg-[#FEF2F2] text-[#DC2626] text-[10px] font-bold px-2 py-0.5 border border-[#FECACA]">
                    {activeIncidentsAll.length} ACTIVE
                  </span>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-[390px] pr-1 font-mono">
                  {activeIncidentsAll.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#64748B] border border-dashed border-[#CBD5E1]">
                      NO CRITICAL INCIDENTS REPORTED
                    </div>
                  ) : (
                    activeIncidentsAll.map((mission) => {
                      const getSeverityDot = (sev) => {
                        if (sev === 'CRITICAL') return '🔴';
                        if (sev === 'HIGH') return '🟠';
                        if (sev === 'MEDIUM') return '🟡';
                        return '🟢';
                      };

                      return (
                        <div 
                          key={mission.id}
                          className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#166534] transition-colors flex flex-col gap-2 relative group"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-[#475569]">{mission.id}</span>
                                <span className="text-[10px]">{getSeverityDot(mission.severity)}</span>
                                <SeverityBadge severity={mission.severity} showDot={false} />
                              </div>
                              <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#166534] transition-colors mt-1 font-sans">
                                {mission.type} — {mission.location}
                              </h4>
                            </div>
                            <span className="text-[10px] text-[#64748B] bg-white border border-[#E2E8F0] px-1.5 py-0.5">
                              {mission.createdAt ? new Date(mission.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Active'}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#475569] line-clamp-2 font-sans">
                            {mission.description}
                          </p>

                          <div className="flex justify-between items-center pt-1.5 border-t border-[#E2E8F0] text-[10px] text-[#64748B]">
                            <span>DISTRICT: {mission.district || 'PUNE'}</span>
                            <button
                              onClick={() => navigate(`/incidents/${mission.id}`)}
                              className="bg-[#166534] hover:bg-[#14532D] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              DISPATCH / DETAILS <ArrowRight size={10} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate('/authority/dashboard?tab=incidents')}
                className="w-full text-center bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#166534] border border-[#CBD5E1] text-[11px] font-bold uppercase tracking-wider py-2 transition-colors mt-3 block font-mono cursor-pointer"
              >
                OPEN SECTOR INCIDENT DATABASE →
              </button>
            </div>

          </div>

          {/* RESOURCE READINESS SECTION (HORIZONTAL PROGRESS BARS) */}
          <div className="bg-white border border-[#CBD5E1] p-4 shadow-2xs space-y-3 font-mono">
            <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 size={14} className="text-[#166534]" /> RESOURCE READINESS & MOBILIZATION
                </h3>
                <p className="text-[10px] text-[#64748B] mt-0.5">SDRF Unit 01 active tactical equipment & responder inventory levels</p>
              </div>
              <button
                onClick={() => navigate('/resources')}
                className="bg-white hover:bg-[#F8FAFC] text-[#166534] border border-[#CBD5E1] text-[10px] font-bold uppercase tracking-wider px-3 py-1 transition-colors cursor-pointer"
              >
                <Edit size={12} className="inline mr-1" /> Update Inventory
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {resourceReadinessItems.map((item) => {
                const percent = Math.min(100, Math.round((item.avail / item.total) * 100));
                
                return (
                  <div key={item.key} className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[#475569]">
                        <strong className="text-[#0F172A]">{item.avail}</strong> / {item.total} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full bg-[#E2E8F0] h-2 rounded-none overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          percent > 50 ? 'bg-[#166534]' : percent > 20 ? 'bg-[#D97706]' : 'bg-[#DC2626]'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-[#64748B] pt-0.5">
                      <span>STATUS: {percent > 50 ? 'READY' : percent > 20 ? 'LIMITED' : 'CRITICAL'}</span>
                      <span className="text-[#166534] font-bold">DEPLOYS IN 5 MIN</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MAIN LAYOUT GRID: INCOMING ASSISTANCE ALERTS & LIVE COORDINATION / ACTIVITY TIMELINE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start font-mono">
            
            {/* Incoming Assistance Alerts (7 columns) */}
            <div className="lg:col-span-7 bg-white border border-[#CBD5E1] p-4 flex flex-col justify-between shadow-2xs space-y-3">
              <div>
                <div className="flex justify-between items-center pb-2.5 border-b border-[#E2E8F0] mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                      <FileSpreadsheet size={14} className="text-[#166534]" /> INCOMING ASSISTANCE ALERTS
                    </h3>
                    <p className="text-[10px] text-[#64748B] mt-0.5">Dispatches & mutual aid directives from District EOC</p>
                  </div>
                  <span className="bg-[#F0FDF4] text-[#166534] text-[10px] font-bold px-2 py-0.5 border border-[#DCFCE7]">
                    {incomingRequests.length} ACTIVE ORDERS
                  </span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {incomingRequests.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#64748B] uppercase border border-dashed border-[#CBD5E1]">
                      NO PENDING DISPATCH ORDERS. COMMAND CONSOLE IDLE.
                    </div>
                  ) : (
                    incomingRequests.map((req) => (
                      <div 
                        key={req.id} 
                        className="bg-[#F8FAFC] border border-[#CBD5E1] p-3.5 flex flex-col gap-2.5"
                      >
                        <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-2">
                          <div>
                            <span className="text-[10px] font-bold text-[#475569]">{req.id}</span>
                            <h4 className="text-xs font-bold text-[#0F172A] font-sans mt-0.5">FROM: {req.fromName}</h4>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UrgencyBadge urgency={req.urgency} />
                            <RequestStatusBadge status={req.status} />
                          </div>
                        </div>

                        <div className="text-[11px]">
                          <span className="text-[9px] text-[#64748B] uppercase font-bold block">REQUIRED EQUIPMENT / STAFF:</span>
                          <span className="text-[#0F172A] font-bold">{req.required}</span>
                        </div>

                        <p className="text-[11px] text-[#334155] bg-white p-2.5 border border-[#CBD5E1] font-sans">
                          "{req.message}"
                        </p>

                        <div className="flex justify-between items-center pt-1 border-t border-[#E2E8F0]">
                          <span className="text-[9px] text-[#64748B]">ISSUED: {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          <div className="flex gap-2">
                            {req.status === 'INITIATED' && (
                              <button
                                onClick={() => handleRequestStatusChange(req.id, 'ACKNOWLEDGED')}
                                className="bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#D97706] border border-[#FEF3C7] text-[10px] font-bold uppercase px-3 py-1 transition-colors cursor-pointer"
                              >
                                ACKNOWLEDGE
                              </button>
                            )}
                            {req.status === 'ACKNOWLEDGED' && (
                              <button
                                onClick={() => handleRequestStatusChange(req.id, 'DEPLOYED')}
                                className="bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#D97706] border border-[#FEF3C7] text-[10px] font-bold uppercase px-3 py-1 transition-colors cursor-pointer"
                              >
                                DISPATCH STAFF
                              </button>
                            )}
                            {req.status === 'DEPLOYED' && (
                              <button
                                onClick={() => handleRequestStatusChange(req.id, 'RESOLVED')}
                                className="bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border border-[#DCFCE7] text-[10px] font-bold uppercase px-3 py-1 transition-colors cursor-pointer"
                              >
                                COMPLETE MISSION
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <Link 
                to="/requests" 
                className="w-full text-center bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#166534] border border-[#CBD5E1] text-[11px] font-bold uppercase tracking-wider py-2 transition-colors mt-3 block"
              >
                OPEN COORDINATION CENTER →
              </Link>
            </div>

            {/* Live Coordination & Activity Timeline (5 columns) */}
            <div className="lg:col-span-5 bg-white border border-[#CBD5E1] p-4 flex flex-col justify-between shadow-2xs space-y-3">
              <div>
                <div className="flex justify-between items-center pb-2.5 border-b border-[#E2E8F0] mb-3">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                    <Activity size={14} className="text-[#0284C7]" /> LIVE COORDINATION TIMELINE
                  </h3>
                  <span className="text-[10px] text-[#64748B] font-bold">AUDIT LOG</span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                  <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7] px-1.5 py-0.5 font-bold uppercase">DISPATCH DEPLOYED</span>
                      <span className="text-[#64748B]">Just now</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#0F172A] font-sans">REQ-1024 — 2 Rescue Boats deployed to Sector 5 Flood</h4>
                    <p className="text-[10px] text-[#475569]">Triggered by SDRF Unit 01 dispatcher</p>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] font-bold uppercase">INCIDENT ALERT</span>
                      <span className="text-[#64748B]">07:05 AM</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#0F172A] font-sans">INC-004 — Earthquake Zone 3 reported CRITICAL</h4>
                    <p className="text-[10px] text-[#475569]">Triggered by NCS Alert System</p>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7] font-bold uppercase">RESOURCE UPDATE</span>
                      <span className="text-[#64748B]">06:32 AM</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#0F172A] font-sans">Personnel readiness updated: 32 staff available</h4>
                    <p className="text-[10px] text-[#475569]">Triggered by SDRF HQ Shivajinagar</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/authority/dashboard?tab=activity')}
                className="w-full text-center bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] text-[11px] font-bold uppercase tracking-wider py-2 transition-colors mt-3 block cursor-pointer"
              >
                VIEW FULL EOC ACTIVITY AUDIT LOG →
              </button>
            </div>

          </div>

        </main>
      </div>

      {/* Operational Availability Status Switcher Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Operational Availability"
      >
        <form onSubmit={handleStatusChangeSubmit} className="flex flex-col gap-4 font-mono">
          <Dropdown
            id="status-selector"
            label="Availability status"
            options={[
              { value: 'AVAILABLE', label: '🟢 AVAILABLE (Ready for dispatches)' },
              { value: 'LIMITED', label: '🟡 LIMITED (Stretched resources)' },
              { value: 'DEPLOYED', label: '🔴 DEPLOYED (Active on incident site)' },
              { value: 'OFFLINE', label: '⚫ OFFLINE (Off duty / out of area)' },
            ]}
            value={tempStatus}
            onChange={(e) => setTempStatus(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#CBD5E1]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Confirm Update
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
