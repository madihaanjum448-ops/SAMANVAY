import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FileSpreadsheet, 
  User, 
  LogOut,
  Shield
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
    <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col h-screen sticky top-0 font-sans shadow-2xs">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#166534] flex items-center justify-center text-white font-bold">
            <Shield size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-wide text-[#111827] leading-none">SAMANVAY</span>
            <span className="text-[9px] font-bold text-[#166534] tracking-widest uppercase">RESCUE AGENCY</span>
          </div>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-md transition-colors group ${
                active
                  ? 'bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7]'
                  : 'text-[#475569] hover:text-[#111827] border border-transparent hover:bg-[#F7F5EF]'
              }`}
            >
              <span className={active ? 'text-[#166534]' : 'text-[#64748B] group-hover:text-[#111827]'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-[#E5E7EB] bg-[#F7F5EF] flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#166534] text-white flex items-center justify-center font-bold text-xs font-mono">
            S1
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#111827] truncate font-mono">SDRF UNIT 01</div>
            <div className="text-[10px] text-[#166534] font-semibold truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#166534] status-pulse"></span>
              VERIFIED AGENCY ✓
            </div>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition-all border border-[#E5E7EB]"
        >
          <LogOut size={14} />
          <span>Exit Agency Portal</span>
        </Link>
      </div>
    </aside>
  );
}
