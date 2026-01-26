# Dealercharts.com — Implementation Plan

**Project:** Extract precious metals pricing module from Cyberfolio into standalone site
**Domain:** Dealercharts.com
**Server:** Digital Ocean Droplet (64.23.156.217) — shared hosting, multi-domain

---

## Phase 1: Project Scaffolding & Dev Environment

### 1.1 — Initialize Project Structure
- Create monorepo structure:
  ```
  dealercharts/
  ├── client/          # React frontend
  ├── server/          # Node.js/Express backend
  ├── shared/          # Shared types/constants (metals config, enums)
  ├── scripts/         # Build, deploy, seed scripts
  ├── .env.example
  ├── package.json     # Root workspace config
  └── README.md
  ```
- Initialize `package.json` with npm workspaces (client + server)
- Set up `.gitignore`, `.nvmrc` (Node 18 LTS or 20 LTS), `.env.example`

### 1.2 — Frontend Scaffolding (React)
- Initialize React app with Vite (fast builds, simple config)
- Install core dependencies:
  - `react`, `react-dom`, `react-router-dom`
  - `axios` (API calls)
  - CSS: Tailwind CSS or CSS Modules (keep it simple, no heavy UI framework)
- Set up folder structure:
  ```
  client/src/
  ├── components/
  │   ├── layout/        # TraditionalLayout, Header, Footer
  │   ├── ticker/        # ScrollingTicker
  │   ├── prices/        # PriceTable, AllocationBar, SpotCard
  │   └── common/        # Shared UI primitives
  ├── hooks/             # useMetalPrices, useWebSocket (future)
  ├── services/          # API client
  ├── utils/             # Price formatting, rate inversion helpers
  ├── pages/             # Home, Admin (future)
  └── App.jsx
  ```

### 1.3 — Backend Scaffolding (Express)
- Initialize Express server
- Install core dependencies:
  - `express`, `cors`, `helmet`, `dotenv`
  - `node-cron` (background cache worker)
  - `axios` (upstream API calls)
- Set up folder structure:
  ```
  server/
  ├── src/
  │   ├── routes/        # /api/prices, /api/health
  │   ├── services/      # PriceFetcher, CacheManager
  │   ├── sources/       # fiztrade.js, fmp.js, yahoo.js
  │   ├── middleware/     # error handler, rate limiter
  │   ├── config/        # metals config, env loader
  │   └── index.js       # Entry point
  └── package.json
  ```

---

## Phase 2: Backend — Price Data Pipeline

### 2.1 — Metals Configuration
- Define supported metals and their identifiers across all sources:
  | Metal    | Symbol | FizTrade ID | FMP Symbol | Yahoo Symbol |
  |----------|--------|-------------|------------|--------------|
  | Gold     | XAU    | (scrape)    | GCUSD      | GC=F         |
  | Silver   | XAG    | (scrape)    | SIUSD      | SI=F         |
  | Platinum | XPT    | (scrape)    | PLUSD      | PL=F         |
  | Palladium| XPD    | (scrape)    | PAUSD      | PA=F         |
- Store config in `shared/metals-config.js` (no MongoDB needed initially)

### 2.2 — Data Source: FizTrade (Primary)
- Implement FizTrade price fetcher
- Parse bid/ask spreads from Fortune Reserve feed
- Handle the rate inversion convention (`1/price` for `rates`, direct for `bidAsk`)
- Return normalized price object:
  ```js
  {
    metal: "XAU",
    bid: 2744.50,
    ask: 2746.80,
    spot: 2745.65,     // midpoint
    source: "fiztrade",
    timestamp: Date.now()
  }
  ```
- Add error handling and timeout (5s)

### 2.3 — Data Source: FMP (Secondary Fallback)
- Implement FMP fetcher using API key from env (`FMP_API_KEY`)
- Map FMP symbols to internal metal symbols
- No bid/ask available — return `bid: null, ask: null, spot: price`
- Respect rate limits (250 req/day on free tier)

### 2.4 — Data Source: Yahoo Finance (Last Resort)
- Implement Yahoo Finance fetcher using `v8/finance/chart` endpoint
- No API key required
- No bid/ask — spot only
- Add user-agent header to avoid blocks
- Treat as unreliable — log warnings when falling back to this

### 2.5 — Price Cache Hub (In-Memory)
- Implement `CacheManager` class:
  ```js
  class CacheManager {
    cache = new Map()        // metal -> { price, fetchedAt, source }
    TTL = 60_000             // 60 seconds
    get(metal)               // Returns cached price or null if stale
    set(metal, priceData)    // Stores with timestamp
    getAll()                 // Returns all cached prices
    isStale(metal)           // Check if TTL expired
  }
  ```
