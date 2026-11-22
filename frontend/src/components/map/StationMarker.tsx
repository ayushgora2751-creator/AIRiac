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
  const info = getNAQIInfo(station.aqi);

  // Generate custom HTML DivIcon colored by NAQI band
  const customIcon = L.divIcon({
    className: 'custom-station-pin',
    html: `
      <div style="
        background-color: ${info.hex};
        color: ${info.category === 'Satisfactory' || info.category === 'Moderate' || info.category === 'Poor' ? '#111827' : '#ffffff'};
        border: 2px solid #ffffff;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);
        border-radius: 9999px;
        width: 38px;
        height: 38px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: ui-monospace, monospace;
        font-weight: 800;
        font-size: 11px;
        line-height: 1;
        cursor: pointer;
      ">
        <span>${Math.round(station.aqi)}</span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });

  return (
    <Marker
      position={[station.latitude, station.longitude]}
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
