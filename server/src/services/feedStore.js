const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const FEEDS_FILE = path.join(DATA_DIR, 'rss-feeds.json');

/**
 * Default feeds (used on first run)
 */
const DEFAULT_FEEDS = [
  {
    id: 'zerohedge-markets',
    name: 'Zero Hedge Markets',
    url: 'https://feeds.feedburner.com/zerohedge/feed',
    source: 'ZeroHedge',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gold-telegraph',
    name: 'Gold Telegraph',
    url: 'https://goldtelegraph.com/feed',
    source: 'GoldTelegraph',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'silver-doctors',
    name: 'Silver Doctors',
    url: 'https://www.silverdoctors.com/feed/',
    source: 'SilverDoctors',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mining-com',
    name: 'Mining.com',
    url: 'https://www.mining.com/feed/',
    source: 'Mining',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wolf-street',
    name: 'Wolf Street',
    url: 'https://wolfstreet.com/feed/',
    source: 'WolfStreet',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'oilprice',
    name: 'OilPrice.com',
    url: 'https://oilprice.com/rss/main',
    source: 'OilPrice',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Directory exists
  }
}

/**
 * Read all feeds
 */
async function getAllFeeds() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(FEEDS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Initialize with defaults
      await writeFeeds(DEFAULT_FEEDS);
      return DEFAULT_FEEDS;
    }
    throw err;
  }
}

/**
 * Get only enabled feeds
 */
async function getEnabledFeeds() {
  const feeds = await getAllFeeds();
  return feeds.filter((f) => f.enabled);
}

/**
 * Write feeds to file
 */
async function writeFeeds(feeds) {
  await ensureDataDir();
  await fs.writeFile(FEEDS_FILE, JSON.stringify(feeds, null, 2));
}

/**
 * Create a new feed
 */
async function createFeed({ name, url, source, enabled = true }) {
  const feeds = await getAllFeeds();

  const newFeed = {
    id: generateId(),
    name,
    url,
    source: source || extractSource(url),
    enabled,
    createdAt: new Date().toISOString(),
  };

  feeds.push(newFeed);
  await writeFeeds(feeds);
  return newFeed;
}

/**
 * Update a feed
 */
async function updateFeed(id, updates) {
  const feeds = await getAllFeeds();
  const index = feeds.findIndex((f) => f.id === id);

  if (index === -1) return null;

  feeds[index] = {
    ...feeds[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await writeFeeds(feeds);
  return feeds[index];
}

/**
 * Delete a feed
 */
async function deleteFeed(id) {
  const feeds = await getAllFeeds();
  const index = feeds.findIndex((f) => f.id === id);

  if (index === -1) return false;

  feeds.splice(index, 1);
  await writeFeeds(feeds);
  return true;
}

/**
 * Generate unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Extract source name from URL
 */
function extractSource(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'RSS';
  }
}

/**
 * Reset feeds to defaults
 */
async function resetFeeds() {
  await writeFeeds(DEFAULT_FEEDS);
  return DEFAULT_FEEDS;
}

module.exports = {
  getAllFeeds,
  getEnabledFeeds,
  createFeed,
  updateFeed,
  deleteFeed,
  resetFeeds,
};
