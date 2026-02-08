const METALS = {
  XAU: {
    symbol: 'XAU',
    name: 'Gold',
    unit: 'oz',
    fmpSymbol: 'GCUSD',
    yahooSymbol: 'GC=F',
    order: 1,
    isMetal: true,
  },
  XAG: {
    symbol: 'XAG',
    name: 'Silver',
    unit: 'oz',
    fmpSymbol: 'SIUSD',
    yahooSymbol: 'SI=F',
    order: 2,
    isMetal: true,
  },
  XPT: {
    symbol: 'XPT',
    name: 'Platinum',
    unit: 'oz',
    fmpSymbol: 'PLUSD',
    yahooSymbol: 'PL=F',
    order: 3,
    isMetal: true,
  },
  XPD: {
    symbol: 'XPD',
    name: 'Palladium',
    unit: 'oz',
    fmpSymbol: 'PAUSD',
    yahooSymbol: 'PA=F',
    order: 4,
    isMetal: true,
  },
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    unit: 'coin',
    fmpSymbol: 'BTCUSD',
    yahooSymbol: 'BTC-USD',
    order: 5,
    isMetal: false,
    isCrypto: true,
  },
};

const METAL_SYMBOLS = Object.keys(METALS);

module.exports = { METALS, METAL_SYMBOLS };
