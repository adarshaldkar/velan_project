import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';

// Fix default leaflet icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Chennai demo cable route
const CABLE_START = [13.0827, 80.2707]; // Chennai city center
const CABLE_END   = [13.0450, 80.2101]; // ~4.5 km SW
const TOTAL_DISTANCE_M = 500; // simulated cable span in meters

function interpolate(start, end, ratio) {
  return [
    start[0] + (end[0] - start[0]) * ratio,
    start[1] + (end[1] - start[1]) * ratio,
  ];
}

const faultIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:#EF4444;border:3px solid #fff;
    box-shadow:0 0 12px #EF4444,0 0 24px rgba(239,68,68,0.5);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function MapView({ fault }) {
  const faultRatio = useMemo(() => {
    if (!fault?.distance) return null;
    return Math.min(fault.distance / TOTAL_DISTANCE_M, 1);
  }, [fault]);

  const faultPos = faultRatio !== null ? interpolate(CABLE_START, CABLE_END, faultRatio) : null;
  const mapCenter = [13.0638, 80.2404];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #334155' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3" style={{ background: '#1E293B' }}>
        <div className="flex items-center gap-2">
          <span>🗺️</span>
          <h2 className="text-sm font-bold" style={{ color: '#E2E8F0' }}>Cable Fault Map — Chennai Demo</h2>
        </div>
        {faultPos && (
          <span className="text-xs px-2 py-1 rounded-full fault-blink"
                style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid #EF4444' }}>
            Fault @ {fault.distance} m
          </span>
        )}
      </div>

      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: 360, width: '100%' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />

        {/* Cable line */}
        <Polyline
          positions={[CABLE_START, CABLE_END]}
          pathOptions={{ color: '#F59E0B', weight: 4, dashArray: '8 6', opacity: 0.9 }}
        />

        {/* Start marker */}
        <CircleMarker
          center={CABLE_START}
          radius={8}
          pathOptions={{ color: '#22C55E', fillColor: '#22C55E', fillOpacity: 1, weight: 2 }}
        >
          <Tooltip permanent direction="top" offset={[0, -10]}>
            <span style={{ fontSize: 11 }}>📍 Cable Start</span>
          </Tooltip>
        </CircleMarker>

        {/* End marker */}
        <CircleMarker
          center={CABLE_END}
          radius={8}
          pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 1, weight: 2 }}
        >
          <Tooltip permanent direction="bottom" offset={[0, 10]}>
            <span style={{ fontSize: 11 }}>📍 Cable End</span>
          </Tooltip>
        </CircleMarker>

        {/* Fault location marker */}
        {faultPos && (
          <Marker position={faultPos} icon={faultIcon}>
            <Tooltip permanent direction="top" offset={[0, -14]}>
              <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 'bold' }}>
                ⚠ Fault @ {fault.distance} m · {fault.temperature}°C
              </span>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {/* Legend */}
      <div className="flex items-center gap-5 px-5 py-2" style={{ background: '#1E293B' }}>
        <LegendItem color="#22C55E" label="Cable Start" />
        <LegendItem color="#3B82F6" label="Cable End" />
        <LegendItem color="#F59E0B" label="Cable Route" />
        <LegendItem color="#EF4444" label="Fault Point" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span className="text-xs" style={{ color: '#94A3B8' }}>{label}</span>
    </div>
  );
}
