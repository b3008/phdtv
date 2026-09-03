import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { loadDisciplines } from '../../src/schema/disciplines.ts';
import { formatFinding, hasBlockingFindings, validateProject } from '../../src/validate/index.ts';

const disciplines = loadDisciplines().slugs;
const RECORD = 'records/2026/2026-09-15-tudelft-jane-doe.md';

type Responder = (url: string, method: string) => Response | Error;

function fakeFetch(respond: Responder) {
  const calls: Array<{ url: string; method: string }> = [];
  const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    calls.push({ url, method });
    const result = respond(url, method);
    if (result instanceof Error) throw result;
    return result;
  });
  return { fetchImpl: fetchImpl as unknown as typeof fetch, calls };
}

const run = (fetchImpl: typeof fetch, online = true) =>
  validateProject({
    rootDir: resolve('test/fixtures/links-project'),
    disciplines,
    links: { fetch: fetchImpl, online: async () => online, timeoutMs: 50 },
  });

describe('link liveness', () => {
  it('reports nothing when every link responds to HEAD', async () => {
    const { fetchImpl } = fakeFetch(() => new Response(null, { status: 200 }));
    expect(await run(fetchImpl)).toEqual([]);
  });

  it('warns, without blocking, when a link does not respond', async () => {
    const { fetchImpl } = fakeFetch((url) =>
      url.startsWith('https://streams.example') ? new Response(null, { status: 404 }) : new Response(null, { status: 200 }),
    );
    const findings = await run(fetchImpl);
    expect(findings.map(formatFinding)).toEqual([
      `${RECORD}: link: [warning] stream.url https://streams.example/live/123 did not respond (HEAD 404, GET 404)`,
    ]);
    expect(hasBlockingFindings(findings)).toBe(false);
  });

  it('falls back to a ranged GET when HEAD is refused', async () => {
    const { fetchImpl, calls } = fakeFetch((_url, method) =>
      method === 'HEAD' ? new Response(null, { status: 405 }) : new Response('x', { status: 206 }),
    );
    expect(await run(fetchImpl)).toEqual([]);
    expect(calls.filter((c) => c.method === 'GET').length).toBeGreaterThan(0);
  });

  it('counts a bot-hostile host as reachable on any HTTP response', async () => {
    const { fetchImpl } = fakeFetch((url) =>
      url.includes('youtube.com') ? new Response(null, { status: 403 }) : new Response(null, { status: 200 }),
    );
    expect(await run(fetchImpl)).toEqual([]);
  });

  it('warns when a bot-hostile host gives no HTTP response at all', async () => {
    const { fetchImpl } = fakeFetch((url) =>
      url.includes('youtube.com') ? new Error('ECONNRESET') : new Response(null, { status: 200 }),
    );
    const findings = await run(fetchImpl);
    expect(findings.map((f) => f.rule)).toEqual(['link']);
    expect(findings[0]?.message).toMatch(/recording\.url https:\/\/www\.youtube\.com\/watch\?v=abc did not respond/);
  });

  it('skips link checks entirely when offline', async () => {
    const { fetchImpl, calls } = fakeFetch(() => new Error('should not be called'));
    expect(await run(fetchImpl, false)).toEqual([]);
    expect(calls).toEqual([]);
  });
});
