import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CleanRoutePlanner } from '../../components/map/CleanRoutePlanner';
import { MOCK_CHANDIGARH_STATIONS } from '../mocks/mockData';

describe('CleanRoutePlanner Component', () => {
  it('renders route planner title and alternative corridor comparison', () => {
    render(
      <CleanRoutePlanner
        stations={MOCK_CHANDIGARH_STATIONS}
        city="Chandigarh"
      />
    );

    expect(screen.getByText(/Exposure-Weighted Cleanest-Route Planner/i)).toBeInTheDocument();
    expect(screen.getByText(/Standard Major Arterial/i)).toBeInTheDocument();
    expect(screen.getByText(/BreatheWise Clean Corridor/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommended: -42% Dose/i)).toBeInTheDocument();
  });
});
