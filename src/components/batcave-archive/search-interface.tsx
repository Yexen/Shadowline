'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Search,
  Filter,
  FileText,
  Quote,
  ExternalLink,
  Download,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  X
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

  // Advanced filter states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minRelevanceScore, setMinRelevanceScore] = useState(0);
  const [maxRelevanceScore, setMaxRelevanceScore] = useState(100);
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [contextTypes, setContextTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'document' | 'type'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchLogic, setSearchLogic] = useState<'and' | 'or'>('or');

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

  // Clear filters function
  const clearAllFilters = () => {
    setSearchType('all');
    setSelectedDocument('all');
    setMinRelevanceScore(0);
    setMaxRelevanceScore(100);
    setDateRange('all');
    setContextTypes([]);
    setSortBy('relevance');
    setSortOrder('desc');
    setSearchLogic('or');
  };

  // Get unique context types for filter options
  const uniqueContextTypes = Array.from(new Set(results.map(r => r.context)));

  // Advanced filtering logic
  const filteredResults = results
    .filter(result => {
      // Basic filters
      const matchesType = searchType === 'all' || result.type === searchType;
      const matchesDocument = selectedDocument === 'all' || result.document === selectedDocument;

      // Relevance score filter
      const relevancePercent = result.relevanceScore * 100;
      const matchesRelevance = relevancePercent >= minRelevanceScore && relevancePercent <= maxRelevanceScore;

      // Date range filter
      const resultDate = new Date(result.timestamp);
      const now = new Date();
      let matchesDate = true;

      if (dateRange !== 'all') {
        const ranges = {
          today: () => resultDate.toDateString() === now.toDateString(),
          week: () => (now.getTime() - resultDate.getTime()) <= (7 * 24 * 60 * 60 * 1000),
          month: () => (now.getTime() - resultDate.getTime()) <= (30 * 24 * 60 * 60 * 1000),
          year: () => (now.getTime() - resultDate.getTime()) <= (365 * 24 * 60 * 60 * 1000)
        };
        matchesDate = ranges[dateRange]();
      }

      // Context type filter
      const matchesContext = contextTypes.length === 0 || contextTypes.includes(result.context);

      return matchesType && matchesDocument && matchesRelevance && matchesDate && matchesContext;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = b.relevanceScore - a.relevanceScore;
          break;
        case 'date':
          comparison = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          break;
        case 'document':
          comparison = a.document.localeCompare(b.document);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortOrder === 'asc' ? -comparison : comparison;
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

          {/* Basic Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Search Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="exact">Exact Matches</SelectItem>
                  <SelectItem value="semantic">Semantic Matches</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={selectedDocument} onValueChange={setSelectedDocument}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Document" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                {documents.map(doc => (
                  <SelectItem key={doc.id} value={doc.name}>{doc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Advanced Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </Button>

            {results.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            )}

            {(searchType !== 'all' || selectedDocument !== 'all' || minRelevanceScore > 0 || maxRelevanceScore < 100 || dateRange !== 'all' || contextTypes.length > 0) && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
            <CollapsibleContent className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Relevance Score Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Relevance Score Range</Label>
                  <div className="px-3">
                    <Slider
                      value={[minRelevanceScore, maxRelevanceScore]}
                      onValueChange={([min, max]) => {
                        setMinRelevanceScore(min);
                        setMaxRelevanceScore(max);
                      }}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{minRelevanceScore}%</span>
                      <span>{maxRelevanceScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                      <SelectItem value="year">Past Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sort Results</Label>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                  </div>
                </div>
              </div>

              {/* Context Types Filter */}
              {uniqueContextTypes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Context Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueContextTypes.map((context) => (
                      <div key={context} className="flex items-center space-x-2">
                        <Checkbox
                          id={`context-${context}`}
                          checked={contextTypes.includes(context)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setContextTypes([...contextTypes, context]);
                            } else {
                              setContextTypes(contextTypes.filter(c => c !== context));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`context-${context}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {context}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Logic */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search Logic</Label>
                <Select value={searchLogic} onValueChange={(value: any) => setSearchLogic(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Search logic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="or">Match Any (OR)</SelectItem>
                    <SelectItem value="and">Match All (AND)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">
                  {searchLogic === 'or'
                    ? 'Results match any search terms'
                    : 'Results must match all search terms'
                  }
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

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