
export type UrlStatus = { ok: boolean; finalUrl?: string; reason?: string };

export async function checkUrl(url?: string): Promise<UrlStatus> {
  if (!url) return { ok: false, reason: "No URL" };

  const attempt = async (method: "HEAD" | "GET") => {
    try {
      return await fetch(url, { method, redirect: "follow", cache: "no-store" });
    } catch {
      return null;
    }
  };

  let res = await attempt("HEAD");
  if (!res || res.status >= 400 || res.status === 405 || res.status === 403) {
    res = await attempt("GET");
  }

  if (res && res.ok) return { ok: true, finalUrl: res.url || url };
  return { ok: false, reason: res ? `HTTP ${res.status}` : "Network/CORS" };
}
