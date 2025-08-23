export default function ArcadePage({ params }: { params: { slug: string } }) {
  return (
    <main className="p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">{params.slug.replace(/-/g, ' ')}</h1>
        <div className="w-full aspect-video rounded border overflow-hidden">
          <iframe src={`/games/${params.slug}/`} className="w-full h-full" />
        </div>
      </div>
    </main>
  );
}
