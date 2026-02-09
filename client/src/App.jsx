import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useMetalPrices } from './hooks/useMetalPrices';
import { useSEO } from './hooks/useSEO';
import TraditionalLayout from './components/layout/TraditionalLayout';
import Admin from './pages/Admin';

function HomePage() {
  const {
    prices,
    previousPrices,
    loading,
    error,
    stale,
    lastUpdated,
  } = useMetalPrices();

  // Update page title and meta with live gold/silver prices
  useSEO(prices);

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
