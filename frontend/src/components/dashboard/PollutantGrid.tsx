import React from 'react';
import { PollutantMap, PollutantKey } from '../../types/aqi';
import { MetricCard } from '../common/MetricCard';

interface PollutantGridProps {
  pollutants: PollutantMap;
  dominantPollutant?: string;
}

const POLLUTANT_METADATA: Record<
  PollutantKey,
  { label: string; fullName: string }
> = {
  pm25: { label: 'PM2.5', fullName: 'Fine Particulate Matter' },
  pm10: { label: 'PM10', fullName: 'Respirable Particulate' },
  no2: { label: 'NO2', fullName: 'Nitrogen Dioxide' },
  so2: { label: 'SO2', fullName: 'Sulphur Dioxide' },
  co: { label: 'CO', fullName: 'Carbon Monoxide' },
  o3: { label: 'O3', fullName: 'Ground-Level Ozone' },
  nh3: { label: 'NH3', fullName: 'Ammonia' },
};

export const PollutantGrid: React.FC<PollutantGridProps> = ({
  pollutants,
  dominantPollutant,
}) => {
  const pollutantKeys: PollutantKey[] = [
    'pm25',
    'pm10',
    'no2',
    'so2',
    'co',
    'o3',
    'nh3',
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">
          7-Pollutant Sub-Index Breakdown
        </h3>
        <span className="text-xs text-slate-500">
          CPCB Indian National Air Quality Standards
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pollutantKeys.map((key) => {
          const item = pollutants[key];
          const meta = POLLUTANT_METADATA[key];
          if (!item) return null;

          const isProminent =
            dominantPollutant?.toLowerCase() === meta.label.toLowerCase() ||
            dominantPollutant?.toLowerCase() === key.toLowerCase();

          return (
            <MetricCard
              key={key}
              label={meta.label}
              fullName={meta.fullName}
              value={item.value}
              unit={item.unit}
              subIndex={item.sub_index}
              isProminent={isProminent}
            />
          );
        })}
      </div>
    </section>
  );
};
