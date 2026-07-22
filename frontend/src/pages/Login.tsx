import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Lock, AlertCircle, Eye, Sparkles, Building, User, Mail, Globe, Clock, ShieldCheck } from 'lucide-react';

import wholeLogo from '../assets/wholelogo.svg';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Signup Form States
  const [orgName, setOrgName] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [country, setCountry] = useState('India');
  const [timezone, setTimezone] = useState('IST (UTC+05:30)');
  const [adminName, setAdminName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [orgLogo, setOrgLogo] = useState('');

  // Diagnostic states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password fields are required.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('Incorrect email or password. Please verify credentials.');
      } else {
        setError('Authentication server connection error. Verify Supabase backend status.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !institution || !adminName || !signupEmail || !signupPassword) {
      setError('All marked fields are required to register your organization.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await authService.registerOrganization({
        org_name: orgName,
        institution,
        department,
        country,
        timezone,
        logo: orgLogo || null,
        admin_name: adminName,
        email: signupEmail,
        password: signupPassword
      });
      setSuccessMessage('Organization registered successfully! Verification email dispatched.');
      setActiveTab('login');
      setEmail(signupEmail);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Verify configuration settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      authService.loginWithGoogle();
    } catch (err) {
      setError('Google Sign-In redirection failed.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your registered email address first, then click Forgot Password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
      setSuccessMessage(`Password reset link dispatched to ${email}. Check your inbox.`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Password reset failed. Verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#050b14] bg-grid flex items-center justify-center p-4 overflow-y-auto select-none">
      {/* Dynamic Cyber Glows */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-600/10 blur-[80px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-lg bg-[#0a1424]/85 border border-[#1e293b]/70 rounded-2xl shadow-[0_0_35px_rgba(59,130,246,0.15)] backdrop-blur-xl p-8 z-10 my-8">
        
        {/* HERO HEADER */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src={wholeLogo} 
            alt="ARGUS Logo" 
            className="h-16 w-auto max-w-full object-contain mb-4 filter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
          />
          <h1 className="text-lg font-black font-sans tracking-widest text-white">ARGUS COMMAND SECURITY</h1>
          <p className="text-[9.5px] font-mono text-blue-400 uppercase tracking-widest mt-1">OPERATIONAL INSTANCE MANAGEMENT</p>
        </div>

        {/* TAB CONTROL */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-[#1e293b]/40 mb-6 text-xs font-bold font-sans">
          <button 
            type="button"
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all uppercase tracking-wider ${
              activeTab === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Access Session
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('signup'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all uppercase tracking-wider ${
              activeTab === 'signup' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Register Org
          </button>
        </div>

        {/* ERRORS / SUCCESS STATUS */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-3 text-[11px] mb-6 font-sans">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg flex items-center gap-3 text-[11px] mb-6 font-sans">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* LOGIN VIEW */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold font-mono tracking-widest text-gray-400 uppercase">
                Registered Operator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@aiims.edu"
                  className="w-full bg-[#050b14]/50 border border-[#1e293b]/40 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500/60"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold font-mono tracking-widest text-gray-400 uppercase">
                  Secret Key Passphrase
                </label>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[9px] font-mono text-blue-400 hover:text-blue-300 uppercase tracking-wide"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter key passphrase"
                  className="w-full bg-[#050b14]/50 border border-[#1e293b]/40 rounded-lg pl-10 pr-10 py-2 text-xs text-white focus:outline-none focus:border-blue-500/60 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-sans text-gray-400 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                  className="rounded border-[#1e293b] bg-slate-950 text-blue-600 focus:ring-0"
                />
                <span>Remember Session</span>
              </label>
            </div>

            <div className="space-y-3 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700/50 text-white text-xs font-bold font-sans tracking-widest uppercase rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-r-2 border-white" />
                ) : (
                  <Sparkles className="h-4 w-4 fill-current text-white/80" />
                )}
                <span>INITIALIZE SOC SESSION</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-[#1e293b]/60 text-white text-xs font-bold font-sans tracking-wider uppercase rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Continue with Google</span>
              </button>
            </div>
          </form>
        ) : (
          /* REGISTRATION / CREATE ORGANIZATION VIEW */
          <form onSubmit={handleSignupSubmit} className="space-y-4 max-h-[480px] overflow-y-auto pr-1 scrollbar-none">
            <h3 className="text-[10px] font-bold font-mono text-blue-400 uppercase tracking-wider mb-2">Organization Telemetry</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold font-mono tracking-widest text-gray-500 uppercase">Organization Name *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. AIIMS CNI"
                    className="w-full bg-[#050b14]/50 border border-[#1e293b]/40 rounded-lg pl-10 pr-4 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold font-mono tracking-widest text-gray-500 uppercase">Institution *</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. AIIMS Hospital"
                  className="w-full bg-[#050b14]/50 border border-[#1e293b]/40 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold font-mono tracking-widest text-gray-500 uppercase">Department (Optional)</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Cybersecurity Forensics"
                  className="w-full bg-[#050b14]/50 border border-[#1e293b]/40 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold font-mono tracking-widest text-gray-500 uppercase">Country *</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#050b14]/50 border border-[#1e293b]/40 rounded-lg pl-10 pr-4 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold font-mono tracking-widest text-gray-500 uppercase">Operational Timezone *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-[#050b14]/50 border border-[#1e293b]/40 rounded-lg pl-10 pr-4 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold font-mono tracking-widest text-gray-500 uppercase">Logo Resource Path (Optional)</label>
                <input
                  type="text"
                  value={orgLogo}
                  onChange={(e) => setOrgLogo(e.target.value)}
                  placeholder="/assets/logo.svg"
                  className="w-full bg-[#050b14]/50 border border-[#1e293b]/40 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <h3 className="text-[10px] font-bold font-mono text-blue-400 uppercase tracking-wider mt-4 mb-2">SOC Administrator</h3>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold font-mono tracking-widest text-gray-500 uppercase">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Commander Analyst"
                  className="w-full bg-[#050b14]/50 border border-[#1e293b]/40 rounded-lg pl-10 pr-4 py-2 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold font-mono tracking-widest text-gray-500 uppercase">Admin Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="admin@cni-soc.gov.in"
                  className="w-full bg-[#050b14]/50 border border-[#1e293b]/40 rounded-lg pl-10 pr-4 py-2 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold font-mono tracking-widest text-gray-500 uppercase">Account Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create strong password"
                  className="w-full bg-[#050b14]/50 border border-[#1e293b]/40 rounded-lg pl-10 pr-4 py-2 text-xs text-white font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700/50 text-white text-xs font-bold font-sans tracking-widest uppercase rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-r-2 border-white" />
              ) : (
                <Building className="h-4 w-4" />
              )}
              <span>REGISTER CNI ORGANIZATION</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
