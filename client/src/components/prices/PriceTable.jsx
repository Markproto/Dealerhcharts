import { formatPrice, formatSpread, formatChange, formatChangePercent, priceDirection } from '../../utils/format';
import './PriceTable.css';

export default function PriceTable({ prices, previousPrices }) {
  const available = prices.filter((p) => p.available);

  if (available.length === 0) {
    return (
      <div className="price-table-empty">
        <p>Price data is currently unavailable. Retrying...</p>
      </div>
    );
  }

  return (
    <div className="price-table-wrapper">
      <table className="price-table">
        <thead>
          <tr>
            <th>Metal</th>
            <th className="num">Bid</th>
            <th className="num">Ask</th>
            <th className="num">Spot</th>
            <th className="num">Spread</th>
            <th className="num">Change</th>
            <th className="num">Source</th>
          </tr>
        </thead>
        <tbody>
          {available.map((p) => {
            const prev = previousPrices[p.metal];
            const spotChange = prev ? p.spot - prev : p.change;
            const dir = priceDirection(spotChange);

            return (
              <tr key={p.metal} className={`row-${dir}`}>
                <td className="metal-name">
                  <span className="metal-symbol">{p.metal}</span>
                  <span className="metal-label">{p.name}</span>
                </td>
                <td className="num">{formatPrice(p.bid, p.metal)}</td>
                <td className="num">{formatPrice(p.ask, p.metal)}</td>
                <td className="num spot">{formatPrice(p.spot, p.metal)}</td>
                <td className="num">{formatSpread(p.bid, p.ask, p.metal)}</td>
                <td className={`num change ${dir}`}>
                  {formatChange(spotChange)}
                  {p.changePercent != null && (
                    <span className="change-pct">
                      {' '}({formatChangePercent(p.changePercent)})
                    </span>
                  )}
                </td>
                <td className="num source-badge">{p.source}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
