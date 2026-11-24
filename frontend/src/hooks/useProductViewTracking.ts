import { useEffect, useState } from 'react';
import { productApi } from '../services/productApi';

/**
 * SoftzCart-style PDP view tracking: increment once per browser session,
 * otherwise just read the current total.
 */
export function useProductViewTracking(productId: string | undefined) {
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    if (!productId) return;

    const sessionKey = `viewed_product_${productId}`;
    let cancelled = false;

    const run = async () => {
      try {
        if (!sessionStorage.getItem(sessionKey)) {
          const viewCount = await productApi.incrementView(productId);
          if (!cancelled) {
            setTotalViews(viewCount);
            sessionStorage.setItem(sessionKey, 'true');
          }
          return;
        }
        const viewCount = await productApi.getViewCount(productId);
        if (!cancelled) setTotalViews(viewCount);
      } catch {
        // Non-blocking — share/purchase still work if stats fail.
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { totalViews };
}
