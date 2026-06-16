import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET — Fetch AI request logs with pagination
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const stage = searchParams.get('stage');
    const feature = searchParams.get('feature');
    const success = searchParams.get('success');

    const where: any = {};
    if (stage) where.stage = stage;
    if (feature) where.feature = feature;
    if (success !== null && success !== undefined) where.success = success === 'true';

    const [logs, total] = await Promise.all([
      db.aIRequestLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.aIRequestLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
