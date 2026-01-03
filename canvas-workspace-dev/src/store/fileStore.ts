import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { FileNode, FileSystemState } from '../types'

interface FileStore extends FileSystemState {
  // File Actions
  createFile: (parentId: string | null, name: string, content?: string, language?: string) => string
  updateFile: (id: string, updates: Partial<Pick<FileNode, 'name' | 'content' | 'language'>>) => void
  deleteFile: (id: string) => void
  
  // Folder Actions
  createFolder: (parentId: string | null, name: string) => string
  deleteFolder: (id: string) => void
  toggleFolder: (id: string) => void
  
  // Navigation Actions
  setActiveFile: (id: string | null) => void
  openFile: (id: string) => void
  closeFile: (id: string) => void
  
  // Utility Actions
  findNode: (id: string) => FileNode | null
  getPath: (id: string) => string
  reset: () => void
}

const createRootFolder = (): FileNode => ({
  id: 'root',
  name: 'project',
  type: 'folder',
  children: [],
  parentId: null,
  isOpen: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

const initialState: FileSystemState = {
  root: createRootFolder(),
  activeFileId: null,
  openFileIds: [],
  expandedFolderIds: ['root'],
}

// Helper function to find a node in the tree
const findNodeInTree = (root: FileNode, id: string): FileNode | null => {
  if (root.id === id) return root
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeInTree(child, id)
      if (found) return found
    }
  }
  return null
}

// Helper function to find parent of a node
const findParentInTree = (root: FileNode, id: string): FileNode | null => {
  if (root.children) {
    for (const child of root.children) {
      if (child.id === id) return root
      const found = findParentInTree(child, id)
      if (found) return found
    }
  }
  return null
}

// Helper function to delete a node from tree
const deleteNodeFromTree = (root: FileNode, id: string): boolean => {
  if (root.children) {
    const index = root.children.findIndex(c => c.id === id)
    if (index !== -1) {
      root.children.splice(index, 1)
      return true
    }
    for (const child of root.children) {
      if (deleteNodeFromTree(child, id)) return true
    }
  }
  return false
}

// Helper to detect language from filename
const detectLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    html: 'html',
    css: 'css',
    scss: 'scss',
    md: 'markdown',
    py: 'python',
    rs: 'rust',
    go: 'go',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    sql: 'sql',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    sh: 'shell',
    bash: 'shell',
  }
  return langMap[ext || ''] || 'plaintext'
}

export const useFileStore = create<FileStore>()(
  immer((set, get) => ({
    ...initialState,

    // File Actions
    createFile: (parentId, name, content = '', language) => {
      const id = nanoid()
      const detectedLang = language || detectLanguage(name)
      
      const file: FileNode = {
        id,
        name,
        type: 'file',
        content,
        language: detectedLang,
        parentId: parentId || 'root',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      
      set((state) => {
        const parent = findNodeInTree(state.root, parentId || 'root')
        if (parent && parent.type === 'folder') {
          if (!parent.children) parent.children = []
          parent.children.push(file)
          parent.updatedAt = Date.now()
        }
      })
      
      return id
    },

    updateFile: (id, updates) => {
      set((state) => {
        const node = findNodeInTree(state.root, id)
        if (node && node.type === 'file') {
          if (updates.name !== undefined) node.name = updates.name
          if (updates.content !== undefined) node.content = updates.content
          if (updates.language !== undefined) node.language = updates.language
          node.updatedAt = Date.now()
        }
      })
    },

    deleteFile: (id) => {
      set((state) => {
        deleteNodeFromTree(state.root, id)
        state.openFileIds = state.openFileIds.filter(fid => fid !== id)
        if (state.activeFileId === id) {
          state.activeFileId = state.openFileIds[0] || null
        }
      })
    },

    // Folder Actions
    createFolder: (parentId, name) => {
      const id = nanoid()
      
      const folder: FileNode = {
        id,
        name,
        type: 'folder',
        children: [],
        parentId: parentId || 'root',
        isOpen: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      
      set((state) => {
        const parent = findNodeInTree(state.root, parentId || 'root')
        if (parent && parent.type === 'folder') {
          if (!parent.children) parent.children = []
          parent.children.push(folder)
          parent.updatedAt = Date.now()
        }
      })
      
      return id
    },

    deleteFolder: (id) => {
      if (id === 'root') return // Cannot delete root
      
      set((state) => {
        // Collect all file IDs in the folder to close them
        const collectFileIds = (node: FileNode): string[] => {
          if (node.type === 'file') return [node.id]
          if (node.children) {
            return node.children.flatMap(collectFileIds)
          }
          return []
        }
        
        const folder = findNodeInTree(state.root, id)
        if (folder) {
          const fileIds = collectFileIds(folder)
          state.openFileIds = state.openFileIds.filter(fid => !fileIds.includes(fid))
          if (fileIds.includes(state.activeFileId || '')) {
            state.activeFileId = state.openFileIds[0] || null
          }
        }
        
        deleteNodeFromTree(state.root, id)
        state.expandedFolderIds = state.expandedFolderIds.filter(fid => fid !== id)
      })
    },

    toggleFolder: (id) => {
      set((state) => {
        const node = findNodeInTree(state.root, id)
        if (node && node.type === 'folder') {
          node.isOpen = !node.isOpen
          if (node.isOpen && !state.expandedFolderIds.includes(id)) {
            state.expandedFolderIds.push(id)
          } else if (!node.isOpen) {
            state.expandedFolderIds = state.expandedFolderIds.filter(fid => fid !== id)
          }
        }
      })
    },

    // Navigation Actions
    setActiveFile: (id) => {
      set((state) => {
        state.activeFileId = id
      })
    },

    openFile: (id) => {
      set((state) => {
        if (!state.openFileIds.includes(id)) {
          state.openFileIds.push(id)
        }
        state.activeFileId = id
      })
    },

    closeFile: (id) => {
      set((state) => {
        state.openFileIds = state.openFileIds.filter(fid => fid !== id)
        if (state.activeFileId === id) {
          state.activeFileId = state.openFileIds[0] || null
        }
      })
    },

    // Utility Actions
    findNode: (id) => {
      return findNodeInTree(get().root, id)
    },

    getPath: (id) => {
      const path: string[] = []
      let current = get().findNode(id)
      
      while (current && current.id !== 'root') {
        path.unshift(current.name)
        if (current.parentId) {
          current = get().findNode(current.parentId)
        } else {
          break
        }
      }
      
      return path.join('/')
    },

    reset: () => {
      set(() => ({
        ...initialState,
        root: createRootFolder(),
      }))
    },
  }))
)