- Background worker using `node-cron` (every 60s):
  1. Try FizTrade for all metals
  2. For any failures, try FMP
  3. For any remaining failures, try Yahoo
  4. Update cache with results
  5. Log source used for each metal

### 2.6 — API Routes
- `GET /api/prices` — Returns all cached metal prices
  ```json
  {
    "prices": [
      { "metal": "XAU", "bid": 2744.50, "ask": 2746.80, "spot": 2745.65, "source": "fiztrade", "age": 12 }
    ],
    "cachedAt": "2025-01-26T...",
    "nextRefresh": 48
  }
  ```
- `GET /api/prices/:metal` — Returns single metal price
- `GET /api/health` — Server health + cache status + source availability

---

## Phase 3: Frontend — Price Display UI

### 3.1 — TraditionalLayout (Main Page)
- Kitco-style layout with three main sections:
  1. **Scrolling Ticker** (top bar)
  2. **Price Table** (main content)
  3. **Allocation Bars** (visual breakdown)

### 3.2 — Scrolling Ticker Component
- Horizontal scrolling bar at top of page
- Shows all metals with spot price and change indicator
- Auto-scrolls continuously, pauses on hover
- Color coding: green (up), red (down) vs previous close

### 3.3 — Price Table Component
- Table displaying for each metal:
  - Metal name + symbol
  - Bid price
  - Ask price
  - Spot (mid) price
  - Spread (ask - bid)
  - Change (vs previous close)
  - Change %
- Default to showing bid/ask (dealer audience, not retail)
- Sort by: Gold, Silver, Platinum, Palladium (standard order)

### 3.4 — Spot Price Cards
- Large, prominent cards for Gold and Silver (most traded)
- Shows current spot, bid, ask, daily high/low, change
- Visual indicator for price direction

### 3.5 — Allocation Bar Component
- Horizontal bar chart showing relative allocation/weighting
- Visual comparison tool for dealers

### 3.6 — API Integration & Polling
- `useMetalPrices` hook:
  - Fetches from `/api/prices` on mount
  - Polls every 30s (half the cache TTL)
  - Handles loading, error, stale states
  - Stores previous prices for change calculation
- Display "data source" badge (FizTrade / FMP / Yahoo) for transparency

### 3.7 — Responsive Design
- Desktop: Full table + ticker + cards
- Tablet: Simplified table, cards stack
- Mobile: Card-only view, collapsible table

---

## Phase 4: Deployment on Digital Ocean Droplet

### 4.1 — Server Assessment
- SSH into droplet (64.23.156.217)
- Audit existing setup:
  - What web server? (likely Nginx)
  - What sites are already hosted?
  - Node.js version installed?
  - PM2 or similar process manager?
  - Available disk space and memory
  - Existing firewall rules (ufw)

### 4.2 — DNS Configuration
- Add DNS A record for `dealercharts.com` → `64.23.156.217`
- Add DNS A record for `www.dealercharts.com` → `64.23.156.217`
- Wait for propagation (can take up to 48h, usually minutes)

### 4.3 — Nginx Virtual Host Setup
- Create Nginx server block for Dealercharts.com:
  ```nginx
  server {
      listen 80;
      server_name dealercharts.com www.dealercharts.com;

      # React static files
      root /var/www/dealercharts/client/dist;
      index index.html;

      # SPA fallback
      location / {
          try_files $uri $uri/ /index.html;
      }

      # API proxy to Express backend
      location /api/ {
          proxy_pass http://127.0.0.1:4100/api/;
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```
- Choose a port that doesn't conflict with other sites (e.g., `4100`)
- Test config: `nginx -t` then reload

### 4.4 — SSL Certificate (Let's Encrypt)
- Install/use Certbot for automatic SSL:
  ```bash
  certbot --nginx -d dealercharts.com -d www.dealercharts.com
  ```
- Verify auto-renewal is configured (`certbot renew --dry-run`)

### 4.5 — Application Deployment
- Clone repo to `/var/www/dealercharts/`
- Install dependencies: `npm install --workspaces`
- Build frontend: `cd client && npm run build`
- Create `.env` file on server with production values:
  ```
  NODE_ENV=production
  PORT=4100
  FMP_API_KEY=<key>
  ```
- Start backend with PM2:
  ```bash
  pm2 start server/src/index.js --name dealercharts-api
  pm2 save
  ```

### 4.6 — Deployment Script
- Create `scripts/deploy.sh`:
  1. `git pull origin main`
  2. `npm install --workspaces`
  3. `cd client && npm run build`
  4. `pm2 restart dealercharts-api`
