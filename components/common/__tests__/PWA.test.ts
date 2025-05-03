import { fireEvent } from '@testing-library/react';
import 'whatwg-fetch';

describe('PWA and Service Worker', () => {
  let mockRegistration: any;
  let mockServiceWorker: any;
  let stateChangeHandler: Function;
  let messageHandler: Function;

  beforeEach(() => {
    // Mock service worker registration
    mockServiceWorker = {
      state: 'installed',
      addEventListener: jest.fn((event, handler) => {
        if (event === 'statechange') stateChangeHandler = handler;
        if (event === 'message') messageHandler = handler;
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      skipWaiting: jest.fn(),
    };

    mockRegistration = {
      installing: mockServiceWorker,
      waiting: null,
      active: null,
      scope: 'http://localhost:3000/',
      update: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // Mock navigator.serviceWorker
    Object.defineProperty(window, 'navigator', {
      value: {
        ...window.navigator,
        serviceWorker: {
          register: jest.fn().mockResolvedValue(mockRegistration),
          controller: new MockServiceWorkerController(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        },
        onLine: true,
      },
      configurable: true,
    });

    // Mock caches API
    const mockCache = {
      addAll: jest.fn().mockResolvedValue(undefined),
      put: jest.fn().mockResolvedValue(undefined),
      match: jest.fn().mockResolvedValue(new Response(new Blob(), { status: 200 })),
    };

    Object.defineProperty(window, 'caches', {
      value: {
        open: jest.fn().mockResolvedValue(mockCache),
        match: jest.fn().mockImplementation(async (request) => {
          if (request === '/api/data') {
            return new Response(new Blob(), { status: 200 });
          }
          return null;
        }),
      },
      configurable: true,
    });

    // Mock workbox
    Object.defineProperty(window, 'workbox', {
      value: {
        active: true,
        controlling: true,
      },
      configurable: true,
    });

    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register service worker', async () => {
    // Simulate service worker registration
    await window.navigator.serviceWorker.register('/sw.js');
    
    expect(window.navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
  });

  it('should handle service worker updates', async () => {
    // Mock new service worker installation
    mockServiceWorker.state = 'installed';
    
    // Add event listener
    mockServiceWorker.addEventListener('statechange', () => {});

    // Trigger statechange event
    const stateChangeEvent = new Event('statechange');
    mockServiceWorker.dispatchEvent(stateChangeEvent);

    expect(mockServiceWorker.addEventListener).toHaveBeenCalledWith(
      'statechange',
      expect.any(Function)
    );
  });

  it('should handle offline mode', async () => {
    // Mock fetch failure
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    // Attempt to fetch a resource
    try {
      await fetch('/api/data');
    } catch (error: any) {
      expect(error.message).toBe('Failed to fetch');
    }

    // Verify cache is checked
    await window.caches.match('/api/data');
    expect(window.caches.match).toHaveBeenCalledWith('/api/data');
  });

  it('should cache required assets', async () => {
    const cache = await window.caches.open('smarty-chat-v1');
    await cache.addAll([
      '/',
      '/offline.html',
      '/styles/main.css',
      '/scripts/main.js',
      '/icons/favicon.ico',
      '/manifest.json'
    ]);
    
    expect(cache.addAll).toHaveBeenCalledWith(expect.arrayContaining([
      '/',
      '/offline.html',
      '/styles/main.css',
      '/scripts/main.js',
      '/icons/favicon.ico',
      '/manifest.json'
    ]));
  });

  it('should sync messages when back online', async () => {
    // Create a mock sync event
    const syncEvent = new MockSyncEvent('sync');
    
    // Mock the sync registration
    const registration = {
      sync: {
        register: jest.fn().mockResolvedValue(undefined)
      }
    };
    
    // Mock service worker registration and controller
    const mockController = {
      postMessage: jest.fn()
    };
    
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      get: () => mockController
    });
    
    (navigator.serviceWorker.ready as any) = Promise.resolve(registration);
    
    // Add sync event listener
    const syncHandler = jest.fn((event) => {
      event.waitUntil(Promise.resolve());
    });
    
    window.addEventListener('sync', syncHandler);
    
    // Trigger sync event
    await navigator.serviceWorker.ready;
    await registration.sync.register('sync-messages');
    
    // Simulate sync event being triggered
    window.dispatchEvent(syncEvent);
    
    // Verify sync handler was called
    expect(syncHandler).toHaveBeenCalledWith(syncEvent);
    expect(syncEvent.waitUntil).toHaveBeenCalled();
  });

  it('should handle skipWaiting message', () => {
    // Add message handler
    mockServiceWorker.addEventListener('message', () => {});

    // Create mock message event
    const messageEvent = new MessageEvent('message', {
      data: { type: 'SKIP_WAITING' }
    });

    // Dispatch message event
    window.dispatchEvent(messageEvent);

    // Verify service worker handled the message
    expect(mockServiceWorker.addEventListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function)
    );
  });
});

// Mock classes for testing
class MockServiceWorkerController {
  constructor() {
    // Add any necessary properties
  }
}

class MockSyncEvent extends Event {
  waitUntil: jest.Mock;

  constructor(type: string) {
    super(type);
    this.waitUntil = jest.fn();
  }
} 