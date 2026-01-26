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
