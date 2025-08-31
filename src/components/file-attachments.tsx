'use client';

import { useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  X, 
  Loader2,
  Upload
} from 'lucide-react';
import { useFileAttachments, type FileAttachment } from '@/hooks/use-file-attachments';
import { useToast } from '@/hooks/use-toast';

interface FileAttachmentsProps {
  onAttachmentsChange?: (attachments: FileAttachment[]) => void;
}

export function FileAttachments({ onAttachmentsChange }: FileAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const {
    attachments,
    isProcessing,
    addAttachment,
    removeAttachment,
    clearAttachments
  } = useFileAttachments();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const maxSize = 50 * 1024 * 1024; // 50MB limit
    const supportedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ];

    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 50MB limit`,
          variant: "destructive"
        });
        continue;
      }

      if (!supportedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not supported. Use PDF, images, or videos.`,
          variant: "destructive"
        });
        continue;
      }

      try {
        const attachment = await addAttachment(file);
        toast({
          title: "File attached",
          description: `${file.name} has been added to your message`
        });
      } catch (error) {
        toast({
          title: "Attachment failed",
          description: `Could not attach ${file.name}`,
          variant: "destructive"
        });
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    onAttachmentsChange?.(attachments);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {/* Attachment Button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4 mr-2" />
          )}
          Attach Files
        </Button>
        
        {attachments.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAttachments}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg border"
            >
              <div className="flex-shrink-0">
                {getFileIcon(attachment.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {attachment.name}
                  </span>
                  {!attachment.processed && (
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  )}
                  {attachment.processed && (
                    <Badge variant="secondary" className="text-xs">
                      Processed
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(attachment.id)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        Supported: PDF, Images (JPG, PNG, GIF, WebP), Videos (MP4, WebM, MOV) • Max 50MB per file
      </p>
    </div>
  );
}