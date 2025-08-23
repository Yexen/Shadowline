
import "server-only";

export interface NewsArticle {
  id: string | number;
  title: string;
  url: string;
  source?: string;
  date?: string;
  snippet?: string;
  image?: string;
}

const SOURCES: { name: string; url: string }[] = [
  { name: "DC Blog",      url: "https://www.dc.com/blog/rss.xml" },
  { name: "IGN DC",       url: "https://www.ign.com/feed.xml" },
  { name: "Gamespot DC",  url: "https://www.gamespot.com/feeds/mashup/" },
  { name: "CBR DC",       url: "https://www.cbr.com/feed/" },
];

export async function getIntel({ topic, limit = 9 }:{topic:string; limit?:number}): Promise<NewsArticle[]> {
  // Be permissive: catch everything and return [] instead of throwing
  const results: NewsArticle[] = [];

  // If you use a 3rd-party RSS “bridge” API, drop it here; otherwise skip in Studio.
  // Keep it super safe for Studio SSR: no external fetch = []
  if (process.env.NODE_ENV !== "production") {
    return [];
  }

  try {
    const settled = await Promise.allSettled(
      SOURCES.map(s => fetch(s.url, { cache: "no-store", next: { revalidate: 600 } })
        .then(r => r.ok ? r.text() : "")
        .then(xml => ({ name: s.name, xml })))
    );

    for (const item of settled) {
      if (item.status !== "fulfilled" || !item.value.xml) continue;

      // Minimal RSS parsing (regex-ish) – permissive
      const entries = item.value.xml.split(/<\/item>|<\/entry>/i).slice(0, 20);
      for (const raw of entries) {
        const title = matchOne(raw, /<title[^>]*>([\s\S]*?)<\/title>/i);
        const link  = matchOne(raw, /<link[^>]*>([\s\S]*?)<\/link>/i) || matchOne(raw, /<link[^>]*href="([^"]+)"/i);
        const desc  = matchOne(raw, /<description[^>]*>([\s\S]*?)<\/description>/i) || matchOne(raw, /<summary[^>]*>([\s\S]*?)<\/summary>/i);
        const date  = matchOne(raw, /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || matchOne(raw, /<updated[^>]*>([\s\S]*?)<\/updated>/i);

        if (!title || !link) continue;
        if (topic && !`${title} ${desc}`.toLowerCase().includes(topic.toLowerCase())) continue;

        // Try to extract an image, but don’t require it
        const enclosure = matchOne(raw, /<enclosure[^>]*url="([^"]+)"/i);
        const media = matchOne(raw, /<media:content[^>]*url="([^"]+)"/i);
        const image = pickFirst(urlLooksImg(enclosure), urlLooksImg(media));

        results.push({
          id: link,
          title: decodeHTML(title).trim(),
          url: link,
          source: item.value.name,
          date,
          snippet: stripHTML(decodeHTML(desc || "")).slice(0, 240),
          image,
        });
      }
    }
  } catch {
    // ignore – return whatever we accumulated (likely [])
  }

  // Sort newest-first if dates exist
  results.sort((a, b) => (new Date(b.date || 0).getTime()) - (new Date(a.date || 0).getTime()));
  return results.slice(0, limit);
}

function matchOne(s: string, re: RegExp) { const m = s.match(re); return m ? m[1] : ""; }
function stripHTML(s: string) { return s.replace(/<[^>]+>/g, " "); }
function decodeHTML(s: string) {
  return s.replace(/&quot;/g,'"').replace(/&apos;/g,"'")
          .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">");
}
function urlLooksImg(u?: string) { return u && /\.(png|jpe?g|gif|webp)(\?|#|$)/i.test(u) ? u : undefined; }
function pickFirst<T>(...xs: (T|undefined)[]) { return xs.find(Boolean) as T|undefined; }
