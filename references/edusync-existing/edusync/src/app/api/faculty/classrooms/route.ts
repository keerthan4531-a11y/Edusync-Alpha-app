import { NextRequest, NextResponse } from 'next/server';
import { getClassroomsCollection } from '@/lib/db/collections';
import { verifyToken } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    // Verify auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ detail: 'Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    
    if (!payload || (!payload.sub && !payload.user_id)) {
      return NextResponse.json({ detail: 'Invalid token' }, { status: 401 });
    }

    if (payload.user_type !== 'faculty' && payload.user_type !== 'admin') {
      return NextResponse.json({ detail: 'Only faculty can view owned classrooms' }, { status: 403 });
    }

    const userId = (payload.user_id || payload.sub) as string;

    const classroomsCollection = await getClassroomsCollection();
    const classrooms = await classroomsCollection.find({ faculty_id: userId }).toArray();

    // Format for frontend
    const formattedClassrooms = classrooms.map(cls => ({
      id: cls._id.toString(),
      name: cls.name || cls.course_name || 'Unnamed Class',
      code: cls.code || cls.course_code || '',
      description: cls.description || '',
      studentsCount: Array.isArray(cls.students) ? cls.students.length : 0
    }));

    return NextResponse.json({ classrooms: formattedClassrooms });

  } catch (error) {
    console.error('Error fetching faculty classrooms:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

// Generate a random 6-character alphanumeric code
function generateClassCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ detail: 'Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    
    if (!payload || (!payload.sub && !payload.user_id)) {
      return NextResponse.json({ detail: 'Invalid token' }, { status: 401 });
    }

    if (payload.user_type !== 'faculty' && payload.user_type !== 'admin') {
      return NextResponse.json({ detail: 'Only faculty can create classrooms' }, { status: 403 });
    }

    const userId = (payload.user_id || payload.sub) as string;

    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ detail: 'Classroom name is required' }, { status: 400 });
    }

    const classroomsCollection = await getClassroomsCollection();
    
    // Generate unique code
    let classCode = '';
    let isUnique = false;
    while (!isUnique) {
      classCode = generateClassCode();
      const existing = await classroomsCollection.findOne({ code: classCode });
      if (!existing) isUnique = true;
    }

    const newClassroom = {
      name: name.trim(),
      course_name: name.trim(),
      code: classCode,
      course_code: classCode,
      description: description ? description.trim() : '',
      faculty_id: userId,
      instructor_name: payload.full_name || 'Instructor',
      students: [],
      created_at: new Date()
    };

    const result = await classroomsCollection.insertOne(newClassroom);

    return NextResponse.json({ 
      detail: 'Classroom created successfully',
      classroom: {
        id: result.insertedId.toString(),
        name: newClassroom.name,
        code: newClassroom.code,
        description: newClassroom.description,
        studentsCount: 0
      }
    });

  } catch (error) {
    console.error('Error creating classroom:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

