'use client';

import { useEffect, useRef, useState } from 'react';
import { Editor, loader, Monaco } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Save, 
  Play, 
  GitCommitVertical, 
  FileText,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';

// Configure Monaco loader
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
  }
});

interface MonacoCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  path?: string;
  onSave?: () => void;
  onPreview?: () => void;
  onCommit?: () => void;
  readOnly?: boolean;
  height?: string;
  unsaved?: boolean;
  busy?: boolean;
}

export function MonacoCodeEditor({
  value,
  onChange,
  language = 'typescript',
  path = '',
  onSave,
  onPreview,
  onCommit,
  readOnly = false,
  height = '400px',
  unsaved = false,
  busy = false,
}: MonacoCodeEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState<'vs-dark' | 'batman'>('batman');

  // Auto-detect language from file extension
  const detectLanguage = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'json': 'json',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'dockerfile': 'dockerfile',
      'go': 'go',
      'rust': 'rust',
      'php': 'php',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
    };
    return langMap[ext || ''] || 'plaintext';
  };

  const currentLanguage = path ? detectLanguage(path) : language;

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom Batman theme
    monaco.editor.defineTheme('batman', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'F59E0B', fontStyle: 'bold' },
        { token: 'string', foreground: '10B981' },
        { token: 'number', foreground: 'F97316' },
        { token: 'operator', foreground: 'EF4444' },
        { token: 'type', foreground: '8B5CF6' },
        { token: 'function', foreground: '06B6D4' },
        { token: 'variable', foreground: 'E5E7EB' },
        { token: 'constant', foreground: 'F59E0B', fontStyle: 'bold' },
        { token: 'class', foreground: 'F59E0B', fontStyle: 'bold' },
        { token: 'interface', foreground: '8B5CF6', fontStyle: 'bold' },
        { token: 'namespace', foreground: 'F97316' },
      ],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.foreground': '#e5e7eb',
        'editor.lineHighlightBackground': '#1f2937',
        'editor.selectionBackground': '#374151',
        'editor.cursor': '#f59e0b',
        'editorLineNumber.foreground': '#6b7280',
        'editorLineNumber.activeForeground': '#f59e0b',
        'scrollbar.shadow': '#000000',
        'scrollbarSlider.background': '#374151',
        'scrollbarSlider.hoverBackground': '#4b5563',
        'scrollbarSlider.activeBackground': '#6b7280',
      },
    });

    // Set custom theme
    monaco.editor.setTheme('batman');

    // Configure editor
    editor.updateOptions({
      fontSize,
      lineHeight: 22,
      letterSpacing: 0.5,
      fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", "Monaco", "Inconsolata", "Fira Code", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace',
      fontLigatures: true,
      minimap: { enabled: true, scale: 0.5 },
      bracketPairColorization: { enabled: true },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      formatOnPaste: true,
      formatOnType: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      foldingHighlight: true,
      showFoldingControls: 'always',
      matchBrackets: 'always',
      renderWhitespace: 'selection',
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.F5, () => {
      onPreview?.();
    });
  };

  // Handle value changes
  const handleEditorChange = (newValue: string | undefined) => {
    onChange(newValue || '');
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Adjust font size
  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(10, Math.min(24, fontSize + delta));
    setFontSize(newSize);
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: newSize });
    }
  };

  const formatDocument = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}>
      {/* Editor Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/60 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <Input
            value={path}
            onChange={(e) => {/* Path is controlled by parent */}}
            placeholder="No file open..."
            className="bg-transparent border-none text-sm max-w-xs"
            readOnly
          />
          {unsaved && (
            <span className="text-orange-400 text-sm">● Unsaved</span>
          )}
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
            {currentLanguage}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Font size controls */}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <button
              onClick={() => adjustFontSize(-1)}
              className="hover:text-amber-400 px-1"
            >
              A-
            </button>
            <span className="px-1">{fontSize}px</span>
            <button
              onClick={() => adjustFontSize(1)}
              className="hover:text-amber-400 px-1"
            >
              A+
            </button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={formatDocument}
            className="h-7 px-2 text-gray-400 hover:text-amber-400"
          >
            <Settings className="w-3 h-3" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onPreview}
            disabled={busy}
            className="h-7 px-2 text-gray-400 hover:text-blue-400"
          >
            <Play className="w-3 h-3" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onSave}
            disabled={!unsaved || !path || busy}
            className="h-7 px-2 text-gray-400 hover:text-green-400"
          >
            <Save className="w-3 h-3" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onCommit}
            disabled={busy}
            className="h-7 px-2 text-gray-400 hover:text-purple-400"
          >
            <GitCommitVertical className="w-3 h-3" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-7 px-2 text-gray-400 hover:text-amber-400"
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative">
        <Editor
          height={isFullscreen ? 'calc(100vh - 120px)' : height}
          language={currentLanguage}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="batman"
          options={{
            readOnly,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
          }}
          loading={
            <div className="flex items-center justify-center h-64 text-amber-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Loading Monaco Editor...
              </div>
            </div>
          }
        />
      </div>

      {/* Editor Footer */}
      <div className="px-3 py-1 bg-black/40 border-t border-white/10 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Language: {currentLanguage}</span>
          <span>Theme: Batman</span>
          <span>Font: {fontSize}px</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Shortcuts: Ctrl+S (Save), Ctrl+F5 (Preview)</span>
          {busy && (
            <div className="flex items-center gap-1 text-amber-400">
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              Processing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}