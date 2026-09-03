import { lookup } from 'node:dns/promises';

export interface LinkCheckOptions {
  fetch?: typeof fetch;
  /** Whether the network is available; link checks are skipped entirely when it is not. */
  online?: () => Promise<boolean>;
  timeoutMs?: number;
  /** Hosts that block automated clients; any HTTP response from them counts as reachable. */
  hostileHosts?: string[];
}

export const BOT_HOSTILE_HOSTS = [
  'youtube.com',
  'youtu.be',
  'zoom.us',
  'teams.microsoft.com',
  'vimeo.com',
  'facebook.com',
  'linkedin.com',
  'x.com',
];

export async function isOnline(): Promise<boolean> {
  try {
    await lookup('github.com');
    return true;
  } catch {
    return false;
  }
}

export type LinkOutcome = { reachable: true } | { reachable: false; detail: string };

type Attempt = { status: number } | { failure: string };

function hostMatches(url: string, hosts: string[]): boolean {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return hosts.some((h) => host === h || host.endsWith(`.${h}`));
}

/** HEAD first, then a one-byte GET; bot-hostile hosts pass on any HTTP status. */
export async function checkLink(url: string, options: LinkCheckOptions = {}): Promise<LinkOutcome> {
  const fetchImpl = options.fetch ?? fetch;
  const timeoutMs = options.timeoutMs ?? 8000;
  const hostile = hostMatches(url, options.hostileHosts ?? BOT_HOSTILE_HOSTS);

  const attempt = async (method: 'HEAD' | 'GET'): Promise<Attempt> => {
    try {
      const response = await fetchImpl(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
        headers: method === 'GET' ? { Range: 'bytes=0-0' } : {},
      });
      return { status: response.status };
    } catch (cause) {
      return { failure: (cause as Error).name === 'TimeoutError' ? 'timeout' : (cause as Error).message };
    }
  };

  const accepted = (result: Attempt) => 'status' in result && (hostile || result.status < 400);
  const describe = (result: Attempt) => ('status' in result ? String(result.status) : result.failure);

  const head = await attempt('HEAD');
  if (accepted(head)) return { reachable: true };
  const get = await attempt('GET');
  if (accepted(get)) return { reachable: true };
  return { reachable: false, detail: `HEAD ${describe(head)}, GET ${describe(get)}` };
}
