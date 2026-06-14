import { NextRequest, NextResponse } from 'next/server';
import { getAssignmentsCollection, getClassroomsCollection, getSubmissionsCollection } from '@/lib/db/collections';
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

    // 2. Verify user has access to this classroom
    const classroomsCollection = await getClassroomsCollection();
    const classroom = await classroomsCollection.findOne({ _id: new ObjectId(classroomId) });

    if (!classroom) {
      return NextResponse.json({ detail: 'Classroom not found' }, { status: 404 });
    }

    const isStudent = Array.isArray(classroom.students) && classroom.students.some((id: any) => id.toString() === userId);
    const isInstructor = classroom.faculty_id && classroom.faculty_id.toString() === userId;
    
    if (!isStudent && !isInstructor && payload.user_type !== 'admin') {
      return NextResponse.json({ detail: 'You do not have access to this classroom' }, { status: 403 });
    }

    // 3. Fetch assignments
    const assignmentsCollection = await getAssignmentsCollection();
    const assignments = await assignmentsCollection
      .find({ classroom_id: classroomId })
      .sort({ created_at: -1 })
      .toArray();

    // 4. Fetch student's submissions to know the status
    let submissions: any[] = [];
    if (isStudent) {
      const submissionsCollection = await getSubmissionsCollection();
      const assignmentIds = assignments.map(a => a._id.toString());
      submissions = await submissionsCollection
        .find({ 
          assignment_id: { $in: assignmentIds },
          student_id: userId
        })
        .toArray();
    }

    // Map and enrich
    const formattedAssignments = assignments.map((assn) => {
      // Find submission for this assignment
      const submission = submissions.find(sub => sub.assignment_id === assn._id.toString());
      
      let status = 'pending';
      let score = null;
      let submittedAt = null;

      if (submission) {
        status = submission.status || 'submitted';
        score = submission.score;
        submittedAt = submission.created_at || submission.submitted_at;
      } else if (assn.due_date && new Date(assn.due_date) < new Date()) {
        status = 'missing';
      }

      return {
        id: assn._id.toString(),
        title: assn.title || 'Untitled Assignment',
        description: assn.description || assn.instructions || '',
        due_date: assn.due_date || null,
        max_score: assn.max_score || assn.points || 100,
        submission_type: assn.submission_type || 'file',
        created_at: assn.created_at,
        status, // pending, submitted, missing, graded
        score,
        submitted_at: submittedAt
      };
    });

    return NextResponse.json({ assignments: formattedAssignments });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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
      return NextResponse.json({ detail: 'Only faculty can post assignments' }, { status: 403 });
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

    // 3. Parse request and post assignment
    const body = await request.json();
    const { title, description, due_date, max_score } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json({ detail: 'Assignment title is required' }, { status: 400 });
    }

    const assignmentsCollection = await getAssignmentsCollection();
    
    const newAssignment = {
      classroom_id: classroomId,
      author_id: userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      due_date: due_date ? new Date(due_date) : null,
      max_score: max_score ? parseInt(max_score) : 100,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await assignmentsCollection.insertOne(newAssignment);

    return NextResponse.json({ detail: 'Assignment created successfully', assignment_id: result.insertedId });

  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

