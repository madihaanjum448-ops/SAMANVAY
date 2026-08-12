import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 shadow-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded bg-teal-50 border border-teal-200 text-teal-700 group-hover:border-teal-400 transition-colors">
            <Activity size={18} className="" />
          </div>
          <span className="text-base font-extrabold tracking-wider text-stone-900">SAMANVAY</span>
        </Link>

        {/* Navigation links (landing page scroll targets or simple route links) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-stone-600">
          <Link to="/" className="hover:text-teal-700 transition-colors">Home</Link>
          <a href="#how-it-works" className="hover:text-teal-700 transition-colors">How It Works</a>
          <Link to="/agencies" className="hover:text-teal-700 transition-colors">Response Network</Link>
          <a href="#about" className="hover:text-teal-700 transition-colors">About</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link 
            to="/login?role=authority"
            className="text-xs font-bold text-stone-600 hover:text-teal-700 px-3 py-2 transition-colors border border-transparent hover:border-stone-200 rounded"
          >
            Authority EOC
          </Link>
          <Link 
            to="/login?role=agency"
            className="bg-white hover:bg-stone-50 text-teal-700 hover:text-teal-600 border border-stone-300 hover:border-teal-500 text-xs font-bold px-3 py-1.5 rounded transition-all"
          >
            Agency Login
          </Link>
        </div>
      </div>
    </header>
  );
}
