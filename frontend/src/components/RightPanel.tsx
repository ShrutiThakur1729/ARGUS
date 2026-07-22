import React, { useState } from 'react';
import { ChevronRight, Play, BookOpen, CheckCircle2 } from 'lucide-react';
import { Alert } from '../services/alertService';
import { Playbook } from '../services/playbookService';

interface RightPanelProps {
  alerts?: Alert[];
  playbooks?: Playbook[];
  onExecutePlaybook?: (playbookId: string) => void;
  onAlertSelect?: (alert: Alert) => void;
}

const mockAlerts: Alert[] = [
  {
    id: 'a1',
    title: 'Lateral Movement Detected',
    description: 'Multiple SMB connections to database servers with administrative privilege requests.',
    severity: 'critical',
    status: 'open',
    mitre_technique: 'SMB Connection',
    mitre_technique_id: 'T1021.002',
    created_at: '2026-07-21T14:32:10.000Z',
    updated_at: '2026-07-21T14:32:10.000Z'
  },
  {
    id: 'a2',
    title: 'PowerShell Execution',
    description: 'Suspicious base64-encoded command executed by non-administrative user.',
    severity: 'high',
    status: 'open',
    mitre_technique: 'Command Shell',
    mitre_technique_id: 'T1059.001',
    created_at: '2026-07-21T14:28:45.000Z',
    updated_at: '2026-07-21T14:28:45.000Z'
  },
  {
    id: 'a3',
    title: 'Multiple Failed Logins',
    description: 'Aggressive brute-force logon attempts across HR domain.',
    severity: 'high',
    status: 'open',
    mitre_technique: 'Brute Force',
    mitre_technique_id: 'T1110',
    created_at: '2026-07-21T14:25:33.000Z',
    updated_at: '2026-07-21T14:25:33.000Z'
  },
  {
    id: 'a4',
    title: 'Unusual Data Transfer',
    description: 'Large outbound HTTP payloads transferred to unclassified public server.',
    severity: 'medium',
    status: 'open',
    mitre_technique: 'Exfiltration Over Web Service',
    mitre_technique_id: 'T1567',
    created_at: '2026-07-21T14:21:18.000Z',
    updated_at: '2026-07-21T14:21:18.000Z'
  },
  {
    id: 'a5',
    title: 'Admin Privilege Escalation',
    description: 'Local token manipulation detected resulting in system authority escalation.',
    severity: 'medium',
    status: 'open',
    mitre_technique: 'Token Impersonation',
    mitre_technique_id: 'T1134',
    created_at: '2026-07-21T14:18:07.000Z',
    updated_at: '2026-07-21T14:18:07.000Z'
  }
];

