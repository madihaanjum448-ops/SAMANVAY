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
    <header className="h-16 bg-navy-950 border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Status */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 status-pulse"></span>
            <span className="text-[10px] font-semibold text-green-400 uppercase tracking-widest">SYSTEM OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Center/Right Simulation tools & Profile */}
      <div className="flex items-center gap-4">
        {/* Simulation Role Selector */}
        <div className="flex items-center gap-2 bg-[#0f1c35] border border-slate-800/80 rounded px-2.5 py-1 text-xs">
          <Laptop size={12} className="text-cyan-400" />
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Simulation Mode:</span>
          <select
            value={simulatedRole}
            onChange={handleRoleChange}
            className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer text-xs"
          >
            <option value="authority" className="bg-navy-900 text-slate-300">District Authority (EOC)</option>
            <option value="agency" className="bg-navy-900 text-slate-300">Rescue Agency (SDRF)</option>
            <option value="public" className="bg-navy-900 text-slate-300">Public Observer View</option>
          </select>
        </div>

        {/* Info Box */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-[#0f1c35]/50 border border-slate-800/40 rounded px-2.5 py-1 select-none font-mono">
          <HelpCircle size={12} className="text-slate-500" />
          <span>Fictional Prototype</span>
        </div>

        {/* Notifications Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded border transition-all ${
              showNotifications 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                : 'bg-navy-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
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
