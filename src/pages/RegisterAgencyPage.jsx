import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { AGENCY_TYPES, EXPERTISE_OPTIONS, MOCK_AGENCIES } from '../data/mockData';
import { api } from '../services/api';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const STATE_DISTRICTS = MOCK_AGENCIES.reduce((acc, agency) => {
  if (agency.state && agency.district) {
    if (!acc[agency.state]) acc[agency.state] = new Set();
    acc[agency.state].add(agency.district);
  }
  return acc;
}, {});
Object.keys(STATE_DISTRICTS).forEach(state => {
  STATE_DISTRICTS[state] = Array.from(STATE_DISTRICTS[state]).sort();
});
const STATES_LIST = Object.keys(STATE_DISTRICTS).sort();

export default function RegisterAgencyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [agencyInfo, setAgencyInfo] = useState({
    name: '',
    type: '',
    phone: '',
    email: '',
  });

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
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

  const nextStep = () => {
    if (step === 2 && !selectedState) {
      alert('Please select a State to continue.');
      return;
    }
    if (step === 3 && !selectedDistrict) {
      alert('Please select a District to continue.');
      return;
    }
    setStep(prev => prev + 1);
  };
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 4) return; // Guard against accidental submit on non-final steps
    
    const agencyData = {
      id: `AG-${Date.now()}`,
      name: agencyInfo.name,
      type: agencyInfo.type,
      district: selectedDistrict || 'Pune',
      state: selectedState || 'Maharashtra',
      phone: agencyInfo.phone,
      email: agencyInfo.email,
      expertise: expertise,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address
      },
      address: location.address,
      resources: resources,
      verificationStatus: 'PENDING',
      status: 'PENDING_VERIFICATION',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    };

    try {
      // Write to Firestore
      await addDoc(collection(db, 'agencies'), agencyData);
    } catch (err) {
      console.warn('[SAMANVAY] Firestore direct write failed, proceeding with local fallback:', err);
    }

    // Single localStorage write — agency goes into list with PENDING status
    const existing = localStorage.getItem('samanvay_agencies');
    let agenciesList = existing ? JSON.parse(existing) : [];
    agenciesList.push(agencyData);
    localStorage.setItem('samanvay_agencies', JSON.stringify(agenciesList));

    // Update notifications to show submission queued for EOC review
    const storedNotifs = localStorage.getItem('samanvay_notifications');
    let notifs = storedNotifs ? JSON.parse(storedNotifs) : [];
    const newNotif = {
      id: Date.now(),
      type: 'alert',
      title: 'New Agency Registration',
      message: `${agencyInfo.name} (${agencyInfo.type}) submitted for EOC verification.`,
      time: 'Just now',
      read: false
    };
    notifs.unshift(newNotif);
    localStorage.setItem('samanvay_notifications', JSON.stringify(notifs));

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
              Status: PENDING EOC VERIFICATION
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
                  {s === 1 && 'Info & Expertise'}
                  {s === 2 && 'State'}
                  {s === 3 && 'District'}
                  {s === 4 && 'Details & Resources'}
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
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            
            {/* STEP 1: Agency Information & Expertise */}
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
                  onChange={(value) => handleInfoChange('type', value)}
                  required
                />

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

                <div className="border-t border-[#E5E7EB] pt-4 mt-2">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Tactical Rescue Expertise</span>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPERTISE_OPTIONS.map((opt) => {
                      const checked = expertise.includes(opt);
                      return (
                        <label 
                          key={opt}
                          className={`flex items-center gap-2 p-2 rounded border text-xs cursor-pointer select-none transition-all ${
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
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                            checked ? 'border-[#166534] bg-[#166534] text-white' : 'border-[#CBD5E1]'
                          }`}>
                            {checked && <span className="text-[9px] font-bold">✓</span>}
                          </div>
                          <span className="truncate">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: State Selection */}
            {step === 2 && (
              <div className="flex-1 flex flex-col gap-4 fade-in">
                <div className="border-b border-[#E5E7EB] pb-3 mb-2 flex items-center gap-2">
                  <MapPin size={18} className="text-[#166534]" />
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Step 2: Select State</h3>
                </div>
                <p className="text-xs text-[#64748B] leading-normal">
                  Select the operational state for the rescue agency. State selection is required before selecting the district.
                </p>

                <div className="mt-4">
                  <Dropdown
                    id="reg-state"
                    label="State"
                    options={STATES_LIST}
                    value={selectedState}
                    onChange={(value) => {
                      setSelectedState(value);
                      setSelectedDistrict(''); // reset district selection
                    }}
                    required
                  />
                </div>
              </div>
            )}

            {/* STEP 3: District Selection */}
            {step === 3 && (
              <div className="flex-1 flex flex-col gap-4 fade-in">
                <div className="border-b border-[#E5E7EB] pb-3 mb-2 flex items-center gap-2">
                  <MapPin size={18} className="text-[#166534]" />
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Step 3: Select District</h3>
                </div>
                <p className="text-xs text-[#64748B] leading-normal">
                  Select the district belonging to your state: <strong className="text-[#111827]">{selectedState}</strong>.
                </p>

                <div className="mt-4">
                  <Dropdown
                    id="reg-district"
                    label="District"
                    options={selectedState ? STATE_DISTRICTS[selectedState] : []}
                    value={selectedDistrict}
                    onChange={(value) => setSelectedDistrict(value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Details & Resources */}
            {step === 4 && (
              <div className="flex-1 flex flex-col gap-4 fade-in">
                <div className="border-b border-[#E5E7EB] pb-3 mb-2 flex items-center gap-2">
                  <FileText size={18} className="text-[#166534]" />
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Step 4: Location & Resources</h3>
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
                    label="Latitude (Optional)"
                    value={location.lat}
                    onChange={(e) => setLocation(prev => ({ ...prev, lat: e.target.value }))}
                  />
                  <FormInput
                    id="reg-lng"
                    label="Longitude (Optional)"
                    value={location.lng}
                    onChange={(e) => setLocation(prev => ({ ...prev, lng: e.target.value }))}
                  />
                </div>

                <div className="border-t border-[#E5E7EB] pt-4 mt-2">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Available Resources</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
