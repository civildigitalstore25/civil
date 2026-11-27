import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fires Meta Pixel PageView on client-side route changes (SPA).
 * Initial PageView is already sent from index.html.
 */
export default function MetaPixelTracker() {
  const { pathname, search } = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    window.fbq?.('track', 'PageView');
  }, [pathname, search]);

  return null;
}