export const RightPanel: React.FC<RightPanelProps> = ({
  alerts = mockAlerts,
  onExecutePlaybook,
  onAlertSelect
}) => {
  const [playbookExecuting, setPlaybookExecuting] = useState(false);
  const [playbookProgress, setPlaybookProgress] = useState(0);

  const handleExecutePlaybook = () => {
    if (playbookExecuting) return;
    setPlaybookExecuting(true);
    setPlaybookProgress(0);
    
    const interval = setInterval(() => {
      setPlaybookProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setPlaybookExecuting(false);
          }, 1200);
          return 100;
        }
        return prev + 10;
      });
    }, 80);

    if (onExecutePlaybook) {
      onExecutePlaybook('ransomware-containment-pb');
    }
  };

  const getSeverityStyles = (severity: string) => {
    const map: Record<string, string> = {
      critical: 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm',
      high: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/25',
      low: 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
    };
    return map[severity.toLowerCase()] || map.medium;
  };

  const formatAlertTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '14:32:10';
    }
  };

  return (
    <div className="space-y-6 select-none w-full">
      {/* 1. Recent Alerts */}
      <div className="bg-[#0a1424]/40 border border-[#1e293b]/30 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">Recent Alerts</h3>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Live security events feed</p>
          </div>
          <button className="text-[10px] font-mono font-bold text-blue-450 hover:text-blue-350 transition-colors uppercase tracking-wider flex items-center gap-0.5">
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-3 max-h-[360px] overflow-y-auto scrollbar-none">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              onClick={() => onAlertSelect && onAlertSelect(alert)}
              className="bg-[#0f1b2d]/35 hover:bg-[#0f1b2d]/70 border border-[#1e293b]/15 hover:border-slate-800 p-3 rounded flex items-center justify-between gap-4 cursor-pointer transition-all duration-200"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                  alert.severity.toLowerCase() === 'critical' ? 'bg-red-500 glow-red animate-pulse' :
                  alert.severity.toLowerCase() === 'high' ? 'bg-orange-500 animate-pulse' :
                  alert.severity.toLowerCase() === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-white truncate font-sans leading-none">{alert.title}</h4>
                  <span className="text-[8.5px] font-mono text-gray-500 block mt-1.5">
                    {alert.mitre_technique || 'Endpoint Asset'} • {formatAlertTime(alert.created_at)}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold font-mono uppercase shrink-0 ${getSeverityStyles(alert.severity)}`}>
                {alert.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CERT-In Recommendation */}
      <div className="bg-[#0a1424]/40 border border-[#1e293b]/30 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">CERT-In Recommendation</h3>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">National cyber advisories</p>
          </div>
          <button className="text-[10px] font-mono font-bold text-blue-450 hover:text-blue-350 transition-colors uppercase tracking-wider flex items-center gap-0.5">
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-red-500/5 border border-red-500/10 px-3.5 py-2.5 rounded-lg">
            <h4 className="text-xs font-bold text-red-400 font-sans leading-snug">
              CIAD-2025-XYZ: Ransomware Threat Advisory
            </h4>
            <div className="text-[10px] font-mono text-gray-500 mt-1 flex items-center gap-1.5">
              <span>Severity:</span>
              <span className="text-red-500 font-bold">High</span>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-gray-300 font-sans leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span>Isolate affected systems from external gateways</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span>Disable compromised Active Directory credentials</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span>Block malicious IPs and command-and-control domains</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span>Apply emergency CERT patches for SMB vulnerabilities</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span>Monitor network traffic for exfiltration anomalies</span>
            </li>
          </ul>

          <button className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold font-sans rounded-lg flex items-center justify-center gap-2 transition-all duration-200 mt-2">
            <BookOpen className="h-4 w-4" />
            <span>Read Full Advisory</span>
          </button>
        </div>
      </div>

      {/* 3. Recommended Playbook */}
      <div className="bg-[#0a1424]/40 border border-[#1e293b]/30 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">Recommended Playbook</h3>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Containment active script</p>
          </div>
          <button className="text-[10px] font-mono font-bold text-blue-450 hover:text-blue-350 transition-colors uppercase tracking-wider flex items-center gap-0.5">
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-white font-sans">Ransomware Containment Playbook</h4>
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 mt-2">
              <span>Expected Success Rate:</span>
              <span className="text-emerald-400 font-bold">94%</span>
            </div>
            
            {/* Success rate progress bar */}
            <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden border border-[#1e293b]/30">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-350"
                style={{ width: playbookExecuting ? `${playbookProgress}%` : '94%' }}
              />
            </div>
          </div>

          <button
            onClick={handleExecutePlaybook}
            disabled={playbookExecuting}
            className={`w-full py-2 text-xs font-bold font-sans rounded-lg flex items-center justify-center gap-2 transition-all duration-200 mt-2 ${
              playbookExecuting 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 cursor-not-allowed font-mono'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:scale-101'
            }`}
          >
            {playbookExecuting ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>EXECUTING... {playbookProgress}%</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current text-white" />
                <span>Execute Playbook</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. System Information */}
      <div className="bg-[#0a1424]/40 border border-[#1e293b]/30 p-6 rounded-xl">
        <h3 className="text-xs font-bold text-white tracking-wide mb-4">System Information</h3>
        <div className="space-y-3 text-xs font-sans text-gray-300">
          <div className="flex justify-between border-b border-[#1e293b]/10 pb-2">
            <span className="text-gray-500 font-mono text-[9px] font-bold">ORGANIZATION</span>
            <span className="font-bold text-white">AIIMS Delhi</span>
          </div>
          <div className="flex justify-between border-b border-[#1e293b]/10 pb-2">
            <span className="text-gray-500 font-mono text-[9px] font-bold">PLAN</span>
            <span className="font-bold text-blue-400">Enterprise</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-mono text-[9px] font-bold">LICENSE</span>
            <span className="font-bold text-emerald-500">Valid to May 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
