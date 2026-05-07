function StatusBadge({ status }) {
  const cfg = {
    FAULT:   { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   label: 'FAULT' },
    WARNING: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', label: 'WARNING' },
    NORMAL:  { color: '#22C55E', bg: 'rgba(34,197,94,0.15)',  label: 'NORMAL' },
  };
  const c = cfg[status] ?? { color: '#94A3B8', bg: 'rgba(148,163,184,0.15)', label: status ?? '—' };
  return (
    <span
      className="text-xs font-bold px-3 py-1 rounded-full"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}` }}
    >
      {c.label}
    </span>
  );
}

function InfoRow({ label, value, unit, highlight }) {
  return (
    <div className="flex items-center justify-between py-3"
         style={{ borderBottom: '1px solid #334155' }}>
      <span className="text-sm" style={{ color: '#94A3B8' }}>{label}</span>
      <span className="font-semibold text-lg" style={{ color: highlight ?? '#E2E8F0', fontFamily: 'JetBrains Mono, monospace' }}>
        {value ?? '—'}{unit && <span className="text-sm font-normal ml-1" style={{ color: '#64748B' }}>{unit}</span>}
      </span>
    </div>
  );
}

export default function LiveStatusPanel({ fault }) {
  const tempColor =
    !fault ? '#94A3B8'
    : fault.temperature > 70 ? '#EF4444'
    : fault.temperature > 55 ? '#F59E0B'
    : '#22C55E';

  const statusColor = fault?.status === 'FAULT' ? '#EF4444' : fault?.status === 'WARNING' ? '#F59E0B' : '#22C55E';

  return (
    <div className="glass rounded-3xl p-6 h-full flex flex-col gap-2 relative overflow-hidden group">
      {/* Decorative Gradient Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-20 transition-all duration-700 group-hover:opacity-30"
           style={{ backgroundColor: statusColor }}></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Live Diagnostics</h2>
          <p className="text-[10px] text-slate-500 font-medium">Real-time Node Telemetry</p>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 glass-dark rounded-full border border-white/5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22C55E] animate-pulse" />
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {/* Status badge */}
        <div className="flex items-center justify-between py-4 border-b border-white/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Mode</span>
          <StatusBadge status={fault?.status ?? 'NORMAL'} />
        </div>

        <InfoRow
          label="Detected Fault Depth"
          value={fault?.distance ?? '—'}
          unit="m"
          highlight={statusColor}
        />
        <InfoRow
          label="Thermal Baseline"
          value={fault?.temperature ?? '—'}
          unit="°C"
          highlight={tempColor}
        />

        {/* Temperature bar */}
        <div className="py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Core Temperature</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: tempColor }}>{fault?.temperature ?? 0}°C / 100°C</span>
          </div>
          <div className="w-full rounded-full h-1.5 bg-slate-800/50 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{
                width: `${Math.min(fault?.temperature ?? 0, 100)}%`,
                background: tempColor,
                boxShadow: `0 0 12px ${tempColor}`,
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
            </div>
          </div>
          {fault?.temperature > 70 && (
            <p className="text-[10px] mt-2 font-black uppercase tracking-wider animate-bounce" style={{ color: '#EF4444' }}>
              ⚠ THERMAL OVERLOAD DETECTED
            </p>
          )}
        </div>

        <InfoRow label="Telemetry Uplink" value="GSM & IoT" />
        <InfoRow
          label="Sequence Timestamp"
          value={fault ? new Date(fault.timestamp).toLocaleTimeString() : '—'}
        />
      </div>

      {/* Footer note */}
      <div className="mt-auto pt-4 border-t border-white/5">
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] text-center">
          Active Polling Loop: 4000ms
        </p>
      </div>
    </div>
  );
}
