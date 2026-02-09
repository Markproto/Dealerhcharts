import { useState, useEffect } from 'react';
import {
  fetchAllNews,
  createNewsPost,
  updateNewsPost,
  deleteNewsPost,
} from '../services/api';
import './Admin.css';

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [authenticated, setAuthenticated] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New post form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [rumbleUrl, setRumbleUrl] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (token) {
      loadPosts();
    }
  }, [token]);

  async function loadPosts() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllNews(token);
      setPosts(data);
      setAuthenticated(true);
      localStorage.setItem('adminToken', token);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid admin token');
        setAuthenticated(false);
        localStorage.removeItem('adminToken');
      } else {
        setError(err.message || 'Failed to load posts');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Require at least title/content OR a twitter/rumble URL
    if (!title.trim() && !content.trim() && !twitterUrl.trim() && !rumbleUrl.trim()) {
      setError('Please enter a title/content or a Twitter/Rumble URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        twitterUrl: twitterUrl.trim() || null,
        rumbleUrl: rumbleUrl.trim() || null,
        published: true,
      };

      if (editingId) {
        await updateNewsPost(token, editingId, postData);
      } else {
        await createNewsPost(token, postData);
      }
      clearForm();
      await loadPosts();
    } catch (err) {
      setError(err.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setTitle('');
    setContent('');
    setTwitterUrl('');
    setRumbleUrl('');
    setEditingId(null);
  }

  function handleEdit(post) {
    setTitle(post.title || '');
    setContent(post.content || '');
    setTwitterUrl(post.twitterUrl || '');
    setRumbleUrl(post.rumbleUrl || '');
    setEditingId(post.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (!confirm('Delete this post?')) return;

    setLoading(true);
    try {
      await deleteNewsPost(token, id);
      await loadPosts();
    } catch (err) {
      setError(err.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePublish(post) {
    setLoading(true);
    try {
      await updateNewsPost(token, post.id, { published: !post.published });
      await loadPosts();
    } catch (err) {
      setError(err.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setToken('');
    setAuthenticated(false);
    setPosts([]);
    localStorage.removeItem('adminToken');
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString();
  }

  // Login screen
  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <h1>Admin Login</h1>
          {error && <div className="admin-error">{error}</div>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadPosts();
            }}
          >
            <input
              type="password"
              placeholder="Enter admin token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="admin-input"
            />
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? 'Checking...' : 'Login'}
            </button>
          </form>
          <p className="admin-hint">
            <a href="/">← Back to site</a>
          </p>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <h1>News Admin</h1>
          <button onClick={handleLogout} className="admin-btn admin-btn-secondary">
            Logout
          </button>
        </header>

        {error && <div className="admin-error">{error}</div>}

        <section className="admin-form-section">
          <h2>{editingId ? 'Edit Post' : 'Create New Post'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <input
              type="text"
              placeholder="Post title (optional if using Twitter)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-input"
            />
            <textarea
              placeholder="Post content (optional if using Twitter)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="admin-textarea"
              rows={4}
            />
            <div className="admin-twitter-section">
              <label className="admin-label">Twitter/X Embed (optional)</label>
              <input
                type="url"
                placeholder="Paste Twitter URL (e.g., https://twitter.com/user/status/123)"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="admin-input"
              />
              <p className="admin-helper">Paste a tweet URL to embed it in the news section</p>
            </div>
            <div className="admin-rumble-section">
              <label className="admin-label">Rumble Video (optional)</label>
              <input
                type="url"
                placeholder="Paste Rumble URL (e.g., https://rumble.com/embed/v...)"
                value={rumbleUrl}
                onChange={(e) => setRumbleUrl(e.target.value)}
                className="admin-input"
              />
              <p className="admin-helper">Paste a Rumble embed URL to show video below the charts</p>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Post' : 'Create Post'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-posts-section">
          <h2>All Posts ({posts.length})</h2>
          {posts.length === 0 ? (
            <p className="admin-empty">No posts yet. Create your first one above.</p>
          ) : (
            <div className="admin-posts-list">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`admin-post ${!post.published ? 'admin-post-draft' : ''}`}
                >
                  <div className="admin-post-header">
                    <h3>{post.title || '(No title)'}</h3>
                    <span className={`admin-post-status ${post.published ? 'published' : 'draft'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {post.content && <p className="admin-post-content">{post.content}</p>}
                  {post.twitterUrl && (
                    <p className="admin-post-twitter">
                      🐦 <a href={post.twitterUrl} target="_blank" rel="noopener noreferrer">
                        {post.twitterUrl}
                      </a>
                    </p>
                  )}
                  {post.rumbleUrl && (
                    <p className="admin-post-rumble">
                      🎬 <a href={post.rumbleUrl} target="_blank" rel="noopener noreferrer">
                        {post.rumbleUrl}
                      </a>
                    </p>
                  )}
                  <div className="admin-post-meta">
                    <span>Created: {formatDate(post.createdAt)}</span>
                  </div>
                  <div className="admin-post-actions">
                    <button
                      onClick={() => handleEdit(post)}
                      className="admin-btn admin-btn-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className="admin-btn admin-btn-small admin-btn-secondary"
                    >
                      {post.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="admin-btn admin-btn-small admin-btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="admin-hint">
          <a href="/">← Back to site</a>
        </p>
      </div>
    </div>
  );
}
