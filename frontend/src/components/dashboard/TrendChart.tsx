import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { DiurnalTrendPoint } from '../../types/aqi';

interface TrendChartProps {
  data: DiurnalTrendPoint[];
  stationName?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  stationName = 'Sector 22 CAAQMS',
}) => {
  return (
    <div
      data-testid="trend-chart-container"
      className="bg-white/85 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            24-Hour Diurnal AQI Trend
          </h3>
          <p className="text-xs text-slate-500">
            Monitoring Station: {stationName} • CPCB NAQI Reference Thresholds
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#0284c7]" />
            Overall AQI
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#d97706]" />
            PM2.5 (µg/m³)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#64748b]" />
            PM10 (µg/m³)
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={280}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

            {/* CPCB Threshold Reference Lines */}
            <ReferenceLine
              y={50}
              stroke="#00B050"
              strokeDasharray="3 3"
              label={{ value: 'Good (50)', fill: '#00B050', fontSize: 10, position: 'insideTopRight' }}
            />
            <ReferenceLine
              y={100}
              stroke="#92D050"
              strokeDasharray="3 3"
              label={{ value: 'Satisfactory (100)', fill: '#65a30d', fontSize: 10, position: 'insideTopRight' }}
            />
            <ReferenceLine
              y={200}
              stroke="#E5B800"
              strokeDasharray="3 3"
              label={{ value: 'Moderate (200)', fill: '#b45309', fontSize: 10, position: 'insideTopRight' }}
            />
            <ReferenceLine
              y={300}
              stroke="#FF7C80"
              strokeDasharray="3 3"
              label={{ value: 'Poor (300)', fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }}
            />

            <Line
              type="monotone"
              dataKey="aqi"
              name="AQI Score"
              stroke="#0284c7"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="pm25"
              name="PM2.5"
              stroke="#d97706"
              strokeWidth={1.8}
              strokeDasharray="4 2"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="pm10"
              name="PM10"
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="2 2"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
