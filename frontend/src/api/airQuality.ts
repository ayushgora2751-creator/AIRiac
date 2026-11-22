import { apiClient } from './client';
import { calculateSubIndex } from '../utils/cpcbAqi';
import {
  CityAQISummary,
  StationData,
  DiurnalTrendPoint,
  NAQICalculateRequest,
  NAQICalculateResponse,
  PollutantKey,
  PollutantMap,
  NAQICategory,
} from '../types/aqi';

export interface LatestAirQualityResponse {
  city_summary: CityAQISummary;
  stations: StationData[];
}

export interface HistoricalSeriesResponse {
  station_code: string;
  series: DiurnalTrendPoint[];
}

interface RawPollutantData {
  value?: number;
  concentration?: number;
  reading?: number;
  sub_index?: number;
  unit?: string;
}

interface RawStationPayload {
  station_id?: string;
  station_code?: string;
  code?: string;
  name?: string;
  station_name?: string;
  latitude?: number | string;
  longitude?: number | string;
  location?: {
    latitude?: number | string;
    longitude?: number | string;
  };
  sector?: string;
  sector_name?: string;
  aqi?: number | string;
  category?: NAQICategory;
  dominant_pollutant?: string;
  prominent_pollutant?: string;
  pollutants?: Record<string, RawPollutantData | number>;
  sub_indices?: Record<string, number>;
  updated_at?: string;
  timestamp?: string;
}

interface RawCitySummaryPayload {
  city?: string;
  overall_aqi?: number;
  average_aqi?: number;
  aqi?: number;
  category?: NAQICategory;
  dominant_pollutant?: string;
  prominent_pollutant?: string;
  reporting_stations?: number;
  health_statement?: string;
  timestamp?: string;
  last_updated?: string;
}

interface RawLatestAirQualityPayload {
  city_summary?: RawCitySummaryPayload;
  stations?: RawStationPayload[];
}

interface RawTrendItemPayload {
  time?: string;
  timestamp?: string;
  aqi?: number | string;
  pm25?: number | string;
  pm10?: number | string;
}

interface RawHistoricalPayload {
  station_code?: string;
  series?: RawTrendItemPayload[];
}

interface RawLocationStationPayload {
  code?: string;
  station_id?: string;
  station_code?: string;
  name?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  sector?: {
    name?: string;
  };
  aqi?: number;
  category?: NAQICategory;
  prominent_pollutant?: string;
  pollutants?: PollutantMap;
  updated_at?: string;
}

