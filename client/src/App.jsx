import { useMetalPrices } from './hooks/useMetalPrices';
import TraditionalLayout from './components/layout/TraditionalLayout';

export default function App() {
  const {
    prices,
    previousPrices,
    loading,
    error,
    stale,
    lastUpdated,
  } = useMetalPrices();

  return (
    <TraditionalLayout
      prices={prices}
      previousPrices={previousPrices}
      loading={loading}
      error={error}
      stale={stale}
      lastUpdated={lastUpdated}
    />
  );
}
