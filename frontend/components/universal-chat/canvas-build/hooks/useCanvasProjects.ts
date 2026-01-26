/**
 * useCanvasProjects Hook
 * Manages canvas project persistence with backend API + localStorage fallback
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface CanvasProject {
  id: string;
  name: string;
  prompt: string;
  code: string;
  timestamp: number;
  chatHistory?: ChatMessage[];
  metadata?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface UseCanvasProjectsResult {
  projects: CanvasProject[];
  isLoading: boolean;
  error: string | null;
  saveProject: (project: Omit<CanvasProject, 'id'> & { id?: string }) => Promise<{ success: boolean; projectId?: string }>;
  loadProject: (projectId: string) => Promise<CanvasProject | null>;
  deleteProject: (projectId: string) => Promise<boolean>;
  updateProject: (projectId: string, updates: Partial<CanvasProject>) => Promise<boolean>;
  syncToBackend: () => Promise<void>;
}

const STORAGE_KEY = 'canvasHistory';
const CHAT_STORAGE_KEY = 'canvasMessages';

export function useCanvasProjects(): UseCanvasProjectsResult {
  const [projects, setProjects] = useState<CanvasProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedFromApi = useRef(false);
  const isSyncing = useRef(false);

  // Load projects from API on mount
  useEffect(() => {
    if (hasLoadedFromApi.current) return;
    hasLoadedFromApi.current = true;

    const loadProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try to load from backend API first
        const response = await fetch('/api/canvas-projects', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.projects) {
            // Convert backend format to local format
            const backendProjects: CanvasProject[] = data.projects.map((p: Record<string, unknown>) => ({
              id: p.id || p.projectId,
              name: p.name || 'Untitled',
              prompt: p.description || '',
              code: p.code || '',
              timestamp: new Date(p.createdAt as string || Date.now()).getTime(),
              chatHistory: p.chatHistory || [],
              metadata: p.metadata || {},
            }));

            // Merge with localStorage (backend takes priority for same IDs)
            const localProjects = loadFromLocalStorage();
            const mergedProjects = mergeProjects(backendProjects, localProjects);
            
            setProjects(mergedProjects);
            saveToLocalStorage(mergedProjects);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[Canvas] Failed to load from API, falling back to localStorage:', err);
      }

      // Fallback to localStorage
      const localProjects = loadFromLocalStorage();
      setProjects(localProjects);
      setIsLoading(false);
    };

    loadProjects();
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && projects.length >= 0) {
      saveToLocalStorage(projects);
    }
  }, [projects, isLoading]);

  // Load from localStorage
  const loadFromLocalStorage = (): CanvasProject[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('[Canvas] Failed to load from localStorage:', err);
    }
    return [];
  };

  // Save to localStorage
  const saveToLocalStorage = (data: CanvasProject[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('[Canvas] Failed to save to localStorage:', err);
    }
  };

  // Merge projects (backend takes priority for same IDs)
  const mergeProjects = (backend: CanvasProject[], local: CanvasProject[]): CanvasProject[] => {
    const backendIds = new Set(backend.map(p => p.id));
    const localOnly = local.filter(p => !backendIds.has(p.id));
    return [...backend, ...localOnly].sort((a, b) => b.timestamp - a.timestamp);
  };

  // Save a project
  const saveProject = useCallback(async (
    project: Omit<CanvasProject, 'id'> & { id?: string }
  ): Promise<{ success: boolean; projectId?: string }> => {
    const projectId = project.id || `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullProject: CanvasProject = {
      ...project,
      id: projectId,
      timestamp: project.timestamp || Date.now(),
    };

    // Update local state immediately
    setProjects(prev => {
      const existing = prev.findIndex(p => p.id === projectId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = fullProject;
        return updated;
      }
      return [fullProject, ...prev];
    });

    // Try to save to backend
    try {
      const response = await fetch('/api/canvas-projects', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectId,
          name: fullProject.name,
          description: fullProject.prompt,
          code: fullProject.code,
          chatHistory: fullProject.chatHistory,
          metadata: fullProject.metadata,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Canvas] Project saved to backend:', data.projectId || projectId);
        return { success: true, projectId: data.projectId || projectId };
      }
    } catch (err) {
      console.warn('[Canvas] Failed to save to backend, saved locally:', err);
    }

    return { success: true, projectId };
  }, []);

  // Load a specific project
  const loadProject = useCallback(async (projectId: string): Promise<CanvasProject | null> => {
    // Check local state first
    const local = projects.find(p => p.id === projectId);
    if (local) return local;

    // Try backend
    try {
      const response = await fetch(`/api/canvas-projects/${projectId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.project) {
          return {
            id: data.project.id || data.project.projectId,
            name: data.project.name,
            prompt: data.project.description || '',
            code: data.project.code || '',
            timestamp: new Date(data.project.createdAt).getTime(),
            chatHistory: data.project.chatHistory || [],
            metadata: data.project.metadata || {},
          };
        }
      }
    } catch (err) {
      console.warn('[Canvas] Failed to load project from backend:', err);
    }

    return null;
  }, [projects]);

  // Delete a project
  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    // Remove from local state
    setProjects(prev => prev.filter(p => p.id !== projectId));

    // Try to delete from backend
    try {
      const response = await fetch(`/api/canvas-projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('[Canvas] Project deleted from backend:', projectId);
      }
    } catch (err) {
      console.warn('[Canvas] Failed to delete from backend:', err);
    }

    return true;
  }, []);

  // Update a project
  const updateProject = useCallback(async (
    projectId: string,
    updates: Partial<CanvasProject>
  ): Promise<boolean> => {
    // Update local state
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
    ));

    // Try to update backend
    try {
      const response = await fetch(`/api/canvas-projects/${projectId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updates.name,
          description: updates.prompt,
          code: updates.code,
          chatHistory: updates.chatHistory,
          metadata: updates.metadata,
        }),
      });

      if (response.ok) {
        console.log('[Canvas] Project updated in backend:', projectId);
        return true;
      }
    } catch (err) {
      console.warn('[Canvas] Failed to update in backend:', err);
    }

    return true;
  }, []);

  // Sync all local projects to backend
  const syncToBackend = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    try {
      for (const project of projects) {
        await saveProject(project);
      }
      console.log('[Canvas] All projects synced to backend');
    } catch (err) {
      console.error('[Canvas] Sync failed:', err);
    } finally {
      isSyncing.current = false;
    }
  }, [projects, saveProject]);

  return {
    projects,
    isLoading,
    error,
    saveProject,
    loadProject,
    deleteProject,
    updateProject,
    syncToBackend,
  };
}

// Export chat history helpers
export function loadChatHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('[Canvas] Failed to load chat history:', err);
  }
  return [];
}

export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (err) {
    console.error('[Canvas] Failed to save chat history:', err);
  }
}
