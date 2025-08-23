
import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { htmlToText } from "html-to-text";
import { checkUrl } from "@/lib/checkUrl";
import { extractImageFromArticle } from "@/lib/extractImage";

type FeedItem = {
  id: string | number;
  title: string;
  url: string;
  source: string;
  date: string;
  snippet: string;
  image?: string;
};

const SOURCES: { name: string; url: string; pickImage?: (i: any) => string | undefined }[] = [
  // DC & games
  { name: "DC Blog", url: "https://www.dc.com/blog/rss.xml" },
  { name: "DC News", url: "https://www.dc.com/taxonomy/term/11/feed" },
  { name: "WB Games", url: "https://community.wbgames.com/blogs?format=rss" },

  // Major outlets that regularly cover Batman/DC
  { name: "IGN", url: "https://feeds.ign.com/ign/all" },
  { name: "GameSpot", url: "https://www.gamespot.com/feeds/news/" },
  { name: "ScreenRant", url: "https://screenrant.com/feed/" },
  { name: "CBR", url: "https://www.cbr.com/feed/" },
  { name: "Polygon", url: "https://www.polygon.com/rss/index.xml" },
];

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumb", { keepArray: true }],
      ["content:encoded", "contentEncoded"],
      ["enclosure", "enclosure"],
    ],
  },
});

const looksBatman = (title = "", summary = "") =>
  /(batman|wayne|gotham|arkham|joker|catwoman|penguin|riddler|bat-family|dark knight)/i.test(
    `${title} ${summary}` || ""
  );

function firstImageCandidate(item: any): string | undefined {
  // 1) RSS media fields
  const mc = item.mediaContent?.find?.((m: any) => m.$?.url)?.$?.url;
  if (mc) return mc;

  const mt = item.mediaThumb?.find?.((m: any) => m.$?.url)?.$?.url;
  if (mt) return mt;

  // 2) enclosure image
  const enc = item.enclosure?.url;
  if (enc && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(enc)) return enc;

  // 3) inline <img> in content
  const img = (item.contentEncoded || item["content:encoded"] || item["content"])?.match(
    /<img[^>]+src=["']([^"']+)["']/i
  )?.[1];
  if (img) return img;

  return undefined;
}

export async function GET() {
  try {
    const all: FeedItem[] = [];

    // Fetch & parse all feeds in parallel
    const results = await Promise.allSettled(SOURCES.map((s) => parser.parseURL(s.url)));

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const source = SOURCES[i].name;

      if (r.status !== "fulfilled") continue;

      for (const item of r.value.items ?? []) {
        const url = (item.link || item.guid || "").toString();
        const title = (item.title || "").toString().trim();
        const rawSummary = (item.contentSnippet || item.content || item.summary || "").toString();

        if (!url || !title) continue;
        if (!looksBatman(title, rawSummary)) continue;

        // Build item
        const image = firstImageCandidate(item);
        all.push({
          id: url,
          title,
          url,
          source,
          date: (item.isoDate || item.pubDate || new Date().toISOString()).toString(),
          snippet: htmlToText(rawSummary, { wordwrap: 100 }).slice(0, 280),
          image,
        });
      }
    }

    // Dedupe by title or URL
    const seen = new Set<string>();
    const deduped = all.filter((a) => {
      const k = (a.title.toLowerCase() + "|" + a.url.toLowerCase()).slice(0, 300);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    // Sort newest first
    deduped.sort((a, b) => +new Date(b.date) - +new Date(a.date));

    // Validate links + fill missing images via OG scrape (limited to the first 12 to keep it quick)
    const limited = deduped.slice(0, 18);
    const enriched = await Promise.all(
      limited.map(async (i) => {
        const status = await checkUrl(i.url);
        let img = i.image;
        if (!img && status.ok) {
          img = await extractImageFromArticle(status.finalUrl || i.url);
        }
        return { ...i, url: status.finalUrl || i.url, alive: status.ok, image: img };
      })
    );

    // Only return alive links; if none, return the top few with alive=false so UI can show “Offline”
    const alive = enriched.filter((i) => i.alive);
    const payload = (alive.length > 0 ? alive : enriched).map((i) => ({
      id: i.id,
      title: i.title,
      source: i.source,
      date: i.date,
      snippet: i.snippet,
      url: i.url,
      image: i.image || "https://placehold.co/800x450.png?text=Batman+News",
      alive: i.alive,
    }));

    return NextResponse.json(payload.slice(0, 12), { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load news." }, { status: 500 });
  }
}
