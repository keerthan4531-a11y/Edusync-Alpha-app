/**
 * proxyPool.ts — Shared Proxy Pool Manager
 * 
 * Used by the chat/completions route for IP rotation.
 * Fetches fast proxies from free sources and rotates round-robin.
 */

// @ts-ignore
import nodeFetch from 'node-fetch';

let proxyPool: string[] = [];
let currentProxyIndex = 0;
let lastProxyScrape = 0;
let cachedWorkingProxy: string | null = null;

export async function refreshProxyPool() {
  const now = Date.now();
  if (proxyPool.length > 0 && now - lastProxyScrape < 10 * 60 * 1000) {
    return;
  }

  try {
    console.log('[ProxyPool] Fetching fresh working proxies...');
    const res = await nodeFetch(
      'https://proxylist.geonode.com/api/proxy-list?limit=100&page=1&sort_by=lastChecked&sort_type=desc&protocols=http%2Chttps'
    );
    const data: any = await res.json();

    if (data && data.data) {
      const workingProxies = data.data
        .filter((p: any) => p.speed < 2000)
        .map((p: any) => `http://${p.ip}:${p.port}`);

      if (workingProxies.length > 0) {
        proxyPool = workingProxies;
        lastProxyScrape = now;
        currentProxyIndex = 0;
        console.log(`[ProxyPool] Loaded ${proxyPool.length} fast proxies.`);
        return;
      }
    }

    // Fallback source
    const fallbackRes = await nodeFetch(
      'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt'
    );
    const fallbackText = await fallbackRes.text();
    const lines = fallbackText.split('\n').filter((l: string) => l.trim().length > 0);
    const shuffled = lines.sort(() => 0.5 - Math.random()).slice(0, 100);
    proxyPool = shuffled.map((p: string) => `http://${p.trim()}`);
    lastProxyScrape = now;
    currentProxyIndex = 0;
    console.log(`[ProxyPool] Fallback loaded ${proxyPool.length} proxies.`);
  } catch (e) {
    console.error('[ProxyPool] Error fetching proxies:', e);
  }
}

export function getNextProxy(): string | null {
  if (proxyPool.length === 0) return null;
  const proxy = proxyPool[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % proxyPool.length;
  return proxy;
}

export function getCachedWorkingProxy(): string | null {
  return cachedWorkingProxy;
}

export function setCachedWorkingProxy(url: string) {
  cachedWorkingProxy = url;
}

export function getProxyPool(): string[] {
  return proxyPool;
}
