import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  AlertTriangle, 
  Users, 
  Package, 
  FileSpreadsheet, 
  Clock, 
  Check, 
  X, 
  Maximize2,
  Shield,
  ShieldAlert,
  Activity,
  MapPin,
  Truck,
  Ship,
  Ambulance,
  Radio,
  Building2,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  ArrowRight,
  Plus,
  MoreHorizontal,
  Eye,
  CheckCircle,
  Trash2
} from 'lucide-react';
import AuthoritySidebar from '../../components/layout/AuthoritySidebar';
import TopHeader from '../../components/layout/TopHeader';
import MapView from '../../components/map/MapView';
import MapLegend from '../../components/map/MapLegend';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/ui/FormInput';
import Dropdown from '../../components/ui/Dropdown';
import { SeverityBadge } from '../../components/ui/Badge';
import { RESOURCE_INVENTORY } from '../../data/mockData';
import { api } from '../../services/api';
import ActivityLogTab from '../../components/authority/ActivityLogTab';


export default function AuthorityDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'overview';

  // Get logged-in user for dynamic header and state scoping
  const currentUser = (() => {
    try {
      const u = localStorage.getItem('samanvay_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  })();
  const userRole = currentUser?.role || localStorage.getItem('samanvay_role') || 'district_eoc';
  const headerTitle = currentUser?.jurisdiction
    ? currentUser.jurisdiction.toUpperCase()
    : 'DISTRICT EOC';

  // State loaded from localStorage/Firestore/API for full interactivity
  const [agencies, setAgencies] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [activity, setActivity] = useState([]);

  // Incident management state
  const [showReportModal, setShowReportModal] = useState(false);
  const [actionMenuId, setActionMenuId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'resolve'|'delete', incident }
  const actionMenuRef = useRef(null);
  const [newIncident, setNewIncident] = useState({
    type: '',
    location: '',
    severity: 'MEDIUM',
    description: '',
    reportedBy: 'Priya Desai (EOC Lead)'
  });

  // Close action menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActionMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load state from Firestore & API services
  useEffect(() => {
    async function loadData() {
      try {
        const [agenciesData, incidentsData, requestsData, resourcesData, activityData] = await Promise.all([
          getDocs(collection(db, 'agencies')).then(snapshot =>
            snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
          ),
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

  // Verification actions (Firestore updates)
  const handleApproveAgency = async (id) => {
    try {
      await updateDoc(doc(db, 'agencies', id), {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Priya Desai (Pune EOC)'
      });

      setAgencies(prev =>
        prev.map(a =>
          a.id === id
            ? {
                ...a,
                verificationStatus: 'VERIFIED',
                status: 'AVAILABLE',
                verifiedAt: new Date().toISOString()
              }
            : a
        )
      );

      // Sync localStorage so the change persists across page reloads
      const cached = localStorage.getItem('samanvay_agencies');
      if (cached) {
        let list = JSON.parse(cached);
        list = list.map(a => a.id === id ? {
          ...a,
          verificationStatus: 'VERIFIED',
          status: 'AVAILABLE',
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'Priya Desai (Pune EOC)'
        } : a);
        localStorage.setItem('samanvay_agencies', JSON.stringify(list));
      }
      const agencyName = agencies.find(a => a.id === id)?.name || 'Agency';
      const newLog = {
        id: Date.now(),
        type: 'verification',
        action: 'Agency Approved',
        detail: `${agencyName} approved to join coordination network`,
        actor: 'Priya Desai (EOC Lead)',
        time: 'Just now',
      };

      const updatedActivity = await api.activity.getAll();
      if (updatedActivity?.length) {
        setActivity([newLog, ...updatedActivity]);
      } else {
        setActivity(prev => [newLog, ...prev]);
      }

      alert('Agency approved successfully!');
    } catch (error) {
      console.error('Error approving agency:', error);
      alert('Failed to approve agency. Check Firestore permissions.');
    }
  };

  const handleRejectAgency = async (id) => {
    try {
      await updateDoc(doc(db, 'agencies', id), {
        verificationStatus: 'REJECTED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Priya Desai (Pune EOC)'
      });

      setAgencies(prev =>
        prev.map(a =>
          a.id === id
            ? {
                ...a,
                verificationStatus: 'REJECTED',
                status: 'REJECTED'
              }
            : a
        )
      );

      // Sync localStorage so the change persists across page reloads
      const cached = localStorage.getItem('samanvay_agencies');
      if (cached) {
        let list = JSON.parse(cached);
        list = list.map(a => a.id === id ? {
          ...a,
          verificationStatus: 'REJECTED',
          status: 'REJECTED',
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'Priya Desai (Pune EOC)'
        } : a);
        localStorage.setItem('samanvay_agencies', JSON.stringify(list));
      }

      const agencyName = agencies.find(a => a.id === id)?.name || 'Agency';
      const newLog = {
        id: Date.now(),
        type: 'verification',
        action: 'Agency Rejected',
        detail: `${agencyName} registration rejected`,
        actor: 'Priya Desai (EOC Lead)',
        time: 'Just now',
      };

      const updatedActivity = await api.activity.getAll();
      if (updatedActivity?.length) {
        setActivity([newLog, ...updatedActivity]);
      } else {
        setActivity(prev => [newLog, ...prev]);
      }

      alert('Agency rejected.');
    } catch (error) {
      console.error('Error rejecting agency:', error);
      alert('Failed to reject agency. Check Firestore permissions.');
    }
  };

  // --- INCIDENT MANAGEMENT HANDLERS ---
  const handleReportIncident = async (e) => {
    e.preventDefault();
    try {
      const result = await api.incidents.create(newIncident);
      const created = result?.incident || {
        ...newIncident,
        id: `INC-0${Math.floor(6 + Math.random() * 94)}`,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      setIncidents(prev => [created, ...prev]);

      const newLog = {
        id: Date.now(),
        type: 'incident',
        action: 'Incident Reported',
        detail: `${newIncident.type} reported at ${newIncident.location} [${newIncident.severity}]`,
        actor: newIncident.reportedBy,
        time: 'Just now',
        severity: newIncident.severity
      };
      setActivity(prev => [newLog, ...prev]);

      setNewIncident({ type: '', location: '', severity: 'MEDIUM', description: '', reportedBy: 'Priya Desai (EOC Lead)' });
      setShowReportModal(false);
    } catch (err) {
      console.error('Failed to report incident:', err);
      alert('Failed to report incident.');
    }
  };

  const handleResolveIncident = async (inc) => {
    try {
      await api.incidents.resolve(inc.id, 'Priya Desai (EOC Lead)');
      setIncidents(prev => prev.map(i => i.id === inc.id ? { ...i, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : i));

      const newLog = {
        id: Date.now(),
        type: 'incident',
        action: 'Incident Resolved',
        detail: `${inc.type} at ${inc.location} marked resolved`,
        actor: 'Priya Desai (EOC Lead)',
        time: 'Just now'
      };
      setActivity(prev => [newLog, ...prev]);
      setConfirmAction(null);
    } catch (err) {
      console.error('Failed to resolve incident:', err);
      alert('Failed to resolve incident.');
    }
  };

  const handleDeleteIncident = async (inc) => {
    try {
      await api.incidents.delete(inc.id, 'Priya Desai (EOC Lead)');
      setIncidents(prev => prev.filter(i => i.id !== inc.id));

      const newLog = {
        id: Date.now(),
        type: 'incident',
        action: 'Incident Removed',
        detail: `${inc.type} at ${inc.location} permanently removed from register`,
        actor: 'Priya Desai (EOC Lead)',
        time: 'Just now'
      };
      setActivity(prev => [newLog, ...prev]);
      setConfirmAction(null);
    } catch (err) {
      console.error('Failed to delete incident:', err);
      alert('Failed to delete incident.');
    }
  };

  // Filter queues & stats calculations
  const pendingAgencies = agencies.filter(a => a.verificationStatus === 'PENDING');
  const activeIncidents = incidents.filter(i => i.status === 'ACTIVE');
  const criticalIncidentsCount = activeIncidents.filter(i => i.severity === 'CRITICAL').length;
  const highIncidentsCount = activeIncidents.filter(i => i.severity === 'HIGH').length;
  const verifiedAgencies = agencies.filter(a => a.verificationStatus === 'VERIFIED');
  const totalResourcesCount = resources.length 
    ? resources.reduce((acc, curr) => acc + (curr.available || 0), 0)
    : RESOURCE_INVENTORY.reduce((acc, curr) => acc + curr.available, 0);
  const pendingRequests = requests.filter(r => r.status === 'INITIATED' || r.status === 'ACKNOWLEDGED');

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

  // Fallback resource categories for compact horizontal bars
  const resourceDisplayList = resources.length ? resources : RESOURCE_INVENTORY;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#0F172A] flex font-sans text-xs">
      {/* Redesigned Government Sidebar */}
      <AuthoritySidebar activeTab={activeTab} />

      {/* Main Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Compact Professional Header */}
        <TopHeader title={headerTitle} />

        {/* Dynamic page content based on tab query */}
        <main className="p-4 md:p-6 flex-1 overflow-y-auto space-y-5">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* EOC OPERATIONAL SITUATION OVERVIEW (COMPACT METRICS BAR) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* Metric 1: Active Incidents */}
                <div 
                  onClick={() => navigate('/authority/dashboard?tab=incidents')}
                  className="bg-white border border-[#CBD5E1] border-l-4 border-l-[#DC2626] p-3.5 flex flex-col justify-between cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider font-mono">ACTIVE INCIDENTS</span>
                    <div className="w-6 h-6 rounded bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626]">
                      <ShieldAlert size={14} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[#0F172A] tracking-tight font-mono">{activeIncidents.length}</span>
                    <span className="text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 rounded border border-[#FECACA] font-mono">
                      {criticalIncidentsCount} CRITICAL | {highIncidentsCount} HIGH
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-[#64748B] flex items-center justify-between border-t border-[#E2E8F0] pt-1.5 font-mono">
                    <span>SECTOR OPERATIONAL</span>
                    <span className="text-[#DC2626] font-bold">MONITORING</span>
                  </div>
                </div>

                {/* Metric 2: Registered Forces */}
                <div 
                  onClick={() => navigate('/agencies')}
                  className="bg-white border border-[#CBD5E1] border-l-4 border-l-[#166534] p-3.5 flex flex-col justify-between cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider font-mono">VERIFIED FORCES</span>
                    <div className="w-6 h-6 rounded bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#166534]">
                      <Shield size={14} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[#0F172A] tracking-tight font-mono">{verifiedAgencies.length}</span>
                    <span className="text-[10px] font-bold text-[#166534] bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#DCFCE7] font-mono">
                      100% NETWORK VERIFIED
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-[#64748B] flex items-center justify-between border-t border-[#E2E8F0] pt-1.5 font-mono">
                    <span>DEPLOYED / READY</span>
                    <span className="text-[#166534] font-bold">TACTICAL</span>
                  </div>
                </div>

                {/* Metric 3: Available Assets */}
                <div 
                  onClick={() => navigate('/resources')}
                  className="bg-white border border-[#CBD5E1] border-l-4 border-l-[#0284C7] p-3.5 flex flex-col justify-between cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider font-mono">AVAILABLE ASSETS</span>
                    <div className="w-6 h-6 rounded bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
                      <Package size={14} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[#0F172A] tracking-tight font-mono">{totalResourcesCount}</span>
                    <span className="text-[10px] font-bold text-[#0284C7] bg-[#F0F9FF] px-1.5 py-0.5 rounded border border-[#BAE6FD] font-mono">
                      READY FOR DISPATCH
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-[#64748B] flex items-center justify-between border-t border-[#E2E8F0] pt-1.5 font-mono">
                    <span>FLEET & SUPPLIES</span>
                    <span className="text-[#0284C7] font-bold">ONLINE</span>
                  </div>
                </div>

                {/* Metric 4: Pending Dispatches */}
                <div 
                  onClick={() => navigate('/requests')}
                  className="bg-white border border-[#CBD5E1] border-l-4 border-l-[#D97706] p-3.5 flex flex-col justify-between cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider font-mono">PENDING DISPATCHES</span>
                    <div className="w-6 h-6 rounded bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                      <FileSpreadsheet size={14} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[#0F172A] tracking-tight font-mono">{pendingRequests.length}</span>
                    <span className="text-[10px] font-bold text-[#D97706] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FEF3C7] font-mono">
                      ACTION REQUIRED
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-[#64748B] flex items-center justify-between border-t border-[#E2E8F0] pt-1.5 font-mono">
                    <span>MUTUAL AID QUEUE</span>
                    <span className="text-[#D97706] font-bold">PENDING</span>
                  </div>
                </div>

              </div>

              {/* PRIMARY VISUAL ELEMENT: LIVE GIS MAP & INCIDENT ALERT QUEUE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                
                {/* Large Central GIS Map Container */}
                <div className="lg:col-span-8 bg-white border border-[#CBD5E1] p-4 flex flex-col h-[520px] relative shadow-2xs">
                  {/* Map Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0] flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#166534] status-pulse" />
                        <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">LIVE INCIDENT MAP</h2>
                      </div>
                      <p className="text-[10px] text-[#64748B] font-mono mt-0.5">
                        Real-time operational view • Pune EOC GIS Grid Ref: 18.5204° N, 73.8567° E
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] text-[10px] font-mono font-bold px-2 py-1">
                        {getMapMarkers().length} ENTITIES ON MAP
                      </span>
                      <button 
                        onClick={() => navigate('/authority/dashboard?tab=map')}
                        className="bg-[#166534] hover:bg-[#14532D] text-white flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 transition-colors cursor-pointer"
                      >
                        <Maximize2 size={12} /> Maximize GIS
                      </button>
                    </div>
                  </div>
                  
                  {/* Map Frame */}
                  <div className="flex-1 relative border border-[#CBD5E1] bg-[#F1F5F9]">
                    <MapView markers={getMapMarkers()} />
                    <MapLegend />
                  </div>
                </div>

                {/* Compact Incident Alert Queue */}
                <div className="lg:col-span-4 bg-white border border-[#CBD5E1] p-4 flex flex-col h-[520px] justify-between shadow-2xs">
                  <div>
                    {/* Alert Panel Header */}
                    <div className="flex justify-between items-center pb-2.5 border-b border-[#E2E8F0] mb-3">
                      <div className="flex items-center gap-2">
                        <Radio size={14} className="text-[#DC2626]" />
                        <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">ALERT / INCIDENT QUEUE</h3>
                      </div>
                      <span className="bg-[#FEF2F2] text-[#DC2626] text-[10px] font-mono font-bold px-2 py-0.5 border border-[#FECACA]">
                        {activeIncidents.length} ACTIVE
                      </span>
                    </div>

                    {/* Incident List */}
                    <div className="space-y-2 overflow-y-auto max-h-[390px] pr-1">
                      {activeIncidents.length === 0 ? (
                        <div className="p-6 text-center text-[11px] text-[#64748B] font-mono">
                          NO ACTIVE EMERGENCY ALERTS RECORDED
                        </div>
                      ) : (
                        activeIncidents.map((inc) => {
                          const getSeverityIcon = (sev) => {
                            if (sev === 'CRITICAL') return '🔴';
                            if (sev === 'HIGH') return '🟠';
                            if (sev === 'MEDIUM') return '🟡';
                            return '🟢';
                          };
                          return (
                            <div 
                              key={inc.id}
                              onClick={() => navigate(`/incidents/${inc.id}`)}
                              className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#166534] transition-colors cursor-pointer group"
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold text-[#475569] font-mono">{inc.id}</span>
                                    <span className="text-[10px]">
                                      {getSeverityIcon(inc.severity)}
                                    </span>
                                    <SeverityBadge severity={inc.severity} showDot={false} />
                                  </div>
                                  <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#166534] transition-colors leading-tight">
                                    {inc.type} — {inc.location}
                                  </h4>
                                </div>
                                <span className="text-[10px] text-[#64748B] font-mono bg-white border border-[#E2E8F0] px-1.5 py-0.5">
                                  {inc.createdAt ? new Date(inc.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Active'}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-[10px] text-[#64748B] font-mono border-t border-[#E2E8F0] pt-1.5">
                                <span>DISTRICT: {inc.district || 'PUNE'}</span>
                                <span className="text-[#166534] font-bold group-hover:underline flex items-center gap-0.5">
                                  COMMAND VIEW <ArrowRight size={10} />
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Panel Link Button */}
                  <Link 
                    to="/authority/dashboard?tab=incidents"
                    className="w-full text-center bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#166534] border border-[#CBD5E1] text-[11px] font-bold uppercase tracking-wider py-2 transition-colors mt-3 block font-mono"
                  >
                    View All Emergency Logs ({incidents.length})
                  </Link>
                </div>

              </div>

              {/* AGENCY READINESS & RESOURCE AVAILABILITY GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Agency Readiness Table (7 columns) */}
                <div className="lg:col-span-7 bg-white border border-[#CBD5E1] p-4 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                    <div>
                      <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono flex items-center gap-2">
                        <Building2 size={14} className="text-[#166534]" /> AGENCY READINESS STATUS
                      </h3>
                      <p className="text-[10px] text-[#64748B] font-mono mt-0.5">Current operational forces available for dispatch</p>
                    </div>
                    <Link to="/agencies" className="text-[10px] font-mono font-bold text-[#166534] hover:underline uppercase">
                      MANAGE AGENCIES ({verifiedAgencies.length}) →
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-[11px]">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#475569] text-[10px] uppercase">
                          <th className="py-2 px-2.5 font-bold">AGENCY</th>
                          <th className="py-2 px-2.5 font-bold">STATUS</th>
                          <th className="py-2 px-2.5 font-bold">STAFF</th>
                          <th className="py-2 px-2.5 font-bold">VEHICLES / FLEET</th>
                          <th className="py-2 px-2.5 font-bold text-right font-sans">LOCATION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {verifiedAgencies.slice(0, 5).map((agency) => {
                          const statusBg = 
                            agency.status === 'AVAILABLE' || agency.status === 'READY'
                              ? 'bg-[#F0FDF4] text-[#166534] border-[#DCFCE7]'
                              : agency.status === 'DEPLOYED'
                              ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                              : 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]';

                          const personnelAvail = agency.resources?.personnel?.available ?? '—';
                          const personnelTotal = agency.resources?.personnel?.total ?? '—';
                          const vehiclesAvail = agency.resources?.rescueVehicles?.available ?? agency.resources?.ambulances?.available ?? '—';
                          const vehiclesTotal = agency.resources?.rescueVehicles?.total ?? agency.resources?.ambulances?.total ?? '—';

                          return (
                            <tr key={agency.id} className="hover:bg-[#F8FAFC] transition-colors">
                              <td className="py-2 px-2.5">
                                <div className="font-bold text-[#0F172A] font-sans">{agency.name}</div>
                                <div className="text-[9px] text-[#64748B]">{agency.type}</div>
                              </td>
                              <td className="py-2 px-2.5">
                                <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase border ${statusBg}`}>
                                  {agency.status || 'READY'}
                                </span>
                              </td>
                              <td className="py-2 px-2.5 text-[#0F172A]">
                                {personnelAvail} / {personnelTotal}
                              </td>
                              <td className="py-2 px-2.5 text-[#0F172A]">
                                {vehiclesAvail} / {vehiclesTotal} Units
                              </td>
                              <td className="py-2 px-2.5 text-right font-sans text-[#475569]">
                                {agency.district || 'Pune'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Resource Readiness Progress Bars (5 columns) */}
                <div className="lg:col-span-5 bg-white border border-[#CBD5E1] p-4 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                    <div>
                      <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono flex items-center gap-2">
                        <BarChart2 size={14} className="text-[#0284C7]" /> RESOURCE AVAILABILITY
                      </h3>
                      <p className="text-[10px] text-[#64748B] font-mono mt-0.5">District inventory mobilization levels</p>
                    </div>
                    <Link to="/resources" className="text-[10px] font-mono font-bold text-[#0284C7] hover:underline uppercase">
                      INVENTORY →
                    </Link>
                  </div>

                  <div className="space-y-3 pt-1">
                    {resourceDisplayList.map((item) => {
                      const avail = item.available || 0;
                      const total = item.total || 1;
                      const percent = Math.min(100, Math.round((avail / total) * 100));

                      return (
                        <div key={item.id} className="space-y-1">
                          <div className="flex justify-between items-center font-mono text-[10px]">
                            <span className="font-bold text-[#0F172A] uppercase">{item.name}</span>
                            <span className="text-[#475569]">
                              <strong className="text-[#0F172A]">{avail}</strong> / {total} ({percent}%)
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
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* ACTIVE MISSIONS / COORDINATION REQUESTS & PENDING VERIFICATIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Coordination Requests (7 columns) */}
                <div className="lg:col-span-7 bg-white border border-[#CBD5E1] p-4 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                    <div>
                      <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono flex items-center gap-2">
                        <FileSpreadsheet size={14} className="text-[#D97706]" /> ACTIVE MUTUAL AID REQUESTS
                      </h3>
                      <p className="text-[10px] text-[#64748B] font-mono mt-0.5">Inter-agency resource requests & dispatches</p>
                    </div>
                    <Link to="/requests" className="text-[10px] font-mono font-bold text-[#166534] hover:underline uppercase">
                      ALL REQUESTS ({requests.length}) →
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-[11px]">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#475569] text-[10px] uppercase">
                          <th className="py-2 px-2.5 font-bold">REQ ID</th>
                          <th className="py-2 px-2.5 font-bold">REQUESTING AGENCY</th>
                          <th className="py-2 px-2.5 font-bold">REQUIRED RESOURCE</th>
                          <th className="py-2 px-2.5 font-bold">PRIORITY</th>
                          <th className="py-2 px-2.5 font-bold text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {requests.slice(0, 5).map((req) => (
                          <tr key={req.id} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="py-2 px-2.5 font-bold text-[#0F172A]">{req.id}</td>
                            <td className="py-2 px-2.5 text-[#0F172A] font-sans font-semibold">{req.fromName}</td>
                            <td className="py-2 px-2.5 text-[#475569]">{req.required}</td>
                            <td className="py-2 px-2.5">
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border ${
                                req.urgency === 'IMMEDIATE'
                                  ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                                  : req.urgency === 'HIGH'
                                  ? 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]'
                                  : 'bg-[#F0FDF4] text-[#166534] border-[#DCFCE7]'
                              }`}>
                                {req.urgency}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-right font-bold text-[#166534]">
                              {req.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pending Agency Verifications (5 columns) */}
                <div className="lg:col-span-5 bg-white border border-[#CBD5E1] p-4 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                    <div>
                      <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-[#166534]" /> PENDING AGENCY VETTING
                      </h3>
                      <p className="text-[10px] text-[#64748B] font-mono mt-0.5">Authorization queue for new response units</p>
                    </div>
                    <span className="bg-[#FFFBEB] text-[#D97706] text-[10px] font-mono font-bold px-2 py-0.5 border border-[#FEF3C7]">
                      {pendingAgencies.length} PENDING
                    </span>
                  </div>

                  {pendingAgencies.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-[#64748B] font-mono border border-dashed border-[#CBD5E1]">
                      VERIFICATION QUEUE CLEAR. ALL REGISTERED AGENCIES ARE VERIFIED.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingAgencies.map((agency) => (
                        <div 
                          key={agency.id} 
                          className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 flex flex-col justify-between gap-2.5"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] font-bold text-[#64748B] font-mono uppercase">{agency.type}</span>
                              <h4 className="text-xs font-bold text-[#0F172A]">{agency.name}</h4>
                            </div>
                            <span className="text-[9px] text-[#D97706] bg-[#FFFBEB] px-1.5 py-0.5 border border-[#FEF3C7] font-bold font-mono uppercase">
                              VETTING
                            </span>
                          </div>

                          <div className="text-[10px] text-[#475569] font-mono">
                            Base HQ: <span className="text-[#0F172A]">{agency.address}</span>
                          </div>

                          <div className="flex gap-2 pt-1 border-t border-[#E2E8F0]">
                            <button
                              onClick={() => handleApproveAgency(agency.id)}
                              className="flex-1 bg-[#F0F0F0] hover:bg-[#DCFCE7] border border-[#DCFCE7] text-[#166534] text-[11px] font-bold py-1 px-2 transition-colors cursor-pointer flex items-center justify-center gap-1 font-mono"
                            >
                              <Check size={12} /> APPROVE
                            </button>
                            <button
                              onClick={() => handleRejectAgency(agency.id)}
                              className="flex-1 bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-[11px] font-bold py-1 px-2 transition-colors cursor-pointer flex items-center justify-center gap-1 font-mono"
                            >
                              <X size={12} /> REJECT
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* MAP TAB REMOVED — map remains embedded in overview */}

          {/* TAB 3: FULL INCIDENTS LOG */}
          {activeTab === 'incidents' && (
            <div className="bg-white border border-[#CBD5E1] p-5 shadow-2xs space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 flex-wrap gap-2">
                <div>
                  <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">EMERGENCY INCIDENT DATABASE</h2>
                  <p className="text-[10px] text-[#64748B] font-mono mt-0.5">District register of reported disasters, emergency events, and response operations</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] text-[10px] font-mono font-bold px-2.5 py-1">
                    {incidents.length} TOTAL LOGS
                  </span>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-1.5 bg-[#166534] hover:bg-[#14532D] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 transition-colors cursor-pointer font-mono"
                  >
                    <Plus size={12} />
                    REPORT NEW INCIDENT
                  </button>
                </div>
              </div>

              {/* Table list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#475569] text-[10px] uppercase">
                      <th className="py-2.5 px-3 font-bold">LOG ID</th>
                      <th className="py-2.5 px-3 font-bold">INCIDENT TYPE</th>
                      <th className="py-2.5 px-3 font-bold">LOCATION</th>
                      <th className="py-2.5 px-3 font-bold">SEVERITY</th>
                      <th className="py-2.5 px-3 font-bold">STATUS</th>
                      <th className="py-2.5 px-3 font-bold">TIME REPORTED</th>
                      <th className="py-2.5 px-3 font-bold text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {incidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-3 font-bold text-[#475569]">{inc.id}</td>
                        <td className="py-3 px-3 font-bold text-[#0F172A] font-sans">{inc.type}</td>
                        <td className="py-3 px-3 text-[#334155] font-sans">{inc.location}</td>
                        <td className="py-3 px-3">
                          <SeverityBadge severity={inc.severity} showDot={false} />
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider border ${
                            inc.status === 'ACTIVE'
                              ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                              : 'bg-[#F0FDF4] text-[#166534] border-[#DCFCE7]'
                          }`}>
                            {inc.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#64748B]">
                          {new Date(inc.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </td>
                        <td className="py-3 px-3 text-right relative">
                          <button
                            onClick={() => setActionMenuId(actionMenuId === inc.id ? null : inc.id)}
                            className="p-1.5 hover:bg-[#F1F5F9] rounded transition-colors cursor-pointer text-[#64748B] hover:text-[#0F172A]"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {actionMenuId === inc.id && (
                            <div ref={actionMenuRef} className="absolute right-0 top-full mt-1 z-40 bg-white border border-[#CBD5E1] shadow-lg rounded-md py-1 w-44">
                              <button
                                onClick={() => { setActionMenuId(null); navigate(`/incidents/${inc.id}`); }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-[#F8FAFC] cursor-pointer flex items-center gap-2 text-[#334155] font-sans"
                              >
                                <Eye size={13} className="text-[#64748B]" /> View Details
                              </button>
                              {inc.status === 'ACTIVE' && (
                                <button
                                  onClick={() => { setActionMenuId(null); setConfirmAction({ type: 'resolve', incident: inc }); }}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-[#F0FDF4] cursor-pointer flex items-center gap-2 text-[#166534] font-sans"
                                >
                                  <CheckCircle size={13} /> Resolve Incident
                                </button>
                              )}
                              <button
                                onClick={() => { setActionMenuId(null); setConfirmAction({ type: 'delete', incident: inc }); }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-[#FEF2F2] cursor-pointer flex items-center gap-2 text-[#DC2626] font-sans"
                              >
                                <Trash2 size={13} /> Remove from Register
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT NEW INCIDENT MODAL */}
          {showReportModal && (
            <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="REPORT NEW INCIDENT" size="md">
              <form onSubmit={handleReportIncident} className="space-y-4">
                <FormInput
                  id="inc-type"
                  label="Incident Type"
                  placeholder="e.g. Flood, Landslide, Building Collapse"
                  value={newIncident.type}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, type: e.target.value }))}
                  required
                />
                <FormInput
                  id="inc-location"
                  label="Location"
                  placeholder="e.g. Sinhagad Road, Pune"
                  value={newIncident.location}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
                <Dropdown
                  id="inc-severity"
                  label="Severity Level"
                  options={['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']}
                  value={newIncident.severity}
                  onChange={(value) => setNewIncident(prev => ({ ...prev, severity: value }))}
                  required
                />
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={newIncident.description}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide incident details, affected area, estimated casualties..."
                    className="w-full bg-[#F7F5EF] border border-[#E5E7EB] focus:border-[#166534] text-xs rounded-md p-3 text-[#111827] focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 text-xs font-bold text-[#475569] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-md transition-colors cursor-pointer"
                  >
                    REPORT INCIDENT
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* CONFIRM RESOLVE / DELETE MODAL */}
          {confirmAction && (
            <Modal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} title={confirmAction.type === 'resolve' ? 'CONFIRM RESOLUTION' : 'CONFIRM REMOVAL'} size="sm">
              <div className="space-y-4">
                <p className="text-sm text-[#334155]">
                  {confirmAction.type === 'resolve'
                    ? <>Are you sure you want to mark <strong>{confirmAction.incident.type}</strong> at <strong>{confirmAction.incident.location}</strong> as resolved?</>
                    : <>Are you sure you want to permanently remove <strong>{confirmAction.incident.id}</strong> ({confirmAction.incident.type}) from the incident register? This action cannot be undone.</>
                  }
                </p>
                <div className="flex justify-end gap-3 pt-2 border-t border-stone-200">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="px-4 py-2 text-xs font-bold text-[#475569] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => confirmAction.type === 'resolve' ? handleResolveIncident(confirmAction.incident) : handleDeleteIncident(confirmAction.incident)}
                    className={`px-4 py-2 text-xs font-bold text-white rounded-md transition-colors cursor-pointer ${
                      confirmAction.type === 'resolve' ? 'bg-[#166534] hover:bg-[#14532D]' : 'bg-[#DC2626] hover:bg-[#B91C1C]'
                    }`}
                  >
                    {confirmAction.type === 'resolve' ? 'CONFIRM RESOLVE' : 'CONFIRM DELETE'}
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {/* TAB 4: VERIFICATION QUEUE DETAIL */}
          {activeTab === 'verification' && (
            <div className="bg-white border border-[#CBD5E1] p-5 shadow-2xs space-y-4">
              <div className="border-b border-[#E2E8F0] pb-3">
                <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">TACTICAL FORCE VERIFICATION QUEUE</h2>
                <p className="text-[10px] text-[#64748B] font-mono mt-0.5">District credential verification portal for newly registering response units</p>
              </div>

              {pendingAgencies.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#64748B] font-mono uppercase border border-dashed border-[#CBD5E1]">
                  ALL REGISTERING TACTICAL UNITS HAVE BEEN PROCESSED. QUEUE EMPTY.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {pendingAgencies.map((agency) => (
                    <div 
                      key={agency.id} 
                      className="bg-[#F8FAFC] border border-[#CBD5E1] p-4 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-[#64748B] font-bold uppercase">{agency.type}</span>
                            <h3 className="text-sm font-bold text-[#0F172A] mt-0.5">{agency.name}</h3>
                          </div>
                          <span className="text-[9px] text-[#D97706] border border-[#FEF3C7] bg-[#FFFBEB] px-2 py-0.5 font-mono font-bold uppercase">
                            VETTING IN PROGRESS
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#64748B] bg-white border border-[#E2E8F0] p-3">
                          <div>DISTRICT: <span className="text-[#0F172A] font-sans font-medium">{agency.district}</span></div>
                          <div>STATE: <span className="text-[#0F172A] font-sans font-medium">{agency.state}</span></div>
                          <div className="col-span-2">PHONE: <span className="text-[#0F172A]">{agency.phone}</span></div>
                          <div className="col-span-2">EMAIL: <span className="text-[#0F172A]">{agency.email}</span></div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1 font-mono">DECLARED EXPERTISE</span>
                          <div className="flex flex-wrap gap-1">
                            {agency.expertise.map((exp, idx) => (
                              <span key={idx} className="bg-white text-[#334155] text-[10px] font-bold px-2 py-0.5 border border-[#E2E8F0] font-mono">
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 border-t border-[#E2E8F0] pt-3 font-mono">
                        <button
                          onClick={() => handleApproveAgency(agency.id)}
                          className="flex-1 bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#DCFCE7] text-[#166534] text-xs font-bold py-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check size={14} /> APPROVE AGENCY VETTING
                        </button>
                        <button
                          onClick={() => handleRejectAgency(agency.id)}
                          className="bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs font-bold py-2 px-4 transition-colors cursor-pointer flex items-center justify-center"
                          title="Reject Credentials"
                        >
                          <X size={14} />
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
            <ActivityLogTab activity={activity} user={currentUser} />
          )}

        </main>
      </div>
    </div>
  );
}
