import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Map, Share2, ClipboardList, Activity, ArrowRight, ShieldAlert } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f3ef] text-stone-800 relative overflow-hidden flex flex-col">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 topo-bg network-bg opacity-30 pointer-events-none" />

      {/* Landing Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 flex flex-col pt-16">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Hero Content (left) */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-300 rounded-full text-teal-700 text-xs font-bold w-fit uppercase tracking-widest">
              <ShieldAlert size={12} />
              Unified Disaster response
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight">
              Coordinate Response.<br />
              <span className="text-teal-700">Save Time. Save Lives.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-stone-500 leading-relaxed max-w-xl">
              SAMANVAY represents coordination between district authorities, verified rescue agencies, resources and real-time incident responses. Know who is available, where they are, and coordinate resources instantly.
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <button 
                onClick={() => navigate('/agencies')}
                className="bg-teal-700 hover:bg-teal-600 text-stone-900 font-bold px-6 py-3 rounded text-sm transition-all flex items-center gap-2  hover:shadow-md cursor-pointer"
              >
                Explore Response Network
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => navigate('/register-agency')}
                className="bg-white hover:bg-stone-50 text-teal-700 hover:text-teal-600 border border-stone-300 hover:border-teal-500 font-bold px-6 py-3 rounded text-sm transition-all cursor-pointer"
              >
                Register Rescue Agency
              </button>
            </div>
          </div>

          {/* Hero Visual (right): Sophisticated Emergency Response Map/Network */}
          <div className="lg:col-span-6 flex justify-center relative">
            <div className="w-full max-w-md aspect-square bg-white/80 border border-stone-200 rounded-xl relative p-6 shadow-lg flex flex-col justify-between overflow-hidden">
              {/* Grid backdrop */}
              <div className="absolute inset-0 topo-bg network-bg opacity-15" />
              
              {/* Compass overlay */}
              <div className="absolute top-4 right-4 text-[10px] text-stone-400 font-mono flex flex-col items-end">
                <span>EOC COORDINATION UNIT</span>
                <span>PUNE DISTRICT EOC v1.0</span>
              </div>

              {/* Animated SVG Network Visual */}
              <div className="flex-1 w-full flex items-center justify-center relative my-6">
                <svg className="w-full h-full max-h-[300px] overflow-visible" viewBox="0 0 400 400">
                  {/* Central Node (EOC) */}
                  <circle cx="200" cy="200" r="14" fill="#f5f3ef" stroke="#0f766e" strokeWidth="3" className="" />
                  <circle cx="200" cy="200" r="24" fill="none" stroke="#0f766e" strokeWidth="1" strokeDasharray="3 3" className="animate-spin duration-1000" />
                  
                  {/* Surrounding Agency & Incident Nodes */}
                  {/* NDRF (Verified Green) */}
                  <line x1="200" y1="200" x2="80" y2="120" stroke="#d6d3ce" strokeWidth="1.5" />
                  <circle cx="80" cy="120" r="8" fill="#22c55e" />
                  <circle cx="80" cy="120" r="14" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.4" />
                  <text x="80" y="105" fill="#0f766e" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NDRF UNIT 6</text>

                  {/* SDRF (Verified Green) */}
                  <line x1="200" y1="200" x2="310" y2="90" stroke="#d6d3ce" strokeWidth="1.5" />
                  <circle cx="310" cy="90" r="8" fill="#22c55e" />
                  <text x="310" y="75" fill="#0f766e" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">SDRF UNIT 1</text>

                  {/* Incident Alert (Red Diamond) */}
                  <line x1="200" y1="200" x2="290" y2="280" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" />
                  <rect x="284" y="274" width="12" height="12" fill="#ef4444" transform="rotate(45 290 280)" />
                  <circle cx="290" cy="280" r="18" fill="none" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" style={{ animationDuration: '2s' }} />
                  <text x="290" y="305" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">INCIDENT: FLOOD</text>

                  {/* Medical Unit (Yellow Dot) */}
                  <line x1="200" y1="200" x2="100" y2="290" stroke="#d6d3ce" strokeWidth="1.5" />
                  <circle cx="100" cy="290" r="8" fill="#eab308" />
                  <text x="100" y="315" fill="#0f766e" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">MED UNIT 09</text>

                  {/* Fire Service (Deployed - Red Dot) */}
                  <line x1="80" y1="120" x2="110" y2="210" stroke="#d6d3ce" strokeWidth="1" />
                  <line x1="200" y1="200" x2="110" y2="210" stroke="#d6d3ce" strokeWidth="1.5" />
                  <circle cx="110" cy="210" r="8" fill="#ef4444" />
                  <text x="110" y="195" fill="#0f766e" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">FIRE UNIT 3</text>

                  {/* Data Signal Wave */}
                  <circle cx="200" cy="200" r="60" fill="none" stroke="#0f766e" strokeWidth="1" opacity="0.15" />
                  <circle cx="200" cy="200" r="120" fill="none" stroke="#0f766e" strokeWidth="1" opacity="0.08" />
                </svg>
              </div>

              {/* Status bar bottom */}
              <div className="border-t border-stone-200 pt-3 flex justify-between text-[9px] font-mono text-stone-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full "></span>
                  48 AGENCIES ACTIVE
                </span>
                <span>LAT: 18.5204 / LNG: 73.8567</span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE BLOCKS */}
        <section id="about" className="bg-[#faf9f6] border-y border-stone-200 py-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                Coordinated Emergency Response Architecture
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-2">
                Operational capability tailored specifically for emergency response taskforces and district disaster management cells.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-[#faf9f6] border border-stone-200 rounded-lg p-6 flex flex-col items-start gap-4">
                <div className="p-3 rounded bg-teal-50 border border-teal-200 text-teal-700">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-base font-bold text-stone-900 uppercase tracking-wider">VERIFIED AGENCIES</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  NDRF, SDRF, fire units, police taskforces, and volunteer NGOs register through multi-step checklists. District authorities verify credentials prior to mobilization.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#faf9f6] border border-stone-200 rounded-lg p-6 flex flex-col items-start gap-4">
                <div className="p-3 rounded bg-teal-50 border border-teal-200 text-teal-700">
                  <Map size={20} />
                </div>
                <h3 className="text-base font-bold text-stone-900 uppercase tracking-wider">RESOURCE VISIBILITY</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Live availability statuses of rescue assets including inflatable motorboats, medical ambulances, search drones, heavy response vehicles, and field personnel.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#faf9f6] border border-stone-200 rounded-lg p-6 flex flex-col items-start gap-4">
                <div className="p-3 rounded bg-teal-50 border border-teal-200 text-teal-700">
                  <Share2 size={20} />
                </div>
                <h3 className="text-base font-bold text-stone-900 uppercase tracking-wider">COORDINATED RESPONSE</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Send structured emergency assistance requests. Track milestones from initiation, EOC acknowledgement, resource dispatch, on-site deployment, through to resolution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW SAMANVAY WORKS */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-12">
            Disaster Response Lifecycle
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 items-center max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white border border-stone-200 rounded p-4 relative">
              <div className="text-teal-700 font-mono font-bold text-xs mb-1">01. REGISTER</div>
              <p className="text-[10px] text-stone-500">Agencies submit profiles, map coordinates, and assets list.</p>
            </div>
            
            <div className="hidden sm:block text-stone-400 text-lg font-bold">→</div>

            {/* Step 2 */}
            <div className="bg-white border border-stone-200 rounded p-4">
              <div className="text-teal-700 font-mono font-bold text-xs mb-1">02. VERIFY</div>
              <p className="text-[10px] text-stone-500">District authority reviews background data and approves credentials.</p>
            </div>

            <div className="hidden sm:block text-stone-400 text-lg font-bold">→</div>

            {/* Step 3 */}
            <div className="bg-white border border-stone-200 rounded p-4">
              <div className="text-teal-700 font-mono font-bold text-xs mb-1">03. DISCOVER</div>
              <p className="text-[10px] text-stone-500">Filter agencies near active incidents via the live GIS system.</p>
            </div>

            <div className="hidden sm:block text-stone-400 text-lg font-bold">→</div>

            {/* Step 4 */}
            <div className="bg-white border border-stone-200 rounded p-4">
              <div className="text-teal-700 font-mono font-bold text-xs mb-1">04. COORDINATE</div>
              <p className="text-[10px] text-stone-500">Send dispatch alerts and structured resource support requests.</p>
            </div>

            <div className="hidden sm:block text-stone-400 text-lg font-bold">→</div>

            {/* Step 5 */}
            <div className="bg-white border border-stone-200 rounded p-4">
              <div className="text-teal-700 font-mono font-bold text-xs mb-1">05. RESPOND</div>
              <p className="text-[10px] text-stone-500">Teams dispatch, update statuses on-ground, and resolve missions.</p>
            </div>
          </div>

          <div className="mt-14 bg-[#faf9f6] border border-stone-200 max-w-2xl mx-auto rounded-lg p-6 flex flex-col items-center gap-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Access Demo Control Rooms</h3>
            <p className="text-xs text-stone-500 max-w-md">
              Toggle simulated views instantly on any screen to view how authorities manage incidents, how agencies receive dispatches, or what public observer mode blocks.
            </p>
            <div className="flex gap-4">
              <Link 
                to="/authority/dashboard" 
                className="bg-teal-700 hover:bg-teal-600 text-stone-900 font-bold px-4 py-2 rounded text-xs transition-colors cursor-pointer"
              >
                District EOC Dashboard
              </Link>
              <Link 
                to="/agency/dashboard" 
                className="bg-white hover:bg-stone-50 text-teal-700 hover:text-teal-600 border border-stone-300 hover:border-teal-500 font-bold px-4 py-2 rounded text-xs transition-colors cursor-pointer"
              >
                Agency Rescue Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-stone-200 bg-[#faf9f6] py-6 text-center text-xs text-stone-400 relative z-10 font-mono">
        <p>© 2026 SAMANVAY Unified Emergency response. All rights reserved.</p>
        <p className="mt-1 text-[10px] text-stone-400">Prototype demo build for SIH project. Constructed using fictional records.</p>
      </footer>
    </div>
  );
}
