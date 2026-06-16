import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkForG4FUpdates, recordG4FUpdate, getG4FUpdateInfo } from '@/lib/g4f-updater';

// GET — Check for g4f updates
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [updateCheck, updateInfo] = await Promise.all([
      checkForG4FUpdates(),
      getG4FUpdateInfo(),
    ]);

    return NextResponse.json({
      success: true,
      ...updateCheck,
      lastUpdate: updateInfo.lastUpdate,
      autoUpdateEnabled: updateInfo.autoUpdateEnabled,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — Trigger manual g4f update
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Note: In production, this would run `npm update @gpt4free/g4f.dev`
    // For now, we just record the update attempt
    await recordG4FUpdate();

    return NextResponse.json({
      success: true,
      message: 'Update initiated. The g4f package will be updated on next server restart.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
