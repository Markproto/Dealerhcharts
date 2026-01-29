import Header from './Header';
import Footer from './Footer';
import ScrollingTicker from '../ticker/ScrollingTicker';
import SpotCards from '../prices/SpotCards';
import PriceTable from '../prices/PriceTable';
import NewsSection from '../news/NewsSection';
import './TraditionalLayout.css';

export default function TraditionalLayout({
  prices,
  previousPrices,
  loading,
  error,
  stale,
  lastUpdated,
}) {
  return (
    <div className="traditional-layout">
      <Header />
      <ScrollingTicker prices={prices} previousPrices={previousPrices} />

      <div className="content-wrapper">
        <main className="main-content">
          {loading && prices.length === 0 && (
            <div className="loading-state">Loading precious metals data...</div>
          )}

          {error && (
            <div className="error-banner">
              Unable to fetch latest prices. {prices.length > 0 ? 'Showing last known data.' : ''}
            </div>
          )}

          {stale && (
            <div className="stale-banner">
              Prices may be delayed. Data sources are currently unavailable.
            </div>
          )}

          <SpotCards prices={prices} previousPrices={previousPrices} />
          <PriceTable prices={prices} previousPrices={previousPrices} />
        </main>

        <NewsSection />
      </div>

      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}
