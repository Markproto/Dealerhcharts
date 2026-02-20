const axios = require('axios');
const { METALS } = require('../../../shared/metals-config');
const env = require('../config/env');

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

/**
 * Fetch precious metals prices from Financial Modeling Prep.
 * Secondary source — requires API key, provides spot only (no bid/ask).
 */
async function fetchFMP() {
  if (!env.FMP_API_KEY) {
    console.warn('[FMP] No API key configured, skipping');
    return null;
  }

  try {
    const symbols = Object.values(METALS)
      .map((m) => m.fmpSymbol)
      .join(',');

    const { data } = await axios.get(`${FMP_BASE_URL}/quote/${symbols}`, {
      params: { apikey: env.FMP_API_KEY },
      timeout: 5000,
    });

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[FMP] Empty response');
      return null;
    }

    const prices = {};

    for (const quote of data) {
      const metal = Object.values(METALS).find(
        (m) => m.fmpSymbol === quote.symbol
      );
      if (!metal) continue;

      const price = parseFloat(quote.price || quote.previousClose || 0);
      if (!price) continue;

      prices[metal.symbol] = {
        metal: metal.symbol,
        bid: null,
        ask: null,
        spot: price,
        change: quote.change || 0,
        changePercent: quote.changesPercentage || 0,
        source: 'fmp',
        timestamp: Date.now(),
      };
    }

    return Object.keys(prices).length > 0 ? prices : null;
  } catch (err) {
    console.error(`[FMP] Fetch failed: ${err.message}`);
    return null;
  }
}

module.exports = { fetchFMP };
