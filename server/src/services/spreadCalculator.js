/**
 * Standard dealer bid/ask spreads per metal.
 * These are typical market-maker spreads for precious metals.
 *
 * spreadPercent: half-spread as % of spot price.
 * bid = spot * (1 - spreadPercent)
 * ask = spot * (1 + spreadPercent)
 */
const SPREAD_CONFIG = {
  XAU: { spreadPercent: 0.0003 }, // Gold: ~$0.80 on $2700 spot
  XAG: { spreadPercent: 0.0015 }, // Silver: ~$0.05 on $31 spot
  XPT: { spreadPercent: 0.001 },  // Platinum: ~$1.00 on $1000 spot
  XPD: { spreadPercent: 0.002 },  // Palladium: ~$2.00 on $1000 spot
};

/**
 * Derive bid/ask from spot price if not already provided.
 * Returns the price object with bid/ask filled in.
 */
function applySpread(priceData) {
  if (!priceData || !priceData.spot) return priceData;

  // If bid/ask already provided by the source, keep them
  if (priceData.bid && priceData.ask) return priceData;

  const config = SPREAD_CONFIG[priceData.metal];
  if (!config) return priceData;

  const halfSpread = priceData.spot * config.spreadPercent;

  return {
    ...priceData,
    bid: priceData.bid || parseFloat((priceData.spot - halfSpread).toFixed(4)),
    ask: priceData.ask || parseFloat((priceData.spot + halfSpread).toFixed(4)),
    spreadDerived: true, // Flag so frontend can indicate estimated spread
  };
}

module.exports = { applySpread, SPREAD_CONFIG };
