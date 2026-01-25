/**
 * MARKETPLACE ROUTES - API for Plugin Marketplace
 * Tools, plugins, reviews, and monetization
 */

import express from 'express';
import crypto from 'crypto';
import pluginSDK from '../services/marketplace/plugin-sdk.js';
import sandboxLoader from '../services/marketplace/sandbox-loader.js';
import permissionSystem from '../services/marketplace/permission-system.js';

const router = express.Router();

// In-memory stores (in production, use database)
const tools = new Map();
const reviews = new Map();
const transactions = new Map();
const developers = new Map();

// ============================================================================
// MARKETPLACE STATUS
// ============================================================================

router.get('/status', (req, res) => {
  try {
    res.json({
      success: true,
      status: 'operational',
      version: '1.0.0',
      services: {
        pluginSDK: pluginSDK.getSDKInfo(),
        sandboxLoader: sandboxLoader.getStatus(),
        permissionSystem: permissionSystem.getStatus(),
      },
      stats: {
        tools: tools.size,
        reviews: reviews.size,
        transactions: transactions.size,
        developers: developers.size,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PLUGIN SDK ENDPOINTS
// ============================================================================

// Get SDK info
router.get('/sdk/info', (req, res) => {
  res.json({
    success: true,
    sdk: pluginSDK.getSDKInfo(),
  });
});

// Get available permissions
router.get('/sdk/permissions', (req, res) => {
  res.json({
    success: true,
    permissions: pluginSDK.getAvailablePermissions(),
  });
});

// Create plugin template
router.post('/sdk/template', (req, res) => {
  try {
    const { name, description, permissions = [] } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const template = pluginSDK.createPluginTemplate(name, description || '', permissions);
    
    res.json({
      success: true,
      template,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validate plugin manifest
router.post('/sdk/validate', (req, res) => {
  try {
    const { manifest } = req.body;
    
    if (!manifest) {
      return res.status(400).json({ success: false, error: 'Manifest is required' });
    }

    const validation = pluginSDK.validateManifest(manifest);
    
    res.json({
      success: true,
      validation,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register plugin
router.post('/sdk/register', async (req, res) => {
  try {
    const { manifest, code } = req.body;
    
    if (!manifest || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Manifest and code are required', 
      });
    }

    const result = await pluginSDK.registerPlugin(manifest, code);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      pluginId: result.pluginId,
      warnings: result.warnings,
      riskLevel: result.riskLevel,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List registered plugins
router.get('/sdk/plugins', (req, res) => {
  try {
    const { enabled } = req.query;
    const filter = enabled !== undefined ? { enabled: enabled === 'true' } : {};
    
    res.json({
      success: true,
      plugins: pluginSDK.listPlugins(filter),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get plugin info
router.get('/sdk/plugins/:pluginId', (req, res) => {
  try {
    const plugin = pluginSDK.getPlugin(req.params.pluginId);
    
    if (!plugin) {
      return res.status(404).json({ success: false, error: 'Plugin not found' });
    }

    res.json({
      success: true,
      plugin,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unregister plugin
router.delete('/sdk/plugins/:pluginId', (req, res) => {
  try {
    const result = pluginSDK.unregisterPlugin(req.params.pluginId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// SANDBOX ENDPOINTS
// ============================================================================

// Get sandbox status
router.get('/sandbox/status', (req, res) => {
  res.json({
    success: true,
    status: sandboxLoader.getStatus(),
  });
});

// Load plugin into sandbox
router.post('/sandbox/load', async (req, res) => {
  try {
    const { pluginId, code, permissions = [], config = {} } = req.body;
    
    if (!pluginId || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Plugin ID and code are required', 
      });
    }

    const result = await sandboxLoader.loadPlugin(pluginId, code, permissions, config);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      pluginId: result.pluginId,
      sandboxType: result.sandboxType,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute plugin function
router.post('/sandbox/execute', async (req, res) => {
  try {
    const { pluginId, functionName, input = {} } = req.body;
    
    if (!pluginId || !functionName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Plugin ID and function name are required', 
      });
    }

    const result = await sandboxLoader.executePlugin(pluginId, functionName, input);
    
    res.json({
      success: result.success,
      result: result.result,
      error: result.error,
      duration: result.duration,
      executionCount: result.executionCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unload plugin from sandbox
router.post('/sandbox/unload', (req, res) => {
  try {
    const { pluginId } = req.body;
    
    if (!pluginId) {
      return res.status(400).json({ success: false, error: 'Plugin ID is required' });
    }

    const result = sandboxLoader.unloadPlugin(pluginId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sandbox stats
router.get('/sandbox/stats', (req, res) => {
  try {
    const { pluginId } = req.query;
    
    res.json({
      success: true,
      stats: sandboxLoader.getStats(pluginId || undefined),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PERMISSION ENDPOINTS
// ============================================================================

// Get available permissions
router.get('/permissions/available', (req, res) => {
  res.json({
    success: true,
    permissions: permissionSystem.getAvailablePermissions(),
    roles: permissionSystem.getRoles(),
  });
});

// Grant permission
router.post('/permissions/grant', (req, res) => {
  try {
    const { entityId, entityType, permission, grantedBy, options = {} } = req.body;
    
    if (!entityId || !permission) {
      return res.status(400).json({ 
        success: false, 
        error: 'Entity ID and permission are required', 
      });
    }

    const result = permissionSystem.grantPermission(
      entityId, 
      entityType || 'plugin',
      permission, 
      grantedBy || 'api',
      options,
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Revoke permission
router.post('/permissions/revoke', (req, res) => {
  try {
    const { entityId, permission, revokedBy, reason } = req.body;
    
    if (!entityId || !permission) {
      return res.status(400).json({ 
        success: false, 
        error: 'Entity ID and permission are required', 
      });
    }

    const result = permissionSystem.revokePermission(
      entityId,
      permission,
      revokedBy || 'api',
      reason || '',
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check permission
router.get('/permissions/check', (req, res) => {
  try {
    const { entityId, permission } = req.query;
    
    if (!entityId || !permission) {
      return res.status(400).json({ 
        success: false, 
        error: 'Entity ID and permission are required', 
      });
    }

    const result = permissionSystem.hasPermission(entityId, permission);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get entity permissions
router.get('/permissions/entity/:entityId', (req, res) => {
  try {
    const permissions = permissionSystem.getPermissions(req.params.entityId);
    const usage = permissionSystem.getUsageStats(req.params.entityId);
    
    res.json({
      success: true,
      permissions,
      usage,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize role permissions
router.post('/permissions/init-role', (req, res) => {
  try {
    const { entityId, role } = req.body;
    
    if (!entityId || !role) {
      return res.status(400).json({ 
        success: false, 
        error: 'Entity ID and role are required', 
      });
    }

    const result = permissionSystem.initializeForRole(entityId, role);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Request permissions
router.post('/permissions/request', (req, res) => {
  try {
    const { entityId, entityType, permissions, reason } = req.body;
    
    if (!entityId || !permissions || permissions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Entity ID and permissions are required', 
      });
    }

    const result = permissionSystem.createPermissionRequest(
      entityId,
      entityType || 'plugin',
      permissions,
      reason || '',
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get audit log
router.get('/permissions/audit', (req, res) => {
  try {
    const { entityId, action, since, limit } = req.query;
    
    const logs = permissionSystem.getAuditLog({
      entityId,
      action,
      since,
      limit: limit ? parseInt(limit) : 100,
    });
    
    res.json({
      success: true,
      logs,
      total: logs.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// TOOLS MARKETPLACE
// ============================================================================

// List tools
router.get('/tools', (req, res) => {
  try {
    const { category, search, sort = 'downloads', limit = 20, offset = 0 } = req.query;
    
    let toolList = Array.from(tools.values());
    
    // Filter by category
    if (category) {
      toolList = toolList.filter(t => t.category === category);
    }
    
    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      toolList = toolList.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower)),
      );
    }
    
    // Sort
    toolList.sort((a, b) => {
      if (sort === 'downloads') return b.downloads - a.downloads;
      if (sort === 'rating') return b.averageRating - a.averageRating;
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });
    
    // Paginate
    const total = toolList.length;
    toolList = toolList.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      success: true,
      tools: toolList,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + toolList.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create tool
router.post('/tools', (req, res) => {
  try {
    const {
      name, description, category, tags = [],
      icon, code, permissions = [], pricing = { type: 'free' },
      developerId,
    } = req.body;
    
    if (!name || !description || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, description, and code are required', 
      });
    }

    const toolId = `tool_${crypto.randomBytes(8).toString('hex')}`;
    
    const tool = {
      id: toolId,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      category: category || 'utility',
      tags,
      icon: icon || '🔧',
      code,
      permissions,
      pricing,
      developerId: developerId || 'anonymous',
      version: '1.0.0',
      downloads: 0,
      uses: 0,
      averageRating: 0,
      reviewCount: 0,
      published: false,
      verified: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    tools.set(toolId, tool);
    
    res.status(201).json({
      success: true,
      tool,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get tool
router.get('/tools/:toolId', (req, res) => {
  try {
    const tool = tools.get(req.params.toolId);
    
    if (!tool) {
      return res.status(404).json({ success: false, error: 'Tool not found' });
    }
    
    // Get reviews for this tool
    const toolReviews = Array.from(reviews.values())
      .filter(r => r.toolId === req.params.toolId)
      .slice(0, 10);
    
    res.json({
      success: true,
      tool,
      reviews: toolReviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update tool
router.patch('/tools/:toolId', (req, res) => {
  try {
    const tool = tools.get(req.params.toolId);
    
    if (!tool) {
      return res.status(404).json({ success: false, error: 'Tool not found' });
    }
    
    const allowedUpdates = ['name', 'description', 'category', 'tags', 'icon', 'code', 'permissions', 'pricing', 'published'];
    
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedUpdates.includes(key)) {
        tool[key] = value;
      }
    }
    
    tool.updatedAt = new Date();
    tools.set(req.params.toolId, tool);
    
    res.json({
      success: true,
      tool,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete tool
router.delete('/tools/:toolId', (req, res) => {
  try {
    if (!tools.has(req.params.toolId)) {
      return res.status(404).json({ success: false, error: 'Tool not found' });
    }
    
    tools.delete(req.params.toolId);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Install tool (increment downloads)
router.post('/tools/:toolId/install', (req, res) => {
  try {
    const tool = tools.get(req.params.toolId);
    
    if (!tool) {
      return res.status(404).json({ success: false, error: 'Tool not found' });
    }
    
    tool.downloads++;
    tools.set(req.params.toolId, tool);
    
    res.json({
      success: true,
      downloads: tool.downloads,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute tool
router.post('/tools/:toolId/execute', async (req, res) => {
  try {
    const tool = tools.get(req.params.toolId);
    
    if (!tool) {
      return res.status(404).json({ success: false, error: 'Tool not found' });
    }
    
    // Load into sandbox and execute
    await sandboxLoader.loadPlugin(tool.id, tool.code, tool.permissions, {});
    const result = await sandboxLoader.executePlugin(tool.id, 'execute', req.body.input || {});
    
    // Increment uses
    tool.uses++;
    tools.set(req.params.toolId, tool);
    
    res.json({
      success: result.success,
      result: result.result,
      error: result.error,
      duration: result.duration,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// REVIEWS
// ============================================================================

// Get reviews for tool
router.get('/reviews', (req, res) => {
  try {
    const { toolId, userId, sort = 'newest', limit = 20, offset = 0 } = req.query;
    
    let reviewList = Array.from(reviews.values());
    
    if (toolId) {
      reviewList = reviewList.filter(r => r.toolId === toolId);
    }
    if (userId) {
      reviewList = reviewList.filter(r => r.userId === userId);
    }
    
    // Sort
    reviewList.sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'helpful') return b.helpfulCount - a.helpfulCount;
      return 0;
    });
    
    const total = reviewList.length;
    reviewList = reviewList.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      success: true,
      reviews: reviewList,
      pagination: { total, limit: parseInt(limit), offset: parseInt(offset) },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create review
router.post('/reviews', (req, res) => {
  try {
    const { toolId, userId, title, content, rating } = req.body;
    
    if (!toolId || !userId || !rating) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tool ID, user ID, and rating are required', 
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be 1-5' });
    }
    
    const reviewId = `review_${crypto.randomBytes(8).toString('hex')}`;
    
    const review = {
      id: reviewId,
      toolId,
      userId,
      title: title || '',
      content: content || '',
      rating,
      verified: false,
      helpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    reviews.set(reviewId, review);
    
    // Update tool average rating
    const tool = tools.get(toolId);
    if (tool) {
      const toolReviews = Array.from(reviews.values()).filter(r => r.toolId === toolId);
      tool.averageRating = toolReviews.reduce((sum, r) => sum + r.rating, 0) / toolReviews.length;
      tool.reviewCount = toolReviews.length;
      tools.set(toolId, tool);
    }
    
    res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark review helpful
router.post('/reviews/:reviewId/helpful', (req, res) => {
  try {
    const review = reviews.get(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    review.helpfulCount++;
    reviews.set(req.params.reviewId, review);
    
    res.json({
      success: true,
      helpfulCount: review.helpfulCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DEVELOPER / MONETIZATION
// ============================================================================

// Get developer profile
router.get('/developers/:developerId', (req, res) => {
  try {
    let developer = developers.get(req.params.developerId);
    
    if (!developer) {
      // Create default profile
      developer = {
        id: req.params.developerId,
        name: 'Developer',
        verified: false,
        tools: [],
        totalDownloads: 0,
        totalEarnings: 0,
        joinedAt: new Date(),
      };
      developers.set(req.params.developerId, developer);
    }
    
    // Get developer's tools
    const devTools = Array.from(tools.values())
      .filter(t => t.developerId === req.params.developerId);
    
    developer.tools = devTools.map(t => ({
      id: t.id,
      name: t.name,
      downloads: t.downloads,
      rating: t.averageRating,
    }));
    
    developer.totalDownloads = devTools.reduce((sum, t) => sum + t.downloads, 0);
    
    res.json({
      success: true,
      developer,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get developer earnings
router.get('/developers/:developerId/earnings', (req, res) => {
  try {
    const devTransactions = Array.from(transactions.values())
      .filter(t => t.developerId === req.params.developerId);
    
    const totalEarnings = devTransactions.reduce((sum, t) => sum + (t.developerShare || 0), 0);
    const pendingEarnings = devTransactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.developerShare || 0), 0);
    
    res.json({
      success: true,
      earnings: {
        total: totalEarnings,
        pending: pendingEarnings,
        paid: totalEarnings - pendingEarnings,
      },
      transactions: devTransactions.slice(-20),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create transaction
router.post('/transactions', (req, res) => {
  try {
    const { toolId, userId, amount, type = 'purchase' } = req.body;
    
    const tool = tools.get(toolId);
    if (!tool) {
      return res.status(404).json({ success: false, error: 'Tool not found' });
    }
    
    const transactionId = `txn_${crypto.randomBytes(8).toString('hex')}`;
    const platformFee = amount * 0.2; // 20% platform fee
    const developerShare = amount * 0.8;
    
    const transaction = {
      id: transactionId,
      toolId,
      toolName: tool.name,
      userId,
      developerId: tool.developerId,
      amount,
      platformFee,
      developerShare,
      type,
      status: 'completed',
      createdAt: new Date(),
    };
    
    transactions.set(transactionId, transaction);
    
    res.status(201).json({
      success: true,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get categories
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    categories: [
      { id: 'data-processing', name: 'Data Processing', icon: '📊' },
      { id: 'integration', name: 'Integrations', icon: '🔗' },
      { id: 'analytics', name: 'Analytics', icon: '📈' },
      { id: 'automation', name: 'Automation', icon: '⚡' },
      { id: 'utility', name: 'Utilities', icon: '🛠️' },
      { id: 'ai', name: 'AI & ML', icon: '🤖' },
      { id: 'custom', name: 'Custom', icon: '✨' },
    ],
  });
});

export default router;
