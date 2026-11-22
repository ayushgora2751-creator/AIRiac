import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { StationData } from '../../types/aqi';
import { StationMarker } from './StationMarker';
import { MapLegend } from './MapLegend';
import { MOCK_CHANDIGARH_STATIONS } from '../../test/mocks/mockData';

interface ChandigarhMapProps {
  stations?: StationData[];
  selectedStationId?: string;
  onSelectStation?: (stationId: string) => void;
  center?: [number, number];
  zoom?: number;
}

const CHANDIGARH_CENTER: [number, number] = [30.7333, 76.7794];
const DEFAULT_ZOOM = 12;

export const ChandigarhMap: React.FC<ChandigarhMapProps> = ({
  stations = MOCK_CHANDIGARH_STATIONS,
  onSelectStation,
  center = CHANDIGARH_CENTER,
  zoom = DEFAULT_ZOOM,
}) => {
  return (
    <div
      data-testid="chandigarh-map-container"
      className="relative h-[420px] sm:h-[480px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station) => (
          <StationMarker
            key={station.station_id}
            station={station}
            onSelectStation={onSelectStation}
          />
        ))}
      </MapContainer>

      {/* Floating NAQI Scale Legend */}
      <div className="absolute bottom-4 left-4 z-[400] max-w-sm pointer-events-auto">
        <MapLegend />
      </div>
    </div>
  );
};
