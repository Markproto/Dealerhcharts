import { formatPrice, formatChange, formatChangePercent, priceDirection } from '../../utils/format';
import './SpotCards.css';

export default function SpotCards({ prices, previousPrices }) {
  // Show cards for the primary metals: Gold and Silver
  const featured = prices.filter(
    (p) => p.available && (p.metal === 'XAU' || p.metal === 'XAG')
  );

  if (featured.length === 0) return null;

  return (
    <div className="spot-cards">
      {featured.map((p) => {
        const prev = previousPrices[p.metal];
        const change = prev ? p.spot - prev : p.change;
        const dir = priceDirection(change);

        return (
          <div key={p.metal} className={`spot-card card-${dir}`}>
            <div className="card-header">
              <h3 className="card-metal">{p.name}</h3>
              <span className="card-symbol">{p.metal}</span>
            </div>
            <div className="card-spot">
              {formatPrice(p.spot, p.metal)}
            </div>
            <div className="card-details">
              <div className="card-row">
                <span className="card-label">Bid</span>
                <span className="card-value">{formatPrice(p.bid, p.metal)}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Ask</span>
                <span className="card-value">{formatPrice(p.ask, p.metal)}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Spread</span>
                <span className="card-value">
                  {p.bid && p.ask ? formatPrice(p.ask - p.bid, p.metal) : '—'}
                </span>
              </div>
            </div>
            <div className={`card-change ${dir}`}>
              {formatChange(change)}
              {p.changePercent != null && (
                <span className="card-change-pct">
                  {' '}({formatChangePercent(p.changePercent)})
                </span>
              )}
            </div>
            <div className="card-source">via {p.source}</div>
          </div>
        );
      })}
    </div>
  );
}
