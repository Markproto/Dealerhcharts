import { useEffect } from 'react';

/**
 * Updates page title and meta description with live gold/silver prices.
 * Also injects JSON-LD structured data for search engines.
 */
export function useSEO(prices) {
  useEffect(() => {
    if (!prices || prices.length === 0) return;

    const gold = prices.find((p) => p.metal === 'XAU');
    const silver = prices.find((p) => p.metal === 'XAG');

    // Update page title with live prices
    if (gold?.spot || silver?.spot) {
      const goldPrice = gold?.spot ? `Gold $${gold.spot.toFixed(2)}` : '';
      const silverPrice = silver?.spot ? `Silver $${silver.spot.toFixed(2)}` : '';
      const priceStr = [goldPrice, silverPrice].filter(Boolean).join(' | ');
      document.title = `${priceStr} — DealerCharts`;
    }

    // Update meta description with live prices
    updateMetaDescription(gold, silver);

    // Add JSON-LD structured data
    updateStructuredData(prices);
  }, [prices]);
}

function updateMetaDescription(gold, silver) {
  const meta = document.querySelector('meta[name="description"]');
  if (!meta) return;

  let description = 'Real-time precious metals pricing for dealers';

  if (gold?.spot && gold?.bid && gold?.ask) {
    description += ` — Gold: $${gold.spot.toFixed(2)} (Bid $${gold.bid.toFixed(2)} / Ask $${gold.ask.toFixed(2)})`;
  }

  if (silver?.spot && silver?.bid && silver?.ask) {
    description += ` — Silver: $${silver.spot.toFixed(2)} (Bid $${silver.bid.toFixed(2)} / Ask $${silver.ask.toFixed(2)})`;
  }

  meta.setAttribute('content', description);
}

function updateStructuredData(prices) {
  // Remove existing JSON-LD if present
  const existing = document.querySelector('script[data-seo="dealercharts"]');
  if (existing) existing.remove();

  const gold = prices.find((p) => p.metal === 'XAU');
  const silver = prices.find((p) => p.metal === 'XAG');

  if (!gold?.spot && !silver?.spot) return;

  // Create structured data for financial quotes
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'DealerCharts — Live Precious Metals Prices',
    description: 'Real-time gold, silver, platinum, and palladium prices with dealer bid/ask spreads',
    url: 'https://dealercharts.com',
    mainEntity: [],
  };

  if (gold?.spot) {
    structuredData.mainEntity.push({
      '@type': 'ExchangeRateSpecification',
      currency: 'USD',
      currentExchangeRate: {
        '@type': 'UnitPriceSpecification',
        price: gold.spot,
        priceCurrency: 'USD',
        unitCode: 'XAU',
        unitText: 'Gold (Troy Ounce)',
      },
    });
  }

  if (silver?.spot) {
    structuredData.mainEntity.push({
      '@type': 'ExchangeRateSpecification',
      currency: 'USD',
      currentExchangeRate: {
        '@type': 'UnitPriceSpecification',
        price: silver.spot,
        priceCurrency: 'USD',
        unitCode: 'XAG',
        unitText: 'Silver (Troy Ounce)',
      },
    });
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-seo', 'dealercharts');
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}
