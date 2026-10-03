import { useEffect, useState } from 'react';
import { brandApi, type BrandRecord } from '../services/brandApi';

export const useBackendBrands = () => {
  const [brands, setBrands] = useState<BrandRecord[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    brandApi
      .list()
      .then((items) => {
        if (!cancelled) setBrands(items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setBrands([]);
          setError(err instanceof Error ? err.message : 'Could not load categories');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const catalog = (brands ?? []).filter((brand) => brand.categories.length > 0);

  return {
    brands: catalog,
    allBrands: brands ?? [],
    loading: brands === null,
    error,
  };
};
