
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, PenLine, ChevronRight } from 'lucide-react';

export default function AiToolsPage() {
  const router = useRouter();

  const tools = [
    {
      title: 'Chapter Generation',
      description: 'Provide a prompt and let the AI ghostwriter draft a scene or chapter for you.',
      icon: PenLine,
      action: () => router.push('/editor/new'),
      cta: 'Go to Editor'
    },
    {
      title: 'Ask the Oracle',
      description: 'Select text in the editor and ask contextual questions to get insights, clarify themes, or check character motivations.',
      icon: Sparkles,
      action: () => router.push('/editor/new'),
      cta: 'Go to Editor'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 text-muted-foreground">
          A suite of AI-powered tools to assist your writing process, from generating ideas to refining your drafts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, index) => (
          <Card 
            key={index} 
            className="bg-card hover:border-primary/50 transition-colors flex flex-col cursor-pointer"
            onClick={tool.action}
          >
            <CardHeader className="flex-row items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                 <tool.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline text-xl">{tool.title}</CardTitle>
                <CardDescription className="mt-1">{tool.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="mt-auto">
                <div className="flex items-center justify-end text-primary font-bold text-sm">
                    {tool.cta} <ChevronRight className="w-4 h-4 ml-1" />
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
