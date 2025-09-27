'use client';

import { ChevronRight, Home, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface PathBreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function PathBreadcrumb({ path, onNavigate }: PathBreadcrumbProps) {
  const [copied, setCopied] = useState(false);

  // Split path into segments, filtering out empty strings
  const segments = path.split('/').filter(Boolean);

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy path:', err);
    }
  };

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-6 px-1">
      {/* Root / home */}
      <button
        onClick={() => onNavigate('/')}
        className="hover:text-foreground transition-colors p-1 rounded hover:bg-muted/50"
        title="Root"
      >
        <Home className="w-4 h-4" />
      </button>

      {segments.length > 0 && <ChevronRight className="w-3 h-3" />}

      {/* Path segments */}
      {segments.map((segment, index) => {
        const segmentPath = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;

        return (
          <div key={segmentPath} className="flex items-center gap-1">
            <button
              onClick={() => onNavigate(segmentPath)}
              className={`hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/50 ${
                isLast ? 'text-foreground font-medium' : ''
              }`}
            >
              {segment}
            </button>
            {!isLast && <ChevronRight className="w-3 h-3" />}
          </div>
        );
      })}

      {/* Copy Path Button */}
      <button
        onClick={handleCopyPath}
        className="ml-2 p-1 hover:bg-muted/50 rounded transition-colors"
        title="Copy path"
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-500" />
        ) : (
          <Copy className="w-3 h-3 hover:text-foreground" />
        )}
      </button>
    </div>
  );
}