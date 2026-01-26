import { describe, it, expect, afterAll } from 'vitest';
import { createHttpServer } from '../server/httpServer.js';
import type { Server as HttpServer } from 'http';

// Minimal mock for MCP Server — we only test HTTP middleware, not MCP
function createMockMcpServer() {
  return {
    connect: () => Promise.resolve(),
    setRequestHandler: () => {},
  } as any;
}

function createTestApp(opts: { apiKey?: string; allowedOrigins?: string[] } = {}) {
  return createHttpServer({
    config: {
      port: 0,
      host: '127.0.0.1',
      skillsPath: '/tmp/test-skills',
      repoPath: '/tmp/test-repo',
      apiKey: opts.apiKey,
      allowedOrigins: opts.allowedOrigins || ['http://localhost:3003'],
      watchEnabled: false,
      logLevel: 'error',
    },
    createServer: createMockMcpServer,
  });
}

// Start server on random port, return base URL and cleanup function
function listen(app: ReturnType<typeof createTestApp>): Promise<{ url: string; close: () => void }> {
  return new Promise((resolve) => {
    const server: HttpServer = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => server.close(),
      });
    });
  });
}

describe('/health endpoint', () => {
  it('returns 200 with status ok', async () => {
    const app = createTestApp();
    const { url, close } = await listen(app);
    try {
      const res = await fetch(`${url}/health`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as { status: string; version: string; timestamp: string };
      expect(body.status).toBe('ok');
      expect(body.version).toBeDefined();
      expect(body.timestamp).toBeDefined();
    } finally {
      close();
    }
  });

  it('does not require API key', async () => {
    const app = createTestApp({ apiKey: 'secret' });
    const { url, close } = await listen(app);
    try {
      const res = await fetch(`${url}/health`);
      expect(res.status).toBe(200);
    } finally {
      close();
    }
  });
});

describe('API key auth', () => {
  it('returns 401 for /api without key when auth is enabled', async () => {
    const app = createTestApp({ apiKey: 'secret' });
    const { url, close } = await listen(app);
    try {
      const res = await fetch(`${url}/api/dashboard`);
      expect(res.status).toBe(401);
    } finally {
      close();
    }
  });

  it('allows /api with correct X-API-Key header', async () => {
    const app = createTestApp({ apiKey: 'secret' });
    const { url, close } = await listen(app);
    try {
      // No services mounted, so /api/dashboard will 404 — but it should NOT be 401
      const res = await fetch(`${url}/api/dashboard`, {
        headers: { 'X-API-Key': 'secret' },
      });
      // 404 because no services are mounted, but not 401
      expect(res.status).not.toBe(401);
    } finally {
      close();
    }
  });

  it('allows /api when auth is disabled', async () => {
    const app = createTestApp(); // no apiKey
    const { url, close } = await listen(app);
    try {
      const res = await fetch(`${url}/api/dashboard`);
      // No services mounted → 404, but not 401
      expect(res.status).not.toBe(401);
    } finally {
      close();
    }
  });
});

describe('CORS', () => {
  it('reflects allowed origin', async () => {
    const app = createTestApp({ allowedOrigins: ['http://example.com'] });
    const { url, close } = await listen(app);
    try {
      const res = await fetch(`${url}/health`, {
        headers: { Origin: 'http://example.com' },
      });
      expect(res.headers.get('access-control-allow-origin')).toBe('http://example.com');
    } finally {
      close();
    }
  });

  it('does not reflect disallowed origin', async () => {
    const app = createTestApp({ allowedOrigins: ['http://example.com'] });
    const { url, close } = await listen(app);
    try {
      const res = await fetch(`${url}/health`, {
        headers: { Origin: 'http://evil.com' },
      });
      expect(res.headers.get('access-control-allow-origin')).toBeNull();
    } finally {
      close();
    }
  });

  it('allows all origins when set to *', async () => {
    const app = createTestApp({ allowedOrigins: ['*'] });
    const { url, close } = await listen(app);
    try {
      const res = await fetch(`${url}/health`, {
        headers: { Origin: 'http://anything.com' },
      });
      expect(res.headers.get('access-control-allow-origin')).toBe('*');
    } finally {
      close();
    }
  });

  it('responds 200 to OPTIONS preflight', async () => {
    const app = createTestApp({ allowedOrigins: ['http://example.com'] });
    const { url, close } = await listen(app);
    try {
      const res = await fetch(`${url}/health`, {
        method: 'OPTIONS',
        headers: { Origin: 'http://example.com' },
      });
      expect(res.status).toBe(200);
      expect(res.headers.get('access-control-allow-methods')).toContain('GET');
    } finally {
      close();
    }
  });
});
