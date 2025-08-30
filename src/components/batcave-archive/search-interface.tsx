'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  FileText, 
  Quote, 
  ExternalLink,
  Download,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  processed: boolean;
}

interface SearchResult {
  id: string;
  text: string;
  document: string;
  page?: number;
  relevanceScore: number;
  context: string;
  timestamp: string;
  type: 'exact' | 'semantic' | 'fuzzy';
}

export function SearchInterface({ 
  documents, 
  searchQuery, 
  setSearchQuery 
}: { 
  documents: Document[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'exact' | 'semantic'>('all');
  const [selectedDocument, setSelectedDocument] = useState<string>('all');

  const mockResults: SearchResult[] = [
    {
      id: '1',
      text: 'The Joker represents pure chaos, a force of nature that exists to challenge Batman\'s sense of order and justice.',
      document: 'Joker Character Bible.pdf',
      page: 12,
      relevanceScore: 0.95,
      context: 'Character Analysis - Philosophical Foundations',
      timestamp: '2024-01-15T10:30:00Z',
      type: 'exact'
    },
    {
      id: '2', 
      text: 'Batman\'s code against killing stems from his trauma and belief in redemption.',
      document: 'Batman Code.txt',
      relevanceScore: 0.89,
      context: 'Moral Philosophy Section',
      timestamp: '2024-01-16T14:22:00Z',
      type: 'semantic'
    },
    {
      id: '3',
      text: 'Arkham Asylum serves as both prison and symbol of Gotham\'s fractured psyche.',
      document: 'Gotham Locations.docx',
      page: 5,
      relevanceScore: 0.82,
      context: 'Symbolic Locations',
      timestamp: '2024-01-17T09:15:00Z', 
      type: 'semantic'
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setResults(mockResults);
    setIsSearching(false);
  };

  const exportResults = () => {
    const exportData = {
      query: searchQuery,
      searchType,
      document: selectedDocument,
      results: results.map(r => ({
        text: r.text,
        document: r.document,
        page: r.page,
        relevanceScore: r.relevanceScore,
        context: r.context,
        type: r.type
      })),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredResults = results.filter(result => {
    const matchesType = searchType === 'all' || result.type === searchType;
    const matchesDocument = selectedDocument === 'all' || result.document === selectedDocument;
    return matchesType && matchesDocument;
  });

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Document Search
          </CardTitle>
          <CardDescription>
            Search across all your documents with AI-powered semantic understanding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for characters, themes, quotes, or concepts..."
              className="flex-1"
              disabled={documents.length === 0}
            />
            <Button 
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching || documents.length === 0}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="all">All Results</option>
                <option value="exact">Exact Matches</option>
                <option value="semantic">Semantic Matches</option>
              </select>
            </div>
            
            <select
              value={selectedDocument}
              onChange={(e) => setSelectedDocument(e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="all">All Documents</option>
              {documents.map(doc => (
                <option key={doc.id} value={doc.name}>{doc.name}</option>
              ))}
            </select>

            {results.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            )}
          </div>

          {documents.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No documents available to search</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Search Results ({filteredResults.length})
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Found in {new Set(filteredResults.map(r => r.document)).size} documents
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <Card key={result.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">{result.document}</span>
                        {result.page && <Badge variant="outline">Page {result.page}</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={result.type === 'exact' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {result.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(result.relevanceScore * 100)}% match
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm text-muted-foreground mb-1">{result.context}</div>
                      <blockquote className="border-l-4 border-primary pl-4 italic bg-background rounded-r p-3">
                        "{result.text}"
                      </blockquote>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Context
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Search Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Suggested Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              'Batman psychology',
              'Joker motivations', 
              'Gotham locations',
              'Character relationships',
              'Justice themes',
              'Redemption arcs'
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(suggestion);
                  handleSearch();
                }}
                className="justify-start"
              >
                <Star className="w-3 h-3 mr-2" />
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}