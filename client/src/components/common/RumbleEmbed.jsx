/**
 * Embeds a Rumble video using an iframe
 * Supports various Rumble URL formats
 */
export default function RumbleEmbed({ url }) {
  if (!url) return null;

  // Extract embed URL - handle various Rumble URL formats
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className="rumble-embed">
      <iframe
        src={embedUrl}
        frameBorder="0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title="Rumble video"
        className="rumble-iframe"
      />
    </div>
  );
}

/**
 * Convert various Rumble URL formats to embed URL:
 * - https://rumble.com/embed/v1abc2d/?pub=4 (already embed)
 * - https://rumble.com/v1abc2d-video-title.html (regular video page)
 * - https://rumble.com/embed/v1abc2d/ (embed without params)
 */
function getEmbedUrl(url) {
  try {
    const trimmed = url.trim();
    const parsed = new URL(trimmed);

    // Already an embed URL - return as-is
    if (parsed.pathname.startsWith('/embed/')) {
      return trimmed;
    }

    // Regular video URL format: /v1abc2d-some-title.html
    // Extract just the video ID part (v followed by alphanumeric)
    const videoMatch = parsed.pathname.match(/^\/(v[a-z0-9]+)/i);
    if (videoMatch) {
      return `https://rumble.com/embed/${videoMatch[1]}/`;
    }

    // If it looks like a raw embed code was pasted, try to extract src
    if (trimmed.includes('rumble.com/embed/')) {
      const srcMatch = trimmed.match(/rumble\.com\/embed\/[^"'\s]+/);
      if (srcMatch) {
        return `https://${srcMatch[0]}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}
