'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Play, Calendar, Filter, Download, Search, Zap, Loader2 } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  processed: boolean;
}

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  type: 'origin' | 'conflict' | 'alliance' | 'transformation' | 'revelation';
  description: string;
  characters: string[];
  source: string;
  importance: number;
}

export function InteractiveTimeline({ documents }: { documents: Document[] }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const mockEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'Bruce Wayne\'s Parents Murdered',
      date: 'Year -15',
      type: 'origin',
      description: 'Thomas and Martha Wayne killed in Crime Alley, traumatic event that shapes Bruce\'s future.',
      characters: ['Bruce Wayne', 'Thomas Wayne', 'Martha Wayne'],
      source: 'Batman Origins.pdf',
      importance: 100
    },
    {
      id: '2', 
      title: 'Batman First Appears',
      date: 'Year 1',
      type: 'transformation',
      description: 'Bruce Wayne begins his vigilante career as Batman.',
      characters: ['Batman', 'Commissioner Gordon'],
      source: 'Year One.pdf',
      importance: 95
    },
    {
      id: '3',
      title: 'First Encounter with Joker',
      date: 'Year 2',
      type: 'conflict',
      description: 'The Joker emerges as Batman\'s greatest nemesis.',
      characters: ['Batman', 'Joker'],
      source: 'Joker Character Bible.pdf',
      importance: 90
    }
  ];

  const generateTimeline = async () => {
    setIsGenerating(true);
    // Simulate timeline generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setEvents(mockEvents);
    setIsGenerating(false);
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === '' || 
      event.title.toLowerCase().includes(filter.toLowerCase()) ||
      event.characters.some(char => char.toLowerCase().includes(filter.toLowerCase()));
    const matchesType = selectedType === 'all' || event.type === selectedType;
    return matchesFilter && matchesType;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Interactive Timeline
            </CardTitle>
            <CardDescription>
              Chronological visualization of story events and character developments
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={generateTimeline}
              disabled={isGenerating || documents.length === 0}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Generate Timeline
            </Button>
            <Button variant="outline" size="sm" disabled={events.length === 0}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter events by title or character..."
              className="w-full"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Types</option>
            <option value="origin">Origins</option>
            <option value="conflict">Conflicts</option>
            <option value="alliance">Alliances</option>
            <option value="transformation">Transformations</option>
            <option value="revelation">Revelations</option>
          </select>
        </div>

        {/* Timeline */}
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No timeline generated yet</p>
            <p className="text-sm">Generate timeline from your documents to see chronological events</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
            
            {/* Events */}
            <div className="space-y-6">
              {filteredEvents.map((event, index) => (
                <div key={event.id} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background ${
                    event.type === 'origin' ? 'border-red-500' :
                    event.type === 'conflict' ? 'border-orange-500' :
                    event.type === 'alliance' ? 'border-green-500' :
                    event.type === 'transformation' ? 'border-blue-500' :
                    'border-purple-500'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      event.type === 'origin' ? 'bg-red-500' :
                      event.type === 'conflict' ? 'bg-orange-500' :
                      event.type === 'alliance' ? 'bg-green-500' :
                      event.type === 'transformation' ? 'bg-blue-500' :
                      'bg-purple-500'
                    }`}></div>
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 bg-muted/50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="text-sm text-muted-foreground">{event.date}</div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {event.type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {event.characters.map((character, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {character}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.source} • Importance: {event.importance}/100
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}