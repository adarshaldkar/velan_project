import { useState, useMemo } from 'react';

const COLUMNS = [
  { key: 'timestamp', label: 'Timestamp' },
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
    <div className="rounded-2xl overflow-hidden" style={{ background: '#1E293B', border: '1px solid #334155' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #334155' }}>
        <div className="flex items-center gap-2">
          <span>📋</span>
          <h2 className="text-sm font-bold" style={{ color: '#E2E8F0' }}>Fault History</h2>
        </div>
        <span className="text-xs px-2 py-1 rounded-full"
              style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid #334155' }}>
          {data.length} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#0F172A' }}>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="px-5 py-3 text-left font-semibold cursor-pointer select-none"
                  style={{ color: sortKey === col.key ? '#38BDF8' : '#64748B', borderBottom: '1px solid #334155' }}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10" style={{ color: '#475569' }}>
                  No fault records yet. POST to /api/fault to simulate a fault.
                </td>
              </tr>
            ) : (
              paged.map((row, i) => {
                const tempHigh = row.temperature > 70;
                return (
                  <tr
                    key={row._id ?? i}
                    style={{
                      borderBottom: '1px solid #1E293B',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                      transition: 'background 0.2s',
                    }}
                    className="hover:bg-slate-700/30"
                  >
                    <td className="px-5 py-3" style={{ color: '#CBD5E1', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                      {new Date(row.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-semibold" style={{ color: row.status === 'FAULT' ? '#EF4444' : '#E2E8F0', fontFamily: 'JetBrains Mono, monospace' }}>
                      {row.distance} m
                    </td>
                    <td className="px-5 py-3 font-semibold" style={{ color: tempHigh ? '#EF4444' : '#22C55E', fontFamily: 'JetBrains Mono, monospace' }}>
                      {row.temperature}°C {tempHigh && <span className="text-xs">⚠</span>}
                    </td>
                    <td className="px-5 py-3">
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
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #334155' }}>
          <span className="text-xs" style={{ color: '#64748B' }}>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded text-xs font-medium disabled:opacity-40"
              style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid #334155' }}
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded text-xs font-medium disabled:opacity-40"
              style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid #334155' }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
