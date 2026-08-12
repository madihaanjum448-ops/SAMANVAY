import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FileSpreadsheet, 
  User, 
  LogOut,
  Activity
} from 'lucide-react';

export default function AgencySidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, path: '/agency/dashboard' },
    { id: 'resources', label: 'Resource Inventory', icon: <Package size={16} />, path: '/resources' },
    { id: 'coordination', label: 'Coordination Requests', icon: <FileSpreadsheet size={16} />, path: '/requests' },
    { id: 'profile', label: 'Agency Profile', icon: <User size={16} />, path: '/agencies/AG-002' },
  ];

  const isActive = (item) => {
    return currentPath === item.path;
  };

  return (
    <aside className="w-64 bg-navy-950 border-r border-slate-800/80 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-green-500/10 border border-green-500/30 text-green-400">
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
                  ? 'bg-green-500/10 text-green-400 border border-green-500/25'
                  : 'text-slate-400 hover:text-white border border-transparent hover:bg-slate-900/60'
              }`}
            >
              <span className={active ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300'}>
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
          <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-xs uppercase">
            S1
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate font-mono">SDRF UNIT 01</div>
            <div className="text-[10px] text-green-400 font-semibold truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 status-pulse"></span>
              VERIFIED ✓
            </div>
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
