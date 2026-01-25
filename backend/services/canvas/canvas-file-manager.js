/**
 * CANVAS FILE MANAGER
 * Handles saving, loading, and managing canvas projects in the file system
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

class CanvasFileManager {
  constructor() {
    // Canvas projects are stored in a dedicated directory
    this.canvasDir = path.join(process.cwd(), 'canvas-projects');

    // Ensure canvas directory exists
    this.ensureCanvasDirectory();
  }

  /**
   * Ensure canvas directory exists
   */
  async ensureCanvasDirectory() {
    try {
      await fs.mkdir(this.canvasDir, { recursive: true });
    } catch (error) {
      console.error('[CanvasFileManager] Failed to create canvas directory:', error);
    }
  }

  /**
   * Generate unique project ID
   */
  generateProjectId() {
    return `canvas_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Save canvas project to file system
   */
  async saveProject(projectData, userId = 'default') {
    try {
      const projectId = projectData.id || this.generateProjectId();
      const projectDir = path.join(this.canvasDir, userId);
      const projectFile = path.join(projectDir, `${projectId}.json`);

      // Ensure user directory exists
      await fs.mkdir(projectDir, { recursive: true });

      // Prepare project data with metadata
      const projectToSave = {
        ...projectData,
        id: projectId,
        userId,
        savedAt: new Date().toISOString(),
        version: '1.0',
      };

      // Save project file
      await fs.writeFile(projectFile, JSON.stringify(projectToSave, null, 2), 'utf-8');

      console.log(`[CanvasFileManager] Saved project ${projectId} for user ${userId}`);

      return {
        success: true,
        projectId,
        path: projectFile,
        savedAt: projectToSave.savedAt,
      };
    } catch (error) {
      console.error('[CanvasFileManager] Failed to save project:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Load canvas project from file system
   */
  async loadProject(projectId, userId = 'default') {
    try {
      const projectDir = path.join(this.canvasDir, userId);
      const projectFile = path.join(projectDir, `${projectId}.json`);

      const content = await fs.readFile(projectFile, 'utf-8');
      const project = JSON.parse(content);

      return {
        success: true,
        project,
      };
    } catch (error) {
      console.error(`[CanvasFileManager] Failed to load project ${projectId}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List canvas projects for a user
   */
  async listProjects(userId = 'default') {
    try {
      const projectDir = path.join(this.canvasDir, userId);

      try {
        const files = await fs.readdir(projectDir);
        const projects = [];

        for (const file of files) {
          if (file.endsWith('.json')) {
            try {
              const filePath = path.join(projectDir, file);
              const content = await fs.readFile(filePath, 'utf-8');
              const project = JSON.parse(content);

              projects.push({
                id: project.id,
                name: project.name || 'Untitled Project',
                description: project.description || '',
                createdAt: project.createdAt,
                savedAt: project.savedAt,
                thumbnail: project.thumbnail,
                tags: project.tags || [],
              });
            } catch (error) {
              console.warn(`[CanvasFileManager] Failed to parse project file ${file}:`, error);
            }
          }
        }

        return {
          success: true,
          projects: projects.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)),
        };
      } catch (_error) {
        // Directory doesn't exist yet
        return {
          success: true,
          projects: [],
        };
      }
    } catch (error) {
      console.error('[CanvasFileManager] Failed to list projects:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete canvas project
   */
  async deleteProject(projectId, userId = 'default') {
    try {
      const projectDir = path.join(this.canvasDir, userId);
      const projectFile = path.join(projectDir, `${projectId}.json`);

      await fs.unlink(projectFile);

      console.log(`[CanvasFileManager] Deleted project ${projectId} for user ${userId}`);

      return {
        success: true,
      };
    } catch (error) {
      console.error(`[CanvasFileManager] Failed to delete project ${projectId}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Export canvas project as HTML file
   */
  async exportProject(projectId, userId = 'default', format = 'html') {
    try {
      const loadResult = await this.loadProject(projectId, userId);
      if (!loadResult.success) {
        return loadResult;
      }

      const project = loadResult.project;
      const exportDir = path.join(this.canvasDir, userId, 'exports');
      await fs.mkdir(exportDir, { recursive: true });

      let exportContent = '';
      let exportFileName = '';
      let exportPath = '';

      if (format === 'html') {
        exportContent = this.generateHTML(project);
        exportFileName = `${projectId}.html`;
        exportPath = path.join(exportDir, exportFileName);
      } else if (format === 'json') {
        exportContent = JSON.stringify(project, null, 2);
        exportFileName = `${projectId}.json`;
        exportPath = path.join(exportDir, exportFileName);
      }

      await fs.writeFile(exportPath, exportContent, 'utf-8');

      return {
        success: true,
        exportPath,
        fileName: exportFileName,
        format,
      };
    } catch (error) {
      console.error(`[CanvasFileManager] Failed to export project ${projectId}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate HTML from canvas project
   */
  generateHTML(project) {
    const { code, name, description } = project;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name || 'Canvas Project'}</title>
    <meta name="description" content="${description || ''}">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    </style>
</head>
<body>
    ${code || '<h1>Canvas Project</h1><p>No content generated yet.</p>'}
</body>
</html>`;
  }

  /**
   * Search canvas projects
   */
  async searchProjects(query, userId = 'default') {
    try {
      const listResult = await this.listProjects(userId);
      if (!listResult.success) {
        return listResult;
      }

      const projects = listResult.projects;
      const searchTerm = query.toLowerCase();

      const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchTerm))),
      );

      return {
        success: true,
        projects: filteredProjects,
      };
    } catch (error) {
      console.error('[CanvasFileManager] Failed to search projects:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default CanvasFileManager;