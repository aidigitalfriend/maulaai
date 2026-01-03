'use client';

import { BRAND_COLORS } from './constants';
import { useCanvasState } from './hooks/useCanvasState';

// Components
import ChatPanel from './components/ChatPanel';
import FileTree from './components/FileTree';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import PreviewPanel from './components/PreviewPanel';
import CodeEditor from './components/CodeEditor';

export default function CanvasWorkspace() {
  const { state, actions } = useCanvasState();

  // Get current file content for editor
  const currentFileContent = state.selectedFile
    ? state.generatedFiles.find(f => f.name === state.selectedFile)?.content || ''
    : state.streamingCode;

  // Handle file content change from editor
  const handleCodeChange = (newCode: string) => {
    if (state.selectedFile) {
      actions.updateFileContent(state.selectedFile, newCode);
    }
  };

  // Handle new file creation
  const handleNewFile = () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      actions.setGeneratedFiles([
        ...state.generatedFiles,
        { name: fileName, content: '', language: 'text' }
      ]);
      actions.selectFile(fileName);
    }
  };

  return (
    <div className={`h-screen flex flex-col ${BRAND_COLORS.bg}`}>
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <ChatPanel
          messages={state.messages}
          input={state.input}
          onInputChange={actions.setInput}
          onSend={actions.generateCode}
          attachedFiles={state.attachedFiles}
          onFileAttach={actions.addAttachments}
          onRemoveFile={actions.removeAttachment}
          isGenerating={state.isGenerating}
          showTemplates={state.showTemplates}
          onToggleTemplates={actions.toggleTemplates}
          selectedCategory={state.selectedCategory}
          onCategoryChange={actions.setSelectedCategory}
          onTemplateSelect={actions.applyTemplate}
          onClear={actions.clearMessages}
        />

        {/* Center Panel - Files */}
        <FileTree
          files={state.generatedFiles}
          selectedFile={state.selectedFile}
          onFileSelect={actions.selectFile}
          onNewFile={handleNewFile}
          onDownload={actions.downloadFiles}
        />

        {/* Right Panel - Editor/Preview */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <Toolbar
            activeView={state.activeView}
            onViewChange={actions.setActiveView}
            activeDevice={state.activeDevice}
            onDeviceChange={actions.setActiveDevice}
            onRefresh={actions.refreshPreview}
            onRunPreview={actions.runPreview}
            canRunPreview={state.generatedFiles.length > 0}
          />

          {/* Content Area */}
          <div className={`flex-1 ${BRAND_COLORS.bgCard} overflow-hidden`}>
            {state.activeView === 'preview' ? (
              <PreviewPanel
                htmlContent={state.previewHtml}
                device={state.activeDevice}
                refreshKey={state.refreshKey}
              />
            ) : (
              <CodeEditor
                code={currentFileContent}
                onChange={handleCodeChange}
                fileName={state.selectedFile}
              />
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        isGenerating={state.isGenerating}
        filesCount={state.generatedFiles.length}
        currentFile={state.selectedFile}
        generationStatus={state.generationStatus}
      />
    </div>
  );
}
