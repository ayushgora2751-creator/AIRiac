import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';
import {
  MOCK_CHANDIGARH_STATIONS,
  MOCK_CHANDIGARH_CITY_SUMMARY,
  MOCK_24H_TREND,
} from './mocks/mockData';

vi.mock('../hooks/useHealthCheck', () => ({
  useHealthCheck: () => ({
    data: {
      status: 'healthy',
      timestamp: '2026-11-22T08:00:00Z',
      services: { database: { status: 'up' }, cache: { status: 'up' } },
      version: '1.0.0',
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('../hooks/useAirQuality', () => ({
  useLatestAirQuality: () => ({
    data: {
      city_summary: MOCK_CHANDIGARH_CITY_SUMMARY,
      stations: MOCK_CHANDIGARH_STATIONS,
    },
    isLoading: false,
  }),
  useDiurnalTrend: () => ({
    data: {
      station_code: 'CH-SEC22-CAAQMS',
      series: MOCK_24H_TREND,
    },
    isLoading: false,
  }),
}));

describe('AIRiac Application Smoke Test', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  };

  it('renders application header, city overview, map, and pollutant metrics without errors', () => {
    render(<App />, { wrapper: createWrapper() });

    // Verify Brand & City Indicator
    expect(screen.getByText('AIRiac')).toBeInTheDocument();
    expect(screen.getByTestId('city-selector')).toHaveTextContent('Chandigarh, UT');

    // Verify City Overview Hero
    expect(screen.getByText(/Chandigarh Air Quality/i)).toBeInTheDocument();

    // Verify Spatial Map Container
    expect(screen.getByTestId('chandigarh-map-container')).toBeInTheDocument();

    // Verify Trend Chart Container
    expect(screen.getByTestId('trend-chart-container')).toBeInTheDocument();

    // Verify 7-Pollutant Sub-Index Breakdown
    expect(screen.getByText(/7-Pollutant Sub-Index Breakdown/i)).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-pm2.5')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-pm10')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-no2')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-so2')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-co')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-o3')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-nh3')).toBeInTheDocument();

    // Verify Contextual Health Advisory
    expect(screen.getByTestId('health-advice')).toBeInTheDocument();

    // Verify Footer
    expect(screen.getByText(/Central Pollution Control Board/i)).toBeInTheDocument();
  });

  it('interactively opens and closes the authentication modal', () => {
    render(<App />, { wrapper: createWrapper() });

    // Modal is initially not present
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();

    // Click Sign In
    const signInBtn = screen.getByTestId('open-auth-btn');
    fireEvent.click(signInBtn);

    // Modal should now be visible
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();

    // Switch to Register tab
    const registerTab = screen.getByTestId('tab-register');
    fireEvent.click(registerTab);
    expect(screen.getByTestId('register-form')).toBeInTheDocument();

    // Close the modal
    const closeBtn = screen.getByTestId('close-auth-modal');
    fireEvent.click(closeBtn);

    // Modal is removed
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
  });
});
