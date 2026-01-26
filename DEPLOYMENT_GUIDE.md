# Dealercharts.com — Deployment Guide

Step-by-step instructions for deploying on Digital Ocean droplet `64.23.156.217`.
This droplet already hosts other sites. Dealercharts runs alongside them.

---

## Step 1: DNS Configuration

Do this FIRST — it takes time to propagate.

**Where:** Your domain registrar (wherever you bought `dealercharts.com`)

1. Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Go to DNS settings for `dealercharts.com`
3. Add these two **A records**:

| Type | Host/Name | Value            | TTL  |
|------|-----------|------------------|------|
| A    | `@`       | `64.23.156.217`  | 3600 |
| A    | `www`     | `64.23.156.217`  | 3600 |

4. Save and wait. You can check propagation at: https://dnschecker.org

**How to verify it worked:**
```bash
# Run this from your local machine (not the droplet)
dig dealercharts.com +short
# Should return: 64.23.156.217

dig www.dealercharts.com +short
# Should return: 64.23.156.217
```

---

## Step 2: SSH Into Your Droplet

```bash
ssh root@64.23.156.217
```

If you use a non-root user:
```bash
ssh your-username@64.23.156.217
```

> If you don't remember your SSH setup, check Digital Ocean dashboard →
> Droplets → your droplet → Access → Launch Droplet Console (browser-based).

---

## Step 3: Check What's Already Running

Before installing anything, audit what's on the server:

```bash
# What web server is running?
nginx -v
# or
apache2 -v

# What Node version?
node -v

# Is PM2 installed?
pm2 --version

# What sites are already running?
ls /var/www/

# What Nginx sites are configured?
ls /etc/nginx/sites-enabled/

# What ports are in use?
ss -tlnp

# What PM2 processes are running?
pm2 list
```

**Write down:**
- [ ] Web server: Nginx / Apache / Other
- [ ] Node version: ___
- [ ] PM2 installed: Yes / No
- [ ] Ports in use: ___
- [ ] Other sites in /var/www/: ___

---

## Step 4: Install Prerequisites (if missing)

### 4a. Install Node.js (if not installed or version < 18)

```bash
# Install Node 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify
node -v    # Should show v20.x.x
npm -v     # Should show 10.x.x
```

### 4b. Install Nginx (if not installed)

```bash
apt-get update
apt-get install -y nginx

# Verify it's running
systemctl status nginx
```

### 4c. Install PM2 (if not installed)

```bash
npm install -g pm2

# Verify
pm2 --version
```

### 4d. Install Certbot for SSL (if not installed)

```bash
apt-get install -y certbot python3-certbot-nginx
```

### 4e. Install Git (if not installed)

```bash
apt-get install -y git
git --version
```

---

## Step 5: Clone the Repository

```bash
# Go to web directory
cd /var/www

# Clone the repo
git clone https://github.com/Markproto/Dealerhcharts.git dealercharts

# Go into it
cd /var/www/dealercharts
```

> **If the repo is private**, you'll need to set up a GitHub deploy key or
> personal access token. Ask if you need help with this.

---

## Step 6: Install Dependencies

```bash
cd /var/www/dealercharts

# Install all workspace dependencies (server + client + shared)
npm install --workspaces
```

This will install everything for both the backend and frontend.

---

## Step 7: Build the Frontend

```bash
cd /var/www/dealercharts/client

# Build production assets
npm run build
```

**Expected output:**
```
vite build
✓ built in ~2s
dist/index.html                   0.57 kB
dist/assets/index-XXXXXXXX.css    5.27 kB
dist/assets/index-XXXXXXXX.js   236.18 kB
```

**Verify the build:**
```bash
ls /var/www/dealercharts/client/dist/
# Should show: index.html  assets/
```

---

## Step 8: Create the Environment File

```bash
cd /var/www/dealercharts

# Copy the example
cp .env.example .env

# Edit it
nano .env
```

