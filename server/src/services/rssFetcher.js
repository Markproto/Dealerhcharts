const Parser = require('rss-parser');
const cron = require('node-cron');
const newsStore = require('./newsStore');
const feedStore = require('./feedStore');
const fs = require('fs').promises;
const path = require('path');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'DealerCharts RSS Aggregator/1.0',
  },
});

// File to track already-fetched article URLs (avoid duplicates)
const DATA_DIR = path.join(__dirname, '../../data');
const FETCHED_URLS_FILE = path.join(DATA_DIR, 'rss-fetched-urls.json');

/**
 * Load previously fetched URLs to avoid duplicates
 */
async function loadFetchedUrls() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const data = await fs.readFile(FETCHED_URLS_FILE, 'utf-8');
    return new Set(JSON.parse(data));
  } catch (err) {
    if (err.code === 'ENOENT') {
      return new Set();
    }
    throw err;
  }
}

/**
 * Save fetched URLs
 */
async function saveFetchedUrls(urlSet) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Keep only last 1000 URLs to prevent file from growing too large
  const urls = Array.from(urlSet).slice(-1000);
  await fs.writeFile(FETCHED_URLS_FILE, JSON.stringify(urls, null, 2));
}

/**
 * Fetch and process RSS feeds
 */
async function fetchRssFeeds() {
  console.log('[RSS] Starting RSS feed fetch...');

  const feeds = await feedStore.getEnabledFeeds();

  if (feeds.length === 0) {
    console.log('[RSS] No enabled feeds configured.');
    return 0;
  }

  const fetchedUrls = await loadFetchedUrls();
  let newArticles = 0;

  for (const feedConfig of feeds) {
    try {
      console.log(`[RSS] Fetching ${feedConfig.name}...`);
      const feed = await parser.parseURL(feedConfig.url);

      // Process items (newest first, limit to 10 per fetch)
      const items = feed.items.slice(0, 10);

      for (const item of items) {
        const articleUrl = item.link || item.guid;

        // Skip if already fetched
        if (fetchedUrls.has(articleUrl)) {
          continue;
        }

        // Create news post
        const title = item.title || 'Untitled';
        const content = cleanHtmlContent(item.contentSnippet || item.content || '');

        try {
          await newsStore.createPost({
            title: `[${feedConfig.source}] ${title}`,
            content: content.slice(0, 500) + (content.length > 500 ? '...' : ''),
            twitterUrl: null,
            rumbleUrl: null,
            published: true,
            sourceUrl: articleUrl,
            source: feedConfig.source,
          });

          fetchedUrls.add(articleUrl);
          newArticles++;
          console.log(`[RSS] Added: ${title.slice(0, 50)}...`);
        } catch (err) {
          console.error(`[RSS] Failed to create post for: ${title}`, err.message);
        }
      }
    } catch (err) {
      console.error(`[RSS] Failed to fetch ${feedConfig.name}:`, err.message);
    }
  }

  await saveFetchedUrls(fetchedUrls);
  console.log(`[RSS] Fetch complete. ${newArticles} new articles added.`);
  return newArticles;
}

/**
 * Clean HTML content to plain text
 */
function cleanHtmlContent(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Start the RSS cron job
 * Runs every hour from 6am to 10pm (hours 6-22)
 */
function startRssCron() {
  // Cron: At minute 0, every hour from 6am to 10pm
  // "0 6-22 * * *" = minute 0, hours 6 through 22, every day
  const schedule = '0 6-22 * * *';

  cron.schedule(schedule, async () => {
    console.log('[RSS] Cron triggered - fetching feeds...');
    try {
      await fetchRssFeeds();
    } catch (err) {
      console.error('[RSS] Cron job error:', err.message);
    }
  });

  console.log('[RSS] Cron scheduled: hourly from 6am to 10pm');

  // Also fetch immediately on startup
  setTimeout(async () => {
    console.log('[RSS] Initial fetch on startup...');
    try {
      await fetchRssFeeds();
    } catch (err) {
      console.error('[RSS] Initial fetch error:', err.message);
    }
  }, 5000); // Wait 5 seconds after server start
}

module.exports = {
  fetchRssFeeds,
  startRssCron,
};
