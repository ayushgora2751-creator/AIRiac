import React, { useState } from 'react';
import { Navigation, Route, Sparkles } from 'lucide-react';
import { StationData } from '../../types/aqi';

interface CleanRoutePlannerProps {
  stations: StationData[];
  city: string;
}

export const CleanRoutePlanner: React.FC<CleanRoutePlannerProps> = ({
  stations,
  city,
}) => {
  const [startPoint, setStartPoint] = useState(stations[0]?.name || 'Origin');
  const [endPoint, setEndPoint] = useState(stations[1]?.name || 'Destination');

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/60 p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Exposure-Weighted Cleanest-Route Planner</h4>
            <p className="text-[11px] text-slate-500">Route through {city} green buffers & low-emission residential corridors</p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          Green Buffer Model
        </span>
      </div>

      {/* Start / Destination Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Starting Point (A)</label>
          <select
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            {stations.map((s) => (
              <option key={s.station_id} value={s.name}>
                {s.name} ({s.sector || 'Zone'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Destination Point (B)</label>
          <select
            value={endPoint}
            onChange={(e) => setEndPoint(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            {stations.map((s) => (
              <option key={s.station_id} value={s.name}>
                {s.name} ({s.sector || 'Zone'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Route Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Option A: Standard Arterial Route */}
          <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-slate-500" />
                Standard Major Arterial
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-200 text-red-900">
                High Smog
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs text-slate-600">
              <span>Distance: <strong>4.2 km</strong> (14 mins)</span>
              <span>Exposure: <strong className="text-red-700">198 AQI</strong></span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Dense diesel exhaust, highway particulate accumulation, zero canopy cover.
            </p>
          </div>

          {/* Option B: Clean-Air Route */}
          <div className="p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/70 space-y-2 shadow-sm relative">
            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
              Recommended: -42% Dose
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                BreatheWise Clean Corridor
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                Low Exposure
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs text-slate-600">
              <span>Distance: <strong>4.6 km</strong> (16 mins)</span>
              <span>Exposure: <strong className="text-emerald-700">114 AQI</strong></span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-tight font-medium">
              Routes along tree-canopied secondary boulevards; avoids major ring road congestion.
            </p>
          </div>
        </div>
    </div>
  );
};
