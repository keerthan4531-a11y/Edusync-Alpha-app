import { NextRequest, NextResponse } from 'next/server';
import { getClassroomsCollection, getUsersCollection } from '@/lib/db/collections';
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

    // 2. Fetch classroom
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

    // 3. Fetch instructor and students details
    const usersCollection = await getUsersCollection();
    
    let teacher = null;
    if (classroom.faculty_id) {
      try {
        const faculty = await usersCollection.findOne({ _id: new ObjectId(classroom.faculty_id) });
        if (faculty) {
          teacher = {
            id: faculty._id.toString(),
            name: faculty.full_name || 'Instructor',
            email: faculty.email,
            profile_picture: faculty.profile_picture || null
          };
        }
      } catch (e) {
        console.error('Error fetching faculty', e);
      }
    }

    // Fallback if no faculty user is found but instructor_name exists
    if (!teacher && classroom.instructor_name) {
      teacher = {
        id: 'unknown',
        name: classroom.instructor_name,
        email: null,
        profile_picture: null
      };
    }

    // Fetch students
    const classmates = [];
    if (Array.isArray(classroom.students) && classroom.students.length > 0) {
      // Map valid ObjectIds
      const studentObjIds = classroom.students
        .map((id: string) => {
          try { return new ObjectId(id); } catch { return null; }
        })
        .filter((id: any) => id !== null) as ObjectId[];

      const studentsData = await usersCollection.find({ _id: { $in: studentObjIds } }).toArray();
      
      for (const student of studentsData) {
        classmates.push({
          id: student._id.toString(),
          name: student.full_name || student.email || 'Student',
          profile_picture: student.profile_picture || null,
          is_you: student._id.toString() === userId
        });
      }
    }

    return NextResponse.json({ 
      teacher,
      classmates: classmates.sort((a, b) => {
        // Sort alphabetically, but put "You" first
        if (a.is_you) return -1;
        if (b.is_you) return 1;
        return a.name.localeCompare(b.name);
      })
    });

  } catch (error) {
    console.error('Error fetching classroom people:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
