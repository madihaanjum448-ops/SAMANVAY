import React, { useState, useEffect } from 'react';
import { FileText, SlidersHorizontal, ShieldAlert, Plus, Send } from 'lucide-react';
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

    const initData = (key, fallback) => {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    };

    setRequests(initData('samanvay_requests', MOCK_REQUESTS));
    setIncidents(initData('samanvay_incidents', MOCK_INCIDENTS));
    setAgencies(initData('samanvay_agencies', MOCK_AGENCIES));
  }, []);

  const syncState = (key, data, setter) => {
    setter(data);
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleStatusChange = (reqId, newStatus) => {
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
      actor: role === 'authority' ? 'Priya Desai (EOC)' : 'Agency Dispatcher',
      time: 'Just now',
    };
    logsList.unshift(newLog);
    localStorage.setItem('samanvay_activity', JSON.stringify(logsList));
  };

  const handleCreateRequest = (e) => {
    e.preventDefault();

    // Determine from EOC or logged-in agency
    let fromId = 'EOC-PUNE';
    let fromName = 'District EOC Control Room';
    if (role === 'agency') {
      fromId = 'AG-002';
      fromName = 'SDRF Unit 01';
    }

    const selectedTo = agencies.find(a => a.id === toSelected);
    const selectedInc = incidents.find(i => i.id === incidentSelected);

    const newRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      from: fromId,
      fromName: fromName,
      to: toSelected,
      toName: selectedTo ? selectedTo.name : 'Unknown Agency',
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
    syncState('samanvay_requests', updated, setRequests);

    // Activity log
    const storedLogs = localStorage.getItem('samanvay_activity') || '[]';
    const logsList = JSON.parse(storedLogs);
    const newLog = {
      id: Date.now(),
      type: 'request',
      action: 'Request Initiated',
      detail: `${newRequest.id} created by ${fromName}`,
      actor: fromName,
      time: 'Just now',
    };
    logsList.unshift(newLog);
    localStorage.setItem('samanvay_activity', JSON.stringify(logsList));

    setIsCreateOpen(false);
    setToSelected('');
    setIncidentSelected('');
    setResourcesRequired('');
    setMessageText('');
  };

  // Filter calculations
  // In agency view, filter to requests involving the logged-in agency
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
    <div className="min-h-screen bg-[#f5f3ef] text-stone-700 flex">
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
                <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">Structured Coordination Requests</h2>
                <p className="text-xs text-stone-500 mt-1">Issue and track resource dispatches between EOC command cells and tactical field units.</p>
              </div>

              {role !== 'public' && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold px-4 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1.5 "
                >
                  <Plus size={14} className="stroke-[3]" /> Issue Assistance Request
                </button>
              )}
            </div>

            {/* Public observer blocker */}
            {role === 'public' ? (
              <div className="bg-white border border-stone-200 rounded-lg p-8 text-center flex flex-col items-center gap-4 max-w-lg mx-auto mt-6">
                <div className="p-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-full">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-base font-extrabold text-stone-900">Access Restricted</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Coordination requests contain operational frequencies, location markers, and unit dispatches. Log in as District Authority or Rescue Agency dispatcher to interact with the dispatch log.
                </p>
              </div>
            ) : (
              <>
                {/* Filters Tab buttons */}
                <div className="flex items-center gap-2 border-b border-stone-200 pb-1 overflow-x-auto no-scrollbar">
                  {['ALL', 'INITIATED', 'ACKNOWLEDGED', 'DEPLOYED', 'RESOLVED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                        filterStatus === status
                          ? 'border-teal-600 text-teal-700 font-extrabold'
                          : 'border-transparent text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Request cards list */}
                {finalFiltered.length === 0 ? (
                  <div className="py-16 text-center text-xs text-stone-500 font-mono uppercase bg-white border border-stone-200 rounded-lg">
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
            <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">Details Message Directive</label>
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Provide context, exact street directions, contact details, or mission priorities..."
              className="w-full bg-[#faf9f6] border border-stone-200 focus:border-teal-600 text-xs rounded p-2 text-stone-900 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-200">
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
