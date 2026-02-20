const { Router } = require('express');
const adminAuth = require('../middleware/adminAuth');
const feedStore = require('../services/feedStore');
const { fetchRssFeeds } = require('../services/rssFetcher');

const router = Router();

// ADMIN: Get all feeds
router.get('/', adminAuth, async (req, res, next) => {
  try {
    const feeds = await feedStore.getAllFeeds();
    res.json({ feeds });
  } catch (err) {
    next(err);
  }
});

// ADMIN: Create a new feed
router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { name, url, source, enabled } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const feed = await feedStore.createFeed({
      name,
      url,
      source,
      enabled: enabled !== false,
    });

    res.status(201).json({ feed });
  } catch (err) {
    next(err);
  }
});

// ADMIN: Update a feed
router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, url, source, enabled } = req.body;

    const feed = await feedStore.updateFeed(id, { name, url, source, enabled });

    if (!feed) {
      return res.status(404).json({ error: 'Feed not found' });
    }

    res.json({ feed });
  } catch (err) {
    next(err);
  }
});

// ADMIN: Delete a feed
router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await feedStore.deleteFeed(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Feed not found' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ADMIN: Manually trigger RSS fetch
router.post('/fetch', adminAuth, async (req, res, next) => {
  try {
    const newArticles = await fetchRssFeeds();
    res.json({ success: true, newArticles });
  } catch (err) {
    next(err);
  }
});

// ADMIN: Reset feeds to defaults
router.post('/reset', adminAuth, async (req, res, next) => {
  try {
    const feeds = await feedStore.resetFeeds();
    res.json({ success: true, feeds });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
