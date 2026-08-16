import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Route Guard Component
function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem('samanvay_role');
  const userStr = localStorage.getItem('samanvay_user');

  if (!userStr || !role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'agency_admin') {
      return <Navigate to="/agency/dashboard" replace />;
    } else if (role === 'district_eoc' || role === 'state_authority') {
      return <Navigate to="/authority/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

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
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Landing & Observer directory */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register-agency" element={<RegisterAgencyPage />} />
        
        {/* Core directory / search map (Protected) */}
        <Route 
          path="/agencies" 
          element={
            <ProtectedRoute allowedRoles={['agency_admin', 'district_eoc', 'state_authority']}>
              <AgencyDirectory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agencies/:id" 
          element={
            <ProtectedRoute allowedRoles={['agency_admin', 'district_eoc', 'state_authority']}>
              <AgencyDetails />
            </ProtectedRoute>
          } 
        />
        
        {/* Command center layouts (Protected) */}
        <Route 
          path="/authority/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['district_eoc', 'state_authority']}>
              <AuthorityDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agency/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['agency_admin']}>
              <AgencyDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Shared ledgers (Protected) */}
        <Route 
          path="/resources" 
          element={
            <ProtectedRoute allowedRoles={['agency_admin', 'district_eoc', 'state_authority']}>
              <ResourceInventory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/requests" 
          element={
            <ProtectedRoute allowedRoles={['agency_admin', 'district_eoc', 'state_authority']}>
              <CoordinationRequests />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/incidents/:id" 
          element={
            <ProtectedRoute allowedRoles={['agency_admin', 'district_eoc', 'state_authority']}>
              <IncidentDetails />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}