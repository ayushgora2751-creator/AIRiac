import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';
import { calculateSubIndex, calculateOverallAQI } from '../utils/cpcbAqi';
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
  useLatestAirQuality: (city: string) => ({
    data: {
      city_summary: {
        ...MOCK_CHANDIGARH_CITY_SUMMARY,
        city: city || 'Chandigarh',
        overall_aqi: city === 'Ludhiana' ? 353 : 184,
        category: city === 'Ludhiana' ? 'Very Poor' : 'Moderate',
      },
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

describe('AIRiac Comprehensive Smoke & Consistency Test Suite', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  };

  it('verifies CPCB piecewise linear sub-index calculations for bug fixes', () => {
    // PM2.5 114.8 ug/m3 must evaluate to 283 (Poor band 201-300), fixing the 183 bug
    expect(calculateSubIndex('pm25', 114.8)).toBe(283);

    // PM10 at 210 ug/m3 evaluates to 174
    expect(calculateSubIndex('pm10', 210.0)).toBe(174);

    // NO2 at 59 ug/m3 evaluates to 74
    expect(calculateSubIndex('no2', 59.0)).toBe(74);

    // Overall AQI = max of sub-indices
    const overall = calculateOverallAQI({
      pm25: 114.8,
      pm10: 210.0,
      no2: 59.0,
    });
    expect(overall.overallAqi).toBe(283);
    expect(overall.dominantPollutant).toBe('PM2.5');
    expect(overall.category).toBe('Poor');
  });

  it('renders all tabs and supports interactive tab filtering', () => {
    render(<App />, { wrapper: createWrapper() });

    // Verify Tab buttons exist
    const overviewTab = screen.getByRole('button', { name: /overview/i });
    const mapTab = screen.getByRole('button', { name: /map & routes/i });
    const forecastTab = screen.getByRole('button', { name: /forecast/i });
    const communityTab = screen.getByRole('button', { name: /community/i });

    expect(overviewTab).toBeInTheDocument();
    expect(mapTab).toBeInTheDocument();
    expect(forecastTab).toBeInTheDocument();
    expect(communityTab).toBeInTheDocument();

    // Click Community Tab
    fireEvent.click(communityTab);
    expect(screen.getByTestId('platform-rating-widget')).toBeInTheDocument();
  });

  it('allows city switching and propagates city and AQI store to AI assistant', async () => {
    render(<App />, { wrapper: createWrapper() });

    // Initial state: Chandigarh
    expect(screen.getByTestId('city-selector')).toHaveTextContent('Chandigarh');

    // Open City Selector Dropdown
    fireEvent.click(screen.getByTestId('city-selector'));

    // Switch to Ludhiana
    const ludhianaBtn = screen.getByRole('button', { name: /ludhiana/i });
    fireEvent.click(ludhianaBtn);

    // Selector updates
    expect(screen.getByTestId('city-selector')).toHaveTextContent('Ludhiana');

    // Open AI Assistant Modal
    const askAIBtn = screen.getAllByRole('button', { name: /ask.*ai/i })[0];
    fireEvent.click(askAIBtn);

    // Verify modal is open and has updated context
    await waitFor(() => {
      const modal = screen.getByTestId('air-assistant-modal');
      expect(modal).toBeInTheDocument();
      expect(screen.getByTestId('assistant-city-badge')).toHaveTextContent('Now answering for Ludhiana');
    });
  });
});
