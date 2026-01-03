'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatMessage, FileAttachment, GeneratedFile, Template } from '../types';
import { extractFilesFromCode } from '../utils';

export interface CanvasState {
  // Chat state
  messages: ChatMessage[];
  input: string;
  attachedFiles: FileAttachment[];
  
  // Generation state
  isGenerating: boolean;
  generationStatus: string;
  streamingCode: string;
  
  // Files state
  generatedFiles: GeneratedFile[];
  selectedFile: string | null;
  previewHtml: string;
  
  // UI state
  activeView: 'preview' | 'code';
  activeDevice: 'desktop' | 'tablet' | 'mobile';
  showTemplates: boolean;
  selectedCategory: string;
  refreshKey: number;
}

const initialState: CanvasState = {
  messages: [],
  input: '',
  attachedFiles: [],
  isGenerating: false,
  generationStatus: '',
  streamingCode: '',
  generatedFiles: [],
  selectedFile: null,
  previewHtml: '',
  activeView: 'preview',
  activeDevice: 'desktop',
  showTemplates: false,
  selectedCategory: 'All',
  refreshKey: 0,
};

export function useCanvasState() {
  const [state, setState] = useState<CanvasState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Chat actions
  const setInput = useCallback((input: string) => {
    setState(prev => ({ ...prev, input }));
  }, []);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { ...message, id: Date.now().toString() }],
    }));
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map((msg, idx) =>
        idx === prev.messages.length - 1 ? { ...msg, content } : msg
      ),
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      generatedFiles: [],
      selectedFile: null,
      previewHtml: '',
      streamingCode: '',
    }));
  }, []);

  // File attachment actions
  const addAttachments = useCallback((files: FileAttachment[]) => {
    setState(prev => ({
      ...prev,
      attachedFiles: [...prev.attachedFiles, ...files],
    }));
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      attachedFiles: prev.attachedFiles.filter((_, i) => i !== index),
    }));
  }, []);

  // Generation actions
  const setGenerating = useCallback((isGenerating: boolean, status?: string) => {
    setState(prev => ({
      ...prev,
      isGenerating,
      generationStatus: status || '',
    }));
  }, []);

  const setStreamingCode = useCallback((code: string) => {
    setState(prev => ({ ...prev, streamingCode: code }));
  }, []);

  const appendStreamingCode = useCallback((chunk: string) => {
    setState(prev => ({ ...prev, streamingCode: prev.streamingCode + chunk }));
  }, []);

  // File actions
  const setGeneratedFiles = useCallback((files: GeneratedFile[]) => {
    setState(prev => ({ ...prev, generatedFiles: files }));
  }, []);

  const selectFile = useCallback((fileName: string | null) => {
    setState(prev => ({ ...prev, selectedFile: fileName }));
  }, []);

  const updateFileContent = useCallback((fileName: string, content: string) => {
    setState(prev => ({
      ...prev,
      generatedFiles: prev.generatedFiles.map(f =>
        f.name === fileName ? { ...f, content } : f
      ),
    }));
  }, []);

  const setPreviewHtml = useCallback((html: string) => {
    setState(prev => ({ ...prev, previewHtml: html }));
  }, []);

  // UI actions
  const setActiveView = useCallback((view: 'preview' | 'code') => {
    setState(prev => ({ ...prev, activeView: view }));
  }, []);

  const setActiveDevice = useCallback((device: 'desktop' | 'tablet' | 'mobile') => {
    setState(prev => ({ ...prev, activeDevice: device }));
  }, []);

  const toggleTemplates = useCallback(() => {
    setState(prev => ({ ...prev, showTemplates: !prev.showTemplates }));
  }, []);

  const setSelectedCategory = useCallback((category: string) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  const refreshPreview = useCallback(() => {
    setState(prev => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
  }, []);

  // Complex actions
  const generateCode = useCallback(async () => {
    if (!state.input.trim() || state.isGenerating) return;

    const userMessage = state.input.trim();
    
    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Clear input and start generating
    setState(prev => ({
      ...prev,
      input: '',
      attachedFiles: [],
      isGenerating: true,
      generationStatus: 'Connecting...',
      streamingCode: '',
    }));

    // Add assistant placeholder
    addMessage({
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    });

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/canvas/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          attachments: state.attachedFiles,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('Generation failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullCode = '';
      let buffer = '';

      setState(prev => ({ ...prev, generationStatus: 'Generating...' }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const chunk = parsed.chunk || parsed.content || '';
              if (chunk) {
                fullCode += chunk;
                setState(prev => ({
                  ...prev,
                  streamingCode: fullCode,
                }));
                updateLastMessage(fullCode);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Process completed generation
      const files = extractFilesFromCode(fullCode);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generationStatus: '',
        generatedFiles: files.length > 0 ? files : [{ name: 'index.html', content: fullCode, language: 'html' }],
        selectedFile: files.length > 0 ? files[0].name : 'index.html',
        previewHtml: fullCode,
        messages: prev.messages.map((msg, idx) =>
          idx === prev.messages.length - 1 ? { ...msg, isStreaming: false } : msg
        ),
      }));

    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      
      console.error('Generation error:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generationStatus: '',
      }));
      updateLastMessage('Sorry, there was an error generating the code. Please try again.');
    }
  }, [state.input, state.attachedFiles, state.isGenerating, addMessage, updateLastMessage]);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(prev => ({
      ...prev,
      isGenerating: false,
      generationStatus: '',
    }));
  }, []);

  const applyTemplate = useCallback((template: Template) => {
    setState(prev => ({
      ...prev,
      input: template.prompt,
      showTemplates: false,
    }));
  }, []);

  const runPreview = useCallback(() => {
    const selectedFileContent = state.generatedFiles.find(f => f.name === state.selectedFile)?.content;
    if (selectedFileContent) {
      setState(prev => ({
        ...prev,
        previewHtml: selectedFileContent,
        refreshKey: prev.refreshKey + 1,
        activeView: 'preview',
      }));
    }
  }, [state.generatedFiles, state.selectedFile]);

  const downloadFiles = useCallback(() => {
    state.generatedFiles.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [state.generatedFiles]);

  return {
    state,
    actions: {
      setInput,
      addMessage,
      updateLastMessage,
      clearMessages,
      addAttachments,
      removeAttachment,
      setGenerating,
      setStreamingCode,
      appendStreamingCode,
      setGeneratedFiles,
      selectFile,
      updateFileContent,
      setPreviewHtml,
      setActiveView,
      setActiveDevice,
      toggleTemplates,
      setSelectedCategory,
      refreshPreview,
      generateCode,
      stopGeneration,
      applyTemplate,
      runPreview,
      downloadFiles,
    },
  };
}
