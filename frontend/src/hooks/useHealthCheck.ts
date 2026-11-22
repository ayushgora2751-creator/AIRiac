import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../api/health';
import { HealthStatus } from '../types/health';

export const useHealthCheck = (refetchInterval = 30000) => {
  return useQuery<HealthStatus, Error>({
    queryKey: ['healthCheck'],
    queryFn: healthApi.check,
    refetchInterval,
    retry: 1,
    staleTime: 10000,
  });
};
