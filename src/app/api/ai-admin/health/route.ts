import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AI_MODELS } from '@/api/aiEngine';
import { createSignedHeaders } from '@/lib/security';

// GET — Check health of all configured models by sending a quick test prompt
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Pick a few representative models to health check (not all 45+)
    const modelsToCheck = AI_MODELS.filter(m =>
      ['di-mimo-v2.5-pro', 'gemini-3.5-flash', 'ddg-gpt-4o-mini', 'g4f-gpt-5.5', 'auto-smart-chat'].includes(m.id)
    );

    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || '127.0.0.1:3000';

    const results: Record<string, { alive: boolean; latency: number; error?: string }> = {};

    for (const model of modelsToCheck) {
      const startTime = Date.now();
      const isG4F = model.engine === 'g4f' || model.modelStr.startsWith('g4f/') || model.modelStr.startsWith('deepinfra/') || model.modelStr.startsWith('qwen_worker/');
      const endpoint = isG4F ? `${protocol}://${host}/api/chat/g4f` : `${protocol}://${host}/api/chat/completions`;

      try {
        const bodyData = { messages: [{ role: 'user', content: 'Say OK' }], model: model.modelStr, stream: false };
        const secureHeaders = await createSignedHeaders(bodyData);
        secureHeaders['Content-Type'] = 'application/json';
        secureHeaders['Origin'] = `${protocol}://${host}`;
        secureHeaders['Referer'] = `${protocol}://${host}/`;
        if (process.env.INIXA_PROXY_SECRET) {
          secureHeaders['Authorization'] = `Bearer ${process.env.INIXA_PROXY_SECRET}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: secureHeaders,
          body: JSON.stringify(bodyData),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const latency = Date.now() - startTime;
        results[model.id] = { alive: res.ok, latency, error: res.ok ? undefined : `HTTP ${res.status}` };
      } catch (e: any) {
        results[model.id] = { alive: false, latency: Date.now() - startTime, error: e.message };
      }
    }

    return NextResponse.json({
      success: true,
      health: results,
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
