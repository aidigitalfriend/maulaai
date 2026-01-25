import express from 'express';
const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Community routes are working!' });
});

// Import all community models dynamically
const loadModels = async () => {
  try {
    const CommunityPost = (await import('../models/CommunityPost.js')).default;
    const CommunityComment = (await import('../models/CommunityComment.js'))
      .default;
    const CommunityLike = (await import('../models/CommunityLike.js')).default;
    const CommunityMetrics = (await import('../models/CommunityMetrics.js'))
      .default;
    const CommunityGroup = (await import('../models/CommunityGroup.js'))
      .default;
    const CommunityMembership = (
      await import('../models/CommunityMembership.js')
    ).default;
    const CommunityEvent = (await import('../models/CommunityEvent.js'))
      .default;
    const CommunityModeration = (
      await import('../models/CommunityModeration.js')
    ).default;
    const User = (await import('../models/User.js')).default;
    return {
      CommunityPost,
      CommunityComment,
      CommunityLike,
      CommunityMetrics,
      CommunityGroup,
      CommunityMembership,
      CommunityEvent,
      CommunityModeration,
      User,
    };
  } catch (error) {
    console.error('Failed to load community models:', error);
    throw error;
  }
};

// Activity logging helper
const logActivity = async (
  action,
  resource,
  resourceId,
  userId = null,
  metadata = {},
) => {
  try {
    console.log(`[COMMUNITY_ACTIVITY] ${action} ${resource} ${resourceId}`, {
      userId,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  } catch (error) {
    console.error('Activity logging error:', error);
  }
};

// GET /api/community/posts - List community posts
router.get('/posts', async (req, res) => {
  try {
    console.log('🔍 Community posts endpoint called');
    const models = await loadModels();
    const { CommunityPost } = models;
    const { category, search, limit = 20, before, author } = req.query;
    console.log('📋 Query params:', {
      category,
      search,
      limit,
      before,
      author,
    });
    const query = {};

    if (category && ['general', 'agents', 'ideas', 'help'].includes(category)) {
      query.category = category;
    }

    if (search && search.trim()) {
      query.$or = [
        { content: { $regex: search.trim(), $options: 'i' } },
        { authorName: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (author) {
      query.authorName = { $regex: author, $options: 'i' };
    }

    if (before) {
      const date = new Date(before);
      if (!isNaN(date.getTime())) {
        query.createdAt = { $lt: date };
      }
    }

    const posts = await CommunityPost.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(Math.min(parseInt(limit) || 20, 50))
      .lean();

    await logActivity('LIST', 'posts', 'multiple', null, {
      count: posts.length,
      filters: { category, search, author },
    });

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error('Community posts list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts',
      details: error.message,
    });
  }
});

// POST /api/community/posts - Create new post
router.post('/posts', async (req, res) => {
  try {
    const {
      content,
      category = 'general',
      authorName,
      authorAvatar = '👤',
    } = req.body;

    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    if (!['general', 'agents', 'ideas', 'help'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
      });
    }

    if (!authorName) {
      return res.status(400).json({
        success: false,
        error: 'Author name is required',
      });
    }

    const post = await CommunityPost.create({
      authorId: null, // TODO: Add auth and set real user ID
      authorName: String(authorName).slice(0, 80),
      authorAvatar: String(authorAvatar || '👤').slice(0, 8),
      content: content.trim(),
      category,
      isPinned: false,
    });

    await logActivity('CREATE', 'post', post._id.toString(), null, {
      category,
      authorName,
      contentLength: content.length,
    });

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Community post creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post',
    });
  }
});

// GET /api/community/posts/:id - Get specific post
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    await logActivity('VIEW', 'post', post._id.toString(), null);

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Community post fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post',
    });
  }
});

// GET /api/community/metrics - Get community metrics
router.get('/metrics', async (req, res) => {
  try {
    const { period = 'daily', groupId: _groupId } = req.query;

    // Basic stats
    const totalPosts = await CommunityPost.countDocuments();
    const totalComments = await CommunityComment.countDocuments();
    const totalLikes = await CommunityLike.countDocuments();

    // Category breakdown
    const postsByCategory = await CommunityPost.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentPosts = await CommunityPost.countDocuments({
      createdAt: { $gte: weekAgo },
    });
    const recentComments = await CommunityComment.countDocuments({
      createdAt: { $gte: weekAgo },
    });

    const metrics = {
      overview: {
        totalPosts,
        totalComments,
        totalLikes,
        recentPosts,
        recentComments,
      },
      categories: postsByCategory,
      period,
      generatedAt: new Date().toISOString(),
    };

    await logActivity('VIEW', 'metrics', 'overview', null, { period });

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Community metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
    });
  }
});

