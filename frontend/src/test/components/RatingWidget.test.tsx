import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RatingWidget } from '../../components/community/RatingWidget';

describe('RatingWidget Component', () => {
  it('renders overall platform rating summary and existing reviews', () => {
    render(<RatingWidget />);

    expect(screen.getByText(/Community Platform Ratings & Reviews/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Citizen Testimonials/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Kabir Sharma/i)).toBeInTheDocument();
  });

  it('allows citizen to enter a name, comment, and submit a review', () => {
    render(<RatingWidget />);

    const nameInput = screen.getByPlaceholderText(/e.g. Environmental Health Researcher/i);
    const commentInput = screen.getByPlaceholderText(/How has AIRiac helped you navigate urban air quality\?/i);
    const submitBtn = screen.getByRole('button', { name: /Submit Citizen Review/i });

    fireEvent.change(nameInput, { target: { value: 'Ananya Verma' } });
    fireEvent.change(commentInput, { target: { value: 'Incredible real-time AQI tracking and clean route mapping!' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Thank you! Your feedback has been verified and posted./i)).toBeInTheDocument();
  });
});
