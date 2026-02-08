import { useEffect, useRef } from 'react';

/**
 * Embeds a Twitter/X tweet using Twitter's widgets.js
 * Supports both twitter.com and x.com URLs
 */
export default function TwitterEmbed({ url }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!url || !containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Load Twitter widgets script if not already loaded
    if (!window.twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.onload = () => renderTweet();
      document.body.appendChild(script);
    } else {
      renderTweet();
    }

    function renderTweet() {
      if (window.twttr && window.twttr.widgets) {
        // Extract tweet ID from URL
        const tweetId = extractTweetId(url);
        if (tweetId) {
          window.twttr.widgets.createTweet(tweetId, containerRef.current, {
            theme: 'dark',
            dnt: true,
            width: 280,
          });
        }
      }
    }
  }, [url]);

  if (!url) return null;

  return (
    <div className="twitter-embed" ref={containerRef}>
      <div className="twitter-loading">Loading tweet...</div>
    </div>
  );
}

/**
 * Extract tweet ID from various Twitter/X URL formats:
 * - https://twitter.com/user/status/1234567890
 * - https://x.com/user/status/1234567890
 * - https://twitter.com/user/status/1234567890?s=20
 */
function extractTweetId(url) {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/status\/(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
