#!/bin/bash
set -e

APP_DIR="/var/www/dealercharts"
PM2_NAME="dealercharts-api"

echo "==> Pulling latest code..."
cd "$APP_DIR"
git pull origin main

echo "==> Installing dependencies..."
npm install --workspaces

echo "==> Building frontend..."
cd client
npm run build
cd ..

echo "==> Restarting API server..."
pm2 restart "$PM2_NAME" || pm2 start server/src/index.js --name "$PM2_NAME"

echo "==> Deploy complete!"
pm2 status "$PM2_NAME"
