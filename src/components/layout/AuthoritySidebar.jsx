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
    <aside className="w-64 bg-navy-950 border-r border-slate-800/80 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity size={16} className="animate-pulse" />
          </div>
          <span className="text-sm font-extrabold tracking-wider text-white">SAMANVAY</span>
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
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25'
                  : 'text-slate-400 hover:text-white border border-transparent hover:bg-slate-900/60'
              }`}
            >
              <span className={active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-navy-950/80 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs uppercase">
            PD
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">Priya Desai</div>
            <div className="text-[10px] text-slate-500 truncate">District Collector</div>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded transition-all"
        >
          <LogOut size={14} className="text-slate-500 group-hover:text-red-400" />
          <span>Exit Portal</span>
        </Link>
      </div>
    </aside>
  );
}
