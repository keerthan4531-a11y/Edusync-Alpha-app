import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET — Get all AI model configurations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const configs = await db.aIModelConfig.findMany({
      orderBy: [{ stage: 'asc' }, { role: 'asc' }, { feature: 'asc' }],
    });

    return NextResponse.json({ success: true, configs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — Create or update model config
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { stage, role, feature, primaryModel, fallback1, fallback2, fallback3, fallback4, fallback5, isActive } = body;

    if (!stage || !role || !feature || !primaryModel) {
      return NextResponse.json({ error: 'Missing required fields: stage, role, feature, primaryModel' }, { status: 400 });
    }

    // Upsert — create or update
    const config = await db.aIModelConfig.upsert({
      where: {
        stage_role_feature: { stage, role, feature },
      },
      create: {
        stage,
        role,
        feature,
        primaryModel,
        fallback1: fallback1 || null,
        fallback2: fallback2 || null,
        fallback3: fallback3 || null,
        fallback4: fallback4 || null,
        fallback5: fallback5 || null,
        isActive: isActive !== false,
      },
      update: {
        primaryModel,
        fallback1: fallback1 || null,
        fallback2: fallback2 || null,
        fallback3: fallback3 || null,
        fallback4: fallback4 || null,
        fallback5: fallback5 || null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — Remove a config
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing config id' }, { status: 400 });
    }

    await db.aIModelConfig.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
