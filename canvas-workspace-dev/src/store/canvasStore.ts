import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { 
  CanvasNode, 
  CanvasEdge, 
  CanvasState, 
  CanvasHistoryEntry,
  CanvasNodeData 
} from '../types'

interface CanvasStore extends CanvasState {
  // Node Actions
  addNode: (node: Partial<CanvasNode> & { data: CanvasNodeData }) => string
  updateNode: (id: string, data: Partial<CanvasNodeData>) => void
  removeNode: (id: string) => void
  setNodes: (nodes: CanvasNode[]) => void
  
  // Edge Actions
  addEdge: (edge: Partial<CanvasEdge>) => void
  removeEdge: (id: string) => void
  setEdges: (edges: CanvasEdge[]) => void
  
  // Selection Actions
  selectNode: (id: string, addToSelection?: boolean) => void
  selectNodes: (ids: string[]) => void
  clearSelection: () => void
  
  // Viewport Actions
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void
  
  // History Actions
  saveToHistory: () => void
  undo: () => void
  redo: () => void
  
  // Utility Actions
  reset: () => void
}

const MAX_HISTORY_SIZE = 50

const initialState: CanvasState = {
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  history: [],
  historyIndex: -1,
}

export const useCanvasStore = create<CanvasStore>()(
  immer((set, get) => ({
    ...initialState,

    // Node Actions
    addNode: (nodeData) => {
      const id = nodeData.id || nanoid()
      const node: CanvasNode = {
        id,
        type: 'default',
        position: nodeData.position || { x: 100, y: 100 },
        data: nodeData.data,
        ...nodeData,
      }
      
      set((state) => {
        state.nodes.push(node)
      })
      
      get().saveToHistory()
      return id
    },

    updateNode: (id, data) => {
      set((state) => {
        const node = state.nodes.find(n => n.id === id)
        if (node) {
          node.data = { ...node.data, ...data }
        }
      })
      get().saveToHistory()
    },

    removeNode: (id) => {
      set((state) => {
        state.nodes = state.nodes.filter(n => n.id !== id)
        state.edges = state.edges.filter(e => e.source !== id && e.target !== id)
        state.selectedNodeIds = state.selectedNodeIds.filter(nid => nid !== id)
      })
      get().saveToHistory()
    },

    setNodes: (nodes) => {
      set((state) => {
        state.nodes = nodes
      })
    },

    // Edge Actions
    addEdge: (edgeData) => {
      const edge: CanvasEdge = {
        id: edgeData.id || nanoid(),
        source: edgeData.source || '',
        target: edgeData.target || '',
        ...edgeData,
      }
      
      set((state) => {
        // Prevent duplicate edges
        const exists = state.edges.some(
          e => e.source === edge.source && e.target === edge.target
        )
        if (!exists) {
          state.edges.push(edge)
        }
      })
      get().saveToHistory()
    },

    removeEdge: (id) => {
      set((state) => {
        state.edges = state.edges.filter(e => e.id !== id)
      })
      get().saveToHistory()
    },

    setEdges: (edges) => {
      set((state) => {
        state.edges = edges
      })
    },

    // Selection Actions
    selectNode: (id, addToSelection = false) => {
      set((state) => {
        if (addToSelection) {
          if (!state.selectedNodeIds.includes(id)) {
            state.selectedNodeIds.push(id)
          }
        } else {
          state.selectedNodeIds = [id]
        }
      })
    },

    selectNodes: (ids) => {
      set((state) => {
        state.selectedNodeIds = ids
      })
    },

    clearSelection: () => {
      set((state) => {
        state.selectedNodeIds = []
      })
    },

    // Viewport Actions
    setViewport: (viewport) => {
      set((state) => {
        state.viewport = viewport
      })
    },

    // History Actions
    saveToHistory: () => {
      set((state) => {
        const entry: CanvasHistoryEntry = {
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges)),
          timestamp: Date.now(),
        }
        
        // Remove future history if we're not at the end
        state.history = state.history.slice(0, state.historyIndex + 1)
        state.history.push(entry)
        
        // Limit history size
        if (state.history.length > MAX_HISTORY_SIZE) {
          state.history = state.history.slice(-MAX_HISTORY_SIZE)
        }
        
        state.historyIndex = state.history.length - 1
      })
    },

    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--
          const entry = state.history[state.historyIndex]
          state.nodes = JSON.parse(JSON.stringify(entry.nodes))
          state.edges = JSON.parse(JSON.stringify(entry.edges))
        }
      })
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++
          const entry = state.history[state.historyIndex]
          state.nodes = JSON.parse(JSON.stringify(entry.nodes))
          state.edges = JSON.parse(JSON.stringify(entry.edges))
        }
      })
    },

    // Utility Actions
    reset: () => {
      set(() => initialState)
    },
  }))
)
