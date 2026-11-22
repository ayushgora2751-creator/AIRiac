import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AirAssistantModal } from '../../components/assistant/AirAssistantModal';
import { CityAQISummary } from '../../types/aqi';

describe('AirAssistantModal Component', () => {
  const mockCitySummary: CityAQISummary = {
    city: 'Ludhiana',
    overall_aqi: 353,
    category: 'Very Poor',
    dominant_pollutant: 'PM2.5',
    reporting_stations: 3,
    health_statement: 'Respiratory illness on prolonged exposure.',
    timestamp: '2026-11-22T08:00:00Z',
  };

  it('renders greeting built dynamically from citySummary without stale hardcoded values', () => {
    render(
      <AirAssistantModal
        isOpen={true}
        onClose={vi.fn()}
        citySummary={mockCitySummary}
      />
    );

    // Verify dynamic greeting mentions Ludhiana and 353 (Very Poor)
    expect(screen.getByText(/AIRiac Environmental Health Assistant for/i)).toBeInTheDocument();
    expect(screen.getByText(/Current ambient AQI is/i)).toBeInTheDocument();
    expect(screen.getAllByText(/353 \(Very Poor\)/i).length).toBeGreaterThan(0);

    // Verify context badge
    const badge = screen.getByTestId('assistant-city-badge');
    expect(badge).toHaveTextContent('Now answering for Ludhiana');
    expect(badge).toHaveTextContent('353 (Very Poor)');
  });

  it('updates conversation context dynamically when city prop switches', () => {
    const { rerender } = render(
      <AirAssistantModal
        isOpen={true}
        onClose={vi.fn()}
        citySummary={{
          ...mockCitySummary,
          city: 'Chandigarh',
          overall_aqi: 184,
          category: 'Moderate',
        }}
      />
    );

    expect(screen.getByTestId('assistant-city-badge')).toHaveTextContent('Now answering for Chandigarh');
    expect(screen.getByTestId('assistant-city-badge')).toHaveTextContent('184 (Moderate)');

    // Now switch city to Ludhiana (AQI 353)
    rerender(
      <AirAssistantModal
        isOpen={true}
        onClose={vi.fn()}
        citySummary={{
          ...mockCitySummary,
          city: 'Ludhiana',
          overall_aqi: 353,
          category: 'Very Poor',
        }}
      />
    );

    expect(screen.getByTestId('assistant-city-badge')).toHaveTextContent('Now answering for Ludhiana');
    expect(screen.getByTestId('assistant-city-badge')).toHaveTextContent('353 (Very Poor)');
  });

  it('allows user to give thumbs up / down feedback on assistant message', () => {
    render(
      <AirAssistantModal
        isOpen={true}
        onClose={vi.fn()}
        citySummary={mockCitySummary}
      />
    );

    const helpfulBtn = screen.getByTestId('assistant-helpful-btn');
    expect(helpfulBtn).toBeInTheDocument();
    fireEvent.click(helpfulBtn);

    expect(screen.getByText(/Feedback recorded/i)).toBeInTheDocument();
  });
});