export const airQualityApi = {
  getLatest: async (city = 'Chandigarh', stationCode?: string): Promise<LatestAirQualityResponse> => {
    const params: Record<string, string> = { city };
    if (stationCode) params.station_code = stationCode;
    const response = await apiClient.get<RawLatestAirQualityPayload>('/air-quality/latest/', { params });
    const data = response.data;

    const rawSummary = data.city_summary || {};
    const city_summary: CityAQISummary = {
      city: rawSummary.city || 'Chandigarh',
      overall_aqi:
        rawSummary.overall_aqi ??
        rawSummary.average_aqi ??
        rawSummary.aqi ??
        120,
      category: rawSummary.category || 'Moderate',
      dominant_pollutant:
        rawSummary.dominant_pollutant ||
        rawSummary.prominent_pollutant ||
        'PM2.5',
      reporting_stations: rawSummary.reporting_stations || 4,
      health_statement:
        rawSummary.health_statement ||
        'Moderate air quality. Sensitive individuals should consider reducing prolonged outdoor exertion.',
      timestamp:
        rawSummary.timestamp ||
        rawSummary.last_updated ||
        new Date().toISOString(),
    };

    const stations: StationData[] = (data.stations || []).map((s: RawStationPayload) => {
      const lat = Number(s.latitude ?? s.location?.latitude ?? 30.7333);
      const lng = Number(s.longitude ?? s.location?.longitude ?? 76.7794);

      const pollutantsMap: PollutantMap = {
        pm25: { value: 0, sub_index: 0, unit: 'µg/m³' },
        pm10: { value: 0, sub_index: 0, unit: 'µg/m³' },
        no2: { value: 0, sub_index: 0, unit: 'µg/m³' },
        so2: { value: 0, sub_index: 0, unit: 'µg/m³' },
        co: { value: 0, sub_index: 0, unit: 'mg/m³' },
        o3: { value: 0, sub_index: 0, unit: 'µg/m³' },
        nh3: { value: 0, sub_index: 0, unit: 'µg/m³' },
      };
      const rawPollutants = s.pollutants || {};
      const pollutantKeys: PollutantKey[] = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'nh3'];
      for (const key of pollutantKeys) {
        const p = rawPollutants[key];
        const val =
          typeof p === 'number'
            ? p
            : p?.value ?? p?.concentration ?? p?.reading ?? 0;
        const valNum = Number(val) || 0;
        const computedSub = calculateSubIndex(key, valNum);
        const sub =
          computedSub ??
          (typeof p === 'object' && p !== null ? p.sub_index : undefined) ??
          (s.sub_indices ? s.sub_indices[key] : undefined) ??
          0;
        const unit =
          (typeof p === 'object' && p !== null ? p.unit : undefined) ||
          (key === 'co' ? 'mg/m³' : 'µg/m³');

        pollutantsMap[key] = {
          value: Number(val) || 0,
          sub_index: Number(sub) || 0,
          unit,
        };
      }

      return {
        station_id: String(s.station_id || s.station_code || s.code || 'CH-STATION'),
        station_code: s.station_code || s.code,
        code: s.code || s.station_code,
        name: String(s.name || s.station_name || 'Station'),
        latitude: lat,
        longitude: lng,
        sector: s.sector || s.sector_name,
        aqi: Number(s.aqi) || 100,
        category: s.category || 'Moderate',
        dominant_pollutant: String(
          s.dominant_pollutant || s.prominent_pollutant || 'PM2.5'
        ),
        pollutants: pollutantsMap,
        updated_at: String(s.updated_at || s.timestamp || new Date().toISOString()),
      };
    });

    return { city_summary, stations };
  },

  getHistory: async (
    stationCode = 'CH-SEC22-CAAQMS',
    hours = 24
  ): Promise<HistoricalSeriesResponse> => {
    const response = await apiClient.get<RawHistoricalPayload>('/air-quality/history/', {
      params: { station_code: stationCode, hours },
    });
    const data = response.data;
    const rawSeries = data.series || [];
    const series: DiurnalTrendPoint[] = rawSeries.map((item: RawTrendItemPayload) => {
      let timeStr = item.time;
      if (!timeStr && item.timestamp) {
        timeStr = new Date(item.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return {
        time: timeStr || '00:00',
        timestamp: item.timestamp,
        aqi: Number(item.aqi) || 0,
        pm25: Number(item.pm25) || 0,
        pm10: Number(item.pm10) || 0,
      };
    });

    return {
      station_code: data.station_code || stationCode,
      series,
    };
  },

  calculate: async (
    data: NAQICalculateRequest
  ): Promise<NAQICalculateResponse> => {
    const response = await apiClient.post<NAQICalculateResponse>(
      '/air-quality/calculate/',
      data
    );
    return response.data;
  },

  getStations: async (): Promise<StationData[]> => {
    const response = await apiClient.get<RawLocationStationPayload[]>('/locations/stations/');
    return (response.data || []).map((s) => ({
      station_id: s.code || s.station_id || 'CH-STATION',
      station_code: s.station_code || s.code,
      code: s.code || s.station_code,
      name: s.name || 'Station',
      latitude: s.location?.latitude ?? 30.7333,
      longitude: s.location?.longitude ?? 76.7794,
      sector: s.sector?.name,
      aqi: s.aqi || 100,
      category: s.category || 'Moderate',
      dominant_pollutant: s.prominent_pollutant || 'PM2.5',
      pollutants: s.pollutants || {
        pm25: { value: 0, sub_index: 0, unit: 'µg/m³' },
        pm10: { value: 0, sub_index: 0, unit: 'µg/m³' },
        no2: { value: 0, sub_index: 0, unit: 'µg/m³' },
        so2: { value: 0, sub_index: 0, unit: 'µg/m³' },
        co: { value: 0, sub_index: 0, unit: 'mg/m³' },
        o3: { value: 0, sub_index: 0, unit: 'µg/m³' },
        nh3: { value: 0, sub_index: 0, unit: 'µg/m³' },
      },
      updated_at: s.updated_at || new Date().toISOString(),
    }));
  },
};
