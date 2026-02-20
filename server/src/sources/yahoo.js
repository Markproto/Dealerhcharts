const axios = require('axios');
const { METALS } = require('../../../shared/metals-config');

const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

/**
 * Fetch precious metals prices from Yahoo Finance.
 * Last-resort fallback — unofficial API, spot only, no bid/ask.
 */
async function fetchYahoo() {
  try {
    const results = await Promise.allSettled(
      Object.values(METALS).map((metal) => fetchYahooSingle(metal))
    );

    const prices = {};
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        prices[result.value.metal] = result.value;
      }
    }

    return Object.keys(prices).length > 0 ? prices : null;
  } catch (err) {
    console.error(`[Yahoo] Fetch failed: ${err.message}`);
    return null;
  }
}

async function fetchYahooSingle(metal) {
  try {
    const { data } = await axios.get(`${YAHOO_BASE_URL}/${metal.yahooSymbol}`, {
      params: {
        interval: '1d',
        range: '1d',
      },
      timeout: 5000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta?.regularMarketPrice || 0;
    if (!price) return null;

    const previousClose = meta.chartPreviousClose || meta.previousClose || null;

    // Calculate change from previous close
    let change = null;
    let changePercent = null;
    if (previousClose && previousClose > 0) {
      change = parseFloat((price - previousClose).toFixed(2));
      changePercent = parseFloat((((price - previousClose) / previousClose) * 100).toFixed(2));
    }

    return {
      metal: metal.symbol,
      bid: null,
      ask: null,
      spot: price,
      change,
      changePercent,
      previousClose,
      source: 'yahoo',
      timestamp: Date.now(),
    };
  } catch (err) {
    console.warn(`[Yahoo] Failed for ${metal.symbol}: ${err.message}`);
    return null;
  }
}

module.exports = { fetchYahoo };
