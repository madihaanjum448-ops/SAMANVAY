import React, { useState, useEffect } from 'react';
import { Users, Ship, Ambulance, Truck, Package, ShieldAlert } from 'lucide-react';
import AuthoritySidebar from '../components/layout/AuthoritySidebar';
import AgencySidebar from '../components/layout/AgencySidebar';
import TopHeader from '../components/layout/TopHeader';
import Navbar from '../components/layout/Navbar';
import ResourceTable from '../components/resource/ResourceTable';
import StatCard from '../components/ui/StatCard';
import { RESOURCE_INVENTORY, MOCK_AGENCIES } from '../data/mockData';

export default function ResourceInventory() {
  const [role, setRole] = useState('authority');
  const [districtResources, setDistrictResources] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const agencyId = 'AG-002'; // Logged-in tactical agency

  useEffect(() => {
    const activeRole = localStorage.getItem('samanvay_role') || 'authority';
    setRole(activeRole);

    const initData = (key, fallback) => {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    };

    setDistrictResources(initData('samanvay_resources', RESOURCE_INVENTORY));
    setAgencies(initData('samanvay_agencies', MOCK_AGENCIES));
  }, []);

  const syncState = (key, data, setter) => {
    setter(data);
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Check if viewing as tactical agency
  const currentAgency = agencies.find(a => a.id === agencyId) || MOCK_AGENCIES[1];

  // Map agency resources object into table format
  const getAgencyTableData = () => {
    const res = currentAgency.resources || {};
    return [
      { id: 'pers', name: 'Personnel', total: res.personnel?.total || 0, available: res.personnel?.available || 0, deployed: (res.personnel?.total - res.personnel?.available) || 0, lastUpdated: currentAgency.lastUpdated },
      { id: 'boat', name: 'Rescue Boats', total: res.boats?.total || 0, available: res.boats?.available || 0, deployed: (res.boats?.total - res.boats?.available) || 0, lastUpdated: currentAgency.lastUpdated },
      { id: 'amb', name: 'Ambulances', total: res.ambulances?.total || 0, available: res.ambulances?.available || 0, deployed: (res.ambulances?.total - res.ambulances?.available) || 0, lastUpdated: currentAgency.lastUpdated },
      { id: 'veh', name: 'Rescue Vehicles', total: res.rescueVehicles?.total || 0, available: res.rescueVehicles?.available || 0, deployed: (res.rescueVehicles?.total - res.rescueVehicles?.available) || 0, lastUpdated: currentAgency.lastUpdated },
      { id: 'dron', name: 'Drones', total: res.drones?.total || 0, available: res.drones?.available || 0, deployed: (res.drones?.total - res.drones?.available) || 0, lastUpdated: currentAgency.lastUpdated },
      { id: 'med', name: 'Medical Kits', total: res.medicalKits?.total || 0, available: res.medicalKits?.available || 0, deployed: (res.medicalKits?.total - res.medicalKits?.available) || 0, lastUpdated: currentAgency.lastUpdated },
    ];
  };

  // Update logic for EOC district aggregates
  const handleUpdateDistrict = (id, updatedFields) => {
    const updated = districtResources.map(row => 
      row.id === id ? { ...row, ...updatedFields } : row
    );
    syncState('samanvay_resources', updated, setDistrictResources);

    // Push into logs
    const storedLogs = localStorage.getItem('samanvay_activity') || '[]';
    const logsList = JSON.parse(storedLogs);
    const rowName = districtResources.find(r => r.id === id)?.name || 'Resource';
    const newLog = {
      id: Date.now(),
      type: 'system',
      action: 'Asset Log Updated',
      detail: `EOC database updated: ${rowName} capacity adjusted`,
      actor: 'Priya Desai (EOC)',
      time: 'Just now',
    };
    logsList.unshift(newLog);
    localStorage.setItem('samanvay_activity', JSON.stringify(logsList));
  };

  // Update logic for specific agency
  const handleUpdateAgency = (id, updatedFields) => {
    const keyMap = {
      pers: 'personnel',
      boat: 'boats',
      amb: 'ambulances',
      veh: 'rescueVehicles',
      dron: 'drones',
      med: 'medicalKits',
    };
    const key = keyMap[id];
    if (!key) return;

    const updatedAgencies = agencies.map(a => {
      if (a.id === agencyId) {
        return {
          ...a,
          lastUpdated: 'Just now',
          resources: {
            ...a.resources,
            [key]: {
              total: updatedFields.total,
              available: updatedFields.available,
            }
          }
        };
      }
      return a;
    });
    syncState('samanvay_agencies', updatedAgencies, setAgencies);

    // Push into logs
    const storedLogs = localStorage.getItem('samanvay_activity') || '[]';
    const logsList = JSON.parse(storedLogs);
    const rowLabel = key.charAt(0).toUpperCase() + key.slice(1);
    const newLog = {
      id: Date.now(),
      type: 'system',
      action: 'Force Asset Update',
      detail: `SDRF Unit 01 updated resource capacity for ${rowLabel}`,
      actor: 'SDRF Unit 01 dispatcher',
      time: 'Just now',
    };
    logsList.unshift(newLog);
    localStorage.setItem('samanvay_activity', JSON.stringify(logsList));
  };

  // Summarize stats
  const tableData = role === 'agency' ? getAgencyTableData() : districtResources;

  const personnelTotal = tableData.find(d => d.name === 'Personnel')?.total || 0;
  const personnelAvail = tableData.find(d => d.name === 'Personnel')?.available || 0;
  const boatsAvail = tableData.find(d => d.name === 'Rescue Boats')?.available || 0;
  const ambulancesAvail = tableData.find(d => d.name === 'Ambulances')?.available || 0;

  const renderSidebar = () => {
    if (role === 'authority') return <AuthoritySidebar />;
    if (role === 'agency') return <AgencySidebar />;
    return null;
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-200 flex">
      {/* Sidebar navigation */}
      {renderSidebar()}

      {/* Main Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        {role === 'public' ? <Navbar /> : <TopHeader title="Resource Allocation Ledger" />}

        {/* Outer body wrapper */}
        <main className={`p-6 flex-1 overflow-y-auto ${role === 'public' ? 'max-w-4xl mx-auto w-full mt-16' : ''}`}>
          
          <div className="flex flex-col gap-6">
            
            {/* Header info */}
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Resource Inventory Database</h2>
              <p className="text-xs text-slate-500 mt-1">
                {role === 'agency' 
                  ? 'Internal asset allocation table. Ensure counts are updated in compliance with EOC mandates.'
                  : 'Master catalog of municipal dispatches, reserve stocks, and active responder counts.'
                }
              </p>
            </div>

            {/* Public view blocker warning */}
            {role === 'public' ? (
              <div className="bg-[#0f1c35] border border-slate-800 rounded-lg p-8 text-center flex flex-col items-center gap-4 max-w-lg mx-auto mt-6">
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-full">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-base font-extrabold text-white">Access Denied</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Resource allocations, reserve capacities, and deployment metrics are classified. Please log in as District Authority EOC or Rescue Agency dispatcher to view and edit inventories.
                </p>
              </div>
            ) : (
              <>
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Force Capacity" value={personnelTotal} icon={<Users size={16} />} color="cyan" />
                  <StatCard label="Available Personnel" value={personnelAvail} icon={<Users size={16} />} color="green" />
                  <StatCard label="Boats On Standby" value={boatsAvail} icon={<Ship size={16} />} color="blue" />
                  <StatCard label="Ambulances Ready" value={ambulancesAvail} icon={<Ambulance size={16} />} color="yellow" />
                </div>

                {/* Editable Resource Table */}
                <div>
                  <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Asset Capacity Database</h3>
                    <span className="text-[10px] text-slate-500 font-mono">EDITABLE DEMO STATE</span>
                  </div>
                  <ResourceTable 
                    data={tableData} 
                    onUpdate={role === 'agency' ? handleUpdateAgency : handleUpdateDistrict} 
                  />
                </div>
              </>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}
