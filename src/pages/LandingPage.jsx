import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import {
  ShieldCheck,
  ArrowRight,
  Building2,
  Box,
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle2,
  Share2,
  Activity,
  Shield,
  BarChart3
} from 'lucide-react';

import Navbar from '../components/layout/Navbar';
import MapView from '../components/map/MapView';
import { MOCK_AGENCIES, MOCK_INCIDENTS } from '../data/mockData';
import { api } from '../services/api';

export default function LandingPage() {
  const navigate = useNavigate();

  // ============================================================
  // BACKEND STATISTICS
  // ============================================================

  const [stats, setStats] = useState({
    verifiedAgencies: 0,
    activeResources: 0,
    activeIncidents: 0,
    districtsCovered: 0,
    avgResponseTime: '—'
  });

  // ============================================================
  // LOAD DATA FROM EXPRESS BACKEND
  // ============================================================

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [agencies, incidents, resources] = await Promise.all([
          api.agencies.getAll(),
          api.incidents.getAll(),
          api.resources.getAll()
        ]);

        const verifiedAgencies = agencies.filter(
          (agency) =>
            agency.verificationStatus === 'VERIFIED' ||
            agency.status === 'VERIFIED'
        ).length;

        const activeIncidents = incidents.filter(
          (incident) =>
            incident.status === 'ACTIVE'
        ).length;

        const activeResources = resources.length;

        const districts = new Set(
          agencies
            .map((agency) => agency.district)
            .filter(Boolean)
        );

        const districtsCovered = districts.size;

        setStats({
          verifiedAgencies,
          activeResources,
          activeIncidents,
          districtsCovered,
          avgResponseTime: '—'
        });

      } catch (error) {
        console.error(
          '[SAMANVAY] Failed to load backend statistics:',
          error
        );
      }
    };

    loadStats();
  }, []);

  // ============================================================
  // MAP MARKERS
  // ============================================================

  const mapMarkers = useMemo(() => {
    const agencyMarkers = MOCK_AGENCIES.map((a) => ({
      id: a.id,
      name: a.name,
      coordinates: a.coordinates,
      type: 'agency',
      agencyType: a.agencyType,
      status: a.status,
      district: a.district,
      state: a.state,
      resources: a.resources
    }));

    const incidentMarkers = MOCK_INCIDENTS.map((i) => ({
      id: i.id,
      name: i.title,
      coordinates: i.coordinates,
      type: 'incident',
      severity: i.severity,
      incidentType: i.type,
      location: i.location,
      description: i.description,
      time: i.reportedAt
    }));

    return [...agencyMarkers, ...incidentMarkers];
  }, []);

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#111827] flex flex-col font-sans">

      {/* ====================================================== */}
      {/* NAVIGATION */}
      {/* ====================================================== */}

      <Navbar />

      {/* ====================================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================================== */}

      <main className="flex-1 pt-20">

        {/* ================================================== */}
        {/* HERO SECTION */}
        {/* ================================================== */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT SIDE */}

          <div className="lg:col-span-6 flex flex-col gap-6 text-left">

            {/* Badge */}

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F0FDF4] border border-[#DCFCE7] rounded-full text-[#166534] text-xs font-bold w-fit uppercase tracking-widest">

              <ShieldCheck
                size={14}
                className="text-[#166534]"
              />

              UNIFIED DISASTER RESPONSE

            </div>

            {/* Heading */}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight">

              <span className="text-[#111827]">
                Coordinate Response.
              </span>

              <br />

              <span className="text-[#166534]">
                Save Time. Save Lives.
              </span>

            </h1>

            {/* Description */}

            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl">

              SAMANVAY connects verified agencies, resources and authorities
              on one platform for faster coordination during disasters.

            </p>

            {/* Buttons */}

            <div className="flex flex-wrap items-center gap-4 pt-2">

              <button
                onClick={() => navigate('/register-agency')}
                className="bg-[#166534] hover:bg-[#14532D] text-white font-bold px-6 py-3.5 rounded-md text-sm transition-all cursor-pointer shadow-xs"
              >

                Register Your Agency

              </button>

            </div>

            {/* Trust Checklist */}

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#475569] pt-3">

              <span className="flex items-center gap-1.5 text-[#166534]">

                <CheckCircle2 size={16} />

                Verified Agencies

              </span>

              <span className="text-[#CBD5E1]">
                •
              </span>

              <span>
                Real-time Updates
              </span>

              <span className="text-[#CBD5E1]">
                •
              </span>

              <span>
                Secure & Reliable
              </span>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="lg:col-span-6 relative">

            <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white shadow-md">

              <img
                src="/images/hero_eoc.jpg"
                alt="Emergency Operations Center Control Room"
                className="w-full h-[380px] sm:h-[440px] object-cover object-center"
              />

              {/* Overlay Badge */}

              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-3.5 rounded-lg border border-[#E5E7EB] flex items-center justify-between shadow-xs">

                <div className="flex items-center gap-2.5">

                  <span className="w-2.5 h-2.5 rounded-full bg-[#166534] status-pulse"></span>

                  <div className="flex flex-col">

                    <span className="text-xs font-bold text-[#111827]">
                      PUNE DISTRICT EOC COMMAND ROOM
                    </span>

                    <span className="text-[10px] text-[#64748B] font-mono">
                      LIVE GIS & RESCUE FEEDS ACTIVE
                    </span>

                  </div>

                </div>

                <span className="text-[11px] font-bold text-[#166534] bg-[#F0FDF4] px-2.5 py-1 rounded border border-[#DCFCE7]">
                  24/7 ONLINE
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================== */}
        {/* LIVE PLATFORM STATISTICS */}
        {/* ================================================== */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">

          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 shadow-xs grid grid-cols-2 md:grid-cols-5 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E7EB]">

            {/* VERIFIED AGENCIES */}

            <div className="flex flex-col items-center text-center p-2">

              <div className="p-2.5 bg-[#F0FDF4] text-[#166534] rounded-lg mb-2">
                <Building2 size={22} />
              </div>

              <span className="text-3xl font-extrabold text-[#111827] tracking-tight">

                {stats.verifiedAgencies}

              </span>

              <span className="text-xs font-semibold text-[#64748B] mt-1 uppercase tracking-wider">
                Verified Agencies
              </span>

            </div>

            {/* ACTIVE RESOURCES */}

            <div className="flex flex-col items-center text-center p-2 pt-4 sm:pt-2">

              <div className="p-2.5 bg-[#F0FDF4] text-[#166534] rounded-lg mb-2">
                <Box size={22} />
              </div>

              <span className="text-3xl font-extrabold text-[#111827] tracking-tight">

                {stats.activeResources}

              </span>

              <span className="text-xs font-semibold text-[#64748B] mt-1 uppercase tracking-wider">
                Active Resources
              </span>

            </div>

            {/* ACTIVE INCIDENTS */}

            <div className="flex flex-col items-center text-center p-2 pt-4 sm:pt-2">

              <div className="p-2.5 bg-[#FEF2F2] text-[#DC2626] rounded-lg mb-2">
                <AlertTriangle size={22} />
              </div>

              <span className="text-3xl font-extrabold text-[#111827] tracking-tight">

                {stats.activeIncidents}

              </span>

              <span className="text-xs font-semibold text-[#64748B] mt-1 uppercase tracking-wider">
                Active Incidents
              </span>

            </div>

            {/* DISTRICTS */}

            <div className="flex flex-col items-center text-center p-2 pt-4 sm:pt-2">

              <div className="p-2.5 bg-[#F0FDF4] text-[#166534] rounded-lg mb-2">
                <MapPin size={22} />
              </div>

              <span className="text-3xl font-extrabold text-[#111827] tracking-tight">

                {stats.districtsCovered}

              </span>

              <span className="text-xs font-semibold text-[#64748B] mt-1 uppercase tracking-wider">
                Districts Covered
              </span>

            </div>

            {/* RESPONSE TIME */}

            <div className="flex flex-col items-center text-center p-2 pt-4 sm:pt-2 col-span-2 md:col-span-1">

              <div className="p-2.5 bg-[#FFF7ED] text-[#EA580C] rounded-lg mb-2">
                <Clock size={22} />
              </div>

              <span className="text-3xl font-extrabold text-[#111827] tracking-tight">

                {stats.avgResponseTime}

              </span>

              <span className="text-xs font-semibold text-[#64748B] mt-1 uppercase tracking-wider">
                Avg. Response Time
              </span>

            </div>

          </div>

        </section>

        {/* ================================================== */}
        {/* THE PROBLEM WE SOLVE */}
        {/* ================================================== */}

        <section className="bg-white border-y border-[#E5E7EB] py-16 lg:py-24">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-3xl mx-auto mb-14">

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight uppercase">
                THE PROBLEM WE SOLVE
              </h2>

              <div className="w-16 h-1 bg-[#166534] rounded-full mx-auto mt-3" />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* CARD 1 */}

              <div className="bg-[#F7F5EF] border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col card-hover">

                <img
                  src="/images/flood_rescue.jpg"
                  alt="Disasters Strike Suddenly"
                  className="w-full h-48 object-cover"
                />

                <div className="p-6 flex flex-col flex-1">

                  <h3 className="text-lg font-bold text-[#111827] mb-2">
                    Disasters Strike Suddenly
                  </h3>

                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Floods, earthquakes, fires and other disasters cause
                    massive disruption and loss.
                  </p>

                </div>

              </div>

              {/* CARD 2 */}

              <div className="bg-[#F7F5EF] border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col card-hover">

                <img
                  src="/images/agency_silos.jpg"
                  alt="Agencies Operate in Silos"
                  className="w-full h-48 object-cover"
                />

                <div className="p-6 flex flex-col flex-1">

                  <h3 className="text-lg font-bold text-[#111827] mb-2">
                    Agencies Operate in Silos
                  </h3>

                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Information is scattered across calls, messages and
                    different departments.
                  </p>

                </div>

              </div>

              {/* CARD 3 */}

              <div className="bg-[#F7F5EF] border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col card-hover">

                <img
                  src="/images/rescue_vehicles.jpg"
                  alt="Resources Are Unclear"
                  className="w-full h-48 object-cover"
                />

                <div className="p-6 flex flex-col flex-1">

                  <h3 className="text-lg font-bold text-[#111827] mb-2">
                    Resources Are Unclear
                  </h3>

                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Lack of visibility of available resources leads to
                    delays and inefficient deployment.
                  </p>

                </div>

              </div>

              {/* CARD 4 */}

              <div className="bg-[#F7F5EF] border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col card-hover">

                <img
                  src="/images/control_room.jpg"
                  alt="Coordination Is Difficult"
                  className="w-full h-48 object-cover"
                />

                <div className="p-6 flex flex-col flex-1">

                  <h3 className="text-lg font-bold text-[#111827] mb-2">
                    Coordination Is Difficult
                  </h3>

                  <p className="text-xs text-[#64748B] leading-relaxed">
                    No single platform to coordinate, track and manage
                    response in real-time.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================== */}
        {/* SAMANVAY SOLUTION */}
        {/* ================================================== */}

        <section className="bg-[#F0FDF4] border-b border-[#DCFCE7] py-16">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

              {/* FEATURE 1 */}

              <div className="flex flex-col items-start gap-3">

                <div className="w-12 h-12 rounded-lg bg-white border border-[#DCFCE7] flex items-center justify-center text-[#166534] shadow-2xs">
                  <Share2 size={24} />
                </div>

                <h3 className="text-base font-bold text-[#111827]">
                  1. Unified Coordination
                </h3>

                <p className="text-xs text-[#475569] leading-relaxed">
                  Brings all agencies and authorities onto one platform.
                </p>

              </div>

              {/* FEATURE 2 */}

              <div className="flex flex-col items-start gap-3">

                <div className="w-12 h-12 rounded-lg bg-white border border-[#DCFCE7] flex items-center justify-center text-[#166534] shadow-2xs">
                  <Activity size={24} />
                </div>

                <h3 className="text-base font-bold text-[#111827]">
                  2. Real-time Visibility
                </h3>

                <p className="text-xs text-[#475569] leading-relaxed">
                  Live tracking of incidents, resources and deployments.
                </p>

              </div>

              {/* FEATURE 3 */}

              <div className="flex flex-col items-start gap-3">

                <div className="w-12 h-12 rounded-lg bg-white border border-[#DCFCE7] flex items-center justify-center text-[#166534] shadow-2xs">
                  <ShieldCheck size={24} />
                </div>

                <h3 className="text-base font-bold text-[#111827]">
                  3. Verified & Trusted
                </h3>

                <p className="text-xs text-[#475569] leading-relaxed">
                  Only verified agencies and resources ensure reliability.
                </p>

              </div>

              {/* FEATURE 4 */}

              <div className="flex flex-col items-start gap-3">

                <div className="w-12 h-12 rounded-lg bg-white border border-[#DCFCE7] flex items-center justify-center text-[#166534] shadow-2xs">
                  <BarChart3 size={24} />
                </div>

                <h3 className="text-base font-bold text-[#111827]">
                  4. Data-driven Decisions
                </h3>

                <p className="text-xs text-[#475569] leading-relaxed">
                  Insights and reports to improve response and preparedness.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================== */}
        {/* RESPONSE NETWORK */}
        {/* ================================================== */}

        <section
          id="about"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24"
        >

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* LEFT */}

            <div className="lg:col-span-5 flex flex-col gap-5 text-left">

              <span className="text-xs font-bold text-[#166534] uppercase tracking-widest">
                GIS OPERATIONAL NETWORK
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
                One Network. Every Response.
              </h2>

              <p className="text-sm text-[#64748B] leading-relaxed">
                District authorities and emergency teams can discover
                verified rescue agencies based on live geographic location,
                specialized expertise, operational availability, and
                deployment-ready equipment.
              </p>

              <div>

                <button
                  onClick={() => navigate('/agencies')}
                  className="bg-[#166534] hover:bg-[#14532D] text-white font-bold px-6 py-3 rounded-md text-sm transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >

                  Explore Response Network

                  <ArrowRight size={16} />

                </button>

              </div>

            </div>

            {/* MAP */}

            <div className="lg:col-span-7 h-[420px] rounded-xl overflow-hidden border border-[#E5E7EB] shadow-xs">

              <MapView
                markers={mapMarkers}
                center={[18.5204, 73.8567]}
                zoom={11}
              />

            </div>

          </div>

        </section>

        {/* ================================================== */}
        {/* HOW IT WORKS */}
        {/* ================================================== */}

        <section
          id="how-it-works"
          className="bg-white border-t border-[#E5E7EB] py-16 lg:py-24"
        >

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight uppercase mb-4">
              HOW IT WORKS
            </h2>

            <p className="text-sm text-[#64748B] max-w-xl mx-auto mb-14">
              Standardized four-step operational workflow connecting rescue
              agencies and district control rooms.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto relative">

              {/* STEP 1 */}

              <div className="bg-[#F7F5EF] border border-[#E5E7EB] rounded-xl p-6 flex flex-col items-start text-left relative">

                <span className="text-3xl font-black text-[#166534] font-mono mb-2">
                  01
                </span>

                <h3 className="text-base font-bold text-[#111827] mb-1">
                  Register
                </h3>

                <p className="text-xs text-[#64748B] leading-relaxed">
                  Agencies submit their details, expertise, location and
                  resources.
                </p>

              </div>

              {/* STEP 2 */}

              <div className="bg-[#F7F5EF] border border-[#E5E7EB] rounded-xl p-6 flex flex-col items-start text-left relative">

                <span className="text-3xl font-black text-[#166534] font-mono mb-2">
                  02
                </span>

                <h3 className="text-base font-bold text-[#111827] mb-1">
                  Verify
                </h3>

                <p className="text-xs text-[#64748B] leading-relaxed">
                  District authorities verify and approve agencies.
                </p>

              </div>

              {/* STEP 3 */}

              <div className="bg-[#F7F5EF] border border-[#E5E7EB] rounded-xl p-6 flex flex-col items-start text-left relative">

                <span className="text-3xl font-black text-[#166534] font-mono mb-2">
                  03
                </span>

                <h3 className="text-base font-bold text-[#111827] mb-1">
                  Discover
                </h3>

                <p className="text-xs text-[#64748B] leading-relaxed">
                  Authorities can find nearby agencies and available
                  resources during incidents.
                </p>

              </div>

              {/* STEP 4 */}

              <div className="bg-[#F7F5EF] border border-[#E5E7EB] rounded-xl p-6 flex flex-col items-start text-left relative">

                <span className="text-3xl font-black text-[#166534] font-mono mb-2">
                  04
                </span>

                <h3 className="text-base font-bold text-[#111827] mb-1">
                  Coordinate
                </h3>

                <p className="text-xs text-[#64748B] leading-relaxed">
                  Send assistance requests, track deployment and resolve
                  missions.
                </p>

              </div>

            </div>

            {/* ================================================== */}
            {/* ACCESS CONTROL ROOMS */}
            {/* ================================================== */}

            <div
              id="contact"
              className="mt-16 bg-[#F7F5EF] border border-[#E5E7EB] max-w-2xl mx-auto rounded-xl p-8 flex flex-col items-center gap-4"
            >

              <h3 className="text-base font-bold text-[#111827]">
                Access Control Rooms & Simulation
              </h3>

              <p className="text-xs text-[#64748B] max-w-md leading-relaxed">
                Toggle between simulated views to test how district
                authorities authorize assistance requests or how rescue
                agencies update live inventory.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">

                <Link
                  to="/authority/dashboard"
                  className="bg-[#166534] hover:bg-[#14532D] text-white font-bold px-5 py-2.5 rounded-md text-xs transition-colors cursor-pointer shadow-xs"
                >
                  District EOC Dashboard
                </Link>

                <Link
                  to="/agency/dashboard"
                  className="bg-white hover:bg-stone-50 text-[#166534] border border-[#E5E7EB] font-bold px-5 py-2.5 rounded-md text-xs transition-colors cursor-pointer"
                >
                  Agency Rescue Dashboard
                </Link>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* ====================================================== */}
      {/* FOOTER */}
      {/* ====================================================== */}

      <footer className="border-t border-[#E5E7EB] bg-[#F7F5EF] py-8 text-center text-xs text-[#64748B]">

        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">

          <div className="flex items-center gap-2">

            <Shield
              size={16}
              className="text-[#166534]"
            />

            <span className="font-bold text-[#111827]">
              SAMANVAY
            </span>

            <span>
              — Unified Disaster Response & Resource Coordination Platform
            </span>

          </div>

          <p>
            © 2026 National Emergency Response Operations Cell.
            All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}