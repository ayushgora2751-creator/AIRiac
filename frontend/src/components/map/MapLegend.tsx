import React from 'react';

const NAQI_LEVELS = [
  { label: 'Good (0-50)', color: 'bg-[#00B050]' },
  { label: 'Satisfactory (51-100)', color: 'bg-[#92D050]' },
  { label: 'Moderate (101-200)', color: 'bg-[#E5B800]' },
  { label: 'Poor (201-300)', color: 'bg-[#FF7C80]' },
  { label: 'Very Poor (301-400)', color: 'bg-[#D32F2F]' },
  { label: 'Severe (401-500)', color: 'bg-[#7B1FA2]' },
];

export const MapLegend: React.FC = () => {
  return (
    <div
      data-testid="map-legend"
      className="bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5"
    >
      <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">
        CPCB NAQI Index Key
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
        {NAQI_LEVELS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${item.color} shadow-xs shrink-0`} />
            <span className="text-slate-600 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
