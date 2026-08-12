import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Users, 
  Package, 
  FileSpreadsheet, 
  Clock, 
  Check, 
  X, 
  Maximize2
} from 'lucide-react';
import AuthoritySidebar from '../../components/layout/AuthoritySidebar';
import TopHeader from '../../components/layout/TopHeader';
import StatCard from '../../components/ui/StatCard';
import MapView from '../../components/map/MapView';
import MapLegend from '../../components/map/MapLegend';
import { SeverityBadge } from '../../components/ui/Badge';
import { 
  MOCK_AGENCIES, 
  MOCK_INCIDENTS, 
  MOCK_REQUESTS, 
  RESOURCE_INVENTORY, 
  MOCK_ACTIVITY_LOG 
} from '../../data/mockData';
import { api } from '../../services/api';

export default function AuthorityDashboard() {
  const [searchParams] = useSearchParams();
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
    async function loadData() {
      try {
        const [agenciesData, incidentsData, requestsData, resourcesData, activityData] = await Promise.all([
          api.agencies.getAll(),
          api.incidents.getAll(),
          api.requests.getAll(),
          api.resources.getAll(),
          api.activity.getAll()
        ]);
        if (agenciesData?.length) setAgencies(agenciesData);
        if (incidentsData?.length) setIncidents(incidentsData);
        if (requestsData?.length) setRequests(requestsData);
        if (resourcesData?.length) setResources(resourcesData);
        if (activityData?.length) setActivity(activityData);
      } catch (err) {
        console.error('Failed to load dashboard data from API:', err);
      }
    }
    loadData();
  }, [activeTab]);

  // Verification actions
  const handleApproveAgency = async (id) => {
    await api.agencies.verify(id, 'VERIFIED', 'Priya Desai (Pune EOC)');
    const updated = agencies.map(a => 
      a.id === id ? { ...a, verificationStatus: 'VERIFIED', verifiedAt: new Date().toISOString().split('T')[0] } : a
    );
    setAgencies(updated);


    const agencyName = agencies.find(a => a.id === id)?.name || 'Agency';
    const newLog = {
      id: Date.now(),
      type: 'verification',
      action: 'Agency Approved',
      detail: `${agencyName} approved to join coordination network`,
      actor: 'Priya Desai (EOC Lead)',
      time: 'Just now',
    };
    syncState('samanvay_activity', [newLog, ...activity], setActivity);

    // Refresh activity log
    const updatedActivity = await api.activity.getAll();
    if (updatedActivity?.length) setActivity(updatedActivity);

  };

  const handleRejectAgency = async (id) => {
    await api.agencies.verify(id, 'REJECTED', 'Priya Desai (Pune EOC)');
    const updated = agencies.map(a => 
      a.id === id ? { ...a, verificationStatus: 'REJECTED' } : a
    );
    setAgencies(updated);


    const agencyName = agencies.find(a => a.id === id)?.name || 'Agency';
    const newLog = {
      id: Date.now(),
      type: 'verification',
      action: 'Agency Rejected',
      detail: `${agencyName} registration rejected`,
      actor: 'Priya Desai (EOC Lead)',
      time: 'Just now',
    };
    syncState('samanvay_activity', [newLog, ...activity], setActivity);

    const updatedActivity = await api.activity.getAll();
    if (updatedActivity?.length) setActivity(updatedActivity);

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
    <div className="min-h-screen bg-[#F7F5EF] text-[#111827] flex font-sans">
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
                <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col h-[480px] relative shadow-xs">
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Live Response Map</h3>
                      <span className="text-[10px] text-[#64748B] font-mono">PUNE-EOC GIS CONNECTED</span>
                    </div>
                    <button 
                      onClick={() => navigate('/authority/dashboard?tab=map')}
                      className="text-[#166534] hover:text-[#14532D] flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#F0FDF4] border border-[#DCFCE7] px-3 py-1 rounded-md cursor-pointer transition-all"
                    >
                      <Maximize2 size={12} /> Maximize GIS
                    </button>
                  </div>
                  <div className="flex-1 relative rounded-lg overflow-hidden border border-[#E5E7EB]">
                    <MapView markers={getMapMarkers()} />
                    <MapLegend />
                  </div>
                </div>

                {/* Active Incident Sidebar */}
                <div className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col h-[480px] justify-between shadow-xs">
                  <div>
                    <div className="flex justify-between items-center mb-3.5 border-b border-[#E5E7EB] pb-2.5">
                      <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Active Incident Log</h3>
                      <span className="text-[10px] text-[#64748B] font-mono font-bold">{incidents.filter(i => i.status === 'ACTIVE').length} Logs</span>
                    </div>
                    
                    <div className="space-y-2.5 overflow-y-auto no-scrollbar max-h-[360px]">
                      {incidents.filter(i => i.status === 'ACTIVE').map(inc => (
                        <div 
                          key={inc.id}
                          onClick={() => navigate(`/incidents/${inc.id}`)}
                          className="p-3 bg-[#F7F5EF] border border-[#E5E7EB] hover:border-[#CBD5E1] rounded-lg cursor-pointer transition-all flex flex-col gap-2 relative group"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-bold text-[#64748B] font-mono">{inc.id}</span>
                                <SeverityBadge severity={inc.severity} showDot={false} />
                              </div>
                              <h4 className="text-xs font-bold text-[#111827] mt-1 group-hover:text-[#166534] transition-colors">
                                {inc.type} — {inc.location}
                              </h4>
                            </div>
                            <span className="text-[10px] text-[#64748B] font-mono">
                              {inc.createdAt ? new Date(inc.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Active'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Link 
                    to="/authority/dashboard?tab=incidents"
                    className="w-full text-center bg-white hover:bg-[#F7F5EF] text-[#166534] border border-[#E5E7EB] hover:border-[#CBD5E1] text-xs font-bold py-2 rounded-md transition-all mt-3"
                  >
                    View All Emergency Incidents
                  </Link>
                </div>
              </div>

              {/* Bottom Row: Pending Approvals */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs">
                <div className="flex justify-between items-center mb-4 border-b border-[#E5E7EB] pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Pending Agency Verifications</h3>
                    <p className="text-[10px] text-[#64748B] mt-0.5">Vetting credentials before granting full network authorization.</p>
                  </div>
                  <span className="bg-[#FFF7ED] text-[#EA580C] text-xs font-mono font-bold px-2.5 py-1 border border-[#FED7AA] rounded-md">
                    {pendingAgencies.length} Pending
                  </span>
                </div>

                {pendingAgencies.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#64748B] font-mono uppercase">
                    Verification Queue Clear. All registered agencies are verified.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingAgencies.map((agency) => (
                      <div 
                        key={agency.id} 
                        className="bg-[#F7F5EF] border border-[#E5E7EB] p-4 rounded-xl flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-mono">{agency.type}</span>
                              <h4 className="text-xs font-bold text-[#111827] mt-0.5">{agency.name}</h4>
                            </div>
                            <span className="text-[10px] text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#FED7AA] font-bold uppercase tracking-wider">Vetting</span>
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-2 font-mono flex items-center gap-1">
                            <span>HQ Base:</span> <span className="text-[#111827] font-sans font-medium">{agency.address}</span>
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {agency.expertise.map((exp, idx) => (
                              <span key={idx} className="bg-white text-[#475569] text-[9px] font-bold px-2 py-0.5 rounded border border-[#E5E7EB]">
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 border-t border-[#E5E7EB] pt-3">
                          <button
                            onClick={() => handleApproveAgency(agency.id)}
                            className="flex-1 bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#DCFCE7] text-[#166534] text-xs font-bold py-1.5 px-3 rounded-md transition-all cursor-pointer inline-flex items-center justify-center gap-1"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectAgency(agency.id)}
                            className="flex-1 bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs font-bold py-1.5 px-3 rounded-md transition-all cursor-pointer inline-flex items-center justify-center gap-1"
                          >
                            <X size={14} /> Reject
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
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 h-[calc(100vh-140px)] flex flex-col shadow-xs">
              <div className="mb-3">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Full Geographic Information System (GIS)</h3>
                <span className="text-xs text-[#64748B]">Live situational tracking of rescue units and reported disasters.</span>
              </div>
              <div className="flex-1 relative rounded-lg overflow-hidden border border-[#E5E7EB]">
                <MapView markers={getMapMarkers()} center={[18.5204, 73.8567]} zoom={12} />
                <MapLegend />
              </div>
            </div>
          )}

          {/* TAB 3: FULL INCIDENTS LOG */}
          {activeTab === 'incidents' && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs">
              <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-4 mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Emergency Incident Database</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">Central register of disasters, rescue directives and assignment updates.</p>
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
                        <td className="font-mono text-xs font-semibold text-[#64748B]">{inc.id}</td>
                        <td className="font-bold text-[#111827] text-xs">{inc.type}</td>
                        <td>
                          <span className="text-xs text-[#374151] font-medium">{inc.location}</span>
                        </td>
                        <td>
                          <SeverityBadge severity={inc.severity} showDot={false} />
                        </td>
                        <td>
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                            inc.status === 'ACTIVE' ? 'text-[#DC2626] status-pulse' : 'text-[#166534]'
                          }`}>
                            {inc.status}
                          </span>
                        </td>
                        <td className="font-mono text-xs text-[#64748B]">
                          {new Date(inc.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => navigate(`/incidents/${inc.id}`)}
                            className="bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border border-[#DCFCE7] text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                          >
                            Command Center
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
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs">
              <div className="border-b border-[#E5E7EB] pb-4 mb-4">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Tactical Force Verification Queue</h3>
                <p className="text-xs text-[#64748B] mt-0.5">District authority portal checking agency phone lines, base address, and rescue staff capabilities.</p>
              </div>

              {pendingAgencies.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#64748B] font-mono uppercase">
                  All registering tactical units have been processed. Queue empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingAgencies.map((agency) => (
                    <div 
                      key={agency.id} 
                      className="bg-[#F7F5EF] border border-[#E5E7EB] p-5 rounded-xl flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-[#64748B] font-bold uppercase tracking-wider">{agency.type}</span>
                            <h4 className="text-sm font-bold text-[#111827] mt-0.5">{agency.name}</h4>
                          </div>
                          <span className="text-[10px] text-[#EA580C] border border-[#FED7AA] bg-[#FFF7ED] px-2.5 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">
                            VETTING IN PROGRESS
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono text-[#64748B] bg-white border border-[#E5E7EB] p-3.5 rounded-lg">
                          <div>District: <span className="text-[#111827] font-sans font-medium">{agency.district}</span></div>
                          <div>State: <span className="text-[#111827] font-sans font-medium">{agency.state}</span></div>
                          <div className="col-span-2">Contact: <span className="text-[#111827]">{agency.phone}</span></div>
                          <div className="col-span-2">Email: <span className="text-[#111827]">{agency.email}</span></div>
                        </div>

                        <div className="mt-3.5">
                          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Declared Expertise</span>
                          <div className="flex flex-wrap gap-1">
                            {agency.expertise.map((exp, idx) => (
                              <span key={idx} className="bg-white text-[#475569] text-[10px] font-bold px-2 py-0.5 rounded border border-[#E5E7EB]">
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 border-t border-[#E5E7EB] pt-4 mt-2">
                        <button
                          onClick={() => handleApproveAgency(agency.id)}
                          className="flex-1 bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#DCFCE7] text-[#166534] text-xs font-bold py-2 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Check size={16} /> Approve Agency Vetting
                        </button>
                        <button
                          onClick={() => handleRejectAgency(agency.id)}
                          className="bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs font-bold py-2 px-4 rounded-md transition-all cursor-pointer flex items-center justify-center shadow-2xs"
                          title="Reject Credentials"
                        >
                          <X size={16} />
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
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs">
              <div className="border-b border-[#E5E7EB] pb-4 mb-4 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">EOC Master Activity Timeline</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">Chronological record of coordination commands, verifications, and active responses.</p>
                </div>
              </div>

              <div className="space-y-4 max-w-3xl mx-auto py-4">
                {activity.map((log) => (
                  <div key={log.id} className="timeline-step flex gap-4">
                    <div className="flex flex-col items-center flex-shrink-0 mt-1">
                      <div className={`w-6 h-6 rounded-full border bg-white flex items-center justify-center text-xs ${
                        log.type === 'incident' && log.severity === 'CRITICAL'
                          ? 'border-[#DC2626] text-[#DC2626] font-bold'
                          : log.type === 'verification'
                          ? 'border-[#166534] text-[#166534]'
                          : 'border-[#CBD5E1] text-[#64748B]'
                      }`}>
                        <Clock size={12} />
                      </div>
                    </div>

                    <div className="flex-1 bg-[#F7F5EF] border border-[#E5E7EB] p-4 rounded-xl">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border ${
                            log.type === 'incident' 
                              ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]' 
                              : log.type === 'verification'
                              ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#166534]'
                              : 'bg-white border-[#E5E7EB] text-[#64748B]'
                          }`}>
                            {log.action}
                          </span>
                          <h4 className="text-sm font-bold text-[#111827] mt-2 leading-snug">{log.detail}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-[#64748B] font-semibold">{log.time}</span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-3 text-xs text-[#64748B] border-t border-[#E5E7EB] pt-2 font-mono">
                        <span>Triggered by:</span>
                        <span className="text-[#111827] font-sans font-semibold">{log.actor}</span>
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
