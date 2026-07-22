import React from 'react';
import { UserCheck, Code, Fingerprint, Server, UserPlus, Database } from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  status: 'critical' | 'high' | 'warning' | 'normal';
  icon: React.ComponentType<any>;
  badgeBg: string;
  iconColor: string;
}

const events: TimelineEvent[] = [
  {
    id: 'e1',
    title: 'Initial port scan detected',
    subtitle: '203.0.113.14 - gw-east',
    time: '14:20:01',
    status: 'normal',
    icon: UserCheck,
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-400'
  },
  {
    id: 'e2',
    title: 'TLS handshake established',
    subtitle: 'Encrypted C2 candidate',
    time: '14:22:12',
    status: 'normal',
    icon: Code,
    badgeBg: 'bg-blue-500/10 border-blue-500/30',
    iconColor: 'text-blue-400'
  },
  {
    id: 'e3',
    title: 'Credential spray on ADM-09',
    subtitle: '12 failed auths in 40s',
    time: '14:24:44',
    status: 'warning',
    icon: Fingerprint,
    badgeBg: 'bg-amber-500/10 border-amber-500/30',
    iconColor: 'text-amber-400'
  },
  {
    id: 'e4',
    title: 'Privilege escalation attempt',
    subtitle: 'T1068 - kernel exploit',
    time: '14:25:44',
    status: 'critical',
    icon: UserPlus,
    badgeBg: 'bg-red-500/10 border-red-500/30',
    iconColor: 'text-red-400'
  },
  {
    id: 'e5',
    title: 'Lateral movement to DC-Primary',
    subtitle: 'SMB - svc_admin',
    time: '14:27:08',
    status: 'critical',
    icon: Server,
    badgeBg: 'bg-red-500/10 border-red-500/30',
    iconColor: 'text-red-400'
  },
  {
    id: 'e6',
    title: 'Containment playbook triggered',
    subtitle: 'ARGUS auto-response',
    time: '14:28:11',
    status: 'normal',
    icon: Database,
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-400'
  }
];

export const AttackTimeline: React.FC = () => {
  return (
    <div className="card p-5 flex flex-col justify-between bg-[#070e1a]/80 border-[#1e293b]/60 h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold text-white tracking-wide">Attack Timeline</h3>
          <p className="text-[10px] font-mono text-gray-400 mt-0.5">Incident INC-4471 • live</p>
        </div>
        <span className="text-[9px] font-mono font-bold text-gray-400 bg-slate-900 border border-[#1e293b]/40 px-2 py-0.5 rounded">
          6 events
        </span>
      </div>

      {/* Vertical Timeline Nodes with Lucide Icons */}
      <div className="relative pl-6 space-y-3 my-1 flex-1 flex flex-col justify-between">
        {/* Continuous Left Vertical Connector Line */}
        <div className="absolute left-[11.5px] top-3 bottom-3 w-[1.5px] bg-[#1e293b]/70" />

        {events.map((evt) => {
          const Icon = evt.icon;
          return (
            <div key={evt.id} className="relative flex items-start justify-between gap-3 group">
              {/* Left Node Badge with Lucide Icon */}
              <div className={`relative z-10 h-6 w-6 rounded-full border flex items-center justify-center shrink-0 bg-[#070e1a] ${evt.badgeBg}`}>
                <Icon className={`h-3 w-3 ${evt.iconColor} ${evt.status === 'critical' ? 'animate-pulse' : ''}`} />
              </div>

              {/* Event Description */}
              <div className="min-w-0 flex-1 pl-1">
                <h4 className="text-[11px] font-bold text-white font-sans group-hover:text-blue-400 transition-colors leading-tight">
                  {evt.title}
                </h4>
                <span className="text-[9px] font-mono text-gray-400 block mt-0.5">{evt.subtitle}</span>
              </div>

              {/* Timestamp */}
              <span className="text-[9px] font-mono text-gray-400 shrink-0 mt-0.5">{evt.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttackTimeline;
