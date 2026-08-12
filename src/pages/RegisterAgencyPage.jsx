import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  Ship, 
  Ambulance, 
  Activity, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Building2,
  FileText
} from 'lucide-react';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';
import Dropdown from '../components/ui/Dropdown';
import { AGENCY_TYPES, EXPERTISE_OPTIONS } from '../data/mockData';

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

    // Dark-mode Map Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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
    // Simulate finding GPS
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add registered agency into local storage list to simulate updating EOC Queue!
    const newAgency = {
      id: `AG-NEW-${Date.now()}`,
      name: agencyInfo.name,
      type: agencyInfo.type,
      district: agencyInfo.district,
      state: agencyInfo.state,
      phone: agencyInfo.phone,
      email: agencyInfo.email,
      status: 'AVAILABLE',
      verificationStatus: 'PENDING',
      verifiedAt: null,
      coordinates: [parseFloat(location.lat), parseFloat(location.lng)],
      expertise: expertise,
      resources: {
        personnel: { total: resources.personnel, available: resources.personnel },
        ambulances: { total: resources.ambulances, available: resources.ambulances },
        rescueVehicles: { total: resources.vehicles, available: resources.vehicles },
        boats: { total: resources.boats, available: resources.boats },
        drones: { total: resources.drones, available: resources.drones },
        medicalKits: { total: resources.kits, available: resources.kits }
      },
      address: location.address,
      lastUpdated: '1 min ago',
      distance: 8.0,
      activeIncidents: 0,
      totalMissions: 0,
      submittedAt: new Date().toISOString()
    };

    // Store new agency list locally
    const existing = localStorage.getItem('samanvay_agencies');
    let agenciesList = [];
    if (existing) {
      agenciesList = JSON.parse(existing);
    } else {
      // Lazy load from default mockData (we will load default inside dashboards)
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

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] text-stone-700 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute inset-0 topo-bg network-bg opacity-15 pointer-events-none" />
        
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-xl p-8 text-center shadow-lg flex flex-col items-center gap-6 relative z-10 fade-in">
          <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <CheckCircle2 size={36} className="animate-bounce" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-stone-900">REGISTRATION SUBMITTED</h2>
            <div className="inline-block mt-2 px-3 py-1 bg-orange-500/10 border border-orange-200 text-orange-700 font-mono text-[10px] font-bold rounded uppercase tracking-wider">
              Status: PENDING VERIFICATION
            </div>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            Your rescue agency credentials and resource lists have been submitted for review. Your agency will become visible on the response network after verification by Pune District Authority EOC.
          </p>

          <div className="w-full border-t border-stone-200 pt-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/')}
              className="w-full font-bold"
            >
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef] text-stone-700 relative pb-16 flex flex-col">
      <div className="absolute inset-0 topo-bg network-bg opacity-15 pointer-events-none" />

      {/* Header */}
      <header className="h-16 border-b border-stone-200 px-6 flex items-center justify-between bg-white/90  sticky top-0 z-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-teal-50 border border-teal-200 text-teal-700">
            <Activity size={16} />
          </div>
          <span className="text-sm font-extrabold tracking-wider text-stone-900">SAMANVAY</span>
        </Link>
        <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
          Network Registration Form
        </span>
      </header>

      {/* Main Wizard */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 mt-10 relative z-10 flex flex-col">
        
        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">Rescue Agency Registry</h2>
          <p className="text-xs text-stone-500 mt-1">Provide precise specifications to integrate your force into SAMANVAY.</p>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                    step === s
                      ? 'bg-teal-700 border-cyan-400 text-stone-900 '
                      : step > s
                      ? 'bg-teal-50 border-teal-600 text-teal-700'
                      : 'bg-[#faf9f6] border-stone-200 text-stone-500'
                  }`}
                >
                  {s}
                </div>
                <span className={`text-[8px] font-mono font-bold tracking-wider mt-1.5 uppercase ${
                  step === s ? 'text-teal-700' : 'text-stone-500'
                }`}>
                  {s === 1 && 'Info'}
                  {s === 2 && 'Expertise'}
                  {s === 3 && 'Location'}
                  {s === 4 && 'Resources'}
                </span>
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-[2.5px] -mt-4 transition-all duration-300 ${
                    step > s ? 'bg-teal-700' : 'bg-stone-100'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Wizard Body Card */}
        <div className="bg-white border border-stone-200 rounded-lg p-6 flex-1 shadow-lg flex flex-col justify-between">
          
          <form onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()} className="flex-1 flex flex-col">
            
            {/* STEP 1: Agency Information */}
            {step === 1 && (
              <div className="flex-1 flex flex-col gap-4 fade-in">
                <div className="border-b border-stone-200 pb-3 mb-2 flex items-center gap-2">
                  <Building2 size={16} className="text-teal-700" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Step 1: Agency Information</h3>
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
                <div className="border-b border-stone-200 pb-3 mb-2 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-teal-700" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Step 2: Tactical Rescue Expertise</h3>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Select disaster rescue disciplines that your tactical unit has certified capabilities to coordinate.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  {EXPERTISE_OPTIONS.map((opt) => {
                    const checked = expertise.includes(opt);
                    return (
                      <label 
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded border text-xs cursor-pointer select-none transition-all ${
                          checked
                            ? 'bg-teal-50 border-teal-300 text-teal-700 font-semibold'
                            : 'bg-[#f5f3ef]/40 border-stone-300 text-stone-500 hover:border-stone-300/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleExpertiseToggle(opt)}
                          className="hidden"
                        />
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                          checked ? 'border-cyan-400 bg-teal-700 text-stone-900' : 'border-stone-300'
                        }`}>
                          {checked && <span className="text-[8px] font-extrabold">✓</span>}
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
                <div className="border-b border-stone-200 pb-3 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-teal-700" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Step 3: Base Location</h3>
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
                    <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Map Pin Locator</span>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="text-teal-700 hover:text-teal-600 font-bold uppercase tracking-wider text-[10px] cursor-pointer flex items-center gap-1 bg-teal-50 border border-teal-600/20 px-2 py-0.5 rounded"
                    >
                      Use Demo HQ Location
                    </button>
                  </div>
                  <div className="flex-1 w-full h-[220px] rounded border border-stone-200 overflow-hidden relative">
                    <div ref={mapContainerRef} className="w-full h-full" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Resources */}
            {step === 4 && (
              <div className="flex-1 flex flex-col gap-4 fade-in">
                <div className="border-b border-stone-200 pb-3 mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-teal-700" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Step 4: Resource Counts</h3>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal">
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
                  <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">Other Equipment Details</label>
                  <textarea
                    rows={2}
                    value={resources.other}
                    onChange={(e) => setResources(prev => ({ ...prev, other: e.target.value }))}
                    placeholder="e.g. Hydraulic cutters, chemical containment gear, life vests, SAT phones..."
                    className="w-full bg-[#faf9f6] border border-stone-200 focus:border-teal-500 text-xs rounded p-2 text-stone-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between border-t border-stone-200 pt-5 mt-6">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={prevStep}
                  icon={<ArrowLeft size={12} />}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={nextStep}
                  iconRight={<ArrowRight size={12} />}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="success"
                  size="sm"
                >
                  Submit for Verification
                </Button>
              )}
            </div>

          </form>

        </div>
      </main>
    </div>
  );
}
