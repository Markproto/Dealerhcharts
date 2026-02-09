/**
 * Embeds a Rumble video using an iframe
 * Supports Rumble embed URLs
 */
export default function RumbleEmbed({ url }) {
  if (!url) return null;

  // Extract embed URL - handle both regular and embed URLs
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className="rumble-embed">
      <iframe
        src={embedUrl}
        frameBorder="0"
        allowFullScreen
        title="Rumble video"
        className="rumble-iframe"
      />
    </div>
  );
}

/**
 * Convert various Rumble URL formats to embed URL:
 * - https://rumble.com/embed/v1abc2d/
 * - https://rumble.com/v1abc2d-video-title.html
 */
function getEmbedUrl(url) {
  try {
    const parsed = new URL(url);

    // Already an embed URL
    if (parsed.pathname.startsWith('/embed/')) {
      return url;
    }

    // Regular video URL - extract video ID and convert to embed
    const match = parsed.pathname.match(/^\/(v[a-z0-9]+)/i);
    if (match) {
      return `https://rumble.com/embed/${match[1]}/`;
    }

    return null;
  } catch {
    return null;
  }
}
