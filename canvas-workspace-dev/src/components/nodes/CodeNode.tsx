import { memo, useCallback } from 'react'
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react'
import { Trash2, Copy, Settings, Maximize2, Code, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import type { CanvasNode } from '../../types'

interface CodeNodeData {
  label: string
  code: string
  language: string
  output?: string
  isExecuting?: boolean
}

type CodeNodeProps = NodeProps<CanvasNode & { data: CodeNodeData }>

export const CodeNode = memo(({ id, data, selected }: CodeNodeProps) => {
  const { label, code, language, isExecuting } = data

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'bg-gray-900 border rounded-xl shadow-xl overflow-hidden min-w-[300px] max-w-[600px]',
        selected ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-700',
        isExecuting && 'border-yellow-500'
      )}
    >
      {/* Node Resizer */}
      <NodeResizer
        minWidth={300}
        minHeight={200}
        isVisible={selected}
        lineClassName="!border-blue-500"
        handleClassName="!w-2 !h-2 !bg-blue-500 !border-blue-500"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Code size={14} className="text-blue-400" />
          <span className="text-sm font-medium text-white truncate max-w-[200px]">
            {label}
          </span>
          <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-700 rounded">
            {language}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 hover:bg-gray-700 rounded">
            <Eye size={12} className="text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-700 rounded">
            <Copy size={12} className="text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-700 rounded">
            <Settings size={12} className="text-gray-400" />
          </button>
          <button className="p-1 hover:bg-red-900/50 rounded">
            <Trash2 size={12} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Code Preview */}
      <div className="p-3 font-mono text-xs text-gray-300 bg-gray-900 max-h-[300px] overflow-auto">
        <pre className="whitespace-pre-wrap">
          {code.slice(0, 500)}
          {code.length > 500 && '...'}
        </pre>
      </div>

      {/* Status Bar */}
      {isExecuting && (
        <div className="px-3 py-2 bg-yellow-500/10 border-t border-yellow-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-xs text-yellow-400">Executing...</span>
          </div>
        </div>
      )}

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-300"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-green-300"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-purple-300"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-orange-500 !border-2 !border-orange-300"
      />
    </motion.div>
  )
})

CodeNode.displayName = 'CodeNode'
