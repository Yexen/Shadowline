'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Mic, 
  Play, 
  Pause, 
  Square,
  Download, 
  Volume2,
  VolumeX,
  Clock,
  FileAudio,
  Users,
  Zap,
  RefreshCw,
  Loader2,
  Settings,
  Waveform
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  processed: boolean;
}

interface AudioContent {
  id: string;
  title: string;
  type: 'podcast' | 'summary' | 'character' | 'dialogue';
  duration: number;
  url: string;
  transcript?: string;
  createdAt: Date;
  status: 'generating' | 'ready' | 'error';
  progress?: number;
}

interface AudioGeneratorProps {
  documents: Document[];
  audioContent: AudioContent[];
  setAudioContent: React.Dispatch<React.SetStateAction<AudioContent[]>>;
}

interface VoiceSettings {
  voice1: string;
  voice2: string;
  speed: number;
  tone: 'conversational' | 'analytical' | 'dramatic' | 'educational';
  length: 'short' | 'medium' | 'long';
}

export function AudioGenerator({ documents, audioContent, setAudioContent }: AudioGeneratorProps) {
  const [selectedType, setSelectedType] = useState<'podcast' | 'summary' | 'character' | 'dialogue'>('podcast');
  const [topic, setTopic] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice1: 'Sarah (Analytical)',
    voice2: 'Marcus (Conversational)',
    speed: 1.0,
    tone: 'conversational',
    length: 'medium'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Audio player controls
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setPlayingId(null);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const generateAudio = async () => {
    if (!topic.trim() && !customPrompt.trim()) {
      toast({
        title: "Missing Input",
        description: "Please provide a topic or custom prompt",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    const newAudio: AudioContent = {
      id: `audio_${Date.now()}`,
      title: topic || customPrompt.substring(0, 50) + '...',
      type: selectedType,
      duration: 0,
      url: '',
      createdAt: new Date(),
      status: 'generating',
      progress: 0
    };

    setAudioContent(prev => [newAudio, ...prev]);

    try {
      // Simulate audio generation process
      const steps = [
        { progress: 10, message: 'Analyzing content...' },
        { progress: 25, message: 'Creating script...' },
        { progress: 40, message: 'Generating voice synthesis...' },
        { progress: 60, message: 'Processing audio...' },
        { progress: 80, message: 'Finalizing output...' },
        { progress: 100, message: 'Complete!' }
      ];

      for (const step of steps) {
        setAudioContent(prev => prev.map(audio => 
          audio.id === newAudio.id 
            ? { ...audio, progress: step.progress }
            : audio
        ));
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Simulate successful generation
      const generatedAudio: AudioContent = {
        ...newAudio,
        status: 'ready',
        duration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
        url: `/audio/generated-${newAudio.id}.mp3`,
        transcript: generateMockTranscript(selectedType, topic || customPrompt)
      };

      setAudioContent(prev => prev.map(audio => 
        audio.id === newAudio.id ? generatedAudio : audio
      ));

      toast({
        title: "Audio Generated",
        description: `Your ${selectedType} is ready to play!`
      });

      // Clear form
      setTopic('');
      setCustomPrompt('');

    } catch (error) {
      setAudioContent(prev => prev.map(audio => 
        audio.id === newAudio.id 
          ? { ...audio, status: 'error' }
          : audio
      ));
      
      toast({
        title: "Generation Failed",
        description: "Failed to generate audio content",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockTranscript = (type: string, topic: string): string => {
    const transcripts = {
      podcast: `[SARAH]: Welcome to another episode of Batcave Deep Dive. Today we're exploring "${topic}".

[MARCUS]: Thanks Sarah. This is such a fascinating aspect of the Batman universe. Looking at the source material, we can see how this concept really shapes the entire narrative.

[SARAH]: Absolutely. What I find particularly interesting is how the writers have developed this theme across multiple story arcs. The psychological depth here is remarkable.

[MARCUS]: And the way it connects to the broader themes of justice and morality - it's not just surface level storytelling. There are real philosophical questions being explored.

[SARAH]: Our analysis of the documents shows this appearing in over 150 mentions across different sources. The consistency is striking.

[MARCUS]: For our listeners who want to dive deeper, I'd recommend looking at the character relationship mappings we've generated. They really illuminate these connections.

[SARAH]: That's a great point. The AI analysis revealed some patterns that even casual readers might miss on first reading.

[Continue for full episode...]`,

      summary: `This is your AI-generated summary of key points about "${topic}".

Based on analysis of your uploaded documents, here are the main insights:

First, the foundational elements show a clear pattern of development across your story materials...

Second, the character relationships demonstrate complex interconnections that drive the central narrative...

Third, thematic elements consistently reinforce the core philosophical questions...

[Continue with detailed summary...]`,

      character: `Character Profile: ${topic}

This character analysis is based on comprehensive review of your story documents...

Background and Origins: The character's foundation stems from...

Key Relationships: Primary connections include...

Character Development Arc: We see evolution through...

Significance to Overall Narrative: This character serves to...

[Continue with full character analysis...]`
    };

    return transcripts[type] || transcripts.podcast;
  };

  const playAudio = (audioContent: AudioContent) => {
    if (audioContent.status !== 'ready') return;

    if (playingId === audioContent.id) {
      // Pause current audio
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // Play new audio
      if (audioRef.current) {
        audioRef.current.src = audioContent.url;
        audioRef.current.play();
        setPlayingId(audioContent.id);
      }
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const deleteAudio = (audioId: string) => {
    setAudioContent(prev => prev.filter(audio => audio.id !== audioId));
    if (playingId === audioId) {
      setPlayingId(null);
      audioRef.current?.pause();
    }
    toast({
      title: "Audio Deleted",
      description: "Audio content removed"
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadAudio = (audioContent: AudioContent) => {
    // In a real implementation, this would download the actual audio file
    const link = document.createElement('a');
    link.href = audioContent.url;
    link.download = `${audioContent.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: `Downloading ${audioContent.title}`
    });
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Documents Available</h3>
          <p className="text-muted-foreground mb-4">
            Upload and process documents to generate audio content
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Audio Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Audio Content Generator
          </CardTitle>
          <CardDescription>
            Generate podcast-style discussions, summaries, and character analyses from your documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Content Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { type: 'podcast', label: 'Podcast Discussion', icon: Users },
                { type: 'summary', label: 'Chapter Summary', icon: FileAudio },
                { type: 'character', label: 'Character Profile', icon: Mic },
                { type: 'dialogue', label: 'Character Dialogue', icon: Waveform }
              ].map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setSelectedType(type as any)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs text-center">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Topic/Prompt Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic/Subject</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Batman vs Joker psychology, Gotham City politics"
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Prompt (Optional)</label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Custom instructions for the AI..."
                className="h-20"
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Voice Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Audio Settings</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm">Voice Style</label>
                <div className="space-y-2">
                  <select 
                    className="w-full p-2 border rounded"
                    value={voiceSettings.voice1}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice1: e.target.value }))}
                  >
                    <option value="Sarah (Analytical)">Sarah (Analytical)</option>
                    <option value="Emma (Conversational)">Emma (Conversational)</option>
                    <option value="Alex (Dramatic)">Alex (Dramatic)</option>
                    <option value="Morgan (Educational)">Morgan (Educational)</option>
                  </select>
                  {selectedType === 'podcast' && (
                    <select 
                      className="w-full p-2 border rounded"
                      value={voiceSettings.voice2}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice2: e.target.value }))}
                    >
                      <option value="Marcus (Conversational)">Marcus (Conversational)</option>
                      <option value="Jordan (Expert)">Jordan (Expert)</option>
                      <option value="Casey (Enthusiast)">Casey (Enthusiast)</option>
                      <option value="Riley (Critic)">Riley (Critic)</option>
                    </select>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">Tone & Length</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={voiceSettings.tone}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, tone: e.target.value as any }))}
                >
                  <option value="conversational">Conversational</option>
                  <option value="analytical">Analytical</option>
                  <option value="dramatic">Dramatic</option>
                  <option value="educational">Educational</option>
                </select>
                <select 
                  className="w-full p-2 border rounded"
                  value={voiceSettings.length}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, length: e.target.value as any }))}
                >
                  <option value="short">Short (5-10 min)</option>
                  <option value="medium">Medium (10-20 min)</option>
                  <option value="long">Long (20-35 min)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">Speed: {voiceSettings.speed.toFixed(1)}x</label>
                <Slider
                  value={[voiceSettings.speed]}
                  onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, speed: value[0] }))}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={generateAudio} 
            disabled={isGenerating || (!topic.trim() && !customPrompt.trim())}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating Audio...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate {selectedType === 'podcast' ? 'Podcast' : selectedType === 'summary' ? 'Summary' : selectedType === 'character' ? 'Character Profile' : 'Dialogue'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Audio Library */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="w-5 h-5" />
                Audio Library ({audioContent.length})
              </CardTitle>
              <CardDescription>
                Your generated audio content and transcripts
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAudioContent([])}
              disabled={audioContent.length === 0}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {audioContent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileAudio className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No audio content generated yet</p>
              <p className="text-sm">Create your first audio content above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {audioContent.map((audio) => (
                <Card key={audio.id} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-medium">{audio.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {audio.type} • Created {audio.createdAt.toLocaleDateString()}
                          {audio.status === 'ready' && ` • ${formatTime(audio.duration)}`}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          audio.status === 'ready' ? 'default' : 
                          audio.status === 'generating' ? 'secondary' : 'destructive'
                        }
                      >
                        {audio.status === 'generating' ? 'Generating...' : 
                         audio.status === 'ready' ? 'Ready' : 'Error'}
                      </Badge>
                    </div>

                    {/* Generation Progress */}
                    {audio.status === 'generating' && typeof audio.progress === 'number' && (
                      <div className="mb-3">
                        <Progress value={audio.progress} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {audio.progress}% complete
                        </div>
                      </div>
                    )}

                    {/* Audio Controls */}
                    {audio.status === 'ready' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant={playingId === audio.id ? "secondary" : "outline"}
                            onClick={() => playAudio(audio)}
                          >
                            {playingId === audio.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          
                          {playingId === audio.id && (
                            <>
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs">{formatTime(currentTime)}</span>
                                <Slider
                                  value={[currentTime]}
                                  onValueChange={(value) => seekTo(value[0])}
                                  max={duration || 100}
                                  step={1}
                                  className="flex-1"
                                />
                                <span className="text-xs">{formatTime(duration)}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={toggleMute}
                                >
                                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </Button>
                                <Slider
                                  value={[volume]}
                                  onValueChange={handleVolumeChange}
                                  max={1}
                                  step={0.1}
                                  className="w-16"
                                />
                              </div>
                            </>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadAudio(audio)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteAudio(audio.id)}
                          >
                            <Square className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Transcript Preview */}
                        {audio.transcript && (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              View Transcript
                            </summary>
                            <div className="mt-2 p-3 bg-background rounded border max-h-32 overflow-y-auto">
                              <pre className="whitespace-pre-wrap text-xs">
                                {audio.transcript}
                              </pre>
                            </div>
                          </details>
                        )}
                      </div>
                    )}

                    {/* Error State */}
                    {audio.status === 'error' && (
                      <div className="text-sm text-red-600">
                        Failed to generate audio. Please try again.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}