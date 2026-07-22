import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RiskDataPoint {
  time: string;
  score: number;
}

interface RiskChartProps {
  data?: RiskDataPoint[];
  currentScore?: number;
  trend?: string;
  riskLevel?: string;
}

const defaultChartData: RiskDataPoint[] = [
  { time: '00:00', score: 45 },
  { time: '02:00', score: 50 },
  { time: '04:00', score: 38 },
  { time: '06:00', score: 42 },
  { time: '08:00', score: 55 },
  { time: '10:00', score: 62 },
  { time: '12:00', score: 48 },
  { time: '14:00', score: 52 },
  { time: '16:00', score: 70 },
  { time: '18:00', score: 65 },
  { time: '20:00', score: 85 },
  { time: '22:00', score: 78 },
  { time: '24:00', score: 94 },
];

export const RiskChart: React.FC<RiskChartProps> = ({
  data = defaultChartData,
  currentScore = 94,
  trend = "+68% vs last 24h",
  riskLevel = "CRITICAL"
}) => {
  return (
    <div className="card h-full flex flex-col select-none">
      {/* Header Info */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-white tracking-wide">Risk Score Over Time</h3>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Real-time threat aggregate</p>
        </div>
        <select className="bg-slate-900 border border-[#1e293b]/40 rounded px-2 py-0.5 text-[10px] text-gray-400 focus:outline-none focus:border-blue-500/50">
          <option>Last 24 Hours</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center gap-6 mb-6">
        <div>
          <span className="text-[9px] font-bold font-mono text-gray-500 tracking-wider block">CURRENT RISK SCORE</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-red-500 font-sans tracking-wide leading-none">{currentScore}</span>
            <span className="text-xs font-sans text-gray-500">/100</span>
          </div>
        </div>

        <div>
          <span className="text-[9px] font-bold font-mono text-gray-500 tracking-wider block">RISK LEVEL</span>
          <span className="inline-block bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold font-mono px-2 py-0.5 rounded mt-1 glow-red">
            {riskLevel}
          </span>
        </div>

        <div>
          <span className="text-[9px] font-bold font-mono text-gray-500 tracking-wider block">TREND</span>
          <span className="text-xs font-sans text-emerald-500 font-bold flex items-center gap-1 mt-1">
            {trend}
          </span>
        </div>
      </div>

      {/* Chart Box */}
      <div className="flex-1 w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              {/* Glow Filter */}
              <filter id="risk-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Gradient background */}
              <linearGradient id="risk-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/15" vertical={false} />

            <XAxis 
              dataKey="time" 
              stroke="#475569" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false} 
              dy={10} 
            />

            <YAxis 
              stroke="#475569" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false} 
              domain={[0, 100]} 
            />

            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0a1424', 
                borderColor: '#1e293b', 
                borderRadius: '8px',
                fontSize: '10px',
                color: '#fff',
                fontFamily: 'monospace'
              }}
              cursor={{ stroke: '#1e293b', strokeWidth: 1 }}
            />

            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#ef4444" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#risk-gradient)" 
              filter="url(#risk-neon-glow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
