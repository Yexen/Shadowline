
// public/js/firebaseHelper.js
// Shadowline Firebase Helper ⭐
// Lightweight client for Cloud Functions behind Hosting rewrites.

const FirebaseHelper = (() => {
  // ===== Config =====
  const CONFIG = {
    baseURL: "",                 // empty = same origin (Hosting)
    timeoutMs: 10_000,           // 10s
    maxRetries: 2,               // retry on transient errors
    cacheTtlMs: 10 * 60 * 1000,  // 10 minutes (mirror server cache)
  };

  // ===== Internal state =====
  const _cache = new Map(); // key -> { at:number, data:any }

  // ===== Utils =====
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function fetchJSON(path, { method = "GET", body, headers = {}, useCache = true } = {}) {
    const url = CONFIG.baseURL + path;
    const cacheKey = method + ":" + url + (body ? ":" + JSON.stringify(body) : "");

    // Serve fresh cache
    if (useCache && _cache.has(cacheKey)) {
      const { at, data } = _cache.get(cacheKey);
      if (Date.now() - at < CONFIG.cacheTtlMs) return { ok: true, data, fromCache: true };
      _cache.delete(cacheKey);
    }

    // Retry loop
    let attempt = 0;
    while (attempt <= CONFIG.maxRetries) {
      attempt++;
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), CONFIG.timeoutMs);

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", ...headers },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(t);

        // non-2xx
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          // 5xx → retryable; 4xx → probably client issue
          const retryable = res.status >= 500 || res.status === 429;
          if (retryable && attempt <= CONFIG.maxRetries) {
            await sleep(300 * attempt);
            continue;
          }
          return { ok: false, error: { status: res.status, message: text || res.statusText } };
        }

        const data = await res.json();
        if (useCache) _cache.set(cacheKey, { at: Date.now(), data });
        return { ok: true, data, fromCache: false };

      } catch (err) {
        clearTimeout(t);
        const isAbort = err?.name === "AbortError";
        const retryable = isAbort || err?.message?.includes("NetworkError") || err?.message?.includes("Failed to fetch");
        if (retryable && attempt <= CONFIG.maxRetries) {
          await sleep(300 * attempt);
          continue;
        }
        return { ok: false, error: { status: 0, message: err?.message || "Network error" } };
      }
    }
  }

  // ===== Public API =====

  /** Get trending/most-viewed Batman videos (from oracleVideos). */
  async function getBatmanVideos(options = {}) {
    return fetchJSON("/api/videos", { useCache: options.useCache !== false });
  }

  /** Get Batman news headlines (from gcpdNews). */
  async function getBatmanNews(options = {}) {
    return fetchJSON("/api/news", { useCache: options.useCache !== false });
  }

  /** Generic GET to any additional HTTPS Function you add later. */
  async function get(path, opts = {}) {
    return fetchJSON(path, { ...opts, method: "GET" });
  }

  /** Generic POST to any additional HTTPS Function you add later. */
  async function post(path, payload = {}, opts = {}) {
    return fetchJSON(path, { ...opts, method: "POST", body: payload });
  }

  /** Clear local cache (e.g., after manual refresh). */
  function clearCache() {
    _cache.clear();
  }

  /** Override baseURL (useful if you call the function URL directly). */
  function setBaseURL(url) {
    CONFIG.baseURL = url || "";
  }

  return {
    getBatmanVideos,
    getBatmanNews,
    get,
    post,
    clearCache,
    setBaseURL,
  };
})();

// Export to window for easy use in inline scripts
window.FirebaseHelper = FirebaseHelper;
