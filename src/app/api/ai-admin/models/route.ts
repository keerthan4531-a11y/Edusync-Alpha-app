import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AI_MODELS } from '@/api/aiEngine';

// GET — Fetch all available models from the new seed-ai-config
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Group by engine
    const grouped: Record<string, typeof AI_MODELS> = {};
    for (const model of AI_MODELS) {
      const engine = model.engine || 'other';
      if (!grouped[engine]) grouped[engine] = [];
      grouped[engine].push(model);
    }

    return NextResponse.json({
      success: true,
      models: AI_MODELS,
      grouped,
      totalCount: AI_MODELS.length,
    });
  } catch (error: any) {
    console.error('[AI Admin] Failed to fetch models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models', details: error.message },
      { status: 500 }
    );
  }
}
