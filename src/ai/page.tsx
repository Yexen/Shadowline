export const dynamic = 'force-dynamic';

import ChatBox from '@/components/ChatBox';

export default function AIPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold">Shadowline AI</h1>
      <p className="opacity-70">
        Ask for fixes or features. The AI will also tell you <em>where</em> files should live (paths) so you can save them via your Dev Console.
      </p>
      <ChatBox />
    </main>
  );
}
