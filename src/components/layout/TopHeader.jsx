import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Laptop, HelpCircle } from 'lucide-react';
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
    <header className="h-16 bg-[#F7F5EF] border-b border-[#E5E7EB] px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Title & Operational Status */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-bold text-[#111827] uppercase tracking-wider">{title} EOC</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-[#166534] status-pulse"></span>
            <span className="text-[10px] font-bold text-[#166534] uppercase tracking-widest">SYSTEM OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Role Switcher & Notifications */}
      <div className="flex items-center gap-4">
        {/* Simulation Role Selector */}
        <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-md px-3 py-1.5 text-xs shadow-2xs">
          <Laptop size={14} className="text-[#166534]" />
          <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Role View:</span>
          <select
            value={simulatedRole}
            onChange={handleRoleChange}
            className="bg-transparent text-[#166534] font-bold focus:outline-none cursor-pointer text-xs"
          >
            <option value="authority" className="bg-white text-[#111827]">District Authority (EOC)</option>
            <option value="agency" className="bg-white text-[#111827]">Rescue Agency (SDRF)</option>
            <option value="public" className="bg-white text-[#111827]">Public Observer View</option>
          </select>
        </div>

        {/* Prototype Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#64748B] bg-white border border-[#E5E7EB] rounded-md px-3 py-1.5 font-mono shadow-2xs">
          <HelpCircle size={14} className="text-[#64748B]" />
          <span>Government Prototype</span>
        </div>

        {/* Notifications Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-md border transition-all cursor-pointer ${
              showNotifications 
                ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#166534]' 
                : 'bg-white border-[#E5E7EB] hover:border-[#CBD5E1] text-[#64748B] hover:text-[#111827] shadow-2xs'
            }`}
          >
            <div className="relative">
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#DC2626] rounded-full animate-ping" />
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
