'use client';

import { useState, useEffect, useCallback } from 'react';
import { FolderIcon, DocumentIcon, PhotoIcon, CodeBracketIcon, XMarkIcon, EyeIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'canvas';
  path?: string;
  size?: number;
  modified?: string;
  extension?: string;
  thumbnail?: string;
  tags?: string[];
  description?: string;
}

interface UnifiedFileBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect?: (file: FileItem) => void;
  onCanvasSelect?: (canvas: FileItem) => void;
}

export default function UnifiedFileBrowser({ isOpen, onClose, onFileSelect, onCanvasSelect }: UnifiedFileBrowserProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [canvasProjects, setCanvasProjects] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'canvas'>('files');
  const [searchQuery, setSearchQuery] = useState('');

  // Load files and canvas projects
  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      // Load canvas projects
      const canvasResponse = await fetch('/api/canvas-projects/projects');
      if (canvasResponse.ok) {
        const canvasData = await canvasResponse.json();
        if (canvasData.success) {
          const canvasItems: FileItem[] = canvasData.projects.map((project: any) => ({
            id: project.id,
            name: project.name,
            type: 'canvas' as const,
            modified: project.savedAt,
            thumbnail: project.thumbnail,
            tags: project.tags,
            description: project.description
          }));
          setCanvasProjects(canvasItems);
        }
      }

      // Load regular files (this would need a backend endpoint)
      // For now, we'll show a placeholder
      const mockFiles: FileItem[] = [
        {
          id: 'file1',
          name: 'example.js',
          type: 'file',
          path: '/workspace/example.js',
          size: 1024,
          modified: new Date().toISOString(),
          extension: '.js'
        },
        {
          id: 'file2',
          name: 'styles.css',
          type: 'file',
          path: '/workspace/styles.css',
          size: 2048,
          modified: new Date().toISOString(),
          extension: '.css'
        }
      ];
      setFiles(mockFiles);

    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadContent();
    }
  }, [isOpen, loadContent]);

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'canvas') {
      return <CodeBracketIcon className="w-6 h-6 text-purple-500" />;
    }

    const ext = file.extension?.toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext || '')) {
      return <PhotoIcon className="w-6 h-6 text-green-500" />;
    }
    if (['.js', '.ts', '.jsx', '.tsx'].includes(ext || '')) {
      return <CodeBracketIcon className="w-6 h-6 text-yellow-500" />;
    }
    return <DocumentIcon className="w-6 h-6 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCanvas = canvasProjects.filter(canvas =>
    canvas.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    canvas.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    canvas.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'file' && onFileSelect) {
      onFileSelect(item);
    } else if (item.type === 'canvas' && onCanvasSelect) {
      onCanvasSelect(item);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">File Browser</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search files and projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'files'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Files ({filteredFiles.length})
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'canvas'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Canvas Projects ({filteredCanvas.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeTab === 'files' ? (
                filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleItemClick(file)}
                      className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      {getFileIcon(file)}
                      <div className="ml-3 flex-1">
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {formatDate(file.modified)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No files found
                  </div>
                )
              ) : (
                filteredCanvas.length > 0 ? (
                  filteredCanvas.map((canvas) => (
                    <div
                      key={canvas.id}
                      onClick={() => handleItemClick(canvas)}
                      className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      {getFileIcon(canvas)}
                      <div className="ml-3 flex-1">
                        <div className="font-medium">{canvas.name}</div>
                        <div className="text-sm text-gray-500">
                          {canvas.description} • {formatDate(canvas.modified)}
                        </div>
                        {canvas.tags && canvas.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {canvas.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No canvas projects found
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}