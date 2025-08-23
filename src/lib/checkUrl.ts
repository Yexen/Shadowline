
export type UrlStatus = { ok: boolean; finalUrl?: string; reason?: string; archiveUrl?: string };

export async function checkUrl(rawUrl?: string): Promise<UrlStatus> {
  if (!rawUrl) return { ok: false, reason: "No URL provided" };

  // Try HEAD first (fast), then GET fallback (some sites block HEAD).
  const tryFetch = async (method: "HEAD" | "GET") => {
    try {
      const res = await fetch(rawUrl, { method, redirect: "follow", cache: "no-store" });
      return res;
    } catch (e: any) {
      return null;
    }
  };

  let res = await tryFetch("HEAD");
  if (!res || (res.status >= 400 || res.status === 405 || res.status === 403)) {
    res = await tryFetch("GET");
  }

  if (res && res.ok) {
    return { ok: true, finalUrl: res.url || rawUrl };
  }

  // Offer Wayback as a fallback preview link
  const archiveUrl = `https://web.archive.org/web/*/${encodeURIComponent(rawUrl)}`;
  return {
    ok: false,
    reason: res ? `HTTP ${res.status}` : "Network/CORS error",
    archiveUrl
  };
}
