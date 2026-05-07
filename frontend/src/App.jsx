import { useFaultData } from './hooks/useFaultData';
import FaultAlertCard from './components/FaultAlertCard';
import LiveStatusPanel from './components/LiveStatusPanel';
import MapView from './components/MapView';
import FaultHistoryTable from './components/FaultHistoryTable';
import TemperatureChart from './components/TemperatureChart';
import PhaseStatusTable from './components/PhaseStatusTable';

function Header() {
  return (
    <header className="sticky top-0 z-50 glass px-8 py-3 flex items-center justify-between border-b border-slate-800">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-red-600/20 border border-red-500/30">
          <span className="text-xl">⚡</span>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight text-white uppercase">
            Grid Monitor <span className="text-red-500 font-mono text-[10px] ml-2 px-1.5 py-0.5 bg-red-500/10 rounded border border-red-500/20">NODE_204</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Underground Cable Fault Detection System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center gap-6 border-r border-slate-800 pr-8">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase">Uptime</span>
            <span className="text-xs font-mono text-slate-300 tracking-tighter">99.98%</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase">Latency</span>
            <span className="text-xs font-mono text-slate-300 tracking-tighter">14ms</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Connected</span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatCard({ label, value, unit, color, icon, glowColor }) {
  return (
    <div className="glass rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
        <span className="text-lg opacity-30">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black tabular-nums tracking-tighter" style={{ color }}>
          {value}
        </span>
        <span className="text-[10px] font-bold text-slate-600 uppercase">{unit}</span>
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
        <main className="max-w-[1920px] mx-auto p-6 flex flex-col gap-6">

          {/* ── Dashboard Top Row ────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Stats Row (Span 12) */}
            <div className="xl:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon="📡" label="Node Status"
                value={latestFault?.status ?? 'IDLE'} unit=""
                color={isFault ? '#EF4444' : '#22C55E'}
              />
              <StatCard
                icon="📏" label="Fault Distance"
                value={latestFault?.distance ?? '—'} unit="m"
                color="#F59E0B"
              />
              <StatCard
                icon="🌡️" label="Core Temp"
                value={latestFault?.temperature ?? '—'} unit="°C"
                color={latestFault?.temperature > 70 ? '#EF4444' : '#22C55E'}
              />
              <StatCard
                icon="⚡" label="Alert Count"
                value={faultCount} unit="events"
                color="#EF4444"
              />
            </div>

            {/* Main Content Area (Left) */}
            <div className="xl:col-span-8 flex flex-col gap-6">
              <FaultAlertCard fault={latestFault} />
              <MapView fault={latestFault} />
              <TemperatureChart data={faultHistory} />
              <FaultHistoryTable data={faultHistory} />
            </div>

            {/* Sidebar Area (Right) */}
            <div className="xl:col-span-4 flex flex-col gap-6">
              <LiveStatusPanel fault={latestFault} />
              <PhaseStatusTable data={faultHistory} />
              
              {/* Metrics Grid */}
              <div className="glass rounded-xl overflow-hidden border border-slate-800">
                <div className="px-5 py-3 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Metrics</span>
                  <span className="text-xs font-mono text-amber-500 font-bold">{avgTemp}°C AVG</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <MiniStat label="History" value={faultHistory.length} icon="📝" />
                  <MiniStat label="Faults"  value={faultCount} color="#EF4444" icon="⚡" />
                  <MiniStat label="Normal" value={faultHistory.filter(f => f.status === 'NORMAL').length} color="#22C55E" icon="🛡️" />
                  <MiniStat label="Warning" value={faultHistory.filter(f => f.status === 'WARNING').length} color="#F59E0B" icon="⚠️" />
                </div>
              </div>

              {/* Simulation */}
              <div className="glass rounded-xl p-5 border border-dashed border-slate-800">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-3">Debug Console</p>
                <code className="block bg-black/40 p-3 rounded text-[9px] text-slate-500 font-mono break-all border border-slate-800">
                  POST /api/fault<br/>
                  {`{"distance":185,"temp":78,"status":"FAULT","phase":"R"}`}
                </code>
              </div>
            </div>

          </div>
        </main>
      )}
    </div>
  );
}

function MiniStat({ label, value, color = '#E2E8F0', icon }) {
  return (
    <div className="glass-dark rounded-2xl p-4 border border-white/5 flex flex-col gap-1 transition-transform hover:scale-105">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-xs opacity-50">{icon}</span>
      </div>
      <p className="text-2xl font-black tabular-nums tracking-tighter" style={{ color }}>{value}</p>
    </div>
  );
}
