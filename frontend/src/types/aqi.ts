/**
 * Types representing Indian CPCB NAQI (National Air Quality Index)
 * scales, pollutants, monitoring stations, and time series.
 */

export type NAQICategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export type PollutantKey = 'pm25' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3' | 'nh3';

export interface PollutantDetail {
  value: number;
  sub_index: number;
  unit: string;
}

export type PollutantMap = Record<PollutantKey, PollutantDetail>;

export interface StationData {
  station_id: string;
  name: string;
  latitude: number;
  longitude: number;
  sector?: string;
  aqi: number;
  category: NAQICategory;
  dominant_pollutant: string;
  pollutants: PollutantMap;
  updated_at: string;
}

export interface CityAQISummary {
  city: string;
  overall_aqi: number;
  category: NAQICategory;
  dominant_pollutant: string;
  reporting_stations: number;
  health_statement: string;
  timestamp: string;
}

export interface DiurnalTrendPoint {
  time: string;
  aqi: number;
  pm25: number;
  pm10: number;
}

export interface NAQICalculateRequest {
  pm25?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
  nh3?: number;
  pb?: number;
}

export interface NAQICalculateResponse {
  aqi: number;
  category: NAQICategory;
  prominent_pollutant: string;
  sub_indices: Record<string, number>;
  is_valid: boolean;
}
