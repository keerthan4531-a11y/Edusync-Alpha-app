import { NextResponse } from 'next/server';
import nodeFetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { getProxyPool, refreshProxyPool } from '@/lib/proxyPool';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const prompt = url.searchParams.get('prompt');
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const seed = Math.floor(Math.random() * 100000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=500&nologo=true&seed=${seed}`;

    // Ensure proxies are loaded
    await refreshProxyPool();
    const agents = getProxyPool();
    let imageBuffer: ArrayBuffer | null = null;
    let contentType = 'image/jpeg';

    // Try 1 random proxy (speed optimization)
    const maxTries = 1;
    let success = false;

    // Shuffle agents
    const shuffledAgents = [...agents].sort(() => 0.5 - Math.random());

    for (let i = 0; i < maxTries; i++) {
      try {
        const proxyStr = shuffledAgents[i];
        let agent: any = null;
        if (proxyStr.startsWith('socks')) {
          agent = new SocksProxyAgent(proxyStr);
        } else if (proxyStr.startsWith('https')) {
          agent = new HttpsProxyAgent(proxyStr);
        } else {
          agent = new HttpProxyAgent(proxyStr);
        }

        console.log(`[Proxy-Image] Try ${i + 1}/${maxTries} using proxy...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await nodeFetch(imageUrl, {
          agent: agent,
          signal: controller.signal as any
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          imageBuffer = await response.arrayBuffer();
          contentType = response.headers.get('content-type') || 'image/jpeg';
          success = true;
          console.log(`[Proxy-Image] Success!`);
          break;
        } else {
          console.warn(`[Proxy-Image] Try ${i + 1} failed with status ${response.status}`);
        }
      } catch (err: any) {
        console.warn(`[Proxy-Image] Try ${i + 1} failed: ${err.message}`);
      }
    }

    // Fallback: If proxies fail, try direct fetch
    if (!success) {
      console.log(`[Proxy-Image] All proxies failed. Trying direct fetch...`);
      const response = await nodeFetch(imageUrl);
      if (response.ok) {
        imageBuffer = await response.arrayBuffer();
        contentType = response.headers.get('content-type') || 'image/jpeg';
      } else {
        throw new Error('Failed to fetch image directly');
      }
    }

    if (!imageBuffer) {
      throw new Error('Image buffer is empty');
    }

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error: any) {
    console.error(`[Proxy-Image] Error:`, error.message);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
