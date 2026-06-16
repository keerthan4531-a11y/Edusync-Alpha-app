import { NextResponse } from "next/server";
import { HttpsProxyAgent } from "https-proxy-agent";
import { HttpProxyAgent } from "http-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
// @ts-ignore
import nodeFetch from "node-fetch";

// ═══════════════════════════════════════════════════════════════════
// Smart AI Router API Route
// Handles Scraping Free APIs, Proxy Rotation, and Forwarding
// ═══════════════════════════════════════════════════════════════════

interface ScrapedKeyEntry {
  key: string;
  model: string;
  category: string;
}

let cachedScrapedKeys: ScrapedKeyEntry[] = [];
let lastScrapeTime = 0;
const SCRAPE_URL = "https://raw.githubusercontent.com/alistaitsacle/free-llm-api-keys/main/README.md";
const SCRAPE_INTERVAL = 5 * 60 * 1000;

async function scrapeKeys(): Promise<ScrapedKeyEntry[]> {
  try {
    const res = await nodeFetch(SCRAPE_URL);
    const text = await res.text();
    const entries: ScrapedKeyEntry[] = [];

    let currentCategory = "";
    const lines = text.split("\n");
    for (const line of lines) {
      if (line.startsWith("### GPT-5.5")) currentCategory = "gpt-5.5";
      else if (line.startsWith("### Claude Opus")) currentCategory = "claude-opus-4-7";
      else if (line.startsWith("### Gemini")) currentCategory = "gemini-2.5-flash";
      else if (line.startsWith("### DeepSeek")) currentCategory = "deepseek-chat";
      else if (line.startsWith("### Multi-Model")) currentCategory = "smart-chat";
      else if (line.startsWith("### Kimi")) currentCategory = "kimi-k2.5";
      else if (line.startsWith("### Image")) currentCategory = "text-embedding";
      
      const match = /\|\s*`(sk-[a-zA-Z0-9_-]+)`\s*\|\s*([a-zA-Z0-9._-]+)\s*\|/.exec(line);
      if (match) {
        entries.push({
          key: match[1],
          model: match[2],
          category: currentCategory
        });
      }
    }
    return entries;
  } catch (error) {
    console.error('Failed to scrape keys:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════
// Free Proxy Pool Manager (Round-Robin)
// ═══════════════════════════════════════════════════════════════════
let proxyPool: string[] = [];
let currentProxyIndex = 0;
let lastProxyScrape = 0;

async function refreshProxyPool() {
  const now = Date.now();
  if (proxyPool.length > 0 && now - lastProxyScrape < 10 * 60 * 1000) {
    return; // Use cache if less than 10 mins old
  }

  try {
    console.log('[ProxyPool] Fetching fresh working proxies...');
    const res = await nodeFetch('https://proxylist.geonode.com/api/proxy-list?limit=100&page=1&sort_by=lastChecked&sort_type=desc&protocols=http%2Chttps');
    const data: any = await res.json();
    
    if (data && data.data) {
      const workingProxies = data.data
        .filter((p: any) => p.speed < 2000) 
        .map((p: any) => `http://${p.ip}:${p.port}`);
      
      if (workingProxies.length > 0) {
        proxyPool = workingProxies;
        lastProxyScrape = now;
        currentProxyIndex = 0;
        console.log(`[ProxyPool] Successfully loaded ${proxyPool.length} fast proxies.`);
        return;
      }
    }

    // Fallback Proxy source
    const fallbackRes = await nodeFetch('https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt');
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

function getNextProxy(): string | null {
  if (proxyPool.length === 0) return null;
  const proxy = proxyPool[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % proxyPool.length;
  return proxy;
}

// ═══════════════════════════════════════════════════════════════════
// Smart Router Logic
// ═══════════════════════════════════════════════════════════════════
export async function POST(req: Request) {
  try {
    const body = await req.json();
    let model = body.model || 'gpt-4o';
    const stream = body.stream || false;

    console.log(`[Master Route] Incoming request for model: "${model}"`);

    // 1. Scraped Key Logic (for fast, free access to premium models)
    if (!model.startsWith('g4f/')) {
      const now = Date.now();
      if (now - lastScrapeTime > SCRAPE_INTERVAL || cachedScrapedKeys.length === 0) {
        cachedScrapedKeys = await scrapeKeys();
        lastScrapeTime = now;
      }
      
      let matchingKeys = cachedScrapedKeys;
      if (model.includes('gpt-4')) matchingKeys = cachedScrapedKeys.filter((k: any) => k.category === 'smart-chat' || k.model.includes('gpt'));
      else if (model.includes('claude')) matchingKeys = cachedScrapedKeys.filter((k: any) => k.category === 'claude-opus-4-7' || k.model.includes('claude'));
      else if (model.includes('gemini')) matchingKeys = cachedScrapedKeys.filter((k: any) => k.category === 'gemini-2.5-flash');
      else if (model.includes('deepseek')) matchingKeys = cachedScrapedKeys.filter((k: any) => k.category === 'deepseek-chat');

      if (matchingKeys.length > 0) {
        const randomKey = matchingKeys[Math.floor(Math.random() * matchingKeys.length)];
        const authHeader = `Bearer ${randomKey.key}`;
        const targetModel = randomKey.model;
        const targetUrl = 'https://api.chatanywhere.tech/v1/chat/completions';
        
        console.log(`[API-Scraper] Using scraped key for ${targetModel} on ${targetUrl}`);
        
        try {
          const backendRes = await nodeFetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader
            },
            body: JSON.stringify({ ...body, model: targetModel })
          });

          if (backendRes.ok) {
            if (stream) return new Response(backendRes.body as any, { headers: { 'Content-Type': 'text/event-stream' } });
            return NextResponse.json(await backendRes.json());
          }
        } catch (e) {
          console.warn(`[API-Scraper] Failed to use scraped key:`, e);
        }
      }
      
      // If Scraped key failed or no key found, fall back to G4F Proxy Logic
      console.log(`[Master Route] Scraped keys failed or unavailable. Falling back to G4F proxy loop.`);
    }

    // 2. G4F Proxy Logic
    await refreshProxyPool();
    
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const proxyUrl = getNextProxy();
      if (!proxyUrl) {
        throw new Error('No proxies available in the pool.');
      }

      console.log(`[ProxyPool] Attempt ${attempt}/${maxRetries} using Proxy: ${proxyUrl}`);
      const agent = proxyUrl.startsWith('https') ? new HttpsProxyAgent(proxyUrl) : new HttpProxyAgent(proxyUrl);
      
      // Default to g4f API
      let targetEndpoint = 'https://g4f.space/v1/chat/completions';
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const g4fRes = await nodeFetch(targetEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': stream ? 'text/event-stream' : 'application/json',
            'Origin': 'https://g4f.dev',
            'Referer': 'https://g4f.dev/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'X-Forwarded-For': `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
          },
          body: JSON.stringify({ ...body, model }),
          agent: agent,
          signal: controller.signal as any
        });
        
        clearTimeout(timeoutId);

        if (g4fRes.ok) {
          console.log(`[ProxyPool] Success on attempt ${attempt}!`);
          if (stream) {
            return new Response(g4fRes.body as any, { headers: { 'Content-Type': 'text/event-stream' } });
          }
          const responseData = await g4fRes.json();
          return NextResponse.json(responseData);
        } else {
          const errorText = await g4fRes.text();
          lastError = `Status ${g4fRes.status}: ${errorText.substring(0, 100)}`;
          console.log(`[Proxy Failed] ${lastError}`);
        }
      } catch (error: any) {
        lastError = error.message;
        console.log(`[Proxy Error] ${error.message}`);
      }
    }

    throw new Error(`All ${maxRetries} proxies failed. Last error: ${lastError}`);
    
  } catch (error: any) {
    console.error('Master API Error:', error);
    return NextResponse.json(
      { ok: false, engine: "proxy", error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
