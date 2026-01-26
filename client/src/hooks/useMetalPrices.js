import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchPrices } from '../services/api';

const POLL_INTERVAL = 30000; // 30 seconds (half the cache TTL)

export function useMetalPrices() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const previousPrices = useRef({});
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const result = await fetchPrices();

      // Store previous prices for change detection
      if (data?.prices) {
        const prev = {};
        for (const p of data.prices) {
          prev[p.metal] = p.spot;
        }
        previousPrices.current = prev;
      }

      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch prices');
      // Don't clear existing data — show stale prices with warning
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    prices: data?.prices || [],
    stale: data?.stale || false,
    cachedAt: data?.cachedAt,
    lastUpdated,
    previousPrices: previousPrices.current,
    loading,
    error,
    refresh,
  };
}
