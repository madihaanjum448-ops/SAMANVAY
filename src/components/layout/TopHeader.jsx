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

  // Load authenticated user profile
  const userStr = localStorage.getItem('samanvay_user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    // Load mock notifications
    const stored = localStorage.getItem('samanvay_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications(MOCK_NOTIFICATIONS);
      localStorage.setItem('samanvay_notifications', JSON.stringify(MOCK_NOTIFICATIONS));
    }
  }, [location.pathname]);

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
          <h1 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
            {user?.jurisdiction ? user.jurisdiction : `${title} EOC`}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-[#166534] status-pulse"></span>
            <span className="text-[10px] font-bold text-[#166534] uppercase tracking-widest">SYSTEM OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Role Badge & Notifications */}
      <div className="flex items-center gap-4">
        {/* Operational Role Badge */}
        {user && (
          <div className="flex items-center gap-2 bg-white border border-[#CBD5E1] rounded-md px-3 py-1.5 text-xs text-[#166534] font-bold uppercase tracking-wider shadow-2xs">
            <Laptop size={14} className="text-[#166534]" />
            <span>
              {user.role === 'agency_admin' ? 'Agency Admin' : 
               user.role === 'district_eoc' ? 'District EOC' : 
               `Authority (${user.scope || 'State'})`}
            </span>
          </div>
        )}

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
