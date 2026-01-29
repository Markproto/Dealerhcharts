import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useMetalPrices } from './hooks/useMetalPrices';
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
