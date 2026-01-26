import { formatPrice, formatChange, priceDirection } from '../../utils/format';
import './ScrollingTicker.css';

export default function ScrollingTicker({ prices, previousPrices }) {
  const available = prices.filter((p) => p.available);
  if (available.length === 0) return null;

  // Duplicate items to create seamless loop
  const items = [...available, ...available];

  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {items.map((p, i) => {
          const prev = previousPrices[p.metal];
          const change = prev ? p.spot - prev : p.change;
          const dir = priceDirection(change);

          return (
            <div key={`${p.metal}-${i}`} className="ticker-item">
              <span className="ticker-symbol">{p.metal}</span>
              <span className="ticker-price">{formatPrice(p.spot, p.metal)}</span>
              <span className={`ticker-change ${dir}`}>
                {formatChange(change)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
