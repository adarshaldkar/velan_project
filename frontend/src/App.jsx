import { useFaultData } from './hooks/useFaultData';
import FaultAlertCard from './components/FaultAlertCard';
import LiveStatusPanel from './components/LiveStatusPanel';
import MapView from './components/MapView';
import FaultHistoryTable from './components/FaultHistoryTable';
import TemperatureChart from './components/TemperatureChart';

function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4"
            style={{ background: '#0B1120', borderBottom: '1px solid #1E293B' }}>
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="h-10 w-10 rounded-xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #EF4444, #B91C1C)' }}>
          <span className="text-xl">⚡</span>
        </div>
        <div>
          <h1 className="text-base font-black tracking-wide" style={{ color: '#F1F5F9' }}>
            Cable Fault Monitoring System
          </h1>
          <p className="text-xs" style={{ color: '#475569' }}>
            Underground GSM &amp; IoT Fault Detection · Chennai Grid
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs font-semibold" style={{ color: '#22C55E' }}>SYSTEM ONLINE</p>
          <p className="text-xs" style={{ color: '#475569' }}>
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="h-3 w-3 rounded-full"
             style={{ background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
      </div>
    </header>
  );
}

function StatCard({ label, value, unit, color, icon }) {
  return (
    <div className="rounded-xl px-5 py-4 flex items-center gap-4"
         style={{ background: '#1E293B', border: '1px solid #334155' }}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs" style={{ color: '#64748B' }}>{label}</p>
        <p className="text-xl font-black" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>
          {value}<span className="text-sm font-normal ml-1" style={{ color: '#64748B' }}>{unit}</span>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const { latestFault, faultHistory, loading } = useFaultData(4000);

  const isFault   = latestFault?.status === 'FAULT';
  const faultCount = faultHistory.filter(f => f.status === 'FAULT').length;
  const avgTemp    = faultHistory.length
    ? (faultHistory.reduce((s, f) => s + f.temperature, 0) / faultHistory.length).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>
      <Header />

      {/* ── Loading splash ─────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-10 w-10 rounded-full border-4 border-t-red-500 border-slate-700 animate-spin mx-auto mb-3" />
            <p style={{ color: '#64748B' }} className="text-sm">Connecting to sensor network…</p>
          </div>
        </div>
      )}

      {!loading && (
        <main className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col gap-6">

          {/* ── Top summary stats ──────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon="📡" label="System Status"
              value={latestFault?.status ?? 'IDLE'} unit=""
              color={isFault ? '#EF4444' : '#22C55E'}
            />
            <StatCard
              icon="📏" label="Last Fault Distance"
              value={latestFault?.distance ?? '—'} unit="m"
              color="#F59E0B"
            />
            <StatCard
              icon="🌡️" label="Last Temperature"
              value={latestFault?.temperature ?? '—'} unit="°C"
              color={latestFault?.temperature > 70 ? '#EF4444' : '#22C55E'}
            />
            <StatCard
              icon="⚡" label="Total Faults"
              value={faultCount} unit="events"
              color="#EF4444"
            />
          </div>

          {/* ── Alert + Status Row ─────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <FaultAlertCard fault={latestFault} />
            </div>
            <div className="lg:col-span-2">
              <LiveStatusPanel fault={latestFault} />
            </div>
          </div>

          {/* ── Map ───────────────────────────────────── */}
          <MapView fault={latestFault} />

          {/* ── Temp Chart + Table ─────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <TemperatureChart data={faultHistory} />
            <div className="rounded-2xl overflow-hidden" style={{ background: '#1E293B', border: '1px solid #334155' }}>
              <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #334155' }}>
                <span>📊</span>
                <p className="text-sm font-bold" style={{ color: '#E2E8F0' }}>Avg Temperature</p>
                <span className="ml-auto text-lg font-black"
                      style={{ color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace' }}>
                  {avgTemp}<span className="text-sm font-normal ml-1" style={{ color: '#64748B' }}>°C</span>
                </span>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-4">
                <MiniStat label="Total Records" value={faultHistory.length} />
                <MiniStat label="FAULT Events"  value={faultCount} color="#EF4444" />
                <MiniStat label="NORMAL Events" value={faultHistory.filter(f => f.status === 'NORMAL').length} color="#22C55E" />
                <MiniStat label="WARNING Events" value={faultHistory.filter(f => f.status === 'WARNING').length} color="#F59E0B" />
              </div>
            </div>
          </div>

          {/* ── Full history table ─────────────────────── */}
          <FaultHistoryTable data={faultHistory} />

          {/* ── Simulation hint ────────────────────────── */}
          <div className="rounded-xl px-5 py-4" style={{ background: '#1E293B', border: '1px dashed #334155' }}>
            <p className="text-xs font-bold mb-2" style={{ color: '#38BDF8' }}>🧪 Simulate a Fault via Postman or curl:</p>
            <code className="text-xs" style={{ color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>
              POST http://localhost:5000/api/fault · Body: {'{"distance":185,"temperature":78,"status":"FAULT"}'}
            </code>
          </div>
        </main>
      )}
    </div>
  );
}

function MiniStat({ label, value, color = '#E2E8F0' }) {
  return (
    <div className="rounded-lg px-3 py-3" style={{ background: '#0F172A' }}>
      <p className="text-xs mb-1" style={{ color: '#64748B' }}>{label}</p>
      <p className="text-xl font-black" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>{value}</p>
    </div>
  );
}
