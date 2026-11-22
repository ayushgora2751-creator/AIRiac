import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FloatingAssistantWidget } from '../../components/assistant/FloatingAssistantWidget';

describe('FloatingAssistantWidget Component', () => {
  it('renders floating widget with city and AQI', () => {
    const onClick = vi.fn();
    render(
      <FloatingAssistantWidget
        onClick={onClick}
        city="Chandigarh"
        aqi={184}
      />
    );

    expect(screen.getByText(/Ask Air AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Gemini \+ Python/i)).toBeInTheDocument();
    expect(screen.getByText(/184/i)).toBeInTheDocument();
  });

  it('triggers click callback when widget is pressed', () => {
    const onClick = vi.fn();
    render(
      <FloatingAssistantWidget
        onClick={onClick}
        city="Chandigarh"
        aqi={184}
      />
    );

    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
