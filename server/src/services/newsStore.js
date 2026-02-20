const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const POSTS_FILE = path.join(DATA_DIR, 'news-posts.json');

/**
 * Simple file-based storage for news posts.
 * Posts are stored as JSON array, sorted by date (newest first).
 */

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Directory exists
  }
}

async function readPosts() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

async function writePosts(posts) {
  await ensureDataDir();
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
}

async function getAllPosts() {
  const posts = await readPosts();
  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getPublishedPosts(limit = 10) {
  const posts = await getAllPosts();
  return posts.filter((p) => p.published).slice(0, limit);
}

async function getPostById(id) {
  const posts = await readPosts();
  return posts.find((p) => p.id === id) || null;
}

async function createPost({ title, content, twitterUrl, rumbleUrl, published = true, sourceUrl, source }) {
  const posts = await readPosts();
  const newPost = {
    id: generateId(),
    title,
    content,
    twitterUrl: twitterUrl || null,
    rumbleUrl: rumbleUrl || null,
    sourceUrl: sourceUrl || null,
    source: source || null,
    published,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  posts.push(newPost);
  await writePosts(posts);
  return newPost;
}

async function updatePost(id, updates) {
  const posts = await readPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  posts[index] = {
    ...posts[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await writePosts(posts);
  return posts[index];
}

async function deletePost(id) {
  const posts = await readPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return false;

  posts.splice(index, 1);
  await writePosts(posts);
  return true;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = {
  getAllPosts,
  getPublishedPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
