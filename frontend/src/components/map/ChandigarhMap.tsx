import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { StationData } from '../../types/aqi';
import { StationMarker } from './StationMarker';
import { MapLegend } from './MapLegend';
import { MOCK_CHANDIGARH_STATIONS } from '../../test/mocks/mockData';
import { Sparkles, AlertOctagon, Layers } from 'lucide-react';

interface ChandigarhMapProps {
  stations?: StationData[];
  selectedStationId?: string;
  onSelectStation?: (stationId: string) => void;
  center?: [number, number];
  zoom?: number;
}

const CHANDIGARH_CENTER: [number, number] = [30.7333, 76.7794];
const DEFAULT_ZOOM = 12;
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || '';

// Recenter and invalidate size so tiles render cleanly without grey gaps
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
    // Invalidate size ensures tile grid fills the container smoothly
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [center, zoom, map]);

  return null;
};

export const ChandigarhMap: React.FC<ChandigarhMapProps> = ({
  stations = MOCK_CHANDIGARH_STATIONS,
  onSelectStation,
  center = CHANDIGARH_CENTER,
  zoom = DEFAULT_ZOOM,
}) => {
  // Default to reliable high-speed OpenStreetMap / CartoDB tiles that never return 403 on localhost
  const [tileSource, setTileSource] = useState<'osm' | 'voyager' | 'maptiler'>('osm');

  // Filter valid stations with numerical lat/lng
  const validStations = stations.filter(
    (s) =>
      typeof s?.latitude === 'number' &&
      typeof s?.longitude === 'number' &&
      !isNaN(s.latitude) &&
      !isNaN(s.longitude) &&
      s.latitude !== 0 &&
      s.longitude !== 0
  );

  const cleanestStation = validStations.length
    ? [...validStations].sort((a, b) => (a.aqi ?? 999) - (b.aqi ?? 999))[0]
    : null;

  const hotspotStation = validStations.length
    ? [...validStations].sort((a, b) => (b.aqi ?? 0) - (a.aqi ?? 0))[0]
    : null;

  // Tile configurations
  let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  let tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

  if (tileSource === 'voyager') {
    tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    tileAttribution = '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap';
  } else if (tileSource === 'maptiler' && MAPTILER_KEY) {
    tileUrl = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;
    tileAttribution = '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; OpenStreetMap';
  }

  const cycleTileSource = () => {
    if (tileSource === 'osm') {
      setTileSource('voyager');
    } else if (tileSource === 'voyager') {
      if (MAPTILER_KEY) {
        setTileSource('maptiler');
      } else {
        setTileSource('osm');
      }
    } else {
      setTileSource('osm');
    }
  };

  const getTileLabel = () => {
    if (tileSource === 'voyager') return 'CartoDB Clean';
    if (tileSource === 'maptiler' && MAPTILER_KEY) return 'MapTiler Cloud';
    return 'OpenStreetMap';
  };

  return (
    <div
      data-testid="chandigarh-map-container"
      className="relative h-[420px] sm:h-[480px] w-full rounded-2xl overflow-hidden border border-white/60 shadow-lg bg-slate-200"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full z-10"
      >
        <MapController center={center} zoom={zoom} />

        <TileLayer
          key={tileSource}
          attribution={tileAttribution}
          url={tileUrl}
        />

        {validStations.map((station) => (
          <StationMarker
            key={station.station_id || `${station.name}-${station.latitude}`}
            station={station}
            onSelectStation={onSelectStation}
          />
        ))}
      </MapContainer>

      {/* Floating Map Tile Switcher */}
      <div className="absolute top-3 left-3 z-[400] pointer-events-auto">
        <button
          onClick={cycleTileSource}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white backdrop-blur-md border border-slate-300 shadow-md text-slate-800 text-xs font-bold transition-all"
          title="Switch Map Tile Provider"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Map: {getTileLabel()}</span>
        </button>
      </div>

      {/* Floating Cleanest & Hotspot Highlights Banner */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5 pointer-events-auto max-w-[240px]">
        {cleanestStation && (
          <button
            onClick={() => onSelectStation?.(cleanestStation.station_id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-semibold shadow-md hover:bg-emerald-700 transition-all text-left"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
            <span className="truncate">
              Cleanest: <strong>{cleanestStation.name}</strong> ({cleanestStation.aqi})
            </span>
          </button>
        )}

        {hotspotStation && (
          <button
            onClick={() => onSelectStation?.(hotspotStation.station_id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-600/95 backdrop-blur-md text-white text-[11px] font-semibold shadow-md hover:bg-rose-700 transition-all text-left"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-200 shrink-0" />
            <span className="truncate">
              Hotspot: <strong>{hotspotStation.name}</strong> ({hotspotStation.aqi})
            </span>
          </button>
        )}
      </div>

      {/* Floating NAQI Scale Legend */}
      <div className="absolute bottom-4 left-4 z-[400] max-w-sm pointer-events-auto">
        <MapLegend />
      </div>
    </div>
  );
};
