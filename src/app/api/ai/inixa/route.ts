import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateResponse, type INIXAMessage } from '@/lib/inixa-ai';

/**
 * /api/ai/inixa — The unified AI endpoint for ALL user requests
 * Calls unified generateResponse with DB-driven models and fallbacks
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message, history, context, systemPrompt, model, stage, feature } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const messages: INIXAMessage[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-10)) {
        messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content });
      }
    }
    messages.push({ role: 'user', content: message });

    // Call dynamic DB-driven fallback routing
    const result = await generateResponse(
      messages,
      {
        stage: stage || 'general',
        feature: feature || 'chat',
        role: session.user.role || 'STUDENT',
        userId: session.user.id,
      }
    );

    return NextResponse.json({
      success: result.success,
      response: result.response,
      provider: result.modelUsed, // "INIXA Flash Pro", "INIXA Nova", etc.
      responseTime: result.responseTime,
    });
  } catch (error: any) {
    console.error('[INIXA] API Error:', error);
    return NextResponse.json(
      { success: false, error: 'INIXA AI is temporarily unavailable.', provider: 'INIXA AI' },
      { status: 500 }
    );
  }
}
