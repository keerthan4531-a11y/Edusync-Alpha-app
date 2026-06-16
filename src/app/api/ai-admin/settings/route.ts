import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET — Get AI admin settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let settings = await db.aIAdminSettings.findFirst();

    if (!settings) {
      settings = await db.aIAdminSettings.create({
        data: {
          g4fBaseUrl: 'https://g4f.space',
          autoUpdateEnabled: true,
          proxyEnabled: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings,
      proxyStatus: { total: 100, alive: 100, dead: 0, lastRefresh: Date.now() },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — Update AI admin settings
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { g4fBaseUrl, autoUpdateEnabled, proxyEnabled, customProxies } = body;

    let settings = await db.aIAdminSettings.findFirst();

    if (settings) {
      settings = await db.aIAdminSettings.update({
        where: { id: settings.id },
        data: {
          ...(g4fBaseUrl !== undefined && { g4fBaseUrl }),
          ...(autoUpdateEnabled !== undefined && { autoUpdateEnabled }),
          ...(proxyEnabled !== undefined && { proxyEnabled }),
          ...(customProxies !== undefined && { customProxies: JSON.stringify(customProxies) }),
        },
      });
    } else {
      settings = await db.aIAdminSettings.create({
        data: {
          g4fBaseUrl: g4fBaseUrl || 'https://g4f.space',
          autoUpdateEnabled: autoUpdateEnabled ?? true,
          proxyEnabled: proxyEnabled ?? true,
          customProxies: customProxies ? JSON.stringify(customProxies) : null,
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
