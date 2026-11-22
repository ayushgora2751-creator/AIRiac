import { apiClient } from './client';
import {
  CityAQISummary,
  StationData,
  DiurnalTrendPoint,
  NAQICalculateRequest,
  NAQICalculateResponse,
} from '../types/aqi';

export interface LatestAirQualityResponse {
  city_summary: CityAQISummary;
  stations: StationData[];
}

export interface HistoricalSeriesResponse {
  station_code: string;
  series: DiurnalTrendPoint[];
}

export const airQualityApi = {
  getLatest: async (city = 'Chandigarh', stationCode?: string): Promise<LatestAirQualityResponse> => {
    const params: Record<string, string> = { city };
    if (stationCode) params.station_code = stationCode;
    const response = await apiClient.get<any>('/air-quality/latest/', { params });
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

    const stations: StationData[] = (data.stations || []).map((s: any) => {
      const lat = Number(s.latitude ?? s.location?.latitude ?? 30.7333);
      const lng = Number(s.longitude ?? s.location?.longitude ?? 76.7794);

      const pollutantsMap: any = {};
      const rawPollutants = s.pollutants || {};
      for (const key of ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'nh3']) {
        const p = rawPollutants[key] || {};
        const val =
          typeof p === 'number'
            ? p
            : p.value ?? p.concentration ?? p.reading ?? 0;
        const sub =
          p.sub_index ?? (s.sub_indices ? s.sub_indices[key] : undefined) ?? 0;
        pollutantsMap[key] = {
          value: Number(val) || 0,
          sub_index: Number(sub) || 0,
          unit: p.unit || (key === 'co' ? 'mg/m³' : 'µg/m³'),
        };
      }

      return {
        station_id: String(s.station_id || s.station_code || s.code || 'CH-STATION'),
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
    const response = await apiClient.get<any>('/air-quality/history/', {
      params: { station_code: stationCode, hours },
    });
    const data = response.data;
    const rawSeries = data.series || [];
    const series: DiurnalTrendPoint[] = rawSeries.map((item: any) => {
      let timeStr = item.time;
      if (!timeStr && item.timestamp) {
        timeStr = new Date(item.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return {
        time: timeStr || '00:00',
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
    const response = await apiClient.get<any[]>('/locations/stations/');
    return (response.data || []).map((s) => ({
      station_id: s.code || s.station_id || 'CH-STATION',
      name: s.name || 'Station',
      latitude: s.location?.latitude ?? 30.7333,
      longitude: s.location?.longitude ?? 76.7794,
      sector: s.sector?.name,
      aqi: s.aqi || 100,
      category: s.category || 'Moderate',
      dominant_pollutant: s.prominent_pollutant || 'PM2.5',
      pollutants: s.pollutants || {},
      updated_at: s.updated_at || new Date().toISOString(),
    }));
  },
};
