import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Mock window.matchMedia for responsive UI components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for Recharts ResponsiveContainer in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock element dimensions in jsdom for Leaflet map container
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  get() {
    return 800;
  },
});

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  get() {
    return 600;
  },
});

// Mock Leaflet Icon resolution
vi.mock('leaflet', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('leaflet');
  return {
    ...actual,
    Icon: {
      Default: class {
        static mergeOptions = vi.fn();
        _getIconUrl = vi.fn();
      },
    },
  };
});

// Mock Recharts ResponsiveContainer to provide fixed dimensions in jsdom without JSX
vi.mock('recharts', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        'div',
        { className: 'recharts-responsive-container', style: { width: 800, height: 300 } },
        children
      ),
  };
});
