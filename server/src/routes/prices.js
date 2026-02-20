const { Router } = require('express');
const { METALS } = require('../../../shared/metals-config');
const cache = require('../services/cacheManager');

const router = Router();

// GET /api/prices — all metals
router.get('/', (req, res) => {
  const allPrices = cache.getAll();
  const prices = Object.values(METALS)
    .sort((a, b) => a.order - b.order)
    .map((metal) => {
      const cached = allPrices[metal.symbol];
      if (!cached) {
        return { metal: metal.symbol, name: metal.name, available: false };
      }
      return {
        metal: metal.symbol,
        name: metal.name,
        bid: cached.bid,
        ask: cached.ask,
        spot: cached.spot,
        spread: cached.bid && cached.ask ? cached.ask - cached.bid : null,
        spreadDerived: cached.spreadDerived || false,
        change: cached.change || null,
        changePercent: cached.changePercent || null,
        previousClose: cached.previousClose || null,
        source: cached.source,
        age: cached.age,
        available: true,
      };
    });

  res.json({
    prices,
    cachedAt: cache.lastFullRefresh,
    stale: prices.every((p) => !p.available),
  });
});

// GET /api/prices/:metal — single metal
router.get('/:metal', (req, res) => {
  const symbol = req.params.metal.toUpperCase();
  const metalConfig = METALS[symbol];

  if (!metalConfig) {
    return res.status(404).json({ error: `Unknown metal: ${symbol}` });
  }

  const cached = cache.get(symbol);
  if (!cached) {
    return res.status(503).json({
      error: `No price data available for ${symbol}`,
      metal: symbol,
      name: metalConfig.name,
    });
  }

  res.json({
    metal: symbol,
    name: metalConfig.name,
    bid: cached.bid,
    ask: cached.ask,
    spot: cached.spot,
    spread: cached.bid && cached.ask ? cached.ask - cached.bid : null,
    change: cached.change || null,
    changePercent: cached.changePercent || null,
    previousClose: cached.previousClose || null,
    source: cached.source,
    age: cached.age,
  });
});

module.exports = router;
