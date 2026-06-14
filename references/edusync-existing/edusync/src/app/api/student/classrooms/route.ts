import { NextRequest, NextResponse } from 'next/server';
import { getClassroomsCollection, getUsersCollection } from '@/lib/db/collections';
import { verifyToken } from '@/lib/auth/utils';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
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

    // 2. Fetch the student to get their classrooms
    const usersCollection = await getUsersCollection();
    const student = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!student) {
      return NextResponse.json({ detail: 'Student not found' }, { status: 404 });
    }

    if (student.user_type !== 'student') {
      return NextResponse.json({ detail: 'Only students can access this route' }, { status: 403 });
    }

    // 3. Fetch classrooms the student is enrolled in
    const classroomsCollection = await getClassroomsCollection();
    
    // Find classrooms where the student ID is in the students array
    // OR classrooms whose ID is in the student's classrooms array
    const query = {
      $or: [
        { students: userId },
        { students: new ObjectId(userId) },
        { _id: { $in: (student.classrooms || []).map((id: string) => {
            try { return new ObjectId(id); } catch { return id; }
        })} }
      ]
    };

    const classrooms = await classroomsCollection.find(query).sort({ created_at: -1 }).toArray();

    // Map to response format
    const formattedClassrooms = classrooms.map(cls => ({
      id: cls._id.toString(),
      name: cls.name,
      code: cls.course_code || cls.code || 'N/A',
      description: cls.description || '',
      instructor: cls.instructor_name || 'Instructor',
      faculty_id: cls.faculty_id ? cls.faculty_id.toString() : null,
      students: Array.isArray(cls.students) ? cls.students.length : 0,
      department: cls.department,
      created_at: cls.created_at
    }));

    return NextResponse.json({ classrooms: formattedClassrooms });

  } catch (error) {
    console.error('Error fetching student classrooms:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
