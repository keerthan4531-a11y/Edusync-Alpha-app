import { NextRequest, NextResponse } from 'next/server';
import { getAssignmentsCollection, getSubmissionsCollection } from '@/lib/db/collections';
import { verifyToken } from '@/lib/auth/utils';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
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

    if (payload.user_type !== 'student') {
      return NextResponse.json({ detail: 'Only students can submit assignments' }, { status: 403 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { assignment_id, submission_link, submission_text, notes } = body;

    if (!assignment_id || !ObjectId.isValid(assignment_id)) {
      return NextResponse.json({ detail: 'Invalid assignment ID' }, { status: 400 });
    }

    // 3. Verify assignment exists
    const assignmentsCollection = await getAssignmentsCollection();
    const assignment = await assignmentsCollection.findOne({ _id: new ObjectId(assignment_id) });

    if (!assignment) {
      return NextResponse.json({ detail: 'Assignment not found' }, { status: 404 });
    }

    // 4. Save submission
    const submissionsCollection = await getSubmissionsCollection();
    
    // Check if already submitted
    const existingSubmission = await submissionsCollection.findOne({
      assignment_id,
      student_id: userId
    });

    const submissionData = {
      assignment_id,
      student_id: userId,
      classroom_id: assignment.classroom_id,
      submission_link: submission_link || null,
      submission_text: submission_text || null,
      notes: notes || '',
      status: 'submitted',
      updated_at: new Date()
    };

    if (existingSubmission) {
      // Update existing
      await submissionsCollection.updateOne(
        { _id: existingSubmission._id },
        { $set: submissionData }
      );
      return NextResponse.json({ detail: 'Submission updated successfully' });
    } else {
      // Create new
      await submissionsCollection.insertOne({
        ...submissionData,
        created_at: new Date()
      });
      return NextResponse.json({ detail: 'Assignment submitted successfully' });
    }

  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
