
export async function extractImageFromArticle(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { 
        redirect: "follow", 
        cache: "no-store",
        headers: {
            // Some sites block requests without a user-agent
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    if (!res.ok) return;
    const html = await res.text();

    // Quick OG/Twitter meta scan
    const pick = (prop: string) => {
      const m = html.match(new RegExp(`<meta[^>]+${prop}[^>]+content="([^"]+)"`, "i"));
      return m?.[1];
    };
    
    // Use .replace to clean up HTML entities that sometimes appear in URLs
    const imageUrl = (
      pick('property="og:image"') ||
      pick('name="twitter:image"') ||
      pick('property=\'og:image\'') ||
      undefined
    )?.replace(/&amp;/g, '&');
    
    return imageUrl;

  } catch (e){
    console.warn(`Could not fetch article to extract image for ${url}`, e);
    return;
  }
}
