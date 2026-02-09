import { useState, useEffect } from 'react';
import { fetchNews } from '../../services/api';
import RumbleEmbed from '../common/RumbleEmbed';
import '../common/RumbleEmbed.css';
import './VideoSection.css';

/**
 * Displays Rumble videos from news posts below the charts.
 */
export default function VideoSection() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    try {
      const posts = await fetchNews(10);
      // Filter posts that have Rumble videos
      const videoPosts = posts.filter((post) => post.rumbleUrl);
      setVideos(videoPosts);
    } catch (err) {
      // Silently fail - video section is optional
    } finally {
      setLoading(false);
    }
  }

  if (loading || videos.length === 0) {
    return null;
  }

  return (
    <section className="video-section">
      <h2 className="video-section-title">Market Videos</h2>
      <div className="video-grid">
        {videos.map((post) => (
          <div key={post.id} className="video-item">
            {post.title && <h3 className="video-title">{post.title}</h3>}
            <RumbleEmbed url={post.rumbleUrl} />
            {post.content && <p className="video-description">{post.content}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
