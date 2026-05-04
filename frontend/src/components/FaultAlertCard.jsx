export default function FaultAlertCard({ fault }) {
  const isFault = fault?.status === 'FAULT';
  const isWarning = fault?.status === 'WARNING';

  if (!fault) {
    return (
      <div className="rounded-2xl p-6 flex flex-col items-center justify-center gap-3"
           style={{ background: '#1E293B', border: '1px solid #334155', minHeight: 200 }}>
        <span className="text-4xl">📡</span>
        <p style={{ color: '#94A3B8' }} className="text-sm font-medium">Awaiting sensor data…</p>
      </div>
    );
  }

  const bg = isFault ? '#7f1d1d' : isWarning ? '#78350f' : '#14532d';
  const border = isFault ? '#EF4444' : isWarning ? '#F59E0B' : '#22C55E';
  const label = isFault ? 'FAULT DETECTED' : isWarning ? 'WARNING' : 'SYSTEM NORMAL';
  const emoji = isFault ? '⚠️' : isWarning ? '🔶' : '✅';

  return (
    <div
      className={`rounded-2xl p-6 flex flex-col items-center justify-center gap-4 w-full ${isFault ? 'fault-pulse' : ''}`}
      style={{ background: bg, border: `2px solid ${border}`, minHeight: 220, transition: 'all 0.5s' }}
    >
      <span className="text-5xl">{emoji}</span>

      <div className="text-center">
        <p
          className={`text-2xl font-black tracking-widest ${isFault ? 'fault-blink' : ''}`}
          style={{ color: border, fontFamily: 'JetBrains Mono, monospace' }}
        >
          {label}
        </p>
        <p className="text-sm mt-1" style={{ color: '#CBD5E1' }}>GSM &amp; IoT Alert System</p>
      </div>

      <div className="rounded-xl px-6 py-3 text-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#94A3B8' }}>Fault Distance</p>
        <p className="text-5xl font-black" style={{ color: border, fontFamily: 'JetBrains Mono, monospace' }}>
          {fault.distance}
          <span className="text-xl font-medium ml-1" style={{ color: '#CBD5E1' }}>m</span>
        </p>
      </div>

      <p className="text-xs" style={{ color: '#94A3B8' }}>
        Last updated: {new Date(fault.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
}
