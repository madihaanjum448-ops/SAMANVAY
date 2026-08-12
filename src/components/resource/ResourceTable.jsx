import React, { useState } from 'react';
import { Edit2, Check, X, Users, Ship, Ambulance, Truck, Plane, Package } from 'lucide-react';

const icons = {
  Personnel: <Users size={14} />,
  'Rescue Boats': <Ship size={14} />,
  Ambulances: <Ambulance size={14} />,
  'Rescue Vehicles': <Truck size={14} />,
  Drones: <Plane size={14} />,
  'Medical Kits': <Package size={14} />,
};

export default function ResourceTable({ data = [], onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const handleEditClick = (row) => {
    setEditingId(row.id);
    setEditValues({
      total: row.total,
      available: row.available,
      deployed: row.deployed,
    });
  };

  const handleInputChange = (field, val) => {
    const intVal = Math.max(0, parseInt(val) || 0);
    setEditValues(prev => {
      const next = { ...prev, [field]: intVal };
      // Keep math consistent: total = available + deployed (or let the user define, but keeping it auto-updating makes sense!)
      // Wait, let's allow total to be independent, but make sure available and deployed don't exceed total.
      if (field === 'available') {
        next.deployed = Math.max(0, next.total - intVal);
      } else if (field === 'deployed') {
        next.available = Math.max(0, next.total - intVal);
      } else if (field === 'total') {
        next.available = intVal;
        next.deployed = 0;
      }
      return next;
    });
  };

  const handleSave = (id) => {
    onUpdate(id, {
      ...editValues,
      lastUpdated: 'Just now',
    });
    setEditingId(null);
  };

  return (
    <div className="bg-[#0f1c35] border border-slate-800 rounded-lg overflow-x-auto fade-in">
      <table className="data-table">
        <thead>
          <tr>
            <th>Resource Type</th>
            <th>Total Capacity</th>
            <th>Available</th>
            <th>Deployed</th>
            <th>Last Updated</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const isEditing = editingId === row.id;
            return (
              <tr key={row.id}>
                <td>
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <span className="text-cyan-400">
                      {icons[row.name] || <Package size={14} />}
                    </span>
                    <span>{row.name}</span>
                  </div>
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.total}
                      onChange={(e) => handleInputChange('total', e.target.value)}
                      className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-cyan-500"
                    />
                  ) : (
                    <span className="font-mono">{row.total}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.available}
                      onChange={(e) => handleInputChange('available', e.target.value)}
                      className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-green-400 font-mono text-center focus:outline-none focus:border-green-500"
                    />
                  ) : (
                    <span className="text-green-400 font-mono">{row.available}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.deployed}
                      onChange={(e) => handleInputChange('deployed', e.target.value)}
                      className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-red-400 font-mono text-center focus:outline-none focus:border-red-500"
                    />
                  ) : (
                    <span className="text-red-400 font-mono">{row.deployed}</span>
                  )}
                </td>
                <td>
                  <span className="text-xs text-slate-500 font-mono">{row.lastUpdated}</span>
                </td>
                <td className="text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleSave(row.id)}
                        className="p-1 hover:bg-green-500/10 text-green-400 border border-green-500/20 rounded transition-colors"
                        title="Save Changes"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 hover:bg-red-500/10 text-red-400 border border-red-500/20 rounded transition-colors"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditClick(row)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white border border-transparent hover:border-slate-800 rounded transition-colors"
                      title="Edit Row"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
