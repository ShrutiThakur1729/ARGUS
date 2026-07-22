import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, FileText, ShieldAlert, Play, Pause, CheckCircle2 } from 'lucide-react';
import argusLogo from '../assets/logo.svg';

interface ArgusCoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendHealthy: boolean;
  telegramConfigured: boolean;
  activeIncidentsCount?: number;
  onlineAgentsCount?: number;
  totalAgentsCount?: number;
  lastTelemetrySeconds?: number;
  reasonerPaused?: boolean;
  onDeployCountermeasures?: () => void;
  onEnterLockdown?: () => void;
  onExecutiveReport?: () => void;
  onPauseReasoner?: () => void;
}

export const ArgusCoreModal: React.FC<ArgusCoreModalProps> = ({
  isOpen,
  onClose,
  backendHealthy = true,
  telegramConfigured = false,
  activeIncidentsCount = 0,
  totalAgentsCount = 0,
  lastTelemetrySeconds = 0.4,
  reasonerPaused = false,
  onDeployCountermeasures,
  onEnterLockdown,
  onExecutiveReport,
  onPauseReasoner,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState(42);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Auto-execute timer countdown
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Close on Escape Key Press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const execAction = (label: string, fn?: () => void) => {
    if (fn) {
      fn();
      setLastAction(label);
      setTimeout(() => onClose(), 600);
    }
  };

  const threatLevel = activeIncidentsCount > 3 ? 'CRITICAL (Δ5)' : activeIncidentsCount > 0 ? 'ELEVATED (Δ3)' : 'NOMINAL (Δ0)';
  const threatColor = activeIncidentsCount > 3 ? 'text-red-500' : activeIncidentsCount > 0 ? 'text-amber-500' : 'text-emerald-400';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-hidden select-none">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#02050a]/80 backdrop-blur-lg cursor-default"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="relative w-[900px] max-w-full bg-[#0a0f1d]/95 border border-[#1e293b]/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 flex flex-col overflow-hidden text-gray-100"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#1e293b]/40 flex items-center justify-between shrink-0 bg-[#060b17]/50">
              <div className="flex items-center gap-4">
                <img src={argusLogo} alt="ARGUS Logo" className="h-12 w-12 object-contain filter drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                <div>
                  <h2 className="text-xl font-bold text-white font-sans tracking-wide leading-tight">ARGUS Core</h2>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">Direct governance interface · reasoning stream</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">THREAT LEVEL</span>
                  <span className={`text-sm font-extrabold font-mono tracking-wider ${threatColor}`}>{threatLevel}</span>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800/60 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body: 3 Columns */}
            <div className="grid grid-cols-12 divide-x divide-[#1e293b]/30 p-8">
              {/* Col 1: Telemetry Summary */}
              <div className="col-span-3 pr-6 space-y-6">
                <div>
                  <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest block">AI CONFIDENCE</span>
                  <div className="text-3xl font-black text-white font-sans mt-1">98.4%</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest block">CONNECTED AGENTS</span>
                  <div className="text-3xl font-black text-white font-sans mt-1">{totalAgentsCount.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest block">ACTIVE INCIDENTS</span>
                  <div className={`text-3xl font-black font-sans mt-1 ${activeIncidentsCount > 0 ? 'text-amber-500' : 'text-emerald-400'}`}>{activeIncidentsCount}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest block">LAST TELEMETRY</span>
                  <div className="text-xs font-mono text-gray-400 mt-1 flex items-center gap-1.5">
                    <span>{lastTelemetrySeconds}s ago</span>
                    <span>·</span>
                    <span className={`font-bold ${reasonerPaused ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {reasonerPaused ? 'PAUSED' : 'streaming'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Col 2: Infrastructure Health */}
              <div className="col-span-4 px-6 space-y-4">
                <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest block mb-2">INFRASTRUCTURE</span>
                <div className="space-y-3.5 text-xs font-sans">
                  {[
                    { label: 'Backend Core', status: backendHealthy ? 'Nominal' : 'Degraded', ok: backendHealthy },
                    { label: 'Supabase', status: 'Nominal', ok: true },
                    { label: 'Telegram Uplink', status: telegramConfigured ? 'Nominal' : 'Not Configured', ok: telegramConfigured },
                    { label: 'API Gateway', status: '24 ms', ok: true },
                    { label: 'Reasoner Queue', status: reasonerPaused ? 'PAUSED' : 'Active', ok: !reasonerPaused },
                    { label: 'Certificate Vault', status: 'Secure', ok: true },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-gray-300">{item.label}</span>
                      <span className={`font-mono font-bold ${item.ok ? 'text-emerald-400' : 'text-amber-400'}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 3: Quick Actions */}
              <div className="col-span-5 pl-6 space-y-6">
                <div>
                  <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest block mb-3">CURRENT RECOMMENDATION</span>
                  <div className="bg-[#0f192a]/90 border border-[#1e293b]/60 p-4 rounded-xl text-xs text-gray-300 font-sans leading-relaxed space-y-3 shadow-inner">
                    <p>
                      {activeIncidentsCount > 0
                        ? <>Isolate <strong className="text-white font-mono">active threat vectors</strong>, rotate Tier-0 credentials, and initiate honeypot deployment before the actor pivots to storage tier.</>
                        : <>No active threats detected. Maintain <strong className="text-white font-mono">baseline monitoring</strong> and verify all agent heartbeats are current.</>
                      }
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 border-t border-[#1e293b]/40 pt-2.5">
                      <span>ETA: 3 min</span>
                      <span className="text-gray-400">Auto-execute in <strong className="text-white">{countdown}s</strong></span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest block mb-3">QUICK ACTIONS</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => execAction('Deploy Countermeasures', onDeployCountermeasures)}
                      className="bg-[#0f1b2d]/80 hover:bg-blue-950/60 border border-[#1e293b]/60 hover:border-blue-500/40 p-3 rounded-xl text-left text-xs font-semibold text-white transition-all flex items-center gap-2 group"
                    >
                      <ShieldAlert className="h-4 w-4 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span>Deploy countermeasures</span>
                    </button>

                    <button
                      onClick={() => execAction('Enter Lockdown', onEnterLockdown)}
                      className="bg-[#0f1b2d]/80 hover:bg-amber-950/30 border border-[#1e293b]/60 hover:border-amber-500/40 p-3 rounded-xl text-left text-xs font-semibold text-white transition-all flex items-center gap-2 group"
                    >
                      <Lock className="h-4 w-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span>Enter lockdown</span>
                    </button>

                    <button
                      onClick={() => execAction('Executive Report', onExecutiveReport)}
                      className="bg-[#0f1b2d]/80 hover:bg-purple-950/30 border border-[#1e293b]/60 hover:border-purple-500/40 p-3 rounded-xl text-left text-xs font-semibold text-white transition-all flex items-center gap-2 group"
                    >
                      <FileText className="h-4 w-4 text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span>Executive report</span>
                    </button>

                    <button
                      onClick={() => { onPauseReasoner?.(); setLastAction(reasonerPaused ? 'Reasoner resumed' : 'Reasoner paused'); }}
                      className={`bg-[#0f1b2d]/80 border p-3 rounded-xl text-left text-xs font-semibold text-white transition-all flex items-center gap-2 group ${
                        reasonerPaused
                          ? 'hover:bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-500/50'
                          : 'hover:bg-slate-800/40 border-[#1e293b]/60 hover:border-gray-500/40'
                      }`}
                    >
                      {reasonerPaused
                        ? <Play className="h-4 w-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                        : <Pause className="h-4 w-4 text-gray-400 shrink-0 group-hover:scale-110 transition-transform" />
                      }
                      <span>{reasonerPaused ? 'Resume reasoner' : 'Pause reasoner'}</span>
                    </button>
                  </div>

                  {lastAction && (
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{lastAction} executed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-[#1e293b]/40 flex items-center justify-between bg-[#060b17]/50 text-[10px] font-mono text-gray-400">
              <div className="flex items-center gap-6">
                <span>Session · <strong className="text-gray-300">op-2601-4471</strong></span>
                <span>Officer · <strong className="text-gray-300">SOC-Lead-01</strong></span>
                <span>Signed · <strong className="text-gray-300">HMAC-SHA-256</strong></span>
              </div>
              <button onClick={onClose} className="font-bold text-gray-300 hover:text-white uppercase tracking-wider transition-colors">
                CLOSE INTERFACE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ArgusCoreModal;
