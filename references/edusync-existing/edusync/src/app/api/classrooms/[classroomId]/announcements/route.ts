import { NextRequest, NextResponse } from 'next/server';
import { getAnnouncementsCollection, getClassroomsCollection, getUsersCollection } from '@/lib/db/collections';
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

    // Check if user is a student in the class, or the instructor
    const isStudent = Array.isArray(classroom.students) && classroom.students.some((id: any) => id.toString() === userId);
    const isInstructor = classroom.faculty_id && classroom.faculty_id.toString() === userId;
    
    if (!isStudent && !isInstructor && payload.user_type !== 'admin') {
      return NextResponse.json({ detail: 'You do not have access to this classroom' }, { status: 403 });
    }

    // 3. Fetch announcements
    const announcementsCollection = await getAnnouncementsCollection();
    const usersCollection = await getUsersCollection();
    
    const announcements = await announcementsCollection
      .find({ classroom_id: classroomId })
      .sort({ created_at: -1 })
      .toArray();

    // Map and enrich with author info
    const formattedAnnouncements = await Promise.all(announcements.map(async (ann) => {
      // Try to get author name
      let authorName = 'Instructor';
      if (ann.author_id) {
        try {
           const author = await usersCollection.findOne({ _id: new ObjectId(ann.author_id) });
           if (author) authorName = author.full_name || 'Instructor';
        } catch (e) {
           // ignore bad ObjectId
        }
      }

      return {
        id: ann._id.toString(),
        author: authorName,
        content: ann.content,
        title: ann.title || '',
        date: ann.created_at,
      };
    }));

    return NextResponse.json({ announcements: formattedAnnouncements });

  } catch (error) {
    console.error('Error fetching announcements:', error);
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
      return NextResponse.json({ detail: 'Only faculty can post announcements' }, { status: 403 });
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

    // 3. Parse request and post announcement
    const body = await request.json();
    const { content, title } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ detail: 'Announcement content is required' }, { status: 400 });
    }

    const announcementsCollection = await getAnnouncementsCollection();
    
    const newAnnouncement = {
      classroom_id: classroomId,
      author_id: userId,
      title: title ? title.trim() : null,
      content: content.trim(),
      created_at: new Date(),
      updated_at: new Date()
    };

    await announcementsCollection.insertOne(newAnnouncement);

    return NextResponse.json({ detail: 'Announcement posted successfully' });

  } catch (error) {
    console.error('Error posting announcement:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const { classroomId } = await params;
    
    // Get announcement ID from query param
    const { searchParams } = new URL(request.url);
    const announcementId = searchParams.get('id');

    if (!ObjectId.isValid(classroomId) || !announcementId || !ObjectId.isValid(announcementId)) {
      return NextResponse.json({ detail: 'Invalid classroom or announcement ID' }, { status: 400 });
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
      return NextResponse.json({ detail: 'Only faculty can delete announcements' }, { status: 403 });
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

    // 3. Delete the announcement
    const announcementsCollection = await getAnnouncementsCollection();
    
    // Ensure the announcement belongs to this classroom before deleting
    const result = await announcementsCollection.deleteOne({
      _id: new ObjectId(announcementId),
      classroom_id: classroomId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ detail: 'Announcement not found or could not be deleted' }, { status: 404 });
    }

    return NextResponse.json({ detail: 'Announcement deleted successfully' });

  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
