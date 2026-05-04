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
    <div className="rounded-2xl p-6 h-full flex flex-col gap-2"
         style={{ background: '#1E293B', border: '1px solid #334155' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold tracking-wide" style={{ color: '#E2E8F0' }}>Live Status</h2>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
          <span className="text-xs" style={{ color: '#94A3B8' }}>LIVE</span>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #334155' }}>
        <span className="text-sm" style={{ color: '#94A3B8' }}>System Status</span>
        <StatusBadge status={fault?.status ?? 'NORMAL'} />
      </div>

      <InfoRow
        label="Fault Distance"
        value={fault?.distance ?? '—'}
        unit="m"
        highlight={statusColor}
      />
      <InfoRow
        label="Temperature"
        value={fault?.temperature ?? '—'}
        unit="°C"
        highlight={tempColor}
      />

      {/* Temperature bar */}
      <div className="mt-1 mb-1">
        <div className="flex justify-between text-xs mb-1" style={{ color: '#64748B' }}>
          <span>Temp. Level</span>
          <span>{fault?.temperature ?? 0}°C / 100°C</span>
        </div>
        <div className="w-full rounded-full h-2" style={{ background: '#0F172A' }}>
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(fault?.temperature ?? 0, 100)}%`,
              background: tempColor,
              boxShadow: `0 0 8px ${tempColor}`,
            }}
          />
        </div>
        {fault?.temperature > 70 && (
          <p className="text-xs mt-1 fault-blink" style={{ color: '#EF4444' }}>
            ⚠ High temperature warning!
          </p>
        )}
      </div>

      <InfoRow label="Alert Method" value="GSM & IoT" />
      <InfoRow
        label="Last Signal"
        value={fault ? new Date(fault.timestamp).toLocaleTimeString() : '—'}
      />

      {/* Footer note */}
      <div className="mt-auto pt-3">
        <p className="text-xs" style={{ color: '#475569' }}>
          Auto-refresh every 4s · Polling mode active
        </p>
      </div>
    </div>
  );
}
