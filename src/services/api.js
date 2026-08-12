// ============================================================
// SAMANVAY — Frontend API Service Layer
// Communicates with Express Backend with Automatic Local Fallback
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      const res = await fetchWithFallback('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }, null, {
        success: true,
        user: { role: credentials.role || 'authority', district: 'Pune' }
      });
      if (res?.user) {
        localStorage.setItem('samanvay_role', res.user.role);
        localStorage.setItem('samanvay_user', JSON.stringify(res.user));
      }
      return res;
    }
  },

  // --- AGENCIES ---
  agencies: {
    getAll: async (filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      const res = await fetchWithFallback(
        `/agencies${query ? `?${query}` : ''}`,
        { method: 'GET' },
        'samanvay_agencies',
        { agencies: [] }
      );
      // Handle both backend envelope { agencies: [...] } and raw array fallback
      const agencies = Array.isArray(res) ? res : (res?.agencies || []);
      // Keep local storage updated
      if (agencies.length > 0) {
        localStorage.setItem('samanvay_agencies', JSON.stringify(agencies));
      }
      return agencies;
    },

    getById: async (id) => {
      const res = await fetchWithFallback(
        `/agencies/${id}`,
        { method: 'GET' },
        null,
        null
      );
      if (res?.agency) return res.agency;

      // Fallback search in localStorage
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

      // Also persist to local cache
      const newAgency = res?.agency || {
        ...agencyData,
        id: `AG-${Date.now()}`,
        verificationStatus: 'PENDING',
        submittedAt: new Date().toISOString()
      };

      const cached = localStorage.getItem('samanvay_agencies');
      let list = cached ? JSON.parse(cached) : [];
      list.push(newAgency);
      localStorage.setItem('samanvay_agencies', JSON.stringify(list));

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

      // Sync local storage
      const cached = localStorage.getItem('samanvay_agencies');
      if (cached) {
        let list = JSON.parse(cached);
        list = list.map(a => a.id === id ? { ...a, verificationStatus: status, verifiedAt: new Date().toISOString().split('T')[0] } : a);
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

      const newReq = res?.request || {
        ...requestData,
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'INITIATED',
        createdAt: new Date().toISOString()
      };

      const cached = localStorage.getItem('samanvay_requests');
      let list = cached ? JSON.parse(cached) : [];
      list.unshift(newReq);
      localStorage.setItem('samanvay_requests', JSON.stringify(list));

      return res || { success: true, request: newReq };
    },

    updateStatus: async (id, status, actor) => {
      const res = await fetchWithFallback(
        `/requests/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, actor })
        },
        null,
        null
      );

      const cached = localStorage.getItem('samanvay_requests');
      if (cached) {
        let list = JSON.parse(cached);
        list = list.map(r => r.id === id ? { ...r, status } : r);
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
