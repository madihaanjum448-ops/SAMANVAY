import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  Users, 
  Package, 
  FileSpreadsheet, 
  ShieldCheck, 
  History, 
  Settings,
  LogOut,
  Activity
} from 'lucide-react';

export default function AuthoritySidebar({ activeTab, onTabChange }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, path: '/authority/dashboard?tab=overview' },
    { id: 'map', label: 'Live Map', icon: <Map size={16} />, path: '/authority/dashboard?tab=map' },
    { id: 'incidents', label: 'Incidents', icon: <AlertTriangle size={16} />, path: '/authority/dashboard?tab=incidents' },
    { id: 'agencies', label: 'Agencies', icon: <Users size={16} />, path: '/agencies' },
    { id: 'resources', label: 'Resources', icon: <Package size={16} />, path: '/resources' },
    { id: 'coordination', label: 'Coordination', icon: <FileSpreadsheet size={16} />, path: '/requests' },
    { id: 'verification', label: 'Verification Queue', icon: <ShieldCheck size={16} />, path: '/authority/dashboard?tab=verification' },
    { id: 'activity', label: 'Activity Log', icon: <History size={16} />, path: '/authority/dashboard?tab=activity' },
  ];

  // Helper to check active state
  const isActive = (item) => {
    if (item.path.startsWith('/authority/dashboard')) {
      if (currentPath === '/authority/dashboard') {
        const query = new URLSearchParams(location.search);
        const tab = query.get('tab') || 'overview';
        return tab === item.id;
      }
      return false;
    }
    return currentPath === item.path;
  };

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-stone-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-teal-50 border border-teal-200 text-teal-700">
            <Activity size={16} className="animate-pulse" />
          </div>
          <span className="text-sm font-extrabold tracking-wider text-stone-900">SAMANVAY</span>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded transition-colors group ${
                active
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'text-stone-500 hover:text-stone-900 border border-transparent hover:bg-stone-50'
              }`}
            >
              <span className={active ? 'text-teal-700' : 'text-stone-500 group-hover:text-stone-700'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs uppercase">
            PD
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-stone-900 truncate">Priya Desai</div>
            <div className="text-[10px] text-stone-500 truncate">District Collector</div>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-stone-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
        >
          <LogOut size={14} className="text-stone-500 group-hover:text-red-700" />
          <span>Exit Portal</span>
        </Link>
      </div>
    </aside>
  );
}
