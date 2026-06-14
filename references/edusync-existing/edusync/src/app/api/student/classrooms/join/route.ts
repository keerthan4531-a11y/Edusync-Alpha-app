import { NextRequest, NextResponse } from 'next/server';
import { getClassroomsCollection, getUsersCollection } from '@/lib/db/collections';
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
      return NextResponse.json({ detail: 'Only students can join classrooms via code' }, { status: 403 });
    }

    // 2. Parse request
    const body = await request.json();
    const { class_code } = body;

    if (!class_code || class_code.trim() === '') {
      return NextResponse.json({ detail: 'Class code is required' }, { status: 400 });
    }

    // 3. Find classroom by code
    const classroomsCollection = await getClassroomsCollection();
    const classroom = await classroomsCollection.findOne({ 
      $or: [
        { course_code: class_code },
        { code: class_code }
      ]
    });

    if (!classroom) {
      return NextResponse.json({ detail: 'Classroom not found. Please check the code.' }, { status: 404 });
    }

    const classroomIdStr = classroom._id.toString();

    // 4. Check if already enrolled
    const usersCollection = await getUsersCollection();
    const student = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!student) {
      return NextResponse.json({ detail: 'Student not found' }, { status: 404 });
    }

    const isAlreadyEnrolled = 
      (Array.isArray(student.classrooms) && student.classrooms.includes(classroomIdStr)) ||
      (Array.isArray(classroom.students) && classroom.students.some((id: any) => id.toString() === userId));

    if (isAlreadyEnrolled) {
      return NextResponse.json({ detail: 'You are already enrolled in this classroom' }, { status: 400 });
    }

    // 5. Add student to classroom, and classroom to student
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { classrooms: classroomIdStr } as any }
    );

    // Some legacy docs use string array for students, some might use ObjectIds. We'll push the string.
    await classroomsCollection.updateOne(
      { _id: classroom._id },
      { $addToSet: { students: userId } as any }
    );

    return NextResponse.json({ detail: 'Successfully joined the classroom', classroom: { id: classroomIdStr, name: classroom.name } });

  } catch (error) {
    console.error('Error joining classroom:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
