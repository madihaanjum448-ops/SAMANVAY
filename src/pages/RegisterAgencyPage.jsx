import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import { 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Building2,
  FileText,
  Shield
} from 'lucide-react';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';
import Dropdown from '../components/ui/Dropdown';
import { AGENCY_TYPES, EXPERTISE_OPTIONS } from '../data/mockData';
import { api } from '../services/api';

export default function RegisterAgencyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [agencyInfo, setAgencyInfo] = useState({
    name: '',
    type: '',
    district: '',
    state: '',
    phone: '',
    email: '',
  });

  const [expertise, setExpertise] = useState([]);
  
  const [location, setLocation] = useState({
    address: '',
    lat: '18.5204',
    lng: '73.8567',
  });

  const [resources, setResources] = useState({
    personnel: 0,
    ambulances: 0,
    vehicles: 0,
    boats: 0,
    drones: 0,
    kits: 0,
    other: '',
  });

  // Map Refs for Step 3
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize Map in Step 3
  useEffect(() => {
    if (step !== 3 || !mapContainerRef.current) return;

    // Create Leaflet Map
    const initialLat = parseFloat(location.lat) || 18.5204;
    const initialLng = parseFloat(location.lng) || 73.8567;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true
    }).setView([initialLat, initialLng], 12);

    mapRef.current = map;

    // Light-mode Map Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    // Initial Marker icon
    const customIcon = L.divIcon({
      className: 'custom-marker-icon',
      html: '<div class="marker-deployed"></div>',
      iconSize: [20, 20]
    });

    const marker = L.marker([initialLat, initialLng], { icon: customIcon, draggable: true }).addTo(map);
    markerRef.current = marker;

    // Drag events
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setLocation(prev => ({
        ...prev,
        lat: pos.lat.toFixed(5),
        lng: pos.lng.toFixed(5)
      }));
    });

    // Map click events
    map.on('click', (e) => {
      const pos = e.latlng;
      marker.setLatLng(pos);
      setLocation(prev => ({
        ...prev,
        lat: pos.lat.toFixed(5),
        lng: pos.lng.toFixed(5)
      }));
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [step]);

  const handleUseCurrentLocation = () => {
    const demoLat = 18.5354;
    const demoLng = 73.8776;
    setLocation(prev => ({
      ...prev,
      lat: demoLat.toString(),
      lng: demoLng.toString(),
      address: 'Shivajinagar EOC Area, Pune, Maharashtra'
    }));

    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([demoLat, demoLng], 14);
      markerRef.current.setLatLng([demoLat, demoLng]);
    }
  };

  // State handles
  const handleInfoChange = (field, value) => {
    setAgencyInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleExpertiseToggle = (option) => {
    setExpertise(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option) 
        : [...prev, option]
    );
  };

  const handleResourceChange = (field, value) => {
    setResources(prev => ({ ...prev, [field]: Math.max(0, parseInt(value) || 0) }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newAgencyPayload = {
      name: agencyInfo.name,
      type: agencyInfo.type,
      district: agencyInfo.district || 'Pune',
      state: agencyInfo.state || 'Maharashtra',
      phone: agencyInfo.phone,
      email: agencyInfo.email,
      expertise: expertise,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address
      },
      resources: resources
    };


    const existing = localStorage.getItem('samanvay_agencies');
    let agenciesList = [];
    if (existing) {
      agenciesList = JSON.parse(existing);
    } else {
      agenciesList = [];
    }
    
    agenciesList.push(newAgency);
    localStorage.setItem('samanvay_agencies', JSON.stringify(agenciesList));

    // Update notifications to show submission
    const storedNotifs = localStorage.getItem('samanvay_notifications');
    let notifs = [];
    if (storedNotifs) notifs = JSON.parse(storedNotifs);
    const newNotif = {
      id: Date.now(),
      type: 'alert',
      title: 'New Agency Registration',
      message: `${agencyInfo.name} (${agencyInfo.type}) submitted for verification.`,
      time: 'Just now',
      read: false
    };
    notifs.unshift(newNotif);
    localStorage.setItem('samanvay_notifications', JSON.stringify(notifs));

    // Dispatch to Backend API
    await api.agencies.register(newAgencyPayload);


    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] text-[#111827] flex flex-col items-center justify-center p-6 font-sans">
        
        <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center shadow-xs flex flex-col items-center gap-6 fade-in">
          <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#166534]">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-[#111827]">REGISTRATION SUBMITTED</h2>
            <div className="inline-block mt-2 px-3 py-1 bg-[#FFF7ED] border border-[#FED7AA] text-[#EA580C] font-mono text-[11px] font-bold rounded-md uppercase tracking-wider">
              Status: PENDING VERIFICATION
            </div>
          </div>

          <p className="text-xs text-[#64748B] leading-relaxed">
            Your rescue agency credentials and resource lists have been submitted for review. Your agency will become visible on the response network after verification by Pune District Authority EOC.
          </p>

          <div className="w-full border-t border-[#E5E7EB] pt-6">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-[#166534] hover:bg-[#14532D] text-white font-bold py-3 px-4 rounded-md text-xs transition-all shadow-xs cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#111827] pb-16 flex flex-col font-sans">

      {/* Header */}
      <header className="h-16 border-b border-[#E5E7EB] px-6 flex items-center justify-between bg-white sticky top-0 z-20 shadow-2xs">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#166534] flex items-center justify-center text-white font-bold">
            <Shield size={18} />
          </div>
          <span className="text-base font-extrabold tracking-wide text-[#111827]">SAMANVAY</span>
        </Link>
        <span className="text-xs font-bold text-[#166534] bg-[#F0FDF4] px-3 py-1 rounded-full border border-[#DCFCE7] uppercase tracking-wider">
          OFFICIAL AGENCY REGISTRATION
        </span>
      </header>

      {/* Main Wizard */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 mt-10 relative z-10 flex flex-col">
        
        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight">Register Rescue Agency</h2>
          <p className="text-xs text-[#64748B] mt-1">Provide force details and deployable resources to integrate with SAMANVAY EOC.</p>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    step === s
                      ? 'bg-[#166534] text-white shadow-xs'
                      : step > s
                      ? 'bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534]'
                      : 'bg-white border border-[#E5E7EB] text-[#64748B]'
                  }`}
                >
                  {s}
                </div>
                <span className={`text-[10px] font-bold tracking-wider mt-1.5 uppercase ${
                  step === s ? 'text-[#166534]' : 'text-[#64748B]'
                }`}>
                  {s === 1 && 'Info'}
                  {s === 2 && 'Expertise'}
                  {s === 3 && 'Location'}
                  {s === 4 && 'Resources'}
                </span>
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-[2px] -mt-4 transition-all duration-300 ${
                    step > s ? 'bg-[#166534]' : 'bg-[#E5E7EB]'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Wizard Body Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 flex-1 shadow-xs flex flex-col justify-between">
          
          <form onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()} className="flex-1 flex flex-col">
            
            {/* STEP 1: Agency Information */}
            {step === 1 && (
              <div className="flex-1 flex flex-col gap-4 fade-in">
                <div className="border-b border-[#E5E7EB] pb-3 mb-2 flex items-center gap-2">
                  <Building2 size={18} className="text-[#166534]" />
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Step 1: Agency Information</h3>
                </div>
                
                <FormInput
                  id="reg-name"
                  label="Agency Name"
                  placeholder="e.g. SDRF Unit 05 Pune"
                  value={agencyInfo.name}
                  onChange={(e) => handleInfoChange('name', e.target.value)}
                  required
                />

                <Dropdown
                  id="reg-type"
                  label="Agency Type"
                  options={AGENCY_TYPES}
                  value={agencyInfo.type}
                  onChange={(e) => handleInfoChange('type', e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    id="reg-district"
                    label="District"
                    placeholder="e.g. Pune"
                    value={agencyInfo.district}
                    onChange={(e) => handleInfoChange('district', e.target.value)}
                    required
                  />
                  <FormInput
                    id="reg-state"
                    label="State"
                    placeholder="e.g. Maharashtra"
                    value={agencyInfo.state}
                    onChange={(e) => handleInfoChange('state', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    id="reg-phone"
                    label="Official Phone"
                    placeholder="e.g. +91-20-2605xxxx"
                    value={agencyInfo.phone}
                    onChange={(e) => handleInfoChange('phone', e.target.value)}
                    required
                  />
                  <FormInput
                    id="reg-email"
                    label="Official Email"
                    type="email"
                    placeholder="e.g. ops@sdrf.gov.in"
                    value={agencyInfo.email}
                    onChange={(e) => handleInfoChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Expertise */}
            {step === 2 && (
              <div className="flex-1 flex flex-col gap-4 fade-in">
                <div className="border-b border-[#E5E7EB] pb-3 mb-2 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#166534]" />
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Step 2: Tactical Rescue Expertise</h3>
                </div>
                <p className="text-xs text-[#64748B] leading-normal">
                  Select disaster rescue disciplines that your tactical unit has certified capabilities to coordinate.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  {EXPERTISE_OPTIONS.map((opt) => {
                    const checked = expertise.includes(opt);
                    return (
                      <label 
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                          checked
                            ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#166534] font-bold'
                            : 'bg-white border-[#E5E7EB] text-[#475569] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleExpertiseToggle(opt)}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          checked ? 'border-[#166534] bg-[#166534] text-white' : 'border-[#CBD5E1]'
                        }`}>
                          {checked && <span className="text-[10px] font-bold">✓</span>}
                        </div>
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Location */}
            {step === 3 && (
              <div className="flex-1 flex flex-col gap-4 fade-in">
                <div className="border-b border-[#E5E7EB] pb-3 mb-2 flex items-center gap-2">
                  <MapPin size={18} className="text-[#166534]" />
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Step 3: Base Location</h3>
                </div>

                <FormInput
                  id="reg-address"
                  label="HQ Street Address"
                  placeholder="e.g. Shivajinagar EOC Area, Pune"
                  value={location.address}
                  onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    id="reg-lat"
                    label="Latitude"
                    value={location.lat}
                    onChange={(e) => setLocation(prev => ({ ...prev, lat: e.target.value }))}
                    required
                  />
                  <FormInput
                    id="reg-lng"
                    label="Longitude"
                    value={location.lng}
                    onChange={(e) => setLocation(prev => ({ ...prev, lng: e.target.value }))}
                    required
                  />
                </div>

                {/* Location Map Selector */}
                <div className="flex flex-col gap-1.5 flex-1 min-h-[220px]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Map Pin Locator</span>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="text-[#166534] font-bold uppercase tracking-wider text-[10px] cursor-pointer flex items-center gap-1 bg-[#F0FDF4] border border-[#DCFCE7] px-2.5 py-1 rounded"
                    >
                      Use Demo HQ Location
                    </button>
                  </div>
                  <div className="flex-1 w-full h-[220px] rounded-lg border border-[#E5E7EB] overflow-hidden relative">
                    <div ref={mapContainerRef} className="w-full h-full" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Resources */}
            {step === 4 && (
              <div className="flex-1 flex flex-col gap-4 fade-in">
                <div className="border-b border-[#E5E7EB] pb-3 mb-2 flex items-center gap-2">
                  <FileText size={18} className="text-[#166534]" />
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Step 4: Resource Counts</h3>
                </div>
                <p className="text-xs text-[#64748B] leading-normal">
                  Define active inventories immediately available. All parameters will be verified by the District EOC.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                  <FormInput
                    id="res-personnel"
                    label="Personnel staff count"
                    type="number"
                    value={resources.personnel}
                    onChange={(e) => handleResourceChange('personnel', e.target.value)}
                  />
                  <FormInput
                    id="res-ambulances"
                    label="Ambulances Count"
                    type="number"
                    value={resources.ambulances}
                    onChange={(e) => handleResourceChange('ambulances', e.target.value)}
                  />
                  <FormInput
                    id="res-vehicles"
                    label="Rescue Vehicles"
                    type="number"
                    value={resources.vehicles}
                    onChange={(e) => handleResourceChange('vehicles', e.target.value)}
                  />
                  <FormInput
                    id="res-boats"
                    label="Rescue Boats"
                    type="number"
                    value={resources.boats}
                    onChange={(e) => handleResourceChange('boats', e.target.value)}
                  />
                  <FormInput
                    id="res-drones"
                    label="Search Drones"
                    type="number"
                    value={resources.drones}
                    onChange={(e) => handleResourceChange('drones', e.target.value)}
                  />
                  <FormInput
                    id="res-kits"
                    label="Medical Kits"
                    type="number"
                    value={resources.kits}
                    onChange={(e) => handleResourceChange('kits', e.target.value)}
                  />
                </div>

                <div className="mt-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Other Equipment Details</label>
                  <textarea
                    rows={2}
                    value={resources.other}
                    onChange={(e) => setResources(prev => ({ ...prev, other: e.target.value }))}
                    placeholder="e.g. Hydraulic cutters, chemical containment gear, life vests, SAT phones..."
                    className="w-full bg-[#F7F5EF] border border-[#E5E7EB] focus:border-[#166534] text-xs rounded-md p-3 text-[#111827] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-5 mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-white hover:bg-[#F7F5EF] text-[#374151] border border-[#E5E7EB] font-bold px-4 py-2 rounded-md text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-[#166534] hover:bg-[#14532D] text-white font-bold px-5 py-2 rounded-md text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  Continue
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-[#166534] hover:bg-[#14532D] text-white font-bold px-5 py-2.5 rounded-md text-xs transition-all cursor-pointer shadow-xs"
                >
                  Submit for Verification
                </button>
              )}
            </div>

          </form>

        </div>
      </main>
    </div>
  );
}
