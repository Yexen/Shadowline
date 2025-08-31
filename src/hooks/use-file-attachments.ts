'use client';

import { useState } from 'react';

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  file: File;
  processed?: boolean;
  extractedText?: string;
}

export function useFileAttachments() {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addAttachment = async (file: File): Promise<FileAttachment> => {
    const attachment: FileAttachment = {
      id: `attachment_${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      file,
      processed: false
    };

    setAttachments(prev => [...prev, attachment]);

    // Process the file based on type
    if (file.type.startsWith('image/')) {
      await processImage(attachment);
    } else if (file.type === 'application/pdf') {
      await processPDF(attachment);
    } else if (file.type.startsWith('video/')) {
      await processVideo(attachment);
    }

    return attachment;
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === attachmentId);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== attachmentId);
    });
  };

  const processImage = async (attachment: FileAttachment) => {
    // For images, we'll just mark as processed
    // In a real app, you might want to extract EXIF data or run OCR
    setAttachments(prev =>
      prev.map(a =>
        a.id === attachment.id
          ? { ...a, processed: true, extractedText: `Image: ${a.name}` }
          : a
      )
    );
  };

  const processPDF = async (attachment: FileAttachment) => {
    setIsProcessing(true);
    
    try {
      // For now, we'll use a simple text extraction placeholder
      // In production, you'd use a library like pdf-parse or send to server
      const extractedText = `PDF content from ${attachment.name} would be extracted here using a PDF library.`;
      
      setAttachments(prev =>
        prev.map(a =>
          a.id === attachment.id
            ? { ...a, processed: true, extractedText }
            : a
        )
      );
    } catch (error) {
      console.error('PDF processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processVideo = async (attachment: FileAttachment) => {
    // For videos, we might extract thumbnails or metadata
    // This is a placeholder for video processing
    setAttachments(prev =>
      prev.map(a =>
        a.id === attachment.id
          ? { 
              ...a, 
              processed: true, 
              extractedText: `Video: ${a.name} - Duration and metadata would be extracted here.` 
            }
          : a
      )
    );
  };

  const clearAttachments = () => {
    attachments.forEach(attachment => {
      URL.revokeObjectURL(attachment.url);
    });
    setAttachments([]);
  };

  const getAttachmentsContext = (): string => {
    const processedAttachments = attachments.filter(a => a.processed && a.extractedText);
    
    if (processedAttachments.length === 0) return '';
    
    return `\n\nATTACHED FILES:\n${processedAttachments
      .map(a => `- ${a.name}: ${a.extractedText}`)
      .join('\n')}\n\nPlease consider the attached files in your response.`;
  };

  return {
    attachments,
    isProcessing,
    addAttachment,
    removeAttachment,
    clearAttachments,
    getAttachmentsContext
  };
}