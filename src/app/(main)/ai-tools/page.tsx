
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, PenLine, ChevronRight, Image as ImageIcon, FileText } from 'lucide-react';
import { ImageGenTool } from '@/components/image-gen-tool';
import { SummarizeTool } from '@/components/summarize-tool';
import { OracleChatTool } from '@/components/oracle-chat-tool';
import { Separator } from '@/components/ui/separator';

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
      title: 'Ask the Oracle (Contextual)',
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

      <OracleChatTool />

      <Separator />

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
            <div className="p-6 pt-0 mt-auto">
                <div className="flex items-center justify-end text-primary font-bold text-sm">
                    {tool.cta} <ChevronRight className="w-4 h-4 ml-1" />
                </div>
            </div>
          </Card>
        ))}
         <Card className="bg-card">
            <CardHeader className="flex-row items-start gap-4">
               <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                 <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline text-xl">Image Generation</CardTitle>
                <CardDescription className="mt-1">Generate a visual reference for a character, location, or scene.</CardDescription>
              </div>
            </CardHeader>
            <div className="p-6 pt-0">
              <ImageGenTool />
            </div>
        </Card>
        <Card className="bg-card">
            <CardHeader className="flex-row items-start gap-4">
               <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                 <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline text-xl">Summarize</CardTitle>
                <CardDescription className="mt-1">Get a quick summary of a bible entry. Try "@The Joker".</CardDescription>
              </div>
            </CardHeader>
            <div className="p-6 pt-0">
              <SummarizeTool />
            </div>
        </Card>
      </div>
    </div>
  );
}
