import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { store } from './db/store.js';

import authRoutes from './routes/auth.js';
import agencyRoutes from './routes/agencies.js';
import requestRoutes from './routes/requests.js';
import incidentRoutes from './routes/incidents.js';
import resourceRoutes from './routes/resources.js';
import activityRoutes from './routes/activity.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize database
await store.init();

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/activity', activityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'SAMANVAY Unified Coordination Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    stats: {
      totalAgencies: store.data.agencies.length,
      verifiedAgencies: store.data.agencies.filter(a => a.verificationStatus === 'VERIFIED').length,
      pendingAgencies: store.data.agencies.filter(a => a.verificationStatus === 'PENDING').length,
      activeIncidents: store.data.incidents.filter(i => i.status === 'ACTIVE').length,
      coordinationRequests: store.data.requests.length
    }
  });
});

// Root handler
app.get('/', (req, res) => {
  res.send('SAMANVAY Disaster Coordination API is running. Access /api/health for system status.');
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ======================================================
  🚀 SAMANVAY Backend Engine is LIVE on port ${PORT}
  📍 Health: http://localhost:${PORT}/api/health
  📍 Agencies: http://localhost:${PORT}/api/agencies
  📍 Requests: http://localhost:${PORT}/api/requests
  📍 Incidents: http://localhost:${PORT}/api/incidents
  ======================================================
  `);
});
