import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SidebarTab = 'files' | 'components' | 'templates' | 'chat' | 'settings'
export type Theme = 'light' | 'dark' | 'system'
export type CanvasBackground = 'dots' | 'lines' | 'cross' | 'none'

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  sidebarWidth: number
  activeSidebarTab: SidebarTab
  
  // Panels
  chatPanelOpen: boolean
  chatPanelWidth: number
  previewPanelOpen: boolean
  previewPanelHeight: number
  editorPanelOpen: boolean
  editorPanelWidth: number
  
  // Canvas Settings
  showMinimap: boolean
  showGrid: boolean
  canvasBackground: CanvasBackground
  snapToGrid: boolean
  gridSize: number
  
  // Theme
  theme: Theme
  
  // Modals
  activeModal: string | null
  modalData: Record<string, unknown>
  
  // Notifications
  notifications: Notification[]
  
  // Command Palette
  commandPaletteOpen: boolean
  
  // Zoom
  zoomLevel: number
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  timestamp: number
}

interface UIStore extends UIState {
  // Sidebar Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarWidth: (width: number) => void
  setActiveSidebarTab: (tab: SidebarTab) => void
  
  // Panel Actions
  toggleChatPanel: () => void
  setChatPanelOpen: (open: boolean) => void
  setChatPanelWidth: (width: number) => void
  togglePreviewPanel: () => void
  setPreviewPanelOpen: (open: boolean) => void
  setPreviewPanelHeight: (height: number) => void
  toggleEditorPanel: () => void
  setEditorPanelOpen: (open: boolean) => void
  setEditorPanelWidth: (width: number) => void
  
  // Canvas Settings
  toggleMinimap: () => void
  toggleGrid: () => void
  setCanvasBackground: (bg: CanvasBackground) => void
  toggleSnapToGrid: () => void
  setGridSize: (size: number) => void
  
  // Theme
  setTheme: (theme: Theme) => void
  
  // Modal Actions
  openModal: (modalId: string, data?: Record<string, unknown>) => void
  closeModal: () => void
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Command Palette
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
  
  // Zoom
  setZoomLevel: (level: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  
  // Reset
  reset: () => void
}

const initialState: UIState = {
  // Sidebar
  sidebarOpen: true,
  sidebarWidth: 280,
  activeSidebarTab: 'files',
  
  // Panels
  chatPanelOpen: true,
  chatPanelWidth: 400,
  previewPanelOpen: false,
  previewPanelHeight: 400,
  editorPanelOpen: true,
  editorPanelWidth: 500,
  
  // Canvas Settings
  showMinimap: true,
  showGrid: true,
  canvasBackground: 'dots',
  snapToGrid: true,
  gridSize: 20,
  
  // Theme
  theme: 'dark',
  
  // Modals
  activeModal: null,
  modalData: {},
  
  // Notifications
  notifications: [],
  
  // Command Palette
  commandPaletteOpen: false,
  
  // Zoom
  zoomLevel: 1,
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Sidebar Actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarWidth: (width) => set({ sidebarWidth: Math.max(200, Math.min(500, width)) }),
      setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab, sidebarOpen: true }),

      // Panel Actions
      toggleChatPanel: () => set((state) => ({ chatPanelOpen: !state.chatPanelOpen })),
      setChatPanelOpen: (open) => set({ chatPanelOpen: open }),
      setChatPanelWidth: (width) => set({ chatPanelWidth: Math.max(300, Math.min(800, width)) }),
      
      togglePreviewPanel: () => set((state) => ({ previewPanelOpen: !state.previewPanelOpen })),
      setPreviewPanelOpen: (open) => set({ previewPanelOpen: open }),
      setPreviewPanelHeight: (height) => set({ previewPanelHeight: Math.max(200, Math.min(800, height)) }),
      
      toggleEditorPanel: () => set((state) => ({ editorPanelOpen: !state.editorPanelOpen })),
      setEditorPanelOpen: (open) => set({ editorPanelOpen: open }),
      setEditorPanelWidth: (width) => set({ editorPanelWidth: Math.max(300, Math.min(800, width)) }),

      // Canvas Settings
      toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      setCanvasBackground: (bg) => set({ canvasBackground: bg }),
      toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
      setGridSize: (size) => set({ gridSize: Math.max(10, Math.min(100, size)) }),

      // Theme
      setTheme: (theme) => set({ theme }),

      // Modal Actions
      openModal: (modalId, data = {}) => set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: {} }),

      // Notification Actions
      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const fullNotification: Notification = {
          ...notification,
          id,
          timestamp: Date.now(),
          duration: notification.duration ?? 5000,
        }
        
        set((state) => ({
          notifications: [...state.notifications, fullNotification].slice(-10), // Keep last 10
        }))
        
        // Auto-remove after duration
        if (fullNotification.duration && fullNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, fullNotification.duration)
        }
      },
      
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }))
      },
      
      clearNotifications: () => set({ notifications: [] }),

      // Command Palette
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Zoom
      setZoomLevel: (level) => set({ zoomLevel: Math.max(0.1, Math.min(2, level)) }),
      zoomIn: () => set((state) => ({ zoomLevel: Math.min(2, state.zoomLevel + 0.1) })),
      zoomOut: () => set((state) => ({ zoomLevel: Math.max(0.1, state.zoomLevel - 0.1) })),
      resetZoom: () => set({ zoomLevel: 1 }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'canvas-ui-storage',
      partialize: (state) => ({
        sidebarWidth: state.sidebarWidth,
        chatPanelWidth: state.chatPanelWidth,
        editorPanelWidth: state.editorPanelWidth,
        previewPanelHeight: state.previewPanelHeight,
        showMinimap: state.showMinimap,
        showGrid: state.showGrid,
        canvasBackground: state.canvasBackground,
        snapToGrid: state.snapToGrid,
        gridSize: state.gridSize,
        theme: state.theme,
      }),
    }
  )
)
