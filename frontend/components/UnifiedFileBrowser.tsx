'use client';

import { useState, useEffect } from 'react';
import {
  FolderIcon,
  DocumentIcon,
  PhotoIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  mimeType?: string;
  modifiedAt?: string;
  isCanvasProject?: boolean;
  canvasData?: any;
}

interface UnifiedFileBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onFileSelect?: (file: FileItem) => void;
  onCreateFile?: (name: string, type: 'file' | 'canvas') => void;
  theme?: 'default' | 'neural';
}

export default function UnifiedFileBrowser({
  isOpen,
  onClose,
  userId,
  onFileSelect,
  onCreateFile,
  theme = 'default',
}: UnifiedFileBrowserProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [canvasProjects, setCanvasProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('/');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));

  const isNeural = theme === 'neural';

  // Theme styles
  const bgColor = isNeural ? 'bg-gray-900' : 'bg-white';
  const borderColor = isNeural ? 'border-gray-700' : 'border-gray-200';
  const textColor = isNeural ? 'text-white' : 'text-gray-900';
  const textSecondary = isNeural ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = isNeural ? 'hover:bg-gray-800' : 'hover:bg-gray-50';

  useEffect(() => {
    if (isOpen && userId) {
      loadFilesAndProjects();
    }
  }, [isOpen, userId, selectedFolder]);

  const loadFilesAndProjects = async () => {
    setLoading(true);
    try {
      // Load agent files
      const filesResponse = await fetch(`/api/agents/files?folder=${encodeURIComponent(selectedFolder)}`);
      const filesData = await filesResponse.json();

      // Load canvas projects
      const canvasResponse = await fetch('/api/chat/canvas/projects');
      const canvasData = await canvasResponse.json();

      if (filesData.success) {
        setFiles(filesData.files || []);
      }

      if (canvasData.success) {
        setCanvasProjects(canvasData.projects || []);
      }
    } catch (error) {
      console.error('Error loading files and projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file: FileItem) => {
    if (file.isCanvasProject) {
      return <CodeBracketIcon className="w-4 h-4 text-purple-500" />;
    }

    if (file.type === 'folder') {
      return <FolderIcon className="w-4 h-4 text-blue-500" />;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <PhotoIcon className="w-4 h-4 text-green-500" />;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
        return <CodeBracketIcon className="w-4 h-4 text-yellow-500" />;
      case 'md':
      case 'txt':
        return <DocumentTextIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <DocumentIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredItems = () => {
    const allItems: FileItem[] = [
      ...files.map(f => ({ ...f, isCanvasProject: false })),
      ...canvasProjects.map(p => ({
        id: p.projectId,
        name: p.name,
        type: 'file' as const,
        path: `/canvas/${p.projectId}`,
        isCanvasProject: true,
        canvasData: p,
        modifiedAt: p.updatedAt,
      })),
    ];

    if (!searchQuery) return allItems;

    return allItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleFileClick = (item: FileItem) => {
    if (item.type === 'folder') {
      setSelectedFolder(item.path);
      setExpandedFolders(prev => new Set([...prev, item.path]));
    } else {
      onFileSelect?.(item);
    }
  };

  const handleCreateFile = () => {
    const name = prompt('Enter file name:');
    if (name) {
      onCreateFile?.(name, 'file');
    }
  };

  const handleCreateCanvas = () => {
    const name = prompt('Enter canvas project name:');
    if (name) {
      onCreateFile?.(name, 'canvas');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* File Browser Panel */}
      <div className={`relative w-96 ${bgColor} border-l ${borderColor} shadow-xl`}>
        {/* Header */}
        <div className={`p-4 border-b ${borderColor}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${textColor}`}>File Browser</h3>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg ${hoverBg} transition-colors`}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isNeural ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleCreateFile}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              File
            </button>
            <button
              onClick={handleCreateCanvas}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
            >
              <CodeBracketIcon className="w-4 h-4" />
              Canvas
            </button>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className={`mt-2 text-sm ${textSecondary}`}>Loading...</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredItems().map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleFileClick(item)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${hoverBg} transition-colors`}
                >
                  {getFileIcon(item)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${textColor} truncate`}>
                      {item.name}
                      {item.isCanvasProject && (
                        <span className="ml-2 text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                          Canvas
                        </span>
                      )}
                    </p>
                    <p className={`text-xs ${textSecondary}`}>
                      {item.type === 'folder' ? 'Folder' : `${item.size || 0} bytes`}
                      {item.modifiedAt && ` • ${new Date(item.modifiedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  {item.type === 'folder' && (
                    expandedFolders.has(item.path) ? (
                      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                    )
                  )}
                </div>
              ))}

              {filteredItems().length === 0 && (
                <div className="p-8 text-center">
                  <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className={`text-sm ${textSecondary}`}>
                    {searchQuery ? 'No files found' : 'No files in this folder'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}