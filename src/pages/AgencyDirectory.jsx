import React, { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import AuthoritySidebar from '../components/layout/AuthoritySidebar';
import AgencySidebar from '../components/layout/AgencySidebar';
import TopHeader from '../components/layout/TopHeader';
import Navbar from '../components/layout/Navbar';
import FilterPanel from '../components/filters/FilterPanel';
import AgencyCard from '../components/agency/AgencyCard';
import MapView from '../components/map/MapView';
import MapLegend from '../components/map/MapLegend';
import { MOCK_AGENCIES, MOCK_INCIDENTS } from '../data/mockData';
import { api } from '../services/api';

export default function AgencyDirectory() {
  const [role, setRole] = useState('public');
  
  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    expertise: '',
    availability: '',
    district: '',
    distance: 2500, // Maximum default
  });

  const [agencies, setAgencies] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync state with backend API
  useEffect(() => {
    // Load simulation role
    const activeRole = localStorage.getItem('samanvay_role') || 'public';
    setRole(activeRole);

    async function loadData() {
      try {
        const [agenciesData, incidentsData] = await Promise.all([
          api.agencies.getAll(),
          api.incidents.getAll()
        ]);
        if (agenciesData?.length) setAgencies(agenciesData);
        if (incidentsData?.length) setIncidents(incidentsData);
      } catch (err) {
        console.error('Failed to load agencies in directory:', err);
      }
    }
    loadData();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: '',
      expertise: '',
      availability: '',
      district: '',
      distance: 2500,
    });
  };

  // Filter logic
  const filteredAgencies = agencies.filter((agency) => {
    // In observer view, show only VERIFIED agencies.
    if (role === 'public' && agency.verificationStatus !== 'VERIFIED') return false;

    // Search query matches name
    if (filters.search && !agency.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    // Type match
    if (filters.type && agency.type !== filters.type) return false;

    // Expertise match
    if (filters.expertise && !agency.expertise.includes(filters.expertise)) return false;

    // Availability status
    if (filters.availability && agency.status !== filters.availability) return false;

    // District match
    if (filters.district && agency.district !== filters.district) return false;

    // Distance match
    if (agency.distance && agency.distance > filters.distance) return false;

    return true;
  });

  // Map markers from filtered list
  const getMapMarkers = () => {
    const list = [];
    
    filteredAgencies.forEach(a => {
      list.push({
        id: a.id,
        name: a.name,
        type: 'agency',
        agencyType: a.type,
        status: a.status,
        coordinates: a.coordinates,
        district: a.district,
        state: a.state,
        resources: role === 'public' ? null : a.resources
      });
    });

    if (role !== 'public') {
      incidents.filter(i => i.status === 'ACTIVE').forEach(i => {
        list.push({
          id: i.id,
          name: i.type,
          type: 'incident',
          incidentType: i.type,
          severity: i.severity,
          coordinates: i.coordinates,
          location: i.location,
          description: i.description
        });
      });
    }

    return list;
  };

  const renderSidebar = () => {
    if (role === 'district_eoc' || role === 'state_authority') return <AuthoritySidebar />;
    if (role === 'agency_admin') return <AgencySidebar />;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#111827] flex font-sans">
      {/* Sidebar navigation for logged-in users */}
      {renderSidebar()}

      {/* Main Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Operational Header */}
        {(!role || role === 'public') ? <Navbar /> : <TopHeader title="Emergency Response Network Registry" />}

        {/* Outer body wrapper */}
        <div className={`p-6 flex-1 flex flex-col lg:flex-row gap-6 mt-16 lg:mt-0 ${role === 'public' ? 'max-w-7xl mx-auto w-full' : ''}`}>
          
          {/* LEFT: Filter sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <FilterPanel 
              filters={filters} 
              onChange={handleFilterChange} 
              onReset={handleResetFilters} 
            />
          </div>

          {/* RIGHT: Live GIS Map + Cards Grid */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Top row filter actions for mobile */}
            <div className="lg:hidden flex items-center justify-between gap-3 bg-white border border-[#E5E7EB] p-3.5 rounded-xl shadow-xs">
              <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">Rescue Force registry</span>
              <button
                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                className="bg-white border border-[#E5E7EB] text-[#166534] text-xs font-bold px-3 py-1.5 rounded-md cursor-pointer flex items-center gap-1.5"
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
            </div>

            {showFiltersMobile && (
              <div className="lg:hidden p-1 fade-in">
                <FilterPanel 
                  filters={filters} 
                  onChange={handleFilterChange} 
                  onReset={handleResetFilters} 
                />
              </div>
            )}

            {/* Split Screen layout: Top Map, Bottom Cards */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 h-[340px] relative shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Live Response Network GIS</h3>
                <span className="text-[10px] text-[#64748B] font-mono font-bold">SHOWING {filteredAgencies.length} VERIFIED AGENCIES</span>
              </div>
              <div className="flex-1 h-[250px] relative rounded-lg overflow-hidden border border-[#E5E7EB]">
                <MapView markers={getMapMarkers()} />
                <MapLegend />
              </div>
            </div>

            {/* Grid listings of agencies */}
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#E5E7EB] pb-2.5">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Vetted Rescue Forces</h3>
                <span className="text-xs text-[#64748B] font-mono">{filteredAgencies.length} matches</span>
              </div>

              {filteredAgencies.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#64748B] font-mono uppercase bg-white border border-[#E5E7EB] rounded-xl">
                  No agencies match current coordinates or query filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAgencies.map((agency) => (
                    <AgencyCard key={agency.id} agency={{
                      ...agency,
                      phone: role === 'public' ? 'Credential Access Required' : agency.phone,
                      email: role === 'public' ? 'Credential Access Required' : agency.email,
                      resources: role === 'public' ? {
                        personnel: { total: 'Varies', available: 'Available' },
                        boats: { total: 'Varies', available: 'Available' },
                        ambulances: { total: 'Varies', available: 'Available' }
                      } : agency.resources
                    }} />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
