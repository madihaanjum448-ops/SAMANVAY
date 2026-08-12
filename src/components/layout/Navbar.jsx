import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Menu, X } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LEFT: SAMANVAY Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-md bg-[#166534] flex items-center justify-center text-white shadow-xs group-hover:bg-[#14532D] transition-colors">
            <Shield size={22} className="stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-wide text-[#111827] leading-none">
              SAMANVAY
            </span>
            <span className="text-[10px] font-bold tracking-widest text-[#166534] uppercase mt-0.5">
              UNIFIED DISASTER RESPONSE
            </span>
          </div>
        </Link>

        {/* CENTER: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#374151]">
          <Link to="/" className="hover:text-[#166534] transition-colors">
            Home
          </Link>
          <a href="#how-it-works" className="hover:text-[#166534] transition-colors">
            How It Works
          </a>
          <Link to="/agencies" className="hover:text-[#166534] transition-colors">
            Response Network
          </Link>
          <a href="#about" className="hover:text-[#166534] transition-colors">
            About
          </a>
          <a href="#contact" className="hover:text-[#166534] transition-colors">
            Contact
          </a>
        </nav>

        {/* RIGHT: Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/login?role=authority"
            className="text-xs font-bold text-[#374151] hover:text-[#166534] px-4 py-2.5 rounded-md border border-[#E5E7EB] hover:border-[#CBD5E1] bg-white transition-all shadow-2xs"
          >
            Authority EOC
          </Link>
          <Link
            to="/login?role=agency"
            className="bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold px-4 py-2.5 rounded-md transition-all shadow-xs flex items-center gap-1.5"
          >
            Agency Login
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-[#374151] hover:bg-[#F7F5EF] transition-colors border border-[#E5E7EB]"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E5E7EB] px-4 pt-3 pb-6 flex flex-col gap-4 fade-in">
          <nav className="flex flex-col gap-3 text-sm font-semibold text-[#374151]">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#166534]"
            >
              Home
            </Link>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#166534]"
            >
              How It Works
            </a>
            <Link 
              to="/agencies" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#166534]"
            >
              Response Network
            </Link>
            <a 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#166534]"
            >
              About
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#166534]"
            >
              Contact
            </a>
          </nav>

          <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E7EB]">
            <Link
              to="/login?role=authority"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-xs font-bold text-[#374151] px-4 py-2.5 rounded-md border border-[#E5E7EB]"
            >
              Authority EOC
            </Link>
            <Link
              to="/login?role=agency"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold px-4 py-2.5 rounded-md flex items-center justify-center gap-1.5"
            >
              Agency Login
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
