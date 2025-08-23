
export async function safeFetch<T>(input: RequestInfo, init?: RequestInit) {
  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[safeFetch] HTTP", res.status, input, text?.slice(0, 300));
      return { data: null as T | null, error: `HTTP ${res.status}` } as const;
    }
    const data = (await res.json()) as T;
    return { data, error: null } as const;
  } catch (e: any) {
    console.error("[safeFetch] Network error", input, e?.message || e);
    return { data: null as T | null, error: "NETWORK_ERROR" } as const;
  }
}
