import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, ShieldAlert, Laptop, Eye, HelpCircle } from 'lucide-react';
import NotificationPanel from '../ui/NotificationPanel';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';

export default function TopHeader({ title = 'Pune District' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [simulatedRole, setSimulatedRole] = useState('authority');

  // Load state
  useEffect(() => {
    // Determine active role based on URL or localStorage
    const path = location.pathname;
    let role = 'public';
    if (path.startsWith('/authority')) {
      role = 'authority';
    } else if (path.startsWith('/agency')) {
      role = 'agency';
    } else if (path === '/resources' || path === '/requests' || path.startsWith('/incidents')) {
      // Shared views default to active role
      role = localStorage.getItem('samanvay_role') || 'authority';
    } else if (path === '/' || path === '/agencies' || path.startsWith('/agencies/')) {
      role = localStorage.getItem('samanvay_role') || 'public';
    }
    setSimulatedRole(role);
    localStorage.setItem('samanvay_role', role);

    // Load mock notifications
    const stored = localStorage.getItem('samanvay_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications(MOCK_NOTIFICATIONS);
      localStorage.setItem('samanvay_notifications', JSON.stringify(MOCK_NOTIFICATIONS));
    }
  }, [location.pathname]);

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSimulatedRole(role);
    localStorage.setItem('samanvay_role', role);
    
    if (role === 'authority') {
      navigate('/authority/dashboard');
    } else if (role === 'agency') {
      navigate('/agency/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('samanvay_notifications', JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-[#faf9f6] border-b border-stone-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Status */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{title}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600 status-pulse"></span>
            <span className="text-[10px] font-semibold text-green-700 uppercase tracking-widest">SYSTEM OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Center/Right Simulation tools & Profile */}
      <div className="flex items-center gap-4">
        {/* Simulation Role Selector */}
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded px-2.5 py-1 text-xs">
          <Laptop size={12} className="text-teal-700" />
          <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Simulation Mode:</span>
          <select
            value={simulatedRole}
            onChange={handleRoleChange}
            className="bg-transparent text-teal-700 font-bold focus:outline-none cursor-pointer text-xs"
          >
            <option value="authority" className="bg-white text-stone-700">District Authority (EOC)</option>
            <option value="agency" className="bg-white text-stone-700">Rescue Agency (SDRF)</option>
            <option value="public" className="bg-white text-stone-700">Public Observer View</option>
          </select>
        </div>

        {/* Info Box */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-500 bg-white border border-stone-200 rounded px-2.5 py-1 select-none font-mono">
          <HelpCircle size={12} className="text-stone-500" />
          <span>Fictional Prototype</span>
        </div>

        {/* Notifications Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded border transition-all ${
              showNotifications 
                ? 'bg-teal-50 border-teal-200 text-teal-700' 
                : 'bg-white border-stone-200 hover:border-stone-300 text-stone-500 hover:text-stone-900'
            }`}
          >
            <div className="relative">
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-teal-600 rounded-full animate-ping" />
              )}
            </div>
          </button>
          
          {showNotifications && (
            <NotificationPanel
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
