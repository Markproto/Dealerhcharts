const { Router } = require('express');
const cache = require('../services/cacheManager');

const router = Router();

router.get('/', (req, res) => {
  const status = cache.getStatus();
  const healthy = cache.hasAnyData();

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    uptime: process.uptime(),
    cache: status,
  });
});

module.exports = router;
