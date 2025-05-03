import { useEffect, useState } from 'react';

export const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ff4444',
        color: 'white',
        textAlign: 'center',
        padding: '0.5rem',
        zIndex: 9999,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      You are currently offline. Some features may be limited.
    </div>
  );
};

export default OfflineIndicator; 