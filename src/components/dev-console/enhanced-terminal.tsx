'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Terminal, Play, Square, RotateCcw } from 'lucide-react';

// ANSI color mapping for terminal output
const ansiToClass = (text: string): string => {
  return text
    .replace(/\x1b\[31m(.*?)\x1b\[0m/g, '<span class="text-red-400">$1</span>')      // Red
    .replace(/\x1b\[32m(.*?)\x1b\[0m/g, '<span class="text-green-400">$1</span>')    // Green
    .replace(/\x1b\[33m(.*?)\x1b\[0m/g, '<span class="text-yellow-400">$1</span>')   // Yellow
    .replace(/\x1b\[34m(.*?)\x1b\[0m/g, '<span class="text-blue-400">$1</span>')     // Blue
    .replace(/\x1b\[35m(.*?)\x1b\[0m/g, '<span class="text-purple-400">$1</span>')   // Magenta
    .replace(/\x1b\[36m(.*?)\x1b\[0m/g, '<span class="text-cyan-400">$1</span>')     // Cyan
    .replace(/\x1b\[37m(.*?)\x1b\[0m/g, '<span class="text-white">$1</span>')        // White
    .replace(/\x1b\[90m(.*?)\x1b\[0m/g, '<span class="text-gray-500">$1</span>')     // Gray
    .replace(/\x1b\[1m(.*?)\x1b\[0m/g, '<span class="font-bold">$1</span>')          // Bold
    .replace(/\x1b\[4m(.*?)\x1b\[0m/g, '<span class="underline">$1</span>')          // Underline
    .replace(/\x1b\[0m/g, '')  // Reset codes
    .replace(/\x1b\[\d+m/g, ''); // Other codes
};

// Syntax highlighting for common commands and patterns
const highlightCommand = (text: string): string => {
  if (!text.startsWith('❯ ')) return ansiToClass(text);
  
  const command = text.slice(2); // Remove '❯ '
  let highlighted = command;
  
  // Command highlighting patterns
  const patterns = [
    // Git commands
    { pattern: /^(git)\s+/, replacement: '<span class="text-orange-400 font-semibold">$1</span> ' },
    { pattern: /\s(add|commit|push|pull|merge|branch|checkout|status|log|diff)\b/g, replacement: ' <span class="text-blue-400">$1</span>' },
    
    // NPM/Node commands  
    { pattern: /^(npm|node|yarn|pnpm)\s+/, replacement: '<span class="text-green-400 font-semibold">$1</span> ' },
    { pattern: /\s(install|build|dev|start|test|run)\b/g, replacement: ' <span class="text-emerald-400">$1</span>' },
    
    // File system commands
    { pattern: /^(ls|cat|cd|pwd|mkdir|rm|cp|mv|find|grep|tree|which|whereis)\s*/, replacement: '<span class="text-yellow-400 font-semibold">$1</span> ' },
    
    // System commands
    { pattern: /^(ps|top|kill|sudo|chmod|chown|curl|wget|ping|ssh)\s*/, replacement: '<span class="text-red-400 font-semibold">$1</span> ' },
    
    // Docker/Container commands
    { pattern: /^(docker|kubectl|helm)\s+/, replacement: '<span class="text-blue-500 font-semibold">$1</span> ' },
    
    // File paths
    { pattern: /(\/[^\s]*)/g, replacement: '<span class="text-cyan-300">$1</span>' },
    
    // Flags and options
    { pattern: /(\s-+[a-zA-Z0-9-]+)/g, replacement: '<span class="text-purple-400">$1</span>' },
    
    // URLs
    { pattern: /(https?:\/\/[^\s]+)/g, replacement: '<span class="text-blue-300 underline">$1</span>' },
  ];
  
  patterns.forEach(({ pattern, replacement }) => {
    highlighted = highlighted.replace(pattern, replacement);
  });
  
  return `<span class="text-gray-400">❯</span> ${highlighted}`;
};

interface TerminalOutput {
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: number;
}

interface EnhancedTerminalProps {
  onCommand?: (command: string) => Promise<string>;
  height?: string;
  className?: string;
}

export interface EnhancedTerminalHandle {
  executeCommand: (command: string) => Promise<void>;
  addOutput: (content: string, type?: 'output' | 'error') => void;
  clear: () => void;
}

export const EnhancedTerminal = forwardRef<EnhancedTerminalHandle, EnhancedTerminalProps>(
  ({ onCommand, height = 'h-[420px]', className = '' }, ref) => {
    const [history, setHistory] = useState<TerminalOutput[]>([
      {
        type: 'output',
        content: '🦇 Bat Computer Enhanced Terminal v2.0\nType "help" for available commands, or use arrow keys for history.',
        timestamp: Date.now(),
      },
    ]);
    const [currentCommand, setCurrentCommand] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isExecuting, setIsExecuting] = useState(false);
    const terminalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, [history]);

    // Focus input when terminal is clicked
    const handleTerminalClick = () => {
      inputRef.current?.focus();
    };

    // Handle command execution
    const executeCommand = async (command: string) => {
      if (!command.trim() || isExecuting) return;
      
      setIsExecuting(true);
      
      // Add command to history
      const commandEntry: TerminalOutput = {
        type: 'command',
        content: command.trim(),
        timestamp: Date.now(),
      };
      
      setHistory(prev => [...prev, commandEntry]);
      setCommandHistory(prev => {
        const newHistory = [command.trim(), ...prev.filter(c => c !== command.trim())];
        return newHistory.slice(0, 50); // Keep last 50 commands
      });
      setHistoryIndex(-1);
      setCurrentCommand('');

      try {
        let output = '';
        if (onCommand) {
          output = await onCommand(command.trim());
        } else {
          output = `Command executed: ${command.trim()}`;
        }

        const outputEntry: TerminalOutput = {
          type: 'output',
          content: output,
          timestamp: Date.now(),
        };
        
        setHistory(prev => [...prev, outputEntry]);
      } catch (error: any) {
        const errorEntry: TerminalOutput = {
          type: 'error',
          content: `Error: ${error.message || 'Command failed'}`,
          timestamp: Date.now(),
        };
        
        setHistory(prev => [...prev, errorEntry]);
      } finally {
        setIsExecuting(false);
      }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !isExecuting) {
        executeCommand(currentCommand);
      } else if (e.key === 'ArrowUp' && commandHistory.length > 0) {
        e.preventDefault();
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex] || '');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex] || '');
        } else {
          setHistoryIndex(-1);
          setCurrentCommand('');
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // TODO: Add command completion
      }
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      executeCommand,
      addOutput: (content: string, type: 'output' | 'error' = 'output') => {
        const entry: TerminalOutput = { type, content, timestamp: Date.now() };
        setHistory(prev => [...prev, entry]);
      },
      clear: () => {
        setHistory([{
          type: 'output',
          content: '🦇 Bat Computer Enhanced Terminal v2.0\nTerminal cleared.',
          timestamp: Date.now(),
        }]);
      },
    }));

    const clearTerminal = () => {
      setHistory([{
        type: 'output',
        content: '🦇 Bat Computer Enhanced Terminal v2.0\nTerminal cleared.',
        timestamp: Date.now(),
      }]);
    };

    const renderContent = (entry: TerminalOutput) => {
      let content = entry.content;
      
      if (entry.type === 'command') {
        return (
          <div
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightCommand(`❯ ${content}`) }}
          />
        );
      }
      
      // Apply ANSI color codes and basic formatting for output
      const processed = ansiToClass(content)
        .replace(/✓/g, '<span class="text-green-400">✓</span>')
        .replace(/✗|❌/g, '<span class="text-red-400">✗</span>')
        .replace(/⚠️/g, '<span class="text-yellow-400">⚠️</span>')
        .replace(/🔨/g, '<span class="text-blue-400">🔨</span>')
        .replace(/🚀/g, '<span class="text-purple-400">🚀</span>')
        .replace(/🌐/g, '<span class="text-cyan-400">🌐</span>');
      
      return (
        <div
          className={`leading-relaxed ${
            entry.type === 'error' ? 'text-red-400' : 'text-gray-300'
          }`}
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    };

    return (
      <div className={`flex flex-col ${className}`}>
        {/* Terminal header */}
        <div className="flex items-center justify-between px-3 py-2 bg-black/60 border-b border-white/10">
          <div className="flex items-center gap-2 text-amber-400">
            <Terminal className="w-4 h-4" />
            <span className="text-sm font-medium">Enhanced Terminal</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={clearTerminal}
              className="h-7 w-7 p-0 text-gray-400 hover:text-amber-400"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand(currentCommand)}
              disabled={isExecuting || !currentCommand.trim()}
              className="h-7 w-7 p-0 text-gray-400 hover:text-green-400"
            >
              {isExecuting ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Terminal output */}
        <div
          ref={terminalRef}
          onClick={handleTerminalClick}
          className={`${height} overflow-auto bg-black/40 p-3 font-mono text-sm cursor-text`}
        >
          {history.map((entry, index) => (
            <div key={`${entry.timestamp}-${index}`} className="mb-2">
              {renderContent(entry)}
            </div>
          ))}
          
          {/* Current command line */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-amber-400 font-semibold">❯</span>
            <Input
              ref={inputRef}
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting}
              placeholder={isExecuting ? "Executing command..." : "Enter command..."}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 font-mono text-sm p-0"
            />
            {isExecuting && (
              <div className="flex items-center gap-1 text-amber-400">
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span className="text-xs">Running...</span>
              </div>
            )}
          </div>
        </div>

        {/* Terminal status */}
        <div className="px-3 py-1 bg-black/40 border-t border-white/10 text-xs text-gray-500">
          History: {commandHistory.length} commands | 
          Status: {isExecuting ? 'Executing...' : 'Ready'} |
          Tip: Use ↑/↓ arrows for command history
        </div>
      </div>
    );
  }
);