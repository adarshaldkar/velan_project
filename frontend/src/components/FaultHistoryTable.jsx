import { useState, useMemo } from 'react';

const COLUMNS = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'phase',     label: 'Phase' },
  { key: 'distance',  label: 'Distance (m)' },
  { key: 'temperature', label: 'Temp (°C)' },
  { key: 'status',    label: 'Status' },
];

function StatusPill({ status }) {
  const cfg = {
    FAULT:   { color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
    WARNING: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
    NORMAL:  { color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  };
  const c = cfg[status] ?? { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' };
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}` }}>
      {status}
    </span>
  );
}

function PhaseBadge({ phase }) {
  const cfg = {
    R: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
    Y: { color: '#EAB308', bg: 'rgba(234,179,8,0.15)' },
    B: { color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
    ALL: { color: '#A855F7', bg: 'rgba(168,85,247,0.15)' },
    NONE: { color: '#64748B', bg: 'rgba(100,116,139,0.1)' },
  };
  const c = cfg[phase] ?? cfg.NONE;
  return (
    <span className="text-[10px] font-black px-1.5 py-0.5 rounded border"
          style={{ color: c.color, background: c.bg, borderColor: c.color }}>
      {phase}
    </span>
  );
}

export default function FaultHistoryTable({ data = [] }) {
  const [sortKey, setSortKey] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === 'timestamp') { av = new Date(av); bv = new Date(bv); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const paged = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  function toggleSort(key) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(0);
  }

  return (
    <div className="glass rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-slate-900/50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
            📋
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Fault Sequence Log</h2>
            <p className="text-[10px] text-slate-500 font-medium">Historical Sensor Data Repository</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-white/5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.length} entries</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900/80">
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px] cursor-pointer select-none transition-colors"
                  style={{ color: sortKey === col.key ? '#38BDF8' : '#64748B', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-blue-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16" style={{ color: '#475569' }}>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl opacity-20">📭</span>
                    <p className="text-xs font-bold uppercase tracking-widest">No fault records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((row, i) => {
                const tempHigh = row.temperature > 70;
                return (
                  <tr
                    key={row._id ?? i}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4" style={{ color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                      {new Date(row.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <PhaseBadge phase={row.phase} />
                    </td>
                    <td className="px-6 py-4 font-bold tabular-nums" style={{ color: row.status === 'FAULT' ? '#EF4444' : '#E2E8F0', fontFamily: 'JetBrains Mono, monospace' }}>
                      {row.distance} <span className="text-[10px] font-normal opacity-50">m</span>
                    </td>
                    <td className="px-6 py-4 font-bold tabular-nums" style={{ color: tempHigh ? '#EF4444' : '#22C55E', fontFamily: 'JetBrains Mono, monospace' }}>
                      {row.temperature}°C {tempHigh && <span className="text-red-500 animate-pulse">!</span>}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={row.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/30 border-t border-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-1.5 glass-dark rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 disabled:opacity-20 hover:bg-white/5 transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-1.5 glass-dark rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 disabled:opacity-20 hover:bg-white/5 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
