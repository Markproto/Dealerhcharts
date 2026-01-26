import './Footer.css';

export default function Footer({ lastUpdated }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-brand">Dealercharts.com</p>
        <p className="footer-disclaimer">
          Prices are for informational purposes only. Data may be delayed.
        </p>
        {lastUpdated && (
          <p className="footer-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </footer>
  );
}
