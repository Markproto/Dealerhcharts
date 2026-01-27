const axios = require('axios');

const FORTUNE_RESERVE_URL =
  'https://fortunereserve.com/wp-json/fortune-reserve/v1/spot-prices';

/**
 * Fetch precious metals prices from Fortune Reserve (FizTrade / Dillon Gage).
 * Returns real bid/ask spreads — primary data source.
 *
 * Response format:
 * {
 *   "success": true,
 *   "timestamp": "Thursday, Jan 16 10:30:00 AM",
 *   "source": "FizTrade via Fortune Reserve",
 *   "data": {
 *     "gold":      { "name": "Gold",      "symbol": "XAU", "bid": 2650.80, "ask": 2652.40, "change": -12.50, "changePercent": -0.47 },
 *     "silver":    { "name": "Silver",    "symbol": "XAG", "bid": 30.15,   "ask": 30.25,   "change": 0.35,   "changePercent": 1.17 },
 *     "platinum":  { "name": "Platinum",  "symbol": "XPT", "bid": 950.00,  "ask": 960.00,  "change": -5.00,  "changePercent": -0.52 },
 *     "palladium": { "name": "Palladium", "symbol": "XPD", "bid": 1000.00, "ask": 1020.00, "change": 15.00,  "changePercent": 1.49 }
 *   }
 * }
 */
async function fetchFizTrade() {
  try {
    const { data } = await axios.get(FORTUNE_RESERVE_URL, {
      timeout: 5000,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!data || !data.success || !data.data) {
      console.warn('[FizTrade] Response not successful:', data?.error || 'unknown');
      return null;
    }

    const prices = {};

    for (const [key, metal] of Object.entries(data.data)) {
      const symbol = metal.symbol;
      if (!symbol) continue;

      const bid = parseFloat(metal.bid);
      const ask = parseFloat(metal.ask);

      if (!bid || !ask) continue;

      prices[symbol] = {
        metal: symbol,
        bid,
        ask,
        spot: (bid + ask) / 2,
        change: metal.change != null ? parseFloat(metal.change) : null,
        changePercent: metal.changePercent != null ? parseFloat(metal.changePercent) : null,
        source: 'fiztrade',
        timestamp: Date.now(),
      };
    }

    return Object.keys(prices).length > 0 ? prices : null;
  } catch (err) {
    console.error(`[FizTrade] Fetch failed: ${err.message}`);
    return null;
  }
}

module.exports = { fetchFizTrade };
