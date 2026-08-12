import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-500/60 transition-colors">
            <Activity size={18} className="animate-pulse" />
          </div>
          <span className="text-base font-extrabold tracking-wider text-white">SAMANVAY</span>
        </Link>

        {/* Navigation links (landing page scroll targets or simple route links) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-400">
          <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
          <Link to="/agencies" className="hover:text-cyan-400 transition-colors">Response Network</Link>
          <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link 
            to="/login?role=authority"
            className="text-xs font-bold text-gray-400 hover:text-cyan-400 px-3 py-2 transition-colors border border-transparent hover:border-slate-800 rounded"
          >
            Authority EOC
          </Link>
          <Link 
            to="/login?role=agency"
            className="bg-navy-800 hover:bg-navy-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500 text-xs font-bold px-3 py-1.5 rounded transition-all"
          >
            Agency Login
          </Link>
        </div>
      </div>
    </header>
  );
}
