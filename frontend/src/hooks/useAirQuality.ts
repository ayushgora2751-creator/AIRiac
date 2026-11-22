import { useQuery, useMutation } from '@tanstack/react-query';
import {
  airQualityApi,
  LatestAirQualityResponse,
  HistoricalSeriesResponse,
} from '../api/airQuality';
import { NAQICalculateRequest, NAQICalculateResponse } from '../types/aqi';

export const useLatestAirQuality = (city = 'Chandigarh', stationCode?: string) => {
  return useQuery<LatestAirQualityResponse, Error>({
    queryKey: ['airQuality', 'latest', city, stationCode || 'all'],
    queryFn: () => airQualityApi.getLatest(city, stationCode),
    refetchInterval: 60000,
    staleTime: 30000,
  });
};

export const useDiurnalTrend = (
  stationCode = 'CH-SEC22-CAAQMS',
  hours = 24
) => {
  return useQuery<HistoricalSeriesResponse, Error>({
    queryKey: ['airQuality', 'trend', stationCode, hours],
    queryFn: () => airQualityApi.getHistory(stationCode, hours),
    staleTime: 60000,
  });
};

export const useCalculateNAQI = () => {
  return useMutation<NAQICalculateResponse, Error, NAQICalculateRequest>({
    mutationFn: (data: NAQICalculateRequest) => airQualityApi.calculate(data),
  });
};
