const METALS = {
  XAU: {
    symbol: 'XAU',
    name: 'Gold',
    unit: 'oz',
    fmpSymbol: 'GCUSD',
    yahooSymbol: 'GC=F',
    order: 1,
  },
  XAG: {
    symbol: 'XAG',
    name: 'Silver',
    unit: 'oz',
    fmpSymbol: 'SIUSD',
    yahooSymbol: 'SI=F',
    order: 2,
  },
  XPT: {
    symbol: 'XPT',
    name: 'Platinum',
    unit: 'oz',
    fmpSymbol: 'PLUSD',
    yahooSymbol: 'PL=F',
    order: 3,
  },
  XPD: {
    symbol: 'XPD',
    name: 'Palladium',
    unit: 'oz',
    fmpSymbol: 'PAUSD',
    yahooSymbol: 'PA=F',
    order: 4,
  },
};

const METAL_SYMBOLS = Object.keys(METALS);

module.exports = { METALS, METAL_SYMBOLS };
