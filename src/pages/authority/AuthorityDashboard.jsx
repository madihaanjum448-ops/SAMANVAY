import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Users, 
  Package, 
  FileSpreadsheet, 
  ShieldCheck, 
  Clock, 
  Check, 
  X, 
  Maximize2,
  Calendar,
  Layers,
  Search,
  Plus
} from 'lucide-react';
import AuthoritySidebar from '../../components/layout/AuthoritySidebar';
import TopHeader from '../../components/layout/TopHeader';
import StatCard from '../../components/ui/StatCard';
import MapView from '../../components/map/MapView';
import MapLegend from '../../components/map/MapLegend';
import { SeverityBadge, StatusBadge, VerificationBadge, RequestStatusBadge } from '../../components/ui/Badge';
import { 
  MOCK_AGENCIES, 
  MOCK_INCIDENTS, 
  MOCK_REQUESTS, 
  RESOURCE_INVENTORY, 
  MOCK_ACTIVITY_LOG 
} from '../../data/mockData';

export default function AuthorityDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'overview';

  // State loaded from localStorage for interactivity
  const [agencies, setAgencies] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [activity, setActivity] = useState([]);

  // Load state from localStorage or mock data
  useEffect(() => {
    const initData = (key, fallback) => {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      } else {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
    };

    setAgencies(initData('samanvay_agencies', MOCK_AGENCIES));
    setIncidents(initData('samanvay_incidents', MOCK_INCIDENTS));
    setRequests(initData('samanvay_requests', MOCK_REQUESTS));
    setResources(initData('samanvay_resources', RESOURCE_INVENTORY));
    setActivity(initData('samanvay_activity', MOCK_ACTIVITY_LOG));
  }, [activeTab]);

  // Sync state back helper
  const syncState = (key, data, setter) => {
    setter(data);
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Verification actions
  const handleApproveAgency = (id) => {
    const updated = agencies.map(a => 
      a.id === id ? { ...a, verificationStatus: 'VERIFIED', verifiedAt: new Date().toISOString().split('T')[0] } : a
    );
    syncState('samanvay_agencies', updated, setAgencies);

    // Add activity log
    const agencyName = agencies.find(a => a.id === id)?.name || 'Agency';
    const newLog = {
      id: Date.now(),
      type: 'verification',
      action: 'Agency Approved',
      detail: `${agencyName} approved to join coordination network`,
      actor: 'Priya Desai (EOC)',
      time: 'Just now',
    };
    syncState('samanvay_activity', [newLog, ...activity], setActivity);
  };

  const handleRejectAgency = (id) => {
    const updated = agencies.map(a => 
      a.id === id ? { ...a, verificationStatus: 'REJECTED' } : a
    );
    syncState('samanvay_agencies', updated, setAgencies);

    const agencyName = agencies.find(a => a.id === id)?.name || 'Agency';
    const newLog = {
      id: Date.now(),
      type: 'verification',
      action: 'Agency Rejected',
      detail: `${agencyName} registration rejected`,
      actor: 'Priya Desai (EOC)',
      time: 'Just now',
    };
    syncState('samanvay_activity', [newLog, ...activity], setActivity);
  };

  // Filter pending queue
  const pendingAgencies = agencies.filter(a => a.verificationStatus === 'PENDING');
  
  // Stats calculations
  const activeIncidentsCount = incidents.filter(i => i.status === 'ACTIVE').length;
  const verifiedAgenciesCount = agencies.filter(a => a.verificationStatus === 'VERIFIED').length;
  const totalResourcesCount = resources.reduce((acc, curr) => acc + curr.available, 0);
  const pendingRequestsCount = requests.filter(r => r.status === 'INITIATED').length;

  // Build markers list for Live Map
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

  return (
    <div className="min-h-screen bg-navy-900 text-slate-200 flex">
      {/* Sidebar navigation */}
      <AuthoritySidebar activeTab={activeTab} />

      {/* Main Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Operational Header */}
        <TopHeader title="District EOC Command Center" />

        {/* Dynamic page content based on tab query */}
        <main className="p-6 flex-1 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  label="ACTIVE INCIDENTS" 
                  value={activeIncidentsCount} 
                  icon={<AlertTriangle size={18} />} 
                  color="red"
                  onClick={() => navigate('/authority/dashboard?tab=incidents')}
                />
                <StatCard 
                  label="VERIFIED FORCES" 
                  value={verifiedAgenciesCount} 
                  icon={<Users size={18} />} 
                  color="green"
                  onClick={() => navigate('/agencies')}
                />
                <StatCard 
                  label="AVAILABLE ASSETS" 
                  value={totalResourcesCount} 
                  icon={<Package size={18} />} 
                  color="cyan"
                  onClick={() => navigate('/resources')}
                />
                <StatCard 
                  label="PENDING DISPATCHES" 
                  value={pendingRequestsCount} 
                  icon={<FileSpreadsheet size={18} />} 
                  color="yellow"
                  onClick={() => navigate('/requests')}
                />
              </div>

              {/* Main Panel Row: Map and Incidents */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Large Response GIS Map */}
                <div className="lg:col-span-8 bg-[#0f1c35] border border-slate-800 rounded-lg p-4 flex flex-col h-[480px] relative">
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Response Map</h3>
                      <span className="text-[10px] text-slate-500 font-mono">PUND-EOC GIS CONNECTED</span>
                    </div>
                    <button 
                      onClick={() => navigate('/authority/dashboard?tab=map')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded cursor-pointer"
                    >
                      <Maximize2 size={10} /> Maximize
                    </button>
                  </div>
                  <div className="flex-1 relative rounded overflow-hidden border border-slate-850">
                    <MapView markers={getMapMarkers()} />
                    <MapLegend />
                  </div>
                </div>

                {/* Active Incident Sidebar */}
                <div className="lg:col-span-4 bg-[#0f1c35] border border-slate-800 rounded-lg p-4 flex flex-col h-[480px] justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3.5 border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Incident Log</h3>
                      <span className="text-[10px] text-slate-500 font-mono font-bold">{incidents.filter(i => i.status === 'ACTIVE').length} Logs</span>
                    </div>
                    
                    <div className="space-y-2 overflow-y-auto no-scrollbar max-h-[380px]">
                      {incidents.filter(i => i.status === 'ACTIVE').map(inc => (
                        <div 
                          key={inc.id}
                          onClick={() => navigate(`/incidents/${inc.id}`)}
                          className="p-3 bg-navy-900 border border-slate-850 hover:border-slate-700/60 rounded cursor-pointer transition-all flex flex-col gap-2 relative group"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-bold text-slate-500 font-mono">{inc.id}</span>
                                <SeverityBadge severity={inc.severity} showDot={false} />
                              </div>
                              <h4 className="text-xs font-bold text-white mt-1 group-hover:text-cyan-400 transition-colors">
                                {inc.type} — {inc.location}
                              </h4>
                            </div>
                            <span className="text-[9.5px] text-slate-600 font-mono">
                              {inc.createdAt ? new Date(inc.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Active'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Link 
                    to="/authority/dashboard?tab=incidents"
                    className="w-full text-center bg-navy-800 hover:bg-navy-750 text-cyan-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500 text-xs font-semibold py-1.5 rounded transition-all mt-3"
                  >
                    View All Incidents
                  </Link>
                </div>
              </div>

              {/* Bottom Row: Pending Approvals */}
              <div className="bg-[#0f1c35] border border-slate-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pending Agency Verifications</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Vetting credentials before granting full system clearance.</p>
                  </div>
                  <span className="bg-orange-500/10 text-orange-400 text-xs font-mono font-bold px-2 py-0.5 border border-orange-500/25 rounded">
                    {pendingAgencies.length} Pending
                  </span>
                </div>

                {pendingAgencies.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 font-mono uppercase">
                    Verification Queue Clear. All registered agencies are verified.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingAgencies.map((agency) => (
                      <div 
                        key={agency.id} 
                        className="bg-navy-900 border border-slate-850 p-4 rounded flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider font-mono">{agency.type}</span>
                              <h4 className="text-xs font-bold text-white mt-0.5">{agency.name}</h4>
                            </div>
                            <span className="text-[9px] text-orange-400 bg-orange-500/5 px-1.5 py-0.2 rounded border border-orange-500/10 font-bold uppercase tracking-wider">Vetting</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2 font-mono flex items-center gap-1">
                            <span>Base:</span> <span className="text-slate-300 font-sans">{agency.address}</span>
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {agency.expertise.map((exp, idx) => (
                              <span key={idx} className="bg-slate-800 text-slate-400 text-[8.5px] font-semibold px-1.5 py-0.2 rounded border border-slate-700/50">
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 border-t border-slate-850 pt-3">
                          <button
                            onClick={() => handleApproveAgency(agency.id)}
                            className="flex-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 hover:text-green-300 text-xs font-bold py-1 px-2.5 rounded transition-all cursor-pointer inline-flex items-center justify-center gap-1"
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectAgency(agency.id)}
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold py-1 px-2.5 rounded transition-all cursor-pointer inline-flex items-center justify-center gap-1"
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: FULL MAP VIEW */}
          {activeTab === 'map' && (
            <div className="bg-[#0f1c35] border border-slate-800 rounded-lg p-4 h-[calc(100vh-140px)] flex flex-col">
              <div className="mb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Full Geographic Information System (GIS)</h3>
                <span className="text-[10px] text-slate-500 font-mono">Live situational tracking of rescue units and reported disasters.</span>
              </div>
              <div className="flex-1 relative rounded overflow-hidden border border-slate-850">
                <MapView markers={getMapMarkers()} center={[18.5204, 73.8567]} zoom={12} />
                <MapLegend />
              </div>
            </div>
          )}

          {/* TAB 3: FULL INCIDENTS LOG */}
          {activeTab === 'incidents' && (
            <div className="bg-[#0f1c35] border border-slate-800 rounded-lg p-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Emergency Incident Database</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Central register of disasters, rescue directives and assignment updates.</p>
                </div>
              </div>

              {/* Table list */}
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Log ID</th>
                      <th>Incident Type</th>
                      <th>Location Area</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Reported Time</th>
                      <th className="text-right">Operation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((inc) => (
                      <tr key={inc.id}>
                        <td className="font-mono text-xs font-semibold text-slate-500">{inc.id}</td>
                        <td className="font-bold text-white text-xs">{inc.type}</td>
                        <td>
                          <span className="text-xs text-slate-300 font-medium">{inc.location}</span>
                        </td>
                        <td>
                          <SeverityBadge severity={inc.severity} showDot={false} />
                        </td>
                        <td>
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                            inc.status === 'ACTIVE' ? 'text-red-400 animate-pulse' : 'text-green-400'
                          }`}>
                            {inc.status}
                          </span>
                        </td>
                        <td className="font-mono text-xs text-slate-500">
                          {new Date(inc.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => navigate(`/incidents/${inc.id}`)}
                            className="bg-navy-800 hover:bg-navy-750 text-cyan-400 hover:text-cyan-300 border border-slate-850 hover:border-cyan-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-colors cursor-pointer"
                          >
                            Open Command Center
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: VERIFICATION QUEUE DETAIL */}
          {activeTab === 'verification' && (
            <div className="bg-[#0f1c35] border border-slate-800 rounded-lg p-5">
              <div className="border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tactical Force Verification Queue</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">District authority portal checking agency phone lines, base address, and rescue staff capabilities.</p>
              </div>

              {pendingAgencies.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-mono uppercase">
                  All registering tactical units have been processed. Queue empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingAgencies.map((agency) => (
                    <div 
                      key={agency.id} 
                      className="bg-navy-900 border border-slate-850 p-5 rounded-lg flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">{agency.type}</span>
                            <h4 className="text-sm font-bold text-white mt-0.5">{agency.name}</h4>
                          </div>
                          <span className="text-[9px] text-orange-400 border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                            VETTING IN PROGRESS
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono text-slate-400 bg-slate-950/20 border border-slate-850/50 p-3 rounded">
                          <div>District: <span className="text-white font-sans">{agency.district}</span></div>
                          <div>State: <span className="text-white font-sans">{agency.state}</span></div>
                          <div className="col-span-2">Contact: <span className="text-white">{agency.phone}</span></div>
                          <div className="col-span-2">Email: <span className="text-white">{agency.email}</span></div>
                        </div>

                        <div className="mt-3.5">
                          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Declared Expertise</span>
                          <div className="flex flex-wrap gap-1">
                            {agency.expertise.map((exp, idx) => (
                              <span key={idx} className="bg-slate-800 text-slate-300 text-[9px] font-semibold px-2 py-0.5 rounded border border-slate-700/60">
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3.5">
                          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Inventory Resources</span>
                          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono text-slate-400">
                            <div className="bg-[#0f1c35] border border-slate-850 p-1.5 rounded">
                              <span className="text-[9px] text-slate-500 block uppercase font-bold">Staff</span>
                              <span className="text-white font-bold">{agency.resources?.personnel?.total || 0}</span>
                            </div>
                            <div className="bg-[#0f1c35] border border-slate-850 p-1.5 rounded">
                              <span className="text-[9px] text-slate-500 block uppercase font-bold">Boats</span>
                              <span className="text-white font-bold">{agency.resources?.boats?.total || 0}</span>
                            </div>
                            <div className="bg-[#0f1c35] border border-slate-850 p-1.5 rounded">
                              <span className="text-[9px] text-slate-500 block uppercase font-bold">Vehicles</span>
                              <span className="text-white font-bold">{agency.resources?.rescueVehicles?.total || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 border-t border-slate-850/80 pt-4 mt-2">
                        <button
                          onClick={() => handleApproveAgency(agency.id)}
                          className="flex-1 bg-green-500/15 hover:bg-green-500/25 border border-green-500/35 text-green-400 hover:text-green-300 text-xs font-bold py-2 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check size={14} className="stroke-[2.5]" /> Approve Agency Vetting
                        </button>
                        <button
                          onClick={() => handleRejectAgency(agency.id)}
                          className="bg-red-500/15 hover:bg-red-500/25 border border-red-500/35 text-red-400 hover:text-red-300 text-xs font-bold py-2 px-3 rounded transition-all cursor-pointer flex items-center justify-center"
                          title="Reject Credentials"
                        >
                          <X size={14} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: HISTORICAL ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <div className="bg-[#0f1c35] border border-slate-800 rounded-lg p-5">
              <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">EOC Master Activity Timeline</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Chronological record of coordination commands, verifications, and active responses.</p>
                </div>
              </div>

              <div className="space-y-4 max-w-3xl mx-auto py-4">
                {activity.map((log, idx) => (
                  <div key={log.id} className="timeline-step flex gap-4">
                    {/* Circle Indicator */}
                    <div className="flex flex-col items-center flex-shrink-0 mt-1">
                      <div className={`w-6 h-6 rounded-full border bg-navy-950 flex items-center justify-center text-xs ${
                        log.type === 'incident' && log.severity === 'CRITICAL'
                          ? 'border-red-500 text-red-400 font-extrabold animate-pulse'
                          : log.type === 'verification'
                          ? 'border-cyan-500 text-cyan-400'
                          : 'border-slate-800 text-slate-500'
                      }`}>
                        <Clock size={12} />
                      </div>
                    </div>

                    {/* Content Box */}
                    <div className="flex-1 bg-navy-900 border border-slate-850 p-4 rounded-lg">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className={`text-[9px] font-bold uppercase font-mono px-1.5 py-0.2 rounded border ${
                            log.type === 'incident' 
                              ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                              : log.type === 'verification'
                              ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                              : 'bg-slate-800 border-slate-700/60 text-slate-400'
                          }`}>
                            {log.action}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">{log.detail}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">{log.time}</span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 border-t border-slate-850/60 pt-2.5 font-mono">
                        <span>Triggered by:</span>
                        <span className="text-slate-400 font-sans font-semibold">{log.actor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