**Set these values:**
```
NODE_ENV=production
PORT=4100
FMP_API_KEY=your-key-here
```

> **To get an FMP API key:** Go to https://financialmodelingprep.com/developer
> and sign up for a free account. The free tier gives 250 requests/day which
> is plenty (we only make ~1440 requests/day at 1/minute).
>
> If you skip this, the app still works — it just can't fall back to FMP
> if FizTrade is down. Yahoo Finance will be the fallback instead.

**Save and exit nano:** Press `Ctrl+X`, then `Y`, then `Enter`.

**Verify:**
```bash
cat .env
# Should show your settings
```

---

## Step 9: Check Port 4100 Is Available

```bash
ss -tlnp | grep 4100
```

- **No output** = port is free, you're good.
- **Something is using it** = pick a different port (4200, 4300, etc.) and update:
  - `/var/www/dealercharts/.env` (change PORT=)
  - The Nginx config in Step 10 (change proxy_pass port)

---

## Step 10: Start the Backend with PM2

```bash
cd /var/www/dealercharts

# Start the API server
pm2 start server/src/index.js --name dealercharts-api

# Verify it's running
pm2 status
```

**Expected output:**
```
┌─────────────────┬────┬─────────┬──────┬───────┐
│ App name        │ id │ status  │ cpu  │ memory│
├─────────────────┼────┼─────────┼──────┼───────┤
│ dealercharts-api│ 0  │ online  │ 0%   │ 40MB  │
└─────────────────┴────┴─────────┴──────┴───────┘
```

**Test the API is responding:**
```bash
curl http://localhost:4100/api/health
```

**Expected:** JSON response with status and cache info.

```bash
curl http://localhost:4100/api/prices
```

**Expected:** JSON with metals prices (may take up to 60 seconds for the first
fetch to complete after startup).

**If something went wrong:**
```bash
# Check the logs
pm2 logs dealercharts-api --lines 50
```

**Save PM2 config so it auto-restarts on reboot:**
```bash
pm2 save
pm2 startup
```

> PM2 will print a command you need to copy and run. It looks like:
> `sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root`
> Copy the EXACT command it gives you and run it.

---

## Step 11: Configure Nginx

### 11a. Create the site config file

```bash
nano /etc/nginx/sites-available/dealercharts.com
```

**Paste this entire block:**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name dealercharts.com www.dealercharts.com;

    # React static files
    root /var/www/dealercharts/client/dist;
    index index.html;

    # SPA fallback — all routes serve index.html
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
        proxy_read_timeout 30s;
    }

    # Cache static assets aggressively
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;
}
```

**Save and exit:** `Ctrl+X`, `Y`, `Enter`.

> **If you chose a port other than 4100** in Step 9, change the `proxy_pass`
> line to match your port.

### 11b. Enable the site

```bash
# Create symlink to enable
ln -s /etc/nginx/sites-available/dealercharts.com /etc/nginx/sites-enabled/

# Test config for syntax errors
nginx -t
```

**Expected:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**If you get an error:** Read the error message — it tells you the exact line
number and file. Common issues:
- Missing semicolon
- Typo in `server_name`
- Port conflict with another site

### 11c. Reload Nginx

```bash
systemctl reload nginx
```

### 11d. Test (before SSL)

```bash
# From the droplet itself
curl -H "Host: dealercharts.com" http://localhost/

# Should return HTML containing "DealerCharts"
```

If DNS has propagated, try from your browser:
```
http://dealercharts.com
```

---

## Step 12: Set Up SSL (HTTPS)

```bash
certbot --nginx -d dealercharts.com -d www.dealercharts.com
```

**Certbot will ask you:**
1. Enter email address → type your email
2. Agree to terms → type `Y`
3. Share email with EFF → type `N` (optional)

Certbot will automatically:
- Get the SSL certificate
- Modify your Nginx config to add HTTPS
- Set up HTTP → HTTPS redirect

**Verify auto-renewal:**
```bash
certbot renew --dry-run
```

**Expected:** "Congratulations, all simulated renewals succeeded"

**Test HTTPS:**
```
https://dealercharts.com
```

---

## Step 13: Final Verification Checklist

Run these from your **local machine** (not the droplet):

```bash
# 1. Does the site load?
curl -sI https://dealercharts.com | head -5
# Expected: HTTP/2 200

