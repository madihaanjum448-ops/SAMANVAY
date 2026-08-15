import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';
import { api } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('collector.pune@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.auth.login({ email, password });
      setLoading(false);
      
      if (res?.success && res?.user) {
        const userRole = res.user.role;
        if (userRole === 'agency_admin') {
          navigate('/agency/dashboard');
        } else if (userRole === 'district_eoc' || userRole === 'state_authority') {
          navigate('/authority/dashboard');
        } else {
          setError('Logged in user has an invalid role assignment.');
        }
      } else {
        setError(res?.error || 'Invalid credentials. Please verify official email and password.');
      }
    } catch (err) {
      setLoading(false);
      setError('Connection error. Failed to reach verification server.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] grid grid-cols-1 lg:grid-cols-12 text-[#111827] font-sans">
      
      {/* LEFT SIDE: Government Brand & Visual Panel */}
      <div className="hidden lg:flex lg:col-span-7 bg-white border-r border-[#E5E7EB] relative flex-col justify-between p-12 overflow-hidden shadow-2xs">
        
        {/* Header Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-md bg-[#166534] flex items-center justify-center text-white font-bold shadow-xs">
            <Shield size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-wide text-[#111827] leading-none">SAMANVAY</span>
            <span className="text-[10px] font-bold tracking-widest text-[#166534] uppercase mt-0.5">UNIFIED DISASTER RESPONSE</span>
          </div>
        </div>

        {/* Core Description & Background Graphic */}
        <div className="relative z-10 max-w-lg my-auto flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F0FDF4] border border-[#DCFCE7] rounded-full text-[#166534] text-xs font-bold w-fit uppercase tracking-widest">
            OFFICIAL EOC COMMAND PORTAL
          </div>

          <h2 className="text-3xl font-extrabold text-[#111827] leading-tight tracking-tight">
            Unified Disaster Response & Emergency Operations Center
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Authorized operational portal for District Emergency Operations Center (EOC) authorities and verified rescue response agencies. Real-time resource inventory, verified agency directory, and live incident coordination.
          </p>

        </div>
      </div>

      {/* RIGHT SIDE: Clean Login Card */}
      <div className="lg:col-span-5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 relative">
        <div className="w-full max-w-md mx-auto bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-xs">
          
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-md bg-[#166534] flex items-center justify-center text-white font-bold">
              <Shield size={18} />
            </div>
            <span className="text-base font-extrabold tracking-wide text-[#111827]">SAMANVAY</span>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-extrabold text-[#111827] tracking-tight">Portal Sign In</h3>
            <p className="text-xs text-[#64748B] mt-1">Enter official credentials to access operational dashboard.</p>
          </div>

          {error && (
            <div className="mb-4 bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] px-3.5 py-2.5 rounded-lg flex items-center gap-2 text-xs font-semibold">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email Field */}
            <FormInput
              id="login-email"
              label="Official Email Address"
              type="email"
              placeholder="collector.pune@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password Field */}
            <FormInput
              id="login-password"
              label="Account Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Session checkbox & Forgot link */}
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-[#E5E7EB] text-[#166534] focus:ring-0 w-4 h-4" />
                <span>Keep session active</span>
              </label>
              <a href="#" className="text-[#166534] font-semibold hover:underline" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#166534] hover:bg-[#14532D] text-white font-bold py-3 px-4 rounded-md transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
