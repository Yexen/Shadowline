'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Upload, 
  Search, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Clock, 
  Mic,
  Download,
  Brain,
  Network,
  Play,
  Pause,
  Volume2,
  FileAudio,
  Eye,
  Zap,
  Database
} from 'lucide-react';
import { DocumentUploader } from '@/components/batcave-archive/document-uploader';
import { ChatInterface } from '@/components/batcave-archive/chat-interface';
import { CharacterMap } from '@/components/batcave-archive/character-map';
import { ThemeAnalysis } from '@/components/batcave-archive/theme-analysis';
import { AudioGenerator } from '@/components/batcave-archive/audio-generator';
import { MindMapViewer } from '@/components/batcave-archive/mind-map-viewer';
import { InteractiveTimeline } from '@/components/batcave-archive/interactive-timeline';
import { SearchInterface } from '@/components/batcave-archive/search-interface';
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
}

interface AnalysisResult {
  id: string;
  type: 'qa' | 'character' | 'theme' | 'timeline' | 'connection';
  title: string;
  content: any;
  sources: string[];
  createdAt: Date;
}

interface AudioContent {
  id: string;
  title: string;
  type: 'podcast' | 'summary' | 'character';
  duration: number;
  url: string;
  transcript?: string;
  createdAt: Date;
}

export default function BatcaveArchivePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [audioContent, setAudioContent] = useState<AudioContent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    // Simulate existing documents
    setDocuments([
      {
        id: '1',
        name: 'Joker Character Bible.pdf',
        type: 'pdf',
        size: 2048000,
        uploadedAt: new Date('2024-01-15'),
        processed: true,
        chunks: 45,
        content: 'Detailed character analysis of the Joker...'
      },
      {
        id: '2', 
        name: 'Gotham City Locations.docx',
        type: 'docx',
        size: 1024000,
        uploadedAt: new Date('2024-01-16'),
        processed: true,
        chunks: 32
      },
      {
        id: '3',
        name: 'Batman Timeline.txt',
        type: 'txt',
        size: 512000,
        uploadedAt: new Date('2024-01-17'),
        processed: false,
        chunks: 0
      }
    ]);

    // Simulate existing analyses
    setAnalyses([
      {
        id: '1',
        type: 'character',
        title: 'Character Relationship Analysis',
        content: { relationships: [], centralCharacters: [] },
        sources: ['Joker Character Bible.pdf', 'Gotham City Locations.docx'],
        createdAt: new Date('2024-01-18')
      }
    ]);

    // Simulate audio content
    setAudioContent([
      {
        id: '1',
        title: 'Joker Psychology Deep Dive',
        type: 'podcast',
        duration: 1847, // seconds
        url: '/audio/joker-analysis.mp3',
        transcript: 'In this episode, we explore the complex psychology...',
        createdAt: new Date('2024-01-19')
      }
    ]);
  }, []);

  const stats = {
    totalDocuments: documents.length,
    processedDocuments: documents.filter(d => d.processed).length,
    totalChunks: documents.reduce((sum, d) => sum + d.chunks, 0),
    totalAnalyses: analyses.length,
    audioHours: Math.floor(audioContent.reduce((sum, a) => sum + a.duration, 0) / 3600)
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-headline">Batcave Archive</h1>
            <p className="text-muted-foreground">
              AI-powered analysis and exploration of your story universe
            </p>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.processedDocuments}</div>
              <div className="text-sm text-muted-foreground">Processed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
              <div className="text-sm text-muted-foreground">Analyses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FileAudio className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{audioContent.length}</div>
              <div className="text-sm text-muted-foreground">Audio</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.audioHours}h</div>
              <div className="text-sm text-muted-foreground">Audio Content</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Q&A Chat
          </TabsTrigger>
          <TabsTrigger value="characters" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Characters
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Themes
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...analyses, ...audioContent].slice(0, 5).map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {'type' in item && item.type === 'character' && <Users className="w-4 h-4 text-blue-500" />}
                      {'type' in item && item.type === 'podcast' && <Mic className="w-4 h-4 text-green-500" />}
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('documents')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Document
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('chat')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Q&A Session
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('audio')}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Generate Audio Content
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('characters')}
                >
                  <Network className="w-4 h-4 mr-2" />
                  Analyze Relationships
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Documents Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {(doc.size / 1024 / 1024).toFixed(1)} MB • {doc.chunks} chunks
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={doc.processed ? "default" : "secondary"}>
                        {doc.processed ? "Processed" : "Pending"}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <DocumentUploader 
            documents={documents}
            setDocuments={setDocuments}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        </TabsContent>

        {/* Q&A Chat Tab */}
        <TabsContent value="chat">
          <ChatInterface 
            documents={documents.filter(d => d.processed)}
          />
        </TabsContent>

        {/* Characters Tab */}
        <TabsContent value="characters">
          <div className="space-y-6">
            <CharacterMap documents={documents.filter(d => d.processed)} />
            <MindMapViewer />
          </div>
        </TabsContent>

        {/* Themes Tab */}
        <TabsContent value="themes">
          <ThemeAnalysis documents={documents.filter(d => d.processed)} />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <InteractiveTimeline documents={documents.filter(d => d.processed)} />
        </TabsContent>

        {/* Audio Tab */}
        <TabsContent value="audio">
          <AudioGenerator 
            documents={documents.filter(d => d.processed)}
            audioContent={audioContent}
            setAudioContent={setAudioContent}
          />
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search">
          <SearchInterface 
            documents={documents.filter(d => d.processed)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}