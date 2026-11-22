import React from 'react';
import { CityAQISummary } from '../../types/aqi';
import { AQIBadge } from '../common/AQIBadge';
import { Activity, Radio, Clock } from 'lucide-react';

interface CityOverviewProps {
  summary: CityAQISummary;
  selectedStationName?: string;
}

export const CityOverview: React.FC<CityOverviewProps> = ({
  summary,
  selectedStationName,
}) => {
  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>
              {selectedStationName ? `Station Focus: ${selectedStationName}` : 'City-Wide Composite AQI'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {summary.city} Air Quality
          </h2>

          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            {summary.health_statement}
          </p>

          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              Prominent Pollutant:{' '}
              <strong className="text-slate-800">{summary.dominant_pollutant}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              {summary.reporting_stations} CAAQMS reporting
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Updated: {new Date(summary.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end justify-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Current NAQI
          </span>
          <AQIBadge
            aqi={summary.overall_aqi}
            category={summary.category}
            size="xl"
          />
        </div>
      </div>
    </div>
  );
};
