export default function FaultAlertCard({ fault }) {
  const isFault = fault?.status === 'FAULT';
  const isWarning = fault?.status === 'WARNING';

  if (!fault) {
    return (
      <div className="glass rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[160px]">
        <span className="text-2xl opacity-20 animate-pulse">📡</span>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Waiting for Grid Sync...</p>
      </div>
    );
  }

  const statusColor = isFault ? '#EF4444' : isWarning ? '#F59E0B' : '#22C55E';
  const statusLabel = isFault ? 'Critical Breach' : isWarning ? 'Thermal Alert' : 'Grid Stable';

  return (
    <div className={`glass rounded-xl p-6 relative overflow-hidden flex items-center justify-between border-l-4 transition-all duration-500 ${isFault ? 'glow-red' : ''}`}
         style={{ borderLeftColor: statusColor }}>
      
      <div className="flex items-center gap-6 relative z-10">
        <div className={`h-14 w-14 rounded-full flex items-center justify-center bg-slate-900/50 border border-white/5`}>
          <span className="text-2xl">{isFault ? '⚡' : isWarning ? '⚠️' : '🛡️'}</span>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`h-1.5 w-1.5 rounded-full ${isFault ? 'animate-ping' : ''}`} style={{ backgroundColor: statusColor }}></span>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: statusColor }}>{statusLabel}</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            {isFault ? 'Fault Detected' : isWarning ? 'Warning Active' : 'System Normal'}
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Chennai Grid Segment Node #204</p>
        </div>
      </div>

      <div className="flex items-center gap-8 relative z-10">
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Fault Depth</p>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-3xl font-black tabular-nums tracking-tighter" style={{ color: statusColor }}>{fault.distance}</span>
            <span className="text-xs font-bold text-slate-600 uppercase">m</span>
          </div>
        </div>
        
        <div className="hidden md:block w-px h-12 bg-slate-800"></div>

        <div className="hidden md:block text-right">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Timestamp</p>
          <p className="text-xs font-mono text-slate-400">{new Date(fault.timestamp).toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Subtle Scanline Overlay */}
      <div className="absolute inset-0 scanline opacity-20 pointer-events-none"></div>
    </div>
  );
}
