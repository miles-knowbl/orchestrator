const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export function fetchApi(path: string, options?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  return fetch(`${API_URL}${path}`, { ...options, headers });
}

/** Base URL for constructing EventSource / SSE connections */
export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

/**
 * Maps an API path to its static JSON fallback path.
 * Returns null if no static fallback exists for this path.
 */
function getStaticFallbackPath(apiPath: string): string | null {
  if (apiPath === '/api/loops') return '/data/loops.json';
  const match = apiPath.match(/^\/api\/loops\/([^/]+)$/);
  if (match) return `/data/loops/${match[1]}.json`;
  return null;
}

export interface FetchResult {
  data: any;
  isStatic: boolean;
}

/**
 * Fetch from the live API first. If that fails and a static fallback
 * exists for the given path, fetch the static JSON instead.
 */
export async function fetchWithFallback(apiPath: string): Promise<FetchResult> {
  try {
    const res = await fetchApi(apiPath);
    if (res.ok) {
      return { data: await res.json(), isStatic: false };
    }
  } catch {
    // Network error — expected when no backend is running
  }

  const staticPath = getStaticFallbackPath(apiPath);
  if (!staticPath) {
    throw new Error(`API unavailable and no static fallback for ${apiPath}`);
  }

  const res = await fetch(staticPath);
  if (!res.ok) {
    throw new Error(`Failed to load data`);
  }

  return { data: await res.json(), isStatic: true };
}
