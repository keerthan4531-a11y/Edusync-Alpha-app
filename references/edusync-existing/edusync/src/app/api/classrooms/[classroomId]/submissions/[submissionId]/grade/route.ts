import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionsCollection, getClassroomsCollection } from '@/lib/db/collections';
import { verifyToken } from '@/lib/auth/utils';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classroomId: string, submissionId: string }> }
) {
  try {
    const { classroomId, submissionId } = await params;

    if (!ObjectId.isValid(classroomId) || !ObjectId.isValid(submissionId)) {
      return NextResponse.json({ detail: 'Invalid ID' }, { status: 400 });
    }

    // 1. Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ detail: 'Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    
    if (!payload || (!payload.sub && !payload.user_id)) {
      return NextResponse.json({ detail: 'Invalid token' }, { status: 401 });
    }

    const userId = (payload.user_id || payload.sub) as string;

    if (payload.user_type !== 'faculty' && payload.user_type !== 'admin') {
      return NextResponse.json({ detail: 'Only faculty can grade submissions' }, { status: 403 });
    }

    // 2. Verify faculty owns this classroom
    const classroomsCollection = await getClassroomsCollection();
    const classroom = await classroomsCollection.findOne({ _id: new ObjectId(classroomId) });

    if (!classroom || (classroom.faculty_id !== userId && payload.user_type !== 'admin')) {
      return NextResponse.json({ detail: 'You are not the instructor for this classroom' }, { status: 403 });
    }

    // 3. Parse grading request
    const body = await request.json();
    const { score, feedback } = body;

    if (score === undefined || score === null) {
      return NextResponse.json({ detail: 'Score is required' }, { status: 400 });
    }

    // 4. Update the submission
    const submissionsCollection = await getSubmissionsCollection();
    
    const updateResult = await submissionsCollection.updateOne(
      { _id: new ObjectId(submissionId) },
      { 
        $set: { 
          status: 'graded',
          score: Number(score),
          feedback: feedback || '',
          graded_at: new Date(),
          graded_by: userId
        } 
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ detail: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ detail: 'Submission graded successfully' });

  } catch (error) {
    console.error('Error grading submission:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
