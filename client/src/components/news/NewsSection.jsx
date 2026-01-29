import { useState, useEffect } from 'react';
import { fetchNews } from '../../services/api';
import './NewsSection.css';

export default function NewsSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    try {
      const data = await fetchNews(5);
      setPosts(data);
      setError(null);
    } catch (err) {
      setError('Unable to load news');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (loading) {
    return (
      <aside className="news-section">
        <h2 className="news-title">Market News</h2>
        <div className="news-loading">Loading...</div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="news-section">
        <h2 className="news-title">Market News</h2>
        <div className="news-error">{error}</div>
      </aside>
    );
  }

  if (posts.length === 0) {
    return (
      <aside className="news-section">
        <h2 className="news-title">Market News</h2>
        <div className="news-empty">No news yet</div>
      </aside>
    );
  }

  return (
    <aside className="news-section">
      <h2 className="news-title">Market News</h2>
      <div className="news-list">
        {posts.map((post) => (
          <article key={post.id} className="news-item">
            <time className="news-date">{formatDate(post.createdAt)}</time>
            <h3 className="news-headline">{post.title}</h3>
            <p className="news-content">{post.content}</p>
          </article>
        ))}
      </div>
    </aside>
  );
}
