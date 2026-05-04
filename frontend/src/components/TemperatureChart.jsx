import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg px-3 py-2 text-xs"
           style={{ background: '#0F172A', border: '1px solid #334155', color: '#E2E8F0' }}>
        <p style={{ color: '#94A3B8' }}>{label}</p>
        <p style={{ color: '#F59E0B' }}>🌡 {payload[0].value}°C</p>
      </div>
    );
  }
  return null;
};

export default function TemperatureChart({ data = [] }) {
  const chartData = data
    .slice()
    .reverse()
    .slice(-15)
    .map(r => ({
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      temp: r.temperature,
    }));

  return (
    <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span>🌡️</span>
          <h2 className="text-sm font-bold" style={{ color: '#E2E8F0' }}>Temperature Trend</h2>
        </div>
        <span className="text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid #F59E0B' }}>
          Last 15 readings
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-40" style={{ color: '#475569' }}>
          <p className="text-sm">No data yet. Simulate a fault to see the chart.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} domain={[0, 120]} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="4 4" label={{ value: '⚠ 70°C', fill: '#EF4444', fontSize: 10, position: 'right' }} />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#tempGrad)"
              dot={{ r: 3, fill: '#F59E0B' }}
              activeDot={{ r: 5, fill: '#FBBF24' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
