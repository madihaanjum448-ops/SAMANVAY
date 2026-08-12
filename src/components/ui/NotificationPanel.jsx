import React from 'react';
import { X, Bell, AlertTriangle, FileText, Settings, Activity } from 'lucide-react';

const typeIcon = {
  alert:    <AlertTriangle size={14} className="text-orange-700" />,
  incident: <Activity size={14} className="text-red-700" />,
  request:  <FileText size={14} className="text-teal-700" />,
  system:   <Settings size={14} className="text-stone-500" />,
};

export default function NotificationPanel({ notifications, onClose, onMarkAllRead }) {
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div className="absolute right-0 top-12 w-80 bg-white border border-stone-200 rounded-xl shadow-lg z-50 fade-in overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-teal-700" />
          <span className="text-sm font-semibold text-stone-900">Notifications</span>
          {unread > 0 && (
            <span className="bg-teal-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={onMarkAllRead} className="text-xs text-teal-700 hover:text-teal-600 transition-colors">Mark all read</button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900 transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-stone-500 text-sm">No notifications</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-stone-200/50 hover:bg-stone-50 transition-colors cursor-pointer ${
              !n.read ? 'bg-teal-50/50' : ''
            }`}>
              <div className="flex-shrink-0 mt-0.5 p-1.5 bg-stone-100 rounded">
                {typeIcon[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-xs font-semibold ${!n.read ? 'text-stone-900' : 'text-stone-700'}`}>{n.title}</span>
                  {!n.read && <span className="w-1.5 h-1.5 bg-teal-600 rounded-full flex-shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{n.message}</p>
                <span className="text-xs text-stone-400">{n.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
