/**
 * proxy-manager.ts — Proxy IP rotation for anonymizing g4f requests
 * 
 * Maintains a pool of proxy IPs, rotates per-request so the upstream
 * provider sees different IPs. This prevents rate limiting and provides
 * an "unlimited" feel to users.
 */

interface ProxyEntry {
  url: string;
  protocol: 'http' | 'https' | 'socks5';
  alive: boolean;
  lastChecked: number;
  failCount: number;
}

// In-memory proxy pool (refreshed periodically)
let proxyPool: ProxyEntry[] = [];
let lastPoolRefresh = 0;
let currentProxyIndex = 0;

const POOL_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const MAX_FAIL_COUNT = 3;

// Free proxy list APIs
const PROXY_SOURCES = [
  'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=5000&country=all&ssl=yes&anonymity=elite',
  'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
];

/**
 * Get a proxy URL for the next request (round-robin rotation)
 * Returns null if no proxies available or proxy is disabled
 */
export async function getProxyUrl(): Promise<string | null> {
  // Check if we should use proxies at all
  if (process.env.PROXY_ENABLED === 'false') {
    return null;
  }

  // Try custom proxies first (from admin config)
  const customProxies = getCustomProxies();
  if (customProxies.length > 0) {
    const proxy = customProxies[currentProxyIndex % customProxies.length];
    currentProxyIndex++;
    return proxy;
  }

  // Refresh pool if stale
  if (Date.now() - lastPoolRefresh > POOL_REFRESH_INTERVAL || proxyPool.length === 0) {
    await refreshProxyPool();
  }

  // Get alive proxies
  const aliveProxies = proxyPool.filter(p => p.alive);
  if (aliveProxies.length === 0) {
    return null;
  }

  // Round-robin selection
  const proxy = aliveProxies[currentProxyIndex % aliveProxies.length];
  currentProxyIndex++;
  return proxy.url;
}

/**
 * Report a proxy as failed (after a request failure)
 */
export function reportProxyFailure(proxyUrl: string): void {
  const proxy = proxyPool.find(p => p.url === proxyUrl);
  if (proxy) {
    proxy.failCount++;
    if (proxy.failCount >= MAX_FAIL_COUNT) {
      proxy.alive = false;
    }
  }
}

/**
 * Report a proxy as successful
 */
export function reportProxySuccess(proxyUrl: string): void {
  const proxy = proxyPool.find(p => p.url === proxyUrl);
  if (proxy) {
    proxy.failCount = 0;
    proxy.alive = true;
  }
}

/**
 * Get custom proxies from environment or admin settings
 */
function getCustomProxies(): string[] {
  const envProxies = process.env.CUSTOM_PROXIES;
  if (envProxies) {
    try {
      return JSON.parse(envProxies);
    } catch {
      return envProxies.split(',').map(p => p.trim()).filter(Boolean);
    }
  }
  return [];
}

/**
 * Refresh the proxy pool from free proxy sources
 */
async function refreshProxyPool(): Promise<void> {
  const newProxies: ProxyEntry[] = [];

  for (const source of PROXY_SOURCES) {
    try {
      const response = await fetch(source, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) continue;

      const text = await response.text();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

      for (const line of lines.slice(0, 50)) { // Cap at 50 per source
        // Format: ip:port
        const match = line.match(/^(\d+\.\d+\.\d+\.\d+):(\d+)$/);
        if (match) {
          newProxies.push({
            url: `http://${match[1]}:${match[2]}`,
            protocol: 'http',
            alive: true,
            lastChecked: Date.now(),
            failCount: 0,
          });
        }
      }
    } catch {
      // Skip failed proxy sources
      continue;
    }
  }

  if (newProxies.length > 0) {
    proxyPool = newProxies;
    lastPoolRefresh = Date.now();
  }
}

/**
 * Get proxy pool status (for admin dashboard)
 */
export function getProxyPoolStatus(): {
  total: number;
  alive: number;
  dead: number;
  lastRefresh: number;
} {
  const alive = proxyPool.filter(p => p.alive).length;
  return {
    total: proxyPool.length,
    alive,
    dead: proxyPool.length - alive,
    lastRefresh: lastPoolRefresh,
  };
}

/**
 * Force refresh the proxy pool (admin action)
 */
export async function forceRefreshProxyPool(): Promise<void> {
  lastPoolRefresh = 0;
  await refreshProxyPool();
}

/**
 * Set custom proxies from admin settings
 */
export function setCustomProxiesFromConfig(proxiesJson: string | null): void {
  if (proxiesJson) {
    try {
      const proxies = JSON.parse(proxiesJson);
      if (Array.isArray(proxies)) {
        process.env.CUSTOM_PROXIES = JSON.stringify(proxies);
      }
    } catch {
      // Invalid JSON, ignore
    }
  }
}
