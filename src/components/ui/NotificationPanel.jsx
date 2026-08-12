import React from 'react';
import { X, Bell, AlertTriangle, FileText, Settings, Activity } from 'lucide-react';

const typeIcon = {
  alert:    <AlertTriangle size={14} className="text-orange-400" />,
  incident: <Activity size={14} className="text-red-400" />,
  request:  <FileText size={14} className="text-cyan-400" />,
  system:   <Settings size={14} className="text-slate-400" />,
};

export default function NotificationPanel({ notifications, onClose, onMarkAllRead }) {
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div className="absolute right-0 top-12 w-80 bg-[#0f1c35] border border-[#1e2a40] rounded-xl shadow-2xl z-50 fade-in overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a40]">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-cyan-400" />
          <span className="text-sm font-semibold text-white">Notifications</span>
          {unread > 0 && (
            <span className="bg-cyan-500 text-slate-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={onMarkAllRead} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Mark all read</button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">No notifications</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-[#1e2a40]/50 hover:bg-[#1e2a40]/50 transition-colors cursor-pointer ${
              !n.read ? 'bg-cyan-500/5' : ''
            }`}>
              <div className="flex-shrink-0 mt-0.5 p-1.5 bg-slate-800 rounded">
                {typeIcon[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-xs font-semibold ${!n.read ? 'text-white' : 'text-slate-300'}`}>{n.title}</span>
                  {!n.read && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                <span className="text-xs text-slate-600">{n.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
