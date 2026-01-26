const axios = require('axios');

const FIZTRADE_URL = 'https://www.fiztrade.com/dealerapi/spotprices';

/**
 * Fetch precious metals prices from FizTrade (Fortune Reserve feed).
 * Returns bid/ask spreads — primary data source.
 */
async function fetchFizTrade() {
  try {
    const { data } = await axios.get(FIZTRADE_URL, {
      timeout: 5000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Dealercharts/1.0',
      },
    });

    const prices = {};

    if (data && Array.isArray(data)) {
      for (const item of data) {
        const mapped = mapFizTradeMetal(item);
        if (mapped) {
          prices[mapped.metal] = mapped;
        }
      }
    } else if (data && typeof data === 'object') {
      // Handle object-style responses
      for (const [key, item] of Object.entries(data)) {
        const mapped = mapFizTradeMetal(item, key);
        if (mapped) {
          prices[mapped.metal] = mapped;
        }
      }
    }

    return prices;
  } catch (err) {
    console.error(`[FizTrade] Fetch failed: ${err.message}`);
    return null;
  }
}

function mapFizTradeMetal(item, key) {
  if (!item) return null;

  const name = (item.metal || item.name || key || '').toLowerCase();
  let symbol = null;

  if (name.includes('gold') || name === 'xau') symbol = 'XAU';
  else if (name.includes('silver') || name === 'xag') symbol = 'XAG';
  else if (name.includes('platinum') || name === 'xpt') symbol = 'XPT';
  else if (name.includes('palladium') || name === 'xpd') symbol = 'XPD';

  if (!symbol) return null;

  const bid = parseFloat(item.bid || item.bidPrice || 0);
  const ask = parseFloat(item.ask || item.askPrice || 0);
  const spot = bid && ask ? (bid + ask) / 2 : parseFloat(item.price || item.spot || 0);

  if (!spot && !bid && !ask) return null;

  return {
    metal: symbol,
    bid: bid || null,
    ask: ask || null,
    spot: spot || bid || ask,
    source: 'fiztrade',
    timestamp: Date.now(),
  };
}

module.exports = { fetchFizTrade };
