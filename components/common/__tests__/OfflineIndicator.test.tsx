import { render, screen, fireEvent, act } from '@testing-library/react';
import { OfflineIndicator } from '../OfflineIndicator';

describe('OfflineIndicator', () => {
  const originalNavigator = { ...window.navigator };

  beforeEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        onLine: true,
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('should not show the indicator when online', () => {
    render(<OfflineIndicator />);
    const indicator = screen.queryByText(/You are currently offline/i);
    expect(indicator).not.toBeInTheDocument();
  });

  it('should show the indicator when offline', () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        onLine: false,
      },
      writable: true,
    });

    render(<OfflineIndicator />);
    const indicator = screen.getByText(/You are currently offline/i);
    expect(indicator).toBeInTheDocument();
  });

  it('should update when online status changes', () => {
    render(<OfflineIndicator />);

    // Initially online
    let indicator = screen.queryByText(/You are currently offline/i);
    expect(indicator).not.toBeInTheDocument();

    // Trigger offline event
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    indicator = screen.getByText(/You are currently offline/i);
    expect(indicator).toBeInTheDocument();

    // Trigger online event
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    indicator = screen.queryByText(/You are currently offline/i);
    expect(indicator).not.toBeInTheDocument();
  });
}); 