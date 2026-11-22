/**
 * Types representing Backend Health Check response.
 */

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  engine?: string;
  backend?: string;
  error?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services?: {
    database?: ServiceHealth;
    cache?: ServiceHealth;
  };
  version?: string;
}
