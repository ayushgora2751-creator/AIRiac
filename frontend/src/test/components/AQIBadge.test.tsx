import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AQIBadge, getNAQIInfo } from '../../components/common/AQIBadge';

describe('AQIBadge Component', () => {
  it('correctly categorizes Good AQI (0-50)', () => {
    const info = getNAQIInfo(35);
    expect(info.category).toBe('Good');
    expect(info.hex).toBe('#00B050');

    render(<AQIBadge aqi={35} />);
    expect(screen.getByTestId('aqi-value')).toHaveTextContent('35');
    expect(screen.getByTestId('aqi-category')).toHaveTextContent('Good');
  });

  it('correctly categorizes Satisfactory AQI (51-100)', () => {
    const info = getNAQIInfo(85);
    expect(info.category).toBe('Satisfactory');
    expect(info.hex).toBe('#92D050');

    render(<AQIBadge aqi={85} />);
    expect(screen.getByTestId('aqi-category')).toHaveTextContent('Satisfactory');
  });

  it('correctly categorizes Moderate AQI (101-200)', () => {
    const info = getNAQIInfo(184);
    expect(info.category).toBe('Moderate');
    expect(info.hex).toBe('#E5B800');

    render(<AQIBadge aqi={184} />);
    expect(screen.getByTestId('aqi-category')).toHaveTextContent('Moderate');
  });

  it('correctly categorizes Poor AQI (201-300)', () => {
    const info = getNAQIInfo(245);
    expect(info.category).toBe('Poor');
    expect(info.hex).toBe('#FF7C80');

    render(<AQIBadge aqi={245} />);
    expect(screen.getByTestId('aqi-category')).toHaveTextContent('Poor');
  });

  it('correctly categorizes Very Poor AQI (301-400)', () => {
    const info = getNAQIInfo(350);
    expect(info.category).toBe('Very Poor');
    expect(info.hex).toBe('#D32F2F');

    render(<AQIBadge aqi={350} />);
    expect(screen.getByTestId('aqi-category')).toHaveTextContent('Very Poor');
  });

  it('correctly categorizes Severe AQI (401-500)', () => {
    const info = getNAQIInfo(450);
    expect(info.category).toBe('Severe');
    expect(info.hex).toBe('#7B1FA2');

    render(<AQIBadge aqi={450} />);
    expect(screen.getByTestId('aqi-category')).toHaveTextContent('Severe');
  });

  it('hides category text when showCategory is false', () => {
    render(<AQIBadge aqi={42} showCategory={false} />);
    expect(screen.getByTestId('aqi-value')).toHaveTextContent('42');
    expect(screen.queryByTestId('aqi-category')).not.toBeInTheDocument();
  });
});
