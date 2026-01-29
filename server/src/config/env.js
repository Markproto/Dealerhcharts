require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 4100,
  FMP_API_KEY: process.env.FMP_API_KEY || '',
  ADMIN_SECRET: process.env.ADMIN_SECRET || '',
  CACHE_TTL: parseInt(process.env.CACHE_TTL, 10) || 60000,
  FETCH_INTERVAL: process.env.FETCH_INTERVAL || '*/1 * * * *', // every minute
};
