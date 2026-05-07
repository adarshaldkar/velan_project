import React from 'react';

const PHASES = [
  { key: 'R', label: 'R Phase', color: '#EF4444', lightColor: 'rgba(239,68,68,0.2)' },
  { key: 'Y', label: 'Y Phase', color: '#EAB308', lightColor: 'rgba(234,179,8,0.2)' },
  { key: 'B', label: 'B Phase', color: '#3B82F6', lightColor: 'rgba(59,130,246,0.2)' },
];

function StatusIndicator({ status, distance }) {
  const cfg = {
    FAULT:   { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: '⚡' },
    WARNING: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: '⚠️' },
    NORMAL:  { color: '#22C55E', bg: 'rgba(34,197,94,0.15)', icon: '✅' },
  };
  const c = cfg[status] ?? { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', icon: '⚪' };
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" 
         style={{ color: c.color, backgroundColor: c.bg, borderColor: c.color }}>
      <span className="text-sm">{c.icon}</span>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold leading-tight">{status}</span>
        {status === 'FAULT' && (
          <span className="text-xs font-mono font-bold leading-tight">{distance}m</span>
        )}
      </div>
    </div>
  );
}

export default function PhaseStatusTable({ data = [] }) {
  // Extract latest and previous data for each phase
  const phaseData = PHASES.map(phase => {
    const phaseRecords = data.filter(r => r.phase === phase.key || (r.phase === 'ALL' && r.status === 'FAULT'));
    return {
      ...phase,
      present: phaseRecords[0] || { status: 'NORMAL', distance: 0 },
      past: phaseRecords[1] || { status: 'NORMAL', distance: 0 },
    };
  });

  return (
    <div className="glass rounded-xl overflow-hidden border border-slate-800">
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900/50 border-b border-slate-800">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">RYB Phase Status</span>
        <div className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live Matrix</span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {phaseData.map((row) => (
          <div key={row.key} className="glass-dark rounded-lg p-3 border border-slate-800/50 flex items-center justify-between group transition-colors hover:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-xs"
                   style={{ color: row.color }}>
                {row.key}
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-tight">{row.label}</p>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Active Monitor</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Present</span>
                <StatusIndicator status={row.present.status} distance={row.present.distance} />
              </div>
              <div className="hidden sm:flex flex-col items-end opacity-30 group-hover:opacity-60 transition-opacity">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Past</span>
                <StatusIndicator status={row.past.status} distance={row.past.distance} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
