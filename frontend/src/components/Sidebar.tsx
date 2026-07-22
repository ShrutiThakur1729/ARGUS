import React from 'react';
import { 
  LayoutDashboard, MonitorDot, Laptop, Network, Activity, Terminal, 
  ShieldAlert, Flame, BrainCircuit, GitCommit, TableProperties, Sparkles, 
  FileWarning, BookOpen, BarChart3, Download, Building2, Users2, Cpu, Settings 
} from 'lucide-react';
import argusLogo from '../assets/logo.svg';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  alertCount?: number;
  incidentCount?: number;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView, 
  alertCount = 8,
  incidentCount = 24 
}) => {
  const sections: { title?: string; items: SidebarItem[] }[] = [
    {
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'dashboard', label: 'Dashboard', icon: MonitorDot },
      ]
    },
    {
      title: 'MONITOR',
      items: [
        { id: 'agents', label: 'Agents', icon: Laptop },
        { id: 'network', label: 'Network Map', icon: Network },
        { id: 'health', label: 'System Health', icon: Activity },
        { id: 'logs', label: 'Logs Explorer', icon: Terminal },
      ]
    },
    {
      title: 'DETECT & RESPOND',
      items: [
        { id: 'alerts', label: 'Alerts', icon: ShieldAlert, badge: alertCount, badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30' },
        { id: 'incidents', label: 'Incidents', icon: Flame, badge: incidentCount, badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
        { id: 'ai-analysis', label: 'AI Analysis', icon: BrainCircuit },
        { id: 'timeline', label: 'Attack Timeline', icon: GitCommit },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'mitre', label: 'MITRE ATT&CK', icon: TableProperties },
        { id: 'predictions', label: 'Threat Predictions', icon: Sparkles },
        { id: 'cert-in', label: 'CERT-In Advisories', icon: FileWarning },
        { id: 'playbooks', label: 'Playbooks', icon: BookOpen },
      ]
    },
    {
      title: 'REPORTS',
      items: [
        { id: 'reports', label: 'Reports', icon: BarChart3 },
        { id: 'export', label: 'Export Data', icon: Download },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { id: 'org', label: 'Organization', icon: Building2 },
        { id: 'users', label: 'Users & Roles', icon: Users2 },
        { id: 'integrations', label: 'Integrations', icon: Cpu },
        { id: 'config', label: 'Agent Configuration', icon: Settings },
      ]
    }
  ];

  return (
    <aside 
      className="fixed left-0 top-0 bottom-0 z-50 w-16 hover:w-64 transition-all duration-300 ease-in-out bg-[#030712]/95 border-r border-[#1e293b]/40 backdrop-blur-xl group overflow-hidden shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex flex-col justify-between select-none"
    >
      {/* Top Header Logo */}
      <div className="p-3 border-b border-[#1e293b]/30 flex items-center gap-3 shrink-0">
        <img src={argusLogo} alt="ARGUS Logo" className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap min-w-0">
          <h1 className="font-sans font-black text-sm tracking-widest text-white leading-none">ARGUS</h1>
          <p className="text-[9px] font-mono text-blue-400 tracking-widest mt-1 uppercase font-bold">Cyber Defense SOC</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-2.5 py-4 space-y-5 overflow-y-auto scrollbar-none">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && (
              <h2 className="px-2 text-[9px] font-bold font-mono tracking-widest text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap uppercase mb-1">
                {section.title}
              </h2>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl font-sans text-xs font-semibold transition-all duration-200 group/btn border border-transparent ${
                        isActive
                          ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                          : 'text-gray-400 hover:text-white hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 shrink-0">
                        <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover/btn:scale-110 ${
                          isActive ? 'text-blue-400' : 'text-gray-400 group-hover/btn:text-blue-400'
                        }`} />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium">
                          {item.label}
                        </span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Version */}
      <div className="p-3 border-t border-[#1e293b]/30 flex items-center justify-between shrink-0 bg-[#030712]/90">
        <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          ARGUS v2.4.1 SOC
        </span>
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
      </div>
    </aside>
  );
};

export default Sidebar;
