'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  RefreshCw, 
  Download, 
  TrendingUp,
  Eye,
  Lightbulb,
  Target,
  Zap,
  Heart,
  Skull,
  Shield,
  Scale,
  Moon,
  Sun,
  Loader2,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  processed: boolean;
}

interface Theme {
  id: string;
  name: string;
  category: 'philosophical' | 'emotional' | 'moral' | 'social' | 'psychological';
  strength: number; // 0-100
  mentions: number;
  description: string;
  examples: ThemeExample[];
  relatedCharacters: string[];
  evolution: ThemeEvolution[];
  sources: string[];
}

interface ThemeExample {
  text: string;
  source: string;
  context: string;
  relevanceScore: number;
}

interface ThemeEvolution {
  document: string;
  strength: number;
  description: string;
}

interface ThemeAnalysisProps {
  documents: Document[];
}

export function ThemeAnalysis({ documents }: ThemeAnalysisProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [activeView, setActiveView] = useState<'themes' | 'evolution' | 'connections'>('themes');
  const { toast } = useToast();

  // Mock theme data
  useEffect(() => {
    if (documents.length > 0) {
      const mockThemes: Theme[] = [
        {
          id: '1',
          name: 'Justice vs Vigilantism',
          category: 'moral',
          strength: 95,
          mentions: 156,
          description: 'The central tension between working within the system versus taking the law into one\'s own hands. Explores the moral ambiguity of Batman\'s methods.',
          examples: [
            {
              text: 'Batman operates outside the law to achieve what he believes is true justice',
              source: 'Batman Philosophy.pdf',
              context: 'Chapter on moral complexity',
              relevanceScore: 0.92
            },
            {
              text: 'Gordon struggles with accepting Batman\'s help while upholding his oath as a police officer',
              source: 'GCPD Files.docx',
              context: 'Commissioner Gordon\'s dilemma',
              relevanceScore: 0.87
            }
          ],
          relatedCharacters: ['Batman', 'Commissioner Gordon', 'Harvey Dent'],
          evolution: [
            { document: 'Batman Origins.pdf', strength: 75, description: 'Initial exploration of vigilante ethics' },
            { document: 'Dark Knight Returns.pdf', strength: 90, description: 'Mature examination of justice' },
            { document: 'No Man\'s Land.pdf', strength: 95, description: 'Ultimate test of vigilante vs system' }
          ],
          sources: ['Batman Philosophy.pdf', 'GCPD Files.docx', 'Ethics of Gotham.txt']
        },
        {
          id: '2',
          name: 'Order vs Chaos',
          category: 'philosophical',
          strength: 90,
          mentions: 143,
          description: 'The fundamental conflict between Batman\'s drive for order and the Joker\'s embodiment of chaos. Represents opposing worldviews.',
          examples: [
            {
              text: 'The Joker exists to prove that chaos is the natural state of humanity',
              source: 'Joker Character Bible.pdf',
              context: 'Philosophical underpinnings',
              relevanceScore: 0.95
            },
            {
              text: 'Batman\'s obsessive need for control stems from the chaos of his parents\' murder',
              source: 'Wayne Psychological Profile.docx',
              context: 'Trauma analysis',
              relevanceScore: 0.89
            }
          ],
          relatedCharacters: ['Batman', 'Joker', 'Harvey Dent'],
          evolution: [
            { document: 'Killing Joke.pdf', strength: 85, description: 'Chaos as response to bad day' },
            { document: 'Dark Knight.pdf', strength: 90, description: 'Escalation of chaos vs order' },
            { document: 'Endgame.pdf', strength: 92, description: 'Ultimate chaos scenario' }
          ],
          sources: ['Joker Character Bible.pdf', 'Wayne Psychological Profile.docx']
        },
        {
          id: '3',
          name: 'Redemption and Hope',
          category: 'emotional',
          strength: 75,
          mentions: 98,
          description: 'The possibility of redemption for villains and the hope that drives heroes to continue fighting.',
          examples: [
            {
              text: 'Batman believes even his enemies can be redeemed, which is why he doesn\'t kill',
              source: 'Batman Code.txt',
              context: 'No-kill rule explanation',
              relevanceScore: 0.91
            }
          ],
          relatedCharacters: ['Batman', 'Harvey Dent', 'Catwoman'],
          evolution: [
            { document: 'Long Halloween.pdf', strength: 70, description: 'Harvey\'s fall and hope for return' },
            { document: 'Hush.pdf', strength: 75, description: 'Multiple redemption arcs explored' }
          ],
          sources: ['Batman Code.txt', 'Redemption Stories.pdf']
        },
        {
          id: '4',
          name: 'Identity and Masks',
          category: 'psychological',
          strength: 85,
          mentions: 112,
          description: 'The duality of public and private personas, and the question of which identity is real.',
          examples: [
            {
              text: 'Is Bruce Wayne the mask or is Batman the mask? The line becomes increasingly blurred',
              source: 'Identity Crisis.pdf',
              context: 'Psychological analysis',
              relevanceScore: 0.93
            }
          ],
          relatedCharacters: ['Batman', 'Bruce Wayne', 'Clark Kent'],
          evolution: [
            { document: 'Year One.pdf', strength: 65, description: 'Creation of the Batman identity' },
            { document: 'Dark Knight Returns.pdf', strength: 85, description: 'Batman as true self' }
          ],
          sources: ['Identity Crisis.pdf', 'Masks and Reality.docx']
        },
        {
          id: '5',
          name: 'Fear as a Tool',
          category: 'psychological',
          strength: 80,
          mentions: 87,
          description: 'How fear can be used both to control crime and as a weapon against innocents.',
          examples: [
            {
              text: 'Criminals are a cowardly and superstitious lot, so Batman uses fear as his greatest weapon',
              source: 'Fear Tactics.pdf',
              context: 'Batman\'s methodology',
              relevanceScore: 0.88
            }
          ],
          relatedCharacters: ['Batman', 'Scarecrow', 'Ra\'s al Ghul'],
          evolution: [
            { document: 'Batman Begins.pdf', strength: 75, description: 'Learning to use fear' },
            { document: 'Scarecrow Arc.pdf', strength: 85, description: 'Fear turned against him' }
          ],
          sources: ['Fear Tactics.pdf', 'Scarecrow Studies.docx']
        }
      ];
      setThemes(mockThemes);
    }
  }, [documents]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const progressSteps = [
      { step: 15, message: 'Analyzing thematic content...' },
      { step: 30, message: 'Identifying recurring motifs...' },
      { step: 50, message: 'Mapping theme connections...' },
      { step: 70, message: 'Calculating theme strength...' },
      { step: 85, message: 'Tracking thematic evolution...' },
      { step: 100, message: 'Analysis complete!' }
    ];

    for (const { step, message } of progressSteps) {
      setAnalysisProgress(step);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    setIsAnalyzing(false);
    toast({
      title: "Theme Analysis Complete",
      description: `Identified ${themes.length} major themes across your documents`
    });
  };

  const getThemeIcon = (category: string) => {
    switch (category) {
      case 'philosophical': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'emotional': return <Heart className="w-4 h-4 text-pink-500" />;
      case 'moral': return <Scale className="w-4 h-4 text-blue-500" />;
      case 'social': return <Target className="w-4 h-4 text-green-500" />;
      case 'psychological': return <Skull className="w-4 h-4 text-purple-500" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getThemeColor = (strength: number) => {
    if (strength >= 90) return 'text-red-500';
    if (strength >= 75) return 'text-orange-500';
    if (strength >= 60) return 'text-yellow-500';
    if (strength >= 40) return 'text-blue-500';
    return 'text-gray-500';
  };

  const exportAnalysis = () => {
    const analysis = {
      themes: themes.map(theme => ({
        ...theme,
        categoryDistribution: themes.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      })),
      summary: {
        totalThemes: themes.length,
        averageStrength: Math.round(themes.reduce((sum, t) => sum + t.strength, 0) / themes.length),
        strongestTheme: themes.sort((a, b) => b.strength - a.strength)[0]?.name,
        categoryBreakdown: themes.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Documents Available</h3>
          <p className="text-muted-foreground mb-4">
            Upload and process documents to analyze themes and motifs
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Theme & Motif Analysis
              </CardTitle>
              <CardDescription>
                Identify and analyze recurring themes, motifs, and philosophical concepts
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={startAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Themes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setThemes([])}
                disabled={isAnalyzing || themes.length === 0}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button 
                variant="outline" 
                onClick={exportAnalysis}
                disabled={themes.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {isAnalyzing && (
            <div className="mt-4 space-y-2">
              <Progress value={analysisProgress} />
              <div className="text-sm text-muted-foreground">
                Processing thematic content across {documents.length} documents...
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {themes.length > 0 && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{themes.length}</div>
                <div className="text-sm text-muted-foreground">Themes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {Math.round(themes.reduce((sum, t) => sum + t.strength, 0) / themes.length)}
                </div>
                <div className="text-sm text-muted-foreground">Avg. Strength</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {themes.reduce((sum, t) => sum + t.mentions, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Mentions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {new Set(themes.flatMap(t => t.relatedCharacters)).size}
                </div>
                <div className="text-sm text-muted-foreground">Connected Characters</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {new Set(themes.map(t => t.category)).size}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </CardContent>
            </Card>
          </div>

          {/* Theme Analysis Tabs */}
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
            <TabsList>
              <TabsTrigger value="themes">Themes Overview</TabsTrigger>
              <TabsTrigger value="evolution">Evolution</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>

            <TabsContent value="themes" className="space-y-6">
              {/* Theme Grid */}
              <Card>
                <CardHeader>
                  <CardTitle>Theme Analysis</CardTitle>
                  <CardDescription>
                    Themes ranked by strength and frequency of occurrence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {themes
                      .sort((a, b) => b.strength - a.strength)
                      .map((theme) => (
                        <Card 
                          key={theme.id}
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedTheme?.id === theme.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedTheme(theme)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                {getThemeIcon(theme.category)}
                                <div>
                                  <div className="font-medium">{theme.name}</div>
                                  <div className="text-sm text-muted-foreground capitalize">
                                    {theme.category} theme
                                  </div>
                                </div>
                              </div>
                              <div className="text-right space-y-1">
                                <div className={`text-lg font-bold ${getThemeColor(theme.strength)}`}>
                                  {theme.strength}/100
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {theme.mentions} mentions
                                </div>
                              </div>
                            </div>
                            
                            <Progress value={theme.strength} className="mb-3" />
                            
                            <div className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {theme.description}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {theme.relatedCharacters.slice(0, 3).map((character, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {character}
                                  </Badge>
                                ))}
                                {theme.relatedCharacters.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{theme.relatedCharacters.length - 3}
                                  </Badge>
                                )}
                              </div>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evolution" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thematic Evolution</CardTitle>
                  <CardDescription>
                    How themes develop and change across different documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {themes.slice(0, 3).map((theme) => (
                      <div key={theme.id} className="space-y-3">
                        <div className="flex items-center gap-2">
                          {getThemeIcon(theme.category)}
                          <h4 className="font-medium">{theme.name}</h4>
                        </div>
                        <div className="space-y-2">
                          {theme.evolution.map((evolution, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{evolution.document}</div>
                                <div className="text-sm text-muted-foreground">
                                  {evolution.description}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-bold ${getThemeColor(evolution.strength)}`}>
                                  {evolution.strength}/100
                                </div>
                                <Progress value={evolution.strength} className="w-20 mt-1" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="connections" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Connections</CardTitle>
                  <CardDescription>
                    Relationships between themes and shared characters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Theme connection visualization would go here */}
                  <div className="text-center py-8 text-muted-foreground">
                    <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Theme connection visualization coming soon</p>
                    <p className="text-sm">Will show how themes interconnect through characters and plot points</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Selected Theme Detail */}
          {selectedTheme && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getThemeIcon(selectedTheme.category)}
                    <div>
                      <CardTitle>{selectedTheme.name}</CardTitle>
                      <CardDescription>
                        {selectedTheme.category} theme • {selectedTheme.mentions} mentions • 
                        Strength: {selectedTheme.strength}/100
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTheme(null)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedTheme.description}</p>
                </div>

                {/* Examples */}
                <div>
                  <h4 className="font-medium mb-3">Examples ({selectedTheme.examples.length})</h4>
                  <div className="space-y-3">
                    {selectedTheme.examples.map((example, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">{example.source}</div>
                          <Badge variant="secondary">
                            {Math.round(example.relevanceScore * 100)}% match
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {example.context}
                        </div>
                        <blockquote className="border-l-4 border-primary pl-4 italic">
                          "{example.text}"
                        </blockquote>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Characters */}
                <div>
                  <h4 className="font-medium mb-2">Related Characters</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTheme.relatedCharacters.map((character, index) => (
                      <Badge key={index} variant="secondary">
                        {character}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sources */}
                <div>
                  <h4 className="font-medium mb-2">Source Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTheme.sources.map((source, index) => (
                      <Badge key={index} variant="outline">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}