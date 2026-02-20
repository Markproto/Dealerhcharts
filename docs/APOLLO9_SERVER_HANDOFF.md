# Apollo9 Home Server - Developer Handoff Guide

## Server Overview

| Property | Value |
|----------|-------|
| Hostname | `apollo9` |
| Hardware | MSI Pro DP21 Mini PC |
| RAM | 64GB |
| Storage | SSD |
| OS | Ubuntu Server 24.04 LTS |
| User | `mark` |
| Local IP | `192.168.1.99` |
| Domain | `huttonetwork.com` |

---

## Critical: Starlink CGNAT Issue

**Problem:** Starlink uses Carrier-Grade NAT (CGNAT), meaning:
- No public static IP address
- Port forwarding is impossible
- Traditional hosting doesn't work

**Solution:** Cloudflare Tunnel (outbound connection that bypasses CGNAT)

---

## Cloudflare Tunnel Configuration

### Tunnel Details
- **Tunnel Name:** `apollo9`
- **Connector:** `cloudflared` daemon running on apollo9
- **Dashboard:** https://one.dash.cloudflare.com → Networks → Tunnels

### Public Hostnames Configured
| Hostname | Service | Port |
|----------|---------|------|
| `dealercharts.com` | HTTP | localhost:3001 |
| `panel.huttonetwork.com` | HTTP | localhost:8000 |

### How It Works
1. `cloudflared` runs as a service on apollo9
2. Creates outbound connection to Cloudflare's edge
3. Cloudflare routes incoming traffic through the tunnel
4. No inbound ports needed (bypasses Starlink CGNAT)

### Cloudflared Commands
```bash
# Check tunnel status
sudo systemctl status cloudflared

# Restart tunnel
sudo systemctl restart cloudflared

# View tunnel logs
sudo journalctl -u cloudflared -f
```

---

## Coolify Configuration

### Access
- **URL:** https://panel.huttonetwork.com
- **Local URL:** http://192.168.1.99:8000

### DealerCharts App Settings

**General:**
- **Build Pack:** Nixpacks
- **Base Directory:** `/`

**Build Commands:**
```
Install: cd client && npm install && npm run build && cd ../server && npm install
Build: (empty)
Start: cd server && node src/index.js
```

**Network:**
- **Ports Exposed:** `3001`
- **Port Mappings:** `3001:3001` (CRITICAL - must match for tunnel to reach container)

**Environment Variables:**
| Variable | Description |
|----------|-------------|
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `ADMIN_SECRET` | Admin panel authentication token |
| `FMP_API_KEY` | (Optional) Financial Modeling Prep API key |
| `NIXPACKS_NODE_VERSION` | `22` |

---

## Common Issues & Solutions

### 1. "Cannot find module 'shared'"
**Cause:** npm workspaces don't resolve in Docker/Nixpacks builds.

**Solution:** Use relative paths instead of `require('shared')`:
```javascript
// Wrong
const { METALS } = require('shared');

// Correct
const { METALS } = require('../../../shared/metals-config');
```

Files affected:
- `server/src/routes/prices.js`
- `server/src/sources/fmp.js`
- `server/src/sources/yahoo.js`
- `server/src/services/priceWorker.js`

### 2. "Cannot GET /" (502 Bad Gateway)
**Cause:** Server only serves API, not frontend static files.

**Solution:** Express serves client build in production:
```javascript
// server/src/index.js
if (env.NODE_ENV === 'production') {
  app.use(express.static(CLIENT_BUILD_PATH));
  app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
  });
}
```

### 3. Bad Gateway / 502 Error
**Cause:** Port mapping mismatch between container and host.

**Solution:** In Coolify → Network:
- Port Exposes: `3001`
- Port Mappings: `3001:3001`

### 4. DNS Record Already Exists (Cloudflare Tunnel)
**Cause:** Existing A record conflicts with tunnel CNAME.

**Solution:**
1. Go to Cloudflare DNS for the domain
2. Delete the A record pointing to old IP
3. Save the tunnel public hostname (creates CNAME automatically)

### 5. RSS Feed "Not recognized as RSS 1 or 2"
**Cause:** Some sites (like Zero Hedge direct URLs) block RSS or return HTML.

**Solution:** Use Feedburner or alternative feed URLs:
```
# Zero Hedge - USE THIS (via Feedburner)
https://feeds.feedburner.com/zerohedge/feed

# NOT THIS (blocks access)
https://www.zerohedge.com/commodities/feed
```

### 6. Docker Permission Denied
**Cause:** User not in docker group.

**Solution:**
```bash
sudo usermod -aG docker mark
# Then logout and login again
```

---

## RSS Feed System

