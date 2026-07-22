import React, { useState } from 'react';
import { 
  Globe, 
  Shield, 
  Server, 
  Database, 
  Plus, 
  Minus, 
  Maximize2, 
  ChevronDown 
} from 'lucide-react';
import { Agent } from '../services/agentService';

interface NetworkOverviewProps {
  agents?: Agent[];
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

export const NetworkOverview: React.FC<NetworkOverviewProps> = ({ 
  onNodeClick, 
  selectedNodeId 
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  // Nodes matching the hierarchical tree diagram
  const nodes = [
    { id: 'internet', label: 'Internet', x: 300, y: 40, icon: Globe, status: 'normal', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.25)' },
    { id: 'firewall', label: 'Firewall', x: 300, y: 110, icon: Shield, status: 'normal', color: '#10b981', glow: 'rgba(16, 185, 129, 0.25)' },
    
    // First branch layer
    { id: 'web', label: 'Web Server', x: 160, y: 200, icon: Server, status: 'normal', color: '#10b981', glow: 'rgba(16, 185, 129, 0.2)' },
    { id: 'app', label: 'App Server', x: 300, y: 200, icon: Server, status: 'warning', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.2)' },
    { id: 'db', label: 'Database Server', x: 440, y: 200, icon: Database, status: 'critical', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.2)' },
    
    // Second branch layer
    { id: 'hr', label: 'HR System', x: 100, y: 290, icon: Server, status: 'normal', color: '#10b981', glow: 'rgba(16, 185, 129, 0.15)' },
    { id: 'email', label: 'Email Server', x: 220, y: 290, icon: Server, status: 'normal', color: '#10b981', glow: 'rgba(16, 185, 129, 0.15)' },
    { id: 'file', label: 'File Server', x: 340, y: 290, icon: Server, status: 'normal', color: '#10b981', glow: 'rgba(16, 185, 129, 0.15)' },
    { id: 'backup', label: 'Backup Server', x: 460, y: 290, icon: Server, status: 'unknown', color: '#64748b', glow: 'rgba(100, 116, 139, 0.15)' }
  ];

  return (
    <div className="card h-full flex flex-col justify-between p-5 bg-[#070e1a]/80 border-[#1e293b]/60 relative select-none">
      {/* Header Controls */}
      <div className="flex items-center justify-between shrink-0 mb-2">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Network Overview</h3>
        </div>

        <div className="relative">
          <button className="flex items-center gap-1 bg-[#0a1424]/60 border border-[#1e293b]/50 px-2.5 py-1 rounded text-[10px] font-mono text-gray-300 hover:text-white transition-colors">
            <span>View Full Map</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Topology Area */}
      <div className="flex-1 relative flex items-center justify-center min-h-[320px] overflow-hidden my-1">
        {/* Absolute Legend Box */}
        <div className="absolute top-2 left-2 bg-[#080f1d]/85 border border-[#1e293b]/45 rounded-lg p-2.5 space-y-1.5 z-10 text-[9px] font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" />
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#64748b]" />
            <span>Unknown</span>
          </div>
        </div>

        {/* Absolute Zoom Controls */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.3))}
            title="Zoom In" 
            className="h-7 w-7 bg-[#0a1424]/60 border border-[#1e293b]/50 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.8))}
            title="Zoom Out" 
            className="h-7 w-7 bg-[#0a1424]/60 border border-[#1e293b]/50 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button 
            onClick={() => setZoomLevel(1)}
            title="Reset Zoom" 
            className="h-7 w-7 bg-[#0a1424]/60 border border-[#1e293b]/50 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-800 transition-colors mt-1"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Scaled Canvas Container */}
        <div 
          className="relative w-full h-full max-w-[600px] aspect-[1.6] transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 600 360">
            <defs>
              <marker 
                id="arrow" 
                viewBox="0 0 10 10" 
                refX="6" 
                refY="5" 
                markerWidth="5" 
                markerHeight="5" 
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ef4444" />
              </marker>
            </defs>

            {/* Connecting lines hierarchy */}
            {/* Internet -> Firewall */}
            <line x1={300} y1={40} x2={300} y2={110} stroke="#1e293b" strokeWidth="1.5" />

            {/* Firewall -> First Layer (Web, App, DB) */}
            <line x1={300} y1={110} x2={300} y2={150} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={160} y1={150} x2={440} y2={150} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={160} y1={150} x2={160} y2={200} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={300} y1={150} x2={300} y2={200} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={440} y1={150} x2={440} y2={200} stroke="#1e293b" strokeWidth="1.5" />

            {/* Web Server -> HR System, Email Server */}
            <line x1={160} y1={200} x2={160} y2={240} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={100} y1={240} x2={220} y2={240} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={100} y1={240} x2={100} y2={290} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={220} y1={240} x2={220} y2={290} stroke="#1e293b" strokeWidth="1.5" />

            {/* App Server -> File Server */}
            <line x1={300} y1={200} x2={300} y2={240} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={300} y1={240} x2={340} y2={240} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={340} y1={240} x2={340} y2={290} stroke="#1e293b" strokeWidth="1.5" />

            {/* Database Server -> Backup Server */}
            <line x1={440} y1={200} x2={440} y2={240} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={440} y1={240} x2={460} y2={240} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={460} y1={240} x2={460} y2={290} stroke="#1e293b" strokeWidth="1.5" />

            {/* Red Dashed Paths for alerts/anomalies */}
            {/* Database Server to App Server */}
            <path 
              d="M 440,215 C 440,265 300,265 300,218" 
              stroke="#ef4444" 
              strokeWidth="1.5" 
              strokeDasharray="4,4" 
              fill="none" 
              markerEnd="url(#arrow)"
              className="animate-packet-flow"
            />

            {/* Database Server to Backup Server */}
            <path 
              d="M 440,215 C 440,265 460,265 460,278" 
              stroke="#ef4444" 
              strokeWidth="1.5" 
              strokeDasharray="4,4" 
              fill="none" 
              markerEnd="url(#arrow)"
              className="animate-packet-flow"
            />
          </svg>

          {/* Node Badges */}
          {nodes.map((node) => {
            const NodeIcon = node.icon;
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onClick={() => onNodeClick && onNodeClick(node.id)}
                style={{ left: `${(node.x / 600) * 100}%`, top: `${(node.y / 360) * 100}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-all duration-300 ${
                  isSelected ? 'scale-110 z-20' : ''
                }`}
              >
                {/* Glowing Circular Container */}
                <div 
                  className={`h-10 w-10 rounded-full bg-slate-950/90 flex items-center justify-center border transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950 scale-105' : ''
                  }`}
                  style={{ 
                    borderColor: node.color,
                    boxShadow: `0 0 15px ${node.glow}`
                  }}
                >
                  <NodeIcon 
                    className="h-5 w-5 transition-colors" 
                    style={{ color: node.color }} 
                  />

                  {/* Sparking alert/pulse indicators for Warning/Critical */}
                  {node.status === 'critical' && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping opacity-75" />
                  )}
                  {node.status === 'warning' && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping opacity-75" />
                  )}
                </div>

                {/* Direct text label */}
                <span className={`mt-2 text-[9.5px] font-sans font-bold transition-colors tracking-wide ${
                  isSelected ? 'text-blue-400 font-extrabold' : 'text-gray-300 group-hover:text-white'
                }`}>
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NetworkOverview;