// GET /api/community/presence - Get active users (simplified)
router.get('/presence', async (req, res) => {
  try {
    // Simple presence simulation - in production this would use websockets
    const activeUsers = [
      {
        name: 'Alex Chen',
        avatar: '🧠',
        status: 'online',
        lastSeen: new Date(),
      },
      {
        name: 'Priya',
        avatar: '⚙️',
        status: 'away',
        lastSeen: new Date(Date.now() - 300000),
      },
      { name: 'Jordan', avatar: '🚀', status: 'online', lastSeen: new Date() },
    ];

    await logActivity('VIEW', 'presence', 'active_users', null);

    res.json({
      success: true,
      count: activeUsers.length,
      data: activeUsers,
    });
  } catch (error) {
    console.error('Community presence error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch presence data',
    });
  }
});

// POST /api/community/presence/ping - Update user presence
router.post('/presence/ping', async (req, res) => {
  try {
    const { userName, status = 'online' } = req.body;

    if (!userName) {
      return res.status(400).json({
        success: false,
        error: 'User name is required',
      });
    }

    await logActivity('PING', 'presence', userName, null, { status });

    res.json({
      success: true,
      data: {
        userName,
        status,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Community presence ping error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update presence',
    });
  }
});

// GET /api/community/top-members - Get top community contributors
router.get('/top-members', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Aggregate top posters
    const topPosters = await CommunityPost.aggregate([
      {
        $group: {
          _id: '$authorName',
          posts: { $sum: 1 },
          avatar: { $first: '$authorAvatar' },
          lastPost: { $max: '$createdAt' },
        },
      },
      { $sort: { posts: -1 } },
      { $limit: Math.min(parseInt(limit) || 10, 50) },
    ]);

    await logActivity('VIEW', 'top_members', 'leaderboard', null);

    res.json({
      success: true,
      count: topPosters.length,
      data: topPosters.map((member) => ({
        name: member._id,
        avatar: member.avatar,
        posts: member.posts,
        lastPost: member.lastPost,
      })),
    });
  } catch (error) {
    console.error('Community top members error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top members',
    });
  }
});

// GET /api/community/stream - Get activity stream
router.get('/stream', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get recent posts and comments as activity stream
    const recentPosts = await CommunityPost.find()
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit) || 20, 50))
      .select('authorName authorAvatar content category createdAt')
      .lean();

    const activities = recentPosts.map((post) => ({
      type: 'post',
      id: post._id,
      author: {
        name: post.authorName,
        avatar: post.authorAvatar,
      },
      action: 'created a post',
      content:
        post.content.substring(0, 100) +
        (post.content.length > 100 ? '...' : ''),
      category: post.category,
      timestamp: post.createdAt,
    }));

    await logActivity('VIEW', 'activity_stream', 'recent', null);

    res.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error('Community stream error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity stream',
    });
  }
});

// POST /api/community/posts/:id/like - Like a post
router.post('/posts/:id/like', async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: 'Authentication required' });
    }

    // Check if already liked
    const existingLike = await CommunityLike.findOne({ postId, userId });
    if (existingLike) {
      return res.status(400).json({ success: false, error: 'Already liked' });
    }

    // Create like record
    const like = new CommunityLike({
      postId,
      userId,
      userEmail,
      createdAt: new Date(),
    });
    await like.save();

    // Update post likes count
    const post = await CommunityPost.findById(postId);
    if (post) {
      post.likesCount = (post.likesCount || 0) + 1;
      await post.save();
    }

    await logActivity('LIKE', 'post', postId, userId, { userEmail });

    res.json({
      success: true,
      data: { postId, liked: true, likesCount: post?.likesCount || 0 },
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ success: false, error: 'Failed to like post' });
  }
});

// POST /api/community/posts/:id/unlike - Unlike a post
router.post('/posts/:id/unlike', async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: 'Authentication required' });
    }

    // Remove like record
    const result = await CommunityLike.deleteOne({ postId, userId });

    if (result.deletedCount === 0) {
      return res.status(400).json({ success: false, error: 'Not liked' });
    }

    // Update post likes count
    const post = await CommunityPost.findById(postId);
    if (post) {
      post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
      await post.save();
    }

    await logActivity('UNLIKE', 'post', postId, userId);

    res.json({
      success: true,
      data: { postId, liked: false, likesCount: post?.likesCount || 0 },
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ success: false, error: 'Failed to unlike post' });
  }
});

export default router;