- Make it idempotent and safe to re-run

---

## Phase 5: Hardening & Production Readiness

### 5.1 — Error Handling
- Global Express error handler middleware
- Graceful degradation: if all sources fail, serve last known cached price with "stale" flag
- Frontend: show "prices may be delayed" banner when data is stale (>5 min old)

### 5.2 — Security
- Helmet.js for HTTP security headers
- CORS: restrict to `dealercharts.com` in production
- Rate limiting on API endpoints (express-rate-limit)
- No secrets in client bundle (env vars server-side only)

### 5.3 — Logging & Monitoring
- Structured logging (e.g., `pino` or `winston`)
- Log: price fetch results, source fallbacks, errors, cache misses
- PM2 log rotation
- Optional: simple uptime check (UptimeRobot or similar, free tier)

### 5.4 — Performance
- Frontend: Vite production build (minified, tree-shaken)
- Nginx: gzip compression, static asset caching headers
- API: response caching headers (`Cache-Control: max-age=30`)

---

## Phase 6: Future Enhancements (Post-Launch)

These are NOT part of initial build but documented for roadmap:

- **WebSocket real-time updates** — Replace polling with push-based price updates
- **Historical price charts** — Store prices over time, add Chart.js or Recharts graphs
- **Admin panel** — UI for managing metals config, viewing source health
- **MongoDB integration** — If admin settings grow beyond what env vars can handle
- **Multi-currency support** — Show prices in USD, EUR, GBP, CAD
- **Price alerts** — Email/webhook when a metal hits a target price
- **Additional metals** — Rhodium, copper, etc.
- **Additional domains** — Other sites on the same droplet using same backend

---

## Task Checklist (Build Order)

| #  | Task                                      | Phase | Dependencies |
|----|-------------------------------------------|-------|-------------|
| 1  | Initialize project structure + workspaces | 1.1   | None        |
| 2  | Scaffold Express backend                  | 1.3   | #1          |
| 3  | Metals config (shared)                    | 2.1   | #1          |
| 4  | FizTrade data source                      | 2.2   | #2, #3      |
| 5  | FMP data source                           | 2.3   | #2, #3      |
| 6  | Yahoo Finance data source                 | 2.4   | #2, #3      |
| 7  | Cache manager + background worker         | 2.5   | #4, #5, #6  |
| 8  | API routes (/prices, /health)             | 2.6   | #7          |
| 9  | Scaffold React frontend (Vite)            | 1.2   | #1          |
| 10 | API client + useMetalPrices hook          | 3.6   | #8, #9      |
| 11 | Price Table component                     | 3.3   | #10         |
| 12 | Scrolling Ticker component                | 3.2   | #10         |
| 13 | Spot Price Cards                          | 3.4   | #10         |
| 14 | Allocation Bars                           | 3.5   | #10         |
| 15 | TraditionalLayout (assemble)              | 3.1   | #11-14      |
| 16 | Responsive design pass                    | 3.7   | #15         |
| 17 | Server audit (droplet)                    | 4.1   | None        |
| 18 | DNS setup                                 | 4.2   | None        |
| 19 | Nginx vhost + SSL                         | 4.3-4 | #17, #18    |
| 20 | Deploy app + PM2                          | 4.5   | #15, #19    |
| 21 | Deploy script                             | 4.6   | #20         |
| 22 | Error handling + security hardening       | 5.1-2 | #20         |
| 23 | Logging + monitoring                      | 5.3   | #20         |
| 24 | Performance optimization                  | 5.4   | #20         |

**Critical path:** 1 → 2 → 3 → 4 → 7 → 8 → 9 → 10 → 15 → 20

---

## Environment Variables

```
# Server
NODE_ENV=production
PORT=4100

# Data Sources
FMP_API_KEY=<your-financial-modeling-prep-api-key>

# Optional (future)
MONGODB_URI=mongodb://localhost:27017/dealercharts
ADMIN_SECRET=<admin-auth-secret>
```

---

## Notes & Decisions

1. **No MongoDB initially** — Use env vars and config files. Add MongoDB only when admin features require it.
2. **Bid/Ask as default view** — This is a dealer-facing site, not retail. Show spreads prominently.
3. **Port 4100** — Chosen to avoid conflicts. Adjust based on droplet audit.
4. **Rate inversion** — Backend normalizes all prices to direct format (USD per oz) before sending to frontend. The `1/price` convention stays internal to the cache layer only.
5. **Vite over CRA** — Faster builds, smaller output, better DX, actively maintained.
