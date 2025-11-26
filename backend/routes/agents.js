import express from 'express';
import { MongoClient } from 'mongodb';

const router = express.Router();

// ============================================
// GET /api/agents - List all agents
// ============================================
router.get('/', async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ai-lab-main');
    
    const agents = await db.collection('agents')
      .find({ isActive: true })
      .sort({ name: 1 })
      .toArray();
    
    await client.close();
    
    res.json({
      success: true,
      count: agents.length,
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        specialty: agent.specialty,
        description: agent.description,
        emoji: agent.emoji,
        category: agent.category,
        tags: agent.tags,
        subscriptionRequired: agent.subscriptionRequired,
        pricing: agent.pricing
      }))
    });
    
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents'
    });
  }
});

// ============================================
// GET /api/agents/:agentId - Get specific agent
// ============================================
router.get('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ai-lab-main');
    
    const agent = await db.collection('agents').findOne({ 
      id: agentId,
      isActive: true 
    });
    
    await client.close();
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }
    
    res.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        specialty: agent.specialty,
        description: agent.description,
        emoji: agent.emoji,
        category: agent.category,
        tags: agent.tags,
        subscriptionRequired: agent.subscriptionRequired,
        pricing: agent.pricing
      }
    });
    
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent'
    });
  }
});

// ============================================
// GET /api/agents/category/:category - Get agents by category
// ============================================
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ai-lab-main');
    
    const agents = await db.collection('agents')
      .find({ 
        category: category,
        isActive: true 
      })
      .sort({ name: 1 })
      .toArray();
    
    await client.close();
    
    res.json({
      success: true,
      category: category,
      count: agents.length,
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        specialty: agent.specialty,
        description: agent.description,
        emoji: agent.emoji,
        tags: agent.tags,
        subscriptionRequired: agent.subscriptionRequired,
        pricing: agent.pricing
      }))
    });
    
  } catch (error) {
    console.error('Error fetching agents by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents by category'
    });
  }
});

// ============================================
// GET /api/agents/search/:query - Search agents
// ============================================
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ai-lab-main');
    
    const agents = await db.collection('agents')
      .find({
        isActive: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { specialty: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ name: 1 })
      .toArray();
    
    await client.close();
    
    res.json({
      success: true,
      query: query,
      count: agents.length,
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        specialty: agent.specialty,
        description: agent.description,
        emoji: agent.emoji,
        category: agent.category,
        tags: agent.tags,
        subscriptionRequired: agent.subscriptionRequired,
        pricing: agent.pricing
      }))
    });
    
  } catch (error) {
    console.error('Error searching agents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search agents'
    });
  }
});

export default router;