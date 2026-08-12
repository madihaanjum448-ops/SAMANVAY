import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Ship, 
  Ambulance, 
  Truck, 
  Plane, 
  Check, 
  Radio, 
  FileSpreadsheet, 
  AlertTriangle,
  History,
  Edit,
  Clock,
  ShieldCheck
} from 'lucide-react';
import AgencySidebar from '../../components/layout/AgencySidebar';
import TopHeader from '../../components/layout/TopHeader';
import { StatusBadge, UrgencyBadge, RequestStatusBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Dropdown from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';
import { 
  MOCK_AGENCIES, 
  MOCK_INCIDENTS, 
  MOCK_REQUESTS, 
  RESOURCE_INVENTORY 
} from '../../data/mockData';

export default function AgencyDashboard() {
  const navigate = useNavigate();
  const agencyId = 'AG-002'; // Logged-in agency: SDRF UNIT 01

  // Local state synced with localStorage
  const [agencies, setAgencies] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [tempStatus, setTempStatus] = useState('');

  // Load and sync from localStorage
  useEffect(() => {
    const initData = (key, fallback) => {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    };

    setAgencies(initData('samanvay_agencies', MOCK_AGENCIES));
    setIncidents(initData('samanvay_incidents', MOCK_INCIDENTS));
    setRequests(initData('samanvay_requests', MOCK_REQUESTS));
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

  // Filter lists specific to SDRF Unit 01
  // Incoming requests are requests where "TO" is SDRF Unit 01 (AG-002) OR from SDRF Unit 01 to other units (or show requests sent to AG-002)
  // Let's filter requests where `to` matches `AG-002` OR `from` matches `AG-002`
  const myRequests = requests.filter(r => r.to === agencyId || r.from === agencyId);
  const incomingRequests = requests.filter(r => r.to === agencyId && r.status !== 'RESOLVED');

  // Active missions where this agency is assigned
  const activeMissions = incidents.filter(i => i.status === 'ACTIVE' && i.assignedAgencies.includes(agencyId));

  const statusColors = {
    AVAILABLE: 'text-green-400 bg-green-500/10 border-green-500/30',
    LIMITED: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    DEPLOYED: 'text-red-400 bg-red-500/10 border-red-500/30',
    OFFLINE: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-200 flex">
      {/* Sidebar Navigation */}
      <AgencySidebar />

      {/* Main Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Operational Header */}
        <TopHeader title="Rescue Agency Dispatch Terminal" />

        {/* Dashboard Main Content */}
        <main className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
          
          {/* Top Status Header Board */}
          <div className="bg-[#0f1c35] border border-slate-800 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
                <Radio size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-white tracking-wide">{currentAgency.name}</h2>
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-green-400 bg-green-500/5 px-1.5 py-0.2 rounded border border-green-500/10 font-bold">
                    ✓ VERIFIED
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wider flex items-center gap-2">
                  <span>Base HQ: Shivajinagar, Pune</span>
                  <span>•</span>
                  <span>Updated {currentAgency.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Availability status actions */}
            <div className="flex items-center gap-2.5">
              <div className={`px-3 py-1.5 border rounded text-xs font-bold tracking-wider ${statusColors[currentAgency.status] || ''}`}>
                🟢 Status: {currentAgency.status}
              </div>
              
              <button
                onClick={() => {
                  setTempStatus(currentAgency.status);
                  setShowStatusModal(true);
                }}
                className="bg-navy-800 hover:bg-navy-750 text-cyan-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500 text-xs font-bold px-3 py-2 rounded transition-all cursor-pointer"
              >
                Update Status
              </button>
            </div>
          </div>

          {/* Grid of Resource Counters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* Personnel */}
            <div className="bg-[#0f1c35] border border-slate-850 p-4 rounded-lg flex flex-col justify-between h-24">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Rescue Staff</span>
                <Users size={14} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white font-mono">
                  {res.personnel?.available || 0} <span className="text-xs text-slate-500">/ {res.personnel?.total || 0}</span>
                </div>
                <span className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider">Available staff</span>
              </div>
            </div>

            {/* Boats */}
            <div className="bg-[#0f1c35] border border-slate-850 p-4 rounded-lg flex flex-col justify-between h-24">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Rescue Boats</span>
                <Ship size={14} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white font-mono">
                  {res.boats?.available || 0} <span className="text-xs text-slate-500">/ {res.boats?.total || 0}</span>
                </div>
                <span className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider">Inflatable boats</span>
              </div>
            </div>

            {/* Ambulances */}
            <div className="bg-[#0f1c35] border border-slate-850 p-4 rounded-lg flex flex-col justify-between h-24">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Ambulances</span>
                <Ambulance size={14} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white font-mono">
                  {res.ambulances?.available || 0} <span className="text-xs text-slate-500">/ {res.ambulances?.total || 0}</span>
                </div>
                <span className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider">Medical vehicles</span>
              </div>
            </div>

            {/* Rescue Vehicles */}
            <div className="bg-[#0f1c35] border border-slate-850 p-4 rounded-lg flex flex-col justify-between h-24">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Rescue Trucks</span>
                <Truck size={14} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white font-mono">
                  {res.rescueVehicles?.available || 0} <span className="text-xs text-slate-500">/ {res.rescueVehicles?.total || 0}</span>
                </div>
                <span className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider">Heavy transport</span>
              </div>
            </div>

            {/* Drones */}
            <div className="bg-[#0f1c35] border border-slate-850 p-4 rounded-lg flex flex-col justify-between h-24 col-span-2 md:col-span-1">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Search Drones</span>
                <Plane size={14} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white font-mono">
                  {res.drones?.available || 0} <span className="text-xs text-slate-500">/ {res.drones?.total || 0}</span>
                </div>
                <span className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider">Aerial tracking</span>
              </div>
            </div>

          </div>

          {/* Actions Row */}
          <div className="flex justify-end gap-3 mt-1 select-none">
            <button
              onClick={() => navigate('/resources')}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold px-4 py-2 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Edit size={13} /> Update Resources Inventory
            </button>
          </div>

          {/* Main layout grid: Incoming alerts & Active Missions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Incoming Requests Column */}
            <div className="lg:col-span-7 bg-[#0f1c35] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Incoming Assistance Alerts</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Emergency requests from EOC or fellow response teams.</p>
                  </div>
                  <span className="bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold px-2 py-0.5 border border-cyan-500/25 rounded">
                    {incomingRequests.length} Active Alerts
                  </span>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto no-scrollbar">
                  {incomingRequests.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500 font-mono uppercase">
                      No pending dispatch orders. Command console idle.
                    </div>
                  ) : (
                    incomingRequests.map((req) => (
                      <div 
                        key={req.id} 
                        className="bg-navy-900 border border-slate-850 p-4 rounded flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-start border-b border-slate-850 pb-2">
                          <div>
                            <span className="text-[9px] font-mono font-bold text-slate-500">{req.id}</span>
                            <h4 className="text-xs font-bold text-white mt-0.5">From: {req.fromName}</h4>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UrgencyBadge urgency={req.urgency} />
                            <RequestStatusBadge status={req.status} />
                          </div>
                        </div>

                        <div className="text-xs">
                          <span className="text-[9px] text-slate-500 block uppercase font-bold">Items Required:</span>
                          <span className="text-white font-mono font-bold">{req.required}</span>
                        </div>

                        <p className="text-xs text-slate-400 italic bg-[#0a1020] p-2 rounded.5 border border-slate-850/50">
                          "{req.message}"
                        </p>

                        <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-850">
                          <span className="text-[9px] text-slate-500 font-mono">Issued {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          <div className="flex gap-2">
                            {req.status === 'INITIATED' && (
                              <button
                                onClick={() => handleRequestStatusChange(req.id, 'ACKNOWLEDGED')}
                                className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/25 text-xs font-bold px-3 py-1 rounded cursor-pointer"
                              >
                                Acknowledge
                              </button>
                            )}
                            {req.status === 'ACKNOWLEDGED' && (
                              <button
                                onClick={() => handleRequestStatusChange(req.id, 'DEPLOYED')}
                                className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/25 text-xs font-bold px-3 py-1 rounded cursor-pointer"
                              >
                                Dispatch Staff
                              </button>
                            )}
                            {req.status === 'DEPLOYED' && (
                              <button
                                onClick={() => handleRequestStatusChange(req.id, 'RESOLVED')}
                                className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/25 text-xs font-bold px-3 py-1 rounded cursor-pointer"
                              >
                                Complete Mission
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
                className="w-full text-center bg-navy-800 hover:bg-navy-750 text-cyan-400 border border-slate-800 hover:border-cyan-500 text-xs font-semibold py-1.5 rounded transition-all mt-4"
              >
                Open Coordination Center
              </Link>
            </div>

            {/* Active Missions column */}
            <div className="lg:col-span-5 bg-[#0f1c35] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Tactical Missions</h3>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">{activeMissions.length} Missions</span>
                </div>

                <div className="space-y-3 overflow-y-auto no-scrollbar max-h-[360px]">
                  {activeMissions.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500 font-mono uppercase">
                      No active incident orders. On standby status.
                    </div>
                  ) : (
                    activeMissions.map((mission) => (
                      <div 
                        key={mission.id}
                        onClick={() => navigate(`/incidents/${mission.id}`)}
                        className="p-3.5 bg-navy-900 border border-slate-850 hover:border-slate-700/60 rounded cursor-pointer transition-all flex flex-col gap-2 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 font-mono">{mission.id}</span>
                            <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors mt-0.5">
                              {mission.type} — {mission.location}
                            </h4>
                          </div>
                          <span className="text-[9.5px] text-red-400 bg-red-500/5 border border-red-500/10 px-1.5 py-0.2 rounded font-bold uppercase tracking-wide">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          {mission.description}
                        </p>
                        <div className="text-[9px] text-slate-500 font-mono mt-1 uppercase tracking-wider">
                          Reported {new Date(mission.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* Simulated status switcher Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Operational Availability"
      >
        <form onSubmit={handleStatusChangeSubmit} className="flex flex-col gap-4">
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

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
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
