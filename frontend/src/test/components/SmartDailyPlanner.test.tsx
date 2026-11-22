import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SmartDailyPlanner } from '../../components/planner/SmartDailyPlanner';
import { MOCK_24H_TREND, MOCK_CHANDIGARH_CITY_SUMMARY } from '../mocks/mockData';

describe('SmartDailyPlanner Component', () => {
  it('renders planner heading and default activity', () => {
    render(
      <SmartDailyPlanner
        trendSeries={MOCK_24H_TREND}
        citySummary={MOCK_CHANDIGARH_CITY_SUMMARY}
      />
    );

    expect(screen.getByText(/Smart Daily Activity Planner • Chandigarh/i)).toBeInTheDocument();
    expect(screen.getByText(/Optimal Safe Window for Outdoor Jogging \/ Exercise/i)).toBeInTheDocument();
  });

  it('switches activity and updates optimal time window', () => {
    render(
      <SmartDailyPlanner
        trendSeries={MOCK_24H_TREND}
        citySummary={MOCK_CHANDIGARH_CITY_SUMMARY}
      />
    );

    const ventilateBtn = screen.getByText(/Open Home Windows/i);
    fireEvent.click(ventilateBtn);

    expect(screen.getByText(/Optimal Safe Window for Open Home Windows/i)).toBeInTheDocument();
    expect(screen.getByText('12:30 - 16:00')).toBeInTheDocument();
  });

  it('renders hourly exposure slots correctly', () => {
    render(
      <SmartDailyPlanner
        trendSeries={MOCK_24H_TREND}
        citySummary={MOCK_CHANDIGARH_CITY_SUMMARY}
      />
    );

    expect(screen.getByText(/Hourly Exposure Rating Strip/i)).toBeInTheDocument();
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });
});
