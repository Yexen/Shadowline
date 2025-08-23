
export async function extractImageFromArticle(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { redirect: "follow", cache: "no-store" });
    if (!res.ok) return;
    const html = await res.text();

    // Quick OG/Twitter meta scan
    const pick = (prop: string) => {
      const m = html.match(new RegExp(`<meta[^>]+${prop}[^>]+content="([^"]+)"`, "i"));
      return m?.[1];
    };
    return (
      pick('property="og:image"') ||
      pick('name="twitter:image"') ||
      pick('property=\'og:image\'') ||
      undefined
    );
  } catch {
    return;
  }
}
