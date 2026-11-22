import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { StationData } from '../../types/aqi';
import { getNAQIInfo } from '../common/AQIBadge';
import { StationPopup } from './StationPopup';

interface StationMarkerProps {
  station: StationData;
  onSelectStation?: (stationId: string) => void;
}

export const StationMarker: React.FC<StationMarkerProps> = ({
  station,
  onSelectStation,
}) => {
  const lat = Number(station?.latitude);
  const lng = Number(station?.longitude);

  // Validate coordinates to prevent Leaflet LatLng crashes
  if (!station || isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
    return null;
  }

  const aqiVal = typeof station.aqi === 'number' ? station.aqi : 100;
  const info = getNAQIInfo(aqiVal);

  // Generate custom HTML DivIcon colored by NAQI band
  const customIcon = L.divIcon({
    className: 'custom-station-pin',
    html: `
      <div style="
        background-color: ${info.hex};
        color: ${info.category === 'Satisfactory' || info.category === 'Moderate' || info.category === 'Poor' ? '#0f172a' : '#ffffff'};
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
        border-radius: 9999px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 900;
        font-size: 11px;
        line-height: 1;
        cursor: pointer;
        transition: transform 150ms ease;
      ">
        ${Math.round(aqiVal)}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

  return (
    <Marker
      position={[lat, lng]}
      icon={customIcon}
    >
      <Popup>
        <StationPopup
          station={station}
          onSelectStation={onSelectStation}
        />
      </Popup>
    </Marker>
  );
};
