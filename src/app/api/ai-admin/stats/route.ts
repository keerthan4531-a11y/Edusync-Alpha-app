import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET — Get AI statistics for admin dashboard
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '24h';

    let timeRange: { start: Date; end: Date } | undefined;
    const now = new Date();

    switch (range) {
      case '1h':
        timeRange = { start: new Date(now.getTime() - 60 * 60 * 1000), end: now };
        break;
      case '24h':
        timeRange = { start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end: now };
        break;
      case '7d':
        timeRange = { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now };
        break;
      case '30d':
        timeRange = { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now };
        break;
      default:
        timeRange = undefined;
    }

    const where = timeRange
      ? { createdAt: { gte: timeRange.start, lte: timeRange.end } }
      : {};

    const [totalRequests, successfulRequests, logs] = await Promise.all([
      db.aIRequestLog.count({ where }),
      db.aIRequestLog.count({ where: { ...where, success: true } }),
      db.aIRequestLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          modelUsed: true,
          responseTime: true,
          success: true,
          createdAt: true,
          feature: true,
          stage: true,
        },
      }),
    ]);

    const avgResponseTime =
      logs.length > 0
        ? Math.round(logs.reduce((sum, l) => sum + l.responseTime, 0) / logs.length)
        : 0;

    const modelCounts: Record<string, number> = {};
    for (const log of logs) {
      modelCounts[log.modelUsed] = (modelCounts[log.modelUsed] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      totalRequests,
      successRate: totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 100,
      avgResponseTime,
      modelUsage: modelCounts,
      recentLogs: logs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
