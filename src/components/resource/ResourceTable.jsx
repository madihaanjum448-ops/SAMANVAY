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
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden fade-in shadow-2xs">
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
                  <div className="flex items-center gap-2 font-bold text-[#111827]">
                    <span className="text-[#166534]">
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
                      className="w-20 bg-[#F7F5EF] border border-[#CBD5E1] rounded px-2 py-1 text-xs text-[#111827] font-mono text-center focus:outline-none focus:border-[#166534]"
                    />
                  ) : (
                    <span className="font-mono text-[#111827] font-semibold">{row.total}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.available}
                      onChange={(e) => handleInputChange('available', e.target.value)}
                      className="w-20 bg-[#F0FDF4] border border-[#DCFCE7] rounded px-2 py-1 text-xs text-[#166534] font-mono text-center focus:outline-none focus:border-[#166534]"
                    />
                  ) : (
                    <span className="text-[#166534] font-mono font-bold">{row.available}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.deployed}
                      onChange={(e) => handleInputChange('deployed', e.target.value)}
                      className="w-20 bg-[#FEF2F2] border border-[#FECACA] rounded px-2 py-1 text-xs text-[#DC2626] font-mono text-center focus:outline-none focus:border-[#DC2626]"
                    />
                  ) : (
                    <span className="text-[#DC2626] font-mono font-bold">{row.deployed}</span>
                  )}
                </td>
                <td>
                  <span className="text-xs text-[#64748B] font-mono">{row.lastUpdated}</span>
                </td>
                <td className="text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleSave(row.id)}
                        className="p-1.5 hover:bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7] rounded-md transition-colors cursor-pointer"
                        title="Save Changes"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 hover:bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] rounded-md transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditClick(row)}
                      className="p-1.5 hover:bg-[#F7F5EF] text-[#64748B] hover:text-[#111827] border border-transparent hover:border-[#E5E7EB] rounded-md transition-colors cursor-pointer"
                      title="Edit Row"
                    >
                      <Edit2 size={14} />
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
