import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterAgencyPage from './pages/RegisterAgencyPage';
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import AgencyDashboard from './pages/agency/AgencyDashboard';
import AgencyDirectory from './pages/AgencyDirectory';
import AgencyDetails from './pages/AgencyDetails';
import ResourceInventory from './pages/ResourceInventory';
import CoordinationRequests from './pages/CoordinationRequests';
import IncidentDetails from './pages/IncidentDetails';

// Import fallback/initial mock lists to prepopulate localStorage
import { 
  MOCK_AGENCIES, 
  MOCK_INCIDENTS, 
  MOCK_REQUESTS, 
  RESOURCE_INVENTORY, 
  MOCK_ACTIVITY_LOG,
  MOCK_NOTIFICATIONS
} from './data/mockData';

export default function App() {
  
  // Prepopulate mock data in localStorage once at startup
  useEffect(() => {
    const seedStorage = (key, data) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    };

    seedStorage('samanvay_agencies', MOCK_AGENCIES);
    seedStorage('samanvay_incidents', MOCK_INCIDENTS);
    seedStorage('samanvay_requests', MOCK_REQUESTS);
    seedStorage('samanvay_resources', RESOURCE_INVENTORY);
    seedStorage('samanvay_activity', MOCK_ACTIVITY_LOG);
    seedStorage('samanvay_notifications', MOCK_NOTIFICATIONS);
    
    // Set default simulation role to authority if not present
    if (!localStorage.getItem('samanvay_role')) {
      localStorage.setItem('samanvay_role', 'authority');
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Landing & Observer directory */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register-agency" element={<RegisterAgencyPage />} />
        
        {/* Core directory / search map */}
        <Route path="/agencies" element={<AgencyDirectory />} />
        <Route path="/agencies/:id" element={<AgencyDetails />} />
        
        {/* Command center layouts */}
        <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
        <Route path="/agency/dashboard" element={<AgencyDashboard />} />
        
        {/* Shared ledgers */}
        <Route path="/resources" element={<ResourceInventory />} />
        <Route path="/requests" element={<CoordinationRequests />} />
        <Route path="/incidents/:id" element={<IncidentDetails />} />
      </Routes>
    </Router>
  );
}