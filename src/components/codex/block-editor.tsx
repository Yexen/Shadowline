'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface Block {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bullet' | 'numbered';
  content: string;
}

interface BlockEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
  onMention?: (query: string) => Promise<string[]>;
  onTag?: (query: string) => Promise<string[]>;
}

export function BlockEditor({
  initialContent = '',
  onChange,
  onMention,
  onTag
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'paragraph', content: initialContent || '' }
  ]);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [showPlusButton, setShowPlusButton] = useState<string | null>(null);

  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Convert blocks to markdown-like text
  const blocksToText = (blocks: Block[]) => {
    return blocks
      .map(block => {
        switch (block.type) {
          case 'heading1': return `# ${block.content}`;
          case 'heading2': return `## ${block.content}`;
          case 'heading3': return `### ${block.content}`;
          case 'bullet': return `- ${block.content}`;
          case 'numbered': return `1. ${block.content}`;
          default: return block.content;
        }
      })
      .join('\n\n');
  };

  // Parse text and detect block type from content
  const parseBlockType = (content: string): Block['type'] => {
    if (content.startsWith('# ')) return 'heading1';
    if (content.startsWith('## ')) return 'heading2';
    if (content.startsWith('### ')) return 'heading3';
    if (content.startsWith('- ') || content.startsWith('* ')) return 'bullet';
    if (/^\d+\.\s/.test(content)) return 'numbered';
    return 'paragraph';
  };

  // Clean content based on type
  const cleanContent = (content: string, type: Block['type']) => {
    switch (type) {
      case 'heading1': return content.replace(/^# /, '');
      case 'heading2': return content.replace(/^## /, '');
      case 'heading3': return content.replace(/^### /, '');
      case 'bullet': return content.replace(/^[-*] /, '');
      case 'numbered': return content.replace(/^\d+\.\s/, '');
      default: return content;
    }
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(prev => {
      const newBlocks = prev.map(block => {
        if (block.id === id) {
          const newType = parseBlockType(content);
          const cleanedContent = cleanContent(content, newType);
          return { ...block, type: newType, content: cleanedContent };
        }
        return block;
      });

      // Update parent component
      onChange(blocksToText(newBlocks));
      return newBlocks;
    });
  };

  const addBlock = (afterId: string) => {
    const newId = Date.now().toString();
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === afterId);
      const newBlocks = [...prev];
      newBlocks.splice(index + 1, 0, {
        id: newId,
        type: 'paragraph',
        content: ''
      });
      return newBlocks;
    });

    // Focus the new block
    setTimeout(() => {
      const newBlockEl = blockRefs.current.get(newId);
      if (newBlockEl) {
        newBlockEl.focus();
        setFocusedBlockId(newId);
      }
    }, 0);
  };

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) return; // Don't delete the last block

    setBlocks(prev => {
      const newBlocks = prev.filter(b => b.id !== id);
      onChange(blocksToText(newBlocks));
      return newBlocks;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBlock(blockId);
    } else if (e.key === 'Backspace') {
      const block = blocks.find(b => b.id === blockId);
      if (block && block.content === '') {
        e.preventDefault();
        deleteBlock(blockId);
      }
    }
  };

  const getBlockClassName = (type: Block['type']) => {
    switch (type) {
      case 'heading1': return 'text-3xl font-bold';
      case 'heading2': return 'text-2xl font-semibold';
      case 'heading3': return 'text-xl font-medium';
      case 'bullet': return 'text-base';
      case 'numbered': return 'text-base';
      default: return 'text-base';
    }
  };

  const getBlockPlaceholder = (type: Block['type']) => {
    switch (type) {
      case 'heading1': return 'Heading 1';
      case 'heading2': return 'Heading 2';
      case 'heading3': return 'Heading 3';
      case 'bullet': return 'Bulleted list';
      case 'numbered': return 'Numbered list';
      default: return 'Type / for commands, @ to mention, # to tag';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {blocks.map((block, index) => (
        <div
          key={block.id}
          className="group relative"
          onMouseEnter={() => setShowPlusButton(block.id)}
          onMouseLeave={() => setShowPlusButton(null)}
        >
          {/* Plus button */}
          {showPlusButton === block.id && (
            <button
              onClick={() => addBlock(block.id)}
              className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {/* Block content */}
          <div
            ref={(el) => {
              if (el) blockRefs.current.set(block.id, el);
            }}
            contentEditable
            suppressContentEditableWarning
            className={`
              outline-none py-2 px-1 rounded-sm
              hover:bg-muted/30 focus:bg-muted/50 transition-colors
              ${getBlockClassName(block.type)}
              ${focusedBlockId === block.id ? 'bg-muted/50' : ''}
            `}
            placeholder={getBlockPlaceholder(block.type)}
            onInput={(e) => {
              const content = e.currentTarget.textContent || '';
              updateBlock(block.id, content);
            }}
            onFocus={() => setFocusedBlockId(block.id)}
            onBlur={() => setFocusedBlockId(null)}
            onKeyDown={(e) => handleKeyDown(e, block.id)}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />

          {/* Block indicator */}
          {block.type !== 'paragraph' && (
            <div className="absolute -left-12 top-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {block.type === 'bullet' && '•'}
              {block.type === 'numbered' && `${index + 1}.`}
              {block.type.startsWith('heading') && '#'.repeat(parseInt(block.type.slice(-1)))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}