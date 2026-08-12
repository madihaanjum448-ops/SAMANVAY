import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Ship, 
  Ambulance, 
  Truck, 
  Plane, 
  Radio, 
  Edit
} from 'lucide-react';
import AgencySidebar from '../../components/layout/AgencySidebar';
import TopHeader from '../../components/layout/TopHeader';
import { UrgencyBadge, RequestStatusBadge } from '../../components/ui/Badge';
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

  const statusColors = {
    AVAILABLE: 'text-[#166534] bg-[#F0FDF4] border-[#DCFCE7]',
    LIMITED: 'text-[#EA580C] bg-[#FFF7ED] border-[#FED7AA]',
    DEPLOYED: 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]',
    OFFLINE: 'text-[#64748B] bg-[#F7F5EF] border-[#E5E7EB]',
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#111827] flex font-sans">
      {/* Sidebar Navigation */}
      <AgencySidebar />

      {/* Main Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Operational Header */}
        <TopHeader title="Rescue Agency Dispatch Terminal" />

        {/* Dashboard Main Content */}
        <main className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
          
          {/* Top Status Header Board */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#166534]">
                <Radio size={24} className="status-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-[#111827] tracking-wide">{currentAgency.name}</h2>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#166534] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#DCFCE7] font-bold">
                    ✓ VERIFIED AGENCY
                  </span>
                </div>
                <div className="text-xs text-[#64748B] font-mono mt-1 flex items-center gap-2">
                  <span>HQ: Shivajinagar, Pune</span>
                  <span>•</span>
                  <span>Updated {currentAgency.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Availability status actions */}
            <div className="flex items-center gap-3">
              <div className={`px-3.5 py-2 border rounded-lg text-xs font-bold tracking-wider ${statusColors[currentAgency.status] || ''}`}>
                ● Status: {currentAgency.status}
              </div>
              
              <button
                onClick={() => {
                  setTempStatus(currentAgency.status);
                  setShowStatusModal(true);
                }}
                className="bg-white hover:bg-[#F7F5EF] text-[#166534] border border-[#E5E7EB] hover:border-[#CBD5E1] text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                Update Status
              </button>
            </div>
          </div>

          {/* Grid of Resource Counters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* Personnel */}
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl flex flex-col justify-between h-28 shadow-xs">
              <div className="flex justify-between items-center text-[#64748B]">
                <span className="text-[10px] font-bold uppercase tracking-wider">Rescue Staff</span>
                <Users size={16} className="text-[#166534]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111827] font-mono">
                  {res.personnel?.available || 0} <span className="text-xs text-[#64748B]">/ {res.personnel?.total || 0}</span>
                </div>
                <span className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">Available staff</span>
              </div>
            </div>

            {/* Boats */}
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl flex flex-col justify-between h-28 shadow-xs">
              <div className="flex justify-between items-center text-[#64748B]">
                <span className="text-[10px] font-bold uppercase tracking-wider">Rescue Boats</span>
                <Ship size={16} className="text-[#166534]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111827] font-mono">
                  {res.boats?.available || 0} <span className="text-xs text-[#64748B]">/ {res.boats?.total || 0}</span>
                </div>
                <span className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">Inflatable boats</span>
              </div>
            </div>

            {/* Ambulances */}
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl flex flex-col justify-between h-28 shadow-xs">
              <div className="flex justify-between items-center text-[#64748B]">
                <span className="text-[10px] font-bold uppercase tracking-wider">Ambulances</span>
                <Ambulance size={16} className="text-[#166534]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111827] font-mono">
                  {res.ambulances?.available || 0} <span className="text-xs text-[#64748B]">/ {res.ambulances?.total || 0}</span>
                </div>
                <span className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">Medical vehicles</span>
              </div>
            </div>

            {/* Rescue Vehicles */}
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl flex flex-col justify-between h-28 shadow-xs">
              <div className="flex justify-between items-center text-[#64748B]">
                <span className="text-[10px] font-bold uppercase tracking-wider">Rescue Trucks</span>
                <Truck size={16} className="text-[#166534]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111827] font-mono">
                  {res.rescueVehicles?.available || 0} <span className="text-xs text-[#64748B]">/ {res.rescueVehicles?.total || 0}</span>
                </div>
                <span className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">Heavy transport</span>
              </div>
            </div>

            {/* Drones */}
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl flex flex-col justify-between h-28 col-span-2 md:col-span-1 shadow-xs">
              <div className="flex justify-between items-center text-[#64748B]">
                <span className="text-[10px] font-bold uppercase tracking-wider">Search Drones</span>
                <Plane size={16} className="text-[#166534]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111827] font-mono">
                  {res.drones?.available || 0} <span className="text-xs text-[#64748B]">/ {res.drones?.total || 0}</span>
                </div>
                <span className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">Aerial tracking</span>
              </div>
            </div>

          </div>

          {/* Actions Row */}
          <div className="flex justify-end gap-3 select-none">
            <button
              onClick={() => navigate('/resources')}
              className="bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit size={14} /> Update Resource Inventory
            </button>
          </div>

          {/* Main layout grid: Incoming alerts & Active Missions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Incoming Requests Column */}
            <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-[#E5E7EB] pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Incoming Assistance Alerts</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">Emergency requests from EOC or fellow response teams.</p>
                  </div>
                  <span className="bg-[#F0FDF4] text-[#166534] text-xs font-mono font-bold px-2.5 py-1 border border-[#DCFCE7] rounded-md">
                    {incomingRequests.length} Active Alerts
                  </span>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto no-scrollbar">
                  {incomingRequests.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#64748B] font-mono uppercase">
                      No pending dispatch orders. Command console idle.
                    </div>
                  ) : (
                    incomingRequests.map((req) => (
                      <div 
                        key={req.id} 
                        className="bg-[#F7F5EF] border border-[#E5E7EB] p-4 rounded-xl flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-start border-b border-[#E5E7EB] pb-2.5">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[#64748B]">{req.id}</span>
                            <h4 className="text-xs font-bold text-[#111827] mt-0.5">From: {req.fromName}</h4>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UrgencyBadge urgency={req.urgency} />
                            <RequestStatusBadge status={req.status} />
                          </div>
                        </div>

                        <div className="text-xs">
                          <span className="text-[10px] text-[#64748B] block uppercase font-bold">Items Required:</span>
                          <span className="text-[#111827] font-mono font-bold">{req.required}</span>
                        </div>

                        <p className="text-xs text-[#475569] bg-white p-2.5 rounded-md border border-[#E5E7EB]">
                          "{req.message}"
                        </p>

                        <div className="flex justify-between items-center pt-2 mt-1 border-t border-[#E5E7EB]">
                          <span className="text-[10px] text-[#64748B] font-mono">Issued {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          <div className="flex gap-2">
                            {req.status === 'INITIATED' && (
                              <button
                                onClick={() => handleRequestStatusChange(req.id, 'ACKNOWLEDGED')}
                                className="bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#EA580C] border border-[#FED7AA] text-xs font-bold px-3 py-1.5 rounded-md cursor-pointer"
                              >
                                Acknowledge
                              </button>
                            )}
                            {req.status === 'ACKNOWLEDGED' && (
                              <button
                                onClick={() => handleRequestStatusChange(req.id, 'DEPLOYED')}
                                className="bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#EA580C] border border-[#FED7AA] text-xs font-bold px-3 py-1.5 rounded-md cursor-pointer"
                              >
                                Dispatch Staff
                              </button>
                            )}
                            {req.status === 'DEPLOYED' && (
                              <button
                                onClick={() => handleRequestStatusChange(req.id, 'RESOLVED')}
                                className="bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border border-[#DCFCE7] text-xs font-bold px-3 py-1.5 rounded-md cursor-pointer"
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
                className="w-full text-center bg-white hover:bg-[#F7F5EF] text-[#166534] border border-[#E5E7EB] hover:border-[#CBD5E1] text-xs font-bold py-2 rounded-md transition-all mt-4"
              >
                Open Coordination Center
              </Link>
            </div>

            {/* Active Missions column */}
            <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-[#E5E7EB] pb-3">
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Active Tactical Missions</h3>
                  <span className="text-[10px] text-[#64748B] font-mono font-bold">{activeMissions.length} Missions</span>
                </div>

                <div className="space-y-3 overflow-y-auto no-scrollbar max-h-[360px]">
                  {activeMissions.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#64748B] font-mono uppercase">
                      No active incident orders. On standby status.
                    </div>
                  ) : (
                    activeMissions.map((mission) => (
                      <div 
                        key={mission.id}
                        onClick={() => navigate(`/incidents/${mission.id}`)}
                        className="p-4 bg-[#F7F5EF] border border-[#E5E7EB] hover:border-[#CBD5E1] rounded-xl cursor-pointer transition-all flex flex-col gap-2 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-[#64748B] font-mono">{mission.id}</span>
                            <h4 className="text-xs font-bold text-[#111827] group-hover:text-[#166534] transition-colors mt-0.5">
                              {mission.type} — {mission.location}
                            </h4>
                          </div>
                          <span className="text-[10px] text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] leading-relaxed">
                          {mission.description}
                        </p>
                        <div className="text-[10px] text-[#64748B] font-mono mt-1 uppercase tracking-wider">
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

      {/* Status Switcher Modal */}
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

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
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
