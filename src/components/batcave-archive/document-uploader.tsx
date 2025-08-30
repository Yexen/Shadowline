'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  File, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  processed: boolean;
  chunks: number;
  content?: string;
  processing?: boolean;
  error?: string;
}

interface DocumentUploaderProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DocumentUploader({ 
  documents, 
  setDocuments, 
  isProcessing, 
  setIsProcessing 
}: DocumentUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    
    for (const file of acceptedFiles) {
      const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Add document to list immediately
      const newDoc: Document = {
        id: docId,
        name: file.name,
        type: file.type || 'unknown',
        size: file.size,
        uploadedAt: new Date(),
        processed: false,
        chunks: 0,
        processing: true
      };
      
      setDocuments(prev => [...prev, newDoc]);
      
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [docId]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Process the document
        await processDocument(file, docId);
        
        // Update document as processed
        setDocuments(prev => prev.map(doc => 
          doc.id === docId 
            ? { 
                ...doc, 
                processed: true, 
                processing: false, 
                chunks: Math.floor(Math.random() * 50) + 10,
                content: `Processed content from ${file.name}`
              }
            : doc
        ));
        
        toast({
          title: "Document Processed",
          description: `${file.name} has been successfully analyzed and indexed.`
        });
        
      } catch (error) {
        // Update document with error
        setDocuments(prev => prev.map(doc => 
          doc.id === docId 
            ? { 
                ...doc, 
                processing: false, 
                error: error instanceof Error ? error.message : 'Processing failed'
              }
            : doc
        ));
        
        toast({
          title: "Processing Failed",
          description: `Failed to process ${file.name}`,
          variant: "destructive"
        });
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[docId];
          return newProgress;
        });
      }
    }
    
    setIsProcessing(false);
  }, [setDocuments, setIsProcessing, toast]);

  const processDocument = async (file: File, docId: string): Promise<void> => {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docId', docId);

    // Simulate API call for document processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would:
    // 1. Upload file to server
    // 2. Extract text content (PDF, Word, etc.)
    // 3. Perform OCR if needed
    // 4. Chunk the content
    // 5. Generate embeddings
    // 6. Store in vector database
    
    if (Math.random() > 0.9) {
      throw new Error('Random processing error for demo');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/rtf': ['.rtf']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: isProcessing
  });

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast({
      title: "Document Deleted",
      description: "Document removed from archive."
    });
  };

  const retryProcessing = async (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    setDocuments(prev => prev.map(d => 
      d.id === docId 
        ? { ...d, processing: true, error: undefined }
        : d
    ));

    try {
      // Simulate file recreation for retry
      const blob = new Blob([doc.content || ''], { type: 'text/plain' });
      const file = new File([blob], doc.name, { type: doc.type });
      
      await processDocument(file, docId);
      
      setDocuments(prev => prev.map(d => 
        d.id === docId 
          ? { 
              ...d, 
              processed: true, 
              processing: false, 
              chunks: Math.floor(Math.random() * 50) + 10 
            }
          : d
      ));
      
      toast({
        title: "Processing Successful",
        description: `${doc.name} has been processed successfully.`
      });
      
    } catch (error) {
      setDocuments(prev => prev.map(d => 
        d.id === docId 
          ? { 
              ...d, 
              processing: false, 
              error: error instanceof Error ? error.message : 'Processing failed'
            }
          : d
      ));
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <File className="w-5 h-5 text-red-500" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (type.includes('text')) return <FileText className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Documents
          </CardTitle>
          <CardDescription>
            Upload PDFs, Word documents, or text files for AI analysis. Maximum 50MB per file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <>
                <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, Word, Text, Markdown files
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Library ({documents.length})
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/api/batcave/export-documents', '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(doc.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{doc.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {(doc.size / 1024 / 1024).toFixed(1)} MB • {doc.uploadedAt.toLocaleDateString()}
                        {doc.processed && ` • ${doc.chunks} chunks`}
                      </div>
                      
                      {/* Upload Progress */}
                      {uploadProgress[doc.id] !== undefined && (
                        <div className="mt-2">
                          <Progress value={uploadProgress[doc.id]} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            Uploading... {uploadProgress[doc.id]}%
                          </div>
                        </div>
                      )}
                      
                      {/* Processing Status */}
                      {doc.processing && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-blue-600">Processing document...</span>
                        </div>
                      )}
                      
                      {/* Error Status */}
                      {doc.error && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>{doc.error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {doc.processed && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Processed
                      </Badge>
                    )}
                    {doc.processing && (
                      <Badge variant="secondary">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Processing
                      </Badge>
                    )}
                    {doc.error && (
                      <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Error
                      </Badge>
                    )}
                    
                    {/* Action Buttons */}
                    {doc.processed && (
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    )}
                    
                    {doc.error && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => retryProcessing(doc.id)}
                      >
                        Retry
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deleteDocument(doc.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}