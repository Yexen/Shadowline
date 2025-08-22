
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { summarizeTopic } from '@/ai/flows/summarize-flow';
import { Loader2, FileText } from 'lucide-react';

export function SummarizeTool() {
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    // Extract the topic from the @mention format
    const topic = query.startsWith('@') ? query.substring(1) : query;

    setIsLoading(true);
    setSummary('');
    try {
      const result = await summarizeTopic(topic);
      setSummary(result);
    } catch (error) {
      console.error("Summarization error:", error);
      setSummary("Could not generate a summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder='e.g., @The Joker'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={isLoading}
        />
        <Button onClick={handleSubmit} disabled={isLoading || !query.trim()}>
          {isLoading ? <Loader2 className="animate-spin" /> : <FileText />}
        </Button>
      </div>
      <Textarea
        readOnly
        value={isLoading ? "Generating summary..." : summary}
        className="h-32 bg-muted"
        placeholder="Summary will appear here."
      />
    </div>
  );
}
