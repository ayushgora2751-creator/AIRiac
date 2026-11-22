import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '../../components/common/Header';
import { AuthProvider } from '../../context/AuthContext';

vi.mock('../../hooks/useHealthCheck', () => ({
  useHealthCheck: () => ({
    data: {
      status: 'healthy',
      timestamp: '2026-11-22T08:00:00Z',
    },
    isLoading: false,
    error: null,
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{ui}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('Header Component', () => {
  const defaultProps = {
    onOpenAuthModal: vi.fn(),
    selectedCity: 'Chandigarh, UT',
    onSelectCity: vi.fn(),
    onOpenAssistant: vi.fn(),
    onOpenHomeTwin: vi.fn(),
    onOpenAlerts: vi.fn(),
    onOpenReport: vi.fn(),
    onToggle3D: vi.fn(),
    is3DActive: false,
  };

  it('renders branding and city indicator', () => {
    const onOpenAuth = vi.fn();
    renderWithProviders(<Header {...defaultProps} onOpenAuthModal={onOpenAuth} />);

    expect(screen.getByText('AIRiac')).toBeInTheDocument();
    expect(screen.getByTestId('city-selector')).toHaveTextContent('Chandigarh, UT');
    expect(screen.getByTestId('status-pill')).toBeInTheDocument();
    expect(screen.getByText(/API Connected/i)).toBeInTheDocument();
  });

  it('triggers auth modal callback when Sign In button is clicked', () => {
    const onOpenAuth = vi.fn();
    renderWithProviders(<Header {...defaultProps} onOpenAuthModal={onOpenAuth} />);

    const signInBtn = screen.getByTestId('open-auth-btn');
    expect(signInBtn).toBeInTheDocument();
    fireEvent.click(signInBtn);
    expect(onOpenAuth).toHaveBeenCalledTimes(1);
  });
});
