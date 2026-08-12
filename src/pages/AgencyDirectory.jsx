import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, Map, SlidersHorizontal, Grid, Search, Plus, Phone, Mail } from 'lucide-react';
import AuthoritySidebar from '../components/layout/AuthoritySidebar';
import AgencySidebar from '../components/layout/AgencySidebar';
import TopHeader from '../components/layout/TopHeader';
import Navbar from '../components/layout/Navbar';
import FilterPanel from '../components/filters/FilterPanel';
import AgencyCard from '../components/agency/AgencyCard';
import MapView from '../components/map/MapView';
import MapLegend from '../components/map/MapLegend';
import { MOCK_AGENCIES, MOCK_INCIDENTS } from '../data/mockData';

export default function AgencyDirectory() {
  const navigate = useNavigate();
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

  // Sync state with localStorage
  useEffect(() => {
    // Load simulation role
    const activeRole = localStorage.getItem('samanvay_role') || 'public';
    setRole(activeRole);

    const initData = (key, fallback) => {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    };
    setAgencies(initData('samanvay_agencies', MOCK_AGENCIES));
    setIncidents(initData('samanvay_incidents', MOCK_INCIDENTS));
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
  // Return only verified agencies in public view. In EOC view show all.
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
        resources: role === 'public' ? null : a.resources // mask resources if public
      });
    });

    // Also plot active incidents if authority/agency is logged in
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
    if (role === 'authority') return <AuthoritySidebar />;
    if (role === 'agency') return <AgencySidebar />;
    return null; // Public observer has top Navbar instead of Sidebar
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-200 flex">
      {/* Sidebar navigation for logged-in users */}
      {renderSidebar()}

      {/* Main Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Operational Header */}
        {role === 'public' ? <Navbar /> : <TopHeader title="Emergency Response Network Registry" />}

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
            <div className="lg:hidden flex items-center justify-between gap-3 bg-[#0f1c35] border border-slate-800 p-3 rounded-lg">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Rescue Force registry</span>
              <button
                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                className="bg-navy-800 border border-slate-700 text-cyan-400 text-xs font-semibold px-3 py-1.5 rounded cursor-pointer flex items-center gap-1"
              >
                <SlidersHorizontal size={12} /> Filters
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
            <div className="bg-[#0f1c35] border border-slate-800 rounded-lg p-4 h-[320px] relative">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Response Network Status</h3>
                <span className="text-[10px] text-slate-500 font-mono">SHOWING {filteredAgencies.length} VERIFIED AGENCIES</span>
              </div>
              <div className="flex-1 h-[240px] relative rounded overflow-hidden border border-slate-850">
                <MapView markers={getMapMarkers()} />
                <MapLegend />
              </div>
            </div>

            {/* Grid listings of agencies */}
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Vetted Rescue Forces</h3>
                <span className="text-xs text-slate-500 font-mono">{filteredAgencies.length} matches</span>
              </div>

              {filteredAgencies.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 font-mono uppercase bg-[#0f1c35] border border-slate-800 rounded-lg">
                  No agencies match current coordinates or query filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAgencies.map((agency) => (
                    <AgencyCard key={agency.id} agency={{
                      ...agency,
                      // Mask fields if public role
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
