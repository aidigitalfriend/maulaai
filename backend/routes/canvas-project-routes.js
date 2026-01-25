/**
 * CANVAS PROJECT API ROUTES
 * Endpoints for managing canvas projects in the file system
 */

import express from 'express';
import { body, param, validationResult } from 'express-validator';
import CanvasFileManager from '../services/canvas/canvas-file-manager.js';

const router = express.Router();
const canvasManager = new CanvasFileManager();

// Input validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Authentication middleware
const requireAuth = async (req, res, next) => {
  try {
    const userId = req.session?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }
    req.userId = userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
};

/**
 * POST /api/canvas/projects
 * Save a canvas project
 */
router.post('/projects', requireAuth, [
  body('name').optional().isString().isLength({ min: 1, max: 200 }),
  body('description').optional().isString().isLength({ max: 1000 }),
  body('code').optional().isString(),
  body('thumbnail').optional().isString(),
  body('tags').optional().isArray(),
  body('metadata').optional().isObject(),
], validateRequest, async (req, res) => {
  try {
    const { name, description, code, thumbnail, tags, metadata, ...otherData } = req.body;
    const userId = req.userId;

    const projectData = {
      name: name || 'Untitled Project',
      description: description || '',
      code: code || '',
      thumbnail,
      tags: tags || [],
      metadata: metadata || {},
      ...otherData,
      createdAt: new Date().toISOString(),
    };

    const result = await canvasManager.saveProject(projectData, userId);

    if (result.success) {
      res.json({
        success: true,
        projectId: result.projectId,
        message: 'Project saved successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('[CanvasAPI] Save project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save project',
    });
  }
});

/**
 * GET /api/canvas/projects
 * List canvas projects for the authenticated user
 */
router.get('/projects', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await canvasManager.listProjects(userId);

    if (result.success) {
      res.json({
        success: true,
        projects: result.projects,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('[CanvasAPI] List projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list projects',
    });
  }
});

/**
 * GET /api/canvas/projects/:projectId
 * Load a specific canvas project
 */
router.get('/projects/:projectId', requireAuth, [
  param('projectId').isString().isLength({ min: 1 }),
], validateRequest, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const result = await canvasManager.loadProject(projectId, userId);

    if (result.success) {
      res.json({
        success: true,
        project: result.project,
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
  } catch (error) {
    console.error('[CanvasAPI] Load project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load project',
    });
  }
});

/**
 * PUT /api/canvas/projects/:projectId
 * Update a canvas project
 */
router.put('/projects/:projectId', requireAuth, [
  param('projectId').isString().isLength({ min: 1 }),
  body('name').optional().isString().isLength({ min: 1, max: 200 }),
  body('description').optional().isString().isLength({ max: 1000 }),
  body('code').optional().isString(),
  body('thumbnail').optional().isString(),
  body('tags').optional().isArray(),
  body('metadata').optional().isObject(),
], validateRequest, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    const updates = req.body;

    // First load the existing project
    const loadResult = await canvasManager.loadProject(projectId, userId);
    if (!loadResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Merge updates with existing project
    const updatedProject = {
      ...loadResult.project,
      ...updates,
      id: projectId, // Ensure ID doesn't change
      userId,
      updatedAt: new Date().toISOString(),
    };

    const saveResult = await canvasManager.saveProject(updatedProject, userId);

    if (saveResult.success) {
      res.json({
        success: true,
        message: 'Project updated successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        error: saveResult.error,
      });
    }
  } catch (error) {
    console.error('[CanvasAPI] Update project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project',
    });
  }
});

/**
 * DELETE /api/canvas/projects/:projectId
 * Delete a canvas project
 */
router.delete('/projects/:projectId', requireAuth, [
  param('projectId').isString().isLength({ min: 1 }),
], validateRequest, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const result = await canvasManager.deleteProject(projectId, userId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Project deleted successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('[CanvasAPI] Delete project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project',
    });
  }
});

/**
 * POST /api/canvas/projects/:projectId/export
 * Export a canvas project
 */
router.post('/projects/:projectId/export', requireAuth, [
  param('projectId').isString().isLength({ min: 1 }),
  body('format').optional().isIn(['html', 'json']),
], validateRequest, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { format = 'html' } = req.body;
    const userId = req.userId;

    const result = await canvasManager.exportProject(projectId, userId, format);

    if (result.success) {
      res.json({
        success: true,
        exportPath: result.exportPath,
        fileName: result.fileName,
        format: result.format,
        message: 'Project exported successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('[CanvasAPI] Export project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export project',
    });
  }
});

/**
 * GET /api/canvas/projects/search
 * Search canvas projects
 */
router.get('/projects/search', requireAuth, [
  body('query').isString().isLength({ min: 1 }),
], validateRequest, async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.userId;

    const result = await canvasManager.searchProjects(query, userId);

    if (result.success) {
      res.json({
        success: true,
        projects: result.projects,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('[CanvasAPI] Search projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search projects',
    });
  }
});

export default router;