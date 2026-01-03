// =============================================================================
// CANVAS UTILS - Helper functions
// =============================================================================

import { GeneratedFile } from './types';

/**
 * Extract files from generated HTML code
 */
export function extractFilesFromCode(code: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  
  // Main HTML file
  if (code.includes('<html') || code.includes('<!DOCTYPE')) {
    files.push({
      id: 'f-html',
      name: 'index.html',
      path: '/index.html',
      type: 'html',
      content: code,
      size: new Blob([code]).size,
    });
  }

  // Extract inline CSS
  const styleMatches = code.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (styleMatches && styleMatches.length > 0) {
    const cssContent = styleMatches.map(m => m.replace(/<\/?style[^>]*>/gi, '')).join('\n');
    if (cssContent.trim().length > 50) {
      files.push({
        id: 'f-css',
        name: 'styles.css',
        path: '/styles.css',
        type: 'css',
        content: cssContent.trim(),
        size: new Blob([cssContent]).size,
      });
    }
  }

  // Extract inline JS
  const scriptMatches = code.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi);
  if (scriptMatches && scriptMatches.length > 0) {
    const jsContent = scriptMatches.map(m => m.replace(/<\/?script[^>]*>/gi, '')).join('\n');
    if (jsContent.trim().length > 50) {
      files.push({
        id: 'f-js',
        name: 'script.js',
        path: '/script.js',
        type: 'js',
        content: jsContent.trim(),
        size: new Blob([jsContent]).size,
      });
    }
  }

  return files;
}

/**
 * Get file language for Monaco Editor
 */
export function getFileLanguage(fileType: string): string {
  switch (fileType) {
    case 'css': return 'css';
    case 'js': return 'javascript';
    case 'tsx': return 'typescript';
    case 'json': return 'json';
    default: return 'html';
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