# 2. Does HTTP redirect to HTTPS?
curl -sI http://dealercharts.com | head -5
# Expected: HTTP/1.1 301, Location: https://dealercharts.com/

# 3. Does the API work?
curl -s https://dealercharts.com/api/health | python3 -m json.tool
# Expected: JSON with status info

# 4. Does www redirect work?
curl -sI https://www.dealercharts.com | head -5
# Expected: HTTP/2 200
```

Then open in your browser:
- [ ] `https://dealercharts.com` — see the price dashboard
- [ ] Scrolling ticker at top shows metal prices
- [ ] Gold and Silver cards display with bid/ask
- [ ] Full price table shows all 4 metals
- [ ] Prices update (wait 60 seconds, watch for changes)

---

## Ongoing: How to Deploy Updates

After making code changes and pushing to GitHub:

```bash
ssh root@64.23.156.217
cd /var/www/dealercharts
bash scripts/deploy.sh
```

Or manually:
```bash
cd /var/www/dealercharts
git pull origin main
npm install --workspaces
cd client && npm run build && cd ..
pm2 restart dealercharts-api
```

---

## Troubleshooting

### "502 Bad Gateway"
The API server isn't running.
```bash
pm2 status                         # Is dealercharts-api online?
pm2 restart dealercharts-api       # Try restarting
pm2 logs dealercharts-api          # Check for errors
```

### "404 Not Found" on page refresh
Nginx isn't configured for SPA fallback. Check that the `try_files` line
is present in your Nginx config (Step 11a).

### Prices show "Loading..." forever
```bash
# Check if the API returns data
curl http://localhost:4100/api/prices

# Check the worker logs
pm2 logs dealercharts-api --lines 20
```

The cache worker runs every 60 seconds. On first start, prices won't appear
until the first fetch cycle completes.

### "EADDRINUSE" error in PM2 logs
Another process is using port 4100.
```bash
ss -tlnp | grep 4100    # Find what's using it
# Either stop that process, or change PORT in .env
```

### Nginx config test fails
```bash
nginx -t     # Shows exact error location
# Fix the error, then:
systemctl reload nginx
```

### SSL certificate won't issue
- DNS must be pointing to `64.23.156.217` first
- Port 80 must be open in firewall:
  ```bash
  ufw allow 80
  ufw allow 443
  ```

### Need to check firewall rules
```bash
ufw status
# If ports 80/443 aren't allowed:
ufw allow 'Nginx Full'
```

---

## Quick Reference

| What                | Command                                        |
|---------------------|------------------------------------------------|
| SSH in              | `ssh root@64.23.156.217`                       |
| App directory       | `cd /var/www/dealercharts`                     |
| Start API           | `pm2 start server/src/index.js --name dealercharts-api` |
| Stop API            | `pm2 stop dealercharts-api`                    |
| Restart API         | `pm2 restart dealercharts-api`                 |
| View logs           | `pm2 logs dealercharts-api`                    |
| View live logs      | `pm2 logs dealercharts-api --lines 100`        |
| Rebuild frontend    | `cd client && npm run build`                   |
| Reload Nginx        | `systemctl reload nginx`                       |
| Test Nginx config   | `nginx -t`                                     |
| Renew SSL           | `certbot renew`                                |
| Deploy updates      | `bash scripts/deploy.sh`                       |
| Check API health    | `curl http://localhost:4100/api/health`        |
| Check prices        | `curl http://localhost:4100/api/prices`        |
