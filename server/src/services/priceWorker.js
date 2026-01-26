const cron = require('node-cron');
const { METAL_SYMBOLS } = require('shared');
const cache = require('./cacheManager');
const { applySpread } = require('./spreadCalculator');
const { fetchFizTrade } = require('../sources/fiztrade');
const { fetchFMP } = require('../sources/fmp');
const { fetchYahoo } = require('../sources/yahoo');
const env = require('../config/env');

async function refreshPrices() {
  console.log('[Worker] Refreshing prices...');
  const missing = new Set(METAL_SYMBOLS);

  // Tier 1: FizTrade (primary — has bid/ask)
  const fiztradeData = await fetchFizTrade();
  if (fiztradeData) {
    for (const [metal, price] of Object.entries(fiztradeData)) {
      cache.set(metal, applySpread(price));
      missing.delete(metal);
    }
    console.log(
      `[Worker] FizTrade: got ${Object.keys(fiztradeData).length} metals`
    );
  } else {
    console.warn('[Worker] FizTrade: no data');
  }

  // Tier 2: FMP (secondary — spot only, for any missing metals)
  if (missing.size > 0) {
    const fmpData = await fetchFMP();
    if (fmpData) {
      for (const [metal, price] of Object.entries(fmpData)) {
        if (missing.has(metal)) {
          cache.set(metal, applySpread(price));
          missing.delete(metal);
        }
      }
      console.log(
        `[Worker] FMP: filled ${METAL_SYMBOLS.length - missing.size} gaps`
      );
    } else {
      console.warn('[Worker] FMP: no data');
    }
  }

  // Tier 3: Yahoo Finance (last resort — for any still missing)
  if (missing.size > 0) {
    const yahooData = await fetchYahoo();
    if (yahooData) {
      for (const [metal, price] of Object.entries(yahooData)) {
        if (missing.has(metal)) {
          cache.set(metal, applySpread(price));
          missing.delete(metal);
        }
      }
      console.log(
        `[Worker] Yahoo: filled ${METAL_SYMBOLS.length - missing.size} remaining gaps`
      );
    } else {
      console.warn('[Worker] Yahoo: no data');
    }
  }

  if (missing.size > 0) {
    console.error(`[Worker] Still missing: ${[...missing].join(', ')}`);
  }

  cache.markRefresh();
  console.log('[Worker] Refresh complete');
}

function startWorker() {
  // Fetch immediately on startup
  refreshPrices();

  // Then on cron schedule (default every minute)
  cron.schedule(env.FETCH_INTERVAL, refreshPrices);
  console.log(`[Worker] Scheduled with interval: ${env.FETCH_INTERVAL}`);
}

module.exports = { startWorker, refreshPrices };
