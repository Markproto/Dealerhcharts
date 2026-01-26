import './Header.css';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-dealer">Dealer</span>
          <span className="logo-charts">Charts</span>
        </div>
        <nav className="header-nav">
          <span className="nav-tagline">Precious Metals Pricing</span>
        </nav>
      </div>
    </header>
  );
}
