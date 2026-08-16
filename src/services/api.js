import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// ============================================================
// SAMANVAY — Frontend API Service Layer
// Communicates with Express Backend with Automatic Local Fallback
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

async function fetchWithFallback(url, options = {}, localStorageKey = null, defaultFallback = null) {
  try {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`[SAMANVAY API] Backend unreachable at ${url}, falling back to localStorage:`, err.message);

    if (localStorageKey) {
      const cached = localStorage.getItem(localStorageKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return defaultFallback;
        }
      }
    }
    return defaultFallback;
  }
}

export const api = {
  // --- AUTHENTICATION ---
  auth: {
    login: async (credentials) => {
      const mockUsers = [
        {
          id: 'USR-001',
          name: 'Priya Desai (EOC Officer)',
          email: 'collector.pune@gmail.com',
          password: '123456',
          role: 'district_eoc',
          district: 'Pune',
          state: 'Maharashtra',
          jurisdiction: 'Pune District'
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
      ];

      const { email, password, role } = credentials;
      const found = mockUsers.find(u => u.email === email && u.password === password);
      
      let success = false;
      let error = 'Invalid credentials. Please try again.';
      let user = null;
      
      if (found) {
        if (role && found.role !== role) {
          if (role === 'district_eoc') {
            error = 'Invalid District EOC credentials.';
          } else if (role === 'agency_admin') {
            error = 'Invalid Rescue Agency credentials.';
          } else {
            error = 'Invalid credentials for selected role.';
          }
        } else {
          success = true;
          user = found;
        }
      } else {
        if (role === 'district_eoc') {
          error = 'Invalid District EOC credentials.';
        } else if (role === 'agency_admin') {
          error = 'Invalid Rescue Agency credentials.';
        }
      }

      const fallbackResponse = success 
        ? { success: true, user, token: `samanvay_jwt_${btoa(JSON.stringify(user))}` }
        : { success: false, error };

      const res = await fetchWithFallback('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }, null, fallbackResponse);

      if (res?.success && res?.user) {
        localStorage.setItem('samanvay_role', res.user.role);
        localStorage.setItem('samanvay_user', JSON.stringify(res.user));
        localStorage.setItem('samanvay_token', res.token);
      }
      return res;
    }
  },

  // --- AGENCIES ---
  agencies: {
    getAll: async (filters = {}) => {
      try {
        const snapshot = await getDocs(collection(db, 'agencies'));
        const agencies = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        if (agencies.length > 0) {
          localStorage.setItem('samanvay_agencies', JSON.stringify(agencies));
        }
        return agencies;
      } catch (err) {
        console.error('Firestore fallback failed for getAll agencies', err);
        const cached = localStorage.getItem('samanvay_agencies');
        return cached ? JSON.parse(cached) : [];
      }
    },

    getById: async (id) => {
      try {
        const docRef = doc(db, 'agencies', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        }
      } catch(e) { console.warn('Firestore fallback', e); }
      const cached = localStorage.getItem('samanvay_agencies');
      if (cached) {
        const list = JSON.parse(cached);
        return list.find(a => a.id === id) || null;
      }
      return null;
    },

    register: async (agencyData) => {
      const res = await fetchWithFallback(
        '/agencies/register',
        {
          method: 'POST',
          body: JSON.stringify(agencyData)
        },
        null,
        null
      );

      // NOTE: localStorage write is handled by RegisterAgencyPage directly.
      // This method only dispatches to backend API.
      // Do NOT duplicate-push to localStorage here.

      const newAgency = res?.agency || {
        ...agencyData,
        id: agencyData.id || `AG-${Date.now()}`,
        verificationStatus: 'PENDING',
        status: 'PENDING_VERIFICATION',
        submittedAt: new Date().toISOString()
      };

      return res || { success: true, agency: newAgency };
    },

    verify: async (id, status, verifierName = 'Priya Desai (EOC)') => {
      const res = await fetchWithFallback(
        `/agencies/${id}/verify`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, verifierName })
        },
        null,
        null
      );

      // Sync local storage — when VERIFIED, also set operational status to AVAILABLE
      const cached = localStorage.getItem('samanvay_agencies');
      if (cached) {
        let list = JSON.parse(cached);
        list = list.map(a => a.id === id ? {
          ...a,
          verificationStatus: status,
          status: status === 'VERIFIED' ? 'AVAILABLE' : (status === 'REJECTED' ? 'REJECTED' : a.status),
          verifiedAt: new Date().toISOString().split('T')[0]
        } : a);
        localStorage.setItem('samanvay_agencies', JSON.stringify(list));
      }

      return res;
    },

    updateResources: async (id, resources) => {
      return await fetchWithFallback(
        `/agencies/${id}/resources`,
        {
          method: 'PATCH',
          body: JSON.stringify({ resources })
        }
      );
    }
  },

  // --- COORDINATION REQUESTS ---
  requests: {
    getAll: async (filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      const res = await fetchWithFallback(
        `/requests${query ? `?${query}` : ''}`,
        { method: 'GET' },
        'samanvay_requests',
        { requests: [] }
      );
      const requests = Array.isArray(res) ? res : (res?.requests || []);
      if (requests.length > 0) {
        localStorage.setItem('samanvay_requests', JSON.stringify(requests));
      }
      return requests;
    },

    create: async (requestData) => {
      const res = await fetchWithFallback(
        '/requests',
        {
          method: 'POST',
          body: JSON.stringify(requestData)
        },
        null,
        null
      );

      const isEscalated = requestData.type === 'escalated';
      const newReq = res?.request || {
        ...requestData,
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        status: isEscalated ? 'PENDING_APPROVAL' : 'INITIATED',
        createdAt: new Date().toISOString(),
        approvedBy: null,
        approvedAt: null
      };

      const cached = localStorage.getItem('samanvay_requests');
      let list = cached ? JSON.parse(cached) : [];
      list.unshift(newReq);
      localStorage.setItem('samanvay_requests', JSON.stringify(list));

      return res || { success: true, request: newReq };
    },

    updateStatus: async (id, status, actor, updates = {}) => {
      const res = await fetchWithFallback(
        `/requests/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, actor, updates })
        },
        null,
        null
      );

      const cached = localStorage.getItem('samanvay_requests');
      if (cached) {
        let list = JSON.parse(cached);
        list = list.map(r => r.id === id ? { ...r, status, ...updates } : r);
        localStorage.setItem('samanvay_requests', JSON.stringify(list));
      }

      return res;
    }
  },

  // --- INCIDENTS ---
  incidents: {
    getAll: async () => {
      const res = await fetchWithFallback(
        '/incidents',
        { method: 'GET' },
        'samanvay_incidents',
        { incidents: [] }
      );
      const incidents = Array.isArray(res) ? res : (res?.incidents || []);
      if (incidents.length > 0) {
        localStorage.setItem('samanvay_incidents', JSON.stringify(incidents));
      }
      return incidents;
    },

    getById: async (id) => {
      const res = await fetchWithFallback(
        `/incidents/${id}`,
        { method: 'GET' },
        null,
        null
      );
      if (res?.incident) return res.incident;

      const cached = localStorage.getItem('samanvay_incidents');
      if (cached) {
        const list = JSON.parse(cached);
        return list.find(i => i.id === id) || null;
      }
      return null;
    },

    create: async (incidentData) => {
      const res = await fetchWithFallback(
        '/incidents',
        {
          method: 'POST',
          body: JSON.stringify(incidentData)
        },
        null,
        null
      );

      const newInc = res?.incident || {
        ...incidentData,
        id: `INC-0${Math.floor(6 + Math.random() * 94)}`,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        timeline: [
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: 'Incident Reported', status: 'done', actor: incidentData.reportedBy || 'System' }
        ]
      };

      const cached = localStorage.getItem('samanvay_incidents');
      let list = cached ? JSON.parse(cached) : [];
      list.push(newInc);
      localStorage.setItem('samanvay_incidents', JSON.stringify(list));

      return res || { success: true, incident: newInc };
    },

    resolve: async (id, actor) => {
      const res = await fetchWithFallback(
        `/incidents/${id}/resolve`,
        {
          method: 'PATCH',
          body: JSON.stringify({ actor })
        },
        null,
        null
      );

      const cached = localStorage.getItem('samanvay_incidents');
      if (cached) {
        let list = JSON.parse(cached);
        list = list.map(i => {
          if (i.id === id) {
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return {
              ...i,
              status: 'RESOLVED',
              resolvedAt: new Date().toISOString(),
              timeline: [
                ...(i.timeline || []),
                { time: timeStr, event: 'Incident Resolved', status: 'done', actor }
              ]
            };
          }
          return i;
        });
        localStorage.setItem('samanvay_incidents', JSON.stringify(list));
      }

      return res || { success: true };
    },

    delete: async (id, actor) => {
      const res = await fetchWithFallback(
        `/incidents/${id}?actor=${encodeURIComponent(actor)}`,
        { method: 'DELETE' },
        null,
        null
      );

      const cached = localStorage.getItem('samanvay_incidents');
      if (cached) {
        let list = JSON.parse(cached);
        list = list.filter(i => i.id !== id);
        localStorage.setItem('samanvay_incidents', JSON.stringify(list));
      }

      return res || { success: true };
    }
  },

  // --- RESOURCES & AUDIT ---
  resources: {
    getAll: async () => {
      const res = await fetchWithFallback(
        '/resources',
        { method: 'GET' },
        'samanvay_resources',
        { resources: [] }
      );
      return Array.isArray(res) ? res : (res?.resources || []);
    }
  },

  activity: {
    getAll: async () => {
      const res = await fetchWithFallback(
        '/activity',
        { method: 'GET' },
        'samanvay_activity',
        { activity: [] }
      );
      return Array.isArray(res) ? res : (res?.activity || []);
    },

    getNotifications: async () => {
      const res = await fetchWithFallback(
        '/activity/notifications',
        { method: 'GET' },
        'samanvay_notifications',
        { notifications: [] }
      );
      return Array.isArray(res) ? res : (res?.notifications || []);
    }
  }
};
