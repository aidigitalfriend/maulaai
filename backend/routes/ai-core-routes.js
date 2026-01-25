/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AI CORE ROUTES
 * API endpoints for RAG, LangChain, and LangGraph operations
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import ragEngine from '../services/ai-core/rag-engine.js';
import langChainService from '../services/ai-core/langchain-service.js';
import langGraphService from '../services/ai-core/langgraph-service.js';

const router = express.Router();

// Initialize all AI Core services
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await Promise.all([
      ragEngine.initialize(),
      langChainService.initialize(),
      langGraphService.initialize(),
    ]);
    initialized = true;
    console.log('[AI Core] ✅ All services initialized');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS & HEALTH
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/ai-core/status
 * Get AI Core status including all services
 */
router.get('/status', async (req, res) => {
  try {
    await ensureInitialized();

    res.json({
      success: true,
      status: 'operational',
      version: '1.0.0',
      services: {
        rag: ragEngine.getStatus(),
        langchain: langChainService.getStatus(),
        langgraph: langGraphService.getStatus(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// RAG ENGINE ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/ai-core/rag/index
 * Index a document into the vector store
 */
router.post('/rag/index', async (req, res) => {
  try {
    await ensureInitialized();

    const { content, title, source, agentId, userId, type, metadata } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const result = await ragEngine.indexDocument(
      { content, title, source, agentId, userId, type },
      metadata,
    );

    res.json(result);
  } catch (error) {
    console.error('[AI Core] RAG index error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-core/rag/search
 * Search the vector store for relevant context
 */
router.post('/rag/search', async (req, res) => {
  try {
    await ensureInitialized();

    const { query, topK, agentId, userId, minScore } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    const results = await ragEngine.searchContext(query, {
      topK,
      agentId,
      userId,
      minScore,
    });

    res.json(results);
  } catch (error) {
    console.error('[AI Core] RAG search error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-core/rag/retrieve
 * Retrieve formatted context for LLM
 */
router.post('/rag/retrieve', async (req, res) => {
  try {
    await ensureInitialized();

    const { query, agentId, userId, topK } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    const result = await ragEngine.retrieveForLLM(query, { agentId, userId, topK });

    res.json(result);
  } catch (error) {
    console.error('[AI Core] RAG retrieve error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/ai-core/rag/document/:documentId
 * Delete a document from the vector store
 */
router.delete('/rag/document/:documentId', async (req, res) => {
  try {
    await ensureInitialized();

    const { documentId } = req.params;

    const result = await ragEngine.deleteDocument(documentId);

    res.json(result);
  } catch (error) {
    console.error('[AI Core] RAG delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-core/rag/embedding
 * Generate embedding for text
 */
router.post('/rag/embedding', async (req, res) => {
  try {
    await ensureInitialized();

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
      });
    }

    const result = await ragEngine.generateEmbedding(text);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[AI Core] Embedding error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// LANGCHAIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/ai-core/langchain/chat
 * Chat with memory
 */
router.post('/langchain/chat', async (req, res) => {
  try {
    await ensureInitialized();

    const { input, sessionId, systemPrompt, provider, memoryType } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input is required',
      });
    }

    const result = await langChainService.chat(input, {
      sessionId,
      systemPrompt,
      provider,
      memoryType,
    });

    res.json(result);
  } catch (error) {
    console.error('[AI Core] LangChain chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-core/langchain/rag-query
 * Query with RAG context
 */
router.post('/langchain/rag-query', async (req, res) => {
  try {
    await ensureInitialized();

    const { question, agentId, userId, systemPrompt, provider } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required',
      });
    }

    const result = await langChainService.queryWithRAG(question, {
      agentId,
      userId,
      systemPrompt,
      provider,
    });

    res.json(result);
  } catch (error) {
    console.error('[AI Core] LangChain RAG query error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-core/langchain/chain
 * Execute a custom chain
 */
router.post('/langchain/chain', async (req, res) => {
  try {
    await ensureInitialized();

    const { promptTemplate, input, provider } = req.body;

    if (!promptTemplate || !input) {
      return res.status(400).json({
        success: false,
        error: 'promptTemplate and input are required',
      });
    }

    const result = await langChainService.executeChain(
      { promptTemplate, provider },
      input,
    );

    res.json(result);
  } catch (error) {
    console.error('[AI Core] LangChain chain error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-core/langchain/multi-step
 * Execute a multi-step chain
 */
router.post('/langchain/multi-step', async (req, res) => {
  try {
    await ensureInitialized();

    const { steps, initialInput, provider } = req.body;

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Steps array is required',
      });
    }

    const chain = await langChainService.createMultiStepChain(steps, { provider });
    const result = await chain.invoke(initialInput || {});

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('[AI Core] LangChain multi-step error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/ai-core/langchain/session/:sessionId
 * Clear session memory
 */
router.delete('/langchain/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = langChainService.clearSessionMemory(sessionId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/ai-core/langchain/tools
 * Get available tools
 */
router.get('/langchain/tools', async (req, res) => {
  try {
    await ensureInitialized();

    const tools = langChainService.createAgentTools();

    res.json({
      success: true,
      tools: tools.map(t => ({
        name: t.name,
        description: t.description,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// LANGGRAPH ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/ai-core/langgraph/execute
 * Execute a workflow
 */
router.post('/langgraph/execute', async (req, res) => {
  try {
    await ensureInitialized();

    const { workflowType, input, options } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input is required',
      });
    }

    const result = await langGraphService.executeWorkflow(
      workflowType || 'coding',
      input,
      options || {},
    );

    res.json(result);
  } catch (error) {
    console.error('[AI Core] LangGraph execute error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-core/langgraph/coding
 * Execute coding agent workflow
 */
router.post('/langgraph/coding', async (req, res) => {
  try {
    await ensureInitialized();

    const { input, options } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input is required',
      });
    }

    const result = await langGraphService.executeWorkflow('coding', input, options);

    res.json(result);
  } catch (error) {
    console.error('[AI Core] LangGraph coding error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-core/langgraph/collaboration
 * Execute multi-agent collaboration workflow
 */
router.post('/langgraph/collaboration', async (req, res) => {
  try {
    await ensureInitialized();

    const { input, options } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input is required',
      });
    }

    const result = await langGraphService.executeWorkflow('collaboration', input, options);

    res.json(result);
  } catch (error) {
    console.error('[AI Core] LangGraph collaboration error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-core/langgraph/review
 * Execute code review and iterate workflow
 */
router.post('/langgraph/review', async (req, res) => {
  try {
    await ensureInitialized();

    const { input, maxIterations } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input is required',
      });
    }

    const result = await langGraphService.executeWorkflow('review', input, { maxIterations });

    res.json(result);
  } catch (error) {
    console.error('[AI Core] LangGraph review error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/ai-core/langgraph/workflows
 * Get available workflows
 */
router.get('/langgraph/workflows', async (req, res) => {
  try {
    await ensureInitialized();

    const status = langGraphService.getStatus();

    res.json({
      success: true,
      workflows: status.workflows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
