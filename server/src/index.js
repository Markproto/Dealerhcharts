const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const pricesRouter = require('./routes/prices');
const healthRouter = require('./routes/health');
const newsRouter = require('./routes/news');
const { startWorker } = require('./services/priceWorker');

// Path to client build (for production static serving)
const CLIENT_BUILD_PATH = path.join(__dirname, '../../client/dist');

const app = express();

// Trust Nginx reverse proxy (needed for rate limiting + correct client IPs)
app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(
  cors({
    origin:
      env.NODE_ENV === 'production'
        ? ['https://dealercharts.com', 'https://www.dealercharts.com']
        : '*',
  })
);

// Body parsing
app.use(express.json());

// Rate limiting
app.use(
  '/api/',
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Routes
app.use('/api/prices', pricesRouter);
app.use('/api/health', healthRouter);
app.use('/api/news', newsRouter);

// Serve static files from client build (production)
if (env.NODE_ENV === 'production') {
  app.use(express.static(CLIENT_BUILD_PATH));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

// Start
app.listen(env.PORT, () => {
  console.log(
    `[Server] Dealercharts API running on port ${env.PORT} (${env.NODE_ENV})`
  );
  startWorker();
});
