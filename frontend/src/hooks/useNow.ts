import { useEffect, useState } from 'react';

/** Re-renders every `intervalMs` while `enabled`; the interval is cleared on unmount / disable. */
export const useNow = (enabled: boolean, intervalMs = 1000): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return undefined;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);
  return now;
};

export default useNow;