### Schedule
- **Cron:** `0 6-22 * * *` (hourly from 6am to 10pm)
- **No overnight fetching** to reduce load

### Configured Feeds
| Source | URL |
|--------|-----|
| Zero Hedge | `https://feeds.feedburner.com/zerohedge/feed` |
| Gold Telegraph | `https://goldtelegraph.com/feed` |
| Silver Doctors | `https://www.silverdoctors.com/feed/` |
| Mining.com | `https://www.mining.com/feed/` |
| Wolf Street | `https://wolfstreet.com/feed/` |
| OilPrice.com | `https://oilprice.com/rss/main` |

### Feed Management API
```bash
# View all feeds
curl https://dealercharts.com/api/feeds -H "Authorization: Bearer TOKEN"

# Reset feeds to defaults
curl -X POST https://dealercharts.com/api/feeds/reset -H "Authorization: Bearer TOKEN"

# Trigger manual fetch
curl -X POST https://dealercharts.com/api/feeds/fetch -H "Authorization: Bearer TOKEN"

# Add new feed
curl -X POST https://dealercharts.com/api/feeds \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Feed Name", "url": "https://example.com/feed", "source": "Example"}'

# Delete feed
curl -X DELETE https://dealercharts.com/api/feeds/FEED_ID -H "Authorization: Bearer TOKEN"
```

---

## Useful Commands (run on apollo9)

### SSH Access
```bash
ssh mark@192.168.1.99
```

### Docker
```bash
# List running containers
docker ps

# View app logs
docker logs $(docker ps -q --filter "name=iok0c8cgwwosks8oso488kco") --tail 100

# View RSS-specific logs
docker logs $(docker ps -q --filter "name=iok0c8cgwwosks8oso488kco") 2>&1 | grep -i rss

# Restart container
docker restart $(docker ps -q --filter "name=iok0c8cgwwosks8oso488kco")
```

### System
```bash
# Check disk space
df -h

# Check memory
free -h

# Check running services
sudo systemctl status cloudflared
sudo systemctl status docker
```

---

## File Locations

### On apollo9 (inside Docker)
- **App data:** `/app/server/data/`
- **News posts:** `/app/server/data/news-posts.json`
- **RSS feeds config:** `/app/server/data/rss-feeds.json`
- **Fetched URLs cache:** `/app/server/data/rss-fetched-urls.json`

### Repository Structure
```
Dealerhcharts/
├── client/              # React frontend (Vite)
│   └── dist/            # Built static files
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── sources/     # Price data sources
│   └── data/            # JSON file storage
└── shared/              # Shared config (metals-config.js)
```

---

## Deployment Checklist

When redeploying DealerCharts:

1. [ ] Push changes to `claude/review-docs-3yWXm` branch
2. [ ] Go to Coolify → DealerCharts → Redeploy
3. [ ] Wait for build to complete (~1-2 minutes)
4. [ ] Check logs for startup messages:
   - `[Server] Dealercharts API running on port 3001 (production)`
   - `[Worker] Scheduled with interval: */1 * * * *`
   - `[RSS] Cron scheduled: hourly from 6am to 10pm`
5. [ ] Test site: https://dealercharts.com
6. [ ] Test API: https://dealercharts.com/api/prices

---

## Architecture Diagram

```
                    Internet
                        │
                        ▼
            ┌───────────────────┐
            │    Cloudflare     │
            │   (DNS + Tunnel)  │
            └─────────┬─────────┘
                      │
        ──────────────┼────────────── Starlink CGNAT (bypassed)
                      │
                      ▼
            ┌───────────────────┐
            │  cloudflared      │
            │  (tunnel daemon)  │
            └─────────┬─────────┘
                      │
                      ▼
            ┌───────────────────┐
            │     Coolify       │
            │   (Docker host)   │
            │   port 8000       │
            └─────────┬─────────┘
                      │
                      ▼
            ┌───────────────────┐
            │   DealerCharts    │
            │  Docker Container │
            │   port 3001       │
            └───────────────────┘
```

---

## Digital Ocean Comparison

| Feature | Digital Ocean | Apollo9 (Home) |
|---------|--------------|----------------|
| Cost | ~$6/month | Free (electricity only) |
| Public IP | Yes (static) | No (CGNAT) |
| Setup | Simple | Requires Cloudflare Tunnel |
| Reliability | 99.9% SLA | Depends on home internet |
| Scaling | Easy | Limited |

**Recommendation:** Keep Digital Ocean as backup. Apollo9 is primary.

---

## Contact / Credentials

- **Cloudflare Account:** (check with owner)
- **GitHub Repo:** Markproto/Dealerhcharts (Private)
- **Branch:** `claude/review-docs-3yWXm`

---

*Last updated: February 2026*
