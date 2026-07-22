import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface MitreTechnique {
  id: string;
  name: string;
  percentage: number;
  description: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  asset: string;
  color: string;
}

const mockTechniques: MitreTechnique[] = [
  {
    id: 'T1021',
    name: 'Remote Services',
    percentage: 35,
    description: 'Adversaries may use valid credentials to log into remote services (RDP, SSH, SMB) to gain lateral access.',
    risk: 'high',
    asset: 'DB-SRV-01',
    color: 'bg-red-500'
  },
  {
    id: 'T1059',
    name: 'Command Shell',
    percentage: 25,
    description: 'Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries.',
    risk: 'high',
    asset: 'WEB-SRV-01',
    color: 'bg-orange-500'
  },
  {
    id: 'T1078',
    name: 'Valid Accounts',
    percentage: 18,
    description: 'Adversaries may obtain and abuse credentials of existing accounts as a means of gaining access and maintaining persistence.',
    risk: 'medium',
    asset: 'HR-PC-07',
    color: 'bg-yellow-500'
  },
  {
    id: 'T1047',
    name: 'WMI',
    percentage: 12,
    description: 'Adversaries may abuse Windows Management Instrumentation (WMI) to execute malicious commands and displace payloads.',
    risk: 'medium',
    asset: 'APP-SRV-03',
    color: 'bg-yellow-500'
  },
  {
    id: 'T1105',
    name: 'Ingress Tool Transfer',
    percentage: 10,
    description: 'Adversaries may transfer tools or files from an external system into a compromised environment.',
    risk: 'low',
    asset: 'FILE-SRV-02',
    color: 'bg-blue-500'
  }
];

export const MitrePanel: React.FC = () => {
  const [hoveredTech, setHoveredTech] = useState<MitreTechnique | null>(null);

  const getRiskColor = (risk: string) => {
    const map: Record<string, string> = {
      critical: 'text-red-500',
      high: 'text-orange-500',
      medium: 'text-yellow-500',
      low: 'text-blue-500'
    };
    return map[risk] || 'text-gray-400';
  };

  return (
    <div className="card h-full flex flex-col relative select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-white tracking-wide">Top Attack Techniques (MITRE)</h3>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Heatmap technique metrics</p>
        </div>
        <button className="text-[10px] font-mono font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider flex items-center">
          View All <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* List */}
      <div className="space-y-3.5 flex-1 mt-2">
        {mockTechniques.map((tech) => (
          <div
            key={tech.id}
            onMouseEnter={() => setHoveredTech(tech)}
            onMouseLeave={() => setHoveredTech(null)}
            className="group relative cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-sans text-gray-300 mb-1">
              <span className="font-mono">
                <strong className="text-white group-hover:text-blue-400 transition-colors">{tech.id}</strong> - {tech.name}
              </span>
              <span className="font-mono font-bold text-gray-400 group-hover:text-white transition-colors">
                {tech.percentage}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-[#1e293b]/10">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${tech.color}`}
                style={{ width: `${tech.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Tooltip Box */}
      {hoveredTech && (
        <div className="absolute left-6 right-6 bottom-4 bg-[#0a1424]/95 border border-slate-700/80 p-3 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.6)] backdrop-blur-xl z-20 transition-all duration-200">
          <div className="flex items-center justify-between border-b border-[#1e293b]/20 pb-1.5 mb-2">
            <span className="text-[10px] font-mono font-bold text-white uppercase">
              {hoveredTech.id} Details
            </span>
            <span className={`text-[10px] font-mono font-bold uppercase ${getRiskColor(hoveredTech.risk)}`}>
              Risk: {hoveredTech.risk}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-sans leading-relaxed">{hoveredTech.description}</p>
          <div className="text-[9px] font-mono text-gray-500 mt-2">
            Affected Asset: <span className="text-white font-bold">{hoveredTech.asset}</span>
          </div>
        </div>
      )}
    </div>
  );
};
