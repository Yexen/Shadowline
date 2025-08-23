
import "server-only";
import Parser from 'rss-parser';

export type IntelItem = {
  id: string;
  title: string;
  source: string;
  date: string;
  snippet: string;
  image?: string;
  url: string;
};

const FEEDS = [
  // official + big games/comics sites that often cover Batman
  'https://www.dc.com/blog/rss.xml',
  'https://feeds.ign.com/ign/all',                   // IGN
  'https://www.gamespot.com/feeds/mashup/',          // GameSpot
  'https://screenrant.com/feed/',                    // ScreenRant
  'https://www.comicbookmovie.com/rss/news-feeds.rss',
  'https://www.cbr.com/feed/',                       // CBR
  'https://www.polygon.com/rss/index.xml',
  'https://www.theverge.com/rss/index.xml',
];

const parser = new Parser({
  headers: { 'user-agent': 'ShadowsOfGothamBot/1.0 (+server/only)' }
});

function firstImageFrom(item: any): string | undefined {
  // common places images hide in RSS
  const en = item.enclosure?.url;
  const media = item['media:content']?.url || item['media:thumbnail']?.url;
  if (en) return en;
  if (media) return media;

  // try to scrape img src= from summary content (very cheap regex)
  const html = item['content:encoded'] || item.content || item.summary || '';
  const m = String(html).match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1];
}

export async function getIntel({ limit = 12 } = {}): Promise<IntelItem[]> {
  const all: IntelItem[] = [];

  await Promise.allSettled(
    FEEDS.map(async (url) => {
      try {
        const feed = await parser.parseURL(url);
        const source = feed.title || new URL(url).hostname;

        for (const it of feed.items?.slice(0, 10) ?? []) {
          const link = it.link || it.guid;
          if (!link) continue;
          all.push({
            id: it.guid || link,
            title: it.title ?? 'Untitled',
            source,
            date: it.isoDate || it.pubDate || new Date().toISOString(),
            snippet: it.contentSnippet || it.summary || '',
            image: firstImageFrom(it),
            url: link,
          });
        }
      } catch (error) {
        // Ignore individual feed errors
        console.warn(`Failed to parse RSS feed: ${url}`, error);
      }
    })
  );

  // dedupe by url/title
  const seen = new Set<string>();
  const deduped = all.filter(a => {
    const key = a.url.split('?')[0];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // sort newest first, keep only “Batman/Arkham/Gotham” to stay on theme
  const themed = deduped.filter(a =>
    /bat(man)?|gotham|arkham|wayne/i.test(a.title + ' ' + a.snippet)
  );

  return themed
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, limit);
}
