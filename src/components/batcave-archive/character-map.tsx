'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Play, 
  RefreshCw, 
  Download, 
  Eye,
  Heart,
  Zap,
  Shield,
  Sword,
  Crown,
  Skull,
  Star,
  Loader2,
  Network,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  processed: boolean;
}

interface Character {
  id: string;
  name: string;
  type: 'hero' | 'villain' | 'neutral' | 'civilian';
  importance: number; // 0-100
  mentions: number;
  description: string;
  affiliations: string[];
  relationships: Relationship[];
  traits: string[];
  firstMention: string;
}

interface Relationship {
  targetId: string;
  type: 'ally' | 'enemy' | 'family' | 'romantic' | 'mentor' | 'neutral';
  strength: number; // 0-100
  description: string;
  source: string;
}

interface CharacterMapProps {
  documents: Document[];
}

export function CharacterMap({ documents }: CharacterMapProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [activeView, setActiveView] = useState<'grid' | 'network' | 'hierarchy'>('grid');
  const { toast } = useToast();

  // Mock character data
  useEffect(() => {
    if (documents.length > 0) {
      const mockCharacters: Character[] = [
        {
          id: '1',
          name: 'Batman',
          type: 'hero',
          importance: 100,
          mentions: 247,
          description: 'The Dark Knight of Gotham City. Billionaire Bruce Wayne fights crime using advanced technology and martial arts skills.',
          affiliations: ['Wayne Enterprises', 'Justice League', 'GCPD'],
          relationships: [
            { targetId: '2', type: 'enemy', strength: 95, description: 'Archenemies locked in eternal conflict', source: 'Joker Character Bible.pdf' },
            { targetId: '3', type: 'ally', strength: 85, description: 'Trusted police commissioner and ally', source: 'GCPD Files.docx' },
            { targetId: '4', type: 'family', strength: 90, description: 'Loyal butler and father figure', source: 'Wayne Manor Records.pdf' }
          ],
          traits: ['Strategic', 'Brooding', 'Intelligent', 'Determined', 'Moral'],
          firstMention: 'Joker Character Bible.pdf'
        },
        {
          id: '2',
          name: 'Joker',
          type: 'villain',
          importance: 95,
          mentions: 198,
          description: 'The Clown Prince of Crime. Batman\'s greatest enemy, representing chaos and madness.',
          affiliations: ['Arkham Asylum', 'Legion of Doom'],
          relationships: [
            { targetId: '1', type: 'enemy', strength: 95, description: 'Obsessed with Batman as his perfect opposite', source: 'Joker Character Bible.pdf' },
            { targetId: '5', type: 'romantic', strength: 70, description: 'Toxic relationship with devoted Harley', source: 'Harley Quinn Profile.docx' }
          ],
          traits: ['Chaotic', 'Unpredictable', 'Intelligent', 'Manipulative', 'Insane'],
          firstMention: 'Joker Character Bible.pdf'
        },
        {
          id: '3',
          name: 'Commissioner Gordon',
          type: 'hero',
          importance: 75,
          mentions: 145,
          description: 'Gotham City Police Commissioner and Batman\'s most trusted ally in law enforcement.',
          affiliations: ['GCPD', 'Mayor\'s Office'],
          relationships: [
            { targetId: '1', type: 'ally', strength: 85, description: 'Professional partnership in fighting crime', source: 'GCPD Files.docx' }
          ],
          traits: ['Honest', 'Dedicated', 'Principled', 'Brave', 'Pragmatic'],
          firstMention: 'GCPD Files.docx'
        },
        {
          id: '4',
          name: 'Alfred Pennyworth',
          type: 'neutral',
          importance: 80,
          mentions: 132,
          description: 'Bruce Wayne\'s loyal butler, confidant, and father figure.',
          affiliations: ['Wayne Enterprises', 'Wayne Family'],
          relationships: [
            { targetId: '1', type: 'family', strength: 90, description: 'Surrogate father and moral compass', source: 'Wayne Manor Records.pdf' }
          ],
          traits: ['Loyal', 'Wise', 'Caring', 'Proper', 'Protective'],
          firstMention: 'Wayne Manor Records.pdf'
        },
        {
          id: '5',
          name: 'Harley Quinn',
          type: 'villain',
          importance: 65,
          mentions: 89,
          description: 'Former psychiatrist turned into the Joker\'s devoted accomplice.',
          affiliations: ['Arkham Asylum', 'Gotham Sirens'],
          relationships: [
            { targetId: '2', type: 'romantic', strength: 70, description: 'Obsessively devoted to the Joker', source: 'Harley Quinn Profile.docx' }
          ],
          traits: ['Acrobatic', 'Unpredictable', 'Devoted', 'Violent', 'Tragic'],
          firstMention: 'Harley Quinn Profile.docx'
        }
      ];
      setCharacters(mockCharacters);
    }
  }, [documents]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate analysis progress
    const progressSteps = [
      { step: 10, message: 'Extracting character mentions...' },
      { step: 25, message: 'Analyzing character relationships...' },
      { step: 40, message: 'Calculating importance scores...' },
      { step: 60, message: 'Mapping affiliations and traits...' },
      { step: 80, message: 'Building relationship network...' },
      { step: 100, message: 'Analysis complete!' }
    ];

    for (const { step, message } of progressSteps) {
      setAnalysisProgress(step);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsAnalyzing(false);
    toast({
      title: "Analysis Complete",
      description: `Found ${characters.length} characters with ${characters.reduce((sum, c) => sum + c.relationships.length, 0)} relationships`
    });
  };

  const getCharacterIcon = (type: string) => {
    switch (type) {
      case 'hero': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'villain': return <Skull className="w-4 h-4 text-red-500" />;
      case 'neutral': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'civilian': return <Users className="w-4 h-4 text-gray-500" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'ally': return <Shield className="w-3 h-3 text-blue-500" />;
      case 'enemy': return <Sword className="w-3 h-3 text-red-500" />;
      case 'family': return <Heart className="w-3 h-3 text-green-500" />;
      case 'romantic': return <Heart className="w-3 h-3 text-pink-500" />;
      case 'mentor': return <Crown className="w-3 h-3 text-purple-500" />;
      default: return <Users className="w-3 h-3 text-gray-500" />;
    }
  };

  const exportData = () => {
    const data = {
      characters,
      analysis: {
        totalCharacters: characters.length,
        totalRelationships: characters.reduce((sum, c) => sum + c.relationships.length, 0),
        characterTypes: {
          heroes: characters.filter(c => c.type === 'hero').length,
          villains: characters.filter(c => c.type === 'villain').length,
          neutrals: characters.filter(c => c.type === 'neutral').length,
          civilians: characters.filter(c => c.type === 'civilian').length
        },
        generatedAt: new Date().toISOString()
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `character-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Documents Available</h3>
          <p className="text-muted-foreground mb-4">
            Upload and process documents to analyze character relationships
          </p>
          <Button onClick={() => window.location.href = '/batcave-archive?tab=documents'}>
            Upload Documents
          </Button>
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
                <Users className="w-5 h-5" />
                Character Relationship Analysis
              </CardTitle>
              <CardDescription>
                AI-powered analysis of character relationships, importance, and network dynamics
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
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCharacters([])}
                disabled={isAnalyzing || characters.length === 0}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button 
                variant="outline" 
                onClick={exportData}
                disabled={characters.length === 0}
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
                Analyzing {documents.length} documents...
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {characters.length > 0 && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{characters.length}</div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {characters.reduce((sum, c) => sum + c.relationships.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Relationships</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {Math.round(characters.reduce((sum, c) => sum + c.importance, 0) / characters.length)}
                </div>
                <div className="text-sm text-muted-foreground">Avg. Importance</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {characters.reduce((sum, c) => sum + c.mentions, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Mentions</div>
              </CardContent>
            </Card>
          </div>

          {/* Character Grid */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Character Overview</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={activeView === 'grid' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setActiveView('grid')}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={activeView === 'network' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setActiveView('network')}
                  >
                    <Network className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters
                  .sort((a, b) => b.importance - a.importance)
                  .map((character) => (
                    <Card 
                      key={character.id} 
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedCharacter?.id === character.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedCharacter(character)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getCharacterIcon(character.type)}
                            <div className="font-medium">{character.name}</div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {character.importance}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="text-muted-foreground">
                            {character.mentions} mentions
                          </div>
                          <div className="text-muted-foreground line-clamp-2">
                            {character.description}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {character.traits.slice(0, 3).map((trait, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Character Detail */}
          {selectedCharacter && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCharacterIcon(selectedCharacter.type)}
                    <div>
                      <CardTitle>{selectedCharacter.name}</CardTitle>
                      <CardDescription>
                        {selectedCharacter.type} • {selectedCharacter.mentions} mentions • Importance: {selectedCharacter.importance}/100
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedCharacter(null)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedCharacter.description}</p>
                </div>

                {/* Traits */}
                <div>
                  <h4 className="font-medium mb-2">Character Traits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.traits.map((trait, index) => (
                      <Badge key={index} variant="secondary">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Affiliations */}
                <div>
                  <h4 className="font-medium mb-2">Affiliations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.affiliations.map((affiliation, index) => (
                      <Badge key={index} variant="outline">
                        {affiliation}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Relationships */}
                <div>
                  <h4 className="font-medium mb-3">Relationships ({selectedCharacter.relationships.length})</h4>
                  <div className="space-y-3">
                    {selectedCharacter.relationships.map((relationship, index) => {
                      const targetCharacter = characters.find(c => c.id === relationship.targetId);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getRelationshipIcon(relationship.type)}
                            <div>
                              <div className="font-medium">
                                {targetCharacter?.name || 'Unknown Character'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {relationship.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">
                              {relationship.strength}/100
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {relationship.type}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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