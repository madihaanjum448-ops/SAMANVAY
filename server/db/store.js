import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_AGENCIES,
  INITIAL_INCIDENTS,
  INITIAL_REQUESTS,
  INITIAL_RESOURCES,
  INITIAL_ACTIVITY,
  INITIAL_NOTIFICATIONS
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'samanvay_db.json');

class DataStore {
  constructor() {
    this.data = {
      agencies: [],
      incidents: [],
      requests: [],
      resources: [],
      activity: [],
      notifications: [],
      users: [
        {
          id: 'USR-001',
          name: 'Priya Desai (EOC Officer)',
          email: 'collector.pune@gmail.com',
          password: '123456',
          role: 'district_eoc',
          district: 'Pune',
          state: 'Maharashtra',
          jurisdiction: 'Pune District',
          status: 'active'
        },
        {
          id: 'USR-002',
          name: 'Capt. Rajesh V. (SDRF Commander)',
          email: 'agency@samanvay.gov.in',
          password: 'password123',
          role: 'agency_admin',
          agencyId: 'AG-002',
          district: 'Pune',
          state: 'Maharashtra',
          jurisdiction: 'Pune District'
        },
        {
          id: 'USR-003',
          name: 'Shri A. K. Sharma (State Director)',
          email: 'state@samanvay.gov.in',
          password: 'password123',
          role: 'state_authority',
          scope: 'state',
          state: 'Maharashtra',
          district: '',
          jurisdiction: 'Maharashtra State'
        },
        {
          id: 'USR-004',
          name: 'Dr. N. G. Rao (National Chairman)',
          email: 'national@samanvay.gov.in',
          password: 'password123',
          role: 'state_authority',
          scope: 'national',
          state: '',
          district: '',
          jurisdiction: 'National EOC'
        }
      ]
    };
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const raw = await fs.readFile(DB_FILE, 'utf-8');
      this.data = JSON.parse(raw);
      console.log('📦 SAMANVAY DB: Loaded existing database file.');
    } catch (err) {
      console.log('🌱 SAMANVAY DB: Initializing with seed dataset...');
      this.data.agencies = [...INITIAL_AGENCIES];
      this.data.incidents = [...INITIAL_INCIDENTS];
      this.data.requests = [...INITIAL_REQUESTS];
      this.data.resources = [...INITIAL_RESOURCES];
      this.data.activity = [...INITIAL_ACTIVITY];
      this.data.notifications = [...INITIAL_NOTIFICATIONS];
      await this.persist();
    }
    this.ensureDemoUsers();
    this.initialized = true;
  }

  ensureDemoUsers() {
    const demoUsers = [
      {
        id: 'USR-001',
        name: 'Priya Desai (EOC Officer)',
        email: 'collector.pune@gmail.com',
        password: '123456',
        role: 'district_eoc',
        district: 'Pune',
        state: 'Maharashtra',
        jurisdiction: 'Pune District',
        status: 'active'
      },
      {
        id: 'USR-002',
        name: 'Capt. Rajesh V. (SDRF Commander)',
        email: 'agency@samanvay.gov.in',
        password: 'password123',
        role: 'agency_admin',
        agencyId: 'AG-002',
        district: 'Pune',
        state: 'Maharashtra',
        jurisdiction: 'Pune District',
        status: 'active'
      },
      {
        id: 'USR-003',
        name: 'Shri A. K. Sharma (State Director)',
        email: 'state@samanvay.gov.in',
        password: 'password123',
        role: 'state_authority',
        scope: 'state',
        state: 'Maharashtra',
        district: '',
        jurisdiction: 'Maharashtra State',
        status: 'active'
      },
      {
        id: 'USR-004',
        name: 'Dr. N. G. Rao (National Chairman)',
        email: 'national@samanvay.gov.in',
        password: 'password123',
        role: 'state_authority',
        scope: 'national',
        state: '',
        district: '',
        jurisdiction: 'National EOC',
        status: 'active'
      }
    ];

    if (!Array.isArray(this.data.users)) {
      this.data.users = [];
    }

    let changed = false;
    for (const demo of demoUsers) {
      const idx = this.data.users.findIndex(u => u.email === demo.email);
      if (idx >= 0) {
        this.data.users[idx] = { ...this.data.users[idx], ...demo };
        changed = true;
      } else {
        this.data.users.push(demo);
        changed = true;
      }
    }

    if (changed) {
      this.persist();
    }
  }

  async persist() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ Failed to persist SAMANVAY database:', err);
    }
  }

  // --- AGENCIES ---
  getAgencies(filter = {}) {
    return this.data.agencies.filter(a => {
      if (filter.verificationStatus && a.verificationStatus !== filter.verificationStatus) {
        return false;
      }
      if (filter.district && a.district.toLowerCase() !== filter.district.toLowerCase()) {
        return false;
      }
      if (filter.type && a.type !== filter.type) {
        return false;
      }
      if (filter.status && a.status !== filter.status) {
        return false;
      }
      return true;
    });
  }

  getAgencyById(id) {
    return this.data.agencies.find(a => a.id === id);
  }

  async addAgency(agencyPayload) {
    const id = agencyPayload.id || `AG-${String(this.data.agencies.length + 1).padStart(3, '0')}`;
    const newAgency = {
      ...agencyPayload,
      id,
      verificationStatus: 'PENDING',
      verifiedAt: null,
      verifiedBy: null,
      submittedAt: new Date().toISOString(),
      activeIncidents: 0,
      totalMissions: 0
    };

    this.data.agencies.push(newAgency);

    // Add activity log and notification
    this.addActivity({
      type: 'verification',
      action: 'Agency Registration Received',
      detail: `${newAgency.name} (${newAgency.type}) submitted for district verification`,
      actor: 'Public Portal',
      severity: null
    });

    this.addNotification({
      type: 'alert',
      title: 'New Agency Registration',
      message: `${newAgency.name} submitted for verification in ${newAgency.district}.`
    });

    await this.persist();
    return newAgency;
  }

  async verifyAgency(id, status, verifierName = 'District Collector / EOC Officer') {
    const agency = this.getAgencyById(id);
    if (!agency) return null;

    agency.verificationStatus = status; // 'VERIFIED' | 'REJECTED'
    if (status === 'VERIFIED') {
      agency.verifiedAt = new Date().toISOString().split('T')[0];
      agency.verifiedBy = verifierName;
    }

    this.addActivity({
      type: 'verification',
      action: status === 'VERIFIED' ? 'Agency Verified' : 'Agency Rejected',
      detail: `${agency.name} status updated to ${status}`,
      actor: verifierName,
      severity: null
    });

    this.addNotification({
      type: status === 'VERIFIED' ? 'system' : 'alert',
      title: `Agency ${status}`,
      message: `${agency.name} has been ${status.toLowerCase()} for emergency deployment.`
    });

    await this.persist();
    return agency;
  }

  async updateAgencyResources(id, resources) {
    const agency = this.getAgencyById(id);
    if (!agency) return null;

    agency.resources = { ...agency.resources, ...resources };
    agency.lastUpdated = 'Just now';
    await this.persist();
    return agency;
  }

  // --- COORDINATION REQUESTS (CAP-Lite) ---
  getRequests(filter = {}) {
    return this.data.requests.filter(r => {
      if (filter.from && r.from !== filter.from) return false;
      if (filter.to && r.to !== filter.to) return false;
      if (filter.status && r.status !== filter.status) return false;
      if (filter.incident && r.incident !== filter.incident) return false;
      return true;
    });
  }

  getRequestById(id) {
    return this.data.requests.find(r => r.id === id);
  }

  async addRequest(reqPayload) {
    const id = reqPayload.id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const initialStatus = reqPayload.status || 'INITIATED';
    const newRequest = {
      ...reqPayload,
      id,
      status: initialStatus,
      createdAt: now.toISOString(),
      acknowledgedAt: null,
      deployedAt: null,
      resolvedAt: null,
      timeline: [
        { status: initialStatus, time: timeStr, done: true },
        { status: 'ACKNOWLEDGED', time: null, done: false },
        { status: 'DEPLOYED', time: null, done: false },
        { status: 'RESOLVED', time: null, done: false }
      ]
    };

    this.data.requests.unshift(newRequest);

    this.addActivity({
      type: 'request',
      action: 'Coordination Request Dispatched',
      detail: `${newRequest.id}: ${newRequest.fromName || newRequest.from} ➔ ${newRequest.toName || newRequest.to} (${newRequest.required})`,
      actor: newRequest.fromName || 'Field Unit',
      severity: newRequest.urgency === 'IMMEDIATE' ? 'CRITICAL' : 'HIGH'
    });

    this.addNotification({
      type: 'request',
      title: 'New Coordination Request',
      message: `${newRequest.required} requested for ${newRequest.incidentLabel || 'Incident'}.`
    });

    await this.persist();
    return newRequest;
  }

  async updateRequestStatus(id, newStatus, actor = 'Agency Dispatcher', updates = {}) {
    const req = this.getRequestById(id);
    if (!req) return null;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    req.status = newStatus;

    // Apply additional fields
    Object.assign(req, updates);

    if (newStatus === 'ACKNOWLEDGED') req.acknowledgedAt = now.toISOString();
    if (newStatus === 'DEPLOYED') req.deployedAt = now.toISOString();
    if (newStatus === 'RESOLVED') req.resolvedAt = now.toISOString();
    if (newStatus === 'APPROVED') req.approvedAt = now.toISOString();

    // Update timeline step
    let timelineStep = req.timeline.find(t => t.status === newStatus);
    if (timelineStep) {
      timelineStep.time = timeStr;
      timelineStep.done = true;
    } else {
      req.timeline.push({ status: newStatus, time: timeStr, done: true });
    }

    this.addActivity({
      type: 'request',
      action: `Request ${newStatus}`,
      detail: `${req.id} transitioned to ${newStatus} (${req.required})`,
      actor: actor,
      severity: null
    });

    this.addNotification({
      type: 'request',
      title: `Request ${newStatus}`,
      message: `${req.id} (${req.required}) status is now ${newStatus}.`
    });

    await this.persist();
    return req;
  }

  // --- INCIDENTS ---
  getIncidents() {
    return this.data.incidents;
  }

  getIncidentById(id) {
    return this.data.incidents.find(i => i.id === id);
  }

  generateIncidentId() {
    const maxNum = this.data.incidents.reduce((max, inc) => {
      const num = parseInt(String(inc.id).replace('INC-', ''), 10);
      return Number.isFinite(num) && num > max ? num : max;
    }, 0);
    return `INC-${String(maxNum + 1).padStart(3, '0')}`;
  }

  async addIncident(incPayload) {
    const id = incPayload.id || this.generateIncidentId();
    const now = new Date();
    const newIncident = {
      ...incPayload,
      id,
      status: incPayload.status || 'ACTIVE',
      state: incPayload.state || 'Maharashtra',
      district: incPayload.district || 'Pune',
      reportedBy: incPayload.reportedBy || 'District EOC',
      reportedAt: incPayload.reportedAt || now.toISOString(),
      createdAt: incPayload.createdAt || now.toISOString(),
      resolvedAt: null,
      coordinates: incPayload.coordinates || [18.5204, 73.8567],
      assignedAgencies: incPayload.assignedAgencies || [],
      timeline: [
        {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: 'Incident Reported',
          status: 'done',
          actor: incPayload.reportedBy || 'District EOC'
        }
      ]
    };
    this.data.incidents.unshift(newIncident);

    this.addActivity({
      type: 'incident',
      action: 'Incident Reported',
      detail: `Incident ${id} reported — ${newIncident.type} at ${newIncident.location}`,
      actor: newIncident.reportedBy,
      severity: newIncident.severity,
      incidentId: id
    });

    await this.persist();
    return newIncident;
  }

  async resolveIncident(id, actor = 'District EOC') {
    const incident = this.getIncidentById(id);
    if (!incident) return null;

    const now = new Date();
    incident.status = 'RESOLVED';
    incident.resolvedAt = now.toISOString();
    incident.timeline = incident.timeline || [];
    incident.timeline.push({
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      event: 'Incident Resolved',
      status: 'done',
      actor
    });

    this.addActivity({
      type: 'incident',
      action: 'Incident Resolved',
      detail: `Incident ${id} marked as resolved`,
      actor,
      incidentId: id
    });

    await this.persist();
    return incident;
  }

  async deleteIncident(id, actor = 'District EOC') {
    const idx = this.data.incidents.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const [removed] = this.data.incidents.splice(idx, 1);

    this.addActivity({
      type: 'incident',
      action: 'Incident Removed',
      detail: `Incident ${id} removed from incident database`,
      actor,
      incidentId: id
    });

    await this.persist();
    return removed;
  }

  // --- RESOURCES & AUDIT LOGS ---
  getResources() {
    return this.data.resources;
  }

  getActivityLogs() {
    return this.data.activity;
  }

  getNotifications() {
    return this.data.notifications;
  }

  addActivity(item) {
    const now = new Date();
    this.data.activity.unshift({
      id: Date.now() + Math.random(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: item.timestamp || now.toISOString(),
      ...item
    });
  }

  addNotification(item) {
    this.data.notifications.unshift({
      id: Date.now() + Math.random(),
      time: 'Just now',
      read: false,
      ...item
    });
  }
}

export const store = new DataStore();
