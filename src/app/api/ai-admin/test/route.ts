import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSignedHeaders } from '@/lib/security';
import { AI_MODELS } from '@/api/aiEngine';

// POST — Test a specific model with a prompt (admin playground)
// Now routes through the new /api/chat/completions or /api/chat/g4f endpoints
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { model, prompt, systemPrompt } = body;

    if (!model || !prompt) {
      return NextResponse.json({ error: 'Missing required fields: model, prompt' }, { status: 400 });
    }

    const startTime = Date.now();
    const messages: any[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    // Determine which endpoint to use based on model string
    let selectedModel = model;
    const foundModel = AI_MODELS.find(m => m.id === selectedModel);
    if (foundModel) {
      selectedModel = foundModel.modelStr;
    }

    const isG4F = selectedModel.startsWith('g4f/') || selectedModel.startsWith('deepinfra/') || selectedModel.startsWith('qwen_worker/');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || '127.0.0.1:3000';
    const endpoint = isG4F ? `${protocol}://${host}/api/chat/g4f` : `${protocol}://${host}/api/chat/completions`;

    const bodyData = { messages, model: selectedModel, stream: false };
    const secureHeaders = await createSignedHeaders(bodyData);
    secureHeaders['Content-Type'] = 'application/json';
    secureHeaders['Origin'] = `${protocol}://${host}`;
    secureHeaders['Referer'] = `${protocol}://${host}/`;
    if (process.env.INIXA_PROXY_SECRET) {
      secureHeaders['Authorization'] = `Bearer ${process.env.INIXA_PROXY_SECRET}`;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: secureHeaders,
      body: JSON.stringify(bodyData),
    });

    const responseTime = Date.now() - startTime;
    const data = await res.json();
    const response = data.choices?.[0]?.message?.content || data.reply || data.error || '';

    return NextResponse.json({
      success: res.ok,
      response,
      modelUsed: model,
      responseTime,
      error: res.ok ? undefined : (data.error || 'Model test failed'),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}
