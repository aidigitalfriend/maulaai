/**
 * AGENT MEMORY API ROUTES
 * Backend endpoints for agent memory operations
 */

import express from 'express';
import mongoose from 'mongoose';
import AgentMemory from '../models/AgentMemory.js';
import memoryService from '../lib/agent-memory-service.js';
import agentTools from '../lib/agent-tools-service.js';

const router = express.Router();

/**
 * GET /api/agents/memory/:userId/:agentId
 * Get memory stats for a user-agent pair
 */
router.get('/memory/:userId/:agentId', async (req, res) => {
  try {
    const { userId, agentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const stats = await memoryService.getMemoryStats(userId, agentId);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting memory stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agents/memory/:userId/:agentId/learn
 * Process a conversation and extract learnings
 */
router.post('/memory/:userId/:agentId/learn', async (req, res) => {
  try {
    const { userId, agentId } = req.params;
    const { messages, conversationId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'Messages array required' });
    }

    const result = await memoryService.processConversation(
      userId,
      agentId,
      messages,
      conversationId
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error processing learnings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/agents/memory/:userId/:agentId/context
 * Get enhanced system prompt with memory context
 */
router.get('/memory/:userId/:agentId/context', async (req, res) => {
  try {
    const { userId, agentId } = req.params;
    const { basePrompt } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const enhancedPrompt = await memoryService.buildEnhancedSystemPrompt(
      userId,
      agentId,
      basePrompt || ''
    );

    res.json({ success: true, data: { enhancedPrompt } });
  } catch (error) {
    console.error('Error building context:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agents/memory/:userId/:agentId/profile
 * Update user profile for an agent
 */
router.post('/memory/:userId/:agentId/profile', async (req, res) => {
  try {
    const { userId, agentId } = req.params;
    const { updates } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const result = await memoryService.updateUserProfile(userId, agentId, updates);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/agents/memory/:userId/:agentId
 * Clear memories for a user-agent pair
 */
router.delete('/memory/:userId/:agentId', async (req, res) => {
  try {
    const { userId, agentId } = req.params;
    const { clearAll, memoryType, olderThan } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const result = await memoryService.clearMemories(userId, agentId, {
      clearAll,
      memoryType,
      olderThan,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error clearing memories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agents/memory/:userId/:agentId/add
 * Manually add a memory
 */
router.post('/memory/:userId/:agentId/add', async (req, res) => {
  try {
    const { userId, agentId } = req.params;
    const { type, content, importance, tags, data } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    if (!type || !content) {
      return res.status(400).json({ success: false, error: 'Type and content required' });
    }

    const memory = await AgentMemory.getOrCreate(userId, agentId);
    await memory.addMemory({
      type,
      content,
      importance: importance || 5,
      tags: tags || [],
      data: data || {},
      source: { timestamp: new Date() },
    });

    res.json({ success: true, data: { totalMemories: memory.memories.length } });
  } catch (error) {
    console.error('Error adding memory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// AGENT TOOLS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /api/agents/tools/search
 * Web search
 */
router.post('/tools/search', async (req, res) => {
  try {
    const { query, numResults } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query required' });
    }

    const result = await agentTools.webSearch(query, numResults || 5);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in web search:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agents/tools/fetch-url
 * Fetch URL content
 */
router.post('/tools/fetch-url', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL required' });
    }

    const result = await agentTools.fetchUrl(url);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching URL:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agents/tools/calculate
 * Mathematical calculation
 */
router.post('/tools/calculate', async (req, res) => {
  try {
    const { expression } = req.body;

    if (!expression) {
      return res.status(400).json({ success: false, error: 'Expression required' });
    }

    const result = agentTools.calculate(expression);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error calculating:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/agents/tools/time
 * Get current time
 */
router.get('/tools/time', (req, res) => {
  const { timezone } = req.query;
  const result = agentTools.getCurrentTime(timezone || 'UTC');
  res.json({ success: true, data: result });
});

/**
 * POST /api/agents/tools/execute
 * Execute a tool by name
 */
router.post('/tools/execute', async (req, res) => {
  try {
    const { tool, params } = req.body;

    if (!tool) {
      return res.status(400).json({ success: false, error: 'Tool name required' });
    }

    const result = await agentTools.executeTool(tool, params || {});
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error executing tool:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/agents/tools/available
 * Get list of available tools
 */
router.get('/tools/available', (req, res) => {
  res.json({
    success: true,
    data: {
      tools: agentTools.AVAILABLE_TOOLS,
      descriptions: agentTools.getToolDescriptions(),
    },
  });
});

export default router;
