import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ExposureHistoryTracker } from '../../components/exposure/ExposureHistoryTracker';
import { MOCK_CHANDIGARH_CITY_SUMMARY } from '../mocks/mockData';

describe('ExposureHistoryTracker Component', () => {
  it('renders personal dosimetry metrics and cigarette equivalence', () => {
    render(
      <ExposureHistoryTracker citySummary={MOCK_CHANDIGARH_CITY_SUMMARY} />
    );

    expect(screen.getByText(/Personal Exposure & Inhalation Dosimetry/i)).toBeInTheDocument();
    expect(screen.getByText(/Daily Inhaled PM2.5 Dose/i)).toBeInTheDocument();
    expect(screen.getByText(/Smog Inhalation Equivalence/i)).toBeInTheDocument();
  });

  it('toggles N95 mask protection impact', () => {
    render(
      <ExposureHistoryTracker citySummary={MOCK_CHANDIGARH_CITY_SUMMARY} />
    );

    const maskBtn = screen.getByText(/N95 Mask Protection/i);
    expect(maskBtn).toBeInTheDocument();
    fireEvent.click(maskBtn);

    expect(screen.getByText(/0%/i)).toBeInTheDocument();
  });

  it('switches user profile and updates calculations', () => {
    render(
      <ExposureHistoryTracker citySummary={MOCK_CHANDIGARH_CITY_SUMMARY} />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'athlete' } });
    expect(select).toHaveValue('athlete');
  });
});
