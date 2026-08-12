import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus } from 'lucide-react';
import AuthoritySidebar from '../components/layout/AuthoritySidebar';
import AgencySidebar from '../components/layout/AgencySidebar';
import TopHeader from '../components/layout/TopHeader';
import Navbar from '../components/layout/Navbar';
import RequestCard from '../components/request/RequestCard';
import Modal from '../components/ui/Modal';
import Dropdown from '../components/ui/Dropdown';
import FormInput from '../components/ui/FormInput';
import Button from '../components/ui/Button';
import { MOCK_REQUESTS, MOCK_INCIDENTS, MOCK_AGENCIES } from '../data/mockData';
import { api } from '../services/api';

export default function CoordinationRequests() {
  const [role, setRole] = useState('authority');
  const [requests, setRequests] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Create Request Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toSelected, setToSelected] = useState('');
  const [incidentSelected, setIncidentSelected] = useState('');
  const [resourcesRequired, setResourcesRequired] = useState('');
  const [urgencySelected, setUrgencySelected] = useState('HIGH');
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const activeRole = localStorage.getItem('samanvay_role') || 'authority';
    setRole(activeRole);

    async function loadData() {
      try {
        const [requestsData, incidentsData, agenciesData] = await Promise.all([
          api.requests.getAll(),
          api.incidents.getAll(),
          api.agencies.getAll()
        ]);
        if (requestsData?.length) setRequests(requestsData);
        if (incidentsData?.length) setIncidents(incidentsData);
        if (agenciesData?.length) setAgencies(agenciesData);
      } catch (err) {
        console.error('Failed to load coordination requests:', err);
      }
    }
    loadData();
  }, []);

  const handleStatusChange = async (reqId, newStatus) => {
    const actor = role === 'authority' ? 'Priya Desai (EOC)' : 'Agency Dispatcher';
    await api.requests.updateStatus(reqId, newStatus, actor);

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

    // Activity logging
    const storedLogs = localStorage.getItem('samanvay_activity') || '[]';
    const logsList = JSON.parse(storedLogs);
    const reqCode = requests.find(r => r.id === reqId)?.id || 'Request';
    const newLog = {
      id: Date.now(),
      type: 'request',
      action: `Request ${newStatus}`,
      detail: `${reqCode} status transitioned to ${newStatus}`,
      actor: role === 'authority' ? 'Priya Desai (EOC Lead)' : 'Agency Dispatcher',
      time: 'Just now',
    };
    logsList.unshift(newLog);
    localStorage.setItem('samanvay_activity', JSON.stringify(logsList));

  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    let fromId = 'EOC-PUNE';
    let fromName = 'District EOC Control Room';
    if (role === 'agency') {
      fromId = 'AG-002';
      fromName = 'SDRF Unit 01';
    }

    const selectedTo = agencies.find(a => a.id === toSelected);
    const selectedInc = incidents.find(i => i.id === incidentSelected);

    const newRequestPayload = {
      from: fromId,
      fromName: fromName,
      to: toSelected,
      toName: selectedTo ? selectedTo.name : 'Unknown Agency',
      incident: incidentSelected || null,
      incidentLabel: selectedInc ? `${selectedInc.type} — ${selectedInc.location}` : 'General Coordinate Action',
      required: resourcesRequired,
      urgency: urgencySelected,
      message: messageText
    };

    const res = await api.requests.create(newRequestPayload);
    const createdReq = res?.request || {
      ...newRequestPayload,
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'INITIATED',
      createdAt: new Date().toISOString(),
      timeline: [
        { status: 'INITIATED', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), done: true },
        { status: 'ACKNOWLEDGED', time: null, done: false },
        { status: 'DEPLOYED', time: null, done: false },
        { status: 'RESOLVED', time: null, done: false },
      ]
    };

    setRequests([createdReq, ...requests]);

    setIsCreateOpen(false);
    setToSelected('');
    setIncidentSelected('');
    setResourcesRequired('');
    setMessageText('');
  };

  const roleFiltered = role === 'agency' 
    ? requests.filter(r => r.from === 'AG-002' || r.to === 'AG-002')
    : requests;

  const finalFiltered = filterStatus === 'ALL'
    ? roleFiltered
    : roleFiltered.filter(r => r.status === filterStatus);

  const renderSidebar = () => {
    if (role === 'authority') return <AuthoritySidebar />;
    if (role === 'agency') return <AgencySidebar />;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#111827] flex font-sans">
      {/* Sidebar navigation */}
      {renderSidebar()}

      {/* Main Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        {role === 'public' ? <Navbar /> : <TopHeader title="EOC Coordination Desk" />}

        {/* Coordination Body */}
        <main className={`p-6 flex-1 overflow-y-auto ${role === 'public' ? 'max-w-4xl mx-auto w-full mt-16' : ''}`}>
          
          <div className="flex flex-col gap-6">
            
            {/* Header Title */}
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight">Structured Coordination Requests</h2>
                <p className="text-xs text-[#64748B] mt-1">Issue and track resource dispatches between EOC command cells and tactical field units.</p>
              </div>

              {role !== 'public' && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Plus size={16} /> Issue Assistance Request
                </button>
              )}
            </div>

            {/* Public observer blocker */}
            {role === 'public' ? (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center flex flex-col items-center gap-4 max-w-lg mx-auto mt-6 shadow-xs">
                <div className="p-3.5 bg-[#FFF7ED] border border-[#FED7AA] text-[#EA580C] rounded-full">
                  <ShieldAlert size={28} />
                </div>
                <h3 className="text-lg font-extrabold text-[#111827]">Access Restricted</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Coordination requests contain operational frequencies, location markers, and unit dispatches. Log in as District Authority or Rescue Agency dispatcher to interact with the dispatch log.
                </p>
              </div>
            ) : (
              <>
                {/* Filters Tab buttons */}
                <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-1 overflow-x-auto no-scrollbar">
                  {['ALL', 'INITIATED', 'ACKNOWLEDGED', 'DEPLOYED', 'RESOLVED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                        filterStatus === status
                          ? 'border-[#166534] text-[#166534]'
                          : 'border-transparent text-[#64748B] hover:text-[#111827]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Request cards list */}
                {finalFiltered.length === 0 ? (
                  <div className="py-16 text-center text-xs text-[#64748B] font-mono uppercase bg-white border border-[#E5E7EB] rounded-xl">
                    No requests found matching current filter state.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 max-w-4xl">
                    {finalFiltered.map((req) => (
                      <RequestCard 
                        key={req.id} 
                        request={req} 
                        onStatusChange={handleStatusChange} 
                        currentRole={role}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

          </div>

        </main>
      </div>

      {/* Dispatch Assistance Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Issue Assistance Coordination Request"
      >
        <form onSubmit={handleCreateRequest} className="flex flex-col gap-4">
          
          <Dropdown
            id="req-agency"
            label="Assigned tactical Unit (To)"
            options={agencies.filter(a => a.verificationStatus === 'VERIFIED').map(a => ({ value: a.id, label: `${a.type}: ${a.name} (${a.district})` }))}
            value={toSelected}
            onChange={(e) => setToSelected(e.target.value)}
            required
            placeholder="Select target rescue agency..."
          />

          <Dropdown
            id="req-incident"
            label="Relate to EOC Incident log"
            options={incidents.filter(i => i.status === 'ACTIVE').map(i => ({ value: i.id, label: `${i.id}: ${i.type} — ${i.location}` }))}
            value={incidentSelected}
            onChange={(e) => setIncidentSelected(e.target.value)}
            placeholder="Select active incident (optional)..."
          />

          <FormInput
            id="req-resource"
            label="Required Resources Specification"
            placeholder="e.g. 5 inflatable rescue boats, 20 life vests"
            value={resourcesRequired}
            onChange={(e) => setResourcesRequired(e.target.value)}
            required
          />

          <Dropdown
            id="req-urgency"
            label="Urgency level directive"
            options={['IMMEDIATE', 'HIGH', 'MEDIUM', 'LOW']}
            value={urgencySelected}
            onChange={(e) => setUrgencySelected(e.target.value)}
            required
          />

          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Details Message Directive</label>
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Provide context, exact street directions, contact details, or mission priorities..."
              className="w-full bg-[#F7F5EF] border border-[#E5E7EB] focus:border-[#166534] text-xs rounded-md p-3 text-[#111827] focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Confirm Dispatch
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
