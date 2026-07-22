import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, Moon, Sun, Volume2, VolumeX, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import argusLogo from '../assets/logo.svg';

interface TopbarProps {
  onEyeClick: () => void;
  demoMode: boolean;
  setDemoMode: (mode: boolean) => void;
  alertCount?: number;
  onBellClick?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  orgName?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  onEyeClick, 
  demoMode, 
  setDemoMode,
  alertCount = 3,
  onBellClick,
  searchQuery = '',
  setSearchQuery,
  orgName
}) => {
  const { user, logout } = useAuth();
  const [time, setTime] = useState<Date>(new Date());
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Settings Dropdown & Theme State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Live real-time clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close settings dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply Light/Dark class to document element
  useEffect(() => {
    if (themeMode === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [themeMode]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <header className="bg-[#030712]/95 backdrop-blur-md border-b border-[#1e293b]/40 h-14 px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left side: Global Search Bar */}
      <div className="flex items-center gap-6 flex-1">
        <div className={`relative max-w-md w-72 md:w-96 transition-all duration-300 ${searchFocused ? 'w-[420px]' : ''}`}>
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${searchFocused ? 'text-blue-400' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder="Search agents, alerts, incidents..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-[#0a1424]/70 border border-[#1e293b]/60 rounded-xl pl-9 pr-14 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 font-sans tracking-wide transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[8.5px] font-mono font-bold text-gray-400 bg-slate-950 border border-[#1e293b]/70 rounded select-none">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right side controls: DEMO MODE, Eye Logo, Bell, Settings, Clock, Profile */}
      <div className="flex items-center gap-5">
        {/* DEMO MODE Toggle Switch */}
        <div className="flex items-center gap-2.5 bg-[#0a1424]/40 border border-[#1e293b]/40 px-3 py-1.5 rounded-lg">
          <span className="text-[9px] font-mono font-black tracking-widest text-gray-400 uppercase">
            DEMO MODE
          </span>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none relative ${
              demoMode ? 'bg-blue-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-md ${
                demoMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Square ARGUS Eye Logo Button */}
        <button
          onClick={onEyeClick}
          title="Open ARGUS Core Command Center"
          className="relative h-9 w-9 rounded-xl bg-blue-950/80 hover:bg-blue-900/90 border border-blue-500/50 flex items-center justify-center transition-all duration-300 group hover:scale-105 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          <img src={argusLogo} alt="ARGUS Core" className="h-7 w-7 object-contain" />
          {/* Glowing Top-Right Blue Dot Status Indicator */}
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 border border-[#030712]"></span>
          </span>
        </button>

        {/* Notification Bell */}
        <button 
          onClick={onBellClick}
          className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-slate-900/60 transition-all"
        >
          <Bell className="h-4.5 w-4.5" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8.5px] font-mono font-extrabold h-4 w-4 rounded-full border-2 border-[#030712] flex items-center justify-center shadow-md animate-pulse">
              {alertCount}
            </span>
          )}
        </button>

        {/* Settings Gear Button & Theme Controller Dropdown */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            title="System Settings & Theme"
            className={`p-2 rounded-xl transition-all ${
              settingsOpen ? 'text-blue-400 bg-slate-900 border border-blue-500/40' : 'text-gray-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Settings className={`h-4.5 w-4.5 transition-transform duration-300 ${settingsOpen ? 'rotate-90' : ''}`} />
          </button>

          {/* Settings Dropdown Menu */}
          {settingsOpen && (
            <div className="absolute right-0 top-12 w-64 bg-[#0a1424]/95 border border-[#1e293b]/80 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.7)] backdrop-blur-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-2.5 mb-3">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                  System Settings
                </span>
                <span className="text-[9px] font-mono text-blue-400 font-bold">ARGUS v2.4</span>
              </div>

              {/* Theme Mode Control Section */}
              <div className="space-y-2 mb-4">
                <label className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                  APPEARANCE THEME
                </label>

                <div className="grid grid-cols-2 gap-2 bg-[#050b14]/80 p-1 rounded-xl border border-[#1e293b]/40">
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-sans font-semibold transition-all ${
                      themeMode === 'dark'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    <span>Dark</span>
                    {themeMode === 'dark' && <Check className="h-3 w-3 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => setThemeMode('light')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-sans font-semibold transition-all ${
                      themeMode === 'light'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    <span>Light</span>
                    {themeMode === 'light' && <Check className="h-3 w-3 ml-0.5" />}
                  </button>
                </div>
              </div>

              {/* Sound Alerts Toggle */}
              <div className="space-y-2 pt-2 border-t border-[#1e293b]/40">
                <div className="flex items-center justify-between text-xs font-sans text-gray-300">
                  <div className="flex items-center gap-2">
                    {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-gray-500" />}
                    <span>Audio Alerts</span>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${soundEnabled ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  >
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-[#1e293b]/60" />

        {/* Real-time Ticking Clock Widget */}
        <div className="text-right">
          <div className="font-mono text-sm font-black text-white tracking-wider tabular-nums leading-none">
            {formatTime(time)}
          </div>
          <div className="text-[9px] font-sans text-gray-400 flex items-center gap-1 justify-end mt-1">
            <span>{formatDate(time)}</span>
            <span>•</span>
            <span className="text-blue-400 font-bold">{formatDay(time)}</span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-[#1e293b]/60" />

        {/* Operator User Profile Badge */}
        <div className="flex items-center gap-3 relative group cursor-pointer">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-black text-white font-sans tracking-wide leading-none">
              {user?.username || 'analyst'}
            </div>
            <div className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mt-1">
              {orgName?.toUpperCase() || 'ARGUS CNI'}
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt="User avatar"
              className="h-8 w-8 rounded-xl border border-slate-700 bg-slate-900 object-cover group-hover:border-blue-500/60 transition-colors shadow-md"
            />
          </div>

          {/* Quick Logout Menu on Hover */}
          <button
            onClick={logout}
            title="Logout session"
            className="absolute right-0 top-10 bg-slate-950/95 border border-slate-800 p-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 flex items-center gap-2 text-[10px] font-bold font-mono tracking-wider transition-all duration-200 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto shadow-xl z-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>DISCONNECT</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
