const { Router } = require('express');
const adminAuth = require('../middleware/adminAuth');
const newsStore = require('../services/newsStore');

const router = Router();

// PUBLIC: Get published news posts
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const posts = await newsStore.getPublishedPosts(limit);
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

// ADMIN: Get all posts (including unpublished)
router.get('/admin', adminAuth, async (req, res, next) => {
  try {
    const posts = await newsStore.getAllPosts();
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

// ADMIN: Create a new post
router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { title, content, twitterUrl, published } = req.body;

    if (!title && !content && !twitterUrl) {
      return res.status(400).json({ error: 'Title, content, or Twitter URL is required' });
    }

    const post = await newsStore.createPost({
      title: title || '',
      content: content || '',
      twitterUrl: twitterUrl || null,
      published: published !== false,
    });

    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
});

// ADMIN: Update a post
router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, twitterUrl, published } = req.body;

    const post = await newsStore.updatePost(id, { title, content, twitterUrl, published });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (err) {
    next(err);
  }
});

// ADMIN: Delete a post
router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await newsStore.deletePost(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
