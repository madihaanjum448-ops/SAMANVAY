import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, ShieldCheck, ShieldAlert, KeyRound, Mail, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'authority';

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('samanvay_role', role);
      
      if (role === 'authority') {
        navigate('/authority/dashboard');
      } else {
        navigate('/agency/dashboard');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef] grid grid-cols-1 lg:grid-cols-12 text-stone-700">
      
      {/* LEFT SIDE: Brand & Operational Visuals */}
      <div className="hidden lg:flex lg:col-span-7 bg-[#faf9f6] border-r border-stone-200 relative flex-col justify-between p-12 overflow-hidden">
        {/* Grid Overlay */}
        <div className="absolute inset-0 topo-bg network-bg opacity-20 pointer-events-none" />
        
        {/* Header Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="p-1.5 rounded bg-teal-50 border border-teal-200 text-teal-700">
            <Activity size={18} className="animate-pulse" />
          </div>
          <span className="text-base font-extrabold tracking-wider text-stone-900">SAMANVAY</span>
        </div>

        {/* Core Tagline Info */}
        <div className="relative z-10 max-w-lg my-auto flex flex-col gap-6">
          <h2 className="text-3xl font-extrabold text-stone-900 leading-tight tracking-tight">
            Unified Emergency Response Command Portal
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed">
            Authorized portal for Pune District Emergency Operations Center (EOC) and verified tactical rescue groups. Access resource databases, live situation logs, and trigger coordination tasks.
          </p>

          <div className="flex flex-col gap-3.5 bg-[#f5f3ef]/50 border border-stone-300 p-4 rounded-lg font-mono text-xs">
            <div className="flex items-center justify-between text-stone-500">
              <span>SYSTEM LOGS:</span>
              <span className="text-teal-700 font-bold">NOMINAL</span>
            </div>
            <div className="text-[10px] text-stone-500 space-y-1">
              <div>&gt; EOC Server initialized: Port 8080 active</div>
              <div>&gt; Live GIS Interface synchronizing with ISRO Bhuvan</div>
              <div>&gt; 48 vetted tactical responder groups connected</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[10px] font-mono text-stone-400">
          SECURE PROTOCOL CLASSIFIED • DEMONSTRATION MODE ONLY
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Login Form */}
      <div className="lg:col-span-5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 relative">
        <div className="absolute inset-0 topo-bg network-bg opacity-10 lg:hidden" />
        
        <div className="w-full max-w-sm mx-auto relative z-10">
          
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="p-1.5 rounded bg-teal-50 border border-teal-200 text-teal-700">
              <Activity size={16} />
            </div>
            <span className="text-sm font-extrabold tracking-wider text-stone-900">SAMANVAY</span>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-stone-900 tracking-tight">Access Dashboard</h3>
            <p className="text-xs text-stone-500 mt-1">Select your designated response role to log in.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Role selection tab style */}
            <div className="grid grid-cols-2 gap-2 bg-white border border-stone-300 p-1 rounded">
              <button
                type="button"
                onClick={() => setRole('authority')}
                className={`py-2 px-3 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  role === 'authority'
                    ? 'bg-teal-700 text-stone-900 '
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <ShieldAlert size={12} />
                District EOC
              </button>
              <button
                type="button"
                onClick={() => setRole('agency')}
                className={`py-2 px-3 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  role === 'agency'
                    ? 'bg-green-600 text-stone-900 '
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <ShieldCheck size={12} />
                Rescue Agency
              </button>
            </div>

            {/* Email Field */}
            <FormInput
              id="login-email"
              label="Official Email"
              type="email"
              placeholder="e.g. ops.pune@ndrf.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password Field */}
            <FormInput
              id="login-password"
              label="Portal Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Remember & Forgot options */}
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded bg-stone-50 border-stone-200 text-cyan-500 focus:ring-0 w-3.5 h-3.5" />
                <span>Keep session active</span>
              </label>
              <a href="#" className="hover:text-teal-700 transition-colors" onClick={(e) => e.preventDefault()}>Forgot password?</a>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant={role === 'authority' ? 'primary' : 'success'}
              loading={loading}
              className="w-full mt-2 font-bold"
            >
              Sign In
            </Button>
          </form>

          {/* Agency Registration Link */}
          <div className="text-center mt-6 text-xs border-t border-stone-300 pt-5">
            <span className="text-stone-500">Not part of the coordination network?</span>
            <br />
            <button
              onClick={() => navigate('/register-agency')}
              className="text-teal-700 hover:text-teal-600 font-bold inline-flex items-center gap-1 mt-1 transition-colors hover:underline cursor-pointer"
            >
              Register Rescue Agency <ArrowRight size={12} />
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
