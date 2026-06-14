import { NextRequest, NextResponse } from 'next/server';
import { getAssignmentsCollection, getClassroomsCollection, getSubmissionsCollection, getUsersCollection } from '@/lib/db/collections';
import { verifyToken } from '@/lib/auth/utils';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const { classroomId } = await params;

    if (!ObjectId.isValid(classroomId)) {
      return NextResponse.json({ detail: 'Invalid classroom ID' }, { status: 400 });
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
      return NextResponse.json({ detail: 'Only faculty can fetch submissions for grading' }, { status: 403 });
    }

    // 2. Verify faculty owns this classroom
    const classroomsCollection = await getClassroomsCollection();
    const classroom = await classroomsCollection.findOne({ _id: new ObjectId(classroomId) });

    if (!classroom) {
      return NextResponse.json({ detail: 'Classroom not found' }, { status: 404 });
    }

    if (classroom.faculty_id !== userId && payload.user_type !== 'admin') {
      return NextResponse.json({ detail: 'You are not the instructor for this classroom' }, { status: 403 });
    }

    // 3. Fetch assignments
    const assignmentsCollection = await getAssignmentsCollection();
    const assignments = await assignmentsCollection
      .find({ classroom_id: classroomId })
      .toArray();

    const assignmentIds = assignments.map(a => a._id.toString());

    // 4. Fetch submissions
    const submissionsCollection = await getSubmissionsCollection();
    const submissions = await submissionsCollection
      .find({ assignment_id: { $in: assignmentIds } })
      .toArray();

    // 5. Fetch user details for the students who submitted
    const usersCollection = await getUsersCollection();
    const studentIds = [...new Set(submissions.map(sub => sub.student_id))];
    const studentObjIds = studentIds.map(id => { try { return new ObjectId(id); } catch { return null; } }).filter(id => id !== null) as ObjectId[];
    
    const students = await usersCollection.find({ _id: { $in: studentObjIds } }).toArray();

    // 6. Enrich submissions with assignment name and student name
    const enrichedSubmissions = submissions.map(sub => {
      const assignment = assignments.find(a => a._id.toString() === sub.assignment_id);
      const student = students.find(s => s._id.toString() === sub.student_id);

      return {
        id: sub._id.toString(),
        assignment_id: sub.assignment_id,
        assignment_title: assignment?.title || 'Unknown Assignment',
        max_score: assignment?.max_score || 100,
        student_id: sub.student_id,
        student_name: student?.full_name || student?.email || 'Unknown Student',
        status: sub.status || 'submitted',
        score: sub.score || null,
        feedback: sub.feedback || null,
        submitted_at: sub.submitted_at || sub.created_at,
        submission_url: sub.file_url || sub.submission_url || null,
        content: sub.content || null
      };
    });

    return NextResponse.json({ submissions: enrichedSubmissions });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
