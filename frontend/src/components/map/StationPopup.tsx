import React from 'react';
import { StationData } from '../../types/aqi';
import { AQIBadge } from '../common/AQIBadge';

interface StationPopupProps {
  station: StationData;
  onSelectStation?: (stationId: string) => void;
}

export const StationPopup: React.FC<StationPopupProps> = ({
  station,
  onSelectStation,
}) => {
  return (
    <div className="p-1 min-w-[220px] text-slate-800">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
        <div>
          <h4 className="font-bold text-sm text-slate-900 leading-tight">
            {station.name}
          </h4>
          <span className="text-xs text-slate-500 font-medium">{station.sector}</span>
        </div>
        <AQIBadge aqi={station.aqi} category={station.category} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-slate-50 p-1.5 rounded">
          <span className="text-[10px] text-slate-400 block font-medium">PM2.5</span>
          <span className="font-bold text-slate-700">
            {station.pollutants.pm25?.value} µg/m³
          </span>
        </div>
        <div className="bg-slate-50 p-1.5 rounded">
          <span className="text-[10px] text-slate-400 block font-medium">PM10</span>
          <span className="font-bold text-slate-700">
            {station.pollutants.pm10?.value} µg/m³
          </span>
        </div>
        <div className="bg-slate-50 p-1.5 rounded">
          <span className="text-[10px] text-slate-400 block font-medium">Prominent</span>
          <span className="font-bold text-emerald-700">{station.dominant_pollutant}</span>
        </div>
        <div className="bg-slate-50 p-1.5 rounded">
          <span className="text-[10px] text-slate-400 block font-medium">Sub-Index</span>
          <span className="font-bold text-slate-700">{Math.round(station.aqi)}</span>
        </div>
      </div>

      {onSelectStation && (
        <button
          type="button"
          onClick={() => onSelectStation(station.station_id)}
          className="w-full text-center py-1 px-2 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          Focus Station Readings
        </button>
      )}
    </div>
  );
};
