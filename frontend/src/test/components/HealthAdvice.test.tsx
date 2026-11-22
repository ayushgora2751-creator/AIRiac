import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HealthAdvice } from '../../components/dashboard/HealthAdvice';

describe('HealthAdvice Component', () => {
  it('renders advice for Good category', () => {
    render(<HealthAdvice category="Good" aqi={30} />);

    expect(screen.getByTestId('health-advice')).toBeInTheDocument();
    expect(screen.getByText(/Health Advisory • Good Risk Band/i)).toBeInTheDocument();
    expect(screen.getByText(/Ideal Air Quality Conditions/i)).toBeInTheDocument();
    expect(screen.getByText(/NAQI Score: 30/i)).toBeInTheDocument();
  });

  it('renders advisory for Moderate category', () => {
    render(<HealthAdvice category="Moderate" aqi={150} />);

    expect(screen.getByText(/Health Advisory • Moderate Risk Band/i)).toBeInTheDocument();
    expect(screen.getByText(/Caution for Sensitive Groups/i)).toBeInTheDocument();
  });

  it('renders critical alert for Severe category', () => {
    render(<HealthAdvice category="Severe" aqi={450} />);

    expect(screen.getByText(/Health Advisory • Severe Risk Band/i)).toBeInTheDocument();
    expect(screen.getByText(/Emergency Health Warning: Hazardous Air/i)).toBeInTheDocument();
  });
});
