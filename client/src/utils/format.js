/**
 * Format a price value with appropriate decimal places.
 * Gold/Platinum/Palladium: 2 decimals. Silver: 3 decimals.
 */
export function formatPrice(value, metal) {
  if (value == null) return '—';
  const decimals = metal === 'XAG' ? 3 : 2;
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format spread value.
 */
export function formatSpread(bid, ask, metal) {
  if (bid == null || ask == null) return '—';
  return formatPrice(ask - bid, metal);
}

/**
 * Format a change value with sign.
 */
export function formatChange(value) {
  if (value == null) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}

/**
 * Format a percentage change.
 */
export function formatChangePercent(value) {
  if (value == null) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Get CSS class for price direction.
 */
export function priceDirection(change) {
  if (change == null || change === 0) return 'neutral';
  return change > 0 ? 'up' : 'down';
}
